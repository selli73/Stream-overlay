import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import type { ITrack } from "../../typings";
import { Context } from "../../main";
import './TrackHistory.css';


export const TrackHistory = () => {
    
    const { streamerId } = useParams();
    const { trackHistoryStore } = useContext(Context);

    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!streamerId) return;

        const fetchHistory = async () => {
            try {
                const data = await trackHistoryStore.getStreamTracks(streamerId);
                setTracks(data);
            } catch (error) {
                setError('Не удалось загрузить историю треков');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [streamerId]);


    if (loading) {
        return <div className="history-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="history-error">{error}</div>;
    }

    if (tracks.length === 0) {
        return <div className="history-empty">История пуста</div>;
    }
    
    
    return (
        <div className="history">
            <h1 className="history-title">История треков</h1>
            <div className="history-list">
                {tracks.map(track => (
                    <a href={`https://open.spotify.com/track/${track.spotifyTrackId}`} target="_blank" rel="noopener noreferrer" className="history-item" key={track.id} >
                        <img src={track.image} alt={track.trackTitle} className="history-cover" />
                        <div className="history-info">
                            <p className="history-track-name">{track.trackTitle}</p>
                            <p className="history-artist">
                                {track.artists.map(a => a.name).join(', ')}
                            </p>
                        </div>
                        <span className="history-time">
                            {new Date(track.timeAdded).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    )
}