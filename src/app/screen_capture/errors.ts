
export class WindowNotFound extends Error {
    constructor(public statusCode: number) {
        const message = "Monster Hunter Wilds is not launched!";
        super(message)
        this.name = ''
    }
}