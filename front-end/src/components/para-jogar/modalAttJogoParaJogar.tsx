import { useEffect, useState, type SetStateAction } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useQueryClient } from '@tanstack/react-query';
import API from '@/services/gameApiServices';
// import { FaRegWindowClose } from 'react-icons/fa';
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import Select from '@mui/material/Select';
import { allPlatforms, allStatus, allGenres, allPriorities, isReplayedList } from '@/services/listasParaFiltro';
import type { GamePayload3 } from '@/interfaces/gameDataTypes';
import { collection, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { gameToPlaySchema, normalizeOnlyNumbers, normalizeYear } from '@/helpers/gameFormSchemas'
import { FaClock } from 'react-icons/fa';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebaseConfig';
import { getStorage } from 'firebase/storage';

type AttProps = {
    gameId: any;
    data: {
        id: string
        name: string;
        // hours_played?: number | string;
        hours_expected: number | string | undefined;
        priority: string;
        platform: string;
        genre: string;
        status: string;
        replayed: string;
        release_year: number | string;
        // year_started?: number | string;
        // year_finished?: number | string;
        background_image?: string;
    };
}

export type FormData = z.infer<typeof gameToPlaySchema>;

const AttGameModalParaJogar = ({ gameId, data }: AttProps) => {

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(gameToPlaySchema),

        defaultValues: {
            hours_expected: data?.hours_expected ? Number(data.hours_expected) : undefined,
        }
    })

    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    const [nome_jogo, setNome_jogo] = useState<string>(data?.name || '')
    // const [hours_expected, setHours_expected] = useState<number | string>(data?.hours_expected || '')
    const [priority, setPriority] = useState(data?.priority || '')
    const [platform, setPlatform] = useState<string>(data?.platform || '')
    const [genre, setGenre] = useState<string>(data?.genre || '')
    const [replayed, setReplayed] = useState<string>(data?.replayed || '')
    const [release_year, setRelease_year] = useState<number | string>(data?.release_year || '')
    // const [background_image, setBackground_image] = useState<string>(data?.background_image || '')

    const queryClient = useQueryClient() // <--- novo

    const firebaseConfig = {
        apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
        authDomain: "my-game-list-6fd0f.firebaseapp.com",
        projectId: "my-game-list-6fd0f",
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp)
    // const storage = getStorage(firebaseApp);
    // const jogosParaJogarColeRef = collection(db, 'jogos-para-jogar') // referência à coleção 'jogos-para-jogar' no Firestore

    // 1. Obter o usuário logado
    const [user] = useAuthState(auth);; // Assume que useAuth() retorna o objeto de usuário

    const onSubmit = async (data: FormData) => {

        if (!user?.uid) {
            alert("Você precisa estar logado para adicionar jogos!");
            return;
        }
        alert('Alterando informações de jogo para jogar no futuro para o usuário: ' + user.displayName + '\n' + 'de nome: ' + user.displayName);

        // 2. Criar a referência da subcoleção
        // collection(db, 'users', user.uid, 'joojs') aponta para users/{uid}/jogos-para-jogar
        const userJogosParaJogarCollectionRef = collection(db, 'users', user.uid, 'jogos-para-jogar');

        try {
            queryClient.invalidateQueries({ queryKey: ['users', user.uid, 'jogos-para-jogar'] })
            await updateDoc(doc(userJogosParaJogarCollectionRef, gameId), data as any)
            // resetarForm()
            reset()
            FBhandleClose()
        } catch (err) {
            console.error('Erro ao salvar jogo:', err)
        }
    }
    useEffect(() => {
        reset({
            hours_expected: data?.hours_expected ? Number(data.hours_expected) : undefined,
        })
    }, [data, reset]) // Executa quando 'data' muda

    const [open, setOpen] = useState(false);
    const FBhandleClickOpen = () => setOpen(true)
    const FBhandleClose = () => setOpen(false)


    // Usando o watch() para ler os valores:
    // const nomeJogo = watch('name')
    const horasEsperadas = watch('hours_expected')
    // const anoLancado = watch('release_year')
    // const prioridade = watch('priority')
    // const rejogado = watch('replayed')
    // const plataforma = watch('platform')
    // const genero = watch('genre')
    const imagemFundo = watch('background_image')

    return (
        <>

            {/* na vdd aqui tem que clicar para abrir o modal pleo handleOpen, e no fim do modal chamadr o AttJooj(game.id!) */}
            <Button className='bg-slate-500/60 m-2' onClick={FBhandleClickOpen}>
                <span>
                    <FaPencilAlt className="h-6.5 w-6.5 text-white/80" />
                </span>
            </Button>
            <Dialog open={open} onClose={FBhandleClose} className='bg-slate-500/95'>
                <DialogTitle sx={{ m: 0, p: 1.5, fontWeight: "bold" }} >
                    <div className='flex justify-between items-center'>
                        Atualizar Jogo Para Jogar
                        <span onClick={FBhandleClose} className='hover:cursor-pointer'>
                            <RiCloseCircleLine className='h-9 w-9  fill-red-500 hover:fill-red-700' />
                        </span>
                    </div>
                </DialogTitle>

                <DialogContent className='bg-[#f1f2f9]'>

                    <form action="" onSubmit={handleSubmit(onSubmit)} id="subscription-form" className=''>

                        <div className='grid grid-cols-3 md:flex gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className=' col-span-2'>
                                <TextField
                                    className='shadow-lg my-1 col-span-4'
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
                                    {...register('name')}
                                    fullWidth
                                    margin="dense"
                                    id="name"
                                    name="name"
                                    label="Nome do Jogo"
                                    type="text"
                                    variant="standard"
                                    value={nome_jogo}
                                    onChange={(e) => setNome_jogo(e.target.value)}
                                />
                                {errors.name?.message && <p className='text-sm font-medium text-red-600'>{errors.name?.message}</p>}
                            </div>

                            <div className=' col-span-1'>
                                <TextField
                                    className='shadow-lg col-span-2'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                    }}
                                    // autoFocus
                                    {...register('hours_expected', {
                                        // Garante que o valor final seja sempre um número antes de validar
                                        setValueAs: normalizeOnlyNumbers,
                                    })}
                                    margin="dense"
                                    id="hours_expected"
                                    name="hours_expected"
                                    label="Horas esperadas"
                                    type="text"
                                    variant="standard"
                                    value={horasEsperadas === 0 ? "" : horasEsperadas}
                                    onChange={(e) => {
                                        const cleanedValue = e.target.value.replace(/\D/g, "");
                                        // Se o usuário apagar tudo, você pode decidir se deixa vazio ou coloca 0
                                        setValue('hours_expected', cleanedValue === "" ? 0 : Number(cleanedValue));
                                    }}
                                />
                                {errors.hours_expected?.message && <p className='text-sm font-medium text-red-600'>{errors.hours_expected?.message}</p>}
                            </div>

                            {/* ano de lançamento */}
                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100
                                    }}
                                    // autoFocus
                                    {...register('release_year', { valueAsNumber: true })}
                                    margin="dense"
                                    id="release_year"
                                    name="release_year"
                                    label="Ano Lançamento"
                                    type="text"
                                    variant="standard"
                                    value={release_year}
                                    onChange={(e) => setRelease_year(e.target.value)}
                                />
                                {errors.release_year?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.release_year?.message}</p>}
                            </div>

                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className='col-span-1'>
                                <FormControl fullWidth variant="outlined" className='shadow-lg md:col-span-2'>
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
                                        {...register('priority')}
                                        label="Prioridade"
                                        id="priority"
                                        name="priority"
                                        variant="outlined"
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
                                {errors?.priority?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.priority?.message}</p>}
                            </div>

                            <div className='col-span-1'>
                                <FormControl fullWidth variant="outlined" className='shadow-lg ' >
                                    <InputLabel
                                        id="replayed-label"
                                        sx={{
                                            '&.MuiInputLabel-shrink': {
                                                transform: 'translate(14px, -14px) scale(0.75)', // posição padrão do MUI
                                            },
                                        }}
                                    >
                                        Rejogado?
                                    </InputLabel>
                                    <Select
                                        {...register('replayed')}
                                        label="Rejogado"
                                        id="replayed"
                                        name="replayed"
                                        variant="outlined"
                                        value={replayed}
                                        onChange={(e) => { setReplayed(e.target.value) }}
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
                                        {isReplayedList.map((isRep) => (
                                            <MenuItem key={isRep.value} value={isRep.value} sx={{
                                                backgroundColor: '#1c1c1c',
                                                color: '#f1f5f9',
                                                '&:hover': {
                                                    backgroundColor: '#2b2b2b',
                                                },
                                            }}>
                                                {isRep.label}
                                            </MenuItem>
                                        )
                                        )}
                                    </Select>
                                </FormControl>
                                {errors.replayed?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.replayed?.message}</p>}
                            </div>

                        </div>

                        <div className='grid md:grid-cols-2 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className='col-span-1'>
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
                                        {...register('platform')}
                                        label="Plataforma"
                                        id="platform"
                                        name="platform"
                                        variant="outlined"
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
                                {errors.platform?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.platform?.message}</p>}
                            </div>

                            <div className='col-span-1'>
                                <FormControl fullWidth variant="outlined" className='shadow-lg ' >
                                    <InputLabel
                                        id="genre-label"
                                        sx={{
                                            '&.MuiInputLabel-shrink': {
                                                transform: 'translate(14px, -14px) scale(0.75)', // posição padrão do MUI
                                            },
                                        }}
                                    >
                                        Gênero
                                    </InputLabel>
                                    <Select
                                        {...register('genre')}
                                        label="Gênero"
                                        id="genre"
                                        name="genre"
                                        variant="outlined"
                                        value={genre}
                                        onChange={(e) => { setGenre(e.target.value) }}
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
                                        {allGenres.map((genre) => (
                                            <MenuItem key={genre.value} value={genre.value} sx={{
                                                backgroundColor: '#1c1c1c',
                                                color: '#f1f5f9',
                                                '&:hover': {
                                                    backgroundColor: '#2b2b2b',
                                                },
                                            }}>
                                                {genre.label}
                                            </MenuItem>
                                        )
                                        )}
                                    </Select>
                                </FormControl>
                                {errors.genre?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.genre?.message}</p>}
                            </div>

                            {/* <TextField
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
                            </TextField> */}
                        </div>

                        <div className='flex flex-row justify-between relative'>
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
                                {...register('background_image')}
                                margin="dense"
                                fullWidth
                                id="background_image"
                                name="background_image"
                                label="Foto da Capa (URL)"
                                type="text"
                                variant="standard"
                                value={imagemFundo}
                                onChange={
                                    (e) => { setValue('background_image', e.target.value) }
                                }
                            />
                            {errors.background_image?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.background_image?.message}</p>}

                            <div className='absolute top-0 right-0 h-full focus:border-red-400'>
                                <button type='button' className='h-full ' onClick={() => {
                                    // setBackground_image('')
                                    setValue('background_image', '')
                                }}>
                                    <FaTrashAlt size='28px' fill='red' />
                                </button>
                            </div>
                        </div>

                        <div>
                            <DialogActions className='bg-teal-400/60 max-[400px]:flex max-[400px]:flex-col max-[400px]:mt-4 max-[400px]:border-t-3 border-black/60 gap-2'>
                                <Button className='' type="submit" >+ ATT Jooj P/ jogar</Button>
                            </DialogActions>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}



export default AttGameModalParaJogar;
