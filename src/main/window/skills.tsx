import Text from "@components/common/text/text"
import GridWrapper from "@components/display/gridwrapper"
import NewRollDisplay from "@components/display/weaponrolls/newrolldisplay"
import RollDisplay from "@components/display/weaponrolls/rolldisplay"
import { roll_type } from "@custom_types/rolltype"
import { weapons } from "@custom_types/weapons"
import { useMainStore } from "../../app/main_store"
import { useShallow } from "zustand/shallow"
import ChangeableRollNumberDisplay from "@components/display/rollscreen/generalcomponents/rollnumberdisplay"
import { skill_roll_preference, bonus_roll_preference } from "@custom_types/preferences"
import SkillPrefDisplay from "@components/display/preferences/skillprefdisplay"
import NewSkillPreferenceForm from "@components/display/preferences/newskillpref"


export default function Skills({}) {

    const weapons_with_skill_rolls = useMainStore(useShallow(state => Object.keys(state.skill_stats).filter(s => state.skill_stats[s as weapons] != undefined))) as weapons[]
    const skill_preferences = useMainStore(state => state.skill_preferences);

    return <>
        <Text size='3xl' bold>Roll Skills</Text>
        <div className='w-full flex flex-col gap-1'>
            <ChangeableRollNumberDisplay />
            <Text size="xl" bold classes='text-start ml-3 py-5'>Rolls</Text>
            <GridWrapper>
                {weapons_with_skill_rolls.map((w:weapons) => <RollDisplay key={`${w}-skill-display`} weapon={w} rollType={roll_type.SKILLS}/>)}
                {weapons_with_skill_rolls.length !== 14 && <NewRollDisplay current_weapons={weapons_with_skill_rolls} rollType={roll_type.SKILLS}/>}
            </GridWrapper>
            <Text size="xl" bold classes='text-start ml-3 pb-1 pt-5'>Skill Preferences</Text>
            <Text size="sm" classes='text-start ml-3 pb-5 pt-1'>Select which skills you're looking for on which weapon/element combos</Text>
            <GridWrapper gap={0.25}>
                {skill_preferences.map((spref:skill_roll_preference, i:number) => <SkillPrefDisplay key={`skill-preference-display-${i}`} w={spref.weapon} e={spref.element} set_bonus={spref.set_bonus} group_bonus={spref.group_bonus} pref_index={i}/>)}
                <NewSkillPreferenceForm />
            </GridWrapper>
        </div>
        
    </>
}