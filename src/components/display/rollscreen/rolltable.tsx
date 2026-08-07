import { bonus_roll, bonus_roll_type, keep_bonus_roll, roll_type, roll_type_other, skill_roll } from "@custom_types/rolltype"
import { useRef } from "react";
import RollTableHeader from "./rolltablecomponents/rolltableheader";
import Text from "@components/common/text/text";
import RollTableSkillRow from "./rolltablecomponents/rolltableskillrow";
import RollTableBonusRow from "./rolltablecomponents/rolltablebonusrow";

type RollTableProps = {
    rollType:roll_type
    roll_num:number
    bonusRollType: bonus_roll_type
    loadedRolls: boolean
    rolls: Array<skill_roll|bonus_roll|keep_bonus_roll>,
}

export default function RollTable({rolls, roll_num, rollType, bonusRollType, loadedRolls}:RollTableProps) {

    

    // When iterating the table to add rows, we need to account for if users start rolling at roll 50 for example instead of 1.
    // This iterative points to the next index of the rolls to check and see if the i of the iteration matches the roll number at i.
    const iterative_counter = useRef<number>(0); 

    const tableLength = rolls.length === 0 ? 0 : rolls[rolls.length-1].roll_num > roll_num ? rolls[rolls.length-1].roll_num : roll_num

    return (
        <>
        <style>
            {`
                ::-webkit-scrollbar {
                    width: 5px;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.75);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    cursor: pointer; 
                }   
            `}
        </style>
        
        <div className="p-1 max-h-[600px] overflow-y-scroll flex flex-col w-full">
        <table className="border border-white text-white rounded-lg">
            <RollTableHeader rollType={rollType}/>
            <tbody className={`relative min-h-[50px] ${rolls.length === 0 ? "h-[50px]" : ""}`}>
            {rolls.length === 0 ? 
                <tr className="absolute flex h-[50px] justify-center items-center size-full text-gray-400 italic"><td><Text size='lg'>{!loadedRolls ? 'Loading rolls...' : 'No rolls found'}</Text></td></tr> :
                <>
                {Array(tableLength).fill(undefined).map((_:any, i:number) => {
                    const current_roll_num = i+1;
                    const roll_info = rolls[iterative_counter.current];
                    const isRoll = current_roll_num === roll_info.roll_num
                    if (isRoll) {
                        iterative_counter.current++;
                    }
                    if (iterative_counter.current === rolls.length) {
                        iterative_counter.current = 0;
                    }

                    const highlighted = current_roll_num === roll_num
                    
                    // const trueRollInfo = rollType === roll_type.SKILLS ? roll_info as skill_roll : 
                    //     bonus_type === bonus_roll_type.AMEND ? roll_info as bonus_roll : 
                    //     roll_info as keep_bonus_roll
                    return rollType === roll_type.SKILLS ? 
                        <RollTableSkillRow 
                            key={`roll-${current_roll_num}`}
                            rollNum={current_roll_num}
                            highlighted={highlighted}
                            setSkill={isRoll ? (roll_info as skill_roll).set_bonus : ""}
                            groupSkill={isRoll ? (roll_info as skill_roll).group_bonus : ""}
                        /> : 
                        <RollTableBonusRow 
                            key={`roll-${current_roll_num}`}
                            rollNum={current_roll_num}
                            highlighted={highlighted}
                            bonusType={bonusRollType}
                            reinforcements={isRoll ? 
                                bonusRollType === bonus_roll_type.AMEND ? (roll_info as bonus_roll).roll.map(r => r.bonus) : 
                                ["ATTACK", "ATTACK", "ATTACK", "ATTACK", "SHARPNESS/AMMO"] as roll_type_other.five_reinforcement_rolls : //replace this with the actual keep bonus profile reinforcements.
                                []
                            }
                            reinforcement_levels={isRoll ? 
                                bonusRollType === bonus_roll_type.AMEND ? (roll_info as bonus_roll).roll.map(r => r.level) : 
                                (roll_info as keep_bonus_roll).roll :
                                []
                            }
                        />
                })}
                </>
            } 
            </tbody>
        </table>
        </div>
        </>
    )
}