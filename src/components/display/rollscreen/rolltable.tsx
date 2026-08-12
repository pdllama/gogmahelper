import { bonus_roll, bonus_roll_type, group_bonus_skill, keep_bonus_roll, reinforcement, reinforcement_level, roll_type, roll_type_other, set_bonus_skill, skill_roll } from "@custom_types/rolltype"
import { useEffect, useRef, useState } from "react";
import RollTableHeader from "./rolltablecomponents/rolltableheader";
import Text from "@components/common/text/text";
import RollTableSkillRow from "./rolltablecomponents/rolltableskillrow";
import RollTableBonusRow from "./rolltablecomponents/rolltablebonusrow";
import { rolltabletypes } from "./rolltablecomponents/rolltablehandlersandtypes";
import SlidingWindow from "@components/common/sliding_window/slidingwindow";
import Button from "@components/common/button/button";
import Select from "@components/common/select/select";
import Input from "@components/common/input/input";
import NewSkillRollForm from "./rolltablecomponents/newskillrollform";
import { useAlertStore } from "@app/alerts/alert_store";
import { useMainStore } from "@app/main_store";
import { weapons } from "@custom_types/weapons";
import { elements } from "@custom_types/element";

type cond_skill_roll = rolltabletypes.cond_skill_roll;
type cond_amend_roll = rolltabletypes.cond_amend_roll;
type cond_keep_roll = rolltabletypes.cond_keep_roll;


type RollTableProps = {
    rollType:roll_type
    roll_num:number
    bonusRollType: bonus_roll_type
    loadedRolls: boolean
    rolls: Array<skill_roll|bonus_roll|keep_bonus_roll>,
    insertRoll: (roll:skill_roll|bonus_roll|keep_bonus_roll, roll_exists: boolean) => void;
    removeRoll: (rollnum:number) => void;
    pid:number,
    addRollScreen: boolean,
    toggleAddRollScreen: () => void;
    w:weapons|null
    e:elements|null
}

type editState = {
    curr: number|null,
    roll: cond_skill_roll|cond_amend_roll|cond_keep_roll|null
}

type newRollState = {
    rollNum: ""|number
    rollExists: boolean
    set_bonus: ""|set_bonus_skill
    group_bonus: ""|group_bonus_skill
    reinforcements: Array<reinforcement|"">
    reinforcement_levels: Array<reinforcement_level|"">
    error: string
}

export default function RollTable({rolls, roll_num, rollType, bonusRollType, loadedRolls, insertRoll, removeRoll, pid, addRollScreen, toggleAddRollScreen, w, e}:RollTableProps) {
    // When iterating the table to add rows, we need to account for if users start rolling at roll 50 for example instead of 1.
    // This iterative points to the next index of the rolls to check and see if the i of the iteration matches the roll number at i.
    const iterative_counter = useRef<number>(0);
    const tableLength = rolls.length === 0 ? 0 : rolls[rolls.length-1].roll_num > roll_num ? rolls[rolls.length-1].roll_num : roll_num
    const maxTableLengthRef = useRef<number>(tableLength)
    const finalTableLength = tableLength > maxTableLengthRef.current ? tableLength : maxTableLengthRef.current

    const add_alert = useAlertStore(state => state.add_alert)
    const remove_from_stats = useMainStore(state => state.remove_roll_from_stats)
    const add_roll_to_stats = useMainStore(state => state.add_roll_to_stats)
    const add_keep_roll_to_stats = useMainStore(state => state.add_keep_roll_to_stats)

    const [edit, setEdit] = useState<editState>({curr: null, roll: null})
    const [newRoll, setNewRoll] = useState<newRollState>({rollNum: "", rollExists: false, set_bonus: '', group_bonus: '', reinforcements: ["", "", "", "", ""], reinforcement_levels: ["", "", "", "", ""], error: ""})

    const selectRoll = (rollnum:number, roll:cond_skill_roll|cond_amend_roll|cond_keep_roll) => {
        if (rollnum === edit.curr) {setEdit({curr:null, roll:null})}
        else {setEdit({curr: rollnum, roll})}
    }

    const editSkillRoll = (rollnum:number, type:"sb"|"gb", change:set_bonus_skill|group_bonus_skill|"") => {
        const newRoll = ({roll_num: rollnum, set_bonus: type === "sb" ? change : (edit.roll! as cond_skill_roll).set_bonus, group_bonus: type === "gb" ? change : (edit.roll! as cond_skill_roll).group_bonus}) as cond_skill_roll
        setEdit({...edit, roll: newRoll})
        if (newRoll.set_bonus !== "" && newRoll.group_bonus !== "") {
            const roll_exists = rolls ? rolls.filter(ro => ro.roll_num === rollnum).length !== 0 : false
            add_roll_to_stats(newRoll as skill_roll, rollType, w as weapons, e as elements, roll_exists);
            insertRoll(newRoll as skill_roll, roll_exists);
            window.ipcRenderer.add_skill_roll(pid, newRoll as skill_roll, roll_exists);
        } else if (newRoll.set_bonus === "" && newRoll.group_bonus === "") {
            remove_from_stats(rollnum, rollType, bonusRollType, undefined);
            removeRoll(rollnum);
            window.ipcRenderer.delete_skill_roll(pid, rollnum);
        }
    }

    const addNewRoll = () => {
        const rollNumIsNumber = typeof newRoll.rollNum === "number";
        if (!rollNumIsNumber) {setNewRoll({...newRoll, error: "Please enter a valid roll number between 1 - 999!"}); return;}

        const rollNumIsValid = (newRoll.rollNum as number) >= 1 && (newRoll.rollNum as number) <= 999
        if (!rollNumIsValid) {setNewRoll({...newRoll, error: "Roll number must be between 1 - 999!"}); return;}

        if (rollType === roll_type.SKILLS) {
            if (newRoll.set_bonus === "" || newRoll.group_bonus === "") {setNewRoll({...newRoll, error: "Please enter a valid set/group bonus skill!"}); return;}
        } else {
            if (newRoll.reinforcement_levels.filter(rl => rl === "").length > 0) {setNewRoll({...newRoll, error: "Please enter valid 5 valid reinforcements/reinforcement levels!"}); return;}
            if (bonusRollType === bonus_roll_type.AMEND) {
                if (newRoll.reinforcements.filter(r => r === "").length > 0) {setNewRoll({...newRoll, error: "Please enter valid 5 valid reinforcements/reinforcement levels!"}); return;}
            }
        }
        const rollData:any = {roll_num: newRoll.rollNum}
        add_alert({title: `${newRoll.rollExists ? "Edited" : "Added"} the roll!`, content: "", type: "success", timeout: 3})
        setNewRoll({rollNum: "", rollExists: false, set_bonus: '', group_bonus: '', reinforcements: ["", "", "", "", ""], reinforcement_levels: ["", "", "", "", ""], error: ""})
        toggleAddRollScreen()
        // need this sectio after the previous state updates so it updates correctly
        if (rollType === roll_type.SKILLS) {
            rollData.set_bonus = newRoll.set_bonus; rollData.group_bonus = newRoll.group_bonus;
            add_roll_to_stats(rollData as skill_roll, rollType, w as weapons, e as elements, newRoll.rollExists);
            insertRoll(rollData, newRoll.rollExists)
            window.ipcRenderer.add_skill_roll(pid, rollData as skill_roll, newRoll.rollExists);
        } else {
            rollData.roll = bonusRollType === bonus_roll_type.AMEND ? newRoll.reinforcements.map((r, i) => {return {bonus: r, level: newRoll.reinforcement_levels[i]}}) : newRoll.reinforcement_levels
            // Add bonus roll state updates
        }
        
    }

    useEffect(() => {
        const lastRoll = rolls[rolls.length-1];
        if (lastRoll && lastRoll.roll_num > maxTableLengthRef.current) {
            maxTableLengthRef.current = lastRoll.roll_num
        }
    }, [rolls])
    
    useEffect(() => {
        const arrowHandler = (e:KeyboardEvent) => {
            if (edit.curr) {
                if (e.key === "ArrowDown" && edit.curr < finalTableLength) {
                    const newRollNum = edit.curr!+1
                    const possibleRoll = rolls.filter(r => r.roll_num === newRollNum)[0]
                    const roll = !possibleRoll ? rollType === roll_type.SKILLS ? {roll_num: newRollNum, set_bonus: "", group_bonus: ""} as cond_skill_roll : 
                        rollType === roll_type.BONUSES ? {roll_num: newRollNum, roll: Array(5).fill(undefined).map(_ => {return {bonus: "", level: ""}})} as cond_amend_roll : 
                        {roll_num: newRollNum, roll: ["", "", "", "", ""]} as cond_keep_roll  : possibleRoll
                    setEdit({curr: newRollNum, roll: roll})
                } else if (e.key === "ArrowUp" && edit.curr > 1) {
                    const newRollNum = edit.curr!-1
                    const possibleRoll = rolls.filter(r => r.roll_num === newRollNum)[0]
                    const roll = !possibleRoll ? rollType === roll_type.SKILLS ? {roll_num: newRollNum, set_bonus: "", group_bonus: ""} as cond_skill_roll : 
                        rollType === roll_type.BONUSES ? {roll_num: newRollNum, roll: Array(5).fill(undefined).map(_ => {return {bonus: "", level: ""}})} as cond_amend_roll : 
                        {roll_num: newRollNum, roll: ["", "", "", "", ""]} as cond_keep_roll  : possibleRoll
                    setEdit({curr: newRollNum, roll: roll})
                } 
            } 
        }
        window.addEventListener("keydown", arrowHandler)
        return () => window.removeEventListener("keydown", arrowHandler);
    }, [edit.curr, rolls])
    

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
        
        <div className="p-1 h-full min-h-[200px] overflow-y-scroll overflow-x-hidden flex flex-col w-full relative">
        <table 
            className="border border-white text-white rounded-lg"
        >
            <RollTableHeader rollType={rollType}/>
            <tbody className={`relative min-h-[50px] ${rolls.length === 0 ? "h-[50px]" : ""}`}>
            {rolls.length === 0 ? 
                <tr className="absolute flex h-[50px] justify-center items-center size-full text-gray-400 italic"><td><Text size='lg'>{!loadedRolls ? 'Loading rolls...' : 'No rolls found'}</Text></td></tr> :
                <>
                {Array(finalTableLength).fill(undefined).map((_:any, i:number) => {
                    const current_roll_num = i+1;
                    const roll_info = rolls[iterative_counter.current];
                    const isRoll = current_roll_num === roll_info!.roll_num
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
                            setSkill={isRoll ? (roll_info as skill_roll|cond_skill_roll).set_bonus : ""}
                            groupSkill={isRoll ? (roll_info as skill_roll|cond_skill_roll).group_bonus : ""}
                            selectRoll={selectRoll}
                            selected={edit.curr === current_roll_num}
                            editRollData={edit.roll as cond_skill_roll}
                            editSkillRoll={editSkillRoll}
                        /> : 
                        <RollTableBonusRow 
                            key={`roll-${current_roll_num}`}
                            rollNum={current_roll_num}
                            highlighted={highlighted}
                            bonusType={bonusRollType}
                            reinforcements={isRoll ? 
                                bonusRollType === bonus_roll_type.AMEND ? (roll_info as bonus_roll|cond_amend_roll).roll.map(r => r.bonus) : 
                                ["ATTACK", "ATTACK", "ATTACK", "ATTACK", "SHARPNESS/AMMO"] as roll_type_other.five_reinforcement_rolls : //replace this with the actual keep bonus profile reinforcements.
                                []
                            }
                            reinforcement_levels={isRoll ? 
                                bonusRollType === bonus_roll_type.AMEND ? (roll_info as bonus_roll|cond_amend_roll).roll.map(r => r.level) : 
                                (roll_info as keep_bonus_roll|cond_keep_roll).roll :
                                []
                            }
                            selectRoll={selectRoll}
                            selected={edit.curr === current_roll_num}
                        />
                })}
                </>
            } 
            </tbody>
        </table>
        <SlidingWindow active={addRollScreen} classes="z-10 bg-black w-full h-fit p-2 fixed" transition_type="slide-right">
            <div className="flex flex-col gap-2 justify-center">
            <Text size='xl' bold>Add New {rollType === roll_type.SKILLS ? "Skill" : "Bonus"} Roll</Text>
            {newRoll.error && <Text size='sm' classes="text-red-500">{newRoll.error}</Text>}
                <div className='w-full flex items-center gap-2 px-3'>
                    <Text size='lg' bold classes="w-1/2 text-end">Roll Number:</Text>
                    <Input 
                        value={!newRoll.rollNum ? "" : newRoll.rollNum.toString()}
                        numeric
                        numericLimits
                        onChange={(val:string) => setNewRoll({...newRoll, rollNum: val === "" ? "" : parseInt(val)})}
                        onFocus={newRoll.error ? () => setNewRoll({...newRoll, error: ""}) : () => {}}
                        onBlur={(newVal:number|"") => {
                            if (newVal === "") {return;}
                            const existingRoll = rolls ? rolls.filter(ro => ro.roll_num === newVal)[0] : null;
                            if (existingRoll) {
                                let stateChange:any = {}
                                if (rollType === roll_type.SKILLS) {stateChange.set_bonus = (existingRoll as skill_roll).set_bonus; stateChange.group_bonus = (existingRoll as skill_roll).group_bonus}
                                else if (bonusRollType === bonus_roll_type.AMEND) {
                                    stateChange.reinforcements = (existingRoll as bonus_roll).roll.map(ro => ro.bonus);
                                    stateChange.reinforcement_levels = (existingRoll as bonus_roll).roll.map(ro => ro.level);
                                } else {
                                    stateChange.reinforcement_levels = (existingRoll as keep_bonus_roll).roll;
                                }
                                setNewRoll({...newRoll, rollExists: true, ...stateChange})
                            } else {
                                setNewRoll({...newRoll, rollExists: false})
                            }
                        }}
                    />
                </div>
                {rollType === roll_type.SKILLS ? 
                <NewSkillRollForm 
                    set_bonus={newRoll.set_bonus}
                    group_bonus={newRoll.group_bonus}
                    change_set_bonus={(sb:set_bonus_skill|"") => setNewRoll({...newRoll, set_bonus: sb})}
                    change_group_bonus={(gb:group_bonus_skill|"") => setNewRoll({...newRoll, group_bonus: gb})}
                    resetError={newRoll.error ? () => setNewRoll({...newRoll, error: ""}) : null}
                /> : 
                <></>
                }
                <div className='size-full flex items-end justify-center p-1 gap-2'>
                    <Button 
                        classes="bg-red-950" 
                        disableRipple 
                        onClick={addNewRoll}
                    >
                        {newRoll.rollExists ? "Edit" : "Add"} Roll
                    </Button>
                    
                    <Button 
                        classes="opacity-90" 
                        disableRipple 
                        onClick={toggleAddRollScreen}
                    >
                        Cancel
                    </Button>
                    
                </div>
            </div>
        </SlidingWindow>
        </div>
        </>
    )
}