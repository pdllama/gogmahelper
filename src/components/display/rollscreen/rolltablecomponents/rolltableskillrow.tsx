import { set_bonus_skill, group_bonus_skill } from "@custom_types/rolltype"
import Text from "@components/common/text/text"


type RollTableSkillRowProps = {
    rollNum:number,
    highlighted:boolean,
    setSkill:set_bonus_skill|"",
    groupSkill:group_bonus_skill|""
}

export default function RollTableSkillRow({rollNum, highlighted, setSkill, groupSkill}:RollTableSkillRowProps) {

    // Both being empty means its a roll number without a 
    const emptySetSkill = !setSkill;
    const emptyGroupSkill = !groupSkill;

    return (
        <tr className={`border-b border-white ${highlighted ? 'bg-secondary' : ''}`}>
            <td className="border-r border-white p-2">
                <Text>{rollNum}</Text>
            </td>
            <td className="border-r border-white">
                <Text classes={emptySetSkill ?"italic text-gray-400" : ""}>{emptySetSkill ? "none" : setSkill}</Text>
            </td>
            <td>
                <Text classes={emptyGroupSkill ?"italic text-gray-400" : ""}>{emptyGroupSkill ? "none" : groupSkill}</Text>
            </td>
        </tr>
    )
}