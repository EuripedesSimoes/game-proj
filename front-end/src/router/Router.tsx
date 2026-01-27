

import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LoginOrRegister from "@/pages/LoginOrRegister";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Home } from "lucide-react";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/'>
                    <Route path="" element={<LoginOrRegister />} />
                    <Route path='home' element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path="/auth">
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>


                {/* antiga rota, foi adicionado um /auth */}
                {/* <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} /> */}

                {/* Redireciona qualquer rota inexistente para o login */}
                {/* <Route path="*" element={<Navigate to="/auth/login" />} /> */}
            </Routes>
        </BrowserRouter>
    )
}