import { roll_type, skill_roll } from "@custom_types/rolltype";
import { MainStore } from "@app/main_store";
import { CaptureStore } from "@app/capture_store";
import { weapons } from "@custom_types/weapons";
import { elements } from "@custom_types/element";

export default async function saveSkillRollToDb (
    roll:skill_roll, pid:number, roll_exists: boolean, rollType: roll_type, w:weapons, e:elements,
    updateRollState: (roll:skill_roll, roll_exists: boolean) => any,
    addRollToState: MainStore["add_roll_to_stats"],
    updateLastRoll: CaptureStore["set_last_skill_roll"]
) {

    await window.ipcRenderer.add_skill_roll(pid, roll, roll_exists)

    updateRollState(roll, roll_exists);
    addRollToState(roll, rollType, w, e, roll_exists)
    updateLastRoll(roll)

}