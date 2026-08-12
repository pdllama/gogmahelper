import { set_bonus_skill, group_bonus_skill, reinforcement, reinforcement_level } from "@custom_types/rolltype";


type cond_set_bonus = set_bonus_skill|''; type cond_group_bonus = group_bonus_skill|''; 
type cond_reinf_level = reinforcement_level|''
type cond_bonus_roll = {
    bonus: reinforcement|'', level: cond_reinf_level
}

export namespace rolltabletypes {
    export type cond_skill_roll = {roll_num:number, set_bonus: cond_set_bonus, group_bonus: cond_group_bonus}
    export type cond_amend_roll = {roll_num:number, roll: [cond_bonus_roll, cond_bonus_roll, cond_bonus_roll, cond_bonus_roll, cond_bonus_roll]}
    export type cond_keep_roll = {roll_num:number, roll: [cond_reinf_level, cond_reinf_level, cond_reinf_level, cond_reinf_level, cond_reinf_level]}
}