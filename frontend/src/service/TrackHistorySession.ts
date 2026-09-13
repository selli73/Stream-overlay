import api from "../http";

export class TrackHistorySession {
    static getStreamTracks(spotifyUserId: string, page: number, limit: number) {
        return api.get(`/api/history/${spotifyUserId}?page=${page}&limit=${limit}`);
    }
}