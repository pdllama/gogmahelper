import { bonus_roll_type, reinforcement, reinforcement_level, roll_type_other } from "@custom_types/rolltype"
import Text from "@components/common/text/text"

type RollTableBonusRowProps = {
    rollNum: number,
    highlighted: boolean,
    bonusType: bonus_roll_type,
    reinforcements: roll_type_other.five_reinforcement_rolls|Array<reinforcement|"">,
    reinforcement_levels: roll_type_other.five_level_rolls|Array<reinforcement_level|"">
    selectRoll: (rollnum:number, roll:any) => void;
    selected: boolean
}

export default function RollTableBonusRow({rollNum, highlighted, reinforcements, reinforcement_levels, selectRoll, selected}:RollTableBonusRowProps) {


    return (
        <tr 
            className={`border-b border-white ${highlighted ? 'bg-secondary' : ''}${selected ? ' border border-cyan-400' : ''}`}
            onDoubleClick={() => {
                selectRoll(rollNum, {roll_num: rollNum, roll: reinforcements.map((r, i) => {return {bonus: r, level: reinforcement_levels[i]}})});
            }}
        >
            <td className="border-r border-white p-2">
                <Text>{rollNum}</Text>
            </td>
            <td className="flex flex-col">
                {Array(5).fill(undefined).map((_:any, i:number) => {
                    const noReinforcement = i >= reinforcements.length ? true : false
                    const noReinforcementLevel = i >= reinforcement_levels.length ? true : false
                    const reinforcement = noReinforcement ? "none" : reinforcements[i]
                    const reinforcement_level = noReinforcementLevel ? "none" : reinforcement_levels[i]
                    return (
                        <div className="w-full h-1/5 flex">
                            <Text>{reinforcement}</Text>
                            <Text>{reinforcement_level}</Text>
                        </div>
                    )
                })}
            </td>
        </tr>
    )
}