import { MenuProp } from "../../types/props/common";
import { menu } from "../../types/menutype";

type NavBarProps = MenuProp & {
    change_menu: (arg0:menu) => void
}

export default function NavBar({menu, change_menu} : NavBarProps) {
    
    console.log(menu)
    console.log(change_menu)

    return (
        <div className='h-full w-[20%] min-w-[100px] max-w-[300px] magma-border-color magma-border-right'>
            Hii
        </div>
    )
}