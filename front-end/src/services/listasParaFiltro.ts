    // passar essas listas pra algum helper ou coisa assim
    const allPriorities = [
         {
            value: '1ª Prioridade',
            label: '1ª Prioridade'
        },
        {
            value: '2ª Prioridade',
            label: '2ª Prioridade'
        },
        {
            value: '3ª Prioridade ',
            label: '3ª Prioridade '
        },
        {
            value: '4ª - Talvez algum dia',
            label: '4ª - Talvez algum dia'
        },
        {
            value: '5ª - Talvez pelo nome',
            label: '5ª - Talvez pelo nome'
        }
    ]
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
        },
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
    const notInicialized = [
        {
            value: 'Não Iniciado',
            label: 'Não Iniciado'
        },
    ]
    const isReplayedList = [
        {
            value: 'Não',
            label: '1ª vez jogando'
        },
        {
            value: 'Sim', // verdadeiro valor que será passado para a API do Firebase
            label: 'Rejoga(n)do' // label que será mostrada no formulário, na parte dos selects dos modais de ADD e ATT (sem relação com o <FilterComponent>)
        }
    ]

    export { allPriorities, allPlatforms, allStatus, allGenres, notInicialized, isReplayedList }


    // ANTIGO SELECT DA MODAL_ADD_JOGO.tsx
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