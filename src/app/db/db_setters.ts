import { skill_roll } from "@custom_types/rolltype"


export function addSkillRollQuery(pid:number, roll:skill_roll) {return `
    INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (${roll.roll_num}, ${pid}, '${roll.set_bonus.replace("'", "''")}', '${roll.group_bonus.replace("'", "''")}')
`}

export function updateSkillRollQuery(pid:number, roll:skill_roll) {return `
    UPDATE skill_rolls SET set_bonus = '${roll.set_bonus.replace("'", "''")}', group_bonus = '${roll.group_bonus.replace("'", "''")}' WHERE profile_id = '${pid}' AND roll_num = ${roll.roll_num}
`}


export function deleteSkillRollQuery(pid:number, rollnum:number) { return `
    DELETE FROM skill_rolls WHERE profile_id = ${pid} AND roll_num = ${rollnum}
`}