import { weapon_labels, weapons } from "@custom_types/weapons"
import { useMainStore } from "../../../app/main_store"
import Text from "@components/common/text/text"
import { get_weapon_label } from "../../../app/util/labels"
import { element_labels, elements } from "@custom_types/element"
import CloseButton from "@components/common/button/close_button"
import SlidingWindow from "@components/common/sliding_window/slidingwindow"
import { useState } from "react"
import Button from "@components/common/button/button"
import TimeoutButton from "@components/common/button/timeoutbutton"
import { remove_weapon } from "../../../app/store_actions/rolls"
import { useAlertStore } from "../../../app/alerts/alert_store"
import { bonus_roll, roll_type, skill_roll } from "@custom_types/rolltype"
import ElementRow from "./elementrow"
import Select from "@components/common/select/select"
import { roll_type_other } from "@custom_types/rolltype"
import { add_new_weapon } from "../../../app/store_actions/rolls"
import GridItemWrapper from "../griditemwrapper"

type RollDisplayProps = {
    weapon:weapons
    rollType:roll_type
} 

type SkillRoleDisplayState = {
    delete_weapon_active:boolean,
    new_element:elements|"",
    new_element_active:boolean
}

export default function RollDisplay({weapon, rollType}:RollDisplayProps) {

    const [roll_state, set_roll_state] = useState<SkillRoleDisplayState>({delete_weapon_active: false, new_element_active:false, new_element:''})
    const weapon_elements = useMainStore((state) => rollType === roll_type.SKILLS ? state.skill_stats[weapon] : state.amend_bonus_stats[weapon])
    const modify_stat_weapon = useMainStore(state => rollType === roll_type.SKILLS ? state.modify_skill_stat_weapon : state.modify_amend_stat_weapon)
    const modify_stat_weapon_ele = useMainStore(state => rollType === roll_type.SKILLS ? state.modify_skill_stat_element : state.modify_amend_stat_element)
    const add_alert = useAlertStore(state => state.add_alert)


    const element_keys = weapon_elements === undefined ? undefined : Object.keys(weapon_elements).filter(e => weapon_elements[e as elements] !== undefined) as elements[]
    const choosable_elements = weapon_elements === undefined ? Object.values(elements) : Object.values(elements).filter((e:elements) => !element_keys?.includes(e))
    

    return (
        <GridItemWrapper>
            <div className='min-h-[150px] max-h-[150px] w-full rounded-t-xl flex items-center justify-center relative overflow-hidden'>
                <Text size='3xl' bold classes='z-5'>
                    {get_weapon_label(weapon)}
                </Text>
                <img className='absolute opacity-25 h-full'src={`icons/weapons/${weapon}.png`} />
                <div className='size-full absolute flex justify-end'>
                    <CloseButton
                        classes='h-[30px]'
                        img_size={30}    
                        onClick={() => set_roll_state({...roll_state, delete_weapon_active: true})}
                    />
                </div>
                {choosable_elements.length !== 0 &&
                <div className='w-full absolute bottom-[0%] ml-1 mb-1 flex justify-start'>
                    <Button
                        classes='p-1 bg-orange-800'   
                        disableRipple
                        onClick={() => set_roll_state({...roll_state, new_element_active: true})}
                    >   
                        <Text size={11}>New Element</Text>
                    </Button>
                </div>
                }

                <SlidingWindow
                    active={roll_state.delete_weapon_active}
                    classes="size-full flex flex-col items-center gap-2 p-2 rounded-t-xl bg-black"
                    transition_type="slide-left"
                >
                    <div className='flex flex-col justify-center items-center'>
                        <Text size="md" bold>Are you sure you want to delete {weapon_labels[weapon]}?</Text>
                        <Text size={12}>This will <b>irreversibly delete</b> all {rollType === roll_type.SKILLS ? 'skill' : 'bonus'} rolls associated with it!</Text>
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <TimeoutButton 
                            disableRipple 
                            classes="bg-orange-800" disabled={!roll_state.delete_weapon_active}
                            timeout={5}
                            start_timeout={roll_state.delete_weapon_active}
                            onClick={() => remove_weapon(modify_stat_weapon, add_alert, weapon, roll_type.SKILLS)}
                        >
                            Confirm
                        </TimeoutButton>
                        <Button disableRipple onClick={() => set_roll_state({...roll_state, delete_weapon_active: false})}>Cancel</Button>
                    </div>
                </SlidingWindow>

                {choosable_elements.length !== 0 &&
                <SlidingWindow
                    active={roll_state.new_element_active}
                    classes="size-full flex flex-col items-center gap-2 p-1 bg-black"
                    transition_type="slide-right"
                >
                    <Text size='xl' bold>Add New Element</Text>
                    <div className='w-full flex items-center gap-2 px-3'>
                        <Text size='md' bold>Element:</Text>
                        <Select 
                            selected={roll_state.new_element} 
                            options={choosable_elements} 
                            label_map={element_labels} select_classes="w-full" 
                            on_change={(value:elements) => set_roll_state({...roll_state, new_element: value})}
                        />
                    </div>
                    <div className='size-full flex items-end justify-center p-1 gap-2'>
                        <Button 
                            classes="bg-red-950" 
                            disableRipple 
                            onClick={(!roll_state.new_element) ? undefined :
                                () => {
                                    add_new_weapon(modify_stat_weapon_ele, add_alert, weapon, roll_state.new_element as elements, rollType)
                                    // const divEle = form_ref.current as HTMLDivElement;
                                    // divEle.style.top = '-100%';
                                    set_roll_state({...roll_state, new_element_active:false, new_element: ''})
                                }
                            }
                        >
                            Add Element
                        </Button>
                        <Button 
                            classes="opacity-90" 
                            disableRipple 
                            onClick={() => set_roll_state({...roll_state, new_element_active: false})}
                        >
                            Cancel
                        </Button>
                        
                    </div>
                </SlidingWindow>
                }

            </div>
            <div className='min-h-[50px] w-full rounded-b-xl flex flex-col items-center justify-center relative border-t border-black bg-black/75'>
                {!element_keys ? 
                    <Text classes='italic opacity-75'>No elements associated with this weapon</Text> :  // You shouldn't be able to have this happen, but it covers bases.
                    <>
                    {element_keys.map((e:elements, i:number) => {
                        // //Below filters out duplicate god rolls (same set and group bonus)
                        // const unique_god_rolls = god_rolls.filter((gr:skill_roll|bonus_roll, i:number) => {
                        //     if (rollType === roll_type.SKILLS) {
                        //         return god_rolls.findIndex((gr2:any) => (gr2.set_bonus === (gr as skill_roll).set_bonus && gr2.group_bonus === (gr as skill_roll).group_bonus)) === i
                        //     } else {
                        //         return god_rolls.findIndex((gr2:any) => roll_type_other.compare_bonus_rolls(gr2 as bonus_roll, gr as bonus_roll)) === i
                        //     }
                            
                        // })

                        return (
                            <ElementRow 
                                key={`${weapon}-${e}-${rollType === roll_type.SKILLS ? 'skill' : 'amend-bonus'}-rolls`}
                                weapon={weapon}
                                e={e} 
                                is_end={i === element_keys.length-1}
                                modify_stat_element={modify_stat_weapon_ele}
                                remove_weapon={modify_stat_weapon}
                                add_alert={add_alert}
                                rollType={rollType}
                                is_last_ele={element_keys.length === 1}
                                wrapper_classes={i%2 === 1 ? "bg-black" : ""}
                            />
                        )
                    })}
                    </>

                }
            </div>
        </GridItemWrapper>
    )
}