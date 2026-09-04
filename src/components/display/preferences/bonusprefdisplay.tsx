import { weapons, weapon_labels } from "@custom_types/weapons"
import { elements, element_labels } from "@custom_types/element"
import { reinforcement, roll_type, roll_type_other } from "@custom_types/rolltype"
import { useState } from "react"
import { useMainStore } from "@app/main_store"
import { useAlertStore } from "@app/alerts/alert_store"
import { bonus_roll_preference } from "@custom_types/preferences"
import PreferenceDisplayWrapper from "./preferencewrapper"
import Text from "@components/common/text/text"
import Select from "@components/common/select/select"
import { same_reinforcements } from "./funcs"
import Button from "@components/common/button/button"
import SlidingWindow from "@components/common/sliding_window/slidingwindow"
import TimeoutButton from "@components/common/button/timeoutbutton"


const all_weapons = Object.values(weapons);
const all_elements = Object.values(elements);
const reinfs = Object.values(reinforcement)

type BonusPrefDisplayProps = {
    w: null|weapons
    e: null|elements
    reinforcements: roll_type_other.five_reinforcement_rolls
    pref_index: number
}

type BonusPrefDisplayState = {
    mode: "none"|"edit"|"delete"
    w: null|weapons
    e: null|elements
    reinforcements: [reinforcement|"",reinforcement|"",reinforcement|"",reinforcement|"",reinforcement|""]
}



