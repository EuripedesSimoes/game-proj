import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
// import API from '@/services/gameApiServices';
// import type { GamePayload2 } from '@/interfaces/gameDataTypes';
import { RiCloseCircleLine } from "react-icons/ri";
import { FaClock } from 'react-icons/fa';
import Select from '@mui/material/Select';
import { allPriorities, allPlatforms, allStatus, allGenres, isReplayedList } from '@/services/listasParaFiltro';

import { useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { gameSchema, normalizeOnlyNumbers, normalizeYear } from '@/helpers/gameFormSchemas'
// import { ms } from 'zod/v4/locales';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firebaseConfig } from '@/services/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import '../../tailwindColors.css'

export type FormData = z.infer<typeof gameSchema>;

export default function ZodAddGameModal() {

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(gameSchema),
    })

    const queryClient = useQueryClient() // <--- novo
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp)
    // const jogosParaJogar = collection(db, 'joojs') // referência à coleção 'jogos-para-jogar' no Firestore

    // 1. Obter o usuário logado
    const [user] = useAuthState(auth);; // Assume que useAuth() retorna o objeto de usuário

    // onSubmit receberá dados já validados pelo Zod via react-hook-form
    const onSubmit = async (data: FormData) => {
        // const ske = FormDataEvent.get('hours_played')

        if (!user?.uid) {
            alert("Você precisa estar logado para adicionar jogos!");
            return;
        }
        alert('Salvando jogo para o usuário: ' + user.displayName + '\n' + 'de nome: ' + user.displayName);

        // 2. Criar a referência da subcoleção
        // collection(db, 'users', user.uid, 'joojs') aponta para users/{uid}/joojs
        const userJogosCollectionRef = collection(db, 'users', user.uid, 'jogos');

        try {
            let finalImageUrl = "";

            // 1. Se o usuário escolheu uma imagem, fazemos o upload agora
            if (imageFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `users/${user.uid}/jogos/${Date.now()}_${imageFile.name}`);

                // AGUARDA o upload terminar
                const snapshot = await uploadBytes(storageRef, imageFile);

                // PEGA o link permanente da imagem no Firebase
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }

            await addDoc(userJogosCollectionRef, {
                ...data,
                background_image: finalImageUrl // Link que funciona em qualquer lugar
            });
            reset()
            setImageFile(null);
            setPreviewURL(null);
            handleClose()
            queryClient.invalidateQueries({ queryKey: ['users', user.uid, 'jogos'] })
        }
        catch (err) {
            console.error('Erro ao salvar jogo:', err)
        }
    }

    const [open, setOpen] = useState(false);
    const handleClickOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const horasJogadas = watch("hours_played");
    const horasEsperada = watch("hours_expected");
    const anoLancado = watch("release_year");
    const anoStartado = watch("year_started");
    // const anoFin = watch("year_finished");
    // const pri = watch('priority')
    const statusWatch = watch('status')
    // const gameIMG = watch('background_image')
    const anoFinalizado = watch('year_finished')

    useEffect(() => {
        if (statusWatch !== "Finalizado") {
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
    }, [statusWatch, setValue, anoFinalizado]);

    const [projectImage, setProjectImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null); // Guardamos o ARQUIVO real
    const [previewURL, setPreviewURL] = useState<string | null>(null); // Guardamos o PREVIEW (blob)

    function triggerImageInput(id: string) {
        document.getElementById('background_image')?.click();
    }

    function handleImageInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file); // Salva o arquivo para usar no onSubmit
            setPreviewURL(URL.createObjectURL(file)); // Gera o preview visual
        }
        return null
    }

    return (
        <div className='w-full h-full flex flex-col justify-center items-center'>
            <Button onClick={handleClickOpen}>Adicionar Jogo</Button>

            {/* Adicionar backdropblur-md */}
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
                            <RiCloseCircleLine className='h-9 w-9  fill-red-500 hover:fill-red-700' />
                        </span>
                    </div>
                </DialogTitle>

                <DialogContent className='bg-[#f1f2f9]'>

                    <form action="" onSubmit={handleSubmit(onSubmit)} id="subscription-form" className=''>

                        <div className='grid grid-cols-4 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className='col-span-2'>
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
                                        "& .MuiInputBase-input": {
                                            color: "rgb(var(--color-text-variant))", // text color
                                            // backgroundColor: "rgb(var(--color-background-variant))", // background color branco
                                        },
                                        "& .MuiInputBase-input-webkit-autofill,  & input:-webkit-autofill:focus, & textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus, & select:-webkit-autofill, & select:-webkit-autofill:hover, & select:-webkit-autofill:focus": {
                                            WebkitTextFillColor: 'rgb(var(--color-text-variant))',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.5) inset',
                                        },
                                        "& .MuiInputBase-input-webkit-autofill, & input:-webkit-autofill": {
                                            WebkitTextFillColor: '#3c3c3c',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.7) inset',
                                        },
                                        "& .MuiInputLabel-root": {
                                            marginTop: '2px',
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            fontWeight: '600',
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
                                        '& .MuiOutlinedInput-root': {
                                            // '& fieldset': { borderColor: '#334155' }, // border-slate-700
                                            '&:hover fieldset': { borderColor: '#64748b' }, // hover border
                                            '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "rgb(var(--color-text-variant))", // text color
                                            // backgroundColor: "rgb(var(--color-background-variant))", // background color branco
                                        },
                                        "& .MuiInputBase-input-webkit-autofill,  & input:-webkit-autofill:focus, & textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus, & select:-webkit-autofill, & select:-webkit-autofill:hover, & select:-webkit-autofill:focus": {
                                            WebkitTextFillColor: 'rgb(var(--color-text-variant))',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.5) inset',
                                        },
                                        "& .MuiInputBase-input-webkit-autofill, & input:-webkit-autofill": {
                                            WebkitTextFillColor: '#3c3c3c',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.7) inset',
                                        },
                                        "& .MuiInputLabel-root": {
                                            marginTop: '2px',
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            fontWeight: '600',
                                        },
                                    }}
                                    {...register('hours_played', { valueAsNumber: true })}
                                    // error={!!errors.hours_played}
                                    // helperText={errors.hours_played?.message}
                                    // autoFocus
                                    value={isNaN(horasJogadas) ? '' : horasJogadas}
                                    margin="dense"
                                    id="hours_played"
                                    name="hours_played"
                                    label="Horas jogadas"
                                    type="text"
                                    variant="standard"
                                />
                                {errors.hours_played?.message && <p className='flex items-center gap-2 text-sm font-medium text-red-600'>
                                    <FaClock className='size-3' /> {errors.hours_played?.message}
                                </p>}
                            </div>

                            <div className='col-span-1'>
                                <TextField
                                    className='shadow-lg my-1'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1.2 }, // text-slate-100
                                        '& .MuiOutlinedInput-root': {
                                            // '& fieldset': { borderColor: '#334155' }, // border-slate-700
                                            '&:hover fieldset': { borderColor: '#64748b' }, // hover border
                                            '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "rgb(var(--color-text-variant))", // text color
                                            // backgroundColor: "rgb(var(--color-background-variant))", // background color branco
                                        },
                                        "& .MuiInputBase-input-webkit-autofill,  & input:-webkit-autofill:focus, & textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus, & select:-webkit-autofill, & select:-webkit-autofill:hover, & select:-webkit-autofill:focus": {
                                            WebkitTextFillColor: 'rgb(var(--color-text-variant))',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.5) inset',
                                        },
                                        "& .MuiInputBase-input-webkit-autofill, & input:-webkit-autofill": {
                                            WebkitTextFillColor: '#3c3c3c',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.7) inset',
                                        },
                                        "& .MuiInputLabel-root": {
                                            marginTop: '2px',
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            fontWeight: '600',
                                        },
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

                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div className=' md:col-span-1'>
                                <FormControl fullWidth variant="outlined" className='shadow-lg md:col-span-2 font-bold' >
                                    <InputLabel
                                        id="priority-label"
                                        sx={{
                                            '&.MuiInputLabel-shrink': {
                                                transform: 'translate(10px, -15.5px) scale(0.75)', // posição padrão do MUI
                                                fontWeight: '600',
                                            },
                                        }}
                                    >
                                        Prioridade
                                    </InputLabel>
                                    <Select
                                        {...register('priority')}
                                        label="Prioridade.."
                                        id="priority"
                                        name="priority"
                                        variant="outlined"
                                        // defaultValue={FieldValue}
                                        sx={{
                                            p: 0.2,
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backgroundColor: "#1c1c1c",
                                                    "& .MuiMenuItem-root": {
                                                        opacity: '75%',
                                                        "&.Mui-selected": {
                                                            backgroundColor: "#2e2e4e", // background do option selecionado
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
                            </div>

                            <div className=''>

                                <FormControl fullWidth variant="outlined" className='shadow-lg' >
                                    <InputLabel
                                        id="replayed-label"
                                        sx={{
                                            '&.MuiInputLabel-shrink': {
                                                transform: 'translate(10px, -15.5px) scale(0.75)', // posição padrão do MUI
                                                fontWeight: '600',
                                            },
                                        }}
                                    >
                                        Rejogado?
                                    </InputLabel>
                                    <Select
                                        {...register('replayed')}
                                        label="Rejogado?.."
                                        id="replayed"
                                        name="replayed"
                                        variant="outlined"
                                        sx={{
                                            p: 0.2,
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backgroundColor: "#1c1c1c",
                                                    "& .MuiMenuItem-root": {
                                                        opacity: '75%',
                                                        "&.Mui-selected": {
                                                            backgroundColor: "#2e2e4e", // background do option selecionado
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

                        <div className='grid md:grid-cols-3 gap-4 mt-2 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div>
                                <FormControl fullWidth variant="outlined" className='shadow-lg' >
                                    <InputLabel
                                        id="plataforma-label"
                                        sx={{
                                            '&.MuiInputLabel-shrink': {
                                                transform: 'translate(10px, -15.5px) scale(0.75)', // posição padrão do MUI
                                                fontWeight: '600',
                                            },
                                        }}
                                    >
                                        Plataforma
                                    </InputLabel>
                                    <Select
                                        {...register('platform')}
                                        label="Plataforma.."
                                        id="platform"
                                        name="platform"
                                        variant="outlined"
                                        // className={`bg-yellow-200`}
                                        sx={{
                                            // "& .MuiSelect-icon": {
                                            //     color: "black",
                                            // },
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
                                                            backgroundColor: "#2e2e4e", // background do option selecionado
                                                            color: "white", //cor do texto do option selecionado
                                                            fontWeight: 'bold',
                                                            opacity: '100%',
                                                        },
                                                        "&:hover": {
                                                            // transform: "translateY(4px) time(0.9s)",  //muda nada
                                                            backgroundColor: "gray", // background do option ao passar mouse por cima
                                                            //color: "red", //cor do texto do option ao passar mouse por cima
                                                            fontWeight: 'bold',
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
                                                transform: 'translate(10px, -15.5px) scale(0.75)', // posição padrão do MUI
                                                fontWeight: '600',
                                            },
                                        }}
                                    >
                                        Gênero
                                    </InputLabel>
                                    <Select
                                        className='shadow-lg'
                                        sx={{
                                            backgroundColor: '#f1f5f9',
                                            //input: { color: '#3c3c3c' }, // text-slate-100
                                            '& .MuiInputLabel-root': {
                                                // color: '#2563eb',
                                            },
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
                                                            backgroundColor: "#2e2e4e", // background do option selecionado
                                                            color: "white", //cor do texto do option selecionado
                                                            fontWeight: 'bold',
                                                            opacity: '100%',
                                                        },
                                                        "&:hover": {
                                                            // transform: "translateY(4px) time(0.9s)",  //muda nada
                                                            backgroundColor: "gray", // background do option ao passar mouse por cima
                                                            //color: "red", //cor do texto do option ao passar mouse por cima
                                                            fontWeight: 'bold',
                                                        },
                                                    },
                                                },
                                            },
                                        }}
                                        {...register('genre')}
                                        label="Gênero.."
                                        id="genre"
                                        name="genre"
                                        variant="outlined"
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
                                    </Select>
                                </FormControl>

                                {errors.genre?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.genre?.message}</p>}

                            </div>

                            <div>
                                <FormControl fullWidth variant="outlined" className='shadow-lg' >
                                    <InputLabel
                                        id="status-label"
                                        sx={{
                                            '&.MuiInputLabel-shrink': {
                                                transform: 'translate(10px, -15.5px) scale(0.75)', // posição padrão do MUI
                                                fontWeight: '600',
                                            },
                                        }}
                                    >
                                        Status
                                    </InputLabel>
                                    <Select
                                        className='shadow-lg'
                                        sx={{
                                            backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                            input: { color: '#3c3c3c' }, // text-slate-100
                                        }}
                                        // autoFocus
                                        {...register('status')}
                                        id="status"
                                        name="status"
                                        label="Status.."
                                        variant="outlined"
                                    >
                                        {allStatus.map((status) => (
                                            <MenuItem key={status.value} value={status.value}>
                                                {status.label}
                                            </MenuItem>
                                        )
                                        )}
                                    </Select>
                                </FormControl>

                                {errors.status?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.status?.message}</p>}
                            </div>

                        </div>

                        <div className='grid grid-cols-3 gap-4 mt-2 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100
                                        '& .MuiOutlinedInput-root': {
                                            // '& fieldset': { borderColor: '#334155' }, // border-slate-700
                                            '&:hover fieldset': { borderColor: '#64748b' }, // hover border
                                            '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "rgb(var(--color-text-variant))", // text color
                                            // backgroundColor: "rgb(var(--color-background-variant))", // background color branco
                                        },
                                        "& .MuiInputBase-input-webkit-autofill,  & input:-webkit-autofill:focus, & textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus, & select:-webkit-autofill, & select:-webkit-autofill:hover, & select:-webkit-autofill:focus": {
                                            WebkitTextFillColor: 'rgb(var(--color-text-variant))',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.5) inset',
                                        },
                                        "& .MuiInputBase-input-webkit-autofill, & input:-webkit-autofill": {
                                            WebkitTextFillColor: '#3c3c3c',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.7) inset',
                                        },
                                        "& .MuiInputLabel-root": {
                                            marginTop: '2px',
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            fontWeight: '600',
                                        },
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

                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100
                                        '& .MuiOutlinedInput-root': {
                                            // '& fieldset': { borderColor: '#334155' }, // border-slate-700
                                            '&:hover fieldset': { borderColor: '#64748b' }, // hover border
                                            '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "rgb(var(--color-text-variant))", // text color
                                            // backgroundColor: "rgb(var(--color-background-variant))", // background color branco
                                        },
                                        "& .MuiInputBase-input-webkit-autofill,  & input:-webkit-autofill:focus, & textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus, & select:-webkit-autofill, & select:-webkit-autofill:hover, & select:-webkit-autofill:focus": {
                                            WebkitTextFillColor: 'rgb(var(--color-text-variant))',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.5) inset',
                                        },
                                        "& .MuiInputBase-input-webkit-autofill, & input:-webkit-autofill": {
                                            WebkitTextFillColor: '#3c3c3c',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.7) inset',
                                        },
                                        "& .MuiInputLabel-root": {
                                            marginTop: '2px',
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            fontWeight: '600',
                                        },
                                    }}
                                    {...register('year_started', { valueAsNumber: true })}
                                    // autoFocus
                                    value={isNaN(anoStartado) ? '' : anoStartado}
                                    margin="dense"
                                    id="year_started"
                                    name="year_started"
                                    label="Ano Iniciado"
                                    type="text"
                                    variant="standard"
                                />

                                {errors.year_started?.message && <p className='text-sm font-medium text-red-600 pt-1'>{errors.year_started?.message}</p>}
                            </div>

                            <div>
                                <TextField
                                    className='shadow-lg'
                                    sx={{
                                        backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
                                        input: { color: '#3c3c3c', p: 1 }, // text-slate-100
                                        '& .MuiOutlinedInput-root': {
                                            // '& fieldset': { borderColor: '#334155' }, // border-slate-700
                                            '&:hover fieldset': { borderColor: '#64748b' }, // hover border
                                            '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
                                        },
                                        "& .MuiInputBase-input": {
                                            color: "rgb(var(--color-text-variant))", // text color
                                            // backgroundColor: "rgb(var(--color-background-variant))", // background color branco
                                        },
                                        "& .MuiInputBase-input-webkit-autofill,  & input:-webkit-autofill:focus, & textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus, & select:-webkit-autofill, & select:-webkit-autofill:hover, & select:-webkit-autofill:focus": {
                                            WebkitTextFillColor: 'rgb(var(--color-text-variant))',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.5) inset',
                                        },
                                        "& .MuiInputBase-input-webkit-autofill, & input:-webkit-autofill": {
                                            WebkitTextFillColor: '#3c3c3c',
                                            WebkitBoxShadow: '0 0 0px 1000px rgba(var(--color-background-autofill), 0.7) inset',
                                        },
                                        "& .MuiInputLabel-root": {
                                            marginTop: '2px',
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                            fontWeight: '600',
                                        },
                                    }}
                                    {...register("year_finished", {
                                        setValueAs: normalizeYear,
                                    })}
                                    // {...register("year_finished", { valueAsNumber: true })}
                                    // value={anoStartado === undefined ? 2010 : anoStartado}
                                    // autoFocus
                                    margin="dense"
                                    id="year_finished"
                                    name="year_finished"
                                    label="Ano Finalizado"
                                    type="text"
                                    variant="standard"
                                    disabled={statusWatch !== "Finalizado" && true}
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
                            <div className='flex flex-row items-center gap-3 text-xs '>
                                <div className='w-[150px] h-[150px] rounded-xl bg-black/60 overflow-hidden'>
                                    {previewURL ? (
                                        <img src={previewURL} className='object-cover object-center' />)
                                        :
                                        (<button type='button' onClick={() => triggerImageInput('background_image')} className='w-full h-full' >150x150</button>)
                                    }
                                </div>
                                <button type='button' onClick={() => triggerImageInput('background_image')}>
                                    <span>↑</span>
                                    <span>Add imagens</span>
                                </button>
                                <input type="file" name="background_image" id="background_image" accept='image/*' className='hidden'
                                    onChange={((ev) => setProjectImage(handleImageInput(ev)))} />
                            </div>
                        </div>

                        <DialogActions className='max-[400px]:flex max-[400px]:flex-col max-[400px]:mt-4 max-[400px]:border-t-3 border-black/60 gap-2'>
                            {/* <Button className='max-[400px]:w-42 bg-red-500' onClick={resetarForm}>Resetar</Button> */}
                            <Button className='max-[400px]:w-54' type="submit">+ Adicionar Jogo</Button>
                        </DialogActions>

                    </form>
                </DialogContent>
            </Dialog>
        </div >
    )
}
