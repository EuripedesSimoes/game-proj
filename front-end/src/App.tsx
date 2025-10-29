// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { useGameData, myGames } from './helpers/fetchingGameData.ts'
import type { gameDataInterface, myGamesApiInterface } from './interfaces/gameData.ts'
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
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

function App() {
  // const { data, isError, isFetching } = useGameData()
  const { data, isError, isFetching } = myGames()
  const [filter, setFilter] = useState('')
  const [btnFilter, setBtnFilter] = useState<number>()
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria

  const categoryToField: Record<string, string> = {
    'Plataforma': 'platform',   // ajuste se no seu db.json o campo for outro
    'Gênero': 'genre',
    'Status': 'status',
    'Prioridade': 'priority',
  }

  const filteredGames = useMemo(() => {
    const list = (data ?? []) as myGamesApiInterface[]
    const q = filter.trim().toLowerCase()

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

  return (
    <main className='w-full min-h-screen flex flex-col items-center bg-gray-800'>
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3>
        {/* <FilterComponent value={filter} onChange={setFilter} /> */}
        <FilterComponent value={filter} onChange={setFilter} onFiltersChange={setSelectedFilters} />
      </div>

      {/* <div className='w-4/5 h-full flex justify-center items-center bg-blue-100'> */}
      {isFetching ? (
        <div className='flex justify-center items-center h-[99vh]'>
          <Button disabled size="sm">
            <Spinner />
            Loading...
          </Button></div>
      ) : isError ? (
        <p>Error fetching data</p>
      ) : (
        <>
          {/* <div className='flex flex-col justify-start min-h-screen w-full'> */}

          <div className='grid grid-cols-4 gap-8 py-6 px-4 w-11/12 min-h-screen'>
            {filteredGames.map((game: myGamesApiInterface) => (

              <Card className='w-full h-[500px] gap-2 flex flex-col items-start cursor-pointer border-2 hover:border-4 border-white/50 hover:border-amber-500 transition-all bg-slate-900 shadow-4xl' key={game.id}>

                <button className="absolute bg-black/20 z-10  rounded-lg shadow-lg  hover:bg-gray-600">
                  <FaEraser className="h-6.5 w-6.5 text-red-600/80" />
                  <FaPencilAlt className="h-6.5 w-6.5 text-white/80" />
                </button>

                <img
                  src={game.background_image}
                  alt={game.name}
                  className='w-full h-[60%] object-cover object-center rounded-t-lg border-b-3 border-emerald-800 hover:border-amber-500'
                />

                <CardContent className='h-[40%] w-full p-2 flex flex-col justify-start items-start overflow-auto gap-3'>

                  <CardTitle className='text-white text-[14px] md:text-base border-b-2 w-full'>{game.name}</CardTitle>
                  <div className='flex w-full gap-x-2'>
                    <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-40 flex justify-center items-end'>{game.hours_played} horas</CardDescription>
                    <CardDescription className='text-white text-[14px] md:text-base border-b-2 w-full flex justify-center items-end '>Gênero: {game.genre}</CardDescription>
                  </div>

                  <div className='flex flex-col 2xl:flex-row w-full  gap-3'>

                    <CardDescription className={`text-white text-[14px] md:text-base border-b-2 flex flex-row} justify-center  2xl:justify-start items-end `}>
                      Plataforma:
                      <p
                        className={`px-2 font-bold 
                              ${game.platform === 'Switch' ? 'text-red-600'
                            : game.platform === 'PC' ? 'text-blue-400'
                              : game.platform === 'PSVita' ? 'text-blue-600'
                                : game.platform === '3DS-Emulado' || game.platform === 'PSP-Emulado' && 'text-purple-800'}`}>
                        {game.platform}
                      </p>
                    </CardDescription>

                    <CardDescription className={`text-white text-[14px] md:text-base font-bold border-b-2 flex justify-center items-end w-full
                         ${game.is_completed === true ? 'text-green-400'
                        : 'text-red-300'}`}>
                      Status: {game.status}
                    </CardDescription>

                  </div>
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
