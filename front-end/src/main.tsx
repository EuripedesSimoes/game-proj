import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Home } from './pages/Home.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { Register } from './pages/Register.tsx';
import { Login } from './pages/Login.tsx';
import LoginOrRegister from './pages/LoginOrRegister.tsx';

createRoot(document.getElementById('root')!).render(


  <StrictMode>
    {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginOrRegister />} />

        <Route path='/home' element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        {/* Redireciona qualquer rota inexistente para o login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
