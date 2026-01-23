import { z } from 'zod';

export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~])/;

export const noSpaceRegex = /^\S*$/;

export const noAccentsRegex = /^[\x00-\x7F]*$/;

const msgErro = "Mínimo: 1 hora";
const msgErro2 = "Ano mínimo: 2010-2026"
const msgErro3 = "Ano mínimo: 1980-2026"

export const finishedFieldValue = z.union([
    z.literal("Sem ano"),
    z.number().min(2010, msgErro2).max(2026, "Máximo 2026").int(),
    z.undefined().transform((val) => (val === "" ? undefined : val)), // Se for "", vira undefined
    z.literal(0) // Para o estado inicial quando muda para Finalizado

]);
export const normalizeYear = (val: unknown): number | "Sem ano" => {
    if (val === null || val === undefined || val === false) return "Sem ano"; // se val for nulo ou indefinido retorna cuzao

    if (typeof val === "string") { // se o tipo primitivo de val foi "string"
        const v = val.trim();      // ele tira o espaços em branco
        if (v === "") return "Sem ano"; // se só for espaço em branco retorna cuzao
        const n = Number(v);          // tentar numerificar o valor se tiver tipo isso EX: "2" 
        if (!isNaN(n)) return Math.trunc(n); // Se não for isNaN (eu acho) retorna esse calculo ai
        // if (!Number(v) && typeof val !== "string") return "cuzcuz"
        // if (isNaN(n)) return "Sem ano"
    }

    if (typeof val === "number") {
        return Math.trunc(val);
    }

    return "Sem ano";
};

// Remove qualquer caractere que não seja número
export const normalizeOnlyNumbers = (val: string | number): number => {
    if (typeof val === "number") return val;
    const onlyNumbers = val.replace(/\D/g, ""); // Remove tudo que não é dígito
    return onlyNumbers === "" ? 0 : Number(onlyNumbers);
};


// Esquema de validações para modal de adicionar jogo jogado
export const gameSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Nome deve ter no mínimo 1 caractere"),

    hours_played: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is required"
            : msgErro
    }).min(1, msgErro),

    hours_expected: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is required"
            : msgErro
    }).min(1, msgErro),

    // priority: z.union([z.string().min(1, "Defina a prioridade do jogo")]).nullable().optional(),
    priority: z.string().min(1, "Defina a prioridade do jogo").nullable(),
    replayed: z.string().min(1, "Defina se está jogando pela 1ª vez ou não"),
    platform: z.string().min(1, "Escolha a plataforma do jogo"),
    genre: z.string().min(1, "Escolha o gênero do jogo"),
    status: z.string().min(1, "Defina o estado atual da gameplay"),

    release_year: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is required"
            : msgErro3
    }).min(1980, msgErro3).max(2026, msgErro3),

    year_started: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is requiresd"
            : msgErro2
    }).min(2000, msgErro2).max(2026, msgErro2)
    // .refine((val) => { val >= data.y })
    ,

    year_finished: finishedFieldValue.optional(),

    // background_image: z.instanceof(FileList).optional(),
    // background_image: z.string().optional()

    // background_image: z
    // .any()
    // .transform((files) => (files instanceof FileList ? files[0] : files))
    // // .refine((file) => {
    // //   if (!file) return true; // Permite opcional
    // //   return file.size <= 5000000; // Exemplo: limite 5MB
    // // }, "O arquivo deve ter no máximo 5MB")
    // .refine((file) => {
    //   if (!file) return true;
    //   return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    // }, "Somente arquivos .jpg, .png ou .webp são aceitos")
    // .optional(),
    // gameImageInput: z.string().optional(),
})
    .superRefine((data, ctx) => {
        const hasFinished = typeof data.year_finished === 'number' && data.year_finished < 2026

        // 1.1. Released_year precisa ser igual ou menor que os outros dois
        if (data.release_year > data.year_started)
            ctx.addIssue({
                code: 'custom',
                message: "Ano de lançamento maior que ano iniciado",
                path: ["release_year"], // O erro aparecerá no campo released_year
            })
        // ctx.addIssue({
        //     code: 'custom',
        //     message: "Ano de lançamento maior que ano iniciado",
        //     path: ["year_started"], // O erro aparecerá no campo released_year
        // })
        // 1.2. Released_year precisa ser igual ou menor que os outros dois
        if (hasFinished && data.release_year > Number(data.year_finished))
            ctx.addIssue({
                code: 'custom',
                message: "Ano de lançamento maior que ano finalizado",
                path: ["release_year"], // O erro aparecerá no campo released_year
            })
        // 2.2. Year_started precisa ser igual ou menor que o finished
        if (hasFinished && data.year_started > Number(data.year_finished)) {
            ctx.addIssue({
                code: 'custom',
                message: "Ano de início maior que ano finalizado",
                path: ["year_finished"], // O erro aparecerá no campo released_year
            })
        }
        // if (hasFinished && typeof data.year_finished !== 'number' ) {
        //     ctx.addIssue({
        //         code: 'custom',
        //         message: "Ano inválido",
        //         path: ["year_finished"], // O erro aparecerá no campo released_year
        //     })
        // }
        // if ( data.year_finished > data.year_started) {
        //     ctx.addIssue({
        //         code: z.ZodIssueCode.custom,
        //         message: "Ano de início maior que ano finalizado",
        //         path: ["year_started"], // O erro aparecerá no campo released_year
        //     })
        // }
    })
// .refine((data) => {
//     return data.release_year <= data.year_started
// },{ message: "Passwords don't match",
//     path: ["release_year"], // path of error
//   });

