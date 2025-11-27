export interface gameDataInterface {
    id: string,
    title?: string,
    name: string
    released: string
    background_image: string,
}

export interface myGamesApiInterface {
    id: string,
    name: string,
    hours_played: number,
    hours_expected: number | null,
    platform: string,
    genre: string,
    is_completed?: boolean,
    release_year: number,
    status: string,
    year_started?: number,
    year_finished?: number | null,
    background_image?: string
}

// export interface ApiDataInterface {
//     data: gameDataInterface[]
// }