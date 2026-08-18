import Text from "@components/common/text/text"
import GridWrapper from "@components/display/gridwrapper"
import NewRollDisplay from "@components/display/weaponrolls/newrolldisplay"
import RollDisplay from "@components/display/weaponrolls/rolldisplay"
import { roll_type } from "@custom_types/rolltype"
import { weapons } from "@custom_types/weapons"
import { useMainStore } from "../../app/main_store"
import { useShallow } from "zustand/shallow"


export default function Bonuses({}) {

    const weapons_with_bonus_rolls = useMainStore(useShallow(state => Object.keys(state.amend_bonus_stats).filter(s => state.amend_bonus_stats[s as weapons] != undefined))) as weapons[]

    return <>
        <Text size='3xl' bold>Roll Bonuses</Text>
        <div className='w-full flex flex-col'>
            <Text size="xl" bold classes='text-start ml-3 py-5'>Rolls</Text>
            <GridWrapper>
                {weapons_with_bonus_rolls.map((w:weapons) => <RollDisplay key={`${w}-skill-display`} weapon={w} rollType={roll_type.BONUSES}/>)}
                {weapons_with_bonus_rolls.length !== 14 && <NewRollDisplay current_weapons={weapons_with_bonus_rolls} rollType={roll_type.BONUSES}/>}
            </GridWrapper>
        </div>
        
    </>
}