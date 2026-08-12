import { group_bonus_skill, set_bonus_skill } from "@custom_types/rolltype"
import Text from "@components/common/text/text";
import Select from "@components/common/select/select";

const set_bonuses = Object.values(set_bonus_skill);
const group_bonuses = Object.values(group_bonus_skill);

type NewSkillRollFormProps = {
    set_bonus: ""|set_bonus_skill
    group_bonus: ""|group_bonus_skill
    change_set_bonus: (sb:""|set_bonus_skill) => void
    change_group_bonus: (gb: ""|group_bonus_skill) => void
    resetError: (() => void)|null;
}

export default function NewSkillRollForm({set_bonus, group_bonus, change_set_bonus, change_group_bonus, resetError=null}:NewSkillRollFormProps) {


    return (
        <>
        <div className='w-full flex items-center gap-2 px-3'>
            <Text size='lg' bold classes="w-1/2 text-end">Set Bonus:</Text>
            <Select 
                selected={set_bonus} 
                options={set_bonuses} 
                unselected_option_label="none"
                select_classes="w-full"
                on_change={(value:set_bonus_skill|"") => change_set_bonus(value)}
                on_focus={resetError ? resetError : undefined}
            />
        </div>
        <div className='w-full flex items-center gap-2 px-3'>
            <Text size='lg' bold classes="w-1/2 text-end">Group Bonus:</Text>
            <Select 
                selected={group_bonus} 
                options={group_bonuses} 
                unselected_option_label="none"
                select_classes="w-full"
                on_change={(value:group_bonus_skill|"") => change_group_bonus(value)}
                on_focus={resetError ? resetError : undefined}
            />
        </div>
        </>
    )
}