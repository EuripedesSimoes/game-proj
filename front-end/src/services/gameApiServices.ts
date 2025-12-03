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
    year_started_Prop?: number | null,
    year_finished_Prop?: number | null,
    background_image_Prop: string
    // adicione outros campos que seu db.json espera
}
export type GamePayload2 = {
    name: string;
    hours_played: number | string;
    hours_expected: number | string;
    platform: string;
    genre: string;
    is_completed?: boolean;
    release_year: number | string;
    status: string;
    year_started: number | string;
    year_finished: number | string;
    background_image?: string;
};
// passar pra algum helper ou coisa assim
type GamePayload3 = {
    name: string;
    hours_played: number | string;
    hours_expected: number | string;
    platform: string;
    genre: string;
    is_completed?: boolean;
    release_year: number | string;
    status: string;
    year_started: number | string;
    year_finished: number | string;
    background_image?: string;
};


type GameResponse = GamePayload & { id?: number }

// const URL = 'https://www.igdb.com/games/'
const TOKEN = "0614d8a652a44863888834071ab93b2f"
const URL = `https://api.rawg.io/api/games?key=${TOKEN}`
const URL_DB = "http://localhost:3000/joojs"

export const API = {
    async fetchApiExternaGames(): Promise<any> {
        const res = await axios.get<any>(URL)
        return res?.data.results
    },

    async fetchMyGames(): Promise<any> {
        const res = await axios.get<any>('http://localhost:3000/joojs')
        return res?.data
    },

    async salvarJogo(payload: GamePayload2) {
        const res = await axios.post<any>(`${URL_DB}`, payload)
        return res.data
    },

    async deletarJogo(id: string) {
        const res = await axios.delete<any>(`${URL_DB}/${id}`)
        return res.data
    },

    async attJogo(id: string, payload: GamePayload3) {
        const res = await axios.put<any>(`${URL_DB}/${id}`, payload)
        return res.data
        //     const response = await fetch(`${URL_DB}/${id}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload),
        // })
        // return response.json()
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



