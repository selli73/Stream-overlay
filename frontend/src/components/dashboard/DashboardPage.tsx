import { useContext, useEffect, useState } from "react"
import { Context } from "../../main"
import './DashboardPage.css';

interface IUser {
    spotifyUserId: string;
    accountName: string;
    createdAt: Date;
}

export const DashboardPage = () => {
    const { authStore } = useContext(Context);
    const [user, setUser] = useState<IUser>();
    const [copied, setCopied] = useState(false);

    const overlayUrl = user 
        ? `${window.location.origin}/overlay/${user.spotifyUserId}` 
        : '';

    useEffect(() => {
        const fetchProfile = async  () => {
            try {
                const data = await authStore.getProfile();
                setUser(data);
            } catch(error) {
                console.log(error);
            }
        }

        fetchProfile();
    }, []);
    
    const handleCopy = async () => {
        await navigator.clipboard.writeText(overlayUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
    )
}