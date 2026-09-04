import { skill_roll, bonus_roll } from "@custom_types/rolltype"


export function addSkillRollQuery(pid:number, roll:skill_roll) {return `
    INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (${roll.roll_num}, ${pid}, '${roll.set_bonus.replace("'", "''")}', '${roll.group_bonus.replace("'", "''")}')
`}

export function updateSkillRollQuery(pid:number, roll:skill_roll) {return `
    UPDATE skill_rolls SET set_bonus = '${roll.set_bonus.replace("'", "''")}', group_bonus = '${roll.group_bonus.replace("'", "''")}' WHERE profile_id = '${pid}' AND roll_num = ${roll.roll_num}
`}

export function deleteSkillRollQuery(pid:number, rollnum:number) { return `
    DELETE FROM skill_rolls WHERE profile_id = ${pid} AND roll_num = ${rollnum}
`}


export function addAmendRollQuery(pid:number, rollnum:number, reinforcements:string, levels:string, reinf_canon:string) {return `
    INSERT INTO amend_bonus_rolls(roll_num, profile_id, reinforcements, reinforcement_levels, reinforcements_canonical) VALUES (${rollnum}, ${pid}, '${reinforcements}', '${levels}', '${reinf_canon}') 
`}

export function updateAmendRollQuery(pid:number, rollnum:number, reinforcements:string, levels:string, reinf_canon:string) {return `
    UPDATE amend_bonus_rolls SET reinforcements = '${reinforcements}', reinforcement_levels = '${levels}', reinforcements_canonical = '${reinf_canon}' WHERE profile_id = ${pid} AND roll_num = ${rollnum}  
`}

export function deleteAmendRollQuery(pid:number, rollnum: number) { return `
    DELETE FROM amend_bonus_rolls WHERE profile_id = ${pid} AND roll_num = ${rollnum}
`}
