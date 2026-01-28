import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
// import API from '@/services/gameApiServices';
// import type { GamePayload3 } from '@/interfaces/gameDataTypes';
// import { FaRegWindowClose } from 'react-icons/fa';
// import { FaClock } from 'react-icons/fa';
import { FaDownload, FaPencilAlt } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import Select from '@mui/material/Select';
import { allPlatforms, allGenres, allPriorities, isReplayedList } from '@/services/listasParaFiltro';

import { useQueryClient } from '@tanstack/react-query';
import { collection, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { gameToPlaySchema, normalizeOnlyNumbers } from '@/helpers/gameFormSchemas'

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firebaseConfig } from '@/services/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";

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
    const [priority, setPriority] = useState(data?.priority || '')
    const [platform, setPlatform] = useState<string>(data?.platform || '')
    const [genre, setGenre] = useState<string>(data?.genre || '')
    const [replayed, setReplayed] = useState<string>(data?.replayed || '')
    const [release_year, setRelease_year] = useState<number | string>(data?.release_year || '')

    const queryClient = useQueryClient() // <--- novo
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp)
    // const storage = getStorage(firebaseApp);
    // const jogosParaJogarColeRef = collection(db, 'jogos-para-jogar') // referência à coleção 'jogos-para-jogar' no Firestore

    // 1. Obter o usuário logado
    const [user] = useAuthState(auth);; // Assume que useAuth() retorna o objeto de usuário

    if (!user?.uid) {
        alert("Você precisa estar logado para adicionar jogos!");
        return;
    }

    // 1.1. Pegar o link da imagem atual do jogo
    const gameDocRef = doc(db, 'users', user.uid, 'jogos-para-jogar', data?.id || gameId);
    const [refreshImage, setRefreshImage] = useState(0);

    // 1.1.2. Estado para armazenar a URL da imagem atual
    const [currentBackgroundImage, setCurrentBackgroundImage] = useState<string | null>(null);

    // 1.1.3. Função para buscar apenas o background_image do documento do jogo
    const fetchImageFb = async () => {
        try {
            const docSnap = await getDoc(gameDocRef);
            if (docSnap.exists()) {
                const docData = docSnap.data();
                return docData.background_image || null; // Retorna a URL ou null se não existir
            }
            return null;
        } catch (err) {
            console.error('Erro ao buscar imagem do Firebase:', err);
            return null;
        }
    };

    // 1.1.4. Adiciona refreshImage como dependência para forçar refetch
    useEffect(() => {
        const loadImage = async () => {
            const imageUrl = await fetchImageFb();
            setCurrentBackgroundImage(imageUrl);
        };
        loadImage();
    }, [data?.id, refreshImage]);

    // 1.1.5 No componente, criar um estado para o progresso, para a barra de progresso
    const [progress, setProgress] = useState<number>(0);
    const uploadImage = (file: File) => {
        const storage = getStorage();
        const storageRef = ref(storage, `users/${user.uid}/jogos-para-jogar/${Date.now()}_${file.name}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Cálculo da porcentagem
                    const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setProgress(prog);
                },
                (error) => reject(error),
                async () => {
                    // Upload concluído, pega a URL final
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    };

    // 2. onSubmit receberá dados já validados pelo Zod via react-hook-form
    const onSubmit = async (data: FormData) => {

        if (!user?.uid) {
            alert("Você precisa estar logado para adicionar jogos!");
            return;
        }
        alert('Alterando informações de jogo para jogar no futuro para o usuário: ' + user.displayName + '\n' + 'de nome: ' + user.displayName);

        // 2.1. Criar a referência da subcoleção
        // collection(db, 'users', user.uid, 'joojs') aponta para users/{uid}/jogos-para-jogar
        const userJogosParaJogarCollectionRef = collection(db, 'users', user.uid, 'jogos-para-jogar');

        try {
            let finalImageUrl = "";

            // 1. Se o usuário escolheu uma imagem, fazemos o upload agora
            if (imageFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `users/${user.uid}/jogos-para-jogar/${Date.now()}_${imageFile.name}`);

                // AGUARDA o upload terminar
                const snapshot = await uploadBytes(storageRef, imageFile);

                // PEGA o link permanente da imagem no Firebase
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }

            queryClient.invalidateQueries({ queryKey: ['users', user.uid, 'jogos-para-jogar'] })
            await updateDoc(doc(userJogosParaJogarCollectionRef, gameId), {
                ...data,
                background_image: finalImageUrl // Link que funciona em qualquer lugar
            });
            setRefreshImage(prev => prev + 1);
            reset()
            setImageFile(null);
            setPreviewURL(null);
            FBhandleClose()
            queryClient.invalidateQueries({ queryKey: ['users', user.uid, 'jogos-para-jogar'] })
        }
        catch (err) {
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

    // Usando o watch() para ler o valor:
    const horasEsperadas = watch('hours_expected')

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

                        <div className='grid grid-cols-4 gap-4 mt-4 mb-2 py-2 border-b-4 border-[#b6b6b6]'>

                            {/* nome do jogo*/}
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
                                    value={nome_jogo}
                                    onChange={(e) => setNome_jogo(e.target.value)}
                                />
                                {errors.name?.message && <p className='text-sm font-medium text-red-600'>{errors.name?.message}</p>}
                            </div>
                            {/* horas esperadas */}
                            <div className=' col-span-1'>
                                <TextField
                                    className='shadow-lg col-span-2'
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
                            <div className=' col-span-1'>
                                <TextField
                                    className='shadow-lg'
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
                                        value={priority}
                                        onChange={(e) => { setPriority(e.target.value) }}
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
                                                transform: 'translate(10px, -15.5px) scale(0.75)', // posição padrão do MUI
                                                fontWeight: '600',
                                            },
                                        }}
                                    >
                                        Rejogado?
                                    </InputLabel>
                                    <Select
                                        {...register('replayed')}
                                        label="Rejogado.."
                                        id="replayed"
                                        name="replayed"
                                        variant="outlined"
                                        value={replayed}
                                        onChange={(e) => { setReplayed(e.target.value) }}
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
                                        value={platform}
                                        onChange={(e) => { setPlatform(e.target.value) }}
                                        sx={{
                                            p: 0.2,
                                            // label:{ color: 'violet'},
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
                                                transform: 'translate(10px, -15.5px) scale(0.75)', // posição padrão do MUI
                                                fontWeight: '600',
                                            },
                                        }}
                                    >
                                        Gênero
                                    </InputLabel>
                                    <Select
                                        {...register('genre')}
                                        label="Gênero.."
                                        id="genre"
                                        name="genre"
                                        variant="outlined"
                                        value={genre}
                                        onChange={(e) => { setGenre(e.target.value) }}
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

                        <div className='grid grid-cols-2 gap-2 pb-2 mb-2'>
                            {/* <div className='flex flex-row items-center gap-3 text-xs '> */}

                            {currentBackgroundImage && currentBackgroundImage !== '' && (
                                <div className='flex flex-col items-center border-r-4 border-[#b6b6b6]'>
                                    <span className='w-full flex justify-center text-lg font-bold'>Imagem Atual</span>
                                    <img src={currentBackgroundImage} className='object-cover object-center w-[150px] h-[150px] rounded-lg' alt="Imagem de fundo atual" />
                                </div>
                            )}


                            <div className={`grid grid-cols-4 items-center gap-2 text-xs ${currentBackgroundImage && currentBackgroundImage !== '' && 'border-l-4 border-[#b6b6b6]'}`}>

                                <div className='col-span-3 flex flex-col items-center'>

                                    <span className='w-full flex justify-center text-lg font-bold'>Nova Imagem</span>

                                    <div className='w-[150px] h-[150px] rounded-lg bg-black/60 overflow-hidden'>
                                        {previewURL ? (
                                            <img src={previewURL} className='object-cover object-center' />)
                                            :
                                            (<button type='button' onClick={() => triggerImageInput('background_image')} className='w-full h-full' >150x150</button>)
                                        }
                                    </div>

                                </div>

                                <div className='col-span-1 flex flex-col items-center'>

                                    <button type='button' onClick={() => triggerImageInput('background_image')}>
                                        <span className='flex justify-center px-2 py-0.5'><FaDownload className='size-6' /></span>
                                        <span className='text-base flex justify-center px-2 py-0.5'>Adicionar imagem</span>
                                    </button>
                                    <input type="file" name="background_image" id="background_image" accept='image/*' className='hidden'
                                        onChange={((ev) => setProjectImage(handleImageInput(ev)))} />

                                </div>
                            </div>

                        </div>

                        <div>
                            <DialogActions className='bg-teal-400/60 max-[400px]:flex max-[400px]:flex-col max-[400px]:mt-4 max-[400px]:border-t-3 border-black/60 gap-2'>
                                <Button className='' type="submit" >+ Atualizar jogo P/ jogar</Button>
                            </DialogActions>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}



export default AttGameModalParaJogar;
