import Text from "@components/common/text/text"
import GridWrapper from "@components/display/gridwrapper"
import NewRollDisplay from "@components/display/weaponrolls/newrolldisplay"
import SkillRollDisplay from "@components/display/weaponrolls/skillrolldisplay"
import { roll_type } from "@custom_types/rolltype"
import { weapons } from "@custom_types/weapons"
import { useMainStore } from "../../app/main_store"
import { useShallow } from "zustand/shallow"




export default function Skills({}) {

    const weapons_with_skill_rolls = useMainStore(useShallow(state => Object.keys(state.skill_stats))) as weapons[]

    return <>
        <Text size='3xl' bold>Roll Skills</Text>
        <div className='w-full flex flex-col'>
            <Text size="xl" bold classes='text-start ml-3'>Rolls</Text>
            <GridWrapper>
                {weapons_with_skill_rolls.map((w:weapons) => <SkillRollDisplay key={`${w}-skill-display`} weapon={w}/>)}
                {weapons_with_skill_rolls.length !== 14 && <NewRollDisplay current_weapons={weapons_with_skill_rolls} rollType={roll_type.SKILLS}/>}
            </GridWrapper>
        </div>
        
    </>
}