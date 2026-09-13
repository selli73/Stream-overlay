import { useContext, useEffect, useState } from "react";
import type { IUser } from "../../../typings";
import { Context } from "../../../main";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

export const OverlaySection = () => {
    
    const { authStore } = useContext(Context);
    const [user, setUser] = useState<IUser>();    
    const [copied, setCopied] = useState(false);
    const { ref, visible } = useRevealOnScroll<HTMLElement>();

    useEffect(() => {
        const fetchProfile = async  () => {
            try {
                const data = await authStore.getProfile();
                setUser(data);
            } catch(error) {
                console.log(error);
            }
        }

        fetchProfile()
    }, []);

    const overlayUrl = user 
        ? `${window.location.origin}/overlay/${user.spotifyUserId}` 
        : '';
    
    const handleCopy = async () => {
        await navigator.clipboard.writeText(overlayUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section ref={ref} className={`dashboard-overlay-section reveal ${visible ? 'reveal--in' : ''}`}>
            <div className="overlay-title-row">
                <img src="/media/obs-icon.svg" alt="" width={24} height={24} className="obs-icon" />
                <h2>Ссылка на оверлей</h2>
            </div>
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
    )
}