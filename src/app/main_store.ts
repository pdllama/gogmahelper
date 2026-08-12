import { elements } from '@custom_types/element'
import { bonus_rolls_array, skill_rolls_array } from '@custom_types/preferences'
import { weapon_skill_stat, weapon_bonus_stat, keep_bonus_stat, keep_bonus_profile, roll_type, bonus_roll_type, skill_roll, bonus_roll, keep_bonus_roll } from '@custom_types/rolltype'
import { weapons } from '@custom_types/weapons'
import { create } from 'zustand'
import { add_keep_roll_to_stats, add_roll_to_stats, modify_amend_stat_element, modify_amend_stat_weapon, modify_keep_stat_weapon, modify_skill_stat_element, modify_skill_stat_weapon, remove_roll_from_stats } from './store_actions/change_stats'
import { menu } from '@custom_types/menutype'


export interface MainStore {
    skill_roll_num: number,
    bonus_roll_num: number,
    menu: menu,
    bonus_type: bonus_roll_type,
    selected_weapon: weapons|null,
    selected_element: elements|null,

    // weapons_with_data: Array<weapons>|null, // null signifies it hasn't been initialized yet
    skill_stats: weapon_skill_stat,
    amend_bonus_stats: weapon_bonus_stat,
    keep_bonus_stats: keep_bonus_stat,
    keep_bonus_profiles: Record<string, keep_bonus_profile>

    skill_preferences: skill_rolls_array,
    bonus_preferences: bonus_rolls_array,

    // add_weapon: (w:weapons) => void,
    // remove_weapon: (w:weapons) => void,
    modify_skill_stat_weapon: (w:weapons, add:boolean) => void,
    modify_amend_stat_weapon: (w:weapons, add:boolean) => void,
    modify_keep_stat_weapon: (uuid:string, profile:keep_bonus_profile, add:boolean) => void,
    modify_skill_stat_element: (w:weapons, e:elements, add:boolean) => void, 
    modify_amend_stat_element: (w:weapons, e:elements, add:boolean) => void, 

    increment_roll: (rt:roll_type) => void,
    add_roll_to_stats: (roll:skill_roll|bonus_roll, rollType: roll_type, w:weapons, e:elements, rollExists:boolean) => void,
    add_keep_roll_to_stats: (roll:keep_bonus_roll, id:string, rollExists:boolean) => void,
    remove_roll_from_stats: (roll_num:number, rollType:roll_type, bonusRollType:bonus_roll_type, kid:string|undefined) => void,
    set_roll_number: (rt:roll_type, n:number) => void,
    reset_roll_num: (rt:roll_type) => void,

    initialize_state: (ss:weapon_skill_stat, bs: weapon_bonus_stat, kbs: keep_bonus_stat, kbp: Record<string, keep_bonus_profile>, sp: skill_rolls_array, bp: bonus_rolls_array) => void,
    change_menu: (new_menu:menu) => void,

    select_weapon_element: (w:weapons|null, e:elements|null) => void
}

export const useMainStore = create<MainStore>((set) => ({

    skill_roll_num: 1,
    bonus_roll_num: 1,
    menu: menu.dashboard,
    bonus_type: bonus_roll_type.AMEND,
    selected_weapon: null,
    selected_element: null,

    skill_stats: {},
    amend_bonus_stats: {},
    keep_bonus_stats: {},
    keep_bonus_profiles: {},

    skill_preferences: [],
    
    bonus_preferences: [],

    modify_skill_stat_weapon: modify_skill_stat_weapon(set),
    modify_amend_stat_weapon: modify_amend_stat_weapon(set),
    modify_keep_stat_weapon: modify_keep_stat_weapon(set),
    modify_skill_stat_element: modify_skill_stat_element(set), 
    modify_amend_stat_element: modify_amend_stat_element(set), 

    // add_weapon: (w:weapons|string, stats_type:stats_type) => set((state) => (state.weapons_with_data ? {weapons_with_data: [...state.weapons_with_data, w]} : {weapons_with_data: [w]})),
    // remove_weapon: (w:weapons|string) => set((state) => (state.weapons_with_data ? {weapons_with_data: state.weapons_with_data.filter((w2:weapons) => w2 != w)} : {weapons_with_data: state.weapons_with_data})),

    increment_roll: (rt:roll_type) => set((state) => (rt == roll_type.SKILLS ? {skill_roll_num: state.skill_roll_num+1} : {bonus_roll_num: state.bonus_roll_num+1})),
    add_roll_to_stats: add_roll_to_stats(set),
    add_keep_roll_to_stats: add_keep_roll_to_stats(set),
    remove_roll_from_stats: remove_roll_from_stats(set),
    set_roll_number: (rt:roll_type, n:number) => set(() => (rt == roll_type.SKILLS ? {skill_roll_num: n} : {bonus_roll_num: n})),
    reset_roll_num: (rt:roll_type) => set(() => (rt == roll_type.SKILLS ? {skill_roll_num: 1} : {bonus_roll_num: 1})),

    initialize_state: (ss:weapon_skill_stat, bs: weapon_bonus_stat, kbs: keep_bonus_stat, kbp: Record<string, keep_bonus_profile>, sp: skill_rolls_array, bp: bonus_rolls_array) => 
        set(() => ({skill_stats: ss, amend_bonus_stats: bs, keep_bonus_stats: kbs, keep_bonus_profiles: kbp, skill_preferences:sp, bonus_preferences: bp})),
    change_menu: (new_menu:menu) => set(() => ({menu:new_menu, selected_weapon: null, selected_element: null})),

    select_weapon_element: (w:weapons|null, e:elements|null) => set(() => ({selected_weapon: w, selected_element: e}))

}))