import { useContext, useEffect, useState } from "react"
import { Context } from "../../../main";
import type { IUser } from "../../../typings";

export const HeaderDashboard = () => {
    
    const { authStore } = useContext(Context);
    const [user, setUser] = useState<IUser>();   

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

    if (!user) {
        return <div className="dashboard-loading">Загрузка...</div>;
    }
    
    return (
        <header className="dashboard-header">
            <div className="dashboard-greeting">
                <h1>Привет, {user.accountName}</h1>
                <p className="dashboard-subtitle">
                    Твой оверлей для Spotify готов к использованию
                </p>
            </div>
        </header>
    )
}