
import { elements } from "@custom_types/element"
import { roll_map, roll_type } from "@custom_types/rolltype"
import { weapons } from "@custom_types/weapons"

// The props applied to the main windows of the application. Dashboard, Skills, Bonuses.
type WindowProp = {

    // Selected weapon/element. 
    weapon: weapons|null,
    element: elements|null,

    // A string representing the current weapon files that have been generated (without the .json suffix)
    // Note that this string is always equivalent to the defined weapons.ts type declaration (or the file won't be detected)
    weapon_files: string[]|null 

    // This shows type map for all weapons, even those without bonus rolls.

    type_map: roll_map, 

    // Removes and deletes a weapon file from state and files. Only happens if theres no more skill rolls (deleting last element roll) and type_map is "skills" (aka theres no bonuses rolls)
    remove_weapon: (w:weapons) => void, 

    // Adds a weapon file to state and to the files, if it doesn't already exist. 
    // It only adds to the state if theres no bonus rolls, and always updates type_map accordingly. When writing to the file:
    //  1. If it doesn't exist, creates it and creates the "skills" sub-object, with the initial element.
    //  2. If it already exist (there's bonus rolls), adds the "skills" sub-object with the initial element.
    // Takes a roll_type to determine if we're adding a skill roll object or bonus roll object to the weapon
    add_weapon: (w:weapons, rt:roll_type) => void
}


export type {WindowProp}