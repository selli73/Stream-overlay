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
    const [donationAlertsConnected, setDonAlertsConnected] = useState<boolean>();
    const [copied, setCopied] = useState(false);
    const [historyCopied, setHistoryCopied] = useState(false);
    const [error, setError] = useState('');
    const [sessionLoading, setSessionLoading] = useState(false);

    const overlayUrl = user 
        ? `${window.location.origin}/overlay/${user.spotifyUserId}` 
        : '';

    const historyUrl = user
        ? `${window.location.origin}/history/${user.spotifyUserId}`
        : '';

    const isSessionActive = sessionStore.sessionStatus === 'active';
    useEffect(() => {
        const fetchProfile = async  () => {
            try {
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

        const checkingAuthDonAlerts = async () => {
            try {
                const data = await authStore.checkingAuthDonAlerts();
                setDonAlertsConnected(data.donationAlertsConnected);
            } catch(error) {
                console.log(error);
            }
        }

        fetchProfile();
        fetchSessionStatus();
        checkingAuthDonAlerts();
    }, []);
    
    const handleCopy = async () => {
        await navigator.clipboard.writeText(overlayUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyHistory = async () => {
        await navigator.clipboard.writeText(historyUrl);
        setHistoryCopied(true);
        setTimeout(() => setHistoryCopied(false), 2000);
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

    const handleConnectDonationAlerts = () => {        
        window.location.href = `${import.meta.env.VITE_API_BACKEND_URL}/donation-alerts/login`;
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

            <section className="dashboard-donation-section">
                <div className="session-status-row">
                    <div>
                        <h2>Донаты</h2>
                        <p className="section-desc" style={{ margin: 0 }}>
                            {donationAlertsConnected
                                ? 'DonationAlerts подключён — заказ треков через донаты работает'
                                : 'Подключи DonationAlerts, чтобы зрители могли заказывать треки'}
                        </p>
                    </div>
                    {donationAlertsConnected ? (
                        <span className="session-badge session-badge--live">Подключено</span>
                    ) : (
                        <button className="donation-connect-btn" onClick={handleConnectDonationAlerts}>
                            Подключить DonationAlerts
                        </button>
                    )}
                </div>
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

            <section className="dashboard-overlay-section">
                <h2>Ссылка на историю треков</h2>
                <p className="section-desc">
                    Скопируй и поставь под стримом (например, в описании или через команду !history)
                </p>
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