import { Button, TextField } from "@mui/material";

import { useLocation, useNavigate, useParams } from "react-router";

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, firebaseApp } from '@/services/firebaseConfig';
import { FaArrowLeft } from "react-icons/fa";


type dadosJogos = {
    id: string
    name: string;
    hours_played?: number | string;
    hours_expected?: number | string;
    priority: string;
    platform: string;
    genre: string;
    status: string;
    replayed: string
    // is_completed?: boolean;
    release_year: number | string;
    year_started?: number | string;
    year_finished?: number | string;
    background_image?: string;

    // deletajooj: (id: string) => Promise<void>
}
// pegar o nome (name) e tranformar em slug
// <Link to={`/home/${slugName}`}/>


export const GamePage = () => {
    const { slug } = useParams();
    const [user] = useAuthState(auth);
    const navigate = useNavigate()
    const location = useLocation();

    const { data: game, isLoading } = useQuery({
        queryKey: ['jogo', slug],
        queryFn: async () => {
            if (!user?.uid) return null;
            const docRef = doc(db, 'users', user.uid, 'jogos', slug!);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        }
    });

    console.log('game na page do jogo', game)
    const allInputs = [game?.id, game?.name, game?.hours_played, game?.hours_expected, game?.platform, game?.genre, game?.release_year, game?.status, game?.replayed, game?.priority, game?.year_started, game?.year_finished, game?.background_image]

    if (isLoading) return <div>Carregando...</div>;
    if (!game) return <div>Erro ao carregar jogo: {game}
        <Button onClick={() => navigate('/home')}><FaArrowLeft /> Voltar para home </Button></div>;


    return (
        <div className="relative min-h-screen w-full flex flex-col items-center">

            {/* CAMADA DE FUNDO (Apenas para a imagem e efeitos) */}
            <div
                className={`absolute inset-0 z-10 bg-cover bg-center bg-no-repeat transition-all duration-700 ${game?.background_image ? '' : 'bg-white/50'}`}
                style={{
                    backgroundImage: `url(${game?.background_image})`,
                    filter: 'blur(8px) brightness(0.5)' // Blur e Escurecimento via Inline Style ou use classes abaixo
                }}
            />

            {/* OVERLAY EXTRA (Opcional - para garantir contraste) */}
            <div className="absolute inset-0 z-10 bg-black/40" />
            <div className="w-full h-28 z-10 bg-black/50">
                <h3 className='text-4xl p-4 text-white font-bold'>Bem vindo à <span className='font-bold text-4xl text-green-400'>Página de jogo</span></h3>

                <Button onClick={() => navigate('/home/jogos', { state: { from: location } })}
                    variant="contained"
                    startIcon={<FaArrowLeft />}>
                    Voltar
                </Button>
            </div>

            <div className="flex flex-row z-10 w-3/4 h-full bg-none gap-4">

                <div className="flex justify-center w-1/2 max-h-[600px] p-4 relative" >

                    {/* <div className="absolute inset-0 z-[-10] bg-black/40" /> */}

                    <div className="w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] md:w-[520px] md:h-[580px] flex items-start justify-center  mt-6" >
                        {game.background_image ? (<img src={game.background_image} alt="foto" className="min-w-1/2 max-w-full min-h-1/2 max-h-full object-cover object-center rounded" />)
                            : (<div className="flex flex-col font-bold text-white text-3xl border-b-3 border-dashed border-red-700">Sem imagem de capa*</div>)}
                    </div>

                </div>

                <div className="flex flex-col w-1/2 min-h-full relative mt-6 gap-4 p-4">

                    {/* CAMADA DE FUNDO (Apenas para a imagem e efeitos) */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                        style={{
                            // backgroundImage: `url(${game?.background_image})`,
                            filter: 'blur(8px) brightness(0.5)' // Blur e Escurecimento via Inline Style ou use classes abaixo
                        }}
                    />

                    {/* OVERLAY EXTRA (Opcional - para garantir contraste) */}
                    <div className="absolute inset-0 z-[-10] bg-black/40" />

                    <div className="flex flex-col">

                        <div className='grid grid-cols-4 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className=' col-span-2'>
                                <TextField
                                    className='shadow-lg col-span-2 rounded-sm'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                    }}
                                    fullWidth
                                    margin="dense"
                                    id="name"
                                    name="name"
                                    label="Nome do Jogo"
                                    type="text"
                                    variant="standard"
                                    disabled={true}
                                    value={game.name}
                                />
                            </div>

                            <div className=' col-span-1 '>
                                <TextField
                                    className='shadow-lg col-span-2 rounded-sm'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                    }}
                                    margin="dense"
                                    id="hours_played"
                                    name="hours_played"
                                    label="Horas jogadas"
                                    type="text"
                                    variant="standard"
                                    disabled={true}
                                    value={game.hours_played}
                                />
                            </div>

                            <div className=' col-span-1 '>
                                <TextField
                                    className='shadow-lg col-span-2 rounded-sm'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                    }}
                                    margin="dense"
                                    id="hours_expected"
                                    name="hours_expected"
                                    label="Horas esperadas"
                                    type="text"
                                    variant="standard"
                                    disabled={true}
                                    value={game.hours_expected}
                                />
                            </div>

                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-2 py-2 border-b-4 border-[#b6b6b6]">
                            <TextField
                                className='shadow-lg rounded-sm'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                margin="dense"
                                id="platform"
                                name="platform"
                                label="Plataforma"
                                type="text"
                                variant="standard"
                                disabled={true}
                                value={game.platform}
                            />
                            <TextField
                                className='shadow-lg rounded-sm'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                margin="dense"
                                id="genre"
                                name="genre"
                                label="Gênero"
                                type="text"
                                variant="standard"
                                disabled={true}
                                value={game.genre}
                            />
                            <TextField
                                className='shadow-lg rounded-sm'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                margin="dense"
                                id="status"
                                name="status"
                                label="Status"
                                type="text"
                                variant="standard"
                                disabled={true}
                                value={game.status}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-2 py-2 border-b-4 border-[#b6b6b6]">
                            <TextField
                                className='shadow-lg rounded-sm'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                margin="dense"
                                id="release_year"
                                name="release_year"
                                label="Ano Lançamento"
                                type="text"
                                variant="standard"
                                disabled={true}
                                value={game.release_year}
                            />
                            <TextField
                                className='shadow-lg rounded-sm'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                margin="dense"
                                id="year_started"
                                name="year_started"
                                label="Ano Iniciado"
                                type="text"
                                variant="standard"
                                disabled={true}
                                value={game.year_started}
                            />
                            <TextField
                                className='shadow-lg rounded-sm'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                margin="dense"
                                id="year_finished"
                                name="year_finished"
                                label="Ano Finalizado"
                                type="text"
                                variant="standard"
                                disabled={true}
                                value={game.year_finished}
                            />

                        </div>

                    </div>
                </div>


            </div>
        </div>
    )
}