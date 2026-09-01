import { io, type Socket } from "socket.io-client";
import { API_URL } from "../http";

export default class SocketService {
    static socket: Socket | null = null;

    static createConnection(streamerId: string) {
        
        this.socket = io(`${API_URL}/overlay`, {
            retries: 3
        });  

        this.socket.on('connect', () => {
            this.socket?.emit('join_stream', streamerId);
        });


        this.socket.on('track_changed', (data) => {
            console.log(data);
        })
    }

    static disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}