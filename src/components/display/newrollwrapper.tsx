import { ReactNode } from "react"
import GridItemWrapper from "./griditemwrapper"
import SlidingWindow from "@components/common/sliding_window/slidingwindow"
import Button from "@components/common/button/button"

type NewRollFormWrapperProps = {
    children: ReactNode
    openForm: () => void
    isOpen: boolean
    bgstyle: string
    classes: string
    fullContainerClasses: string
}

export default function NewRollFormWrapper({children, openForm, isOpen, bgstyle="bg-cyan-800", classes="", fullContainerClasses=''}:Partial<NewRollFormWrapperProps>) {



    return (
        <>
        <style>
            {`
                .slide-form {
                    transition-property: top;
                    transition-duration: 0.5s;
                }
            `}
        </style>
        <GridItemWrapper no_shadow classes={`border-dashed border-cyan-500 border relative overflow-hidden ${fullContainerClasses}`}>
            <>
            <Button classes="grid-min-height grid-max-width flex justify-center items-center rounded-xl border-none hover:bg-cyan-950 z-1 size-full" disableRipple onClick={openForm}>
                <img src='icons/app/plus.png' width='80px' height='80px'/>
            </Button> 
            <SlidingWindow active={isOpen} transition_type="slide-down" classes={`size-full flex flex-col items-center gap-2 rounded-xl ${bgstyle} ${classes}`}>
                {children}
            </SlidingWindow>
            </> 
        </GridItemWrapper>
        </>
    )
}