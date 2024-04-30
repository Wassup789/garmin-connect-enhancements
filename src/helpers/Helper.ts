export default class Helper {
    static toTitleCase(text: string): string {
        return text
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    static inputUnfocusHandler(e: FocusEvent) {
        (e.target as HTMLElement).blur();
    }
}