export default function BonusPrefDisplay({w, e, reinforcements, pref_index}:BonusPrefDisplayProps) {

    const [error, setError] = useState<string|null>(null)
    const [mode, setMode] = useState<BonusPrefDisplayState>({mode: "none", w, e, reinforcements})
    const is_same_as_before_edit = mode.w === w && mode.e === e && same_reinforcements(reinforcements, mode.reinforcements)
    const is_new_preference = useMainStore((state) => !is_same_as_before_edit && state.bonus_preferences.filter(s => s.weapon === mode.w && s.element === mode.e && same_reinforcements(s.reinforcements, mode.reinforcements)).length === 0)
    const edit_preference = useMainStore(state => state.edit_preference)
    const delete_preference = useMainStore(state => state.remove_preference)
    const add_alert = useAlertStore(state => state.add_alert)

    const section_height = mode.mode === "edit" ? 'h-[80px]' : 'h-[100px]'

    
    const finalizeEdit = async() => {
        if (is_same_as_before_edit) {setMode({...mode, mode: "none"})}
        else if (!is_new_preference) {setError("Preference already exists!")}
        else if (!mode.w && mode.e) {setError("Cannot have any weapon and specific element!")}
        else if (mode.reinforcements.includes("")) {setError("Cannot have an empty row!")}
        else {
            const orig:bonus_roll_preference = {weapon: w, element: e, reinforcements}
            const newpref:bonus_roll_preference = {weapon: mode.w, element: mode.e, reinforcements: mode.reinforcements as roll_type_other.five_reinforcement_rolls}
            const new_bonus_stats = await window.ipcRenderer.edit_preference(roll_type.BONUSES, orig, newpref);
            edit_preference(roll_type.BONUSES, newpref, pref_index, new_bonus_stats)
            add_alert({title: "Edited the Bonus Preference!", content: '', timeout: 3, type:'success'})
            setMode({...mode, mode: 'none'})
        }
    }

    const finalizeDelete = async() => {
        const new_bonus_stats = await window.ipcRenderer.remove_preference(roll_type.BONUSES, {weapon: w, element: e, reinforcements})
        delete_preference(roll_type.SKILLS, pref_index, new_bonus_stats)
        add_alert({title: "Deleted the Skill Preference!", content: '', timeout: 3, type:'success'})
    }
    const used_w_value = mode.mode === "edit" ? mode.w : w
    const used_e_value = mode.mode === "edit" ? mode.e : e
    const used_reinfs = mode.mode === "edit" ? mode.reinforcements : reinforcements

    const weapon_range = !used_w_value ? "either" : (used_w_value === "bow" || used_w_value === "light_bowgun" || used_w_value === "heavy_bowgun") ? "ranged" : "melee"

    let aff_num = 0;
    let ele_num = 0;
    let sharp_num = 0;

    for (let v of mode.reinforcements) {
        if (v === reinforcement.AFF) {aff_num++;}
        else if (v === reinforcement.ELE) {ele_num++;}
        else if (v === reinforcement.SHARP) {sharp_num++;}
    }
    const not_allowed_reinfs = [aff_num === 4 && reinforcement.AFF, ele_num === 4 && reinforcement.ELE, sharp_num === 2 && reinforcement.SHARP]
    const validReinfs = reinfs.filter((r:reinforcement) => !not_allowed_reinfs.includes(r))

    return (
        <PreferenceDisplayWrapper classes="h-[290px] relative overflow-hidden">
            <div className="size-full flex flex-col items-center p-2 gap-2">
                <div className="flex justify-center w-full gap-2 w-full">
                    <div className="flex flex-col items-center gap-1 w-1/2">
                        <Text size="md" bold>Weapon</Text>
                        <div className={`size-full flex justify-center items-center relative ${section_height}`}>
                            <img src={`/icons/weapons/${!used_w_value ? "all" : used_w_value}.png`} style={{height: '100%', opacity: 0.15, position: 'absolute'}}/>
                            {mode.mode === "edit" ? 
                            <Select 
                                selected={mode.w === null ? '' : mode.w} 
                                options={all_weapons} 
                                unselected_option_label="any"
                                label_map={weapon_labels} select_classes="w-full py-0 h-[30px] text-[12px] z-5 opacity-50" 
                                on_change={(value:weapons|"") => setMode({...mode, w:value === "" ? null : value})}
                                on_focus={() => setError(null)}
                            />:
                            <Text size='lg' bold>{!used_w_value ? "Any" : weapon_labels[used_w_value]}</Text>
                            }
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 w-1/2">
                        <Text size="md" bold>Element</Text>
                        <div className={`size-full flex justify-center items-center relative ${section_height}`}>
                            <img src={`/icons/elements/${!used_e_value ? "all" : used_e_value}.png`} style={{height: '100%', opacity: 0.15, position: 'absolute'}}/>
                            {mode.mode === "edit" ? 
                            <Select 
                                selected={mode.e === null ? '' : mode.e} 
                                options={all_elements} 
                                unselected_option_label="any"
                                label_map={element_labels} select_classes="w-full py-0 h-[30px] text-[12px] z-5 opacity-50" 
                                on_change={(value:elements|"") => setMode({...mode, e:value === "" ? null : value})}
                                on_focus={() => setError(null)}
                            /> : 
                            <Text size='lg' bold>{!used_e_value ? "Any" : element_labels[used_e_value]}</Text>
                            }
                        </div>
                    </div>
                </div>
                <div className="w-full flex gap-[4px] p-1">
                    <div className='w-full flex flex-col items-center gap-1'>
                        {used_reinfs.map((r:reinforcement|"", i:number) => {
    
                            const imgkey = r === "SHARPNESS/AMMO" ? (weapon_range === "melee" || weapon_range === "either" ? "sharpness" : "ammo") : r.toLowerCase()
                            const sizing = mode.mode === "edit" ? 'h-[28px]' : 'h-[24px]'
                            const img_sizing = mode.mode === "edit" ? 'h-[24px]' : 'h-[20px]'

                            return (
                                <div className={`px-1 py-[2px] w-full flex items-center gap-[1px] bg-red-950 rounded-sm ${sizing}`}>
                                    <div className="w-[24px] flex justify-center">
                                        {r === "" ? <></> : <img className={`${img_sizing} object-contain`} src={`icons/misc/${imgkey}.png`}/>}
                                    </div>
                                    <div className="w-fit h-[20px] flex items-center gap-2 p-[2px] bg-red-950 rounded-sm pl-1">
                                        {mode.mode === "edit" ? 
                                            <Select 
                                                selected={r}
                                                options={!(r === "") && !validReinfs.includes(r) ? [...validReinfs, r] : validReinfs}
                                                unselected_option_label="none"
                                                select_classes="h-[24px] text-[12px] py-0 w-full"
                                                option_classes="text-[12px]"
                                                on_change={(value:reinforcement|"") => setMode({...mode, reinforcements: mode.reinforcements.map((v:reinforcement|"", i2:number) => i === i2 ? value : v) as [reinforcement|"",reinforcement|"",reinforcement|"",reinforcement|"",reinforcement|""]})}
                                                on_focus={() => setError(null)}
                                            /> : 
                                            <Text classes="w-full text-start" bold size='xs'>{r === "SHARPNESS/AMMO" ? (weapon_range === "melee" ? "SHARPNESS" : "AMMO") : r} BOOST</Text>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                        {mode.mode === "none" || mode.mode === "delete" ? 
                        <>
                        <Button 
                            disableRipple 
                            classes="text-[14px] mt-[-4px]" 
                            onClick={() => setMode(state => {return {...state, mode: "edit"}})}
                        >
                            Edit
                        </Button>
                        
                        <Button 
                            disableRipple 
                            classes="px-1 text-[14px] mt-[-4px]" 
                            onClick={() => setMode(state => {return {...state, mode: "delete"}})}
                        >
                            Remove
                        </Button>
                        </> : 
                        error ? <Text size={12} bold nowrap classes="text-red-300">{error}</Text> :
                        <>
                        <Button disableRipple classes="px-0 text-[14px] mt-[-4px]" onClick={finalizeEdit}>Finalize Edit</Button>
                        <Button disableRipple classes="px-1 text-[14px] mt-[-4px]" onClick={() => setMode({mode: "none", w, e, reinforcements})}>Cancel</Button>
                        </>
                        }
                    </div>
                </div>
            </div>
            <SlidingWindow active={mode.mode === 'delete'} transition_type="slide-left" classes="size-full flex flex-col justify-center items-center gap-2 p-2 rounded-t-xl bg-black">
                <div className='flex flex-col justify-center items-center'>
                    <Text size="md" bold>Are you sure you want to delete this preference?</Text>
                </div>
                <TimeoutButton 
                    disableRipple 
                    classes="bg-orange-800" disabled={!(mode.mode === 'delete')}
                    timeout={3}
                    start_timeout={mode.mode === 'delete'}
                    onClick={finalizeDelete}
                >
                    Yes
                </TimeoutButton>
                <Button disableRipple onClick={() => setMode({...mode, mode: 'none'})}>No</Button>
            </SlidingWindow>
        </PreferenceDisplayWrapper>
    )
}