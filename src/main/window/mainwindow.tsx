import { MenuProp } from "@custom_types/props/common.ts";
import { menu as MenuType }  from "@custom_types/menutype";
import Dashboard from "./dashboard";
import Skills from "./skills";
import Bonuses from "./bonuses";



export default function MainWindow({menu}:Partial<MenuProp>) {


    return (
        <>
        <style>
            {`
                ::-webkit-scrollbar {
                    width: 12px;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: black;
                    border-radius: 25px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    cursor: pointer; 
                }   
            `}
        </style>
        <div className='w-[80%] min-w-[300px] h-[100%] flex flex-col items-center gap-2 p-2 overflow-y-scroll'>
            {menu == MenuType.dashboard ? 
                <Dashboard/> : 
            menu == MenuType.skills ? 
                <Skills/> : 
            menu == MenuType.bonuses && 
                <Bonuses/>
            } 
                
        </div>
        </>
    )
}