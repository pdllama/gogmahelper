import { roll_type } from "@custom_types/rolltype";
import { WindowNotFound } from "./errors";

export default async function start_capture(video_element:HTMLVideoElement, canvas:HTMLCanvasElement, rollType:roll_type, flag_error:() => void, reset_error: () => void) {

    const mh_wilds_window_id = await window.ipcRenderer.get_mh_wilds_window_id()

    if (mh_wilds_window_id === undefined) {
        // they don't have it launched.
        flag_error()
        throw new WindowNotFound(404)
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                // Note: this does work despite code editor squiggly.
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: String(mh_wilds_window_id),
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        });

        video_element.srcObject = stream;
        video_element.onloadedmetadata = (_) => {
            video_element.play();

            video_element.style.width = video_element.videoWidth + "px";
            video_element.style.height = video_element.videoHeight + "px";

            // canvas.width = 350; 
            // canvas.height = 70;
        }

        canvas.width = 350; 
        canvas.height = rollType === roll_type.SKILLS ? 70 : 160;

        reset_error()

    } catch (e:any) {
        flag_error()
        console.log("Error: ", e)
        throw new Error(e)
    }
    
}