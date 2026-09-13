import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main";
import axios from "axios";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

export const DonationSection = () => {
    
    const { authStore } = useContext(Context);
    const [donationAlertsConnected, setDonAlertsConnected] = useState<boolean>();
    const [donationLoading, setDonationLoading] = useState(false);
    const [donationError, setDonationError] = useState('');
    const { ref, visible } = useRevealOnScroll<HTMLElement>();

    const handleConnectDonationAlerts = () => {        
        window.location.href = `${import.meta.env.VITE_API_BACKEND_URL}/donation-alerts/login`;
    };

    const handleLogoutDonationAlerts = async () => {
        setDonationError('');
        setDonationLoading(true);
        try {
            await authStore.logoutDonationAlerts();
            setDonAlertsConnected(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setDonationError(error.response?.data.message || 'Не удалось отключить DonationAlerts');
            } else {
                setDonationError('Произошла неизвестная ошибка');
            }
        } finally {
            setDonationLoading(false);
        }
    };
    
    useEffect(() => {
        const checkingAuthDonAlerts = async () => {
            try {
                const data = await authStore.checkingAuthDonAlerts();
                setDonAlertsConnected(data.donationAlertsConnected);
            } catch(error) {
                console.log(error);
            }
        }

        checkingAuthDonAlerts();
    }, []);

    return (
        <section ref={ref} className={`dashboard-donation-section reveal ${visible ? 'reveal--in' : ''}`}>
            <img src="/media/donationalerts-badge.png" alt="" width={32} height={32} />
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
                    <div className="donation-actions">
                        <span className="session-badge session-badge--live">Подключено</span>
                        <button
                            className="donation-disconnect-btn"
                            onClick={handleLogoutDonationAlerts}
                            disabled={donationLoading}
                        >
                            {donationLoading ? 'Отключаем...' : 'Отключить'}
                        </button>
                    </div>
                ) : (
                    <button className="donation-connect-btn" onClick={handleConnectDonationAlerts}>
                        Подключить DonationAlerts
                    </button>
                )}
            </div>
            {donationError && <p className="session-error">{donationError}</p>}
        </section>
    )    
}