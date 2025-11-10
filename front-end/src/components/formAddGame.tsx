import React, { useEffect } from 'react';
import { FaSearch, FaTrashAlt, FaTrashRestoreAlt, FaTrashRestore, FaTrash } from "react-icons/fa";
import { useState } from 'react'
import { myGames } from '@/helpers/fetchingGameData';
import API from '../services/gameApiServices'
import { Button } from './ui/button';

// Define the GamePayload type
type GamePayload = {
    name_Prop: string;
    hours_played_Prop: number;
    platform_Prop: string;
    genre_Prop: string;
    is_completed_Prop: boolean;
    release_year_Prop: number;
    status_Prop: string;
    year_started_Prop: number;
    year_finished_Prop: number | null;
    background_image_Prop: string;
};





export default function AddGame({ name_Prop, hours_played_Prop, platform_Prop, genre_Prop, is_completed_Prop, release_year_Prop, status_Prop, year_started_Prop, year_finished_Prop, background_image_Prop }: GamePayload) {

    async function enviarJogo(e?: React.MouseEvent<HTMLButtonElement>) {
        e?.preventDefault();
        const payload: GamePayload = {
            name_Prop: 'Meu Jogo',
            hours_played_Prop: 10,
            platform_Prop: 'PC',
            genre_Prop: 'Ação',
            is_completed_Prop: false,
            release_year_Prop: 2015,
            status_Prop: 'In Progress',
            year_started_Prop: 2021,
            year_finished_Prop: null,
            background_image_Prop: ''
        }
        const saved = await API.salvarJogo(payload)
        return saved
    }

    return (
        <div className='bg-gray-300 w-full h-full'>
            <form action="">
                <label htmlFor='name' >Nome do jogo</label>
                <input type="text" name="name" id="name" value={name_Prop} />


                <label htmlFor='hours_played' >Horas jogadas</label>
                <input type="text" name="hours_played" id="hours_played" value={hours_played_Prop} />

                <input type="text" value='a' />
                <Button type="submit" onClick={enviarJogo}>+ ADD Jooj</Button>
            </form>
        </div>

    )
}