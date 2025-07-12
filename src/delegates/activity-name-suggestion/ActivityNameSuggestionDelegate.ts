import { ActivityNameSuggestion } from "../../components";

export default abstract class ActivityNameSuggestionDelegate {
    readonly activityNameSuggestion: ActivityNameSuggestion;

    abstract get hostInsertBeforeElem(): HTMLElement | null;

    abstract get isEditing(): boolean;

    abstract onHostUpdate(): void;

    abstract startEditing(): void;

    abstract setInputValue(value: string): void;

    constructor(hostContainer: HTMLElement) {
        this.activityNameSuggestion = new ActivityNameSuggestion(this, hostContainer);
    }
}
