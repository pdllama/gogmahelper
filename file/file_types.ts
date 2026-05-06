import { specificity_segmented_bonus_preferences, specificity_segmented_skill_preferences } from "@custom_types/preferences"
import { elements } from "@custom_types/element"
import { skill_roll, bonus_roll, reinforcement_level, roll_type } from "@custom_types/rolltype"

type skills_rolls_json = 
    Partial<
        Record<
            elements, 
            Array<skill_roll>
        >
    >

type amend_bonus_rolls_json = 
    Partial<
        Record<
            elements,
            Array<bonus_roll>
        >
    >

// Keep bonuses (obviously) depend on the current reinforcements and are (assumedly) independent of amend rolls. 
// So we need to keep a record or profile of the roll we are rolling "keep" on.
// Note we don't keep a record of the weapon type since it will already be in the file name.
type keep_bonus_roll_subobj_json = {
    name: string, // User-defined name of the profile. ex. Main Dragon Switch Axe or something
    element: elements, // Element of the weapon
    current: bonus_roll, // Current roll.
    rolls: Array<reinforcement_level> // Since we already know the reinforcements, we can save disk space and keep an ordered array of the reinforcement levels rather than the full roll.
}
type keep_bonus_rolls_json = Record<string, keep_bonus_roll_subobj_json> // string being a uuid
    

type preferences_json = {
    skills: specificity_segmented_skill_preferences,
    bonuses: specificity_segmented_bonus_preferences
}

type weapons_json = {
    skills: skills_rolls_json, 
    amend_bonuses: amend_bonus_rolls_json,
    keep_bonuses: keep_bonus_rolls_json
}

enum weapons_json_keys {
    skills = "skills",
    amend_bonuses = "amend_bonuses",
    keep_bonuses = "keep_bonuses"
}

//TO-DO: edit this function to setup keep_bonuses, when that functionality is supported.
//   the way that keep bonuses will be handled will have to be alongside amend bonuses, so it might be best to just return amend bonuses always.
const roll_type_to_wjk = (rollType:roll_type) => {
    if (rollType == roll_type.SKILLS) {return weapons_json_keys.skills}
    else {return weapons_json_keys.amend_bonuses}
}

const wjk_to_roll_type = (wjk:weapons_json_keys) => {
    if (wjk == weapons_json_keys.skills) { return roll_type.SKILLS }
    else { return roll_type.BONUSES }
}

export {weapons_json_keys, roll_type_to_wjk, wjk_to_roll_type}

export type {
    preferences_json, weapons_json, keep_bonus_roll_subobj_json
}