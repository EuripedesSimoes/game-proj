import axios from "axios"
// import type { gameDataInterface } from '../interfaces/gameData.ts'
// import type { myGamesApiInterface } from '../interfaces/gameData.ts'

type ApiProps = {
    seila: string,
}

// const URL = 'https://www.igdb.com/games/'
const TOKEN = "0614d8a652a44863888834071ab93b2f"
const URL = `https://api.rawg.io/api/games?key=${TOKEN}`

export const fetchGames = async (): Promise<any> => {
    const res = await axios.get<any>(URL)
    return res?.data.results
}

export const fetchMyGames = async (): Promise<any> => {
    const res = await axios.get<any>('http://localhost:3000/joojs')
    return res?.data
}
    // setTimeout(() => {fetchMyGames()}, 3000);

const api = {
    async salvarjogo({seila}: ApiProps) {
        const res = await axios.get<any>(URL, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // body: JSON.stringify(seila)
        })
        return res?.data.data
    }
}

