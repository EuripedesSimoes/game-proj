import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
// import API from '@/services/gameApiServices';
// import type { GamePayload3 } from '@/interfaces/gameDataTypes';
// import { FaRegWindowClose } from 'react-icons/fa';

import { FaPencilAlt } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import Select from '@mui/material/Select';
import { allPlatforms, allStatus, allGenres, allPriorities, isReplayedList } from '@/services/listasParaFiltro';

import { useQueryClient } from '@tanstack/react-query';
import { collection, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { gameAttSchema, normalizeOnlyNumbers, normalizeYear } from '@/helpers/gameFormSchemas'

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firebaseConfig } from '@/services/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";

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
            // background_image: data?.background_image || '',
        }
    })

    const queryClient = useQueryClient() // <--- novo

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp)

    // 1. Obter o usuário logado
    const [user] = useAuthState(auth);; // Assume que useAuth() retorna o objeto de usuário

    if (!user?.uid) {
        alert("Você precisa estar logado para adicionar jogos!");
        return;
    }

    // 1.1. Pegar o link da imagem atual do jogo
    const gameDocRef = doc(db, 'users', user.uid, 'jogos', data?.id || gameId);
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
        const storageRef = ref(storage, `users/${user.uid}/jogos/${Date.now()}_${file.name}`);

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
        alert('Salvando jogo para o usuário: ' + user.uid + 'de nome: ' + user.displayName);

        // 2.1. Criar a referência da subcoleção
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

            await updateDoc(doc(userJogosCollectionRef, gameId), {
                ...data,
                background_image: finalImageUrl // Link que funciona em qualquer lugar
            });
            setRefreshImage(prev => prev + 1);
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

    // useEffect que executa quando 'data' muda e recarrega a página ou após o reset() do onSubmit()
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
            // background_image: data?.background_image || '',
        })
    }, [data, reset]) // 


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
    // const imagemFundo = watch('background_image')

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

                        <div className='grid grid-cols-2 gap-2 pb-2 mb-2'>
                            {/* <div className='flex flex-row items-center gap-3 text-xs '> */}

                            {currentBackgroundImage && currentBackgroundImage !== '' && (
                                <div className='flex flex-col items-center border-r-4 border-[#b6b6b6]'>
                                    <span className='w-full flex justify-center text-lg font-bold'>Imagem Atual</span>
                                    <img src={currentBackgroundImage} className='object-cover object-center w-[150px] h-[150px] rounded-lg' alt="Imagem de fundo atual" />
                                </div>
                            )}


                            <div className={`grid grid-cols-4 items-center gap-3 text-xs ${currentBackgroundImage && currentBackgroundImage !== '' && 'border-l-4 border-[#b6b6b6]'}`}>

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
                                        <span>↑</span>
                                        <span>Add imagens</span>
                                    </button>
                                    <input type="file" name="background_image" id="background_image" accept='image/*' className='hidden'
                                        onChange={((ev) => setProjectImage(handleImageInput(ev)))} />

                                </div>
                            </div>

                        </div>

                        <div>
                            <DialogActions className='max-[400px]:flex max-[400px]:flex-col max-[400px]:mt-4 max-[400px]:border-t-3 border-black/60 gap-2'>
                                <Button className='' type="submit" >+ ATT Jooj</Button>
                            </DialogActions>
                        </div>
                        {/* </div> */}
                        <progress value={progress} max="100" />
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AttGameModal;