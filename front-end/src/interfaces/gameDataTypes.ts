export interface gameDataInterface {
    id: string,
    title?: string,
    name: string
    released: string
    background_image: string,
}

export interface myGamesApiInterface {
    id: string,
    name: string;
    hours_played: number | string;
    hours_expected: number | string;
    priority: string;
    platform: string;
    genre: string;
    is_completed?: boolean;
    release_year: number | string;
    status: string;
    replayed: string;
    year_started: number | string;
    year_finished: number | string;
    background_image?: string;
}

// ADD JOGO - OK - // passar pra algum helper ou coisa assim
export type GamePayload2 = {
    name: string;
    hours_played?: number | string;
    hours_expected?: number | string;
    priority: string;
    platform: string;
    genre: string;
    status: string;
    replayed?: string;
    is_completed?: boolean;
    release_year: number | string;
    year_started?: number | string;
    year_finished?: number | string;
    background_image?: string;
};

// ATT JOGO - OK - // passar pra algum helper ou coisa assim
export type GamePayload3 = {
    name: string;
    hours_played?: number | string;
    hours_expected?: number | string;
    priority: string;
    platform: string;
    genre: string;
    status: string;
    replayed?: string;
    is_completed?: boolean;
    release_year: number | string;
    year_started?: number | string;
    year_finished?: number | string;
    background_image?: string;
};
