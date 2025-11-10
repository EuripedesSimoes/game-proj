import axios from "axios"
// import type { gameDataInterface } from '../interfaces/gameData.ts'
// import type { myGamesApiInterface } from '../interfaces/gameData.ts'


const apiClient = axios.create({
    baseURL: 'http://localhost:3000', // JSON Server rodando aqui
    headers: { 'Content-Type': 'application/json' },
})
type GamePayload = {
    name_Prop: string,
    hours_played_Prop?: number,
    platform_Prop?: string,
    genre_Prop: string,
    is_completed_Prop: boolean,
    release_year_Prop: number,
    status_Prop: string,
    year_started_Prop?: number |  null,
    year_finished_Prop?: number | null,
    background_image_Prop: string
    // adicione outros campos que seu db.json espera
}


type GameResponse = GamePayload & { id?: number }

// const URL = 'https://www.igdb.com/games/'
const TOKEN = "0614d8a652a44863888834071ab93b2f"
const URL = `https://api.rawg.io/api/games?key=${TOKEN}`
const URL_DB = "http://localhost:3000/joojs"

export const API = {
    async fetchGames(): Promise<any> {
        const res = await axios.get<any>(URL)
        return res?.data.results
    },

    async fetchMyGames(): Promise<any> {
        const res = await axios.get<any>('http://localhost:3000/joojs')
        return res?.data
    },

    async salvarJogo(payload: any) {
        const res = await axios.post<any>(`${URL_DB}`, payload)
        return res.data
        
    }

    // async salvarjogo(payload: GamePayload): Promise<GameResponse | null> {
    //     try {
    //         // POST para /games — JSON Server adicionará o recurso em db.json
    //         const res = await apiClient.post<GameResponse>('/games', payload)
    //         return res.data
    //     } catch (err: any) {
    //         console.error('Erro ao salvar jogo:', err?.response?.data ?? err.message)
    //         return null
    //     }
    // }
}

export default API



