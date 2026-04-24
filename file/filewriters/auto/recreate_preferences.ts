import { readFile, writeFile } from "fs/promises";

// EDIT: we're not doing it like this anymore.


// Checks if preferences.json exists on application startup.
// This needs to exist, even if empty.

export default async function preference_check() {
    try {
        const file = await readFile("preferences.json", "utf-8").then(d => JSON.parse(d))
        if (file.skills == undefined) {
            await writeFile("preferences.json", {...file, skills: {}})
            file.skills = {}
        } 
        if (file.bonuses == undefined) {
            await writeFile("preferences.json", {...file, bonuses: {}})
        }
    } catch (e: any) {
        await writeFile("preferences.json", JSON.stringify({skills: {}, bonuses: {}}))
    }
}