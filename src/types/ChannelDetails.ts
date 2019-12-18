export interface ChannelDetails {
    id: number;
    token: string;
    userId: number;
    costreamId: number;
    featured: boolean;
    featureLevel: number;
    ftl: number;
    hasTranscodes: boolean;
    hasVod: boolean;
    hosteeId: number;
    interactive: boolean;
    interactiveGameId: number;
    maxConcurrentSubscribers: number;
    numFollowers: number;
    numSubscribers: number;
    online: boolean;
    partnered: boolean;
    viewersCurrent: number;
    audience: string;
    typeId: number;
    viewersTotal: number;
}