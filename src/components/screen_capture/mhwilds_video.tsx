import { useEffect, useRef, useState } from "react";
import start_capture from "@app/screen_capture/start_capture";
import VideoProcessor, { saveRollTools } from "@app/screen_capture/videoprocessor";
import { video_region } from "@app/screen_capture/videoprocessor";
import { skill_roll, bonus_roll, keep_bonus_roll } from "@custom_types/rolltype";
import Text from "@components/common/text/text";
import Button from "@components/common/button/button";
import { useMainStore } from "@app/main_store";
import { menu } from "@custom_types/menutype";
import { roll_type } from "@custom_types/rolltype";
import { useCaptureStore } from "@app/capture_store";
import { select_video_settings } from "@app/store_actions/selectors/selectvsside";
import { VideoSettingsConfig } from "@custom_types/files/config";
import { useShallow } from "zustand/shallow";
import get_screen_dimensions from "@app/util/aspect_ratio_size";


type MHWildsVideoProps = video_region & {
    wilds_width: number, wilds_height: number,
    saveRollTools: saveRollTools
    have_canvas: boolean, have_video: boolean, // retired props
    enable_error_border:boolean
    get_processor: (v:VideoProcessor) => void
}

export default function MhWildsVideo({
    saveRollTools,
    get_processor=(_) => {}}:Partial<MHWildsVideoProps>,
    enable_error_border=true
) {

    const [error, setError] = useState<boolean>(false)
    const [gettingVideo, setGettingVideo] = useState<boolean>(false)

    const rollType:roll_type = useMainStore(state => state.menu === menu.skills ? roll_type.SKILLS : roll_type.BONUSES);
    const displaySettings:VideoSettingsConfig = useCaptureStore(useShallow(state => select_video_settings(state, rollType)));
    const {
        wilds_aspect_ratio,
        display_x, display_y, display_width, display_height, display_scale,
        detection_x, detection_y, detection_width, detection_height,
        canvas_fps, pixel_threshold, read_delay
    } = displaySettings

    const video_ref = useRef(null)
    const canvas_ref = useRef(null)
    // const test_canvas_ref = useRef(null)

    const processor_ref = useRef<VideoProcessor|null>(null)
    
    const wilds_dims = get_screen_dimensions(wilds_aspect_ratio);
    
    useEffect(() => {
        try {
            const video = video_ref.current! as HTMLVideoElement
            const canvas = canvas_ref.current! as HTMLCanvasElement;
            // const test_canvas = test_canvas_ref.current! as HTMLCanvasElement
            // button_ref.current!.click();
            start_capture(video, canvas, rollType, () => setError(true), () => {})
    
            const processor = new VideoProcessor(
                // video, canvas, test_canvas,
                video, canvas, 
                {x: display_x, y: display_y, width: display_width, height: display_height, scale: display_scale},
                {x: detection_x, y: detection_y, width: detection_width, height: detection_height},
                {canvas_fps: canvas_fps, pixel_threshold: pixel_threshold, read_delay: read_delay},
                saveRollTools!
            );
            processor_ref.current = processor;
            get_processor(processor)
            
            return () => processor_ref.current!.stop()
        } catch (e:any) {
            console.log("RENDERER ERROR: ", e)
        }
        return undefined
    }, [])

    useEffect(() => {
        if (saveRollTools) {
            processor_ref.current?.updateRollTools(
                saveRollTools.profile_id, saveRollTools.roll_exists, 
                saveRollTools.rollType, saveRollTools.roll_num
            )
        }
    }, 
    [saveRollTools?.profile_id, saveRollTools?.rollType, 
    saveRollTools?.roll_exists, saveRollTools?.roll_num]
    )

    const border_styles = (error && enable_error_border) ? 'border border-dashed border-white' : ''
    const error_hover = error ? 'rounded-sm hover:cursor-pointer hover:opacity-50' : ''

    return (
        <>
        <div 
            className={`overflow-hidden overflow-x-hidden relative flex flex-col items-center justify-center ${border_styles} ${error_hover}`} 
            style={{width: display_width, minWidth: display_width, height: display_height, minHeight: display_height}}
        >
        <video 
            ref={video_ref}
            onPlay={(_:React.SyntheticEvent<HTMLVideoElement, Event>) => {
                processor_ref.current?.start()
            }}
            onEnded={(_) => processor_ref.current?.stop()}
            onPause={(_) => processor_ref.current?.stop()}
            className='max-w-none max-h-none absolute'
            style={{
                visibility: error ? 'hidden' : 'visible',
                width: wilds_dims.w, height: wilds_dims.h,
                transform: `scale(${display_scale})`,
                transformOrigin: 'top left',
                left: `${-1*(display_x*display_scale)}px`, 
                top: `${-1*(display_y*display_scale)}px`,
            }}
        ></video>
        {!(gettingVideo) && error ? 
        <Button 
            disableRipple 
            classes='size-full min-w-[0px] hover:border-none border-none' 
            onClick={
                () => {
                    setGettingVideo(true)
                    setTimeout(() => {
                        start_capture(video_ref.current!, canvas_ref.current!, rollType, () => setError(true), () => setError(false))
                        setGettingVideo(false)
                    }, 500)
                }
            }
        >
            <Text size='md' classes='italic'>Cannot detect MH Wilds</Text>
            <Text size='sm' classes='italic'>Click to try again</Text>
        </Button> : 

        error && gettingVideo && <Text size='md' classes='italic'>Getting video data...</Text>
        }
        </div>
        <canvas 
            ref={canvas_ref} 
            className='hidden' 
        />
        {/* <canvas 
            ref={test_canvas_ref}
            className='hidden' 
            style={{width: display_width, minWidth: display_width, height: display_height, minHeight: display_height}}
        /> */}
        </>
    )
}