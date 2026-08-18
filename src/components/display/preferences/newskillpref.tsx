import { elements, element_labels } from "@custom_types/element"
import { group_bonus_skill, roll_type, set_bonus_skill } from "@custom_types/rolltype"
import { weapons, weapon_labels } from "@custom_types/weapons"
import { useState } from "react"
import NewRollFormWrapper from "../newrollwrapper";
import Text from "@components/common/text/text";
import Select from "@components/common/select/select";
import Button from "@components/common/button/button";
import { useMainStore } from "@app/main_store";
import { useAlertStore } from "@app/alerts/alert_store";

const all_weapons = Object.values(weapons)
const all_elements = Object.values(elements)
const set_bonuses = Object.values(set_bonus_skill);
const group_bonuses = Object.values(group_bonus_skill)

type NewSkillPreferenceState = {
    weapon: null|weapons
    element: null|elements
    set_bonus: set_bonus_skill
    group_bonus: group_bonus_skill
}

export default function NewSkillPreferenceForm({}) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<null|string>(null)
    const [skillPref, setSkillPref] = useState<NewSkillPreferenceState>({weapon: null, element: null, set_bonus: set_bonuses[0], group_bonus: group_bonuses[0]});
    const is_new_preference = useMainStore(state => state.skill_preferences.filter(s => s.weapon === skillPref.weapon && s.element === skillPref.element && s.set_bonus === skillPref.set_bonus && s.group_bonus === skillPref.group_bonus).length === 0)
    const add_preference = useMainStore(state => state.add_preference)
    const add_alert = useAlertStore(state => state.add_alert)
    const invalidPref = !skillPref.weapon && skillPref.element 

    return (
        <NewRollFormWrapper openForm={() => setIsOpen(true)} isOpen={isOpen} bgstyle={'bg-red-950'} classes='gap-1' fullContainerClasses="h-[225px]">
            <Text size='md' bold>Add New Skill Preference</Text>
            
            <div className='w-full flex items-center gap-1 px-2'>
                <Text size='sm' bold>Weapon:</Text>
                <Select 
                    selected={skillPref.weapon === null ? '' : skillPref.weapon} 
                    options={all_weapons} 
                    unselected_option_label="any"
                    label_map={weapon_labels} select_classes="w-full py-0 h-[30px] text-[12px]" 
                    on_change={(value:weapons|"") => setSkillPref({...skillPref, weapon:value === "" ? null : value})}
                    on_focus={() => setError(null)}
                />
            </div>
            <div className='w-full flex items-center gap-1 px-2'>
                <Text size='sm' bold>Element:</Text>
                <Select 
                    selected={skillPref.element === null ? '' : skillPref.element} 
                    options={all_elements} 
                    unselected_option_label="any"
                    label_map={element_labels} select_classes="w-full py-0 h-[30px] text-[12px]" 
                    on_change={(value:elements|"") => setSkillPref({...skillPref, element:value === "" ? null : value})}
                    on_focus={() => setError(null)}
                />
            </div>
            <div className='w-full flex items-center gap-1 px-2'>
                <Text size='sm' bold nowrap>Set Bonus:</Text>
                <Select 
                    selected={skillPref.set_bonus} 
                    options={set_bonuses} 
                    disable_unselected
                    select_classes="w-full py-0 h-[30px] text-[12px]" 
                    on_change={(value:set_bonus_skill) => setSkillPref({...skillPref, set_bonus: value})}
                    on_focus={() => setError(null)}
                />
            </div>
            <div className='w-full flex items-center gap-1 px-2'>
                <Text size='sm' bold nowrap>Group Bonus:</Text>
                <Select 
                    selected={skillPref.group_bonus} 
                    options={group_bonuses} 
                    disable_unselected
                    select_classes="w-full py-0 h-[30px] text-[12px]" 
                    on_change={(value:group_bonus_skill) => setSkillPref({...skillPref, group_bonus: value})}
                    on_focus={() => setError(null)}
                />
            </div>
            {
            error ? <Text size={12} bold nowrap classes="text-red-300">{error}</Text> :   
            <div className='size-full flex items-start justify-center gap-2'>
                <Button 
                    classes="p-1 bg-black" 
                    disableRipple 
                    onClick={
                        async() => {
                            if (!is_new_preference) {
                                setError("Preference already exists!")
                            } else if (invalidPref) {
                                setError("Cannot have any weapon and specific element!")
                            } else {
                                const newstats = await window.ipcRenderer.add_preference(roll_type.SKILLS, skillPref);
                                add_preference(roll_type.SKILLS, skillPref, newstats)
                                add_alert({title: "Added the skill preference!", timeout: 3, type: 'success', content: ''})
                                setSkillPref({weapon: null, element: null, set_bonus: set_bonuses[0], group_bonus: group_bonuses[0]})
                                setIsOpen(false)
                            }
                        }
                    }
                >
                    Add Skill Preference
                </Button>
                <Button 
                    classes="p-1 opacity-90" 
                    disableRipple 
                    onClick={() => setIsOpen(false)}
                >
                    Cancel
                </Button>
            </div>}
        </NewRollFormWrapper>
    )

}