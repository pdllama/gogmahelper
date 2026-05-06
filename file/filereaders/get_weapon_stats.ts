import { roll_type as rollType, skill_roll, bonus_roll, weapon_bonus_stat, weapon_skill_stat } from "@custom_types/rolltype";
import type {bonus_roll_type, keep_bonus_stat, roll_map} from "@custom_types/rolltype"
import { weapons } from "@custom_types/weapons";
import open_json from "./util/openweaponjson";
import get_preferences from "./util/get_preferences";
import { preferences_json, weapons_json, weapons_json_keys, wjk_to_roll_type } from "@file/file_types";
import { readFile } from "fs/promises";
import { elements } from "@custom_types/element";
import { get_god_rolls } from "./util/get_god_rolls";

// Generates weapon_skill_stat/weapon_bonus_stat objects

export async function get_single_weapon_stats(weapons:weapons[], wjk:weapons_json_keys) : Promise<weapon_skill_stat|weapon_bonus_stat> {
    try {

        const preferences_json : preferences_json = await readFile(`preferences.json`, 'utf-8').then(f => JSON.parse(f))

        const stats : weapon_skill_stat|weapon_bonus_stat = {}

        for (let w of weapons) {
            const json = await open_json(w);

            stats[w] = {}
            const sub_obj = json[wjk]
            const roll_type = wjk_to_roll_type(wjk)

            for (let ele of Object.keys(sub_obj)) {

                const preferences = await get_preferences(roll_type, w, ele as elements, preferences_json)
                const element_rolls = sub_obj[ele]

                const num_rolls = element_rolls.length
                if (roll_type == rollType.SKILLS) {
                    stats[w][ele as elements] = {num_rolls, god_rolls: get_god_rolls(element_rolls, preferences, roll_type, undefined) as Array<skill_roll>}
                } else {
                    stats[w][ele as elements] = 
                        {
                            num_rolls, 
                            god_rolls: get_god_rolls(element_rolls, preferences, roll_type, "AMEND" as bonus_roll_type.AMEND) as Array<bonus_roll>
                        }
                }
                
            }

        }

        return stats

    } catch (error:any) {
        console.log("ERROR OCCURRED WHEN GETTING A WEAPON STAT!")
        console.log(error)
        return {}
    }
}



export async function get_all_weapons_stats(weapons:weapons[], type_map:roll_map) : Promise<{ss:weapon_skill_stat, bs:weapon_bonus_stat, ks:keep_bonus_stat}> {

    try {

        const preferences_json : preferences_json = await readFile(`preferences.json`, 'utf-8').then(f => JSON.parse(f))

        const stats :{ss:weapon_skill_stat, bs:weapon_bonus_stat, ks:keep_bonus_stat} = {ss: {}, bs: {}, ks: {}}

        for (let w of weapons) {

            stats.ss[w] = {}
            stats.bs[w] = {}
            const json = await open_json(w);

            for (let ele of Object.keys(sub_obj)) {

                const preferences = await get_preferences(roll_type, w, ele as elements, preferences_json)
                const element_rolls = sub_obj[ele]

                const num_rolls = element_rolls.length
                if (roll_type = rollType.SKILLS) {
                    stats[w][ele as elements] = {num_rolls, god_rolls: get_god_rolls(element_rolls, preferences, roll_type, undefined) as Array<skill_roll>}
                } else {
                    stats[w][ele as elements] = 
                        {
                            num_rolls, 
                            god_amend_rolls: get_god_rolls(element_rolls, preferences, roll_type, "AMEND" as bonus_roll_type.AMEND) as Array<bonus_roll>,
                            god_keep_rolls: get_god_rolls(element_rolls, preferences, roll_type, "KEEP" as bonus_roll_type.KEEP) as Array<bonus_roll>
                        }
                }
                
            }

        }

        return stats

    } catch (error:any) {
        console.log("ERROR OCCURRED WHEN GETTING BOTH WEAPON STATS")
        console.log(error)
        return  {ss: {}, bs: {}, ks: {}}
    } 

}


async function add_to_stat(stats:weapon_skill_stat|weapon_bonus_stat, w:weapons, json:weapons_json, preferences_json:preferences_json|null, roll_type:rollType) {
    stats[w] = {}
    const sub_obj = json.skills

    for (let ele of Object.keys(sub_obj) as elements[]) {

        const preferences = await get_preferences(rollType.SKILLS, w, ele, preferences_json)
        const element_rolls = sub_obj[ele] !== undefined ? sub_obj[ele] : []

        const num_rolls = element_rolls.length
        if (roll_type = rollType.SKILLS) {
            stats[w][ele as elements] = {num_rolls, god_rolls: get_god_rolls(element_rolls, preferences, roll_type, undefined) as Array<skill_roll>}
        } else {
            stats[w][ele as elements] = 
                {
                    num_rolls, 
                    god_amend_rolls: get_god_rolls(element_rolls, preferences, roll_type, "AMEND" as bonus_roll_type.AMEND) as Array<bonus_roll>,
                    god_keep_rolls: get_god_rolls(element_rolls, preferences, roll_type, "KEEP" as bonus_roll_type.KEEP) as Array<bonus_roll>
                }
        }
        
    }
}