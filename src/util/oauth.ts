import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { post } from "request";
import * as config from "../config/settings.json";

const { ShortCodeExpireError, OAuthClient } = require('@mixer/shortcode-oauth');

var accessToken = '';

function checkAuthStatus(callback: (error: Error, tokens: any) => void) {
    if (!existsSync("./data")) {
        mkdirSync("./data");
    }

    if (!existsSync("./data/userTokens.json")) {
        createAuthCode(callback);
    } else {
        console.log("Found data...attempting to refresh...");

        let rawData = readFileSync('data/userTokens.json');
        let tokens = JSON.parse(rawData.toString());

        post('https://mixer.com/api/v1/oauth/token', {
            body: {
                'grant_type': 'refresh_token',
                'refresh_token': tokens.refreshToken,
                'client_id': config.CLIENT_ID
            },
            json: true
        }, (error, resposne, body) => {
            if (error) {
                console.error(error);
                return callback(new Error('Refresh request failed'), null);
            } else {
                console.log("Properly refreshed tokens...");

                accessToken = body.access_token;

                let tokens = {
                    accessToken: body.access_token,
                    refreshToken: body.refresh_token,
                    expiresAt: body.expires_in
                };

                writeFileSync('./data/userTokens.json', JSON.stringify(tokens));
                return callback(null, body);
            }
        });
    }
}


function createAuthCode(callback) {
    const client = new OAuthClient({
        clientId: config.CLIENT_ID,
        scopes: ['channel:update:self', 'channel:details:self'],
    });

    const attempt = () =>
        client
            .getCode()
            .then(code => {
                console.log(`Go to https://mixer.com/go?code=${code.code}`);
                return code.waitForAccept();
            })
            .catch(err => {
                if (err instanceof ShortCodeExpireError) {
                    return attempt(); // loop!
                }

                throw err;
            });

    attempt().then(tokens => {
        console.log("Got tokens...writing to file");
        accessToken = tokens.data.accessToken;
        writeFileSync('./data/userTokens.json', JSON.stringify(tokens.data));
        callback(null, tokens);
    });
}


export { checkAuthStatus, accessToken };