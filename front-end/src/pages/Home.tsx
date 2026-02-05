// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';
import { Outlet } from 'react-router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';

export function Home() {
    const queryClient = new QueryClient()
    const navigate = useNavigate();

    // Usar useAuthState para pegar o usuário com suporte a loading state
    const [userAtual, loading] = useAuthState(auth);

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('steamCard');
        localStorage.removeItem('steamCardPJ');
        navigate('/auth/login')
    }

    // Redirecionar se o usuário não está logado (após o Firebase carregar o estado)
    useEffect(() => {
        if (!loading && !userAtual) {
            navigate('/auth/login');
        }
    }, [loading, userAtual, navigate]);

    if (loading) {
        return (
            <div className='w-full h-screen bg-black flex items-center justify-center'>
                <div className='text-white text-2xl font-bold'>Carregando...</div>
            </div>
        )
    }

    if (!userAtual) {
        return null; // useEffect vai redirecionar
    }

    return (
        <QueryClientProvider client={queryClient}>
            <div className='w-full bg-black'>

                {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}
                <div className='flex flex-row justify-between items-center p-2 z-[-30]'>

                    <div className='w-1/3'>
                        <h3 className='text-2xl p-4 text-white font-bold'>Bem vindo, <span className='text-blue-300 font-bold'> {`${userAtual !== null ? userAtual.displayName : ''}`}</span></h3>
                    </div>
                    {/* <Button><Link to='/home'>Home</Link></Button> */}
                    <div className='grid grid-cols-3 w-1/3 gap-3'>

                        <button className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-sm px-4 py-2  hover:bg-amber-300/50 ' onClick={() => navigate('/home/jogos')} >
                            Jogos Jogados
                        </button>

                        <button className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-sm px-4 py-2  hover:bg-amber-300/50 ' onClick={() => navigate('/home/jogos-para-jogar')}>
                            Jogos p/ jogar
                        </button>

                        <button className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-sm px-4 py-2  hover:bg-amber-300/50 ' onClick={() => navigate('/home')} >
                            Home
                        </button>
                    </div>

                    <div className='relative flex w-1/3 justify-center items-center'>
                        <Button onClick={handleLogout} className='absolute right-0 bg-slate-800 hover:bg-gray-900'>
                            {/* Bem vindo, <span className='text-blue-300 font-bold'> {`${userAtual !== null ? userAtual.displayName : ''}`} </span>. */}
                            Você está <span className='text-green-300 font-bold'>LOGADO</span>, Clique para  <span className='text-red-500 font-bold'>DESLOGAR</span>
                        </Button>
                    </div>
                </div>
                {/* O Outlet é o "buraco" onde o conteúdo das rotas filhas será injetado */}
                <main>
                    <Outlet />
                </main>

            </div>
        </QueryClientProvider>


    )
}