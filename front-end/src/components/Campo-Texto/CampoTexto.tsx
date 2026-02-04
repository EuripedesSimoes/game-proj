import './campotexto.css'

interface dataa {
    tipo: "string" | 'password' | 'date' | 'email' | 'number'
    label: string;
    // valor:
}

export const CampoTexto = ({ tipo, label }: dataa) => {
    return (
        <div className='campo-texto'>
            <label>
                {label}
            </label>
            <input type={tipo} name="" id="" />
        </div>
    )
}