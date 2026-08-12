import CloseButton from "@components/common/button/close_button"
import Text from "@components/common/text/text"
import { weapons } from "@custom_types/weapons"
import { element_labels, elements } from "@custom_types/element"
import { bonus_roll, roll_type, skill_roll } from "@custom_types/rolltype"
import Button from "@components/common/button/button"
import TimeoutButton from "@components/common/button/timeoutbutton"
import { useState } from "react"
import SlidingWindow from "@components/common/sliding_window/slidingwindow"
import { remove_combo, remove_weapon as remove_weapon_rolls } from "@app/store_actions/rolls"
import { MainStore, useMainStore } from "@app/main_store"
import { AlertStore } from "@app/alerts/alert_store"


type ElementRowProps = {
    weapon: weapons,
    e: elements,
    is_end:boolean,
    rollType:roll_type,
    modify_stat_element:MainStore["modify_skill_stat_element"]|MainStore["modify_amend_stat_element"],
    remove_weapon:MainStore["modify_skill_stat_weapon"]|MainStore["modify_amend_stat_weapon"]
    add_alert:AlertStore["add_alert"]
    is_last_ele:boolean,
    wrapper_classes:string
}

export default function ElementRow({weapon, e, is_end, rollType, modify_stat_element, remove_weapon, add_alert, is_last_ele, wrapper_classes=''}:ElementRowProps) {
    const [delete_screen, set_delete_screen] = useState(false)

    const select_weapon_element = useMainStore((state) => state.select_weapon_element)
    const num_rolls = useMainStore(state => state[rollType === roll_type.SKILLS ? "skill_stats" : "amend_bonus_stats"][weapon]![e]!.num_rolls)
    const god_rolls = useMainStore(state => state[rollType === roll_type.SKILLS ? "skill_stats" : "amend_bonus_stats"][weapon]![e]!.god_rolls)

    const text_color = `text-${e}`
    const hover_styles = `hover-bg-${e}`

    return (
        <div className={`w-full h-[50px] overflow-hidden relative ${is_end ? 'rounded-b-xl' : ''}  ${wrapper_classes}`}>
            <Button
                disableRipple
                classes={`size-full flex items-center relative p-0 bg-transparent rounded-none hover_styles border-none hover:border-none ${hover_styles}`}
                onClick={() => select_weapon_element(weapon, e)}
            >
                <img src={`icons/elements/${e}.png`} width='40px' height='40px'/>
                <div className='size-full flex flex-col justify-start items-start p-1'>
                    <Text classes={`${text_color}`} size='lg' bold>{element_labels[e]}</Text>
                    <Text size={11} classes={`${god_rolls.length === 0 ? 'italic' : ''}`}>{god_rolls.length === 0 ? 'No' : god_rolls.length} desired roll{god_rolls.length === 1 ? "" : "s"} found</Text> 
                </div>
                <Text classes='p-1 min-w-[75px] mt-6' size='sm' bold>{num_rolls} rolls</Text>
                
            </Button>
            <div className='size-full absolute flex justify-end top-[0px] pointer-events-none'>
                <CloseButton custom_hover_color={'hover:bg-gray-800'} classes='h-[25px] pointer-events-auto' img_size={25} onClick={() => set_delete_screen(true)}/>
            </div>
            <SlidingWindow
                active={delete_screen}
                transition_type='slide-left'
                classes={`size-full flex items-center gap-1 p-1 bg-black ${is_end ? 'rounded-b-xl' : ''}`}
            >
                <Text classes="mx-1 w-full" size='sm' bold>Delete {element_labels[e]} rolls?</Text>
                <div className='flex w-full justify-end gap-1'>
                    <TimeoutButton 
                        disableRipple 
                        classes="bg-orange-800 p-[2px] whitespace-nowrap" disabled={!delete_screen}
                        timeout={3}
                        start_timeout={delete_screen}
                        onClick={
                            is_last_ele ? 
                            () => remove_weapon_rolls(remove_weapon, add_alert, weapon, rollType) : 
                            () => remove_combo(modify_stat_element, add_alert, weapon, e, rollType)
                        }
                    >
                        Confirm
                    </TimeoutButton>
                    <Button classes="p-[2px] whitespace-nowrap" disableRipple onClick={() => set_delete_screen(false)}>Cancel</Button>
                </div>
            </SlidingWindow>
        </div>
    )
}