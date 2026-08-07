import { useMainStore } from "@app/main_store";
import { roll_type } from "@custom_types/rolltype";
import { menu as MenuType } from "@custom_types/menutype";


export default function RollNumberDisplay({}) {

    const menu = useMainStore(state => state.menu);
    const rollType = menu === MenuType.skills ? roll_type.SKILLS : roll_type.BONUSES;
    const roll_num = useMainStore((state) => rollType === roll_type.SKILLS ? state.skill_roll_num : state.bonus_roll_num)

    return roll_num
}