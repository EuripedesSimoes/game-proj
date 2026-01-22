import { useEffect, useState, type SetStateAction } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useQueryClient } from '@tanstack/react-query';
import API from '@/services/gameApiServices';
// import { FaRegWindowClose } from 'react-icons/fa';

import { FaPencilAlt, FaEraser } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import Select from '@mui/material/Select';
import { allPlatforms, allStatus, allGenres, allPriorities, isReplayedList } from '@/services/listasParaFiltro';
import type { GamePayload3 } from '@/interfaces/gameDataTypes';
import { collection, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { gameAttSchema, normalizeOnlyNumbers, normalizeYear } from '@/helpers/gameFormSchemas'

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebaseConfig';
import { getStorage } from 'firebase/storage';

type AttProps = {
    gameId: any;
    data: {
        id: string
        name: string;
        hours_played: number | string | undefined;
        hours_expected: number | string | undefined;
        priority: string;
        platform: string;
        genre: string;
        status: any;
        replayed: string
        release_year: number | string | undefined;
        year_started: number | string | undefined;
        year_finished?: number | string | undefined;
        background_image?: string;
    };
}

export type FormData = z.infer<typeof gameAttSchema>;

const AttGameModal = ({ gameId, data }: AttProps) => {

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(gameAttSchema),

        defaultValues: {
            name: data?.name || '',
            hours_played: data?.hours_played ? Number(data.hours_played) : undefined,
            hours_expected: data?.hours_expected ? Number(data.hours_expected) : undefined,
            priority: data?.priority || '',
            replayed: data?.replayed || '',
            platform: data?.platform || '',
            genre: data?.genre || '',
            status: data?.status,
            release_year: data?.release_year ? Number(data.release_year) : undefined,
            year_started: data?.year_started ? Number(data.year_started) : undefined,
            year_finished: typeof data?.year_finished === 'string' ? "Sem ano" : typeof data?.year_finished === 'number' ? Number(data.year_finished) : undefined,
            background_image: data?.background_image || '',
        }
    })

    const queryClient = useQueryClient() // <--- novo

    const firebaseConfig = {
        apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
        authDomain: "my-game-list-6fd0f.firebaseapp.com",
        projectId: "my-game-list-6fd0f",
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp)
    // const storage = getStorage(firebaseApp);
    //const jogosColeRef = collection(db, 'joojs') // referência à coleção 'joojs' no Firestore

    // 1. Obter o usuário logado
    const [user] = useAuthState(auth);; // Assume que useAuth() retorna o objeto de usuário

    // onSubmit receberá dados já validados pelo Zod via react-hook-form
    const onSubmit = async (data: FormData) => {

        if (!user?.uid) {
            alert("Você precisa estar logado para adicionar jogos!");
            return;
        }
        alert('Salvando jogo para o usuário: ' + user.uid + 'de nome: ' + user.displayName);

        // 2. Criar a referência da subcoleção
        // collection(db, 'users', user.uid, 'joojs') aponta para users/{uid}/joojs
        const userJogosCollectionRef = collection(db, 'users', user.uid, 'jogos');

        try {
            queryClient.invalidateQueries({ queryKey: ['users', user.uid, 'jogos'] })
            await updateDoc(doc(userJogosCollectionRef, gameId), data as any)
            // resetarForm()
            reset()
            handleClose()
        } catch (err) {
            console.error('Erro ao salvar jogo:', err)
        }
    }
    useEffect(() => {
        reset({
            name: data?.name || '',
            hours_played: data?.hours_played ? Number(data.hours_played) : undefined,
            hours_expected: data?.hours_expected ? Number(data.hours_expected) : undefined,
            priority: data?.priority || '',
            replayed: data?.replayed || '',
            platform: data?.platform || '',
            genre: data?.genre || '',
            status: data?.status || '',
            release_year: data?.release_year ? Number(data.release_year) : undefined,
            year_started: data?.year_started ? Number(data.year_started) : undefined,
            year_finished: typeof data?.year_finished === 'string' ? "Sem ano" : typeof data?.year_finished === 'number' ? Number(data.year_finished) : undefined,
            background_image: data?.background_image || '',
        })
    }, [data, reset]) // Executa quando 'data' muda


    const [open, setOpen] = useState(false);
    const handleClickOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    // Usando o watch() para ler os valores:
    const nomeJogo = watch('name')
    const horasJogadas = watch('hours_played')
    const horasEsperadas = watch('hours_expected')
    const prioridade = watch('priority')
    const rejogado = watch('replayed')
    const plataforma = watch('platform')
    const genero = watch('genre')
    const statusJogo = watch('status')
    const anoLancado = watch('release_year')
    const anoIniciado = watch('year_started')
    const anoFinalizado = watch('year_finished')
    const imagemFundo = watch('background_image')


    useEffect(() => {
        if (statusJogo !== "Finalizado") {
            // Se não está finalizado, forçamos a string
            setValue("year_finished", "Sem ano");
        } else {
            // Se mudou para "Finalizado"
            if (anoFinalizado === "Sem ano") {
                // Aqui você decide: 0 para campo vazio ou 1 conforme sua lógica anterior
                // Usar o normalize garante que o valor seja tratado como número pelo Zod
                const valorInicial = normalizeOnlyNumbers(""); // Retornará o fallback da sua função (0 ou 1)
                setValue("year_finished", valorInicial);
            }
        }
    }, [statusJogo, setValue, anoFinalizado]);
    // Nota sobre o Firebase: Ao enviar "Sem ano", o Firebase salvará como string. 
    // Se preferir economizar espaço, você pode transformar "Sem ano" em null dentro da função onSubmit antes de enviar para a API.

    return (
        <>

            {/* na vdd aqui tem que clicar para abrir o modal pleo handleOpen, e no fim do modal chamadr o AttJooj(game.id!) */}
            <Button className='bg-slate-500/60 m-2' onClick={handleClickOpen}>
                <span>
                    <FaPencilAlt className="h-6.5 w-6.5 text-white/80" />
                </span>
            </Button>

            <Dialog open={open} onClose={handleClose} className='bg-slate-500/95'>
                <DialogTitle sx={{ m: 0, p: 1.5, fontWeight: "bold" }} >
                    <div className='flex justify-between items-center'>
                        Atualizar Jogo
                        <span onClick={handleClose} className='hover:cursor-pointer'>
                            <RiCloseCircleLine className='h-9 w-9  fill-red-500 hover:fill-red-700' />
                        </span>
                    </div>
                </DialogTitle>
                <DialogContent className='bg-[#f1f2f9]'>

                    <form action="" onSubmit={handleSubmit(onSubmit)} id="subscription-form" className=''>

                        <div className='grid grid-cols-4 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

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
                                    value={nomeJogo}
                                    onChange={(e) => {
                                        // setNome_jogo(e.target.value) // remover todos os controladores de estado e botar setvalue
                                        setValue('name', e.target.value)
                                    }}
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
                                    {...register('hours_played', {
                                        // Garante que o valor final seja sempre um número antes de validar
                                        setValueAs: normalizeOnlyNumbers,
                                    })}
                                    margin="dense"
                                    id="hours_played"
                                    name="hours_played"
                                    label="Horas jogadas"
                                    type="text"
                                    variant="standard"
                                    value={horasJogadas === 0 ? "" : horasJogadas}
                                    onChange={(e) => {
                                        const cleanedValue = e.target.value.replace(/\D/g, "");
                                        // Se o usuário apagar tudo, você pode decidir se deixa vazio ou coloca 0
                                        setValue('hours_played', cleanedValue === "" ? 0 : Number(cleanedValue));
                                    }} />
                                {errors.hours_played?.message && <p className='text-sm font-medium text-red-600'>{errors.hours_played?.message}</p>}
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
                                // onChange={(e) => {
                                //     const inputVal = e.target.value;
                                //     // Aplicamos a normalização e atualizamos o estado do React Hook Form
                                //     const cleaned = normalizeOnlyNumbers(inputVal);

                                //     // Usamos o cleaned para atualizar o valor que o usuário vê
                                //     setValue('hours_expected', cleaned);
                                // }}
                                />
                                {errors.hours_expected?.message && <p className='text-sm font-medium text-red-600'>{errors.hours_expected?.message}</p>}
                            </div>

                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className=' md:col-span-1'>
                                <FormControl fullWidth variant="outlined" className='shadow-lg md:col-span-2' >
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
                                        value={prioridade}
                                        onChange={(e) => setValue('priority', e.target.value)}
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

                                {errors.priority?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.priority?.message}</p>}
                            </div>

                            <div className=' md:col-span-1'>
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
                                        value={rejogado}
                                        onChange={(e) => setValue('replayed', e.target.value)}
                                    >
                                        {isReplayedList.map((isRep) => (
                                            <MenuItem key={isRep.value} value={isRep.value}
                                                sx={{
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

                        <div className='grid grid-cols-3 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className=''>
                                <select
                                    className='shadow-lg h-14 w-full border-1 border-black/30 rounded-sm'
                                    {...register('platform')}
                                    id="platform"
                                    name="platform"
                                    value={plataforma}
                                    onChange={(e) => setValue('platform', e.target.value)}
                                >
                                    {allPlatforms.map((plats) => (
                                        <option key={plats.value} value={plats.value}>
                                            {plats.label}
                                        </option>
                                    )
                                    )}
                                </select>
                                {errors.platform?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.platform?.message}</p>}
                            </div>

                            <div>
                                <select
                                    className='shadow-lg h-14 w-full border-1 border-black/30 rounded-sm'
                                    {...register('genre')}
                                    // select
                                    id="genre"
                                    name="genre"
                                    value={genero}
                                    onChange={(e) => setValue('genre', e.target.value)}
                                // label="Gênero"
                                // type="text"
                                // variant="outlined"
                                >
                                    {
                                        allGenres.map((genre) => (
                                            <option key={genre.value} value={genre.value}>
                                                {genre.label}
                                            </option>
                                        ))
                                    }
                                </select>
                                {errors.genre?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.genre?.message}</p>}
                            </div>

                            <div>
                                <select
                                    className='shadow-lg h-14 w-full border-1 border-black/30 rounded-sm'
                                    {...register('status')}
                                    id="status"
                                    name="status"
                                    value={statusJogo}
                                // onChange={(e) => {setValue('status', e.target.value); setFinalizado(statusJogo !== "Finalizado" ? false : true)}}
                                >
                                    {allStatus.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    )
                                    )}
                                </select>
                                {errors.status?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.status?.message}</p>}
                            </div>

                        </div>

                        <div className='grid grid-cols-3 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>
                            {/* ano de lançamento */}
                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100
                                    }}
                                    // autoFocus
                                    {...register('release_year', {
                                        // Garante que o valor final seja sempre um número antes de validar
                                        setValueAs: normalizeOnlyNumbers,
                                    })}
                                    margin="dense"
                                    id="release_year"
                                    name="release_year"
                                    label="Ano Lançamento"
                                    type="text"
                                    variant="standard"
                                    value={anoLancado === 0 ? "" : anoLancado}
                                    onChange={(e) => {
                                        const cleanedValue = e.target.value.replace(/\D/g, "");
                                        // Se o usuário apagar tudo, você pode decidir se deixa vazio ou coloca 0
                                        setValue('release_year', cleanedValue === "" ? 0 : Number(cleanedValue));
                                    }}
                                />
                                {errors.release_year?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.release_year?.message}</p>}
                            </div>
                            {/* ano iniciado */}
                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                    }}
                                    // autoFocus
                                    {...register('year_started', {
                                        // Garante que o valor final seja sempre um número antes de validar
                                        setValueAs: normalizeOnlyNumbers,
                                    })}
                                    margin="dense"
                                    id="year_started"
                                    name="year_started"
                                    label="Ano Iniciado"
                                    type="text"
                                    variant="standard"
                                    value={anoIniciado === 0 ? "" : anoIniciado}
                                    onChange={(e) => {
                                        const cleanedValue = e.target.value.replace(/\D/g, "");
                                        // Se o usuário apagar tudo, você pode decidir se deixa vazio ou coloca 0
                                        setValue('year_started', cleanedValue === "" ? 0 : Number(cleanedValue));
                                    }}
                                />
                                {errors.year_started?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.year_started?.message}</p>}
                            </div>
                            {/* ano finalizado */}
                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                    }}
                                    {...register('year_finished', {
                                        setValueAs: normalizeYear,
                                    })}
                                    // autoFocus
                                    margin="dense"
                                    id="year_finished"
                                    name="year_finished"
                                    label="Ano Finalizado"
                                    type="text"
                                    variant="standard"
                                    disabled={statusJogo !== "Finalizado" && true}
                                    // value={status !== "Finalizado" && year_finished === 'abc2' ? 'abc' : status === "Finalizado" && year_finished === 0}                                
                                    value={anoFinalizado === 0 ? "" : anoFinalizado}
                                    onChange={(e) => {
                                        const cleanedValue = e.target.value.replace(/\D/g, "");
                                        // Se o usuário apagar tudo, você pode decidir se deixa vazio ou coloca 0
                                        setValue('year_finished', cleanedValue === "" ? 0 : Number(cleanedValue));
                                    }}
                                />
                                {errors.year_finished?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.year_finished?.message}</p>}
                            </div>
                        </div>

                        <div>
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
                                onChange={(e) => setValue('background_image', e.target.value)}
                            />
                            {errors.background_image?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.background_image?.message}</p>}
                        </div>

                        <DialogActions className='max-[400px]:flex max-[400px]:flex-col max-[400px]:mt-4 max-[400px]:border-t-3 border-black/60 gap-2'>
                            <Button className='' type="submit" >+ ATT Jooj</Button>
                            {/* <Button onClick={handleClose}>Close</Button> */}
                        </DialogActions>

                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}



export default AttGameModal;
