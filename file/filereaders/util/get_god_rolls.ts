import { list_of_applied_preferences, list_of_bonus_applied_preferences, list_of_skill_applied_preferences } from "@custom_types/preferences";
import { bonus_roll, roll_type as rollType, skill_roll } from "@custom_types/rolltype";

// Takes a list of rolls and preferences, and returns a list of rolls and their roll numbers for rolls that match a preference

export function get_god_rolls(rolls:Array<skill_roll|bonus_roll>, preferences:list_of_applied_preferences, roll_type:rollType) : Array<(skill_roll | bonus_roll)> {

    if (roll_type == rollType.SKILLS) {
        return rolls.filter((skr):skr is skill_roll => check_if_skill_god_roll(skr as skill_roll, preferences as list_of_skill_applied_preferences)) as Array<skill_roll>
    } else {
        // TO-DO: complete bonus version of this function
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



// TO-DO: complete this function, when you get to bonus roll logic
function check_if_bonus_god_roll(roll:bonus_roll, preferences:list_of_bonus_applied_preferences) {



    for (let pref of preferences) {

    }
}