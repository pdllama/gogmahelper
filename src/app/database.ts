import Database from 'better-sqlite3';
import { dbInitString } from './db/db_init';
import { gogma_database } from './db/app_init';


import { group_bonus_skill, keep_bonus_stat, set_bonus_skill, weapon_bonus_stat, weapon_skill_stat, keep_bonus_profile, roll_type, skill_roll } from '@custom_types/rolltype';
import { roll_type_other } from '@custom_types/rolltype';
import { weapons } from '@custom_types/weapons';
import { elements } from '@custom_types/element';
import { get_keep_rolls_query, get_rolls_query } from './db/db_getters';
import { bonus_db_to_app, levels_db_to_app } from './util/bonuses_formats';
import five_level_rolls = roll_type_other.five_level_rolls
import five_reinforcement_rolls = roll_type_other.five_reinforcement_rolls
import { addSkillRollQuery, updateSkillRollQuery } from './db/db_setters';

// Types of what gets sent back as a result of the db_query
type skill_stats_query = {
    weapon:weapons, 
    element:elements,
    num_rolls:number,
    // god_rolls: Array<{roll_num: number, set_bonus: set_bonus_skill, group_bonus: group_bonus_skill}>
    god_rolls: string // actually comes out as a string
}
type amend_bonus_stats_query = {
    weapon:weapons, 
    element:elements,
    num_rolls:number,
    // reinforcement and levels comes out as ex. "SHARP ELE ATK ATK AFF" "EX 3 EX EX 2". It is less storage to do so.
    // god_rolls: Array<{roll_num: number, reinforcements: string, reinforcement_levels: string}>
    god_rolls:string // actually comes out as a string
}
type keep_bonus_stats_query = {
    keep_id:string, // uuid
    name:string,
    weapon:weapons,
    element:elements,
    curr_reinforcements:string, 
    curr_reinforcement_levels:string, 
    canonical_target_reinforcement_levels:string,
    num_rolls: number,
    god_rolls: Array<{roll_num: number, roll:string}>
}

type skill_preference_query = {weapon:weapons|null, element:elements|null, set_bonus:set_bonus_skill, group_bonus:group_bonus_skill};
type bonus_preference_query = {weapon:weapons|null, element:elements|null, reinforcements:string};


class AppDatabase {
    db:Database.Database;

