import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useQueryClient } from '@tanstack/react-query';
import API from '@/services/gameApiServices';
// import { FaRegWindowClose } from 'react-icons/fa';
import { RiCloseCircleLine } from "react-icons/ri";
import Select from '@mui/material/Select';
import { allPriorities, allPlatforms, allGenres, notInicialized, isReplayedList } from '@/services/listasParaFiltro';
import type { GamePayload2 } from '@/interfaces/gameDataTypes';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { gameToPlaySchema } from '@/helpers/gameFormSchemas'
import { FaClock } from 'react-icons/fa';

// OK-passar pra algum helper ou coisa assim
// type GamePayload2 = { name: string; etc...}

type Props = {
    addJogo?: () => void //excluir?
}

export type FormData = z.infer<typeof gameToPlaySchema>;

export default function AddGameModalParaJogar({ addJogo }: Props) {

    const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm<FormData>({
        resolver: zodResolver(gameToPlaySchema),
    })

    const queryClient = useQueryClient()


    const firebaseConfig = {
        apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
        authDomain: "my-game-list-6fd0f.firebaseapp.com",
        projectId: "my-game-list-6fd0f",
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp)
    const jogosParaJogarColeRef = collection(db, 'jogos-para-jogar') // referência à coleção 'jogos-para-jogar' no Firestore
    // PASSAR PARA O ARQUIVO formAddGame.tsx 
    // async function enviarJogo(e?: React.MouseEvent<HTMLButtonElement>) {
    //     e?.preventDefault();
    //     const payload: GamePayload2 = {
    //         name: addjogo, //'Octopath Traveler',
    //         hours_expected: hours_expected || '', //60,
    //         priority: priority,
    //         platform: platform, //'Switch',   SELECT AQUI COM VÁRIAS OPÇÕES
    //         genre: genre, // 'JPRG',   SELECT AQUI COM VÁRIAS OPÇÕES
    //         //is_completed: is_completed , //false,
    //         release_year: release_year || '', // 2017,
    //         status: status, //'In Progress',
    //         replayed: replayed, //Não,
    //         background_image: background_image, //''
    //     }
    //     await addDoc(jogosParaJogarColeRef, payload);

    //     // Invalidar a query para forçar um refetch automático
    //     queryClient.invalidateQueries({ queryKey: ['jogos-para-jogar'] })

    //     resetarForm()
    //     FBhandleClose()
    // }

    // async function handleSubmit() {
    //     setErrors2({})
    //     setSubmitError('')

    //     try {
    //         const validatedData = gamePayload2Schema.parse({
    //             name: addjogo,
    //             hours_expected: String(hours_expected).trim(),
    //             priority: priority,
    //             platform: platform,
    //             genre: genre,
    //             status: status,
    //             release_year: String(release_year).trim(),
    //             replayed: replayed,
    //             background_image: background_image,
    //         })

    //         const payload: GamePayload2 = {
    //             name: validatedData.name,
    //             hours_expected: validatedData.hours_expected,
    //             priority: validatedData.priority,
    //             platform: validatedData.platform,
    //             genre: validatedData.genre,
    //             status: validatedData.status,
    //             release_year: validatedData.release_year,
    //             replayed: validatedData.replayed || '',
    //             background_image: validatedData.background_image || '',
    //         }

    //         await addDoc(jogosParaJogarColeRef, payload)
    //         queryClient.invalidateQueries({ queryKey: ['jogos-para-jogar'] })
    //         resetarForm()
    //         FBhandleClose()
    //     } catch (error: any) {
    //         if (error.errors2) {
    //             const formErrors2: Record<string, string> = {}
    //             error.errors2.forEach((err: any) => {
    //                 const path = err.path.join('.')
    //                 formErrors2[path] = err.message
    //             })
    //             setErrors2(formErrors2)
    //         } else {
    //             setSubmitError('Erro ao validar formulário. Verifique os campos.')
    //         }
    //     }
    // }
    const onSubmit = async (data: FormData) => {
        try {
            await addDoc(jogosParaJogarColeRef, data as any)
            reset()
            // resetarForm()
            FBhandleClose()
            queryClient.invalidateQueries({ queryKey: ['jogos-para-jogar'] })
        } catch (err) {
            console.error('Erro ao salvar jogo:', err)
        }
    }

    const [open, setOpen] = useState(false);
    const FBhandleClickOpen = () => setOpen(true)
    const FBhandleClose = () => setOpen(false)
    const FBhandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        FBhandleClose();

    };

    const horasEsperada = watch("hours_expected");
    const anoLancado = watch("release_year");
    const pri = watch('priority')
    // console.log('anofin', anoFin)

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

                    <form action="" onSubmit={handleSubmit(onSubmit)} id="subscription-form" className=''>

                        <div className='grid grid-cols-4 md:flex gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className=' col-span-4'>
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
                                    {...register('name')}
                                    fullWidth
                                    margin="dense"
                                    id="name"
                                    name="name"
                                    label="Nome do Jogo"
                                    type="text"
                                    variant="standard"
                                />
                                {errors.name?.message && <p className='text-sm font-medium text-red-600'>{errors.name?.message}</p>}
                            </div>
                            
                            <div className='col-span-1'>
                                <TextField
                                    className='shadow-lg my-1'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1.2 }, // text-slate-100

                                    }}
                                    {...register('hours_expected', { valueAsNumber: true })}
                                    // error={!!errors.hours_expected}
                                    // helperText={errors.hours_expected?.message}
                                    // autoFocus
                                    value={isNaN(horasEsperada) ? '' : horasEsperada}

                                    margin="dense"
                                    id="hours_expected"
                                    name="hours_expected"
                                    label="Horas esperadas"
                                    type="text"
                                    variant="standard"
                                />
                                {errors.hours_expected?.message && <p className='flex items-center gap-2 text-sm font-medium text-red-600'>
                                    <FaClock className='size-3' /> {errors.hours_expected?.message}
                                </p>}
                            </div>

                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100

                                    }}
                                    {...register('release_year', { valueAsNumber: true })}
                                    // autoFocus
                                    value={isNaN(anoLancado) ? '' : anoLancado}
                                    margin="dense"
                                    id="release_year"
                                    name="release_year"
                                    label="Ano Lançamento"
                                    type="text"
                                    variant="standard"
                                />

                                {errors.release_year?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.release_year?.message}</p>}
                            </div>

                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className='md:col-span-1'>
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
                                        // defaultValue={FieldValue}

                                        // required
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
                                            <MenuItem key={prios.value} value={prios.value}
                                                sx={{
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
                                {/* {pri === null && <p className='text-sm font-medium text-red-600 pt-1'>skibd</p>} */}
                            </div>

                            <div className='md:col-span-1'>

                                <FormControl fullWidth variant="outlined" className='shadow-lg' >
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
                                        label="Rejogado?"
                                        id="replayed"
                                        name="replayed"
                                        variant="outlined"
                                        // required
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

                        <div className='grid md:grid-cols-2 gap-4 mt-2 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div>
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
                                        label="Plataforma..."
                                        id="platform"
                                        name="platform"
                                        variant="outlined"
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

                                {errors.platform?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.platform?.message}</p>}
                            </div>

                            <div>
                                <FormControl fullWidth variant="outlined" className='shadow-lg' >
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
                                        label="Gênero..."
                                        id="genre"
                                        name="genre"
                                        variant="outlined"
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
                            />

                            {errors.background_image?.message && <p className='text-sm font-medium text-red-600'>{errors.background_image?.message}</p>}
                        </div>

                        <DialogActions className='max-[400px]:flex max-[400px]:flex-col max-[400px]:mt-4 max-[400px]:border-t-3 border-black/60 gap-2'>
                            {/* <Button className='max-[400px]:w-42 bg-red-500' onClick={resetarForm}>Resetar</Button> */}
                            <Button className='max-[400px]:w-54' type="submit">+ ADD Jooj P/ Jogar</Button>
                            {/* <Button className='' type="submit" onClick={addJogo}>+ ADD Jooj</Button> */}
                        </DialogActions>

                        {/* <Button className='max-[400px]:w-54' type="submit" onClick={handleSubmit}>+ ADD Jooj P/ Jogar</Button> */}
                    </form>
                </DialogContent>
            </Dialog>

            
        </div>
    )
}
