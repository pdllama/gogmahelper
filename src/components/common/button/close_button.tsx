import "./button.css"
import Button from "./button"


export default function CloseButton({classes='', buttonProps={}, onClick=() => {}, img_size=25}:Partial<{classes:string, buttonProps: {}, onClick:() => void, img_size:number}>) {

    return (
        <>
        <style>
            {`
                .custom-size {
                    width: ${img_size}px;
                    height: ${img_size}px;
                }
            `}
        </style>
        <Button
            classes={`p-0 bg-transparent hover:border-none border-none darken ${classes}`}
            disableRipple
            onClick={onClick}
            {...buttonProps}
        >
            <img src='icons/app/close.png' className={`custom-size`}/>
        </Button>
        </>
    )
}