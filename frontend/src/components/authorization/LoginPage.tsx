import { API_URL } from "../../http";
import './LoginPage.css';

export const LoginPage = () => {
        
    const handleLogin = () => {
        window.location.href = `${API_URL}/auth/login`;
    }

    return (
        <div className='login-page'>
            <div className='login-card'>
                <div className='login-badge'>
                    Now Playing Overlay
                </div>
                <h1 className="login-title">Подключи свой стрим</h1>
                <p className="login-subtitle">
                    Войди через Spotify, чтобы получить оверлей для OBS
                    и начать принимать заказы треков через донаты
                </p>

                <button className="login-btn" onClick={handleLogin}>
                    <svg className="login-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 1 1-.277-1.215c3.809-.871 7.077-.496 9.713 1.115a.623.623 0 0 1 .206.857zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.688-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.452-1.492c3.631-1.102 8.147-.568 11.233 1.329a.78.78 0 0 1 .256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 1 1-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 0 1-.955 1.609z"/>
                    </svg>
                    Войти через Spotify
                </button>
                
                <p className="login-footer">
                    Для стримеров с музыкальным сопровождением
                </p>                
            </div>
        </div>    
    )
}