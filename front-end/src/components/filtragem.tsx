import React, { useEffect } from 'react';
import { FaSearch, FaTrashAlt, FaTrashRestoreAlt, FaTrashRestore, FaTrash } from "react-icons/fa";
import { useState } from 'react'
import { myGames } from '@/helpers/fetchingGameData';
// import '../App.css'

//Props da API do RAWG
type Props = {
    classnameFilter?: string,
    value: string,
    onChange: (v: string) => void,
    className?: string,
    onFiltersChange?: (f: Record<string, string>) => void, // <--- novo prop opcional
}

// const filtros = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Puzzle']

//Principais filtros que não precisam de mais de 1 filtro / Serão apenas ordenações do que está renderizado: 
// 'Nome', 'Quant. Horas', Esses aqui um tem que desativar o outro
// 'PC', 'Portátil', Esses aqui um tem que desativar o outro, está para fazer depois
//PC ou Portátil só pode 1 só, se 1 estiver ativo o outro desativa, pois PC é PC e portatil pode ser 

//Secundários filtros que precisam mostrar mais de 1 filtro / Serão para renderizar na tela: 
//  'Plataforma', 'Gênero', 'Status', 'Prioridade

// Plataforma: 'PC', 'Switch', 'Ps Vita', '3ds-Emulado', 'PSP-Emulado'
// Gênero: 'Ação', 'Aventura', 'RPG', 'JRPG', 'Estratégia', 'Metroidvania', 'Plataforma', 'Esportes', 'Puzzle', 'FPS', 'Soulslike', 'Corrida', 'Simulação'
// Ano de Lançamento dá pra deixar pra depois
// Status: 'Finalizado', 'Em Andamento', 'Pausado', 'Abandonado'
// Prioridade: '1ª Prioridade - Goats','2ª Prioridade - Alta', '3ª Prioridade - Média', '4ª Prioridade - Baixa, talvez algum dia', '5ª Prioridade - pelo nome, talvez'
const filtros = ['Nome', 'Quant. Horas',]

const filtrosSelect =
    [
        { categoria: 'Plataforma', opcoes: ['PC', 'Switch', 'PsVita', '3DS-Emulado', 'PSP-Emulado'] },
        { categoria: 'Gênero', opcoes: ['Ação', 'Aventura', 'RPG', 'JRPG', 'Estratégia', 'Esportes', 'Puzzle', 'FPS', 'Soulslike', 'Corrida', 'Simulação'] },
        { categoria: 'Status', opcoes: ['Finalizado', 'Jogando', 'Pausado', 'Abandonado', 'Não iniciado'] },
        { categoria: 'Prioridade', opcoes: ['Alta', 'Média', 'Baixa'] },
    ];

export default function FilterComponent({ classnameFilter, value, onChange, className, onFiltersChange }: Props) {
    // estado separado por categoria -> controlado
    const [selecionados, setSelecionados] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        filtrosSelect.forEach(f => init[f.categoria] = '');
        return init;
    });

    // log formatado quando houver mudanças (mostra apenas categorias com valor)
    useEffect(() => {
        const preenchidos = Object.entries(selecionados).filter(([, v]) => v);
        if (preenchidos.length > 0) {
            const obj = Object.fromEntries(preenchidos);
            console.log(obj); // ex: { Plataforma: 'PC', Gênero: 'Ação', ... }
        } else {
            console.log('Nenhuma opção selecionada');
        }

        // avisa o pai sobre as seleções ativas
        if (onFiltersChange) onFiltersChange(Object.fromEntries(preenchidos));

    }, [selecionados, onFiltersChange]);

    function handleSelectChange(categoria: string, valor: string) {
        setSelecionados(prev => ({ ...prev, [categoria]: valor }));
    }

    function handleReset() {
        const cleared: Record<string, string> = {};
        filtrosSelect.forEach(f => cleared[f.categoria] = '');
        setSelecionados(cleared);
        onChange(''); // opcional: limpa também o input de busca
    }

    return (
        <>
            <div className={` flex justify-end p-2 w-full h-full ${classnameFilter} bg-black`}>
                <div className={` grid grid-cols-7 justify-end gap-3 p-2 mr-2 w-full h-full border-white border-2 text-sm rounded-xl`}>

                    {filtros.map((filtro) => (
                        <button key={filtro} onClick={() => onChange(filtro)} className=' bg-[#1a1a1a] text-white rounded-xl hover:bg-gray-700/60 transition-colors'>{filtro}</button>
                    ))}

                    {filtrosSelect.map(({ categoria, opcoes }) => (
                        <div key={categoria}>
                            <select
                                value={selecionados[categoria] ?? ''}
                                onChange={(e) => handleSelectChange(categoria, e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 text-white focus:ring-blue-500"
                            >
                                <option value="" className="bg-black" disabled>{categoria}</option>
                                {opcoes.map((opcao) => (
                                    <option key={`${categoria}-${opcao}`} value={opcao} className='bg-black'>
                                        {opcao}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}

                    <button onClick={handleReset} className='h-full flex items-baseline justify-center gap-1 bg-red-500 text-white rounded-xl px-3'>
                        <FaTrash className=''></FaTrash>
                        Resetar
                    </button>
                </div>

                <div className='w-72 flex items-center border-2 border-white rounded-2xl'>
                    <label htmlFor="searchGame" className='pr-1 pl-3 flex items-center'>
                        <FaSearch className='fill-white' />
                    </label>
                    <input type="search"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        id='searchGame' placeholder='Pesquisar'
                        className='px-2 py-2 w-full half-border-bottom outline-0 text-white placeholder-white/50' />
                </div>
            </div>
        </>
    )
}