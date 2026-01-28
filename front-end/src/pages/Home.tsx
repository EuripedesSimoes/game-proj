// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from 'react-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';
import { Outlet } from 'react-router';

export function Home() {

    const queryClient = new QueryClient()

    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/auth/login')
    }

    const userAtual = auth.currentUser || null;
    // userAtual !== null 

    return (
        <QueryClientProvider client={queryClient}>
            <div className='w-full bg-black '>

                {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}
                <div className='flex flex-row gap-2 justify-center items-center p-2 z-[-30]'>
                    {/* <Button><Link to='/home'>Home</Link></Button> */}

                    <button className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-sm px-4 py-2  hover:bg-amber-300/50 ' onClick={() => navigate('/home/jogos')} >
                        Jogos Jogados
                    </button>

                    <button className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-sm px-4 py-2  hover:bg-amber-300/50 ' onClick={() => navigate('/home/jogos-para-jogar')}>
                        Jogos p/ jogar
                    </button>

                    <button className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-sm px-4 py-2  hover:bg-amber-300/50 ' onClick={() => navigate('/home')} >
                        Home
                    </button>

                    <Button onClick={handleLogout} className='absolute right-0 bg-slate-800 hover:bg-gray-900'>
                        Bem vindo, <span className='text-blue-300 font-bold'> {`${userAtual !== null ? userAtual.displayName : ''}`} </span>.
                        Você está <span className='text-green-300 font-bold'>LOGADO</span>, Clique para  <span className='text-red-500 font-bold'>DESLOGAR</span>
                    </Button>
                </div>
                {/* O Outlet é o "buraco" onde o conteúdo das rotas filhas será injetado */}
                <main>
                    <Outlet />
                </main>

            </div>
        </QueryClientProvider>


    )
}