    constructor(db:Database.Database) {
        this.db = db;
        this.constructDatabase()
    }
    constructDatabase(){
        this.db.exec(dbInitString)
        console.log('Database Initialized!')
    }
    initialize_stats() {
        const skill_stats:weapon_skill_stat = {}
        for (let result of this.db.prepare<[], skill_stats_query>(gogma_database.skill_stats_query).all()) {
            if (skill_stats[result.weapon] === undefined) {
                skill_stats[result.weapon] = {}
            }
            skill_stats[result.weapon]![result.element] = {num_rolls:result.num_rolls, god_rolls: JSON.parse(result.god_rolls) as Array<{roll_num: number, set_bonus: set_bonus_skill, group_bonus: group_bonus_skill}>};
        }

        const amend_bonus_stats:weapon_bonus_stat = {}
        for (let result of this.db.prepare<[], amend_bonus_stats_query>(gogma_database.amend_stats_query).all()) {
            if (amend_bonus_stats[result.weapon] === undefined) {
                amend_bonus_stats[result.weapon] = {}
            }
            amend_bonus_stats[result.weapon]![result.element] = {
                num_rolls: result.num_rolls, 
                god_rolls: JSON.parse(result.god_rolls).map((gr:{roll_num: number, reinforcements: string, reinforcement_levels: string}) => {
                    return {roll_num: gr.roll_num, roll: gogma_database.convert_db_reinforcements_to_app(gr.reinforcements, gr.reinforcement_levels)}
                })
            } 
        }

        const keep_bonus_stats:keep_bonus_stat = {}
        const keep_bonus_profiles:Record<string, keep_bonus_profile> = {}
        for (let result of this.db.prepare<[], keep_bonus_stats_query>(gogma_database.keep_stats_query).all()) {
            keep_bonus_profiles[result.keep_id] = {
                name: result.name,
                weapon: result.weapon,
                element: result.element,
                curr_reinforcements: gogma_database.convert_db_reinforcements_to_app(result.curr_reinforcements, result.curr_reinforcement_levels),
                canonical_target_reinforcement_levels: result.canonical_target_reinforcement_levels.split(" ") as five_level_rolls
            }
            keep_bonus_stats[result.keep_id] = {
                num_rolls: result.num_rolls,
                god_rolls: result.god_rolls.map((gr) => {return {roll_num:gr.roll_num, roll: gr.roll.split(" ") as five_level_rolls}})
            }
        }

        return {ss: skill_stats, bs: amend_bonus_stats, kbs: keep_bonus_stats, kbp: keep_bonus_profiles}
    }
    initialize_preferences() {
        return {
            skill_preferences: this.db.prepare<[], skill_preference_query>(`SELECT * FROM skill_preferences ORDER BY weapon ASC, element ASC NULLS FIRST`).all(),
            bonus_preferences: this.db.prepare<[], bonus_preference_query>(`SELECT * FROM bonus_preferences ORDER BY weapon ASC, element ASC NULLS FIRST`).all()
                .map((bpq:bonus_preference_query) => {return {...bpq, reinforcements: bpq.reinforcements.split(" ") as five_reinforcement_rolls}})
        }

        // Below is code to segment the preferences (skills) by specificity. I reconsidered doing that and just had an array.
        //
        //  const skill_preferences:specificity_segmented_skill_preferences = {any: [], weapon: {}};
        // for (let sp of this.db.prepare<[], skill_preference_query>(`SELECT * FROM skill_preferences`).all()) {
        //     if (sp.weapon == null && sp.element == null) {skill_preferences.any.push({roll_num: 0, set_bonus: sp.set_bonus, group_bonus: sp.group_bonus})}
        //     else if (sp.weapon != null) {
        //         if (skill_preferences.weapon[sp.weapon] === undefined) {skill_preferences.weapon[sp.weapon] = {}}
        //         if (sp.element == null) {
        //             if (skill_preferences.weapon[sp.weapon]!.any === undefined) {skill_preferences.weapon[sp.weapon]!.any = []}
        //             skill_preferences.weapon[sp.weapon]!.any!.push({roll_num: 0, set_bonus: sp.set_bonus, group_bonus: sp.group_bonus})
        //         }
        //         else {
        //            if (skill_preferences.weapon[sp.weapon]![sp.element] === undefined) {skill_preferences.weapon[sp.weapon]![sp.element] = []}
        //             skill_preferences.weapon[sp.weapon]![sp.element]!.push({roll_num: 0, set_bonus: sp.set_bonus, group_bonus: sp.group_bonus}) 
        //         }
        //     }
        // }
    }

    // CREATE TABLE IF NOT EXISTS skill_rolls (
    //     roll_num INTEGER,
    //     profile_id INTEGER REFERENCES weapon_profile(profile_id),
    //     set_bonus TEXT CHECK( set_bonus IN (${string_set_bonus_enum}, '') ),
    //     group_bonus TEXT CHECK( group_bonus IN (${string_group_bonus_enum}, '') ),
    //     PRIMARY KEY (roll_num, profile_id)
    // );

