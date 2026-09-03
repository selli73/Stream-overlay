import { useContext, useEffect, useState } from "react"
import { Context } from "../../main"
import './DashboardPage.css';
import axios from "axios";
import { observer } from "mobx-react-lite";

interface IUser {
    spotifyUserId: string;
    accountName: string;
    createdAt: Date;
}

export const DashboardPage = observer(() => {
    const { authStore, sessionStore } = useContext(Context);
    const [user, setUser] = useState<IUser>();
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [sessionLoading, setSessionLoading] = useState(false);

    const overlayUrl = user 
        ? `${window.location.origin}/overlay/${user.spotifyUserId}` 
        : '';

    const isSessionActive = sessionStore.sessionStatus === 'active';

    useEffect(() => {
        const fetchProfile = async  () => {
            try {
                console.log('1');
                const data = await authStore.getProfile();
                setUser(data);
            } catch(error) {
                console.log(error);
            }
        }

        const fetchSessionStatus = async () => {
            try {
                await sessionStore.getStatus();
            } catch(error) {
                console.log(error);
            }
        }

        fetchProfile();
        fetchSessionStatus();
    }, []);
    
    const handleCopy = async () => {
        await navigator.clipboard.writeText(overlayUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggleSession = async () => {
        setError('');
        setSessionLoading(true);
        try {
            if (isSessionActive) {
                await sessionStore.end();
            } else {
                await sessionStore.start();
            }

        } catch(error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data.message || 'Не удалось запустить сессию');
            } else {
                setError('Произошла неизвестная ошибка');
            }
        } finally {
            setSessionLoading(false);
        }
    };

    if (!user) {
        return <div className="dashboard-loading">Загрузка...</div>;
    }
    
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="dashboard-greeting">
                    <h1>Привет, {user.accountName}</h1>
                    <p className="dashboard-subtitle">
                        Твой оверлей для Spotify готов к использованию
                    </p>
                </div>
            </header>
 
            <section className="dashboard-session-section">
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
            </section>
 
            <section className="dashboard-overlay-section">
                <h2>Ссылка на оверлей</h2>
                <p className="section-desc">
                    Скопируй и вставь в OBS как Browser Source
                </p>
                <div className="overlay-url-row">
                    <code className="overlay-url">{overlayUrl}</code>
                    <button 
                        className={`copy-btn ${copied ? 'copy-btn--copied' : ''}`} 
                        onClick={handleCopy}
                    >
                        {copied ? 'Скопировано' : 'Копировать'}
                    </button>
                </div>
            </section>
 
            <section className="dashboard-setup-section">
                <h2>Как подключить</h2>
                <div className="setup-steps">
                    <div className="setup-step">
                        <span className="step-number">1</span>
                        <div>
                            <p className="step-title">Скопируй ссылку выше</p>
                            <p className="step-desc">Нажми кнопку «Копировать»</p>
                        </div>
                    </div>
                    <div className="setup-step">
                        <span className="step-number">2</span>
                        <div>
                            <p className="step-title">Открой OBS</p>
                            <p className="step-desc">Добавь источник → Browser Source</p>
                        </div>
                    </div>
                    <div className="setup-step">
                        <span className="step-number">3</span>
                        <div>
                            <p className="step-title">Вставь ссылку</p>
                            <p className="step-desc">Ширина 400, высота 120, фон прозрачный</p>
                        </div>
                    </div>
                    <div className="setup-step">
                        <span className="step-number">4</span>
                        <div>
                            <p className="step-title">Включи музыку</p>
                            <p className="step-desc">Запусти трек в Spotify — оверлей обновится сам</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
})