import { roll_type } from "@custom_types/rolltype";


export const get_rolls_query = (
    rollType:roll_type
) => `
    SELECT roll_num, ${rollType === 'skills' ? 'set_bonus, group_bonus' : 'reinforcements, reinforcement_levels, reinforcements_canonical'} 
    FROM ${rollType === 'skills' ? "skill_rolls" : "amend_bonus_rolls"} NATURAL JOIN weapon_profile
    WHERE profile_id = ? AND roll_num != 0
    ORDER BY roll_num ASC
`

export const get_keep_rolls_query = () => `
    SELECT roll_num, curr_reinforcements AS reinforcements, reinforcement_levels, reinforcement_levels_canonical
    FROM keep_bonus_rolls NATURAL JOIN keep_bonus_profile
    WHERE keep_id = ? AND roll_num != 0
    ORDER BY roll_num ASC
`
