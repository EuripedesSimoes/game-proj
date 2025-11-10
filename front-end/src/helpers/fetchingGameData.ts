import { useQuery } from "@tanstack/react-query"
import { API } from "../services/gameApiServices.ts"

// type Game = {
//     id: number,
//     name: string
// }

export function useGameData() {
    return useQuery({
        queryKey: ['games'],
        queryFn: API.fetchGames,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 5,
    })
}

export function myGames() {
    return useQuery({
        queryKey: ['meu joojs'],
        queryFn: API.fetchMyGames,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 5,
    })
}




