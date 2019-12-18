import { checkAuthStatus, accessToken } from './util/oauth';
import { get, patch } from "request";

import * as config from "./config/settings.json";
import { ChannelDetails } from './types/ChannelDetails';

var channelID = -1;

var storedValues: ChannelDetails;

checkAuthStatus((error, tokens) => {
    if (error) {
        console.error("Error: ", error);
        process.exit(0);
    }

    get({
        url: 'https://mixer.com/api/v1/users/current',
        headers: {
            'Authorization': 'Bearer ' + tokens.access_token
        }
    }, (error, response, body) => {
        if (error) {
            throw error;
        }

        let userData = JSON.parse(body);
        channelID = userData.channel.id;

        // It's a 1000 every 300 seconds on channel-read so literally it doesn't matter
        // It's a 250 every 300 seconds rate limit on channel-write so lets just hammer the shit out of mixer
        setInterval(() => {
            updateChannel();
        }, 1000 * 2);
    });
});

function updateChannel() {
    get({
        url: `https://mixer.com/api/v1/channels/${channelID}/details`,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }, (error, resposne, body) => {
        if (error) {
            throw error;
        }

        let channelData = JSON.parse(body);
        storedValues = channelData;

        //Fire the cannon chief
        updateTitle();
    });
}

function updateTitle() {
    //Fires an actual cannon btw
    patch({
        url: `https://mixer.com/api/v1/channels/${channelID}`,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({
            name: buildMessage(config.TITLE)
        })
    }, (error, response, body) => {
        if (error) {
            throw error;
        }
    });
}

/**
 * Builds a final string that replaces all the variables set in config
 *
 * @param {string} title The title found in config
 * @returns {string}
 */

//TODO: title doesn't actually need to be a parameter here since we can just pull from config
function buildMessage(title: string): string {
    let finalMsg: string = title;

    //TODO: Add all these values that I am actually too lazy to do

    finalMsg = title
        .replace("%CURRENT_SUBS%", storedValues.numSubscribers.toString())
        .replace("%GAME_ID% ", storedValues.typeId.toString());

    console.log(finalMsg);

    return finalMsg;
}