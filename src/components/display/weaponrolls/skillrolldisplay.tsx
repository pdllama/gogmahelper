import { weapons } from "@custom_types/weapons"
import { useMainStore } from "../../../app/main_store"
import RollDisplayWrapper from "./rolldisplaywrapper"
import Text from "@components/common/text/text"
import { get_weapon_label } from "../../../app/util/labels"
import { elements } from "@custom_types/element"
import CloseButton from "@components/common/button/close_button"

type RollDisplayProps = {
    weapon:weapons
} 

export default function SkillRollDisplay({weapon}:RollDisplayProps) {

    const weapon_elements = useMainStore((state) => state.skill_stats[weapon])

    const element_keys = weapon_elements === undefined ? undefined : Object.keys(weapon_elements) as elements[]

    return (
        <RollDisplayWrapper>
            <div className='min-h-[150px] max-h-[150px] w-full rounded-t-xl flex items-center justify-center relative'>
                <Text size='3xl' bold classes='z-5'>
                    {get_weapon_label(weapon)}
                </Text>
                <img className='absolute opacity-25 h-full'src={`icons/weapons/${weapon}.png`} />
                <div className='size-full absolute flex justify-end'>
                    <CloseButton
                        classes='h-[30px]'
                        img_size={30}    
                    />
                </div>
                
            </div>
            <div className='min-h-[50px] w-full rounded-b-xl flex items-center justify-center relative border-t border-black bg-black/75'>
                {!element_keys ? 
                    <Text classes='italic opacity-75'>No elements associated with this weapon</Text> :  // You shouldn't be able to have this happen, but it covers bases.
                    <>
                    
                    </>

                }
            </div>
        </RollDisplayWrapper>
    )
}