import { useVsStore } from "@app/vs_store/vs_store"
import DisplayBox from "@components/screen_capture/display_box"
import MhWildsVideo from "@components/screen_capture/mhwilds_video"
import { VideoSettingsConfig } from "@custom_types/files/config"
import { roll_type } from "@custom_types/rolltype"
import { useEffect } from "react"
import { useShallow } from "zustand/shallow"



type IncomingVideoStateInit = VideoSettingsConfig & {
    rollType: roll_type,
}

export default function VideoSettingsApp({}) {

    const {initiate, initialized, wilds_aspect_ratio, scale} = useVsStore(useShallow((state) => {return {initiate:state.initialize, initialized:state.initialized, wilds_aspect_ratio:state.wilds_aspect_ratio, scale:state.display_scale}}))



    useEffect(() => {
        window.ipcRenderer.get_vs_init_state().then((data:IncomingVideoStateInit) => initiate(data))
    }, [])

    const screen_width = wilds_aspect_ratio === '16:9' ? 1280 : 1680

    return (
        <div className="size-full flex">
            <div className='w-full h-[740px] flex justify-center items-center relative'>
                {!initialized ? 
                    <div className='w-[1280px] h-[720px] bg-grey-800 rounded-lg'>
                    
                    </div> : 

                    <div className='border border-white relative' style={{width: `${screen_width+2}px`, height: '722px'}}>
                        <MhWildsVideo x={0} y={0} width={screen_width} height={720} wilds_width={screen_width} wilds_height={720} scale={scale} enable_error_border={false}/>
                        <div className="absolute size-full z-10 top-[0px]" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}/>  {/* The darken mask over the video */}
                        <DisplayBox/>
                    </div>
                }
                <div className='absolute w-[95%] border-b-[1px] border-white bottom-[0px]'>

                </div>
            </div>
            {!initialized ? 
                <>
                
                </> : 
                <></>
            }
        </div>
    )
}