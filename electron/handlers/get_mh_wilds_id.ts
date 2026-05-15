import { desktopCapturer } from "electron";

export default async function get_mh_wilds_window_id() {
    const window_sources = await desktopCapturer.getSources({ types: ['window'] });
    const mh_wilds_window = window_sources.filter(ws => ws.name.includes("Monster Hunter Wilds"))[0];
    if (mh_wilds_window === undefined) {return undefined}
    else {return mh_wilds_window.id}
}