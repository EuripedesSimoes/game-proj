import { z } from 'zod';

// Schema para validar e transformar campos numéricos
// Se vazio, retorna "Sem horas"; se preenchido, valida número (positivo)


export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~])/;

export const noSpaceRegex = /^\S*$/;

export const noAccentsRegex = /^[\x00-\x7F]*$/;


export const releaseYearField = z.union([
    z.literal("Sem ano"),
    z.number().int(),
]);
 export const normalizeYear = (val: unknown): number | "Sem ano" => {
    if (val === null || val === undefined) return "Sem ano";

    if (typeof val === "string") {
        const v = val.trim();
        if (v === "") return "Sem ano";
        const n = Number(v);
        if (!isNaN(n)) return Math.trunc(n);
    }

    if (typeof val === "number") {
        return Math.trunc(val);
    }

    return "Sem ano";
};

const msgErro = "Mínimo: 1 hora";
const msgErro2 = "Ano mínimo: 2010-2026"
const msgErro3 = "Ano mínimo: 1980-2026"

export const gameSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Nome deve ter no mínimo 3 caracteres"),

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

    priority: z.string().min(1, "Defina a prioridade do jogo"),
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

    year_finished: releaseYearField.optional(),

    background_image: z.string().optional(),
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

// const releaseYearField = z.preprocess((val) => {
//     if (val === null || val === undefined) return 'Sem ano'
//     if (typeof val === 'string') {
//         const v = val.trim()
//         if (v === '') return 'Sem ano'
//         const n = Number(v)
//         if (!isNaN(n)) return Math.trunc(n)
//     }
//     if (typeof val === 'number') return Math.trunc(val)
//     return 'Sem ano'
// }, z.union([z.literal('Sem ano'), z.number().int()]))

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


// Schema para adicionar jogo para jogar (modalAddJogoParaJogar)
export const gamePayload2Schema = z.object({
    name: z.string().trim().min(1, 'Nome do jogo é obrigatório'),
    hours_played: z.number().optional(),
    hours_expected: z.number().optional(),
    priority: z.string().trim().min(1, 'Prioridade é obrigatória'),
    platform: z.string().trim().min(1, 'Plataforma é obrigatória'),
    genre: z.string().trim().min(1, 'Gênero é obrigatório'),
    status: z.string().trim().min(1, 'Status é obrigatório'),
    release_year: z.number().optional(),
    year_started: z.number().optional(),
    year_finished: z.number().optional(),
    replayed: z.string().trim().optional(),
    background_image: z.string().trim().optional(),
});

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

// const hoursField = z.preprocess((val) => {
//   if (val === null || val === undefined) return 'Sem horas'
//   if (typeof val === 'string') {
//     const v = val.trim()
//     if (v === '') return 'Sem horas'
//     const n = Number(v)
//     if (!isNaN(n)) return n
//   }
//   if (typeof val === 'number') return val
//   return 'Sem horas'
// }, z.union([z.literal('Sem horas'), z.number().positive()]))

// const hourField = z.preprocess(
//     (val) => {
//         if (val !== undefined || val === null || val === '' || val === ) return 0;
//         return Number(val);
//     },
//     z.number().min(1, ',in').optional()
// )


// Tipos TypeScript inferidos do Zod
export type GamePayload2Validated = z.infer<typeof gamePayload2Schema>;
export type GamePayload3Validated = z.infer<typeof gamePayload3Schema>;
