import { useQuery } from "@tanstack/react-query"
import { API } from "../services/gameApiServices.ts"

// type Game = {
//     id: number,
//     name: string
// }

export function useExternaGameData() {
    return useQuery({
        queryKey: ['games'],
        queryFn: API.fetchApiExternaGames,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 5,
    })
}

export function myGames() {
    return useQuery({
        queryKey: ['meu joojs'],
        queryFn: API.fetchMyGames,
        refetchOnWindowFocus: false,
    })
}




