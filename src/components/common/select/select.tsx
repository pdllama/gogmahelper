import { ChangeEvent, SyntheticEvent } from "react"
import "./select.css"

type SelectProps = Partial<{
    selected:any,
    options:any[],
    label_map:Record<any, string>|undefined,
    select_classes:string,
    option_classes:string,
    unselected_option_label:string,
    on_change: (value:any) => void
    on_focus: () => void;
}>

export default function Select({selected='', options=[], label_map=undefined, select_classes='', option_classes='', unselected_option_label='Select an option', on_change=() => {}, on_focus=() => {}}:SelectProps) {


    return (
        <select 
            value={selected} 
            className={`rounded-2xl regular-bg p-2 ${selected === '' ? 'italic' : ''} ${select_classes}`} 
            onChange={(new_value:React.ChangeEvent<HTMLSelectElement>) => on_change(new_value.target.value)}
            onFocus={on_focus}
        >
            <option value={''} label={unselected_option_label} className={`italic ${option_classes}`}/>
            {options.map((opt:any, i:number) => {
                return (
                    <option key={`${i}-${opt}`} value={opt} label={label_map ? label_map[opt] : opt} className={`not-italic ${option_classes}`}/>
                )
            })}
        </select>
    )
}