import { useEffect, useState, useRef } from "react";
import { ButtonProps } from "./buttonprops";
import Button from "./button";

// This is a button that is disabled for a certain amount of seconds before being enabled.
// Used for confirming deleting things that are irreversible.

type TimeoutButtonProps = ButtonProps & {
    timeout:number, // # seconds to timeout
    start_timeout:boolean //boolean to indicate when to start the timeout. if it becomes false, it resets the timer and starts again from the top when it becomes true again
}

export default function TimeoutButton({
    children, classes='', onClick=()=>{}, 
    disableRipple=false, disabled=false, enable_disabled_style=true, 
    ref, timeout=3, start_timeout=false
}:Partial<TimeoutButtonProps>) {

    const [timer_details, set_timer_details] = useState({timer: timeout, disabled: true});

    useEffect(() => {

        if (start_timeout && timer_details.timer != 0) {
            const timer = setTimeout(() => {
                set_timer_details({timer: timer_details.timer-1, disabled: (timer_details.timer-1) === 0 ? false : true})
            }, 1000)
            return () => clearTimeout(timer)
        } else if (!start_timeout && timer_details.timer !== timeout) {
            set_timer_details({timer: timeout, disabled: true})
        }
    }, [start_timeout, timer_details.timer])

    return (
        <Button
            classes={classes}
            onClick={onClick}
            disabled={disabled ? true : timer_details.disabled} // we allow disabled prop to still work in case there's some custom disable logic for a given use case.
            disableRipple={disableRipple}
            enable_disabled_style={enable_disabled_style}
            ref={ref}
        >
            {children} {timer_details.timer !== 0 ? <>({timer_details.timer})</> : <></>}
        </Button>
    )
}