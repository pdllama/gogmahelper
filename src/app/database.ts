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
import { addSkillRollQuery, deleteSkillRollQuery, updateSkillRollQuery } from './db/db_setters';
import { bonus_roll_preference, skill_roll_preference } from '@custom_types/preferences';
import sanitizeSkillName from './util/sanitizeskillname';

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

        return {ss: this.get_skill_stats(), bs: this.get_amend_stats(), kbs: keep_bonus_stats, kbp: keep_bonus_profiles}
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

    get_skill_stats() {
        const skill_stats:weapon_skill_stat = {}
        for (let result of this.db.prepare<[], skill_stats_query>(gogma_database.skill_stats_query).all()) {
            if (skill_stats[result.weapon] === undefined) {
                skill_stats[result.weapon] = {}
            }
            skill_stats[result.weapon]![result.element] = {num_rolls:result.num_rolls, god_rolls: JSON.parse(result.god_rolls) as Array<{roll_num: number, set_bonus: set_bonus_skill, group_bonus: group_bonus_skill}>};
        }
        return skill_stats
    }
    get_amend_stats() {
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
        return amend_bonus_stats
    }

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
    remove_skill_roll(pid:number, roll_num:number) {
        this.db.exec(deleteSkillRollQuery(pid, roll_num));
    }


    add_preference(rt:roll_type, pref:skill_roll_preference|bonus_roll_preference) {
        if (rt === roll_type.SKILLS) {
            const spref = pref as skill_roll_preference
            this.db.exec(`INSERT INTO skill_preferences(weapon, element, set_bonus, group_bonus) VALUES (${spref.weapon ? `'${spref.weapon}'` : 'NULL'}, ${spref.element ? `'${spref.element}'` : 'NULL'}, '${sanitizeSkillName(spref.set_bonus)}', '${sanitizeSkillName(spref.group_bonus)}')`)
        } else {
            const bpref = pref as bonus_roll_preference
            let textReinforcements = ''
            for (let i = 0; i < bpref.reinforcements.length; i++) {
                const reinf = bpref.reinforcements[i]
                if (i != 0) {textReinforcements+=" "}
                textReinforcements+=reinf
            }
            this.db.exec(`INSERT INTO bonus_preferences(weapon, element, reinforcements) VALUES (${bpref.weapon ? `'${bpref.weapon}'` : 'NULL'}, ${bpref.element ? `'${bpref.element}'` : 'NULL'}, '${textReinforcements}')`)
        }
        return rt === roll_type.SKILLS ? this.get_skill_stats() : this.get_amend_stats()
    }
    edit_preference(rt:roll_type, orig:skill_roll_preference|bonus_roll_preference, n:skill_roll_preference|bonus_roll_preference) {
        const origw = !orig.weapon ? "IS NULL" : `= '${orig.weapon}'`
        const orige = !orig.element ? "IS NULL" : `= '${orig.element}'`
        const nw = !n.weapon ? "NULL" : `'${n.weapon}'`
        const ne = !n.element ? "NULL" : `'${n.element}'`
        if (rt === roll_type.SKILLS) {
            const sorig = orig as skill_roll_preference
            const sn = n as skill_roll_preference
            this.db.exec(`UPDATE skill_preferences SET weapon = ${nw}, element = ${ne}, set_bonus = '${sanitizeSkillName(sn.set_bonus)}', group_bonus = '${sanitizeSkillName(sn.group_bonus)}' WHERE weapon ${origw} AND element ${orige} AND set_bonus = '${sanitizeSkillName(sorig.set_bonus)}' AND group_bonus = '${sanitizeSkillName(sorig.group_bonus)}'`)
        } else {
            let textReinfOrig = ''
            let textReinfNew = ''
            for (let i = 0; i < 5; i++) {
                const reinfOrig = (orig as bonus_roll_preference).reinforcements[i]
                const reinfNew = (n as bonus_roll_preference).reinforcements[i]
                if (i !== 0) {textReinfOrig+=" "; textReinfNew+=" ";}
                textReinfOrig+=reinfOrig; textReinfNew+=reinfNew
            }
            this.db.exec(`UPDATE bonus_preferences SET weapon = ${nw}, element = ${ne}, reinforcements = '${textReinfNew}' WHERE weapon ${origw} AND element ${orige} AND reinforcements = '${textReinfOrig}'`)
        }
        return rt === roll_type.SKILLS ? this.get_skill_stats() : this.get_amend_stats()
    }
    remove_preference(rt:roll_type, pref:skill_roll_preference|bonus_roll_preference) {
        const w = pref.weapon ? `= '${pref.weapon}'` : 'IS NULL'
        const e = pref.element ? `= '${pref.element}'` : 'IS NULL'
        if (rt === roll_type.SKILLS) {
            const spref = pref as skill_roll_preference
            this.db.exec(`DELETE FROM skill_preferences WHERE weapon ${w} AND element ${e} AND set_bonus = '${sanitizeSkillName(spref.set_bonus)}' AND group_bonus = '${sanitizeSkillName(spref.group_bonus)}'`)
        } else {
            const bpref = pref as bonus_roll_preference
            let textreinf = ''
            for (let i = 0; i < 5; i++) {
                const reinf = bpref.reinforcements[i]
                if (i !== 0) {textreinf += ' '}
                textreinf+=reinf
            }
            this.db.exec(`DELETE FROM bonus_preferences WHERE weapon ${w} AND element ${e} AND reinforcements = '${textreinf}'`)
        }
        return rt === roll_type.SKILLS ? this.get_skill_stats() : this.get_amend_stats()
    }
}

export default AppDatabase