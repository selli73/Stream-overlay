import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

export const SetupSection = () => {  
    
    const { ref, visible } = useRevealOnScroll<HTMLElement>();
    
    return (
        <section ref={ref} className={`dashboard-setup-section reveal ${visible ? 'reveal--in' : ''}`}>
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
    )
}