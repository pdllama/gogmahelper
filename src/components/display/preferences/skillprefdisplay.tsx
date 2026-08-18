import { element_labels, elements } from "@custom_types/element"
import { group_bonus_skill, roll_type, set_bonus_skill } from "@custom_types/rolltype"
import { weapon_labels, weapons } from "@custom_types/weapons"
import PreferenceDisplayWrapper from "./preferencewrapper"
import Text from "@components/common/text/text"
import Button from "@components/common/button/button"
import SlidingWindow from "@components/common/sliding_window/slidingwindow"
import { useState } from "react"
import TimeoutButton from "@components/common/button/timeoutbutton"
import Select from "@components/common/select/select"
import { useMainStore } from "@app/main_store"
import { skill_roll_preference } from "@custom_types/preferences"
import { useAlertStore } from "@app/alerts/alert_store"

const all_weapons = Object.values(weapons);
const all_elements = Object.values(elements);
const all_set_bonuses = Object.values(set_bonus_skill);
const all_group_bonuses = Object.values(group_bonus_skill);

type SkillPrefDisplayProps = {
    w: null|weapons
    e: null|elements
    set_bonus: set_bonus_skill
    group_bonus: group_bonus_skill
    pref_index: number
}

type SkillPrefDisplayState = {
    mode: "none"|"edit"|"delete"
    w: null|weapons
    e: null|elements
    set_bonus: set_bonus_skill
    group_bonus: group_bonus_skill
}

