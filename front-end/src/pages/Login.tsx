import { Link } from "react-router";

import { Button } from "@/components/ui/button"


export function Login() {

    return (
        <>
            <Button> Você está deslogged. <Link to='/' className='decoration-dashed'>Clique para ir para o página principal</Link> </Button>
            <p className="text-white">Skibob</p>
        </>
    )
}