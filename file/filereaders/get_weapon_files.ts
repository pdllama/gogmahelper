import * as fs from 'fs/promises'
import { weapons } from '@custom_types/weapons';
import { roll_map, roll_type } from '@custom_types/rolltype';

// Retrieves a list of weapons that have skill/bonus roll data associated to them.
// Does a check to ensure they are actually weapons, and maps whether they have skill rolls, bonus rolls, or both.

export async function get_weapon_file_names() {
    try {

        const files = await fs.readdir('data');
        const formatted = files.map((f:string) => f.slice(0, f.indexOf('.')))
        const actualWeapons = formatted.filter((f:string) => Object.values(weapons).map((w:weapons )=> w.toString()).includes(f))

        const type_map:roll_map = {}

        // Now that we have all valid files, we need to check which weapons have skills/bonuses, only skills, or only bonus rolls.
        // This is so that when we switch tabs to Skills/Bonuses, only the weapons that actually have skills/bonuses (respectively) are listed.
        for (let f of actualWeapons) {
            const json = await fs.readFile(`data/${f}.json`, 'utf-8').then(f => JSON.parse(f))
            if (json.skills != undefined && json.bonuses != undefined) {type_map[f as weapons] = "both" as roll_type}
            else if (json.skills != undefined) {type_map[f as weapons] = "skills" as roll_type}
            else if (json.bonuses != undefined) {type_map[f as weapons] = "bonuses" as roll_type}
            else {type_map[f as weapons] = "none" as roll_type}
        }

        return {actualWeapons, type_map}

    } catch(error:any) {
        if (error.code == 'ENOENT') { // NO ENTry - no such file/directory. In which case we want to say there's no files there. 
            return []
        }
        // So we need to handle other errors but im not sure what other types of errors there could be
        // By default just send []
        return []
    }
}

export async function get_weapon_files() {

}