import { useState, type SetStateAction } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useQueryClient } from '@tanstack/react-query';
import API from '@/services/gameApiServices';
// import { FaRegWindowClose } from 'react-icons/fa';
import { RiCloseCircleLine } from "react-icons/ri";
import Select from '@mui/material/Select';
import { SelectDemo } from './selects';


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
            value: 'Abandonado', // add um icone de caveirinha
            label: 'Abandonado'
        },
        {
            value: 'Não Iniciado',
            label: 'Não Iniciado'
        }
    ]
    const allGenres = [
        {
            value: 'Ação',
            label: 'Ação'
        },
        {
            value: 'Aventura',
            label: 'Aventura'
        },
        {
            value: 'RPG',
            label: 'RPG'
        },
        {
            value: 'JRPG',
            label: 'JRPG'
        },
        {
            value: 'Estratégia',
            label: 'Estratégia'
        },
        {
            value: 'Esportes/Corrida',
            label: 'Esportes/Corrida'
        },
        {
            value: 'FPS',
            label: 'FPS'
        },
        {
            value: 'Soulslike',
            label: 'Soulslike'
        },
        {
            value: 'Metroidvania/Plataforma',
            label: 'Metroidvania/Plataforma'
        }
    ]

    const queryClient = useQueryClient() // <--- novo

    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    const [addjogo, setAddjogo] = useState<string>('')
    const [hours_played, setHours_played] = useState<number>()
    const [hours_expected, setHours_expected] = useState<number>()
    const [platform, setPlatform] = useState<string>('')
    const [genre, setGenre] = useState<string>('')
    // const [is_completed, setIs_completed] = useState<boolean>(false)
    const [status, setStatus] = useState<string>('')
    const [release_year, setRelease_year] = useState<number>()
    const [year_started, setYear_started] = useState<number>()
    const [year_finished, setYear_finished] = useState<number>()
    const [background_image, setBackground_image] = useState<string>('')

    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    async function enviarJogo(e?: React.MouseEvent<HTMLButtonElement>) {
        e?.preventDefault();
        const payload: GamePayload2 = {
            name: addjogo, //'Octopath Traveler',
            hours_played: hours_played || 0, //86
            hours_expected: hours_expected || 0, //60,
            platform: platform, //'Switch',   SELECT AQUI COM VÁRIAS OPÇÕES
            genre: genre, // 'JPRG',   SELECT AQUI COM VÁRIAS OPÇÕES
            //is_completed: is_completed , //false,
            release_year: release_year || 0, // 2017,
            status: status, //'In Progress',
            year_started: year_started || 0, //2024,
            year_finished: year_finished || 0, //null,
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
            <h3 className='text-4xl p-4 text-white font-bold'>Welcome to <span className='font-bold text-4xl text-red-400'>Gamify</span></h3>
            <Button onClick={handleClickOpen}>Adicionar Jogo</Button>

            <Dialog open={open} onClose={handleClose} className='bg-slate-700'
                sx={{
                    input: { color: '#f1f5f9' },
                    label: { color: '#3c3c3c' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 1.5, fontWeight: "bold" }} >
                    <div className='flex justify-between items-center'>
                        Adicionar Jogo
                        <span onClick={handleClose} className='hover:cursor-pointer'>
                            <RiCloseCircleLine className='h-8 w-8  hover:size-10' />
                        </span>
                    </div>
                </DialogTitle>
                <DialogContent className='bg-[#f1f2f9]'>
                    <form action="" onSubmit={handleSubmit} id="subscription-form" className=''>

                        <TextField
                            className='shadow-lg my-1'
                            sx={{
                                backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800 2c2c2c
                                input: { color: '#3c3c3c', px: 1, py: 1.2 }, // text-slate-100 #cecbce
                                '& .MuiOutlinedInput-root': {
                                    // '& fieldset': { borderColor: '#334155' }, // border-slate-700
                                    '&:hover fieldset': { borderColor: '#64748b' }, // hover border
                                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
                                },
                            }}
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
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
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
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
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
                        </div>


                        <div className='grid grid-cols-3 gap-4 mt-4 mb-2'>
                            <FormControl fullWidth variant="outlined" className='shadow-lg' >
                                <InputLabel
                                    id="plataforma-label"
                                    sx={{
                                        '&.MuiInputLabel-shrink': {
                                            transform: 'translate(14px, -14px) scale(0.75)', // posição padrão do MUI
                                        },
                                    }}
                                >
                                    Plataforma
                                </InputLabel>
                                <Select
                                    label="Plataforma"
                                    id="platform"
                                    name="platform"
                                    variant="outlined"
                                    required
                                    // className={`bg-yellow-200`}
                                    sx={{
                                        // label:{ color: 'violet'},
                                        "& .MuiSelect-icon": {
                                            color: "black",
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: "#1c1c1c",
                                                // color: "red",  //muda nada
                                                "& .MuiMenuItem-root": {
                                                        opacity: '75%',
                                                        //color: "white",  // já é branco por padrão
                                                    "&.Mui-selected": {
                                                        backgroundColor: "#2e2e3e", // background do option selecionado
                                                        color: "white", //cor do texto do option selecionado
                                                        fontWeight: 'bold',
                                                        opacity: '100%',
                                                    },
                                                    "&:hover": {
                                                        // transform: "translateY(4px) time(0.9s)",  //muda nada
                                                        backgroundColor: "gray", // background do option ao passar mouse por cima
                                                        //color: "red", //cor do texto do option ao passar mouse por cima
                                                        fontWeight: 'bold',
                                                        // opacity: '100%',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {allPlatforms.map((plats) => (
                                        <MenuItem key={plats.value} value={plats.value} sx={{
                                            backgroundColor: '#1c1c1c',
                                            color: '#f1f5f9',
                                            '&:hover': {
                                                backgroundColor: '#2b2b2b',
                                            },
                                        }}>
                                            {plats.label}
                                        </MenuItem>
                                    )
                                    )}
                                </Select>
                            </FormControl>
                            <TextField
                                className='shadow-lg'
                                sx={{
                                    backgroundColor: '#f1f5f9',
                                    // p: 0.5,
                                    //input: { color: '#3c3c3c' }, // text-slate-100
                                    '& .MuiInputLabel-root': {
                                        // color: '#2563eb',
                                    },
                                    '& .MuiInputLabel-shrink': {
                                        transform: 'translate(10px, -12px) scale(0.75)', // ajusta posição
                                        //backgroundColor: '#fef08a', // mesma cor do fundo para não "cortar"
                                        //padding: '0 4px', // cria espaço para a label não sobrepor a borda
                                    },
                                }}
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#1c1c1c', // fundo do container
                                                borderRadius: '4px',
                                                padding: '2px',
                                                margin: '1px',
                                                "& .MuiMenuItem-root": {
                                                        opacity: '75%',
                                                        //color: "white",  // já é branco por padrão
                                                    "&.Mui-selected": {
                                                        backgroundColor: "#2e2e3e", // background do option selecionado
                                                        color: "white", //cor do texto do option selecionado
                                                        fontWeight: 'bold',
                                                        opacity: '100%',
                                                    },
                                                    "&:hover": {
                                                        // transform: "translateY(4px) time(0.9s)",  //muda nada
                                                        backgroundColor: "gray", // background do option ao passar mouse por cima
                                                        //color: "red", //cor do texto do option ao passar mouse por cima
                                                        fontWeight: 'bold',
                                                        // opacity: '100%',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                }}
                                required
                                select
                                id="genre"
                                name="genre"
                                label="Gênero"
                                type="text"
                                variant="outlined"
                                value={genre} onChange={(e) => { setGenre(e.target.value) }}
                            >
                                {
                                    allGenres.map((genre) => (
                                        <MenuItem key={genre.value} value={genre.value} sx={{
                                            backgroundColor: '#1c1c1c',
                                            color: '#f1f5f9',
                                            '&:hover': {
                                                backgroundColor: '#2b2b2b',
                                            },
                                        }}>
                                            {genre.label}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                            <TextField
                                className='shadow-lg'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c' }, // text-slate-100
                                }}
                                // autoFocus
                                required
                                select
                                id="status"
                                name="status"
                                label="Status"
                                variant="outlined"
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
                        <div className='grid grid-cols-3 gap-4 my-1'>
                            <TextField
                                className='shadow-lg'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
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
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                // autoFocus
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
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                }}
                                // autoFocus
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
                            sx={{
                                backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                input: { color: '#3c3c3c', p: 1 }, // text-slate-100
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#334155' }, // border-slate-700
                                    '&:hover fieldset': { borderColor: '#64748b' }, // hover border
                                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
                                },
                            }}
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