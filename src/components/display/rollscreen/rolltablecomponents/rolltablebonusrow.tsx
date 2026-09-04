import { bonus_roll_type, reinforcement, reinforcement_level, roll_type_other } from "@custom_types/rolltype"
import Text from "@components/common/text/text"
import { rolltabletypes } from "./rolltablehandlersandtypes"
import Button from "@components/common/button/button"
import "./rolltablecomp.css"
import { weapons } from "@custom_types/weapons"
import { reinforcement_bonus_amounts, allowed_amend_reinf_levels } from "./rolltablehandlersandtypes"
import { reinforcement_level_labels } from "./rolltablehandlersandtypes"
import { useRef, useEffect } from "react"

type cond_amend_roll = rolltabletypes.cond_amend_roll
type cond_keep_roll = rolltabletypes.cond_keep_roll
type cond_bonus_type = rolltabletypes.cond_bonus_type

const reinfs = Object.values(reinforcement)
const reinf_levels = Object.values(reinforcement_level)

type RollTableBonusRowProps = {
    rollNum: number,
    highlighted: boolean,
    emptyRoll:boolean,
    desired:boolean,
    bonusType: bonus_roll_type,
    reinforcements: roll_type_other.five_reinforcement_rolls|Array<reinforcement|"">,
    reinforcement_levels: roll_type_other.five_level_rolls|Array<reinforcement_level|"">
    selectRoll: (rollnum:number, roll:any) => void;
    selected: boolean,
    editRollData: cond_amend_roll|cond_keep_roll,
    editBonusRoll: (rollnum:number, type:"rb"|"rl", change:reinforcement|reinforcement_level|"", index:0|1|2|3|4) => void; // rb = reinforcement bonus rl = reinforcement level
    deleteRoll: (rollnum:number) => void
    w:weapons
}




export default function RollTableBonusRow({rollNum, highlighted, desired, emptyRoll, reinforcements, reinforcement_levels, selectRoll, selected, editRollData, editBonusRoll, deleteRoll, w}:RollTableBonusRowProps) {

    const weapon_range = w === "light_bowgun" || w === "heavy_bowgun" || w === "bow" ? "ranged" : "melee"

    const firstRollNum = useRef<number>(rollNum)
    const rowRef = useRef<HTMLTableRowElement>(null)

    useEffect(() => {
        setTimeout(() => {
            if (highlighted && rowRef.current) {
                rowRef.current.scrollIntoView({block: 'end'});
            }
        }, 100)
    }, [highlighted])

    // useEffect(() => {
    //     if (justLoaded.current && rollNum !== firstRollNum.current) {
    //         justLoaded.current = false
    //     }
    // }, [rollNum])

    // console.log(firstRollNum.current)

    return (
        <tr 
            ref={rowRef}
            className={`border-b border-white ${highlighted ? 'bg-secondary' : desired ? 'bg-tertiary' : ''}${selected ? ' selected-row' : ''} relative overflow-hidden`}
            onDoubleClick={() => {
                selectRoll(rollNum, {roll_num: rollNum, roll: reinforcements.map((r, i) => {return {bonus: r, level: reinforcement_levels[i]}})});
            }}
        >
            <td className="border-r border-white p-2">
                <Text>{rollNum}</Text>
            </td>
            <td className={`flex flex-col h-full ${emptyRoll && !selected ? 'p-3' : 'p-1'} gap-1`}>
                {emptyRoll && !selected &&
                    <div className="size-full flex justify-center items-center">
                        <Text size='md'><i>none</i></Text>
                    </div>
                }
                {(!(!selected && emptyRoll)) && Array(5).fill(undefined).map((_:any, i:number) => {
                    const data = selected ? editRollData.roll : undefined
                    const reinforcement = selected ? (data![i] as cond_bonus_type).bonus : reinforcements[i]
                    const reinforcement_level = selected ? (data![i] as cond_bonus_type).level : reinforcement_levels[i]
                    const imgkey = reinforcement === "SHARPNESS/AMMO" ? (weapon_range === "melee" ? "sharpness" : "ammo"): reinforcement.toLowerCase()
                    return (
                        <div className="w-full flex items-center gap-2 p-[2px] rounded-sm bg-red-950 pl-1">
                            <div className="h-[24px] w-[70px] flex justify-center">
                                {selected && reinforcement === "" ? <></> : <img className="h-[24px] object-contain" src={`icons/misc/${imgkey}.png`}/>}
                            </div>
                            {selected ? 
                            <select value={reinforcement} onChange={(e:any) => editBonusRoll(rollNum, "rb", e.target.value, i as 0|1|2|3|4)} className="bg-black w-6/10 p-1 text-[14px] text-center select-inner cursor-pointer">
                                <option value="" className="italic">none</option>
                                {reinfs.map((rb:reinforcement, i:number) => {
                                    const isEven = i%2 === 0;
                                    return (
                                        <option value={rb} className={`${isEven ? "bg-black" : ""}`}>{rb}</option>
                                    )
                                })}
                            </select> : 
                            <Text classes="w-[250px] text-start" bold>{reinforcement === "SHARPNESS/AMMO" ? (weapon_range === "melee" ? "SHARPNESS" : "AMMO") : reinforcement} BOOST</Text>
                            }
                            {selected ? 
                            <select value={reinforcement_level} onChange={(e:any) => editBonusRoll(rollNum, "rl", e.target.value, i as 0|1|2|3|4)} className="bg-black w-4/10 p-1 text-[14px] text-center select-inner cursor-pointer">
                                <option value="" className="italic">none</option>
                                {(!reinforcement ? reinf_levels : allowed_amend_reinf_levels[reinforcement]).map((rl:reinforcement_level, i:number) => {
                                    const isEven = i%2 === 0;
                                    return (
                                        <option value={rl} className={`${isEven ? "bg-black" : ""}`}>{reinforcement_level_labels[rl]}</option>
                                    )
                                })}
                            </select> :
                            <Text bold>{reinforcement_level_labels[reinforcement_level as reinforcement_level]}</Text>
                            }
                            {!selected && 
                            <div className="w-full flex justify-end items-center pr-2">
                                <Text bold>+{reinforcement === "ATTACK" || reinforcement === "AFFINITY" ? 
                                    reinforcement_bonus_amounts[reinforcement][reinforcement_level as reinforcement_level] : 
                                    reinforcement === "SHARPNESS/AMMO" ? reinforcement_bonus_amounts["SHARPNESS/AMMO"][weapon_range][reinforcement_level as "1"|"EX"] :
                                    reinforcement_bonus_amounts["ELEMENT"][w][reinforcement_level as "1"|"2"|"EX"]
                                }</Text>
                            </div>
                            }
                        </div>
                    )
                })}
            </td>
            {selected && 
            <td className="absolute top-[100%] right-[-3px] rounded-b-sm py-2 px-6 bg-black z-10">
                <Button disableRipple classes="bg-red-950" onClick={() => deleteRoll(rollNum)}>Delete Roll</Button>
            </td>
            }
        </tr>
    )
}