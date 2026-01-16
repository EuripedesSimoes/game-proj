// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';

import Box from '@mui/material/Box';
import * as Tabs from "@radix-ui/react-tabs";
import App from '@/App.tsx';
import AppParaJogar from '@/components/para-jogar/AppParaJogar.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router';

export function Home() {

    const queryClient = new QueryClient()



    return (
        <>
            <Button> Você está logged <Link to='/login' className='decoration-dashed'>Clique para ir para o login</Link> </Button>
            <QueryClientProvider client={queryClient}>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'black' }}>

                    {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}
                    <Tabs.Root defaultValue='Tudo'>
                        <Tabs.List className='flex flex-row gap-2 justify-center items-center p-2'>
                            <Tabs.Trigger value='Jogos jogados' className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-lg'>
                                Jogos Jogados
                            </Tabs.Trigger>
                            <Tabs.Trigger value='Jogos p/ jogar' className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-lg'>
                                Jogos p/ jogar
                            </Tabs.Trigger>
                            <Tabs.Trigger value='Tudo' className='bg-amber-400 border-2 border-amber-900 text-black font-semibold rounded-lg'>
                                Tudo
                            </Tabs.Trigger>
                        </Tabs.List>


                        <Tabs.Content value='Jogos jogados'>
                            <App />
                        </Tabs.Content>

                        <Tabs.Content value='Jogos p/ jogar' >
                            <AppParaJogar />
                        </Tabs.Content>

                        <Tabs.Content value='Tudo' >
                            <div className='bg-white '>3 tab</div>
                        </Tabs.Content>

                    </Tabs.Root>
                </Box>

            </QueryClientProvider>


        </>
    )
}