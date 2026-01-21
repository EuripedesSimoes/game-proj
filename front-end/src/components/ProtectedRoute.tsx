import type { ReactNode } from 'react';
import { auth } from '@/services/firebaseConfig';
import { Navigate } from 'react-router';
import { useAuthState } from 'react-firebase-hooks/auth';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
const [user, loading] = useAuthState(auth);
// const userToken = localStorage.getItem('token')

    if (loading) return <div>Carregando verificação...</div>;

    if (!user) {
        // Se não houver usuário, redireciona para o login
        return <Navigate to="/login" replace />;
    }

    return children
}