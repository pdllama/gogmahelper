import { set_bonus_skill, group_bonus_skill, reinforcement, reinforcement_level, bonus_roll } from "@custom_types/rolltype";
import { weapons } from "@custom_types/weapons";


type cond_set_bonus = set_bonus_skill|''; type cond_group_bonus = group_bonus_skill|''; 
type cond_reinf_level = reinforcement_level|''


export namespace rolltabletypes {
    export type cond_bonus_type = {
        bonus: reinforcement|'', level: cond_reinf_level
    }
    export type cond_skill_roll = {roll_num:number, set_bonus: cond_set_bonus, group_bonus: cond_group_bonus}
    export type cond_amend_roll = {roll_num:number, roll: [cond_bonus_type, cond_bonus_type, cond_bonus_type, cond_bonus_type, cond_bonus_type]}
    export type cond_keep_roll = {roll_num:number, roll: [cond_reinf_level, cond_reinf_level, cond_reinf_level, cond_reinf_level, cond_reinf_level]}
}


type amount_raised = {
    "ATTACK": {"1": number, "2": number, "3": number, "EX": number}
    "AFFINITY": {"1": number, "2": number, "3": number, "EX": number}
    "SHARPNESS/AMMO": {
        "ranged": {"1": number, "EX": number},
        "melee": {"1": number, "EX": number}
    }
    "ELEMENT": Record<weapons, {"1": number, "2": number, "EX": number}>
}
export const reinforcement_bonus_amounts : amount_raised = {
    "ATTACK": {"1": 5, "2": 6, "3": 9, "EX": 12},
    "AFFINITY": {"1": 5, "2": 6, "3": 8, "EX": 10},
    "SHARPNESS/AMMO": {
        "ranged": {"1": 1, "EX": 2},
        "melee": {"1": 30, "EX": 50}
    },
    "ELEMENT": {
        'bow': {"1": 30, "2": 40, "EX": 60},
        'charge_blade': {"1": 50, "2": 60, "EX": 80},
        'dual_blades': {"1": 20, "2": 30, "EX": 50},
        'gunlance': {"1": 50, "2": 60, "EX": 90},
        'great_sword': {"1": 80, "2": 90, "EX": 110},
        'hammer': {"1": 50, "2": 60, "EX": 90},
        'heavy_bowgun': {"1": 0, "2": 0, "EX": 0}, // the bowguns cannot have element bonuses (?))
        'hunting_horn': {"1": 50, "2": 60, "EX": 90},
        'insect_glaive': {"1": 30, "2": 50, "EX": 80},
        'lance': {"1": 50, "2": 60, "EX": 90},
        'light_bowgun': {"1": 0, "2": 0, "EX": 0}, // the bowguns cannot have element bonuses (?))
        'long_sword': {"1": 50, "2": 60, "EX": 90},
        'switch_axe': {"1": 30, "2": 50, "EX": 80},
        'sword_and_shield': {"1": 30, "2": 50, "EX": 80},
    }
}

export const allowed_amend_reinf_levels : Record<reinforcement, Array<reinforcement_level>> = {
    "ATTACK": [reinforcement_level.two, reinforcement_level.three, reinforcement_level.ex],
    "AFFINITY": [reinforcement_level.two, reinforcement_level.three, reinforcement_level.ex],
    "SHARPNESS/AMMO": [reinforcement_level.one, reinforcement_level.ex],
    "ELEMENT": [reinforcement_level.two, reinforcement_level.ex]
}

export const reinforcement_level_labels: Record<reinforcement_level, string> = {
    "1": "I",
    "2": "II",
    "3": "III",
    "EX": "EX"
}

const reinf_short_labels:Record<reinforcement, string> = {
    [reinforcement.ATK]: "ATK",
    [reinforcement.AFF]: "AFF",
    [reinforcement.ELE]: "ELE",
    [reinforcement.SHARP]: "SHARP"
}
const reinf_level_labels:Record<reinforcement_level, string> = {
    [reinforcement_level.one]: "I",
    [reinforcement_level.two]: "II",
    [reinforcement_level.three]: "III",
    [reinforcement_level.ex]: "EX"
}

export const convert_last_bonus_roll_to_string = (br:bonus_roll, weapon_range:"melee"|"ranged") => {
    const strings = []
    for (let row of br.roll) {
        const reinf_label = weapon_range === "ranged" && row.bonus === reinforcement.SHARP ? "AMMO" : reinf_short_labels[row.bonus]
        const reinf_lvl_label = reinf_level_labels[row.level]
        strings.push(`${reinf_label} ${reinf_lvl_label}`)
    }
    // for (let i = 0; i < br.roll.length; i++) {
    //     const row = br.roll[i]
    //     const reinf_label = weapon_range === "ranged" && row.bonus === reinforcement.SHARP ? "AMMO" : reinf_short_labels[row.bonus]
    //     const reinf_lvl_label = reinf_level_labels[row.level]
    //     if (i !== 0) {string+=" "}
    //     string+=`${reinf_label} ${reinf_lvl_label}`
    // }
    return strings
}