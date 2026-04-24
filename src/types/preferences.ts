import { elements } from "./element"
import { bonus_roll, skill_roll } from "./rolltype"
import { weapons } from "./weapons"

// Preferences refers to which skill rolls / bonus rolls the user is looking for. 
// This is used to mark these rolls and to path out a final gogma roll which includes all of these found rolls. 


enum preference_specificity {
    ANY='any', // A preference that applies to any weapon/element
    WEAPON='weapon', // A preference that applies to any element of a specific weapon
    COMBO='combo' // A preference that applies to a specific weapon/element combo
}

// This is the object in the array of preferences which apply to a specific weapon/element/combo
// We keep track of the specificity
type applied_preference = {
    specificity: preference_specificity,
    roll: skill_roll|bonus_roll
}

// The list of preferences applied to a weapon/element/combo
type list_of_applied_preferences = Array<applied_preference>

// Need specific lists for comparison purposes
type list_of_skill_applied_preferences = Array<{specificity:preference_specificity, roll:skill_roll}>
type list_of_bonus_applied_preferences = Array<{specificity:preference_specificity, roll:bonus_roll}>


// For the page where you can edit preferences, we will want to naturally segment the preferences based on specificity.
// This is an alternate version of preferences which segments it based its level of specificity. 
type skill_rolls_array = Array<skill_roll>

type specificity_segmented_skill_preferences = {
    any: skill_rolls_array,
    weapon: Partial<
                Record<
                    weapons,
                    Partial<Record<(elements|preference_specificity.ANY), skill_rolls_array>>
                >
            >
}

//  ^^^^
//  ex:
//  {
//      weapon: {hunting_horn: {any: [], fire: [], dragon: []}}
//  }
//  It just makes more sense to have the combos embedded within the weapon section.



// This is another version of specificty_segmented_skill_preferences applied to bonuses instead.
type bonus_rolls_array = Array<bonus_roll>

type specificity_segmented_bonus_preferences = {
    any: bonus_rolls_array,
    weapon: Partial<
                Record<
                    weapons,
                    Partial<Record<(elements|preference_specificity.ANY), bonus_rolls_array>>
                >
            >
}

//This is the structure of preferences.json

type preferences_json = {
    skills: specificity_segmented_skill_preferences,
    bonuses: specificity_segmented_bonus_preferences
}

export type {
    preference_specificity, 
    specificity_segmented_skill_preferences, specificity_segmented_bonus_preferences,
    skill_rolls_array, bonus_rolls_array,
    list_of_applied_preferences, list_of_skill_applied_preferences, list_of_bonus_applied_preferences,
    preferences_json
}