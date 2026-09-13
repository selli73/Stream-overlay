import { useContext, useEffect, useState } from "react"
import { Context } from "../main"
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    
    const { authStore } = useContext(Context);
    const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await authStore.getProfile();
                setStatus('authorized');
            } catch (error) {
                setStatus('unauthorized');
            }
        };
        checkAuth();        
    }, [])

    if (status === 'loading') {
        return <div className="dashboard-loading">Загрузка...</div>;
    }

    if (status === 'unauthorized') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}