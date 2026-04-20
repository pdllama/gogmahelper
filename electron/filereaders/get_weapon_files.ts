import * as fs from 'fs/promises'
import { weapons } from '../../src/types/weapons';

export async function get_weapon_file_names() {
    try {

        const files = await fs.readdir('data');
        const formatted = files.map((f:string) => f.slice(0, f.indexOf('.')))
        const actualWeapons = formatted.filter((f:string) => Object.keys(weapons).includes(f))
        return actualWeapons

    } catch(error:any) {
        console.log(error.code)
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