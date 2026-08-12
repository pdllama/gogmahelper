
import Button from "@components/common/button/button"
import MhWildsVideo from "@components/screen_capture/mhwilds_video"
import Text from "@components/common/text/text"
import { bonus_roll, bonus_roll_type, keep_bonus_roll, roll_type, skill_roll } from "@custom_types/rolltype"
import { useMainStore } from "@app/main_store"
import { useCaptureStore } from "@app/capture_store"
import saveSkillRollToDb from "@app/store_actions/videodetection/registerroll"
import { useEffect, useRef } from "react"
import { weapons } from "@custom_types/weapons"
import { elements } from "@custom_types/element"

type CaptureContainerProps = {
    rolls:(skill_roll|bonus_roll|keep_bonus_roll)[],
    roll_num: number,
    pid: number
    insertRoll: (roll:skill_roll|bonus_roll|keep_bonus_roll, roll_exists: boolean) => void;
    rollType: roll_type
    w:weapons|null, e:elements|null
}

export default function CaptureContainer({rolls, pid, roll_num, insertRoll, rollType, w, e}:CaptureContainerProps) {
    const add_roll_to_state = useMainStore((state) => rollType === roll_type.BONUSES &&  state.bonus_type === bonus_roll_type.KEEP ? state.add_keep_roll_to_stats : state.add_roll_to_stats)
    const update_last_roll = useCaptureStore((state) => rollType === roll_type.SKILLS ? state.set_last_skill_roll : state.set_last_amend_roll);
    const increment_roll_num = useMainStore(state => state.increment_roll)
    const roll_exists = rolls ? rolls.filter(ro => ro.roll_num === roll_num).length !== 0 : false
    const last_roll = useCaptureStore((state) => rollType === roll_type.SKILLS ? state.last_skill_roll : state.last_amend_roll)

    // const save_skill_roll_func = (roll:skill_roll|bonus_roll|keep_bonus_roll) => {
    //     if ('set_bonus' in roll) {
    //         saveSkillRollToDb(roll, pidRef.current!, roll_exists.current, rollType, insertRoll, increment_roll_num, update_last_roll as ((sr:skill_roll) => void))
    //     }
    // }
    
    return (
        <div className="h-fit w-full max-w-[600px] flex flex-col justify-center items-center rounded-md bg-black/100 p-2 gap-2 relative"> {/**sticky top-0 z-5 */}
            <Text bold size={24}>Roll Detection Video</Text>
            <MhWildsVideo 
                saveRollTools={{
                    profile_id: pid, roll_exists, rollType, roll_num, w, e,
                    insertRollIntoState: insertRoll,
                    increment_roll_num,
                    add_roll_to_state, 
                    update_last_roll
                }}
            />
            <div className="flex flex-col justify-center items-center">
                <Text bold size={14}>Last Roll:{!last_roll ? " none" : ""}</Text>
                {last_roll &&
                <div className="flex gap-1">
                    <div className="rounded-sm p-1 px-2">
                        <Text bold size={12}>{(last_roll as skill_roll).set_bonus}</Text>
                    </div>
                    <div className="rounded-sm p-1 px-2">
                        <Text bold size={12}>{(last_roll as skill_roll).group_bonus}</Text>
                    </div>
                </div> 
                }
            </div>
            {/* <Button disableRipple>
                Edit Video Settings
            </Button> */}
        </div>
    )
}