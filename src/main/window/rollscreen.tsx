import { useMainStore } from "@app/main_store"
import Button from "@components/common/button/button"
import Text from "@components/common/text/text"
import CaptureContainer from "@components/display/rollscreen/capture_container"
import RollNumberDisplay from "@components/display/rollscreen/rollnumberdisplay"
import RollTable from "@components/display/rollscreen/rolltable"
import { element_labels, elements } from "@custom_types/element"
import { weapon_labels, weapons } from "@custom_types/weapons"
import { useEffect, useState } from "react"
import { initialize_combo_rolls } from "@app/store_actions/rolls"
import { menu as MenuType } from "@custom_types/menutype"
import { roll_type } from "@custom_types/rolltype"
import { skill_roll, bonus_roll, keep_bonus_roll } from "@custom_types/rolltype"

type RollScreenProps = {
    w:weapons,
    e:elements
}

export type rollsDataState = {
    rolls: Array<skill_roll|bonus_roll|keep_bonus_roll>,
    pid: number,
    loadedRolls: boolean
}

export default function RollScreen({w, e}:RollScreenProps) {

    const select_weapon_element = useMainStore((state) => state.select_weapon_element)
    const selected_weapon = useMainStore(state => state.selected_weapon);
    const selected_element = useMainStore(state => state.selected_element);
    
    const [rollsData, setRollsData] = useState<rollsDataState>({rolls: [], pid: 0, loadedRolls: false})
    const {rolls, loadedRolls} = rollsData

    const menu = useMainStore(state => state.menu);
    const rollType = menu === MenuType.skills ? roll_type.SKILLS : roll_type.BONUSES;
    const bonus_type = useMainStore(state => state.bonus_type); // whether amend or keep

    const roll_num = useMainStore(state => rollType === roll_type.SKILLS ? state.skill_roll_num : state.bonus_roll_num)

    useEffect(() => {
        if (loadedRolls) {setRollsData({...rollsData, loadedRolls: false});}
        if (!(selected_weapon === null || selected_element === null || !rollType)) {
            initialize_combo_rolls(setRollsData, selected_weapon, selected_element, rollType)
        }
    }, [selected_weapon, selected_element])

    const insertRoll = (roll:skill_roll|bonus_roll|keep_bonus_roll, roll_exists:boolean) => {
        setRollsData((state:rollsDataState) => {
            return {
                ...state, 
                rolls: roll_exists ? state.rolls.map((r) => r.roll_num === roll.roll_num ? roll : r) : 
                [...state.rolls, roll].sort((a, b) => a.roll_num > b.roll_num ? 1 : -1)
            }
        })
    }

    return (
        <>
        <div className='w-full flex flex-col gap-3'>
            <Button disableRipple classes="absolute top-[5px] left-[5px] w-fit" onClick={() => select_weapon_element(null, null)}>
                <Text size="lg">Go Back</Text>
            </Button>
            <div className='w-full flex gap-1'>
                <img src={`icons/elements/${e}.png`} className='h-fit' width='50px' height='50px'/>
                <img src={`icons/weapons/${w}.png`} className='h-fit' width='50px' height='50px'/>
                <Text size='3xl' bold nowrap>{element_labels[e]} {weapon_labels[w]}</Text>
            </div>
            <CaptureContainer rolls={rolls} pid={rollsData.pid} roll_num={roll_num} insertRoll={insertRoll} rollType={rollType}/>
            <Text size="md" classes="text-start pl-2">Currently on Roll Number: {roll_num}</Text>
            <RollTable rolls={rolls} roll_num={roll_num} rollType={rollType} bonusRollType={bonus_type} loadedRolls={loadedRolls}/>
        </div>
        </>
    )
    
}