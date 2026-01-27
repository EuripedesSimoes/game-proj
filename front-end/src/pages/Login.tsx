
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { auth } from "@/services/firebaseConfig";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner";

// import react_logo from 'src/assets/react.svg'

export function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);

    const navigate = useNavigate();

    async function handleLogin(ev: any) {
        ev.preventDefault();

        const res = await signInWithEmailAndPassword(email, password);

        if (res) {
            // 1. Extrai as informações atualizadas
            const token = await res.user.getIdToken();
            const userData = { email: res.user.email, uid: res.user.uid };

            // 2. Pega do localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            console.log("Login efetuado com sucesso!");
            navigate('/home');
            // loading
        }
    }

    // Tratamento de erro para login inválido
    if (error) {
        // No Firebase v10+, os códigos de erro comuns são 'auth/invalid-credential' 
        // ou 'auth/user-not-found' / 'auth/wrong-password'
        alert("E-mail ou senha incorretos!");
        console.log("Erro de login:", error.message);
    }

    const userAtual = auth.currentUser;
    if (userAtual !== null) {
        // The user object has basic properties such as display name, email, etc.
        const email = userAtual.email;
        const photoURL = userAtual.photoURL;
        const token =  userAtual.getIdToken()
        const uid = userAtual.uid;
        console.log(
            ` email: ${email}` + "\n" +
            ` URL da foto: ${photoURL}` + "\n" +
            // ` email verificado: ${emailVerified}`+ "\n" + 
            ` ID do usuário: ${uid}` + "\n" +
            ` token : ${token} `
        )
    }

    return (
        <>
            {loading ? <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-400/40">
                <span className="flex items-center text-2xl font-bold"><Spinner className="m-2" /> Indo para Home.....</span>
            </div>
                :
                <div className="w-screen h-screen flex flex-col items-center justify-center bg-white gap-2">

                    <div className="w-[430px] flex flex-col items-center justify-center bg-gray-300/50 shadow-2xl p-4">

                        <header className="flex flex-col items-center mb-10 ">
                            {/* <img src="https://img-eshop.cdn.nintendo.net/i/3f7ee6aa3482b514bd443e116022b038a9728f017916ed37da3f09f731a7d5f2.jpg" /> */}
                            <span className="font-medium text-xl pt-4">Digite suas informacões de <span className="font-bold text-xl">Login</span></span>
                        </header>

                        <form action="" className="flex flex-col items-center">
                            <div className="flex flex-col items-start">
                                <label htmlFor="email" className="text-black">E-mail</label>
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    className="p-2 rounded-sm"
                                    placeholder="johndoe@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col items-start">
                                <label htmlFor="password" className="text-black">Senha</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="p-2 rounded-sm"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <Button className="m-3 bg-black/80" onClick={handleLogin} disabled={loading}>
                                Logar
                                {/*  <img src={arrowI  mg} alt="->" /> */}
                            </Button>

                        </form>

                    </div>

                    <div className="footer mt-2">
                        <p>Você não tem uma conta?</p>
                        <Link to="/auth/register">Crie a sua conta <span className="font-bold text-lg">aqui</span></Link>
                    </div>

                    {/* <Button> Não tem uma conta? <Link to='/register' className='decoration-dashed'>Clique para ir para o página de Registro</Link> </Button>
                    <p className="text-white">Skibob</p> */}
                </div>
            }
        </>
    )
}