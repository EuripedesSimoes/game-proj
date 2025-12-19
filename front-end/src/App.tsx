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
import { useEffect, useMemo, useState } from 'react'
import API from './services/gameApiServices.ts'
import { Button } from "@/components/ui/button"
// import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem } from '@mui/material';
// import TextField from '@mui/material/TextField';
import { Spinner } from "@/components/ui/spinner"
import { useQueryClient } from '@tanstack/react-query';
import AddGameModal from './components/modalAddJogo.tsx';
import AttGameModal from './components/modalAttJogo.tsx';

// import { dbFirebase } from '../firebaseConfig.ts';


// import { initializeApp } from "firebase/app";
// import { getFirestore } from 'firebase/firestore';

// import { getDocs } from "firebase-admin/firestore";
// import { dbFirebase } from '../firebaseConfig.ts';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//getFirestore: olha a aplicação, olhas as chaves secretas do firebaseCoonfig e repassa pro Firestore se tem permissão de admin para acessar o banco de dados
import { getFirestore, getDocs, collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import CardComponent from './components/cardComponent.tsx';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
  authDomain: "my-game-list-6fd0f.firebaseapp.com",
  projectId: "my-game-list-6fd0f",
  // storageBucket: "my-game-list-6fd0f.firebasestorage.app",
  // messagingSenderId: "982341506588",
  // appId: "1:982341506588:web:ac89acb8295ac1c78531d9"
};

const firebaseApp = initializeApp(firebaseConfig);

// const dbFirebase = getFirestore(firebaseApp);

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

// function App({name_Prop, hours_played_Prop, platform_Prop, genre_Prop, is_completed_Prop, release_year_Prop, status_Prop, year_started_Prop, year_finished_Prop, background_image_Prop }: GamePayload2) {
export default function App() {
  // const { data, isError, isFetching } = useExternaGameData()
  const { data, isError, isFetching } = myGames()
  const queryClient = useQueryClient() // <--- novo
  const [filter, setFilter] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria
  const [sortBy, setSortBy] = useState<'name' | 'hours_played'>('name') // novo estado

  const db = getFirestore(firebaseApp)
  const joojsColeRef = collection(db, 'joojs')
  const [users, setUsers] = useState<Array<Record<string, any> & { id: string }>>([])

  async function fbAddjooj() {
    const fbNovoJooj: GamePayload2 = {
      name: 'Novo Jooj Firebase',
      hours_played: 20,
      hours_expected: 30,
      platform: 'Switch',
      genre: 'Ação',
      release_year: 2025,
      status: 'Em Andamento',
      year_started: 2025,
      year_finished: 2025,
    };
    await addDoc(joojsColeRef, fbNovoJooj);
  }
  async function fbDeletajooj(id: string) {
    await deleteDoc(doc(db, 'joojs', id))
  }

  useEffect(() => {
    const todosjogos = async () => {
      const data = await getDocs(joojsColeRef)
      console.log('1- Jogos do Firebase:', data.docs.map(doc => doc.data()));
      console.log('2- Jogos do Firebase2:', data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      console.log('Jogos do Firebase DATA:', data);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    todosjogos()
  }, [])

  // const joojsCollection = dbFirebase.collection('meu joojs');
  // useEffect(() => {
  //   const getJoojsFirebase = async () => {
  //     const data = await joojsCollection.get()
  //     const jogos = data.docs.map(doc => doc.data())
  //     // setJoojs(jogos)
  //     console.log('Jogos do Firebase:', jogos);
  //   }
  //   getJoojsFirebase()
  // }, [])

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
      <div className='grid grid-cols-4 gap-8 py-6 px-4 w-11/12 min-h-screen'>
        {users.map(user => {
          return (
            <CardComponent id={user.id}
              name={user.name}
              hours_played={user.hours_played != null ? Number(user.hours_played) : null}
              platform={user.platform}
              genre={user.genre}
              status={user.status}
              year_started={user.year_started != null ? Number(user.year_started) : null}
              year_finished={user.year_finished != null ? Number(user.year_finished) : null}
              background_image={user.background_image}
              deletajooj={deletaJooj}
            />
          )
        })}
      </div>
      <button onClick={fbAddjooj}>Adicionar no Firebase</button>
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
              <>
                <CardComponent
                  id={game.id}
                  name={game.name}
                  hours_played={game.hours_played != null ? Number(game.hours_played) : null}
                  platform={game.platform}
                  genre={game.genre}
                  status={game.status}
                  year_started={game.year_started != null ? Number(game.year_started) : null}
                  year_finished={game.year_finished != null ? Number(game.year_finished) : null}
                  background_image={game.background_image}
                  deletajooj={deletaJooj}

                />
              </>

            ))}
          </div>
          {/* </div> */}
        </>
      )}
      {/* </div> */}

    </main>

  )
}

