
import { weapons } from '@custom_types/weapons';
import { elements } from '@custom_types/element';
import { set_bonus_skill, group_bonus_skill } from '@custom_types/rolltype';

let string_set_bonus_enum = ''
let string_group_bonus_enum = ''
let weapons_enum = ''
let elements_enum = ''

const string_set_bonuses:string[] = Object.values(set_bonus_skill).map((sbs:string) => sbs.indexOf("'") != -1 ? `${sbs.slice(0, sbs.indexOf("'"))}''${sbs.slice(sbs.indexOf("'")+1, sbs.length)}` : sbs);
for (let i=0;i<string_set_bonuses.length; i++) {
    if (i != 0) {string_set_bonus_enum += ', '}
    string_set_bonus_enum += `'${string_set_bonuses[i]}'`
}

const string_group_bonuses:string[] = Object.values(group_bonus_skill).map((gbs:string) => gbs.indexOf("'") != -1 ? `${gbs.slice(0, gbs.indexOf("'"))}''${gbs.slice(gbs.indexOf("'")+1, gbs.length)}` : gbs);
for (let i=0;i<string_group_bonuses.length; i++) {
    if (i != 0) {string_group_bonus_enum += ', '}
    string_group_bonus_enum += `'${string_group_bonuses[i]}'`
}

const string_weapons:string[] = Object.values(weapons);
for (let i=0;i<string_weapons.length; i++) {
    if (i != 0) {weapons_enum+= ', '}
    weapons_enum += `'${string_weapons[i]}'`
}

const string_elements:string[] = Object.values(elements);
for (let i=0;i<string_elements.length; i++) {
    if (i != 0) {elements_enum+= ', '}
    elements_enum += `'${string_elements[i]}'`
}

// REINFORCEMENT FORMAT "<REINFORCEMENT1> <REINFORCEMENT2> <REINFORCEMENT 3> <REINFORCEMENT 4> <REINFORCEMENT 5>"
// SAME FOR REINFORCEMENT LEVEL: "<LEVEL1> <LEVEL2> <LEVEL3> <LEVEL4> <LEVEL5>"
// DO NOT WANT TO GO THROUGH THE HASSLE OF ANOTHER TABLE. 
// Just add parsers to parse between db format and app format. 

    // PRAGMA foreign_keys = OFF;

    // DROP TABLE weapon_profile;
    // DROP TABLE skill_rolls;
    // DROP TABLE amend_bonus_rolls;
    // DROP TABLE keep_bonus_profile;
    // DROP TABLE keep_bonus_roll;
    // DROP TABLE skill_preferences;
    // DROP TABLE bonus_preferences;



// Note: Canonical fields are fields ordered in the same way. 
//  reinforcements: ATK -> AFF -> ELE -> SHARP
//  reinforcement_levels: EX -> 3 -> 2 -> 1
// massively helps comparisons
export const dbInitString = 
`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS weapon_profile (
        profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
        weapon TEXT CHECK( weapon IN (${weapons_enum}) ),
        element TEXT CHECK( element IN (${elements_enum}) )
    );

    CREATE TABLE IF NOT EXISTS skill_rolls (
        roll_num INTEGER,
        profile_id INTEGER REFERENCES weapon_profile(profile_id),
        set_bonus TEXT CHECK( set_bonus IN (${string_set_bonus_enum}, '') ),
        group_bonus TEXT CHECK( group_bonus IN (${string_group_bonus_enum}, '') ),
        PRIMARY KEY (roll_num, profile_id)
    );

    CREATE TABLE IF NOT EXISTS amend_bonus_rolls (
        roll_num INTEGER,
        profile_id INTEGER REFERENCES weapon_profile(profile_id),
        reinforcements TEXT,
        reinforcement_levels TEXT,
        reinforcements_canonical TEXT,
        PRIMARY KEY (roll_num, profile_id)
    );

    CREATE TABLE IF NOT EXISTS keep_bonus_profile (
        keep_id TEXT PRIMARY KEY,
        name TEXT,
        profile_id INTEGER REFERENCES weapon_profile(profile_id),
        curr_reinforcements TEXT,
        curr_reinforcement_levels TEXT,
        canonical_target_reinforcement_levels TEXT
    );
    
    CREATE TABLE IF NOT EXISTS keep_bonus_rolls (
        keep_id TEXT PRIMARY KEY REFERENCES keep_bonus_weapon(keep_id),
        roll_num INTEGER,
        reinforcement_levels TEXT,
        reinforcement_levels_canonical TEXT
    );

    CREATE TABLE IF NOT EXISTS skill_preferences (
        weapon TEXT CHECK( weapon IN (${weapons_enum}) ),
        element TEXT CHECK( element IN (${elements_enum}) ),
        set_bonus TEXT CHECK( set_bonus IN (${string_set_bonus_enum}) ),
        group_bonus TEXT CHECK( group_bonus IN (${string_group_bonus_enum}) ),
        PRIMARY KEY (weapon, element, set_bonus, group_bonus)
    );

    CREATE TABLE IF NOT EXISTS bonus_preferences (
        weapon TEXT CHECK( weapon IN (${weapons_enum}) ),
        element TEXT CHECK( element IN (${elements_enum}) ),
        reinforcements TEXT,
        PRIMARY KEY (weapon, element, reinforcements)
    );

`
