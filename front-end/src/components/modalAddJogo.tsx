import { useState } from 'react'
import Modal from '@mui/material/Modal';
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useQueryClient } from '@tanstack/react-query';
import API from '@/services/gameApiServices';
import { Bold } from 'lucide-react';
import { FaRegWindowClose } from 'react-icons/fa';
import { RiCloseCircleLine } from "react-icons/ri";


type GamePayload2 = {
    name: string;
    hours_played: number;
    hours_expected: number;
    platform: string;
    genre: string;
    is_completed?: boolean;
    release_year: number;
    status: string;
    year_started: number;
    year_finished: number | null;
    background_image?: string;
};


const AddGameModal = () => {

    const allPlatforms = [
        {
            value: 'PC',
            label: 'PC'
        },
        {
            value: 'Switch',
            label: 'Switch'
        },
        {
            value: 'PSVita',
            label: 'PSVita'
        },
        {
            value: '3DS-Emulado',
            label: '3DS-Emulado'
        },
        {
            value: 'PSP-Emulado',
            label: 'PSP-Emulado'
        }
    ]
    const allStatus = [
        {
            value: 'Finalizado',
            label: 'Finalizado'
        },
        {
            value: 'Jogando', // add um icone de reloginho
            label: 'Jogando'
        },
        {
            value: 'Pausado',
            label: 'Pausado'
        },
        {
            value: 'Não Iniciado',
            label: 'Não Iniciado'
        },
        {
            value: 'Abandonado', // add um icone de caveirinha
            label: 'Abandonado'
        }
    ]
    const allGenres = [
        {
            value: 'JRPG',
            label: 'JRPG'
        },
        {
            value: 'RPG',
            label: 'RPG'
        },
        {
            value: 'Ação',
            label: 'Ação'
        },
        {
            value: 'Aventura',
            label: 'Aventura'
        },
        {
            value: 'Metroidvania',
            label: 'Metroidvania'
        },
        {
            value: 'Plataforma',
            label: 'Plataforma'
        },
        {
            value: 'Soulslike',
            label: 'Soulslike'
        },
        {
            value: 'FPS',
            label: 'FPS'
        },

    ]


    const queryClient = useQueryClient() // <--- novo

    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    const [addjogo, setAddjogo] = useState<string>('')
    const [hours_played, setHours_played] = useState<number>(0)
    const [hours_expected, setHours_expected] = useState<number>(0)
    const [platform, setPlatform] = useState<string>('')
    const [genre, setGenre] = useState<string>('')
    // const [is_completed, setIs_completed] = useState<boolean>(false)
    const [status, setStatus] = useState<string>('')
    const [release_year, setRelease_year] = useState<number>(0)
    const [year_started, setYear_started] = useState<number>(0)
    const [year_finished, setYear_finished] = useState<number>(0)
    const [background_image, setBackground_image] = useState<string>('')

    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    async function enviarJogo(e?: React.MouseEvent<HTMLButtonElement>) {
        const payload: GamePayload2 = {
            name: addjogo, //'Octopath Traveler',
            hours_played: hours_played, //86
            hours_expected: hours_expected, //60,
            platform: platform, //'Switch',   SELECT AQUI COM VÁRIAS OPÇÕES
            genre: genre, // 'JPRG',   SELECT AQUI COM VÁRIAS OPÇÕES
            //is_completed: is_completed , //false,
            release_year: release_year, // 2017,
            status: status, //'In Progress',
            year_started: year_started, //2024,
            year_finished: year_finished, //null,
            background_image: background_image, //''
        }
        const jogoSalvo = await API.salvarJogo(payload)

        // <--- invalida a query e força refetch automático
        queryClient.invalidateQueries({ queryKey: ['meu joojs'] })

        // limpar os inputs (opcional)
        setAddjogo('')
        setHours_played(0)
        setHours_expected(0)
        setPlatform('')
        setGenre('')
        setStatus('')
        setRelease_year(0)
        setYear_started(0)
        setYear_finished(0)
        setBackground_image('')
        handleClose() // fecha o dialog

        return jogoSalvo
    }

    const [open, setOpen] = useState(false);
    const handleClickOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const email = formJson.email;
        console.log(email);
        handleClose();
    };


    return (
        <div className='w-full h-full flex flex-col justify-center items-center'>
            <h3 className='text-4lx p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3>
            <Button onClick={handleClickOpen}>Adicionar Jogo</Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ m: 0, p: 1.5, fontWeight: "bold" }} >
                    <div className='flex justify-between items-center content-center'>
                        Adicionar Jogo
                        <span onClick={handleClose} className='bg-none hover:cursor-pointer'>
                            <RiCloseCircleLine className='h-8 w-8  hover:size-10' />
                        </span>
                    </div>
                </DialogTitle>
                <DialogContent className='bg-slate-300/60'>
                    <form action="" onSubmit={handleSubmit} id="subscription-form" className=''>
                        <TextField
                            className='shadow-lg my-1'
                            // autoFocus
                            required
                            fullWidth
                            margin="dense"
                            id="game_name"
                            name="game_name"
                            label="Nome do Jogo"
                            type="text"
                            variant="standard"
                            value={addjogo}
                            onChange={(e) => { setAddjogo(e.target.value) }}
                        />

                        <div className='grid grid-cols-3 gap-4 my-1'>
                            <TextField
                                className='shadow-lg'
                                // autoFocus
                                required
                                margin="dense"
                                id="hours_played"
                                name="hours_played"
                                label="Horas jogadas"
                                type="text"
                                variant="standard"
                                value={hours_played}
                                onChange={(e) => { setHours_played(parseInt(e.target.value)) }}
                            />
                            <TextField
                                className='shadow-lg'
                                // autoFocus
                                required
                                margin="dense"
                                id="hours_expected"
                                name="hours_expected"
                                label="Horas esperadas"
                                type="text"
                                variant="standard"
                                value={hours_expected}
                                onChange={(e) => { setHours_expected(parseInt(e.target.value)) }}
                            />
                            <TextField
                                className='shadow-lg'
                                // autoFocus
                                required
                                select
                                id="platform"
                                name="platform"
                                label="Plataforma"
                                margin="dense"
                                variant="standard"
                                value={platform} onChange={(e) => { setPlatform(e.target.value) }}
                            >
                                {allPlatforms.map((plats) => (
                                    <MenuItem key={plats.value} value={plats.value}>
                                        {plats.label}
                                    </MenuItem>
                                )
                                )}
                            </TextField>
                        </div>

                        <div className='grid grid-cols-3 gap-4 my-1'>

                            <TextField
                                className='shadow-lg col-span-2'
                                // className='shadow-lg '
                                // autoFocus
                                required
                                select
                                margin="dense"
                                id="ganre"
                                name="genre"
                                label="Gênero"
                                type="text"
                                variant="standard"
                                value={genre} onChange={(e) => { setGenre(e.target.value) }}
                            >
                                {
                                    allGenres.map((genre) => (
                                        <MenuItem key={genre.value} value={genre.value}>
                                            {genre.label}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                            <TextField
                                className='shadow-lg'
                                // autoFocus
                                required
                                select
                                margin="dense"
                                id="status"
                                name="status"
                                label="Status"
                                variant="standard"
                                value={status} onChange={(e) => { setStatus(e.target.value) }}
                            >
                                {allStatus.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                )
                                )}
                            </TextField>

                        </div>

                        <div className='grid grid-cols-3 gap-4'>
                            <TextField
                                className='shadow-lg'
                                // autoFocus
                                required
                                margin="dense"
                                id="release_year"
                                name="release_year"
                                label="Ano Lançamento"
                                type="text"
                                variant="standard"
                                value={release_year} onChange={(e) => { setRelease_year(parseInt(e.target.value)) }}
                            />
                            <TextField
                                className='shadow-lg'
                                // autoFocus
                                required
                                margin="dense"
                                id="year_started"
                                name="year_started"
                                label="Ano Iniciado"
                                type="text"
                                variant="standard"
                                value={year_started} onChange={(e) => { setYear_started(parseInt(e.target.value)) }}
                            />
                            <TextField
                                className='shadow-lg'
                                // autoFocus
                                required
                                margin="dense"
                                id="year_finished"
                                name="year_finished"
                                label="Ano Finalizado"
                                type="text"
                                variant="standard"
                                value={year_finished} onChange={(e) => { setYear_finished(parseInt(e.target.value)) }}
                            />
                        </div>
                        <TextField
                            className='shadow-lg'
                            margin="dense"
                            fullWidth
                            id="background_image"
                            name="background_image"
                            label="Foto da Capa (URL)"
                            type="text"
                            variant="standard"
                            value={background_image} onChange={(e) => { setBackground_image(e.target.value) }}
                        />

                        <DialogActions>
                            <Button className='' type="submit" onClick={enviarJogo}>+ ADD Jooj</Button>
                            {/* <Button onClick={handleClose}>Close</Button> */}
                        </DialogActions>

                    </form>
                </DialogContent>
            </Dialog>

            {/* Colocar tudo isso em um novo componente depois */}
            {/* <div className='bg-gray-300 w-full h-full'>
                <form action="" className='gap-8 '>
                    <label htmlFor='name' >Nome do jogo</label>
                    <input type="text" name="name" id="name" value={addjogo} onChange={(e) => { setAddjogo(e.target.value) }} />

                    <label htmlFor='hours_played' >Horas jogadas</label>
                    <input type="number" name="hours_played" id="hours_played" value={hours_played} onChange={(e) => setHours_played(parseInt(e.target.value))} />
                    <label htmlFor='hours_expected' >Horas esperadas</label>
                    <input type="number" name="hours_expected" id="hours_expected" value={hours_expected} onChange={(e) => setHours_expected(parseInt(e.target.value))} />

                    <label htmlFor='platform' >Plataforma</label>
                    <input type="text" name="platform" id="platform" value={platform} onChange={(e) => { setPlatform(e.target.value) }} />
                    <label htmlFor='genre' >Gênero</label>
                    <input type="text" name="genre" id="genre" value={genre} onChange={(e) => { setGenre(e.target.value) }} />
                    <label htmlFor='status' >Status</label>
                    <input type="text" name="status" id="status" value={status} onChange={(e) => { setStatus(e.target.value) }} /> */}

            {/* <label htmlFor='is_completed' >Foi finalizado?</label> */}
            {/* <input type="text" name="is_completed" id="is_completed" value={is_completed} onChange={(e) => { setIs_completed(e.target.value) }} /> */}

            {/* <label htmlFor='release_year' >Ano Lançamento</label>
                    <input type="number" name="release_year" id="release_year" value={release_year} onChange={(e) => setRelease_year(parseInt(e.target.value))} />
                    <label htmlFor='year_started' >Ano Iniciado</label>
                    <input type="number" name="year_started" id="year_started" value={year_started} onChange={(e) => setYear_started(parseInt(e.target.value))} />
                    <label htmlFor='year_finished' >Ano Finalizado</label>
                    <input type="number" name="year_finished" id="year_finished" value={year_finished} onChange={(e) => setYear_finished(parseInt(e.target.value))} />


                    <label htmlFor='background_image' >background_image</label>
                    <input type="text" name="background_image" id="background_image" value={background_image} onChange={(e) => { setBackground_image(e.target.value) }} />

                    <input type="text" value='a' />
                    <Button type="submit" onClick={enviarJogo}>+ ADD Jooj</Button>
                </form>
            </div> */}
        </div>
    )
}

export default AddGameModal;