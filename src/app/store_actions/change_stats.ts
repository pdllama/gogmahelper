// All actions which change skill_stats, amend_stats, and keep_stats in the store.

import { weapons } from "@custom_types/weapons";
import { elements } from "@custom_types/element";
import { bonus_roll, bonus_roll_type, keep_bonus_roll, roll_type, roll_type_other, skill_roll } from "@custom_types/rolltype";
import { MainStore } from "../main_store";
import { keep_bonus_profile } from "@custom_types/rolltype";
import { skill_rolls_array } from "@custom_types/preferences";

export const modify_skill_stat_weapon = (set:any) => {
    return (w:weapons, add:boolean) => set((state:MainStore) => ({skill_stats: {...state.skill_stats, [w]: add ? {} : undefined}}))
}
export const modify_amend_stat_weapon = (set:any) => {
    return (w:weapons, add:boolean) => set((state:MainStore) => ({amend_bonus_stats: {...state.amend_bonus_stats, [w]: add ? {} : undefined}}))
}
export const modify_keep_stat_weapon = (set:any) => {
    return (uuid:string, profile:keep_bonus_profile, add:boolean) => set((state:MainStore) => (
        {
            keep_bonus_stats: {...state.keep_bonus_stats, [uuid]: add ? {num_rolls: 0, god_rolls: []} : undefined},
            keep_bonus_profiles: {...state.keep_bonus_profiles, [uuid]: add ? profile : undefined}
        }
    ))
} 

export const modify_skill_stat_element = (set:any) => {
    return (w:weapons, e:elements, add:boolean) => set((state:MainStore) => ({skill_stats: {...state.skill_stats, [w]: {...(state.skill_stats[w] === undefined ? {} : state.skill_stats[w]), [e]: add ? {num_rolls: 0, god_rolls: []} : undefined}}}))
}
export const modify_amend_stat_element = (set:any) => {
    return (w:weapons, e:elements, add:boolean) => set((state:MainStore) => ({amend_bonus_stats: {...state.amend_bonus_stats, [w]: {...(state.amend_bonus_stats[w] === undefined ? {} : state.amend_bonus_stats[w]), [e]: add ? {num_rolls: 0, god_rolls: []} : undefined}}}))
}

type comboStat = {num_rolls: number, god_rolls:Array<skill_roll|bonus_roll|keep_bonus_roll>}
const addSkillRollToState = (rollExists:boolean, comboStat:comboStat, roll:skill_roll, w:weapons, e:elements, preferences:skill_rolls_array) => {
    
    // console.log(rollExists, comboStat.god_rolls.find(sr => sr.roll_num === roll.roll_num) !== undefined)
    const is_desired_roll = roll_type_other.is_desired_skill_roll(w, e, roll, preferences)
    if (is_desired_roll) {
        const was_desired_roll = (rollExists && comboStat.god_rolls.find(sr => sr.roll_num === roll.roll_num) !== undefined);
        if (was_desired_roll) {
            return comboStat.god_rolls.map(sr => {if (sr.roll_num === roll.roll_num) {return {...sr, set_bonus: roll.set_bonus, group_bonus: roll.group_bonus}} else {return sr}} )
        } else {
            return [...comboStat.god_rolls, roll].sort((a, b) => a.roll_num > b.roll_num ? 1 : -1)
        }
    } else {
        if (rollExists) {
            return comboStat.god_rolls.filter(sr => sr.roll_num !== roll.roll_num)
        } else {
            return comboStat.god_rolls
        }
    }

    // return roll_type_other.is_desired_skill_roll(w, e, roll, preferences) ? 
    //     ((rollExists && comboStat.god_rolls.find(sr => sr.roll_num === roll.roll_num) !== undefined) ? 
    //         comboStat.god_rolls.map(sr => {if (sr.roll_num === roll.roll_num) {return {...sr, set_bonus: roll.set_bonus, group_bonus: roll.group_bonus}} else {return sr}} ) : 
    //         [...comboStat.god_rolls, roll].sort((a, b) => a.roll_num > b.roll_num ? 1 : -1)) : 
    //     rollExists ? 
    //         comboStat.god_rolls.filter(sr => sr.roll_num !== roll.roll_num) : 
    //         comboStat.god_rolls
}

