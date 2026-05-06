import { readFile } from "fs/promises";
import { weapons } from "@custom_types/weapons";
import { weapons_json } from "@file/file_types";

export default async function open_weapon_json(weapon:weapons) : Promise<weapons_json> {
    return await readFile(`data/${weapon}.json`, 'utf-8').then(f => JSON.parse(f))
}