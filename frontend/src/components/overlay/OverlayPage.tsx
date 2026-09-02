import { useEffect, useState } from "react"
import SocketService from "../../service/Socket"
import { useParams } from "react-router-dom";
import type { IPlaybackData } from "../../typings";
import './OverlayPage.css';

export const OverlayPage = () => {
    const { streamerId } = useParams();
    const [track, setTrack] = useState<IPlaybackData | null>(null);
    useEffect(() => {
        if (!streamerId) return;
        
        SocketService.createConnection(streamerId, setTrack);
        
        return () => { SocketService.disconnect(); };
    }, [streamerId])
    
    if (!track) {
        return <div className="overlay overlay--empty" />;
    }

    return (
        <div className='overlay' key={track.trackTitle}>
            <img src={track.images.filter((value, index) => index === 1).toString()} alt={track.trackTitle} className='overlay-cover'/>
            
            <div className="overlay-info">
                <p className="overlay-track-name">{track.trackTitle}</p>
                <p className="overlay-artist">
                    {track.artists.join(', ')}
                </p>
            </div>
        </div>
    )
}