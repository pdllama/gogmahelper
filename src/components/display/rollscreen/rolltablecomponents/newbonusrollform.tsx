import { reinforcement, reinforcement_level } from "@custom_types/rolltype"
import Text from "@components/common/text/text";
import Select from "@components/common/select/select";
import { weapons } from "@custom_types/weapons";
import { reinforcement_level_labels } from "./rolltablehandlersandtypes";
import { allowed_amend_reinf_levels } from "./rolltablehandlersandtypes";

const reinfs = Object.values(reinforcement)
const reinf_levels = Object.values(reinforcement_level)

type NewSkillRollFormProps = {
    reinforcements: (reinforcement|"")[]
    reinforcement_levels: (reinforcement_level|"")[]
    change_reinf: (rb:reinforcement|'', i:number) => void
    change_reinf_level: (rl:reinforcement_level|'', i:number) => void
    w:weapons
    resetError: (() => void)|null;
}

export default function NewBonusRollForm({reinforcements, reinforcement_levels, change_reinf, change_reinf_level, resetError=null, w}:NewSkillRollFormProps) {

    const weapon_range = w === "light_bowgun" || w === "heavy_bowgun" || w === "bow" ? "ranged" : "melee"

    return (
        <div className="flex flex-col items-center w-full">
            {reinforcements.map((rb:reinforcement|"", i:number) => {

                const rl = reinforcement_levels[i]
                const imgkey = rb === "SHARPNESS/AMMO" ? (weapon_range === "melee" ? "sharpness" : "ammo") : rb.toLowerCase()
                
                return (
                    <div className="flex items-center gap-2 p-[2px] py-[0.5px] rounded-sm px-5" key={`new-bonus-roll-row-${i+1}`}>
                        <Text size='xs' nowrap bold>Bonus {i+1}:</Text>
                        <div className="w-fit h-[25px] flex items-center gap-2 p-[2px] bg-red-950 rounded-sm pl-1">
                            <div className="h-[24px] w-[70px] flex justify-center">
                                {rb === "" ? <></> : <img className="h-[24px] object-contain" src={`icons/misc/${imgkey}.png`}/>}
                            </div>
                            <Select 
                                selected={rb}
                                options={reinfs}
                                unselected_option_label="none"
                                select_classes="w-6/10 h-[24px] text-[12px] py-0"
                                option_classes="text-[12px]"
                                on_change={(value:reinforcement|"") => change_reinf(value, i)}
                                on_focus={resetError ? resetError : undefined}
                            />
                            {/* <select value={rb} onChange={(e:any) => change_reinf(e.target.value, i)} className="bg-black w-6/10 p-1 text-[14px] text-center select-inner cursor-pointer">
                                <option value="" className="italic">none</option>
                                {reinfs.map((rb:reinforcement, i:number) => {
                                    const isEven = i%2 === 0;
                                    return (
                                        <option value={rb} className={`${isEven ? "bg-black" : ""}`}>{rb}</option>
                                    )
                                })}
                            </select> */}
                            <Select 
                                selected={rl}
                                options={!rb ? reinf_levels : allowed_amend_reinf_levels[rb]}
                                unselected_option_label="none"
                                select_classes="w-6/10 h-[24px] text-[12px] py-0"
                                option_classes="text-[12px]"
                                on_change={(value:reinforcement_level|"") => change_reinf_level(value, i)}
                                on_focus={resetError ? resetError : undefined}
                            />
                            {/* <select value={rl} onChange={(e:any) => change_reinf_level(e.target.value, i)} className="bg-black w-4/10 p-1 text-[14px] text-center select-inner cursor-pointer">
                                <option value="" className="italic">none</option>
                                {(!rb ? reinf_levels : allowed_amend_reinf_levels[rb]).map((rl:reinforcement_level, i:number) => {
                                    const isEven = i%2 === 0;
                                    return (
                                        <option value={rl} className={`${isEven ? "bg-black" : ""}`}>{reinforcement_level_labels[rl]}</option>
                                    )
                                })}
                            </select> */}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}