import { set_bonus_skill, group_bonus_skill } from "@custom_types/rolltype"
import Text from "@components/common/text/text"
import { rolltabletypes } from "./rolltablehandlersandtypes";
import "./rolltablecomp.css"
import { MouseEvent, useEffect, useRef, useState } from "react";
import Button from "@components/common/button/button";
import SlidingWindow from "@components/common/sliding_window/slidingwindow";
import { useMainStore } from "@app/main_store";

type cond_skill_roll = rolltabletypes.cond_skill_roll;

const set_bonus_arr:set_bonus_skill[] = Object.values(set_bonus_skill);
const group_bonus_arr:group_bonus_skill[] = Object.values(group_bonus_skill);

type RollTableSkillRowProps = {
    rollNum:number,
    highlighted:boolean,
    desired: boolean,
    setSkill:set_bonus_skill|"",
    groupSkill:group_bonus_skill|""
    selectRoll:(rollnum:number, roll:any) => void;
    selected: boolean,
    editRollData: cond_skill_roll,
    editSkillRoll: (rollnum:number, type:"sb"|"gb", change:set_bonus_skill|group_bonus_skill|"") => void;
    deleteRoll: (rollnum:number) => void
}

export default function RollTableSkillRow({rollNum, highlighted, desired, setSkill, groupSkill, selectRoll, selected, editRollData, editSkillRoll, deleteRoll}:RollTableSkillRowProps) {

    // Both being empty means its a roll number without a 
    const emptySetSkill = !setSkill;
    const emptyGroupSkill = !groupSkill;

    const rowRef = useRef<HTMLTableRowElement>(null)

    useEffect(() => {
        if (highlighted && rowRef.current) {
            rowRef.current.scrollIntoView();
        }
    }, [highlighted])
    
    // const [deleteConf, setDeleteConf] = useState(false)

    return (
        <tr 
            ref={rowRef}
            className={`border-b border-white ${highlighted ? 'bg-secondary' : desired ? 'bg-tertiary' : ''}${selected ? ' selected-row' : ''} relative overflow-hidden`}
            onDoubleClick={() => {
                selectRoll(rollNum, {roll_num: rollNum, set_bonus: setSkill, group_bonus: groupSkill});
            }}
        >
            <td className={`border-r border-white p-2`}>
                <Text>{rollNum}</Text>
                {/* {selected &&
                <div className="absolute left-0 del-but-pos">
                    <Button 
                        disableRipple classes="text-[12px] py-2 px-1.5 z-5 rounded-t-none" 
                        onClick={(e:any) => {e.stopPropagation(); setDeleteConf(!deleteConf)}}
                    >
                        Delete
                    </Button>
                </div>
                }
                {(deleteConf && selected) &&
                <div className="absolute left-0 del-but-pos w-fit pr-3 py-1 z-3 flex items-center gap-2 bg-black">
                    <Text classes="indent-[55px]">Are you sure?</Text>
                    <Button disableRipple classes="text-[12px] py-1 px-1.5 z-5">Yes</Button>
                    <Button disableRipple classes="text-[12px] py-1 px-1.5 z-5">No</Button>
                </div>
                } */}
            </td>
            <td className="border-r border-white">
                {selected ? 
                <select value={editRollData.set_bonus} onChange={(e:any) => editSkillRoll(rollNum, "sb", e.target.value)} className="bg-black w-9/10 p-1 text-[14px] text-center select-inner cursor-pointer">
                    <option value="" className="italic">none</option>
                    {set_bonus_arr.map((sb:set_bonus_skill, i:number) => {
                        const isEven = i%2 === 0;
                        return (
                            <option value={sb} className={`${isEven ? "bg-black" : ""}`}>{sb}</option>
                        )
                    })}
                </select> :
                <Text classes={emptySetSkill ?"italic text-gray-400" : ""}>{emptySetSkill ? "none" : setSkill}</Text>
                }
            </td>
            <td className="relative">
                {selected ?
                <select value={editRollData.group_bonus} onChange={(e:any) => editSkillRoll(rollNum, "gb", e.target.value)} className="bg-black w-9/10 p-1 text-[14px] text-center select-inner cursor-pointer">
                    <option value="" className="italic">none</option>
                    {group_bonus_arr.map((gb:group_bonus_skill, i:number) => {
                        const isEven = i%2 === 0;
                        return (
                            <option value={gb} className={`${isEven ? "bg-black" : ""}`}>{gb}</option>
                        )
                    })}
                </select> :
                <Text classes={emptyGroupSkill ?"italic text-gray-400" : ""}>{emptyGroupSkill ? "none" : groupSkill}</Text>
                }
            </td>
            {selected && 
            <td className="absolute top-[108%] right-[-3px] rounded-b-sm py-2 px-6 bg-black z-10">
                <Button disableRipple classes="bg-red-950" onClick={() => deleteRoll(rollNum)}>Delete Roll</Button>
            </td>
            }
        </tr>
    )
}