import Text from "@components/common/text/text"
import GridWrapper from "@components/display/gridwrapper"
import NewRollDisplay from "@components/display/weaponrolls/newrolldisplay"
import RollDisplay from "@components/display/weaponrolls/rolldisplay"
import { roll_type } from "@custom_types/rolltype"
import { weapons } from "@custom_types/weapons"
import { useMainStore } from "../../app/main_store"
import { useShallow } from "zustand/shallow"
import NewBonusPreferenceForm from "@components/display/preferences/newbonuspref"
import { bonus_roll_preference } from "@custom_types/preferences"
import BonusPrefDisplay from "@components/display/preferences/bonusprefdisplay"


export default function Bonuses({}) {

    const weapons_with_bonus_rolls = useMainStore(useShallow(state => Object.keys(state.amend_bonus_stats).filter(s => state.amend_bonus_stats[s as weapons] != undefined))) as weapons[]
    const bonus_preferences = useMainStore(state => state.bonus_preferences)

    return <>
        <Text size='3xl' bold>Roll Bonuses</Text>
        <div className='w-full flex flex-col'>
            <Text size="xl" bold classes='text-start ml-3 py-5'>Rolls</Text>
            <GridWrapper>
                {weapons_with_bonus_rolls.map((w:weapons) => <RollDisplay key={`${w}-skill-display`} weapon={w} rollType={roll_type.BONUSES}/>)}
                {weapons_with_bonus_rolls.length !== 14 && <NewRollDisplay current_weapons={weapons_with_bonus_rolls} rollType={roll_type.BONUSES}/>}
            </GridWrapper>
            <Text size="xl" bold classes='text-start ml-3 pb-1 pt-5'>Bonus Preferences</Text>
            <Text size="sm" classes='text-start ml-3 pb-5 pt-1'>Select which bonuses (not their levels) you're looking for. The order does not matter.</Text>
            <GridWrapper gap={0.25}>
                {bonus_preferences.map((bpref:bonus_roll_preference, i:number) => <BonusPrefDisplay w={bpref.weapon} e={bpref.element} reinforcements={bpref.reinforcements} pref_index={i}/>)}
                <NewBonusPreferenceForm/>
            </GridWrapper>
        </div>
        
    </>
}