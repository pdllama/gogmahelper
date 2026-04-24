import { readFile } from "fs/promises";
import { weapons } from "@custom_types/weapons";

export default async function open_weapon_json(weapon:weapons) {
    return await readFile(`data/${weapon}.json`, 'utf-8').then(f => JSON.parse(f))
}