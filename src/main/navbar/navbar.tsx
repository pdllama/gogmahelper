import { MenuProp } from "../../types/props/common";
import { menu, menu_arr, menu_labels } from "../../types/menutype";
import Button from "../../components/common/button/button";
import Text from "../../components/common/text/text";
import { useMainStore } from "../../app/main_store";

type NavBarProps = MenuProp & {
    change_menu: (arg0:menu) => void
}

export default function NavBar({menu} : MenuProp) {
    const change_menu = useMainStore((state) => state.change_menu)

    return (
        <div className='h-full w-[20%] min-w-[100px] max-w-[300px] magma-border-color magma-border-right p-[2px] '>
            {menu_arr.map((m:menu, i:number) => {
                return (
                    <Button
                        key={`${m}-menu`}
                        classes={`w-[100%] max-h-[100px] h-[20%] mb-1 ${i%2 == 0 ? 'bg-black/50' : 'bg-black/75'} ${m == menu ? 'border border-red-500' : ''}`}
                        onClick={() => change_menu(m)}
                        disabled={m == menu}
                        disableRipple={true} // The Ripple logic is a pain in the *ss right now to manage so I'm just disabling it.
                    >
                        <Text size={24} center classes='size-full'>{menu_labels[m]}</Text>
                    </Button>
                )
            })}
            
        </div>
    )
}