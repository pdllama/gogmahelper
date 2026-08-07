

export default function get_screen_dimensions(wilds_aspect_ratio: "16:9"|"21:9") {
    return {w: wilds_aspect_ratio === "16:9" ? 1280 : 1680, h: 720}
}