// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { useExternaGameData, myGames } from './helpers/fetchingGameData.ts'
import type { gameDataInterface, myGamesApiInterface } from './interfaces/gameDataTypes.ts'
import { FaPencilAlt, FaEraser } from "react-icons/fa";

import {
  Card,
  // CardAction,
  CardContent,
  CardDescription,
  // CardFooter,
  // CardHeader,
  CardTitle,
} from "@/components/ui/card"
import FilterComponent from './components/filtragem.tsx'
import { useMemo, useState } from 'react'
import API from './services/gameApiServices.ts'
import { Button } from "@/components/ui/button"
// import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem } from '@mui/material';
// import TextField from '@mui/material/TextField';
import { Spinner } from "@/components/ui/spinner"
import { useQueryClient } from '@tanstack/react-query';
import AddGameModal from './components/modalAddJogo.tsx';
import AttGameModal from './components/modalAttJogo.tsx';

type GamePayload2 = {
  name: string;
  hours_played: number;
  hours_expected: number;
  platform: string;
  genre: string;
  is_completed?: boolean;
  release_year: number;
  status: string;
  year_started: number;
  year_finished: number | null;
  background_image?: string;
};


// function App({name_Prop, hours_played_Prop, platform_Prop, genre_Prop, is_completed_Prop, release_year_Prop, status_Prop, year_started_Prop, year_finished_Prop, background_image_Prop }: GamePayload2) {
function App() {
  // const { data, isError, isFetching } = useExternaGameData()
  const { data, isError, isFetching } = myGames()
  const queryClient = useQueryClient() // <--- novo
  const [filter, setFilter] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria
  const [btnFilter, setBtnFilter] = useState<number>()
  const [nomeOuHora, setNomeOuHora] = useState<string>('Nome')
  const [sortBy, setSortBy] = useState<'name' | 'hours_played'>('name') // novo estado


  const categoryToField: Record<string, string> = {
    'Plataforma': 'platform',   // ajuste se no seu db.json o campo for outro
    'Gênero': 'genre',
    'Status': 'status',
    'Prioridade': 'priority',
  }


  const filteredGames = useMemo(() => {
    const list = (data ?? []) as myGamesApiInterface[]
    const q = filter.trim().toLowerCase() // tira os espaços e depois deixa todas as letras em minusculo

    return list.filter(game => {
      // 1) filtro de texto no nome (se houver)
      if (q && !String(game.name ?? '').toLowerCase().includes(q)) return false

      // 2) aplicar cada filtro selecionado (AND entre filtros)
      for (const [categoria, valor] of Object.entries(selectedFilters)) {
        const field = categoryToField[categoria] ?? null
        if (!field) continue // se não mapeado, ignora (ou trate conforme necessidade)

        const gameValue = (game as any)[field]
        if (gameValue === undefined || gameValue === null) return false

        // compatível com string, array ou número
        if (Array.isArray(gameValue)) {
          // array de strings (ex: gêneros)
          const found = gameValue.some(v => String(v).toLowerCase().includes(valor.toLowerCase()))
          if (!found) return false
        } else {
          // string/number: fazer comparação case-insensitive (contains)
          if (!String(gameValue).toLowerCase().includes(valor.toLowerCase())) return false
        }
      }

      return true
    })
  }, [data, filter, selectedFilters])

  const filterMyGames = (data ?? []).filter((game: myGamesApiInterface) =>
    game.name.toLowerCase().includes(filter.toLowerCase())
    // || game.hours_played
    // || setBtnFilter.toLowerCase().includes(filter.toLowerCase())
    //   || game.released.toLowerCase().includes(filter.toLowerCase())
    //   || game.released.substring(0, 4).toLowerCase().includes(filter.toLowerCase()),
    //   setTimeout(() => { }, 1000),
  )
  async function deletaJooj(id: string) {
    const deleted = await API.deletarJogo(id)

    // <--- invalida a query e força refetch automático
    queryClient.invalidateQueries({ queryKey: ['meu joojs'] })

    return deleted
  }

  // Ordena os jogos filtrados conforme sortBy
  const sortedGames = useMemo(() => {
    const arr = [...filteredGames]
    if (sortBy === 'name') {
      arr.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'hours_played') {
      arr.sort((a, b) => Number(b.hours_played) - Number(a.hours_played))
    }
    return arr
  }, [filteredGames, sortBy])

  return (
    <main className='w-full min-h-screen flex flex-col items-center bg-gray-800'>

      <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3>
      <AddGameModal />
      <FilterComponent value={filter} onChange={setFilter} onFiltersChange={setSelectedFilters} onSortChange={setSortBy} />
      {/* <FilterComponent value={filter} onChange={setFilter} /> */}

      {/* <div className='w-4/5 h-full flex justify-center items-center bg-blue-100'> */}
      {isFetching ? (
        <div className='flex justify-center items-center h-[99vh]'>
          <Button disabled size="sm">
            <Spinner />
            Loading...
          </Button></div>
      ) : isError ? (
        <p className='text-white'>Serviço não pegou os dados</p>
      ) : (
        <>
          {/* <div className='flex flex-col justify-start min-h-screen w-full'> */}

          <div className='grid grid-cols-4 gap-8 py-6 px-4 w-11/12 min-h-screen'>
            {sortedGames.map((game: myGamesApiInterface) => (

              <Card className='w-full h-[500px] gap-2 flex flex-col items-start cursor-pointer border-2 hover:border-4 border-white/50 hover:border-amber-500 transition-all bg-slate-900 shadow-4xl' key={game.id}>

                <div className="absolute bg-black/20 z-10  rounded-lg shadow-lg  hover:bg-gray-600">
                  <Button className='bg-white/60 m-2' onClick={() => deletaJooj(game.id!)}>
                    <span>
                      <FaEraser className="h-6.5 w-6.5 text-red-600/80" />
                    </span>
                  </Button>
                  {/* COLOCAR AQUI A FUNÇÃO DE ABRIR O MODAL */}
                  <AttGameModal gameId={game.id} data={game} />
                </div>

                <img
                  src={game.background_image}
                  alt={game.name}
                  className='w-full h-[60%] object-cover object-center rounded-t-lg border-b-3 border-emerald-800 hover:border-amber-500'
                />

                <CardContent className='h-[40%] w-full p-2 flex flex-col justify-start items-start overflow-auto gap-3'>

                  <CardTitle className='text-white text-[14px] md:text-base border-b-2 w-full'>{game.name}</CardTitle>
                  <div className='flex w-full gap-x-2'>
                    <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-40 flex justify-center items-end'>{game.hours_played}{Number(game.hours_played) <= 1 ? ' hora' : ' horas'} </CardDescription>
                    <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-full flex justify-center items-end '>Gênero: {game.genre}</CardDescription>
                  </div>

                  <div className='flex flex-col 2xl:flex-row w-full gap-3'>

                    <CardDescription className={`text-white text-[14px] md:text-base border-b-2 flex flex-row} justify-center 2xl:justify-start items-end `}>
                      Plataforma:
                      <p
                        className={`px-2 font-bold 
                              ${game.platform === 'Switch' ? 'text-red-600'
                            : game.platform === 'PC' ? 'text-blue-400'
                              : game.platform === 'PSVita' ? 'text-blue-600'
                                : game.platform === '3DS-Emulado' ? 'text-red-400'
                                  : game.platform === 'PSP-Emulado' && 'text-purple-800'}`}>
                        {game.platform}
                      </p>
                    </CardDescription>

                    {/* Aqui era baseado no "is_complete", foi mudado para o valor do status */}
                    {/* <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full
                         ${game.is_completed === true ? 'text-green-400'
                        : 'text-red-300'}`}>
                      Status: {game.status}
                    </CardDescription> */}
                    <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full
                         ${game.status === 'Finalizado' ? 'text-green-400'
                        : game.status === 'Pausado' ? 'text-red-300'
                          : game.status === 'Jogando' ? 'text-yellow-300'
                            : game.status === 'Não Iniciado' && 'text-white'}`}>
                      Status: {game.status === 'Finalizado' ? `✅ ${game.status}  (${game.year_finished})` : game.status === 'Pausado' ? `${game.status} ⏸️` : game.status === 'Jogando' ? `${game.status} 🎮` : `${game.status}`}
                    </CardDescription>

                  </div>

                  <CardDescription className={`text-white text-[14px] md:text-base border-b-2 flex flex-row justify-center  2xl:justify-start items-end `}>
                    Prioridade:
                    <span className={`font-bold ${game.priority === '1- Principal' ? 'text-red-600' : game.priority === '2- Secundário' && 'text-yellow-600'}`}>
                      {game.priority}
                    </span>
                  </CardDescription>
                </CardContent>
              </Card>

            ))}
          </div>
          {/* </div> */}
        </>
      )}
      {/* </div> */}

    </main>

  )
}

export default App
