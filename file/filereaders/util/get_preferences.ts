import { elements } from "@custom_types/element";
import { list_of_applied_preferences, preference_specificity, preferences_json } from "@custom_types/preferences";
import { roll_type as rollType } from "@custom_types/rolltype";
import { weapons } from "@custom_types/weapons";
import { readFile } from "fs/promises";


// gets all preferences related to a specific weapon/element
export default async function get_preferences(roll_type:rollType, weapon:weapons, element:elements, preferences_json:(preferences_json | null)) : Promise<list_of_applied_preferences> {

    try {
        const preferences : preferences_json = preferences_json ? preferences_json : await readFile(`preferences.json`, 'utf-8').then(f => JSON.parse(f))
        const concerned_type = roll_type == rollType.SKILLS ? preferences.skills : preferences.bonuses

        const list_of_preferences : list_of_applied_preferences = []

        for (let any_pref of concerned_type.any) {
            // Always add preferences for any to the array
            list_of_preferences.push({specificity: "any" as preference_specificity, roll: any_pref})
        }

        for (let w_any_pref of (concerned_type.weapon[weapon]?.any || [])) {
            list_of_preferences.push({specificity: "weapon" as preference_specificity, roll: w_any_pref})
        }

        for (let w_combo_pref of (concerned_type.weapon[weapon]?.[element] || [])) {
            list_of_preferences.push({specificity: "combo" as preference_specificity, roll: w_combo_pref})
        }

        return list_of_preferences
    } catch (e: any) {
        // We hit here if preferences.json doesn't exist.
        return []
    }

}