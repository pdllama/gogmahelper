import { group_bonus_skill, set_bonus_skill } from "@custom_types/rolltype";


export default function sanitizeSkillName(skill:set_bonus_skill|group_bonus_skill) {
    return skill.indexOf("'") !== -1 ? `${skill.slice(0, skill.indexOf("'"))}''${skill.slice(skill.indexOf("'")+1, skill.length)}` : skill
}