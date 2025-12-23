
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//getFirestore: olha a aplicação, olhas as chaves secretas do firebaseCoonfig e repassa pro Firestore se tem permissão de admin para acessar o banco de dados
import { getFirestore, getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import type { GamePayload2, myGamesApiInterface } from '@/interfaces/gameDataTypes';
import AddGameModal from '../jogados/modalAddJogo';
import FilterComponent from '../filtragem';
import { Button } from "@/components/ui/button"
import { Spinner } from '../ui/spinner';
import AddGameModalParaJogar from './modalAddJogoParaJogar';
import CardComponentParaJogar from './cardComponentParaJogar';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
    authDomain: "my-game-list-6fd0f.firebaseapp.com",
    projectId: "my-game-list-6fd0f",
    // storageBucket: "my-game-list-6fd0f.firebasestorage.app",
    // messagingSenderId: "982341506588",
    // appId: "1:982341506588:web:ac89acb8295ac1c78531d9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default function AppParaJogar() {
    
    const queryClient = useQueryClient()
    const db = getFirestore(firebaseApp)
    const jogosParaJogarColeRef = collection(db, 'jogos-para-jogar') // referência à coleção 'jogos-para-jogar' no Firestore

    // Função para buscar jogos usando React Query
    const fetchJogosParaJogar = async () => {
        try {
            const data = await getDocs(jogosParaJogarColeRef)
            return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        } catch (err) {
            console.error('Erro ao buscar jogos do Firebase:', err)
            throw err
        }
    }

    // useQuery para gerenciar o estado e cache dos jogos
    const { data: users = [], isLoading: isFetching, isError } = useQuery({
        queryKey: ['jogos-para-jogar'],
        queryFn: fetchJogosParaJogar,
    })

    async function fbDeletajooj(id: string) {
        await deleteDoc(doc(jogosParaJogarColeRef, id))
        // Invalidar a query para forçar um refetch
        queryClient.invalidateQueries({ queryKey: ['jogos-para-jogar'] })
    }

    // const joojsCollection = dbFirebase.collection('meu joojs');


    const [filter, setFilter] = useState('')
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria
    const [sortBy, setSortBy] = useState<'name' | 'hours_played'>('name') // novo estado

    const categoryToField: Record<string, string> = {

        'Plataforma': 'platform',   // ajuste se no seu db.json o campo for outro
        'Gênero': 'genre',
        'Status': 'status',
        'Prioridade': 'priority',
        'Para Rejogar': 'replayed'
    }

    const filteredGames = useMemo(() => {
        const list = (users ?? []) as myGamesApiInterface[]
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
    }, [users, filter, selectedFilters])

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
            <AddGameModalParaJogar />
            <FilterComponent value={filter} onChange={setFilter} onFiltersChange={setSelectedFilters} onSortChange={setSortBy} isGame={true}/>


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
                        <div className='grid grid-cols-4 gap-8 py-6 px-4 w-11/12 min-h-screen'>
                            {sortedGames.map((game: myGamesApiInterface) => {
                                return (
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
                                    />
                                )
                            })}
                        </div>
                    )}

            {/* <button onClick={fbAddjooj}>Adicionar no Firebase</button> */}
        </main>
    )
}
