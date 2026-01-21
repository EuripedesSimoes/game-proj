
import { Button } from "@/components/ui/button"
import { Link } from "react-router"

export default function LoginOrRegister() {

    return (

        <div className="w-screen h-screen flex flex-row items-center justify-center bg-white gap-2">
            <div className="flex flex-col items-center justify-center bg-gray-300/70 shadow-2xl p-4">
                <Button> Não tem uma conta? <Link to='/register' className='decoration-dashed'>Clique para ir para o página de Registro</Link> </Button>
                <p className="text-gray">Skibob</p>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-300/70 shadow-2xl p-4">
                <Button> Já tem uma conta? <Link to='/login' className='decoration-dashed'>Clique para ir para o página de Login</Link> </Button>
                <p className="text-gray">Skebob</p>
            </div>
        </div>

    )

}