import { ReactNode } from "react"
import "./gridsizes.css"

type WrapperProps = Partial<{
    children:ReactNode, 
    classes:string, 
    no_shadow:boolean
}>

export default function GridItemWrapper({children, classes='', no_shadow=false}:WrapperProps) {

    return (
        <>
        <style>
            {`
                .red-shadow-and-bg {
                    box-shadow: 0px 0px 5px #a12424;
                    background-color: rgb(39, 28, 19);
                }
            `}
        </style>
        <div className={`grid-max-width grid-min-height rounded-xl ${no_shadow ? '' : 'red-shadow-and-bg'} ${classes}`}>
            {children}
        </div>
        </>
    )
}
