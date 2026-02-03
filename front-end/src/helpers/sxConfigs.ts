import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';


export const MyCustomInput = styled(TextField)(({ theme }) => ({
    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
    input: { color: '#3c3c3c', p: 1, text: { fontSize: '1.2rem' } }, // text-slate-100
    // 1. Aumenta a fonte do texto digitado e o preenchimento (altura do campo)
    '& .MuiInputBase-input': {
        fontSize: '1.5rem', // Tamanho da letra
        padding: '16px 16px', // Ajusta a altura interna
        fontFamily: 'Ubuntu, sans-serif',
        fontWeight: '500'
    },
    // 2. Aumenta o tamanho da label (quando está dentro do campo)
    '& .MuiInputLabel-root': {
        fontSize: '1.2rem',
    },
    // 3. Ajusta a posição da label quando ela "sobe" ao focar
    '& .MuiInputLabel-shrink': {
        transform: 'translate(4px, -3px) scale(0.85)', // Ajuste fino da escala
    },
    // 4. Escurece o texto digitado (Input)
    "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "#3e3e3e", // Para navegadores Webkit (Chrome/Safari)
    },
    // 5. Escurece a Label (Rótulo)
    "& .MuiInputLabel-root.Mui-disabled": {
        color: "#6c6c6c", // Cor da label mais escura
    },
}));

export const MyCustomInput_variant = styled(TextField)(({ theme }) => ({
    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
    input: { color: '#3c3c3c', p: 1, text: { fontSize: '1.2rem' } }, // text-slate-100
    // 1. Aumenta a fonte do texto digitado e o preenchimento (altura do campo)
    '& .MuiInputBase-input': {
        fontSize: '1.2rem', // Tamanho da letra
        padding: '12px 16px', // Ajusta a altura interna
    },
    // 2. Aumenta o tamanho da label (quando está dentro do campo)
    '& .MuiInputLabel-root': {
        fontSize: '1rem',
    },
    // 3. Ajusta a posição da label quando ela "sobe" ao focar
    '& .MuiInputLabel-shrink': {
        transform: 'translate(4px, -3px) scale(0.85)', // Ajuste fino da escala
    },
    // 4. Escurece o texto digitado (Input)
    "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "#4f4f4f", // Para navegadores Webkit (Chrome/Safari)
    },
    // 5. Escurece a Label (Rótulo)
    "& .MuiInputLabel-root.Mui-disabled": {
        color: "#6c6c6c", // Cor da label mais escura
    },
}));

export const InputAddModal = styled(TextField)(({ theme }) => ({
    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800 2c2c2c
    input: { color: '#3c3c3c', px: 1, py: 1.2 }, // text-slate-100 #cecbce
    '& .MuiOutlinedInput-root': {
        // '& fieldset': { borderColor: '#334155' }, // border-slate-700
        '&:hover fieldset': { borderColor: '#64748b' }, // hover border
        '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
    },
    "& .MuiInputBase-input": {
        color: "rgb(var(--color-text-variant))", // text color
        padding: '10px 12px', // Ajusta a altura interna
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
}))

export const InputAttModal = styled(TextField)(({ theme }) => ({
    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800 2c2c2c
    input: { color: '#3c3c3c', px: 1, py: 1.2 }, // text-slate-100 #cecbce
    '& .MuiOutlinedInput-root': {
        // '& fieldset': { borderColor: '#334155' }, // border-slate-700
        '&:hover fieldset': { borderColor: '#64748b' }, // hover border
        '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
    },
    "& .MuiInputBase-input": {
        color: "rgb(var(--color-text-variant))", // text color
        padding: '4px 8px', // Ajusta a altura interna
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
}))

export const InputYears = styled(TextField)(({ theme }) => ({
    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
    input: { color: '#3c3c3c', p: 1 }, // text-slate-100
    '& .MuiOutlinedInput-root': {
        // '& fieldset': { borderColor: '#334155' }, // border-slate-700
        '&:hover fieldset': { borderColor: '#64748b' }, // hover border
        '&.Mui-focused fieldset': { borderColor: '#6366f1' }, // focus border-indigo-500
    },
    "& .MuiInputBase-input": {
        color: "rgb(var(--color-text-variant))", // text color
        padding: '10px 12px', // Ajusta a altura interna
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
}))

