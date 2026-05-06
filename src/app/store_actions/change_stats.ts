// All actions which change skill_stats, amend_stats, and keep_stats in the store.

import { weapons } from "@custom_types/weapons";
import { elements } from "@custom_types/element";
import { MainStore } from "../main_store";
import { keep_bonus_profile } from "@custom_types/rolltype";

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
    return (w:weapons, e:elements, add:boolean) => set((state:MainStore) => ({amend_bonus_stats: {...state.amend_bonus_stats, [w]: {...(state.skill_stats[w] === undefined ? {} : state.skill_stats[w]), [e]: add ? {num_rolls: 0, god_rolls: []} : undefined}}}))
}
