import { Button } from "@mui/material";
import { FaEraser } from "react-icons/fa";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import AttGameModal from "./modalAttJogo";
import { Link, useNavigate } from "react-router";

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
    release_year: number | string;
    year_started?: number | string;
    year_finished?: number | string;
    background_image?: string;

    deletajooj: (id: string) => Promise<void>
}

export default function CardComponent({ id, name, hours_played, hours_expected, platform, genre, release_year, status, replayed, priority, year_started, year_finished, background_image, deletajooj }: dadosJogos) {

    const navigate = useNavigate();
    // function gerarSlug(titulo: string) {
    //     return titulo
    //         .toLowerCase()
    //         .normalize('NFD').replace(/\p{Diacritic}/gu, '') // Remove acentuação
    //         .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    //         .trim() // Remove espaços do início e fim
    //         .replace(/\s+/g, '-'); // Troca espaços por hífens
    // }

    // const slugName = gerarSlug(name)
    // const { slug } = useParams()
    // function MeuComponente() {
    //     return (
    //         <Link to="/rota-destino" target="_blank" rel="noopener noreferrer">
    //             Abrir em nova aba
    //         </Link>
    //     );
    // }

    return (
        <>
            {/* <Button onClick={() => navigate(`/home/jogos/${id}`)}> Ver página </Button> */}
            <Card className='w-full h-[300px] min-[450px]:h-[500px] gap-2 flex flex-col items-start cursor-pointer border-2 hover:border-4 border-white/50 hover:border-amber-500 transition-all bg-slate-900 shadow-4xl'
                key={id} >

                <div className="absolute bg-white/20 z-50 rounded-lg shadow-lg  hover:bg-gray-600">
                    <Button className='bg-white/60 m-2' onClick={() => deletajooj(id)}>
                        <span>
                            <FaEraser className="h-6.5 w-6.5 text-red-600/80" />
                        </span>
                    </Button>
                    {/* FUNÇÃO DE ABRIR O MODAL */}
                    <AttGameModal gameId={id} data={{ id, name, hours_played, hours_expected, platform, genre, release_year, status, replayed, priority, year_started, year_finished }} />
                </div>

                <div className="w-full h-[60%] relative">
                    <div className="absolute  w-full h-full rounded-lg shadow-lg  hover:bg-black/20" onClick={() => navigate(`/home/jogos/${id}`)}></div>
                    <img
                        src={background_image}
                        alt={name}
                        className='w-full h-full object-cover object-center rounded-t-lg border-b-3 border-emerald-800 hover:border-amber-500'

                    />
                </div>


                <CardContent className='h-[40%] w-full p-2 flex flex-col justify-start items-start overflow-auto gap-3'>

                    <CardTitle className='text-white text-[14px] md:text-base border-b-2 w-full'>
                        {`${name} (${release_year})`}
                    </CardTitle>

                    <div className='flex w-full gap-x-2'>
                        <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-40 flex justify-center items-end'>
                            {hours_played}{Number(hours_played) <= 1 ? ' hora' : ' horas'} {` / ${hours_expected}`}
                        </CardDescription>

                        <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full`}>
                            {/* {replayed === 'Rejogado' ? 'Rejogado: ✅ Sim' :   'Rejogado: ❌ Não' } */}
                            Rejogando: {replayed}
                        </CardDescription>
                    </div>

                    <CardDescription className={`text-white w-full text-[14px] md:text-base border-b-2 flex justify-center 2xl:justify-center items-end `}>
                        Plataforma:
                        <p
                            className={`px-2 font-bold 
                            ${platform === 'Switch' ? 'text-red-600'
                                    : platform === 'PC' ? 'text-blue-400'
                                        : platform === 'PSVita' ? 'text-blue-600'
                                            : platform === '3DS-Emulado' ? 'text-red-400'
                                                : platform === 'PSP-Emulado' && 'text-purple-800'}`}>
                            {platform}
                        </p>
                    </CardDescription>

                    <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end  w-full
                         ${status === 'Finalizado' ? 'text-green-400'
                            : status === 'Pausado' ? 'text-red-300'
                                : status === 'Jogando' ? 'text-yellow-300'
                                    : status === 'Não Iniciado' && 'text-white'}`}>
                        Status: {status === 'Finalizado' ? `✅ ${status}  (${year_finished})` : status === 'Pausado' ? `${status} ⏸️` : status === 'Jogando' ? `${status} 🎮` : `${status}`}
                    </CardDescription>
                    <CardDescription className='text-white w-full text-[14px] md:text-[15px] border-b-2 flex justify-center items-end '>
                        Gênero: {genre}
                    </CardDescription>

                    {/* CARD FILTRO PRIORIDADE */}
                    <CardDescription className={`text-white w-full text-[14px] md:text-base border-b-2 flex flex-row justify-center 2xl:justify-center items-end `}>
                        Prioridade:
                        <p className={`px-2 font-bold ${priority === '1- Principal' ? 'text-red-600' : priority === '2- Secundário' && 'text-yellow-600'}`}>
                            {priority}
                        </p>
                    </CardDescription>
                </CardContent>
            </Card>
        </>
    )
}