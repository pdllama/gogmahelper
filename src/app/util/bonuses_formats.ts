import { roll_type_other } from "@custom_types/rolltype"

export const bonus_db_to_app = (bonus_string:string) => {
    return bonus_string.split(" ") as roll_type_other.five_reinforcement_rolls
}

export const levels_db_to_app = (levels_string:string) => {
    return levels_string.split(" ") as roll_type_other.five_level_rolls
}

export const bonus_app_to_db = (bonuses:roll_type_other.five_reinforcement_rolls) => {
    let str = ""
    for (let i = 0; i < 5 ; i++) {
        str+= bonuses[i]
        if (i !== 4) {str+= " "}
    }
    return str;
}