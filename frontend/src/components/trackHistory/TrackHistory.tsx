import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import type { ITracks } from "../../typings";
import { Context } from "../../main";
import './TrackHistory.css';

const LIMIT = 20;

export const TrackHistory = () => {

    const { streamerId } = useParams();
    const { trackHistoryStore } = useContext(Context);

    const [tracks, setTracks] = useState<ITracks>();
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const hasMore = tracks ? page < tracks.totalPages : false;

    useEffect(() => {
        if (!streamerId) return;

        const fetchHistory = async () => {
            try {
                const data = await trackHistoryStore.getStreamTracks(streamerId, 1, LIMIT);
                setTracks(data);
                setPage(1);
            } catch (error) {
                setError('Не удалось загрузить историю треков');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [streamerId]);

    const handleLoadMore = async () => {
        if (!streamerId || loadingMore) return;

        setLoadingMore(true);
        setError('');
        const nextPage = page + 1;

        try {
            const data = await trackHistoryStore.getStreamTracks(streamerId, nextPage, LIMIT);
            setTracks(prev => prev
                ? { ...data, tracks: [...prev.tracks, ...data.tracks] }
                : data
            );
            setPage(nextPage);
        } catch (error) {
            setError('Не удалось загрузить следующие треки');
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return <div className="history-loading">Загрузка...</div>;
    }

    if (error && !tracks) {
        return <div className="history-error">{error}</div>;
    }

    if (!tracks || tracks.tracks.length === 0) {
        return <div className="history-empty">История пуста</div>;
    }

    return (
        <div className="history">
            <h1 className="history-title">История треков</h1>
            <div className="history-list">
                {tracks.tracks.map(track => (
                    <a
                        href={`https://open.spotify.com/track/${track.spotifyTrackId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="history-item"
                        key={track.id}
                    >
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

            {error && <p className="history-load-error">{error}</p>}

            {hasMore && (
                <button
                    className="history-load-more"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                >
                    {loadingMore ? 'Загружаем...' : 'Показать ещё'}
                </button>
            )}
        </div>
    );
};