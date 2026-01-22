import './App.css'
// import { useExternaGameData, myGames } from './helpers/fetchingGameData.ts'
// import API from './services/gameApiServices.ts'

import type { gameDataInterface, myGamesApiInterface } from './interfaces/gameDataTypes.ts'

import FilterComponent from './components/filtragem.tsx'
import { useEffect, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
// import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem } from '@mui/material';
// import TextField from '@mui/material/TextField';
import { Spinner } from "@/components/ui/spinner"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AddGameModal from './components/jogados/modalAddJogo.old.tsx';
import CardComponent from './components/jogados/cardComponent.tsx';
import { getFirestore, getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import ZodAddGameModal from './components/jogados/ZODmodalAddJogo.tsx';
import { firebaseApp } from './services/firebaseConfig.ts';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebaseConfig';

export default function App() {
  // const { data, isError, isFetching } = useExternaGameData()
  // const { data, isError, isFetching } = myGames() db.json
  const [filter, setFilter] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria
  const [sortBy, setSortBy] = useState<'name' | 'hours_played'>('name') // novo estado


  const queryClient = useQueryClient()
  const db = getFirestore(firebaseApp)
  //const jogosColeRef = collection(db, 'joojs') // referência à coleção 'jogos-para-jogar' no Firestore

  // 1. Obter o usuário logado
  const [user] = useAuthState(auth);; // Assume que useAuth() retorna o objeto de usuário

  if (!user?.uid) {
    return;
  }

  // 2. Criar a referência da subcoleção
  // collection(db, 'users', user.uid, 'joojs') aponta para users/{uid}/joojs
  const userJogosCollectionRef = collection(db, 'users', user.uid, 'jogos');

  // Função para buscar jogos usando React Query
  const fetchJogosFB = async () => {
    try {
      const data = await getDocs(userJogosCollectionRef)
      return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    } catch (err) {
      console.error('Erro ao buscar jogos do Firebase:', err)
      throw err
    }
  }

  // useQuery para gerenciar o estado e cache dos jogos
  const { data: data = [], isLoading: isFetching, isError } = useQuery({
    queryKey: ['users', user.uid, 'jogos'],
    queryFn: fetchJogosFB,
  })

  async function fbDeletajooj(id: string) {
    if (!user?.uid) {
      return;
    }
    await deleteDoc(doc(userJogosCollectionRef, id))
    // Invalidar a query para forçar um refetch automático
    queryClient.invalidateQueries({ queryKey: ['users', user.uid, 'jogos'] })
  }

  //   async function deletaJooj(id: string) {'users', user.uid, 'jogos'
  //   // const deleted = await API.deletarJogo(id)
  //   // <--- invalida a query e força refetch automático
  //   queryClient.invalidateQueries({ queryKey: ['joojs'] })
  //   // return deleted
  // }

  const categoryToField: Record<string, string> = {
    'Plataforma': 'platform',   // ajustar se no db.json o campo for outro
    'Gênero': 'genre',
    'Status': 'status',
    'Prioridade': 'priority',
    'Rejoga(n)do?': 'replayed',
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

  // const filterMyGames = (data ?? []).filter((game: myGamesApiInterface) =>
  //   game.name.toLowerCase().includes(filter.toLowerCase())
  // || game.hours_played
  // || setBtnFilter.toLowerCase().includes(filter.toLowerCase())
  //   || game.released.toLowerCase().includes(filter.toLowerCase())
  //   || game.released.substring(0, 4).toLowerCase().includes(filter.toLowerCase()),
  //   setTimeout(() => { }, 1000),
  // )


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
      <ZodAddGameModal />
      <FilterComponent value={filter} onChange={setFilter} onFiltersChange={setSelectedFilters} onSortChange={setSortBy} isGameReplayed={true} />
      {/* <FilterComponent value={filter} onChange={setFilter} /> */}

      {/* <div className='w-4/5 h-full flex justify-center items-center bg-blue-100'> */}
      {isFetching ? (
        <div className='flex justify-center items-center h-[99vh]'>
          <Button disabled size="sm">
            <Spinner />
            Loading...
          </Button>
        </div>
      ) : isError ? (
        <p className='text-white'>Serviço não pegou os dados</p>
      ) : (
        <>
          {/* <div className='flex flex-col justify-start min-h-screen w-full'> */}

          <div className='grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 py-6 px-4 w-11/12 min-h-screen'>
            {sortedGames.map((game: myGamesApiInterface) => (
              <>
                <CardComponent
                  id={game.id}
                  name={game.name}
                  hours_played={game.hours_played !== '' ? game.hours_played : '0'}
                  hours_expected={game.hours_expected !== '' ? game.hours_expected : '0'}
                  priority={game.priority}
                  platform={game.platform}
                  genre={game.genre}
                  status={game.status}
                  replayed={game.replayed}
                  release_year={game.release_year}
                  year_started={game.year_started !== '' ? game.year_started : '0'}
                  year_finished={game.year_finished !== '' ? game.year_finished : '0'}
                  background_image={game.background_image}
                  deletajooj={fbDeletajooj}
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

