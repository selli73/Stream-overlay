import { useContext, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../../../main";
import axios from "axios";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

export const SessionSection = observer(() => {

    const { sessionStore } = useContext(Context);
    const [error, setError] = useState('');
    const [sessionLoading, setSessionLoading] = useState(false);
    const { ref, visible } = useRevealOnScroll<HTMLElement>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const isSessionActive = sessionStore.sessionStatus === 'active';

    useEffect(() => {
        sessionStore.getStatus().catch((e) => console.log(e));
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isSessionActive) video.play().catch(() => {});
        else video.pause();
    }, [isSessionActive]);

    const handleToggleSession = async () => {
        setError('');
        setSessionLoading(true);
        try {
            if (isSessionActive) {
                await sessionStore.end();
            } else {
                await sessionStore.start();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data.message || 'Не удалось запустить сессию');
            } else {
                setError('Произошла неизвестная ошибка');
            }
        } finally {
            setSessionLoading(false);
        }
    };

    return (
        <section ref={ref} className={`dashboard-session-section reveal ${visible ? 'reveal--in' : ''}`}>
            <div className={`session-media ${isSessionActive ? '' : 'session-media--idle'}`}>
                <video
                    ref={videoRef}
                    src="/media/session-preview.mp4"
                    muted
                    loop
                    playsInline
                    autoPlay
                />
            </div>

            <div className="session-body">
                <div className="session-status-row">
                    <span className={`session-badge ${isSessionActive ? 'session-badge--live' : ''}`}>
                        {isSessionActive ? 'В эфире' : 'Не в эфире'}
                    </span>
                    <button
                        className={`session-btn ${isSessionActive ? 'session-btn--end' : 'session-btn--start'}`}
                        onClick={handleToggleSession}
                        disabled={sessionLoading}
                    >
                        {sessionLoading
                            ? 'Подождите...'
                            : isSessionActive
                                ? 'Завершить сессию'
                                : 'Начать сессию'}
                    </button>
                </div>
                {error && <p className="session-error">{error}</p>}
            </div>
        </section>
    );
});

