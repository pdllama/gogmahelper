import { InputProps } from "./inputprops";
import { forwardRef } from "react";



const Input = forwardRef<HTMLInputElement, Partial<InputProps>>(({
    value="", onChange=() => {}, numeric=false, classes='', validate=()=>true, 
    onFocus=null, onBlur=null, onKeyDown=null, numericLimits=false, min=0, max=999,
    focusedBorderOnly=false, autofocus=false, 
}, ref) => {

    return (
        <input 
            type="text" 
            className={`${focusedBorderOnly ? "focus:border focus:border-white" : "border border-white"} rounded-sm p-1 ${classes}`}
            value={value}
            autoFocus={autofocus}
            ref={ref}
            onChange={(e) => {
                const val = e.target.value
                if (numeric && val !== "" && isNaN(parseInt(e.target.value))) {return;}
                onChange(e.target.value)
            }}
            onBlur={(e) => {
                let newVal:""|number = value ? parseInt(value) : "";
                if (numeric && numericLimits) {
                    if (parseInt(e.target.value) < min) {
                        newVal = min;
                        onChange(min.toString());
                    } else if (parseInt(e.target.value) > max) {
                        newVal = max;
                        onChange(max.toString());
                    }
                }
                if (onBlur) {
                    onBlur(newVal)
                }
            }}
            onFocus={onFocus ? onFocus : undefined}
            onKeyDown={onKeyDown ? onKeyDown : undefined}
        />
    )
}) 

export default Input
