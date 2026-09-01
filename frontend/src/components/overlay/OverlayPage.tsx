import { useEffect } from "react"
import SocketService from "../../service/Socket"
import { useParams } from "react-router-dom";

export const OverlayPage = () => {
    const { streamerId } = useParams();
    useEffect(() => {
        if (!streamerId) return;
        
        SocketService.createConnection(streamerId);


        return () => { SocketService.disconnect(); };
    }, [streamerId])
    
    return (
        <div>
            <h2>Overlay</h2>
        </div>
    )
}