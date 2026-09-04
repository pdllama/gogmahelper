import { bonus_roll, reinforcement, reinforcement_level, roll_type_other } from "@custom_types/rolltype";
import { rolltabletypes } from "@components/display/rollscreen/rolltablecomponents/rolltablehandlersandtypes";
type cond_amend_roll = rolltabletypes.cond_amend_roll

const bonuses = ["Attack", "Affinity", "Element", "Sharpness", "Ammo"]
const bonuses_map = {
    "Attack": reinforcement.ATK,
    "Affinity": reinforcement.AFF,
    "Element": reinforcement.ELE,
    "Sharpness": reinforcement.SHARP,
    "Ammo": reinforcement.SHARP
}

type bmap_type = typeof bonuses_map

// lowercase L or uppercase i
const level_three_variations = ["III", "IIl", "IlI", "Ill", "lII", "lIl", "llI", "lll"];

export function parseBonusRoll(texts:string[], roll_num:number): {r:cond_amend_roll, error_row:boolean} {
    const bonus_roll = []
    let error_row = false;

    for (let t of texts) {
        const reinforcement_text = bonuses.filter(r => t.includes(r))[0]
        if (reinforcement_text === undefined) {error_row = true}
        const parsed_reinforcement = reinforcement_text === undefined ? "" : bonuses_map[reinforcement_text as keyof bmap_type]

        let parsed_reinforcement_level:reinforcement_level;

        if (t.includes("EX")) {parsed_reinforcement_level = reinforcement_level.ex}
        else if (parsed_reinforcement === reinforcement.SHARP) {parsed_reinforcement_level = reinforcement_level.one} // Sharp/Ammo only has level 1 and EX
        else if (parsed_reinforcement === reinforcement.ELE) {parsed_reinforcement_level = reinforcement_level.two} // Element only has 1, 2, and EX (no 3). Any bonus reinforcement roll will always be above level 1.
        else {
            // It might seem redundant to check if it has a level 3 variation AND check the number on it, but 
            // I've seen cases where the level 3 is parsed as level 2 AND cases where the number just... doesnt get parsed. (the ATK 3 +9 sometimes gets parsed as... SON? or FON?)
            // So it's better to have both even if it means a higher computation cost. 
            if (parsed_reinforcement === reinforcement.ATK && (t.includes("9"))) {parsed_reinforcement_level = reinforcement_level.three} // ATK 3 is +9. Sometimes the + can parse as 4.
            else if (parsed_reinforcement === reinforcement.AFF && t.includes("8")) {parsed_reinforcement_level = reinforcement_level.three} // AFF 3 is +8. Sometimes the + can parse as 4. AFF 3 was fairly often parsing as II so looking at the number should be more consistent.
            else if (level_three_variations.filter(ltv => t.includes(ltv)).length !== 0) {parsed_reinforcement_level = reinforcement_level.three}
            else {parsed_reinforcement_level = reinforcement_level.two}
        }
        bonus_roll.push({bonus: parsed_reinforcement, level: parsed_reinforcement_level})
    }
    return {r: {roll_num, roll: bonus_roll as roll_type_other.five_bonus_rolls}, error_row}
}