    // CREATE TABLE IF NOT EXISTS amend_bonus_rolls (
    //     roll_num INTEGER,
    //     profile_id INTEGER REFERENCES weapon_profile(profile_id),
    //     reinforcements TEXT,
    //     reinforcement_levels TEXT,
    //     reinforcements_canonical TEXT,
    //     PRIMARY KEY (roll_num, profile_id)
    // );
    add_weapon(weapon:weapons, element:elements, rollType:roll_type) {
        // This function adds a new weapon/element combo to a rolltype

        const profile_id = gogma_database.get_profile_id(this.db, weapon, element, true); // This inserts the weapon profile if it is not there.

        // We need a dummy roll in the database (based on roll_type) so that when the app launches, the stat initialization recognizes the combo as a skill/amend bonus rolling combo.
        // These are initialized with empty set/group bonuses / reinforcements so they are never triggered as god rolls, and we filter them out when counting the number of rolls done.
        // Just need to make sure to always filter out roll #0 when doing roll queries.
        // Doesn't apply to keep bonus rolls.
        const insert_query = rollType === roll_type.SKILLS ? `INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (0, ${profile_id}, '', '')` : 
            `INSERT INTO amend_bonus_rolls(roll_num, profile_id, reinforcements, reinforcement_levels, reinforcements_canonical) VALUES (0, ${profile_id}, '', '', '')`

        this.db.exec(insert_query)
        
    }

    remove_weapon(weapon:weapons, rollType: roll_type) {
        // Removes all rolls of a given weapon and rollType, regardless of element.
        // We do NOT remove the weapon profile in case other tables are using it. We can just leave it open.
        this.db.exec(`
            DELETE FROM ${rollType === roll_type.SKILLS ? 'skill_rolls' : 'amend_bonus_rolls'} 
            WHERE profile_id IN (
                SELECT wp.profile_id
                FROM weapon_profile wp
                WHERE weapon = '${weapon}'
            )`)
    }

    remove_combo(weapon:weapons, element:elements, rollType:roll_type) {
        // Removes all rolls of a given weapon, element, and rollType. Never removes weapon profile, just all its rolls. 
        this.db.exec(`
                DELETE FROM ${rollType === roll_type.SKILLS ? 'skill_rolls' : 'amend_bonus_rolls'}
                WHERE profile_id IN (
                    SELECT wp.profile_id
                    FROM weapon_profile wp
                    WHERE weapon = '${weapon}' AND element = '${element}'
                )
            `)
    }

    get_rolls(weapon:weapons, element:elements, rollType:roll_type) {
        try {
        const weapon_profile:any = this.db.prepare(`SELECT profile_id FROM weapon_profile WHERE weapon = ? AND element = ?`).get(weapon, element)
        const wpid = weapon_profile.profile_id
        const arr = this.db.prepare(get_rolls_query(rollType)).all(wpid);
        if (rollType === roll_type.BONUSES) {
            return arr.map((item:any) => {
                const reinforcement_levels_formatted = levels_db_to_app(item.reinforcement_levels)
                return {
                    roll_num: item.roll_num,
                    roll: bonus_db_to_app(item.reinforcements).map((r, i) => {return {reinforcement: r, reinforcement_level: reinforcement_levels_formatted[i]}}),
                    reinforcements_canonical: item.reinforcements_canonical
                }
            })
        }
        return {rolls: arr, profile_id: wpid.toString()}
        } catch(e) {
            console.log(e)
            return {rolls: []}
        }
    }

    get_keep_rolls(keep_id: string) {
        const keep_profile = this.db.prepare<[string], keep_bonus_stats_query>(`SELECT * FROM keep_bonus_profile NATURAL JOIN weapon_profile WHERE keep_id = ?`).get(keep_id)
        const arr = this.db.prepare(get_keep_rolls_query()).all(keep_id);
        return {
            rolls: arr, 
            curr_reinforcements: keep_profile!.curr_reinforcements, 
            curr_levels: keep_profile!.curr_reinforcement_levels, 
            target: keep_profile!.canonical_target_reinforcement_levels
        }
    }


    add_skill_roll(pid:number, roll:skill_roll, roll_exists:boolean) {
        const queryString = roll_exists ? updateSkillRollQuery(pid, roll) : addSkillRollQuery(pid, roll)
        this.db.exec(queryString)
    }
}

export default AppDatabase