import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from './pages/Home.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { Register } from './pages/Register.tsx';
import { Login } from './pages/Login.tsx';
import LoginOrRegister from './pages/LoginOrRegister.tsx';
import { GamePage } from './pages/GamePage.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GamePageParaJogar } from './pages/GamePageParaJogar.tsx';



const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(

  <QueryClientProvider client={queryClient}>

    <StrictMode>
      {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route path="" element={<LoginOrRegister />} />
          </Route>

          <Route path='/home' element={
            <ProtectedRoute> <Home /> </ProtectedRoute>
          }>
            <Route path="jogos" element={<Home />} />
            <Route path="jogos-para-jogar" element={<Home />} />
          </Route>

          <Route path='/home/jogos/:slug' element={<GamePage />} />
          <Route path='/home/jogos-para-jogar/:slug' element={<GamePageParaJogar />} />

          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>


          {/* antiga rota, foi adicionado um /auth */}
          {/* <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} /> */}

          {/* Redireciona qualquer rota inexistente para o login */}
          {/* <Route path="*" element={<Navigate to="/auth/login" />} /> */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </QueryClientProvider>
  
)
