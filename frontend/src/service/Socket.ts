import { io, type Socket } from "socket.io-client";
import { API_URL } from "../http";
import type { IOrderedTrack, IPlaybackData } from "../typings";

export default class SocketService {
    static socket: Socket | null = null;

    static createConnection(streamerId: string, onTrackChanged: (data: IPlaybackData) => void, onTrackOrdered: (data: IOrderedTrack) => void) {
        
        this.socket = io(`${API_URL}/overlay`, {
            retries: 3
        });  

        this.socket.on('connect', () => {
            this.socket?.emit('join_stream', streamerId);
        });


        this.socket.on('track_changed', (data: IPlaybackData) => {
            onTrackChanged(data);
        });

        this.socket.on('track_ordered', (data: IOrderedTrack) => {
            console.log(data);
            onTrackOrdered(data);
        });
    }

    static disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}