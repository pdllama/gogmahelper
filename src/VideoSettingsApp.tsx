import { useEffect } from "react"





export default function VideoSettingsApp({}) {

    useEffect(() => {
        window.ipcRenderer.get_vs_init_state().then(data => console.log(data))
    }, [])

    return (
        <div className="size-full flex">
            
        </div>
    )
}