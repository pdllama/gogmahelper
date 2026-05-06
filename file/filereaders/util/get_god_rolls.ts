import { list_of_applied_preferences, list_of_bonus_applied_preferences, list_of_skill_applied_preferences } from "@custom_types/preferences";
import { bonus_roll, bonus_roll_type, keep_bonus_roll, reinforcement_level, roll_type as rollType, skill_roll } from "@custom_types/rolltype";
import { roll_type_other } from "@custom_types/rolltype";
import compare_bonus_rolls = roll_type_other.compare_bonus_rolls
import { keep_bonus_roll_subobj_json } from "@file/file_types";

// Takes a list of rolls and preferences, and returns a list of rolls and their roll numbers for rolls that match a preference

export function get_god_rolls(
    rolls:Array<skill_roll|bonus_roll|keep_bonus_roll>, 
    preferences:(list_of_applied_preferences|Array<reinforcement_level>),  // Array<number> in the case of keep_bonus_roll - it is just the max possible levels (ordered).
    roll_type:rollType,
    bonus_sub_type:bonus_roll_type|undefined) : 
    Array<(skill_roll|bonus_roll)>
{

    if (roll_type == rollType.SKILLS) {
        return rolls.filter((skr):skr is skill_roll => check_if_skill_god_roll(skr as skill_roll, preferences as list_of_skill_applied_preferences)) as Array<skill_roll>
    } else if (bonus_sub_type == "amend" as bonus_roll_type.AMEND) {
        return rolls.filter((br):br is bonus_roll => check_if_bonus_god_roll(br as bonus_roll, preferences as list_of_bonus_applied_preferences))
    } else {
        //TO-DO: implement KEEP bonus comparisons
        return []
    }

}


function check_if_skill_god_roll(roll:skill_roll, preferences:list_of_skill_applied_preferences) {
    for (let pref of preferences) {
        if (pref.roll.set_bonus == roll.set_bonus && pref.roll.group_bonus == roll.group_bonus) {
            return true
        }
    }
    return false
}

// for amend bonus. Just checks if the reinforcement type (atk, aff, etc) matches a preference
function check_if_bonus_god_roll(roll:bonus_roll, preferences:list_of_bonus_applied_preferences) : boolean {
    for (let pref of preferences) {
        if (compare_bonus_rolls(roll, pref.roll)) {
            return true
        }
    }
    return false
}

function check_if_keep_god_roll(roll:keep_bonus_roll, max_roll: Array<reinforcement_level>) : boolean{
    for (let i = 0; i < 5; i++) {
        if (roll.roll[i] !== max_roll[i]) {
            return false
        }
    }
    return true
}

// Returns the max possible reinforcement levels for a given keep_bonus_roll configuration
export function get_keep_god_roll(keep_data:keep_bonus_roll_subobj_json) : Array<reinforcement_level> {
    
    return []
}