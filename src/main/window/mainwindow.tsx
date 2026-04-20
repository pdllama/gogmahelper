import { useEffect, useState } from "react";
import { elements } from "../../types/element";
import { AppStateProp } from "../../types/props/common";
import { weapons } from "../../types/weapons";
import Text from "@components/common/text/text.tsx"

type MainWindowProps = AppStateProp & {
    changeWeaponCombo: (arg0: weapons, arg1: elements) => void
}

const init_weapon_files = async(change_weapon_files:(arg0:string[]) => void) => {
    const files = await window.ipcRenderer.get_weapon_file_names(); // TO-DO: get the IDE to shutup about this.  
    change_weapon_files(files)
}

export default function MainWindow({menu, weapon, element, changeWeaponCombo}:Partial<MainWindowProps>) {

    const [weapon_files, set_weapon_files] = useState<string[]|null>(null)

    const init_weapon_f = (new_weapon_files:string[]) => {set_weapon_files(new_weapon_files)}

    useEffect(() => {
        init_weapon_files(init_weapon_f)
    }, [])

    return (
        <div className='w-[80%] min-w-[300px] h-[100%] flex flex-col items-center'>
            <Text size='3xl' bold>Dashboard</Text>
        </div>
    )
}