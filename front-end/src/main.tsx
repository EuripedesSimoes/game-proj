import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import * as Tabs from "@radix-ui/react-tabs";


const queryClient = new QueryClient()

// const [tab, setTab] = useState(0)
// const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//   setTab(newValue);
// };


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'black' }}>

        {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}
        <Tabs.Root defaultValue='Jogos p/ jogar'>
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
            <div className='bg-white'>2 tab</div>
          </Tabs.Content>

          <Tabs.Content value='Tudo' >
            <div className='bg-white h-screen'>3 tab</div>
          </Tabs.Content>

        </Tabs.Root>
      </Box>

    </QueryClientProvider>
  </StrictMode>
)
