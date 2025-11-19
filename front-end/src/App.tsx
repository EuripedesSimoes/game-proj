// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { useExternaGameData, myGames } from './helpers/fetchingGameData.ts'
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
import AddGame from './components/formAddGame.tsx'
import API from './services/gameApiServices.ts'

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


  // PASSAR PARA O ARQUIVO formAddGame.tsx 
  const [addjogo, setAddjogo] = useState<string>('')
  const [hours_played, setHours_played] = useState<number>(0)
  const [hours_expected, setHours_expected] = useState<number>(0)
  const [platform, setPlatform] = useState<string>('')
  const [genre, setGenre] = useState<string>('')
  // const [is_completed, setIs_completed] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')
  const [release_year, setRelease_year] = useState<number>(0)
  const [year_started, setYear_started] = useState<number>(0)
  const [year_finished, setYear_finished] = useState<number>(0)
  const [background_image, setBackground_image] = useState<string>('')


  // PASSAR PARA O ARQUIVO formAddGame.tsx 
  async function enviarJogo(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    const payload: GamePayload2 = {
      name: addjogo, //'Octopath Traveler',
      hours_played: hours_played, //86
      hours_expected: hours_expected, //60,
      platform: platform, //'Switch',
      genre: genre, // 'JPRG',
      //is_completed: is_completed , //false,
      release_year: release_year, // 2017,
      status: status, //'In Progress',
      year_started: year_started, //2024,
      year_finished: year_finished, //null,
      background_image: background_image, //''
    }
    const saved = await API.salvarJogo(payload)
    return saved
  }
  
  async function deletaJooj(id: number) {
    const deleted = await API.deletarJogo(id)
    return deleted
  }

  return (
    <main className='w-full min-h-screen flex flex-col items-center bg-gray-800'>
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3>

        <div className='bg-gray-300 w-full h-full'>
          <form action="" className='gap-8 '>
            <label htmlFor='name' >Nome do jogo</label>
            <input type="text" name="name" id="name" value={addjogo} onChange={(e) => { setAddjogo(e.target.value) }} />

            <label htmlFor='hours_played' >Horas jogadas</label>
            <input type="number" name="hours_played" id="hours_played" value={hours_played} onChange={(e) => setHours_played(parseInt(e.target.value))} />
            <label htmlFor='hours_expected' >Horas Experadas</label>
            <input type="number" name="hours_expected" id="hours_expected" value={hours_expected} onChange={(e) => setHours_expected(parseInt(e.target.value))} />

            <label htmlFor='platform' >Plataforma</label>
            <input type="text" name="platform" id="platform" value={platform} onChange={(e) => { setPlatform(e.target.value) }} />
            <label htmlFor='genre' >Gênero</label>
            <input type="text" name="genre" id="genre" value={genre} onChange={(e) => { setGenre(e.target.value) }} />
            <label htmlFor='status' >Status</label>
            <input type="text" name="status" id="status" value={status} onChange={(e) => { setStatus(e.target.value) }} />

            {/* <label htmlFor='is_completed' >Foi finalizado?</label> */}
            {/* <input type="text" name="is_completed" id="is_completed" value={is_completed} onChange={(e) => { setIs_completed(e.target.value) }} /> */}

            <label htmlFor='release_year' >Ano Lançamento</label>
            <input type="number" name="release_year" id="release_year" value={release_year} onChange={(e) => setRelease_year(parseInt(e.target.value))} />
            <label htmlFor='year_started' >Ano Iniciado</label>
            <input type="number" name="year_started" id="year_started" value={year_started} onChange={(e) => setYear_started(parseInt(e.target.value))} />
            <label htmlFor='year_finished' >Ano Finalizado</label>
            <input type="number" name="year_finished" id="year_finished" value={year_finished} onChange={(e) => setYear_finished(parseInt(e.target.value))} />


            <label htmlFor='background_image' >background_image</label>
            <input type="text" name="background_image" id="background_image" value={background_image} onChange={(e) => { setBackground_image(e.target.value) }} />

            <input type="text" value='a' />
            <Button type="submit" onClick={enviarJogo}>+ ADD Jooj</Button>
          </form>
        </div>

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
        <p className='text-white'>Serviço não pegou os dados</p>
      ) : (
        <>
          {/* <div className='flex flex-col justify-start min-h-screen w-full'> */}

          <div className='grid grid-cols-4 gap-8 py-6 px-4 w-11/12 min-h-screen'>
            {filteredGames.map((game: myGamesApiInterface) => (

              <Card className='w-full h-[500px] gap-2 flex flex-col items-start cursor-pointer border-2 hover:border-4 border-white/50 hover:border-amber-500 transition-all bg-slate-900 shadow-4xl' key={game.id}>

                <button className="absolute bg-black/20 z-10  rounded-lg shadow-lg  hover:bg-gray-600">
                  <span onClick={() => deletaJooj(game.id!)}>
                    <FaEraser className="h-6.5 w-6.5 text-red-600/80" />
                  </span>
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
