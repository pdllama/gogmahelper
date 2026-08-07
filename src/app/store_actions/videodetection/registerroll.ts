import { roll_type, skill_roll } from "@custom_types/rolltype";
import { MainStore } from "@app/main_store";
import { CaptureStore } from "@app/capture_store";

export default async function saveSkillRollToDb (
    roll:skill_roll, pid:number, roll_exists: boolean, rollType: roll_type,
    updateRollState: (roll:skill_roll, roll_exists: boolean) => any,
    incrementRollNumber: MainStore["increment_roll"],
    updateLastRoll: CaptureStore["set_last_skill_roll"]
) {

    await window.ipcRenderer.add_skill_roll(pid, roll, roll_exists)

    updateRollState(roll, roll_exists);
    incrementRollNumber(rollType);
    updateLastRoll(roll)

}