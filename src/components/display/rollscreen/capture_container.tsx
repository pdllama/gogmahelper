
import Button from "@components/common/button/button"
import MhWildsVideo from "@components/screen_capture/mhwilds_video"
import Text from "@components/common/text/text"
import { bonus_roll, bonus_roll_type, keep_bonus_roll, roll_type, skill_roll } from "@custom_types/rolltype"
import { useMainStore } from "@app/main_store"
import { useCaptureStore } from "@app/capture_store"
import { useState, useEffect, useRef } from "react"
import { weapons } from "@custom_types/weapons"
import { elements } from "@custom_types/element"
import { editRollState } from "../../../main/window/rollscreen"
import { convert_last_bonus_roll_to_string } from "./rolltablecomponents/rolltablehandlersandtypes"
import "./rolltablecomponents/rolltablecomp.css"
import SlidingWindow from "@components/common/sliding_window/slidingwindow"
import CloseButton from "@components/common/button/close_button"

type CaptureContainerProps = {
    rolls:(skill_roll|bonus_roll|keep_bonus_roll)[],
    roll_num: number,
    pid: number
    insertRoll: (roll:skill_roll|bonus_roll|keep_bonus_roll, roll_exists: boolean) => void;
    rollType: roll_type
    w:weapons|null, e:elements|null,
    setEditRoll: React.Dispatch<React.SetStateAction<editRollState>>
}

export default function CaptureContainer({rolls, pid, roll_num, insertRoll, rollType, w, e, setEditRoll}:CaptureContainerProps) {
    const add_roll_to_state = useMainStore((state) => rollType === roll_type.BONUSES &&  state.bonus_type === bonus_roll_type.KEEP ? state.add_keep_roll_to_stats : state.add_roll_to_stats)
    const update_last_roll = useCaptureStore((state) => rollType === roll_type.SKILLS ? state.set_last_skill_roll : state.set_last_amend_roll);
    const increment_roll_num = useMainStore(state => state.increment_roll)
    const roll_exists = rolls ? rolls.filter(ro => ro.roll_num === roll_num).length !== 0 : false
    const last_roll = useCaptureStore((state) => rollType === roll_type.SKILLS ? state.last_skill_roll : state.last_amend_roll)
    const capture_errors = useCaptureStore((state) => state.capture_errors);
    const insert_capture_error = useCaptureStore((state) => state.insert_capture_error)
    const reset_capture_errors = useCaptureStore(state => state.reset_capture_errors)
    const [capErrorsOpen, setCapErrorsOpen] = useState<boolean>(false)

    // const save_skill_roll_func = (roll:skill_roll|bonus_roll|keep_bonus_roll) => {
    //     if ('set_bonus' in roll) {
    //         saveSkillRollToDb(roll, pidRef.current!, roll_exists.current, rollType, insertRoll, increment_roll_num, update_last_roll as ((sr:skill_roll) => void))
    //     }
    // }

    const weapon_range = (w === "bow" || w === "light_bowgun" || w === "heavy_bowgun" ) ? "ranged" : "melee"

    const cap_error_on_roll = capture_errors.filter(ce => ce.roll_num === roll_num-1)[0]
    // const cap_error_on_roll = {roll_num: 1, raw: "feu Gore Magala's Tyranny r327 Lord's Soul juq"}
    // const capture_errors = [
    //     {roll_num: 2, raw: "fgreoighwrigufweasd"},
    //     {roll_num: 3, raw: "23920323r823"},
    //     {roll_num: 17, raw: "378979823fhuihf9ue 802fe wef we32"},
    //     {roll_num: 24, raw: "324978323 hr2h 2398yr3297297 279"}, 
    //     {roll_num: 74, raw: "few Attack Boost Ill r32 49\nfd32 Affinity Boost EX +12\ndee Sharpness/Ammo Boost EX re 450\nElement Boost EX 3ewr +80\nAttack Boost ll"}
    // ]
    // console.log(capture_errors)

    useEffect(() => {
        return () => reset_capture_errors()
    }, [])

    
    
    return (
        <div className="h-fit w-full max-w-[600px] flex flex-col justify-center items-center rounded-md bg-black/100 p-2 gap-2 relative"> {/**sticky top-0 z-5 */}
            <Text bold size={24}>Roll Detection Video</Text>
            <MhWildsVideo 
                saveRollTools={{
                    profile_id: pid, roll_exists, rollType, roll_num, w, e,
                    insertRollIntoState: insertRoll,
                    increment_roll_num,
                    add_roll_to_state, 
                    update_last_roll,
                    setEditRoll,
                    insert_capture_error
                }}
            />
            <div className="flex flex-col justify-center items-center">
                <Text bold size={14}>Last Roll:{!last_roll ? " none" : ""}</Text>
                {last_roll &&
                (rollType === roll_type.SKILLS ? 
                <div className="flex gap-1">
                    <div className="rounded-sm p-1 px-2">
                        <Text bold size={12}>{(last_roll as skill_roll).set_bonus}</Text>
                    </div>
                    <div className="rounded-sm p-1 px-2">
                        <Text bold size={12}>{(last_roll as skill_roll).group_bonus}</Text>
                    </div>
                </div> : 
                <div className="flex gap-1 p-1 px-2">
                    {convert_last_bonus_roll_to_string(last_roll as bonus_roll, weapon_range).map((str:string, i:number) => {
                        
                        return (
                        <div style={{backgroundColor: "#1a1a1a"}} className="rounded-sm p-1" key={`captured-bonus-roll-row-${i}`}>
                            {str}
                        </div>
                        )
                    })}
                </div>
                )
                }
            </div>
            {cap_error_on_roll && 
            <div className="flex flex-col justify-center items-center gap-2 p-2 bg-red-950 rounded-sm capture-container-error">
                <Text bold size={12}>There was an error when capturing roll {cap_error_on_roll.roll_num}. Here is the raw capture data:</Text>
                <Text size={11}>{cap_error_on_roll.raw}</Text>
            </div>
            }
            <div className="flex justify-end w-full">
            <Button disableRipple classes="p-0 px-2" onClick={() => setCapErrorsOpen(true)}>See Capture Errors</Button>
            </div>
            <div className={`absolute size-full overflow-hidden ${capErrorsOpen ? "z-5" : "z-[-1]"}`}>
            <SlidingWindow
                active={capErrorsOpen}
                transition_type="slide-left"
                classes={`size-full flex flex-col gap-2 p-4 bg-red-950 rounded-md relative`}
            >
                <Text bold size={20} classes="text-start">Capture Errors</Text>
                <Text size={12} classes="text-start">See a list of the rows which have had capture errors, and their raw data. It is normal for the character recognition to pick up nonsense characters</Text>
                <div className={`p-1 h-full overflow-y-scroll overflow-x-hidden flex flex-col w-full relative`}>
                    <table 
                        className="border border-white text-white rounded-lg"
                    >
                        <thead>
                            <tr className="border-b border-white">
                                <th className="border-r border-white w-1/5">Roll Num</th>
                                <th>Raw Text</th>
                            </tr>
                        </thead>
                        <tbody className={`relative h-[50px]`}>
                            {capture_errors.length === 0 ? 
                            <tr className="absolute flex h-[50px] justify-center items-center size-full text-gray-400 italic"><td><Text size='lg'>No capture errors</Text></td></tr> :
                            capture_errors.map(ce => {
                                return (
                                    <tr
                                        className={`border-b border-white relative overflow-hidden`}
                                    >
                                        <td className="p-2 border-white border-r">{ce.roll_num}</td>
                                        <td className="p-2">{ce.raw}</td>
                                    </tr>
                                )
                            })
                            }
                        </tbody>
                    </table>
                </div>
                <div className="absolute top-1 right-1"><CloseButton onClick={() => setCapErrorsOpen(false)}/></div>
            </SlidingWindow>
            </div>
            {/* <Button disableRipple>
                Edit Video Settings
            </Button> */}
        </div>
    )
}