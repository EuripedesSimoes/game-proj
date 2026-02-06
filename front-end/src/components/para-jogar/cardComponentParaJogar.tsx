import { Button } from "@mui/material";
import { Button as Btn } from "@/components/ui/button"
import { FaEraser } from "react-icons/fa";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import AttGameModalParaJogar from "./modalAttJogoParaJogar";
import { Link } from "react-router";
import { useState } from "react";
// import { Link, useNavigate } from "react-router";
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { IoIosArrowDown , IoMdArrowDropright, IoIosArrowForward  } from "react-icons/io";


type dadosJogos = {
    id: string
    name: string;
    hours_expected: number | string;
    priority: string;
    platform: string;
    genre: string;
    status: string;
    replayed: string;
    release_year: number | string;
    background_image?: string;

    deletajooj: (id: string, backgroundImage?: string) => Promise<void>;
    steamCardPJ?: string;
    uidValidator: string;
}

export default function CardComponentParaJogar({ id, name, hours_expected, priority, platform, genre, status, replayed, release_year, background_image, deletajooj, steamCardPJ, uidValidator }: dadosJogos) {

    const [hide, setHide] = useState<boolean>(true)
    // const navigate = useNavigate();
    console.log(hide)
    return (

        <div className="flex flex-col">
            {steamCardPJ === 'pequeno' ? (
                <Card className={`flex flex-col w-full h-[165px] gap-2 
              items-start cursor-pointer border-2 hover:border-4 border-white/50
              hover:border-amber-500 transition-all bg-slate-900 shadow-4xl`}
                    key={id}
                // onMouseEnter={() => setHide(false)} 
                // onMouseLeave={() => setHide(true)} 
                >

                    <div className="w-full relative flex justify-center items-center">

                        <div className={`flex flex-col  w-full h-full justify-between items-end `}>


                            <div className="relative z-25 flex justify-center items-center w-full rounded-tr-[12px] md:rounded-tl-[12px] bg-white/70 py-1">


                                {/* CARD FILTRO NOME centralizado*/}
                                <Link to={`/home/jogos-para-jogar/${id}`} className="z-10">
                                    <CardTitle className='text-black font-bold text-[11px] md:text-base lg:text-xl border-b-2'>
                                        {`${name} (${release_year})`}
                                    </CardTitle>
                                </Link>

                                {/* Container do Popover fixado na direita */}
                                <div className={`absolute right-2 top-1/2 -translate-y-1/2 ${uidValidator === 'LmUiBeD97qW9Ft2FzJfnEMHKzXK2' ? 'hidden' : 'flex'}`}>

                                    <Popover>
                                        {({ open }) => ( // Pegamos a propriedade 'open' do componente pai
                                            <>
                                                <PopoverButton
                                                    onClick={() => setHide(!hide)}
                                                    className="block text-sm/6 font-semibold text-black/50 focus:outline-none data-active:text-white data-hover:text-white"
                                                >
                                                    {open ? <IoIosArrowForward size={'20px'}  /> : <IoIosArrowDown size={'20px'}   />}
                                                </PopoverButton>

                                                <PopoverPanel
                                                    transition
                                                    anchor="right start" // 'right start' ajuda a alinhar ao lado do card
                                                    className="flex flex-col p-1 items-center z-50 divide-y divide-white/5 rounded-xl bg-black/85 text-sm/6 transition duration-200 ease-in-out
                                             [--anchor-gap:--spacing(4)] data-closed:-translate-y-1 data-closed:opacity-0  "
                                                >
                                                    {/* Seus botões de Delete e Modal */}

                                                    <Button className='bg-slate-500/60 m-2' onClick={() => deletajooj(id, background_image)}>
                                                        <span>
                                                            <FaEraser className="h-5 w-5 md:h-6.5 md:w-6.5 text-red-600 hover:h-8 hover:w-8  hover:transition-all duration-100 ease-in-out" />
                                                        </span>
                                                    </Button>
                                                    {/* FUNÇÃO DE ABRIR O MODAL */}
                                                    < AttGameModalParaJogar gameId={id} data={{ id, name, hours_expected, platform, genre, release_year, status, replayed, priority, background_image }} />

                                                </PopoverPanel>
                                            </>

                                        )}
                                    </Popover>
                                </div>
                            </div>


                        </div>

                    </div>

                    <CardContent className='h-full w-full p-2 flex flex-col justify-start items-start overflow-auto gap-3'>

                        {/* CARD HORAS E GÊNERO */}
                        <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-full flex justify-center items-end'>
                            {hours_expected}{Number(hours_expected) <= 1 ? ' hora' : ' horas'} - Gênero: {genre}
                        </CardDescription>

                        {/* CARD FILTRO PLATAFORMA & PRIORIDADE */}
                        <CardDescription className={`text-white w-full text-[11px] md:text-base border-b-2 flex justify-center 2xl:justify-center items-end `}>
                            <p>
                                <span className={`px-2 font-bold 
                                                    ${platform === 'Switch' ? 'text-red-600'
                                        : platform === 'PC' ? 'text-blue-400'
                                            : platform === 'PSVita' ? 'text-blue-600'
                                                : platform === '3DS-Emulado' ? 'text-red-400'
                                                    : platform === 'PSP-Emulado' && 'text-purple-800'}`}>
                                    {platform}
                                </span>

                                <span className={`font-bold ${priority === '1- Principal' ? 'text-red-600' : priority === '2- Secundário' && 'text-yellow-600'}`}>
                                    - {priority}
                                </span>
                            </p>
                        </CardDescription>


                        {/* CARD JOGADO/REJOGADO */}
                        <CardDescription className={`text-white text-[14px] md:text-base border-b-2 font-bold flex justify-center items-end w-full`}>
                            {/* {replayed === 'Rejogado' ? 'Rejogado: ✅ Sim' :   'Rejogado: ❌ Não' } */}
                            Para Rejogar: {replayed}
                        </CardDescription>

                    </CardContent>
                </Card>
            )
                : steamCardPJ === 'médio' ? (
                    <Card className={`w-full h-[150px] gap-2 flex flex-row-reverse md:flex-row items-start cursor-pointer border-2 hover:border-3 border-white/30 hover:border-gray-500
                     bg-slate-900 shadow-4xl`}
                        key={id} >

                        <div className="w-full h-full relative rounded-r-[12px] md:rounded-br-lg md:rounded-l-[12px] md:border-r-3 border-emerald-800 ">

                            <div className="flex flex-col absolute w-full h-full justify-between items-end">

                                {/* CARD FILTRO NOME */}
                                <div className=" z-25  flex justify-center items-center w-full rounded-tr-[12px] md:rounded-tl-[12px] bg-white/70">
                                    <CardTitle className='text-black font-bold text-[11px] md:text-base lg:text-lg border-b-2 w-full'>
                                        {`${name} (${release_year})`}
                                    </CardTitle>
                                </div>

                                <div className={` z-25 justify-around items-center w-full rounded-br-[12px] md:rounded-b-[12px] shadow-lg hover:bg-white/40 
                            ${uidValidator === 'LmUiBeD97qW9Ft2FzJfnEMHKzXK2' ? 'hidden' : 'flex'}`}>
                                    <Button className='bg-white/60 m-2' onClick={() => deletajooj(id, background_image)}>
                                        <span>
                                            <FaEraser className="h-5 w-5 md:h-6.5 md:w-6.5 text-red-600/80" />
                                        </span>
                                    </Button>
                                    {/* FUNÇÃO DE ABRIR O MODAL */}
                                    < AttGameModalParaJogar gameId={id} data={{ id, name, hours_expected, platform, genre, release_year, status, replayed, priority, background_image }} />
                                </div>

                                <div className="w-full h-full z-20 absolute">
                                    <Link to={`/home/jogos-para-jogar/${id}`} >
                                        <div className="absolute w-full h-full rounded-lg shadow-lg  hover:bg-black/20" />

                                        {/* CARD FILTRO IMAGEM */}
                                        <img
                                            src={background_image}
                                            alt={name}
                                            className='p-1 w-full h-full object-cover object-center rounded-r-[12px] md:rounded-br-lg md:rounded-l-[12px] '
                                        />
                                    </Link>
                                </div>
                            </div>

                        </div>

                        <CardContent className='h-full w-full p-2 flex flex-col justify-start items-start overflow-auto gap-3'>

                            {/* CARD HORAS E GÊNERO */}
                            <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-full flex justify-center items-end'>
                                {hours_expected}{Number(hours_expected) <= 1 ? ' hora' : ' horas'} - Gênero: {genre}
                            </CardDescription>

                            {/* CARD FILTRO PLATAFORMA & PRIORIDADE */}
                            <CardDescription className={`text-white w-full text-[11px] md:text-base border-b-2 flex justify-center 2xl:justify-center items-end `}>
                                <p>
                                    <span className={`px-2 font-bold 
                                                    ${platform === 'Switch' ? 'text-red-600'
                                            : platform === 'PC' ? 'text-blue-400'
                                                : platform === 'PSVita' ? 'text-blue-600'
                                                    : platform === '3DS-Emulado' ? 'text-red-400'
                                                        : platform === 'PSP-Emulado' && 'text-purple-800'}`}>
                                        {platform}
                                    </span>

                                    <span className={`font-bold ${priority === '1- Principal' ? 'text-red-600' : priority === '2- Secundário' && 'text-yellow-600'}`}>
                                        - {priority}
                                    </span>
                                </p>
                            </CardDescription>

                            {/* CARD JOGADO/REJOGADO */}
                            <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full`}>
                                {/* {replayed === 'Rejogado' ? 'Rejogado: ✅ Sim' :   'Rejogado: ❌ Não' } */}
                                Para Rejogar: {replayed}
                            </CardDescription>

                        </CardContent>

                    </Card>
                )
                    : steamCardPJ === 'grande' && (
                        <Card className={`flex flex-col w-full min-[400px]:h-[420px] gap-2 
              items-start cursor-pointer border-2 hover:border-4 border-white/50
              hover:border-amber-500 transition-all bg-slate-900 shadow-4xl`}
                            key={id} >

                            <div className="w-full h-3/5 relative">

                                <div className="flex flex-col absolute w-full h-full justify-between items-end">

                                    <div className={`z-25 w-full justify-around items-center md:rounded-t-[12px] shadow-lg hover:bg-white/40
                                 ${uidValidator === 'LmUiBeD97qW9Ft2FzJfnEMHKzXK2' ? 'hidden' : 'flex'}`}>
                                        <Button className='bg-white/60 m-2' onClick={() => deletajooj(id, background_image)}>
                                            <span>
                                                <FaEraser className="h-5 w-5 md:h-6.5 md:w-6.5 text-red-600/80" />
                                            </span>
                                        </Button>
                                        {/* FUNÇÃO DE ABRIR O MODAL */}
                                        < AttGameModalParaJogar gameId={id} data={{ id, name, hours_expected, platform, genre, release_year, status, replayed, priority, background_image }} />
                                    </div>

                                    {/* CARD FILTRO NOME */}
                                    <div className=" z-25  flex justify-center items-center w-full rounded-tr-[12px] md:rounded-tl-[12px] bg-white/70">
                                        <CardTitle className='text-black font-bold text-[11px] md:text-base lg:text-xl border-b-2 w-full'>
                                            {`${name} (${release_year})`}
                                        </CardTitle>
                                    </div>

                                </div>

                                <div className="w-full h-full z-20 absolute">
                                    <Link to={`/home/jogos-para-jogar/${id}`} >
                                        <div className="absolute  w-full h-full rounded-lg shadow-lg  hover:bg-black/20" />

                                        <img
                                            src={background_image}
                                            alt={name}
                                            className='w-full h-full object-cover object-center rounded-t-lg border-b-3 border-emerald-800 hover:border-amber-500'
                                        />
                                    </Link>
                                </div>

                            </div>

                            <CardContent className='h-2/5 w-full p-2 flex flex-col justify-start items-start overflow-auto gap-3'>

                                <div className='flex w-full gap-x-2'>
                                    <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-40 flex justify-center items-end'>
                                        {hours_expected}{Number(hours_expected) <= 1 ? ' hora' : ' horas'}
                                    </CardDescription>

                                    <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full`}>
                                        {/* {replayed === 'Rejogado' ? 'Rejogado: ✅ Sim' :   'Rejogado: ❌ Não' } */}
                                        Para Rejogar: {replayed}
                                    </CardDescription>
                                </div>

                                <div className='flex flex-col 2xl:flex-row w-full gap-3'>

                                    <CardDescription className={`text-white w-full text-[14px] md:text-base border-b-2 flex justify-center 2xl:justify-center items-end `}>
                                        Plataforma:
                                        <span
                                            className={`px-2 font-bold 
                              ${platform === 'Switch' ? 'text-red-600'
                                                    : platform === 'PC' ? 'text-blue-400'
                                                        : platform === 'PSVita' ? 'text-blue-600'
                                                            : platform === '3DS-Emulado' ? 'text-red-400'
                                                                : platform === 'PSP-Emulado' && 'text-purple-800'}`}>
                                            {platform}
                                        </span>
                                    </CardDescription>
                                </div>
                                <CardDescription className='text-white w-full text-[14px] md:text-[15px] border-b-2 flex justify-center items-end '>
                                    Gênero: {genre}
                                </CardDescription>

                                {/* CARD FILTRO PRIORIDADE */}
                                <CardDescription className={`text-white w-full text-[14px] md:text-base border-b-2 flex flex-row justify-center 2xl:justify-center items-end `}>
                                    Prioridade:
                                    <span className={`px-2 font-bold ${priority === '1- Principal' ? 'text-red-600' : priority === '2- Secundário' && 'text-yellow-600'}`}>
                                        {priority}
                                    </span>
                                </CardDescription>
                            </CardContent>
                        </Card >
                    )}

        </div >
    )
}