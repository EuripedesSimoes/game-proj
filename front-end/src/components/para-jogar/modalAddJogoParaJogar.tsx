import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useQueryClient } from '@tanstack/react-query';
import API from '@/services/gameApiServices';
// import { FaRegWindowClose } from 'react-icons/fa';
import { RiCloseCircleLine } from "react-icons/ri";
import Select from '@mui/material/Select';
import { allPriorities, allPlatforms, allGenres, notInicialized } from '@/services/listasParaFiltro';
import type { GamePayload2 } from '@/interfaces/gameDataTypes';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// OK-passar pra algum helper ou coisa assim
// type GamePayload2 = { name: string; etc...}

type Props = {
    addJogo?: () => void //excluir?
}

const AddGameModalParaJogar = ({ addJogo }: Props) => {
    const queryClient = useQueryClient()

    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    const [addjogo, setAddjogo] = useState<string>('')
    const [hours_expected, setHours_expected] = useState<number | string>('')
    const [priority, setPriority] = useState<string>('')
    const [platform, setPlatform] = useState<string>('')
    const [genre, setGenre] = useState<string>('')
    // const [is_completed, setIs_completed] = useState<boolean>(false)
    const [status, setStatus] = useState<string>('')
    const [release_year, setRelease_year] = useState<number | string>('')
    const [background_image, setBackground_image] = useState<string>('')

    function resetarForm() {
        // limpar os inputs (opcional)
        setAddjogo('')
        setHours_expected('')
        setPriority('')
        setPlatform('')
        setGenre('')
        setStatus('')
        setRelease_year('')
        setBackground_image('')
        //handleClose() // fecha o dialog
    }

    const firebaseConfig = {
        apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
        authDomain: "my-game-list-6fd0f.firebaseapp.com",
        projectId: "my-game-list-6fd0f",
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp)
    const jogosParaJogarColeRef = collection(db, 'jogos-para-jogar') // referência à coleção 'jogos-para-jogar' no Firestore
    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    async function enviarJogo(e?: React.MouseEvent<HTMLButtonElement>) {
        e?.preventDefault();
        const payload: GamePayload2 = {
            name: addjogo, //'Octopath Traveler',
            hours_expected: hours_expected || '', //60,
            priority: priority,
            platform: platform, //'Switch',   SELECT AQUI COM VÁRIAS OPÇÕES
            genre: genre, // 'JPRG',   SELECT AQUI COM VÁRIAS OPÇÕES
            //is_completed: is_completed , //false,
            release_year: release_year || '', // 2017,
            status: status, //'In Progress',
            background_image: background_image, //''
        }
        await addDoc(jogosParaJogarColeRef, payload);
        
        // Invalidar a query para forçar um refetch automático
        queryClient.invalidateQueries({ queryKey: ['jogos-para-jogar'] })
        
        resetarForm()
        FBhandleClose()
    }

    const [open, setOpen] = useState(false);
    const FBhandleClickOpen = () => setOpen(true)
    const FBhandleClose = () => setOpen(false)
    const FBhandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        FBhandleClose();
        
    };


    return (
        <div className='w-full h-full flex flex-col justify-center items-center'>
            <Button onClick={FBhandleClickOpen}>Adicionar Jogo Para Jogar</Button>

            <Dialog open={open} onClose={FBhandleClose} className='bg-slate-700'
                sx={{
                    label: { color: '#3c3c3c' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 1.5, fontWeight: "bold" }} >
                    <div className='flex justify-between items-center'>
                        Adicionar Jogo Para Jogar
                        <span onClick={FBhandleClose} className='hover:cursor-pointer'>
                            <RiCloseCircleLine className='h-9 w-9  fill-red-500 hover:fill-red-700' />
                        </span>
                    </div>
                </DialogTitle>
                <DialogContent className='bg-[#f1f2f9]'>
                    <form action="" onSubmit={FBhandleSubmit} id="subscription-form" className=''>
                        <div className='flex gap-4 mt-4 mb-2'>
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
                            <TextField
                                className='shadow-lg my-1'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1, py: 1.2 }, // text-slate-100

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
                            <TextField
                                className='shadow-lg my-1'
                                sx={{
                                    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                    input: { color: '#3c3c3c', p: 1, py: 1.2 }, // text-slate-100

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
                        </div>

                        <div className='grid grid-cols-4 gap-4 mt-4 mb-2'>

                            <FormControl fullWidth variant="outlined" className='shadow-lg'>
                                <InputLabel
                                    id="priority-label"
                                    sx={{
                                        '&.MuiInputLabel-shrink': {
                                            transform: 'translate(14px, -14px) scale(0.75)', // posição padrão do MUI
                                        },
                                    }}
                                >
                                    Prioridade
                                </InputLabel>
                                <Select
                                    label="Prioridade"
                                    id="priority"
                                    name="priority"
                                    variant="outlined"
                                    required
                                    value={priority}
                                    onChange={(e) => { setPriority(e.target.value) }}
                                    sx={{
                                        p: 0.2,
                                        "& .MuiSelect-icon": {
                                            color: "black",
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: "#1c1c1c",
                                                "& .MuiMenuItem-root": {
                                                    opacity: '75%',
                                                    "&.Mui-selected": {
                                                        backgroundColor: "#2e2e3e", // background do option selecionado
                                                        color: "white", //cor do texto do option selecionado
                                                        fontWeight: 'bold',
                                                        opacity: '100%',
                                                    },
                                                    "&:hover": {
                                                        backgroundColor: "gray", // background do option ao passar mouse por cima
                                                        fontWeight: 'bold',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {allPriorities.map((prios) => (
                                        <MenuItem key={prios.value} value={prios.value} sx={{
                                            backgroundColor: '#1c1c1c',
                                            color: '#f1f5f9',
                                            '&:hover': {
                                                backgroundColor: '#2b2b2b',
                                            },
                                        }}>
                                            {prios.label}
                                        </MenuItem>
                                    )
                                    )}
                                </Select>
                            </FormControl>

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
                                    value={platform}
                                    onChange={(e) => { setPlatform(e.target.value) }}
                                    sx={{

                                        p: 0.2,
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
                                {notInicialized.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                )
                                )}
                            </TextField>
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
                            <Button onClick={resetarForm}>Resetar</Button>
                            <Button className='' type="submit" onClick={enviarJogo}>+ ADD Jooj P/ Jogar</Button>
                            {/* <Button className='' type="submit" onClick={addJogo}>+ ADD Jooj</Button> */}
                        </DialogActions>

                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddGameModalParaJogar;