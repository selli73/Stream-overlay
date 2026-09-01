import { useContext, useEffect, useState } from "react"
import { Context } from "../../main"

interface IUser {
    spotifyUserId: string;
    accountName: string;
    createdAt: Date;
}

export const DashboardPage = () => {
    const { authStore } = useContext(Context);
    const [user, setUser] = useState<IUser>();
    useEffect(() => {
        const fetchProfile = async  () => {
            try {
                const data = await authStore.getProfile();
                console.log(data);
                setUser(data);
            } catch(error) {
                console.log(error);
            }
        }

        fetchProfile();
    }, [])
    
    return (
        <div>
            <h2>Ваш профиль</h2>
            {
                user && (
                    <div>
                        <p>{user.spotifyUserId}</p>
                        <p>{user.accountName}</p>                    
                    </div>
                )
            }
        </div>
    )
}