// All the queries related to initializing the application.
// Initializing the application involves doing the following:
//  1. Getting an array of all the weapons that have skill rolls/bonus rolls.
//  2. Getting stats about all the skill rolls, amend bonus rolls, and keep bonus rolls.
//  3. Getting the skill and bonus roll preferences. 

import { elements } from "@custom_types/element"
import { bonus_roll, bonus_type, reinforcement, reinforcement_level } from "@custom_types/rolltype";
import { roll_type_other } from "@custom_types/rolltype";
import five_bonus_rolls = roll_type_other.five_bonus_rolls
import five_level_rolls = roll_type_other.five_level_rolls
import { weapons } from "@custom_types/weapons"
import Database from "better-sqlite3"


export namespace gogma_database {
    // Tries to get the profile_id associated to a weapon/element combo. If it doesn't exist, you can choose to create it and return the new profile_id or not create it and return 0 (falsy value).
    export function get_profile_id(database:Database.Database, weapon:weapons, element:elements, create:boolean) : number {
        const profile_id = database.prepare<[weapons, elements], {profile_id:number}>(`SELECT profile_id FROM weapon_profile WHERE weapon = ? AND element = ?`).get(weapon, element);


        if (profile_id !== undefined) {return profile_id['profile_id'] as number}
        else if (create) {
            database.exec(`INSERT INTO weapon_profile(weapon, element) VALUES ('${weapon}', '${element}')`);
            
            const profile_id = database.prepare<[], {'last_insert_rowid()':number}>(`SELECT last_insert_rowid()`).get()
           
            return profile_id!['last_insert_rowid()'] as number // should always be defined.
        } else {
            return 0
        }
    }

    export type weapon_database_profile = {
        profile_id: number,
        weapon: weapons,
        element: elements
    }

    // Returns an array of weapon_profiles based on the filter criteria
    export function get_weapon_profiles(database:Database.Database, weapon:weapons|null, element:elements|null) : Array<weapon_database_profile> {
        if (weapon !== null && element !== null) {
            const profiles = database.prepare<[weapons, elements], weapon_database_profile>(`SELECT * FROM weapon_profile WHERE weapon = ? AND element = ?`).all(weapon, element);
            return profiles
        } else if (weapon !== null) {
            const all_elements_of_weapon = database.prepare<[weapons], weapon_database_profile>(`SELECT * FROM weapon_profile WHERE weapon = ?`).all(weapon);
            return all_elements_of_weapon
        } else if (element !== null) {
            const all_weapons_of_element = database.prepare<[elements], weapon_database_profile>(`SELECT * FROM weapon_profile WHERE element = ?`).all(element);
            return all_weapons_of_element
        } else {
            return database.prepare<[], weapon_database_profile>(`SELECT * FROM weapon_profile`).all();
        }
    } 

