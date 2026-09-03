import api from "../http";

export class TrackHistorySession {
    static getStreamTracks(spotifyUserId: string) {
        return api.get(`/api/history/${spotifyUserId}`);
    }
}