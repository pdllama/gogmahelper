import { weapon_labels, weapons } from "@custom_types/weapons"
import { useRef, useState } from "react"
import GridItemWrapper from "../griditemwrapper"
import Text from "@components/common/text/text"
import { element_labels, elements } from "@custom_types/element"
import Button from "@components/common/button/button"
import "./../gridsizes.css"
import Select from "@components/common/select/select"
import { roll_type } from "@custom_types/rolltype"
import { add_new_weapon } from "../../../app/store_actions/rolls"
import { useMainStore } from "../../../app/main_store"
import { useAlertStore } from "../../../app/alerts/alert_store"
import NewRollFormWrapper from "../newrollwrapper"

const all_weapons = Object.values(weapons) as weapons[]
const all_elements = Object.values(elements) as elements[]

type RollDisplayProps = {
    current_weapons: weapons[],
    rollType:roll_type
} 

type Form_State = {
    active:boolean, // used to indicate if the form is active or not.
    weapon:weapons|'', // the weapon we want to add.
    element:elements|'' // the initial element we want to add to the weapon.
}

export default function NewRollDisplay({current_weapons, rollType}:RollDisplayProps) {

    const [form, set_form] = useState<Form_State>({active:false, weapon:'', element:''})
    // const form_ref = useRef<HTMLDivElement|null>(null)
    const update_stats = useMainStore(state => rollType === roll_type.SKILLS ? state.modify_skill_stat_element : state.modify_amend_stat_element)
    const add_alert = useAlertStore(state => state.add_alert);

    const choosable_weapons = all_weapons.filter((w:weapons) => !current_weapons.includes(w))

    // const activate_form = () => {
    //     const divEle = form_ref.current as HTMLDivElement;
    //     divEle.style.top = '0%';
    //     set_form({...form, active: true})
    // }

    // const deactivate_form = () => {
    //     const divEle = form_ref.current as HTMLDivElement;
    //     divEle.style.top = '-100%';
    //     set_form({...form, active: false})
    // }

    //size-full flex flex-col items-center gap-2 rounded-xl bg-cyan-800

    return (
        <NewRollFormWrapper openForm={() => set_form({...form, active:true})} isOpen={form.active}>
            <Text size='xl' bold>Add New Weapon</Text>
            <div className='w-full flex items-center gap-2 px-3'>
                <Text size='lg' bold>Weapon:</Text>
                <Select 
                    selected={form.weapon} 
                    options={choosable_weapons} 
                    label_map={weapon_labels} select_classes="w-full" 
                    on_change={(value:weapons) => set_form({...form, weapon:value})}
                />
            </div>
            <div className='w-full flex items-center gap-2 px-3'>
                <Text size='lg' bold>Element:</Text>
                <Select 
                    selected={form.element} 
                    options={all_elements} 
                    label_map={element_labels} select_classes="w-full"
                    on_change={(value:elements) => set_form({...form, element:value})}
                />
            </div>
            <div className='size-full flex items-end justify-center p-1 gap-2'>
                <Button 
                    classes="bg-red-950" 
                    disableRipple 
                    onClick={(!form.weapon || !form.element) ? undefined : 
                        () => {
                            add_new_weapon(update_stats, add_alert, form.weapon as weapons, form.element as elements, rollType)
                            // const divEle = form_ref.current as HTMLDivElement;
                            // divEle.style.top = '-100%';
                            set_form({active:false, weapon:'', element: ''})
                        }
                    }
                >
                    Add Weapon
                </Button>
                <Button 
                    classes="opacity-90" 
                    disableRipple 
                    onClick={() => set_form({...form, active: false})}
                >
                    Cancel
                </Button>
            </div>
        </NewRollFormWrapper>
    )
}