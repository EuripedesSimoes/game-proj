import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from './pages/Home.tsx'
import { Login } from './pages/Login.tsx'

createRoot(document.getElementById('root')!).render(


  <StrictMode>
    {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}
    <BrowserRouter>
      <Routes>
        {/* <Route path='/home' element={ <Home/> } /> */}
        <Route path='/' element={ <Home/> } />
        <Route path='/login' element={ <Login/> } />
        {/* <Route path='' element={ } />
        <Route /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
