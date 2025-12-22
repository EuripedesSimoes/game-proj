import { Button } from "@mui/material";
import { FaEraser } from "react-icons/fa";

import {
    Card,
    // CardAction,
    CardContent,
    CardDescription,
    // CardFooter,
    // CardHeader,
    CardTitle,
} from "@/components/ui/card"
import AttGameModal from "./modalAttJogo";

type dadosJogos = {
    id: string
    name: string;
    hours_played?: number | string;
    hours_expected?: number | string;
    priority: string;
    platform: string;
    genre: string;
    status: string;
    is_completed?: boolean;
    release_year: number | string;
    year_started?: number | string;
    year_finished?: number | string;
    background_image?: string;

    deletajooj: (id: string) => Promise<void>
}

export default function CardComponent({ id, name, hours_played, hours_expected, platform, genre, is_completed, release_year, status, priority, year_started, year_finished, background_image, deletajooj }: dadosJogos) {


    return (
        <Card className='w-full h-[500px] gap-2 flex flex-col items-start cursor-pointer border-2 hover:border-4 border-white/50 hover:border-amber-500 transition-all bg-slate-900 shadow-4xl' key={id}>

            <div className="absolute bg-black/20 z-10  rounded-lg shadow-lg  hover:bg-gray-600">
                <Button className='bg-white/60 m-2' onClick={() => deletajooj(id)}>
                    <span>
                        <FaEraser className="h-6.5 w-6.5 text-red-600/80" />
                    </span>
                </Button>
                {/* COLOCAR AQUI A FUNÇÃO DE ABRIR O MODAL */}
                <AttGameModal gameId={id} data={{ id, name, hours_played, hours_expected, platform, genre, is_completed, release_year, status, priority, year_started, year_finished, background_image }} />
            </div>

            <img
                src={background_image}
                alt={name}
                className='w-full h-[60%] object-cover object-center rounded-t-lg border-b-3 border-emerald-800 hover:border-amber-500'
            />

            <CardContent className='h-[40%] w-full p-2 flex flex-col justify-start items-start overflow-auto gap-3'>

                <CardTitle className='text-white text-[14px] md:text-base border-b-2 w-full'>{name}</CardTitle>
                <div className='flex w-full gap-x-2'>
                    <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-40 flex justify-center items-end'>{hours_played}{Number(hours_played) <= 1 ? ' hora' : ' horas'} </CardDescription>
                    <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-full flex justify-center items-end '>Gênero: {genre}</CardDescription>
                </div>

                <div className='flex flex-col 2xl:flex-row w-full gap-3'>

                    <CardDescription className={`text-white text-[14px] md:text-base border-b-2 flex flex-row} justify-center 2xl:justify-start items-end `}>
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

                    {/* Aqui era baseado no "is_complete", foi mudado para o valor do status */}
                    {/* <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full
                         ${game.is_completed === true ? 'text-green-400'
                        : 'text-red-300'}`}>
                      Status: {game.status}
                    </CardDescription> */}
                    <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full
                         ${status === 'Finalizado' ? 'text-green-400'
                            : status === 'Pausado' ? 'text-red-300'
                                : status === 'Jogando' ? 'text-yellow-300'
                                    : status === 'Não Iniciado' && 'text-white'}`}>
                        Status: {status === 'Finalizado' ? `✅ ${status}  (${year_finished})` : status === 'Pausado' ? `${status} ⏸️` : status === 'Jogando' ? `${status} 🎮` : `${status}`}
                    </CardDescription>

                </div>

                {/* CARD FILTRO PRIORIDADE */}
                {/* <CardDescription className={`text-white text-[14px] md:text-base border-b-2 flex flex-row justify-center  2xl:justify-start items-end `}>
                Prioridade:
                <span className={`font-bold ${user.priority === '1- Principal' ? 'text-red-600' : user.priority === '2- Secundário' && 'text-yellow-600'}`}>
                    {user.priority}
                </span>
            </CardDescription> */}
            </CardContent>
        </Card>
    )
}