export const add_roll_to_stats = (set:any) => {
    return (roll:skill_roll|bonus_roll, rollType: roll_type, w:weapons, e:elements, rollExists:boolean) => set((state:MainStore) => (
        rollType === roll_type.SKILLS ? 
        {
            skill_stats: {
                ...state.skill_stats,
                [w]: {
                    ...state.skill_stats[w]!,
                    [e]: {
                        num_rolls: rollExists ? state.skill_stats[w]![e]!.num_rolls : state.skill_stats[w]![e]!.num_rolls+1,
                        god_rolls: addSkillRollToState(rollExists, state.skill_stats[w]![e]!, roll as skill_roll, w, e, state.skill_preferences)
                    }
                }
            }
        } :
        {
            amend_bonus_stats: {
                ...state.amend_bonus_stats,
                [w]: {
                    ...state.amend_bonus_stats[w]!,
                    [e]: {
                        num_rolls: state.amend_bonus_stats[w]![e]!.num_rolls+1,
                        god_rolls: roll_type_other.is_desired_amend_roll(w, e, roll as bonus_roll, state.bonus_preferences) ? 
                            rollExists && state.amend_bonus_stats[w]![e]!.god_rolls.find(br => br.roll_num === roll.roll_num) ? 
                                state.amend_bonus_stats[w]![e]!.god_rolls.map(br => br.roll_num === roll.roll_num ? {...br, roll: (roll as bonus_roll).roll} : br) : 
                                [...state.amend_bonus_stats[w]![e]!.god_rolls, roll].sort((a, b) => a.roll_num > b.roll_num ? 1 : -1) : 
                            rollExists ? 
                                state.amend_bonus_stats[w]![e]!.god_rolls.filter(br => br.roll_num !== roll.roll_num) : 
                                state.amend_bonus_stats[w]![e]!.god_rolls
                    }
                }
            }
        } 
    ))
}

export const add_keep_roll_to_stats = (set:any) => {
    return (roll:keep_bonus_roll, id:string, rollExists:boolean) => set((state:MainStore) => ({
        keep_bonus_stats: {
            ...state.keep_bonus_stats,
            [id]: {
                num_rolls: state.keep_bonus_stats[id]!.num_rolls+1,
                god_rolls: roll_type_other.is_desired_keep_roll(roll, state.keep_bonus_profiles[id]!.canonical_target_reinforcement_levels) ? 
                    rollExists && state.keep_bonus_stats[id]!.god_rolls.find(kbr => kbr.roll_num === roll.roll_num) ? 
                        state.keep_bonus_stats[id]!.god_rolls.map(kbr => kbr.roll_num === roll.roll_num ? {...kbr, roll: roll.roll} : kbr) :
                        [...state.keep_bonus_stats[id]!.god_rolls, roll].sort((a, b) => a.roll_num > b.roll_num ? 1 : -1) : 
                    rollExists ? 
                        state.keep_bonus_stats[id]!.god_rolls.filter(kbr => kbr.roll_num !== roll.roll_num) : 
                        state.keep_bonus_stats[id]!.god_rolls
            }
        }
    }))
}

export const remove_roll_from_stats = (set:any) => {
    return (roll_num:number, rollType:roll_type, bonusRollType:bonus_roll_type, kid:string|undefined) => set((state:MainStore) => ({
        skill_stats: rollType === roll_type.SKILLS ? {
            ...state.skill_stats,
            [state.selected_weapon!]: {...state.skill_stats[state.selected_weapon!]!, [state.selected_element!]: {num_rolls: state.skill_stats[state.selected_weapon!]![state.selected_element!]!.num_rolls-1, god_rolls: state.skill_stats[state.selected_weapon!]![state.selected_element!]!.god_rolls.filter(gr => !(gr.roll_num === roll_num))}}
        } : state.skill_stats,
        amend_bonus_stats: rollType === roll_type.BONUSES && bonusRollType === bonus_roll_type.AMEND ? {
            ...state.amend_bonus_stats,
            [state.selected_weapon!]: {...state.amend_bonus_stats[state.selected_weapon!]!, [state.selected_element!]: {num_rolls: state.amend_bonus_stats[state.selected_weapon!]![state.selected_element!]!.num_rolls-1, god_rolls: state.amend_bonus_stats[state.selected_weapon!]![state.selected_element!]!.god_rolls.filter(gr => !(gr.roll_num === roll_num))}}
        } : state.amend_bonus_stats,
        keep_bonus_stats: rollType === roll_type.BONUSES && bonusRollType === bonus_roll_type.KEEP ? {
            ...state.keep_bonus_stats,
            [kid as string]: {num_rolls: state.keep_bonus_stats[kid as string]!.num_rolls-1, god_rolls: state.keep_bonus_stats[kid as string]!.god_rolls.filter(kbr => kbr.roll_num === roll_num)}
        } : state.keep_bonus_stats
    }))
}