export const gameAttSchema = z.object({
    name: z.string().min(1, "Nome deve ter no mínimo 1 caractere").optional(),

    hours_played: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is required"
            : msgErro
    }).min(1, msgErro).default(1).optional(),

    hours_expected: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is required"
            : msgErro
    }).min(1, msgErro).optional(),

    priority: z.string().min(1, "Defina a prioridade do jogo").optional(),
    replayed: z.string().min(1, "Defina se está jogando pela 1ª vez ou não").optional(),
    platform: z.string().min(1, "Escolha a plataforma do jogo").optional(),
    genre: z.string().min(1, "Escolha o gênero do jogo").optional(),
    status: z.enum(["Finalizado", "Jogando", "Pausado", "Abandonado", "Não iniciado"]).optional(),

    release_year: z.number().min(1980, msgErro3).max(2026, msgErro3).optional(),
    year_started: z.number().min(2000, msgErro2).max(2026, msgErro2).optional(),
    year_finished: finishedFieldValue.optional(),
    // background_image: z.string().optional(),
})
    .superRefine((data, ctx) => {
        const hasFinished = typeof data.year_finished === 'number' && data.year_finished < 2026
        // const lancamentoNumber = typeof data.release_year === 'number'

        // 1.1. Released_year precisa ser igual ou menor que os outros dois
        if (typeof data.release_year === 'number' && typeof data.year_started === 'number' && data.release_year > data.year_started)
            ctx.addIssue({
                code: 'custom',
                message: "Ano de lançamento maior que ano iniciado",
                path: ["release_year"], // O erro aparecerá no campo released_year
            })
        // ctx.addIssue({
        //     code: 'custom',
        //     message: "Ano de lançamento maior que ano iniciado",
        //     path: ["year_started"], // O erro aparecerá no campo released_year
        // })
        // 1.2. Released_year precisa ser igual ou menor que os outros dois
        if (hasFinished && typeof data.release_year === 'number' && data.release_year > Number(data.year_finished))
            ctx.addIssue({
                code: 'custom',
                message: "Ano de lançamento maior que ano finalizado",
                path: ["release_year"], // O erro aparecerá no campo released_year
            })
        // 2.2. Year_started precisa ser igual ou menor que o finished
        if (hasFinished && typeof data.year_started === 'number' && data.year_started > Number(data.year_finished)) {
            ctx.addIssue({
                code: 'custom',
                message: "Ano finalizado menor que ano de início",
                path: ["year_finished"], // O erro aparecerá no campo released_year
            })
        }
        if (Number(data.year_finished) > 2026) {
            ctx.addIssue({
                code: 'custom',
                message: "Ano maior que 2026",
                path: ["year_finished"], // O erro aparecerá no campo released_year
            })
        }
    })
    .refine((data) => {
        if (data.status === "Finalizado" && data.year_finished === "Sem ano") {
            return false; // Erro: Se finalizou, precisa de um ano
        }
        return true;
    }, {
        message: "Ano é obrigatório para jogos finalizados",
        path: ["year_finished"]
    })

export const gameToPlaySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Nome deve ter no mínimo 1 caractere"),

    hours_expected: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is required"
            : msgErro
    }).min(1, msgErro),

    release_year: z.number({
        error: (issue) => issue.input === undefined
            ? "This field is required"
            : msgErro3
    }).min(1980, msgErro3).max(2026, msgErro3),

    priority: z.string().min(1, "Defina a prioridade do jogo"),
    replayed: z.string().min(1, "Defina se está jogando pela 1ª vez ou não"),
    platform: z.string().min(1, "Escolha a plataforma do jogo"),
    genre: z.string().min(1, "Escolha o gênero do jogo"),

    // background_image: z.string(),
})


const hoursField = z.preprocess((val) => {
    if (val === null || val === undefined) return 'Sem horas'
    if (typeof val === 'string') {
        const v = val.trim()
        if (v === '') return 'Sem horas'
        const n = Number(v)
        if (!isNaN(n)) return n
    }
    if (typeof val === 'number') return val
    return 'Sem horas'
}, z.union([z.literal('Sem horas'), z.number().positive()]))


const yearSchema = z
    .preprocess(
        (value) => {
            if (value === "" || value === null || value === undefined) {
                return undefined;
            }
            const numberValue = Number(value);
            return isNaN(numberValue) ? undefined : numberValue;
        },
        z
            .number()
            .min(2000, "Ano mínimo é 2000")
            .max(2026, "Ano máximo é 2026")
    );



// Schema para atualizar jogo (modalAttJogo)
export const gamePayload3Schema = z.object({
    name: z.string().trim().min(1, 'Nome do jogo é obrigatório'),
    hours_played: hoursField,
    hours_expected: hoursField,
    priority: z.string().trim().min(1, 'Prioridade é obrigatória'),
    platform: z.string().trim().min(1, 'Plataforma é obrigatória'),
    genre: z.string().trim().min(1, 'Gênero é obrigatório'),
    status: z.string().trim().min(1, 'Status é obrigatório'),
    release_year: z.preprocess((val) => {
        if (val === null || val === undefined) return 'Sem ano'
        if (typeof val === 'string') {
            const v = val.trim()
            if (v === '') return 'Sem ano'
            const n = Number(v)
            if (!isNaN(n)) return Math.trunc(n)
        }
        if (typeof val === 'number') return Math.trunc(val)
        return 'Sem ano'
    }, z.union([z.literal('Sem ano'), z.number().int()])),
    replayed: z.string().trim().optional(),
    year_started: hoursField.optional(),
    year_finished: hoursField.optional(),
    background_image: z.string().trim().optional(),
});


// const finishedFieldValue = z.preprocess((val) => {
export type GamePayload3Validated = z.infer<typeof gamePayload3Schema>;
