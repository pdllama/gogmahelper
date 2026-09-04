import { weapons, weapon_labels } from "@custom_types/weapons"
import { elements, element_labels } from "@custom_types/element"
import { reinforcement, roll_type, roll_type_other } from "@custom_types/rolltype"
import { useState } from "react"
import { useMainStore } from "@app/main_store"
import { useAlertStore } from "@app/alerts/alert_store"
import { same_reinforcements } from "./funcs"
import NewRollFormWrapper from "../newrollwrapper"
import Text from "@components/common/text/text"
import Select from "@components/common/select/select"
import Button from "@components/common/button/button"
import { bonus_roll_preference } from "@custom_types/preferences"

const all_weapons = Object.values(weapons)
const all_elements = Object.values(elements)
const reinfs = Object.values(reinforcement)

type NewBonusPreferenceState = {
    weapon: null|weapons
    element: null|elements
    reinforcements: Array<reinforcement|"">
}

export default function NewBonusPreferenceForm({}) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<null|string>(null)
    const [bonusPref, setBonusPref] = useState<NewBonusPreferenceState>({weapon: null, element: null, reinforcements: ["", "", "", "", ""]});
    const validBonuses = !bonusPref.reinforcements.includes("")
    const is_new_preference = useMainStore(state => state.bonus_preferences.filter(s => validBonuses && s.weapon === bonusPref.weapon && s.element === bonusPref.element && same_reinforcements(s.reinforcements, bonusPref.reinforcements as roll_type_other.five_reinforcement_rolls)).length === 0)
    const add_preference = useMainStore(state => state.add_preference)
    const add_alert = useAlertStore(state => state.add_alert)
    const invalidPref = !bonusPref.weapon && bonusPref.element 

    let aff_num = 0;
    let ele_num = 0;
    let sharp_num = 0;

    for (let v of bonusPref.reinforcements) {
        if (v === reinforcement.AFF) {aff_num++;}
        else if (v === reinforcement.ELE) {ele_num++;}
        else if (v === reinforcement.SHARP) {sharp_num++;}
    }
    const not_allowed_reinfs = [aff_num === 4 && reinforcement.AFF, ele_num === 4 && reinforcement.ELE, sharp_num === 2 && reinforcement.SHARP]

    const weapon_range = !bonusPref.weapon ? "either" : (bonusPref.weapon === 'bow' || bonusPref.weapon === 'light_bowgun' || bonusPref.weapon === "heavy_bowgun") ? "ranged" : "melee"

    const validReinfs = reinfs.filter((r:reinforcement) => !not_allowed_reinfs.includes(r))

    return (
        <NewRollFormWrapper openForm={() => setIsOpen(true)} isOpen={isOpen} bgstyle={'bg-red-950'} classes='gap-1' fullContainerClasses="h-[290px]">
            <Text size='md' bold>Add New Skill Preference</Text>

            <div className='w-full flex items-center gap-1 px-2'>
                <Text size='sm' bold>Weapon:</Text>
                <Select 
                    selected={bonusPref.weapon === null ? '' : bonusPref.weapon} 
                    options={all_weapons} 
                    unselected_option_label="any"
                    label_map={weapon_labels} select_classes="w-full py-0 h-[30px] text-[12px]" 
                    on_change={(value:weapons|"") => setBonusPref({...bonusPref, weapon:value === "" ? null : value})}
                    on_focus={() => setError(null)}
                />
            </div>
            <div className='w-full flex items-center gap-1 px-2'>
                <Text size='sm' bold>Element:</Text>
                <Select 
                    selected={bonusPref.element === null ? '' : bonusPref.element} 
                    options={all_elements} 
                    unselected_option_label="any"
                    label_map={element_labels} select_classes="w-full py-0 h-[30px] text-[12px]" 
                    on_change={(value:elements|"") => setBonusPref({...bonusPref, element:value === "" ? null : value})}
                    on_focus={() => setError(null)}
                />
            </div>
            <div className="size-full flex px-1 h-fit">
                <div className='w-full flex flex-col items-center'>
                    {bonusPref.reinforcements.map((r:reinforcement|"", i:number) => {

                        const imgkey = r === "SHARPNESS/AMMO" ? (weapon_range === "melee" || weapon_range === "either" ? "sharpness" : "ammo") : r.toLowerCase()

                        return (
                            <div className="px-1 py-[2px] w-full flex gap-1">
                                <div className="w-[24px] flex justify-center">
                                    {r === "" ? <></> : <img className="h-[24px] object-contain" src={`icons/misc/${imgkey}.png`}/>}
                                </div>
                                <Select 
                                    selected={r}
                                    options={!(r === "") && !validReinfs.includes(r) ? [...validReinfs, r] : validReinfs}
                                    unselected_option_label="none"
                                    select_classes="h-[24px] text-[12px] py-0 w-full"
                                    option_classes="text-[12px]"
                                    on_change={(value:reinforcement|"") => setBonusPref({...bonusPref, reinforcements: bonusPref.reinforcements.map((v:reinforcement|"", i2:number) => i === i2 ? value : v)})}
                                    on_focus={() => setError(null)}
                                />
                            </div>
                        )
                    })}
                </div>
                <div>
                    
                    <div className='size-full flex flex-col items-center gap-2'>
                        {error ? <Text size={12} bold classes="text-red-300">{error}</Text> :   
                        <Button 
                            classes="p-1 bg-black" 
                            disableRipple 
                            onClick={
                                async() => {
                                    if (!is_new_preference) {
                                        setError("Preference already exists!")
                                    } else if (invalidPref) {
                                        setError("Cannot have any weapon and specific element!")
                                    } else if (!validBonuses) {
                                        setError("Must select a bonus for each row!")
                                    } else {
                                        const newstats = await window.ipcRenderer.add_preference(roll_type.BONUSES, bonusPref);
                                        add_preference(roll_type.BONUSES, bonusPref as bonus_roll_preference, newstats)
                                        add_alert({title: "Added the bonus preference!", timeout: 3, type: 'success', content: ''})
                                        setBonusPref({weapon: null, element: null, reinforcements: ["", "", "", "", ""]})
                                        setIsOpen(false)
                                    }
                                }
                            }
                        >
                            Add Bonus Preference
                        </Button>
                        }
                        <Button 
                            classes="px-7 opacity-90" 
                            disableRipple 
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
            <Text size={11} classes="px-1 mt-[-5px]">Bonus limits are enforced. The game is limited up to 2x SHARP/AMMO, 4x AFF, and 4x ELE.</Text>
        </NewRollFormWrapper>
    )

}