    // The SQL query to get the skill_stats. Has to be formatted again after 
    export const skill_stats_query = 
    `
    SELECT s.weapon, s.element, COUNT(*) - 1 as num_rolls,
    (
        SELECT json_group_array(
        json_object(
            'roll_num', sr.roll_num,
            'set_bonus', sr.set_bonus,
            'group_bonus', sr.group_bonus
        )
        )
        FROM (skill_rolls NATURAL JOIN weapon_profile) sr
        WHERE sr.roll_num != 0
        AND sr.weapon = s.weapon 
        AND sr.element = s.element
        AND EXISTS (
            SELECT 1 
            FROM skill_preferences p 
            WHERE (p.weapon IS NULL OR p.weapon = sr.weapon)
            AND (p.element IS NULL OR p.element = sr.element)
            AND p.set_bonus = sr.set_bonus 
            AND p.group_bonus = sr.group_bonus
        )
    ) AS god_rolls
    FROM (skill_rolls NATURAL JOIN weapon_profile) s
    GROUP BY s.weapon, s.element
    `
    // This one needs post processing to match the front-end version for god_rolls.
    export const amend_stats_query = 
    `
    SELECT ab.weapon, ab.element, COUNT(*) - 1 as num_rolls,
    (
        SELECT json_group_array(
        json_object(
            'roll_num', abr.roll_num,
            'reinforcements', abr.reinforcements,
            'reinforcement_levels', abr.reinforcement_levels
        )
        )
        FROM (amend_bonus_rolls NATURAL JOIN weapon_profile) abr
        WHERE abr.roll_num != 0
        AND abr.weapon = ab.weapon 
        AND abr.element = ab.element
        AND EXISTS (
            SELECT 1 
            FROM bonus_preferences p 
            WHERE (p.weapon IS NULL OR p.weapon = abr.weapon)
            AND (p.element IS NULL OR p.element = abr.element)
            AND p.reinforcements = abr.reinforcements_canonical
        )
    ) AS god_rolls
    FROM (amend_bonus_rolls NATURAL JOIN weapon_profile) ab
    GROUP BY ab.weapon, ab.element
    `
    // Also requires post-processing.
    export const keep_stats_query = 
    `
    SELECT kb.keep_id, kb.name, kb.weapon, kb.element, kb.curr_reinforcements, kb.curr_reinforcement_levels, kb.canonical_target_reinforcement_levels, COUNT(*) as num_rolls,
    (
        SELECT json_group_array(
        json_object(
            'roll_num', kbr.roll_num,
            'roll', kbr.reinforcement_levels
        )
        )
        FROM keep_bonus_rolls kbr
        WHERE kbr.keep_id = kb.keep_id AND kbr.roll_num != 0
        AND kbr.reinforcement_levels_canonical = kb.canonical_target_reinforcement_levels
    ) AS god_rolls
    FROM ((keep_bonus_profile NATURAL JOIN weapon_profile) LEFT JOIN keep_bonus_rolls) kb
    GROUP BY kb.keep_id, kb.name, kb.weapon, kb.element, kb.curr_reinforcements, kb.curr_reinforcement_levels, kb.canonical_target_reinforcement_levels
    `

    export const weapons_with_skill_rolls = `SELECT DISTINCT weapon FROM weapon_profile wp WHERE EXISTS (SELECT 1 FROM skill_rolls WHERE profile_id = wp.profile_id)`
    export const weapons_with_amend_rolls = `SELECT DISTINCT weapon FROM weapon_profile wp WHERE EXISTS (SELECT 1 FROM amend_bonus_rolls WHERE profile_id = wp.profile_id)`

    export function convert_db_reinforcements_to_app(db_reinforcements:string, db_reinforcement_levels:string) : five_bonus_rolls {
        const db_reinforcement_levels_arr = db_reinforcement_levels.split(" ") as five_level_rolls
        return db_reinforcements.split(" ")
                    .map((gr_bonus, i) => {
                        return {
                            bonus: gr_bonus as reinforcement, 
                            level: db_reinforcement_levels_arr[i] as reinforcement_level
                        }
                    }
                ) as five_bonus_rolls
    }

    export function convert_bonus_roll_to_db(roll:bonus_roll) : {reinf: string, levels: string} {
        let reinf = ''
        let levels = ''

        roll.roll.forEach((r:bonus_type, i:number) => {
            if (i !== 0) {reinf+=" "; levels+=" "}
            reinf+=r.bonus;
            levels+=r.level
        })

        return {reinf, levels}
    }

    export function convert_app_reinf_to_db(reinf:roll_type_other.five_reinforcement_rolls) {
        let str = ''
        reinf.forEach((l:reinforcement, i:number) => {
            if (i !== 0) {str+=" "}
            str += l
        })
        return str
    }

    export function convert_app_reinf_levels_to_db(levels:roll_type_other.five_level_rolls) {
        let str = ''
        levels.forEach((l:reinforcement_level, i:number) => {
            if (i !== 0) {str+=" "}
            str += l
        })
        return str
    }
}
