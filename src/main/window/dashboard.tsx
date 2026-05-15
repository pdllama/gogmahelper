import Text from "@components/common/text/text"
import MhWildsVideo from "@components/screen_capture/mhwilds_video"
import Button from "@components/common/button/button"
import { roll_type } from "@custom_types/rolltype"

export default function Dashboard({}) {


    
    return <>
        <Text size='3xl' bold>Dashboard</Text>
        <Text size='xl' bold> Screen Display Sandbox (temporary) </Text>
        <MhWildsVideo/>
        <Button disableRipple onClick={() => window.ipcRenderer.open_video_settings(roll_type.SKILLS)}>
            Child Process
        </Button>
    </>
}