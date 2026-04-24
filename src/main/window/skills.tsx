import Text from "@components/common/text/text"
import { elements } from "@custom_types/element"
import { WindowProp } from "@custom_types/props/window"
import { weapons } from "@custom_types/weapons"
import type { weapon_skill_stat} from "@custom_types/rolltype"
import { useEffect, useState } from "react"




type SkillsState = {
    weapon_stats: weapon_skill_stat|null // This will be computed on startup. 
}


const get_weapon_stats = () => {

}

export default function Skills({weapon_files, type_map, remove_weapon, add_weapon, weapon, element}:WindowProp) {

    const [skills_state, set_skills_state] = useState<SkillsState>({weapon_stats: null})

    useEffect(() => {

    }, [])

    return <>
        <Text size='3xl' bold>Roll Skills</Text>
    </>
}