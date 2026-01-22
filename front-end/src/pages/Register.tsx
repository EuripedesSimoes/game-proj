import { useState } from "react";

import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button"

import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "@/services/firebaseConfig";
import { updateProfile } from "firebase/auth";

// import react_logo from 'src/assets/react.svg'

export function Register() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userName, setUserName] = useState('')
    const [createUser, user, loading, error] = useCreateUserWithEmailAndPassword(auth);

    const navigate = useNavigate();

    async function handleRegister(ev: any) {
        ev.preventDefault();

        try {
            const res = await createUser(email, password);

            if (res && res.user) {
                // 1. Atualiza o perfil no Firebase com o userName do seu estado
                await updateProfile(res.user, {
                    displayName: userName
                });

                // 2. Extrai as informações atualizadas
                const token = await res.user.getIdToken();
                const userData = { email: res.user.email, uid: res.user.uid };
                const userNameData = { displayName: res.user.displayName }

                // 3. Salva no localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('userName', JSON.stringify(userNameData));

                console.log("Novo usuário registrado com sucesso!");
                navigate('/login');
            }
        } catch (err) {
            // O erro também é tratado pelo hook, mas aqui pegamos falhas críticas
            console.error("Erro inesperado:", err);
        }
    }

    // Tratamento de erro específico (E-mail já existe) e (Senha curta)
    if (error) {
        if (error.code === 'auth/email-already-in-use') {
            alert("Este e-mail já está em uso!");
            console.log("Erro: E-mail duplicado.");
        }
        if (password.length < 6) {
            alert("Senha deve ter no minimo 6 caracteres!");
            console.log("Senha pequena.");
        }
    }


    return (
        <>
            {loading ? <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-400/40">
                <span className=" text-2xl font-extrabold">Indo para Login.....</span>
            </div>
                :
                <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">

                    <div className="w-[430px] flex flex-col items-center justify-center bg-gray-300/40 shadow-2xl p-4">

                        <header className="flex flex-col items-center mb-10 ">
                            {/* <img src="https://img-eshop.cdn.nintendo.net/i/3f7ee6aa3482b514bd443e116022b038a9728f017916ed37da3f09f731a7d5f2.jpg" /> */}
                            <span className="font-medium text-xl pt-4">Digite suas informacões para <span className="font-bold text-xl">Registro</span></span>
                        </header>

                        <form action="" className="flex flex-col items-center">

                            <div className="flex flex-col items-start">
                                <label htmlFor="userName" className="text-black">Nome de usuário</label>
                                <input
                                    type="text"
                                    name="userName"
                                    id="userName"
                                    className="p-2 rounded-sm"
                                    placeholder="Digite nome de usuário"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>

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

                            <Button className="m-3 bg-black/80" onClick={handleRegister}>
                                Entrar
                                {/*  <img src={arrowI  mg} alt="->" /> */}
                            </Button>


                        </form>

                    </div>

                    <div className="footer mt-2">
                        <p>Já tem uma conta?</p>
                        <Link to="/login">Vá para a tela de <span className="font-bold text-lg">Login</span></Link>
                    </div>
                    {/* <Button> Já tem uma conta? <Link to='/login' className='decoration-dashed'>Clique para ir para o página de Login</Link> </Button>
                    <p className="text-white">Skibob</p> */}
                </div>
            }
        </>
    )
}