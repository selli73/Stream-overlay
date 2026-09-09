import { useEffect, useState } from "react"
import SocketService from "../../service/Socket"
import { useParams } from "react-router-dom";
import type { IOrderedTrack, IPlaybackData } from "../../typings";
import './OverlayPage.css';

export const OverlayPage = () => {
    const { streamerId } = useParams();
    const [track, setTrack] = useState<IPlaybackData | null>(null);
    const [orderedTrack, setOrderedTrack] = useState<IOrderedTrack | null>(null);

    useEffect(() => {
        if (!streamerId) return;
        
        SocketService.createConnection(streamerId, setTrack, handleTrackOrdered);
        
        return () => { SocketService.disconnect(); };
    }, [streamerId])
    
    const handleTrackOrdered = (data: IOrderedTrack) => {
        setOrderedTrack(data);
        setTimeout(() => setOrderedTrack(null), 8000);
    }

    if (!track) {
        return <div className="overlay overlay--empty" />;
    }

    return (
        <>
            <div className='overlay' key={track.trackTitle}>
                <img src={track.image} alt={track.trackTitle} className='overlay-cover'/>
                
                <div className="overlay-info">
                    <p className="overlay-track-name">{track.trackTitle}</p>
                    <p className="overlay-artist">
                        {track.artists.join(', ')}
                    </p>
                </div>            
            </div>
            {
                orderedTrack && (
                    <div className="ordered-toast" key={`${orderedTrack.trackTitle}-${orderedTrack.subscriberName}`}>
                        <div className="ordered-toast-info">
                            <p className="ordered-toast-header">
                                {orderedTrack.subscriberName} заказал(а) трек за {orderedTrack.amount}₽
                            </p>
                            <p className="ordered-toast-track">{orderedTrack.trackTitle}</p>
                        </div>
                    </div>
                )
            }
        </>
    )
}