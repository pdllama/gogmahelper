import { roll_type as rollType, skill_roll, weapon_skill_stat } from "@custom_types/rolltype";
import { weapons } from "@custom_types/weapons";
import open_json from "./util/openweaponjson";
import get_preferences from "./util/get_preferences";
import { preferences_json } from "@custom_types/preferences";
import { readFile } from "fs/promises";
import { elements } from "@custom_types/element";
import { get_god_rolls } from "./util/get_god_rolls";

// Generates a weapon_stat object from the current rolls, depending on the screen you're on

export async function get_weapon_skill_stats(weapons:weapons[], roll_type:rollType) : Promise<weapon_skill_stat> {
    try {

        const preferences_json : preferences_json = await readFile(`preferences.json`, 'utf-8').then(f => JSON.parse(f))

        const stats : weapon_skill_stat = {}

        for (let w of weapons) {

            stats[w] = {}
            const json = await open_json(w);
            const sub_obj = json[roll_type]

            for (let ele of Object.keys(sub_obj)) {

                const preferences = await get_preferences(roll_type, w, ele as elements, preferences_json)
                const element_rolls = sub_obj[ele]

                const num_rolls = element_rolls.length
                stats[w][ele as elements] = {num_rolls, god_rolls: get_god_rolls(element_rolls, preferences, rollType.SKILLS) as Array<skill_roll>}
            }

        }

        return stats

    } catch (error:any) {
        console.log("ERROR OCCURRED WHEN GETTING WEAPON STATS!")
        console.log(error)
        return {}
    }
}