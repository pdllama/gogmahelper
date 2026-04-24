import { useEffect, useState } from "react";
import { elements } from "@custom_types/element.ts";
import { AppStateProp } from "@custom_types/props/common.ts";
import { weapons } from "@custom_types/weapons.ts";
import { menu as MenuType }  from "@custom_types/menutype";
import Dashboard from "./dashboard";
import Skills from "./skills";
import Bonuses from "./bonuses";
import { roll_map } from "@custom_types/rolltype";

type MainWindowProps = AppStateProp & {
    changeWeaponCombo: (arg0: weapons, arg1: elements) => void
}

type MainWindowState = {
    // The file names for the weapons that have information
    weapon_files: string[]|null
    // Which type of data (skills/bonus) is stored per valid weapon file. Ex. if a weapon has both skills and bonus rolls, it'll be "both". Or if it has just skills, it'll be "skills"
    type_map: roll_map|null 
}

const init_weapon_files = async(change_weapon_files:(arg0:MainWindowState) => void) => {
    const files = await window.ipcRenderer.get_weapon_file_names();
    change_weapon_files(files)
}

export default function MainWindow({menu, weapon, element, changeWeaponCombo}:Partial<MainWindowProps>) {

    const [main_window_state, set_main_window_state] = useState<MainWindowState>({weapon_files: null, type_map: null})

    const init_weapon_f = (new_weapon_files:MainWindowState) => {set_main_window_state(new_weapon_files)}

    useEffect(() => {
        init_weapon_files(init_weapon_f)
    }, [])  

    return (
        <div className='w-[80%] min-w-[300px] h-[100%] flex flex-col items-center p-2'>
            {menu == MenuType.dashboard ? 
                <Dashboard/> : 
            menu == MenuType.skills ? 
                <Skills 
                    weapon_files={
                        main_window_state.weapon_files ? 
                        main_window_state.weapon_files.filter((w:string) => main_window_state.type_map && (main_window_state.type_map[w as weapons] == "skills" || main_window_state.type_map[w as weapons] == 'both')) :
                        []
                    }
                /> : 
            menu == MenuType.bonuses && 
                <Bonuses/>
            } 
                
        </div>
    )
}