export default function SkillPrefDisplay({w, e, set_bonus, group_bonus, pref_index}:SkillPrefDisplayProps) {

    const [error, setError] = useState<string|null>(null)
    const [mode, setMode] = useState<SkillPrefDisplayState>({mode: "none", w, e, set_bonus, group_bonus})
    const is_same_as_before_edit = mode.w === w && mode.e === e && mode.set_bonus === set_bonus && mode.group_bonus === group_bonus
    const is_new_preference = useMainStore((state) => !is_same_as_before_edit && state.skill_preferences.filter(s => s.weapon === mode.w && s.element === mode.e && s.set_bonus === mode.set_bonus && s.group_bonus === mode.group_bonus).length === 0)
    const edit_preference = useMainStore(state => state.edit_preference)
    const delete_preference = useMainStore(state => state.remove_preference)
    const add_alert = useAlertStore(state => state.add_alert)

    const section_height = mode.mode === "edit" ? 'h-[80px]' : 'h-[100px]'

    const finalizeEdit = async() => {
        if (is_same_as_before_edit) {setMode({...mode, mode: "none"})}
        else if (!is_new_preference) {setError("Preference already exists!")}
        else if (!mode.w && mode.e) {setError("Cannot have any weapon and specific element!")}
        else {
            const orig:skill_roll_preference = {weapon: w, element: e, set_bonus, group_bonus}
            const newpref:skill_roll_preference = {weapon: mode.w, element: mode.e, set_bonus: mode.set_bonus, group_bonus: mode.group_bonus}
            const new_skill_stats = await window.ipcRenderer.edit_preference(roll_type.SKILLS, orig, newpref);
            edit_preference(roll_type.SKILLS, newpref, pref_index, new_skill_stats)
            add_alert({title: "Edited the Skill Preference!", content: '', timeout: 3, type:'success'})
            setMode({...mode, mode: 'none'})
        }
    }

    const finalizeDelete = async() => {
        const new_skill_stats = await window.ipcRenderer.remove_preference(roll_type.SKILLS, {weapon: w, element: e, set_bonus, group_bonus})
        delete_preference(roll_type.SKILLS, pref_index, new_skill_stats)
        add_alert({title: "Deleted the Skill Preference!", content: '', timeout: 3, type:'success'})
    }

    return (
        <PreferenceDisplayWrapper classes="h-[225px] relative overflow-hidden">
            <div className="size-full flex flex-col items-center p-2 gap-2">
                {/* <div className="w-full flex gap-2">
                    <Text size='md' bold>Weapon: </Text>
                    <Text size='md'>{!w ? <i>any</i> : weapon_labels[w]}</Text>
                    {w && <img src={`icons/weapons/${w}`} />}
                </div>
                <div className="w-full flex gap-2">
                    <Text size='md' bold>Element: </Text>
                    <Text size='md'>{!e ? <i>any</i> : element_labels[e]}</Text>
                    {e && <img src={`icons/elements/${e}`} />}
                </div> */}
                <div className="flex justify-center w-full gap-2 w-full">
                    <div className="flex flex-col items-center gap-1 w-1/2">
                        <Text size="md" bold>Weapon</Text>
                        <div className={`size-full flex justify-center items-center relative ${section_height}`}>
                            <img src={`public/icons/weapons/${!mode.w ? "all" : mode.w}.png`} style={{height: '100%', opacity: 0.15, position: 'absolute'}}/>
                            {mode.mode === "edit" ? 
                            <Select 
                                selected={mode.w === null ? '' : mode.w} 
                                options={all_weapons} 
                                unselected_option_label="any"
                                label_map={weapon_labels} select_classes="w-full py-0 h-[30px] text-[12px] z-5 opacity-50" 
                                on_change={(value:weapons|"") => setMode({...mode, w:value === "" ? null : value})}
                                on_focus={() => setError(null)}
                            />:
                            <Text size='lg' bold>{!mode.w ? "Any" : weapon_labels[mode.w]}</Text>
                            }
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 w-1/2">
                        <Text size="md" bold>Element</Text>
                        <div className={`size-full flex justify-center items-center relative ${section_height}`}>
                            <img src={`public/icons/elements/${!mode.e ? "all" : mode.e}.png`} style={{height: '100%', opacity: 0.15, position: 'absolute'}}/>
                            {mode.mode === "edit" ? 
                            <Select 
                                selected={mode.e === null ? '' : mode.e} 
                                options={all_elements} 
                                unselected_option_label="any"
                                label_map={element_labels} select_classes="w-full py-0 h-[30px] text-[12px] z-5 opacity-50" 
                                on_change={(value:elements|"") => setMode({...mode, e:value === "" ? null : value})}
                                on_focus={() => setError(null)}
                            /> : 
                            <Text size='lg' bold>{!mode.e ? "Any" : element_labels[mode.e]}</Text>
                            }
                        </div>
                    </div>
                </div>
                <div className="w-full flex gap-2">
                    <Text size='sm' bold nowrap>Set Bonus:</Text>
                    {mode.mode === "edit" ? 
                    <Select 
                        selected={mode.set_bonus} 
                        options={all_set_bonuses} 
                        disable_unselected
                        select_classes="w-full py-0 h-[30px] text-[12px]" 
                        on_change={(value:set_bonus_skill) => setMode({...mode, set_bonus: value})}
                        on_focus={() => setError(null)}
                    /> : 
                    <Text size='sm' nowrap>{mode.set_bonus}</Text>
                    }
                </div>
                <div className="w-full flex gap-2">
                    <Text size='sm' bold nowrap>Group Bonus:</Text>
                    {mode.mode === "edit" ? 
                    <Select 
                        selected={mode.group_bonus} 
                        options={all_group_bonuses} 
                        disable_unselected
                        select_classes="w-full py-0 h-[30px] text-[12px]" 
                        on_change={(value:group_bonus_skill) => setMode({...mode, group_bonus: value})}
                        on_focus={() => setError(null)}
                    /> :
                        <Text size='sm' nowrap>{mode.group_bonus}</Text>
                    }
                </div>
                <div className="w-full flex justify-end gap-2">
                    {mode.mode === "none" || mode.mode === "delete" ? 
                    <>
                    <Button disableRipple classes="py-0 text-[14px] mt-[-4px]" onClick={() => setMode(state => {return {...state, mode: "edit"}})}>Edit</Button>
                    <Button disableRipple classes="py-0 text-[14px] mt-[-4px]" onClick={() => setMode(state => {return {...state, mode: "delete"}})}>Remove</Button>
                    </> :
                    error ? 
                    <Text size={12} bold nowrap classes="text-red-300">{error}</Text> :
                    <>
                    <Button disableRipple classes="py-0 text-[14px] mt-[-4px]" onClick={finalizeEdit}>Finalize Edit</Button>
                    <Button disableRipple classes="py-0 text-[14px] mt-[-4px]" onClick={() => setMode(state => {return {...state, mode: "none"}})}>Cancel</Button>
                    </>
                    }
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