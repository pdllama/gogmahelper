import { roll_type_other, reinforcement } from "@custom_types/rolltype";

export function same_reinforcements(r1:roll_type_other.five_reinforcement_rolls, r2:roll_type_other.five_reinforcement_rolls|[reinforcement|"",reinforcement|"",reinforcement|"",reinforcement|"",reinforcement|""]) {
    let is_same = true
    r1.forEach((r:reinforcement, i:number) => {
        if (r !== r2[i]) {
            is_same = false;
        }
    })
    return is_same;
}