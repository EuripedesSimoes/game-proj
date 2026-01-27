import { useEffect, type ReactNode } from 'react';
import { auth } from '@/services/firebaseConfig';
import { Navigate, useNavigate } from 'react-router';
import { useAuthState } from 'react-firebase-hooks/auth';

import { Spinner } from "@/components/ui/spinner"

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const [user, loading] = useAuthState(auth);
    const userToken = localStorage.getItem('token')
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
                navigate('/auth/login');
            }
        }, 1000); // Verifica o token a cada 1 segundo

        // Cleanup: limpa o intervalo ao desmontar
        return () => clearInterval(interval);
    }, [navigate]);

    // Verificação inicial (opcional, mas redundante com o polling)
    useEffect(() => {
        if (!userToken) {
            navigate('/auth/login');
        }
    }, [userToken, navigate]);

    if (loading) return <div className='h-screen w-full bg-black text-2xl text-white/80 flex flex-col items-center justify-center'>
        <span className="flex items-center text-2xl font-bold">
            <Spinner className="m-2" /> Carregando verificação...
        </span>
    </div>;

    if (!user) {
        // Se não houver usuário, redireciona para o login
        return <Navigate to="/auth/login" replace />;
    }

    return children
}