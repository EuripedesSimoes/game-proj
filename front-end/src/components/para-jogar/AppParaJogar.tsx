import type { myGamesApiInterface } from '@/interfaces/gameDataTypes';

import FilterComponent from '../filtragem';
import { Button } from "@/components/ui/button"
import { Spinner } from '../ui/spinner';

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';

import AddGameModalParaJogar from './modalAddJogoParaJogar';
import CardComponentParaJogar from './cardComponentParaJogar';
import SteamHoverCard from '../SteamHoverCard';

import { auth, db } from '@/services/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { FaBorderStyle } from 'react-icons/fa';

type CardSize = 'grande' | 'médio' | 'pequeno' | 'steam';

export default function AppParaJogar() {

    const [steamCardPJ, setSteamCardPJ] = useState<CardSize>(() => {
        try {
            const stored = localStorage.getItem('steamCardPJ');

            // Verificamos se o valor existe e se é uma das opções válidas
            if (stored) {
                const parsed = JSON.parse(stored) as CardSize;
                const validSizes: CardSize[] = ['grande', 'médio', 'pequeno', 'steam'];

                return validSizes.includes(parsed) ? parsed : 'médio';
            }

            return 'médio'; // Valor padrão inicial
        } catch (e) {
            return 'médio';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('steamCardPJ', JSON.stringify(steamCardPJ))
        } catch (e) {
            // ignore
        }
    }, [steamCardPJ])

    const alterarTamanhoCard = () => {
        // Mapeamos: "se for atual, o próximo é X"
        const proximos: Record<CardSize, CardSize> = {
            pequeno: 'médio',
            médio: 'grande',
            grande: 'steam',
            steam: 'pequeno'
        };

        // Pegamos o próximo baseado no valor atual
        setSteamCardPJ(prev => proximos[prev]);
    }

    const [cardsKey, setCardsKey] = useState(0)

    const queryClient = useQueryClient()
    // 1. Obter o usuário logado
    const [user] = useAuthState(auth); // Assume que useAuth() retorna o objeto de usuário
    const uid = user?.uid === 'LmUiBeD97qW9Ft2FzJfnEMHKzXK2' ? '9bq3f6a85uOLefSCso61qtc4Hi33' : user?.uid;

    // 1.2. Criar a referência da subcoleção APENAS se o user existir
    const userJogosParaJogarCollectionRef = uid
        ? collection(db, 'users', uid, 'jogos-para-jogar')
        : null;
    // Função para buscar jogos usando React Query
    const fetchJogosParaJogar = async () => {
        if (!userJogosParaJogarCollectionRef) return [];
        const snapshot = await getDocs(userJogosParaJogarCollectionRef);
        return snapshot.docs.map((doc) => {
            const game = doc.data();
            return {
                ...game,
                id: doc.id,
                background_image: game.background_image ?? '',
            };
        });
    };

    // 3. O useQuery DEVE ser chamado no topo, sem condicionais antes dele.
    // Usamos o 'enabled' para ele só rodar quando o user.uid estiver disponível.
    // Opções para evitar refetchs automáticos indesejados e peguei a função `refetch` para recarregar manualmente quando necessário.
    const { data: data = [], isLoading: isFetching, isError, refetch } = useQuery({
        queryKey: ['users', uid, 'jogos-para-jogar'],
        queryFn: fetchJogosParaJogar,
        enabled: !!uid, // Importante: a query só "acorda" quando tem usuário
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 60 * 1000,
    });

    // 4. Função para deletar imagem do Storage
    async function fbDeletaImagemStorage(imageUrl: string) {
        if (!imageUrl) return;

        try {
            // Converte a URL em uma referência do Storage
            const storage = getStorage();
            const imagemRef = ref(storage, imageUrl);
            // Deleta a imagem
            await deleteObject(imagemRef);
            console.log('Imagem deletada com sucesso');
        } catch (error) {
            console.error('Erro ao deletar imagem do Storage:', error);
        }
    }

    // 5. Função de delete modificada para deletar jogo e imagem
    async function fbDeletajooj(id: string, backgroundImage?: string) {
        if (!userJogosParaJogarCollectionRef) return;

        // Deleta a imagem do Storage se existir
        if (backgroundImage) {
            await fbDeletaImagemStorage(backgroundImage);
        }

        await deleteDoc(doc(userJogosParaJogarCollectionRef, id));
        queryClient.invalidateQueries({ queryKey: ['users', user?.uid, 'jogos-para-jogar'] });
    }

    const [filter, setFilter] = useState('')
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria
    const [sortBy, setSortBy] = useState<'name' | 'hours_played'>('name')

    const categoryToField: Record<string, string> = {
        'Plataforma': 'platform',   // ajustar se no db.json o campo for outro
        'Gênero': 'genre',
        'Status': 'status',
        'Prioridade': 'priority',
        'Para Rejogar?': 'replayed'
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

    // Ordena os jogos filtrados conforme sortBy
    const sortedGames = useMemo(() => {
        const arr = [...filteredGames]
        if (sortBy === 'name') {
            arr.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortBy === 'hours_played') {
            arr.sort((a, b) => Number(b.hours_played) - Number(a.hours_played))
        } else if (sortBy === 'release_year') {
            arr.sort((a, b) => Number(b.release_year) - Number(a.release_year))
        }
        return arr
    }, [filteredGames, sortBy])

    return (

        <main className='flex flex-col w-full pt-4 min-h-screen items-center bg-gray-800'>

            {/* <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3> */}

            <div className='flex gap-4 m-1'>
                <Button onClick={alterarTamanhoCard} className='bg-blue-500'> <FaBorderStyle /> Estilo do Card: <span className='font-bold'> {steamCardPJ.toUpperCase()} </span> </Button>
                <Button type="button" onClick={() => { refetch(); setCardsKey(k => k + 1); }}>Recarregar cartas</Button>
                <AddGameModalParaJogar />
            </div>

            <FilterComponent value={filter} onChange={setFilter} onFiltersChange={setSelectedFilters} onSortChange={setSortBy} isGameReplayed={false} />


            {isFetching ?
                (<div className='flex justify-center items-center h-[99vh]'>
                    <Button disabled size="sm">
                        <Spinner />
                        Loading...
                    </Button>
                </div>)
                : isError ? (
                    <p className='text-white'>Serviço não pegou os jogos para jogar</p>
                ) :
                    (
                        <div key={cardsKey} className={` flex flex-col
                            ${steamCardPJ === 'pequeno' ? ' min-[520px]:grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 min-[112rem]:grid-cols-5 min-[136rem]:grid-cols-6 '
                                    : steamCardPJ === 'médio' ? ' min-[520px]:grid min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 min-[112rem]:grid-cols-4 '
                                        : steamCardPJ === 'grande' ? ' min-[520px]:grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4  min-[116rem]:grid-cols-5 min-[136rem]:grid-cols-6 '
                                            : steamCardPJ === 'steam' ? ' min-[520px]:grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4  min-[116rem]:grid-cols-5 min-[136rem]:grid-cols-6 '
                                                : ''
                            } gap-8 py-6 px-4 w-11/12 min-h-screen`}>
                            {sortedGames.map((game: myGamesApiInterface) => {
                                return (
                                    <div key={game.id}>
                                        {steamCardPJ === 'steam' ? (
                                            <SteamHoverCard game={{
                                                id: game.id,
                                                name: game.name,
                                                hours_played: game.hours_played,
                                                hours_expected: game.hours_expected,
                                                priority: game.priority,
                                                platform: game.platform,
                                                genre: game.genre,
                                                status: game.status,
                                                replayed: game.replayed,
                                                release_year: game.release_year,
                                                year_started: game.year_started,
                                                year_finished: game.year_finished,
                                                background_image: game.background_image,
                                            }} deletajooj={fbDeletajooj} uidValidator={user?.uid!} />
                                        ) : (
                                            <CardComponentParaJogar
                                                id={game.id}
                                                name={game.name}
                                                hours_expected={game.hours_expected !== '' ? game.hours_expected : '0'}
                                                priority={game.priority}
                                                platform={game.platform}
                                                genre={game.genre}
                                                status={game.status}
                                                replayed={game.replayed}
                                                release_year={game.release_year}
                                                background_image={game.background_image}
                                                deletajooj={fbDeletajooj}
                                                steamCardPJ={steamCardPJ}
                                                uidValidator={user?.uid!}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

            {/* <button onClick={fbAddjooj}>Adicionar no Firebase</button> */}

        </main>
    )
}
