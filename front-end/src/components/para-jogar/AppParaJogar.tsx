
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// import { dbFirebase } from '../firebaseConfig.ts';

// import { initializeApp } from "firebase/app";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//getFirestore: olha a aplicação, olhas as chaves secretas do firebaseCoonfig e repassa pro Firestore se tem permissão de admin para acessar o banco de dados
import { getFirestore, getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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

const firebaseApp = initializeApp(firebaseConfig);

// const dbFirebase = getFirestore(firebaseApp);

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

export default function AppParaJogar() {
    const db = getFirestore(firebaseApp)
    const jogosParaJogarColeRef = collection(db, 'jogos-para-jogar') // referência à coleção 'jogos-para-jogar' no Firestore
    const [users, setUsers] = useState<Array<Record<string, any> & { id: string }>>([])
    const [isFetching, setIsFetching] = useState(true)
    const [isError, setIsError] = useState(false)

    // async function fbAddjooj() { // função para adicionar um novo jogo para a coleção
    //     const fbNovoJooj: GamePayload2 = {
    //         name: '2- Novo Jooj Firebase',
    //         hours_played: 50,
    //         hours_expected: 60,
    //         priority: '',
    //         platform: '3DS-Emulado',
    //         genre: 'Ação',
    //         release_year: 2025,
    //         status: 'Para jogar',
    //         year_started: 2025,
    //         year_finished: 2025,
    //         background_image: 'https://howlongtobeat.com/games/14968_Bravely_Default.jpg'
    //     };
    //     await addDoc(jogosParaJogarColeRef, fbNovoJooj);
    // }
    async function fbDeletajooj(id: string) {
        await deleteDoc(doc(db, 'jogos-para-jogar', id))
    }
    async function fbAtualizajooj(id: string, dadosAtualizados: Partial<GamePayload2>) {
        const joojDoc = doc(db, 'jogos-para-jogar', id)
        await updateDoc(joojDoc, dadosAtualizados)
    }

    useEffect(() => {
        const todosjogos = async () => {
            setIsFetching(true)
            setIsError(false)

            try {
                const data = await getDocs(jogosParaJogarColeRef)
                setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

                console.log('1- Jogos do Firebase:', data.docs.map(doc => doc.data()));
                console.log('2- Jogos do Firebase2:', data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
                console.log('Jogos do Firebase DATA:', data);
            }
            catch (err) {
                console.error('Erro ao buscar jogos do Firebase:', err);
                setIsError(true)
            }
            finally {
                setIsFetching(false)
            }
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


    const [filter, setFilter] = useState('')
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({}) // estado com filtros por categoria
    const [sortBy, setSortBy] = useState<'name' | 'hours_played'>('name') // novo estado

    const categoryToField: Record<string, string> = {

        'Plataforma': 'platform',   // ajuste se no seu db.json o campo for outro
        'Gênero': 'genre',
        'Status': 'status',
        'Prioridade': 'priority',
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
            <FilterComponent value={filter} onChange={setFilter} onFiltersChange={setSelectedFilters} onSortChange={setSortBy} />


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
