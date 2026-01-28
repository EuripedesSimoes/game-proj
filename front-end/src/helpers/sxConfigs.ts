import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';



export const MyCustomInput = styled(TextField)(({ theme }) => ({
    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
    input: { color: '#3c3c3c', p: 1, text: { fontSize: '1.2rem' } }, // text-slate-100
    // 1. Aumenta a fonte do texto digitado e o preenchimento (altura do campo)
    '& .MuiInputBase-input': {
        fontSize: '1.5rem', // Tamanho da letra
        padding: '16px 16px', // Ajusta a altura interna
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

export const inputStylesvariant =
{
    backgroundColor: '#f1f5f9', // equivalente ao bg-slate-800
    input: { color: '#3c3c3c', p: 1, text: { fontSize: '1.2rem' } }, // text-slate-100
    // 1. Aumenta a fonte do texto digitado e o preenchimento (altura do campo)
    '& .MuiInputBase-input': {
        fontSize: '1.5rem', // Tamanho da letra
        padding: '16px 16px', // Ajusta a altura interna
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
        WebkitTextFillColor: "#4a4a4a", // Para navegadores Webkit (Chrome/Safari)
    },
    // 5. Escurece a Label (Rótulo)
    "& .MuiInputLabel-root.Mui-disabled": {
        color: "#6c6c6c", // Cor da label mais escura
    },
}