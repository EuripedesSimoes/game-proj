import './App.css'
// import { useExternaGameData, myGames } from './helpers/fetchingGameData.ts'
// import API from './services/gameApiServices.ts'

// import type { gameDataInterface, myGamesApiInterface } from './interfaces/gameDataTypes.ts'
// import AddGameModal from './components/jogados/modalAddJogo.old.tsx';
import type { myGamesApiInterface } from './interfaces/gameDataTypes.ts'

import FilterComponent from './components/filtragem.tsx'
import { useEffect, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"


import { useQuery, useQueryClient } from '@tanstack/react-query'
import CardComponent from './components/jogados/cardComponent.tsx';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import ZodAddGameModal from './components/jogados/ZODmodalAddJogo.tsx';
import { db } from './services/firebaseConfig.ts';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebaseConfig';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { FaBorderStyle } from 'react-icons/fa'

export default function App() {
  // const { data, isError, isFetching } = useExternaGameData()
  // const { data, isError, isFetching } = myGames() db.json
  const [filter, setFilter] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria
  const [sortBy, setSortBy] = useState<'name' | 'hours_played'>('name')

  // Persistir preferência do tipo de card no localStorage (evita reset ao recarregar a página)
  const [steamCard, setSteamCard] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('steamCard')
      return stored ? JSON.parse(stored) : true
    } catch (e) {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('steamCard', JSON.stringify(steamCard))
    } catch (e) {
      // ignore
    }
  }, [steamCard])

  // chave para forçar um remount dos cards quando o usuário pedir
  const [cardsKey, setCardsKey] = useState(0)

  const queryClient = useQueryClient()
  //const jogosColeRef = collection(db, 'joojs') // referência à coleção 'jogos-para-jogar' no Firestore
  // 1. Obter o usuário logado
  const [user] = useAuthState(auth);; // Assume que useAuth() retorna o objeto de usuário

  const uid = user?.uid === 'LmUiBeD97qW9Ft2FzJfnEMHKzXK2' ? '9bq3f6a85uOLefSCso61qtc4Hi33' : user?.uid;
  // 1.2. Criar a referência da subcoleção APENAS se o user existir
  const userJogosCollectionRef = uid
    ? collection(db, 'users', uid, 'jogos')
    : null;

  // Função para buscar jogos usando React Query
  const fetchJogosFB = async () => {
    if (!userJogosCollectionRef) return [];
    const snapshot = await getDocs(userJogosCollectionRef);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  };

  // 3. O useQuery DEVE ser chamado no topo, sem condicionais antes dele.
  // Usamos o 'enabled' para ele só rodar quando o uid estiver disponível.
  // Opções para evitar refetchs automáticos indesejados e peguei a função `refetch` para recarregar manualmente quando necessário.
  const { data: data = [], isLoading: isFetching, isError, refetch } = useQuery({
    queryKey: ['users', uid, 'jogos'],
    queryFn: fetchJogosFB,
    enabled: !!uid, // Importante: a query só "acorda" quando tem usuário
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
  });

  // 4. Função para deletar imagem do Storage
  async function fbDeletaImagemStorage(imageUrl: string) {
    if (!imageUrl) return; // Se não houver URL, não faz nada

    try {
      // Converte a URL em uma referência do Storage
      const storage = getStorage();
      const imagemRef = ref(storage, imageUrl);

      // Deleta a imagem
      await deleteObject(imagemRef);
      console.log('Imagem deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar imagem do Storage:', error);
      // Continua mesmo se a imagem não for encontrada
    }
  }

  // 5. Função de delete modificada para deletar jogo e imagem
  async function fbDeletajooj(id: string, backgroundImage?: string) {
    if (!userJogosCollectionRef) return;

    // Deleta a imagem do Storage se existir
    if (backgroundImage) {
      await fbDeletaImagemStorage(backgroundImage);
    }

    // Deleta o documento do Firestore
    await deleteDoc(doc(userJogosCollectionRef, id));
    queryClient.invalidateQueries({ queryKey: ['users', uid, 'jogos'] });
  }

  //   async function deletaJooj(id: string) {'users', uid, 'jogos'
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
  // console.log('uid', user?.uid)

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
  // || game.hours_played,
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
    <main className='flex flex-col w-full pt-4 min-h-screen items-center bg-gray-800'>

      {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}

      <div className='flex gap-4 m-1'>
        <Button type="button" onClick={() => setSteamCard(prev => !prev)} className='bg-blue-500'> <FaBorderStyle /> Estilo do Card </Button>
        <Button type="button" onClick={() => { refetch(); setCardsKey(k => k + 1); }} >Recarregar cartas</Button>
        <ZodAddGameModal />
      </div>

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

          <div key={cardsKey} className={` flex flex-col  ${steamCard ? '  min-[520px]:grid min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 '
            : ' min-[520px]:grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 '} gap-8 py-6 px-4 w-11/12 min-h-screen`}>
            {sortedGames.map((game: myGamesApiInterface) => (
              <div key={game.id}>
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
                  steamCard={steamCard}
                  // uidValidator={'uid' in game ? uid! : 'sem-uid'} // Passa o uid para o card, ou um valor padrão se não existir
                  uidValidator={user?.uid!}
                />
              </div>

            ))}
          </div>
          {/* </div> */}
        </>
      )}
      {/* </div> */}

    </main>

  )
}

