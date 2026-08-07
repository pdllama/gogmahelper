import { roll_type, bonus_roll_type } from "@custom_types/rolltype"


type RollTableHeaderProps = {
    rollType:roll_type
}

export default function RollTableHeader({rollType}:RollTableHeaderProps) {


    return <thead>
        <tr className="border-b border-white">
            <th className="border-r border-white w-1/5">Roll Num</th>
            {rollType === roll_type.SKILLS ? 
                <>
                <th className="border-r border-white w-2/5">Set Skill</th>
                <th className="w-2/5">Group Skill</th>
                </> : 
                <th>
                Reinforcements
                </th>
            } 
        </tr>
    </thead>
}