import { useContext, useEffect, useState } from "react";
import type { ITrack, IUser } from "../../../typings";
import { Context } from "../../../main";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

const PREVIEW_LIMIT = 5;

export const HistorySection = () => {

    const { authStore, trackHistoryStore } = useContext(Context);
    const [user, setUser] = useState<IUser>();
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [historyCopied, setHistoryCopied] = useState(false);
    const { ref, visible } = useRevealOnScroll<HTMLElement>();

    const historyUrl = user
        ? `${window.location.origin}/history/${user.spotifyUserId}`
        : '';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authStore.getProfile();
                setUser(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchTracks = async () => {
            try {
                const data = await trackHistoryStore.getStreamTracks(user.spotifyUserId, 1, PREVIEW_LIMIT);
                setTracks(data.tracks);
            } catch (error) {
                console.log(error);
            }
        };

        fetchTracks();
    }, [user]);

    const handleCopyHistory = async () => {
        await navigator.clipboard.writeText(historyUrl);
        setHistoryCopied(true);
        setTimeout(() => setHistoryCopied(false), 2000);
    };

    return (
        <section ref={ref} className={`dashboard-overlay-section reveal ${visible ? 'reveal--in' : ''}`}>
            <h2>История треков</h2>
            <p className="section-desc">
                Последние треки — полная история по ссылке ниже
            </p>

            {tracks.length > 0 ? (
                <div className="preview-list">
                    {tracks.map(track => (
                        <div className="preview-item" key={track.id}>
                            <img
                                src={track.image}
                                alt=""
                                className="preview-cover"
                                loading="lazy"
                            />
                            <div className="preview-info">
                                <span className="preview-title">{track.trackTitle}</span>
                                <span className="preview-artist">
                                    {track.artists.map(a => a.name).join(', ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="preview-empty">Треков пока нет — они появятся здесь после первого стрима</p>
            )}

            <div className="overlay-url-row">
                <code className="overlay-url">{historyUrl}</code>
                <button
                    className={`copy-btn ${historyCopied ? 'copy-btn--copied' : ''}`}
                    onClick={handleCopyHistory}
                >
                    {historyCopied ? 'Скопировано' : 'Копировать'}
                </button>
            </div>
        </section>
    );
};