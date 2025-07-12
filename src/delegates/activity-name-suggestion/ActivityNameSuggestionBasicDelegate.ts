import ActivityNameSuggestionDelegate from "./ActivityNameSuggestionDelegate";

export default class ActivityNameSuggestionBasicDelegate extends ActivityNameSuggestionDelegate {
    private nextRenderTextValue: string | null = null;

    get hostTextElem(): HTMLElement {
        return this.activityNameSuggestion.hostContainer.querySelector(".inline-edit-editable-text") as HTMLElement;
    }

    override get hostInsertBeforeElem(): HTMLElement | null {
        return this.activityNameSuggestion.hostContainer.querySelector(".inline-edit-editable");
    }

    override get isEditing(): boolean {
        return this.activityNameSuggestion.hostContainer.classList.contains("edit");
    }

    override onHostUpdate() {
        if (this.nextRenderTextValue && this.hostTextElem) {
            this.setInputValue(this.nextRenderTextValue);
            this.nextRenderTextValue = null;
        }
    }

    override startEditing() {
        (this.activityNameSuggestion.hostContainer.querySelector(".inline-edit-trigger") as HTMLElement | undefined)?.click();
    }

    override setInputValue(value: string) {
        this.hostTextElem.innerText = value;
    }
}
