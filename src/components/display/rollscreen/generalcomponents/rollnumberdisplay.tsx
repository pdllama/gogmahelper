import Text from "@components/common/text/text";
import Button from "@components/common/button/button";
import Input from "@components/common/input/input";
import { useState, useRef, useEffect } from "react";
import { roll_type } from "@custom_types/rolltype";
import { useMainStore } from "@app/main_store";
import { menu as MenuType } from "@custom_types/menutype";

type RollNumberDisplayProps = {
    rollNumProp:number
    rollTypeProp:roll_type
    
}

export default function ChangeableRollNumberDisplay({rollNumProp, rollTypeProp}:Partial<RollNumberDisplayProps>) {

    const menu = rollTypeProp ? null : useMainStore(state => state.menu);
    const rollType = rollTypeProp ? rollTypeProp : menu === MenuType.skills ? roll_type.SKILLS : roll_type.BONUSES
    const roll_num = rollNumProp ? rollNumProp : useMainStore(state => rollType === roll_type.SKILLS ? state.skill_roll_num : state.bonus_roll_num)

    const [editRollNum, setEditRollNum] = useState<{editing: boolean, new: ""|number}>({editing: false, new: roll_num});

    const set_roll_num = useMainStore(state => state.set_roll_number)
    const rollNumInputRef = useRef<HTMLInputElement>(null);

    const finalizeRollNumEdit = () => {
        if (editRollNum.new) {
            set_roll_num(rollType, editRollNum.new < 1 ? 1 : editRollNum.new > 999 ? 999 : editRollNum.new)
        }
        setEditRollNum({editing: false, new: editRollNum.new === "" ? "" : editRollNum.new < 1 ? 1 : editRollNum.new > 999 ? 999 : editRollNum.new })
    }

    useEffect(() => {
        setEditRollNum({...editRollNum, new: roll_num})
    }, [roll_num])

    return (
        <div className="flex items-center gap-1">
            <Text size="md" classes="text-start pl-2">Currently on Roll Number: {editRollNum.editing ? "" : roll_num}</Text>
            {editRollNum.editing && 
            <Input 
                classes={`w-[40px]`} 
                ref={rollNumInputRef} 
                numeric autofocus
                value={editRollNum.new.toString()} 
                onChange={(val:string) => setEditRollNum({...editRollNum, new: val === "" ? "" : parseInt(val)})} 
                onBlur={finalizeRollNumEdit}
                onFocus={(e) => e.currentTarget.select()}
                onKeyDown={(e) => {if (e.key === "Enter") {rollNumInputRef.current!.blur()}}}
            />
            }
            <Button disableRipple classes="py-1 px-2 text-[12px]" onClick={() => {
                setEditRollNum({...editRollNum, editing: true}); 
            }}>Edit</Button>
            <Button disableRipple classes="py-1 px-2 text-[12px] bg-red-950" onClick={() => set_roll_num(rollType, 1)}>Reset</Button>
        </div>
    )

}