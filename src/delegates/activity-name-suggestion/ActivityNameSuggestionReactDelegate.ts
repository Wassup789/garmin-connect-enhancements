import ActivityNameSuggestionDelegate from "./ActivityNameSuggestionDelegate";
import ReactHelper from "../../helpers/ReactHelper";

export default class ActivityNameSuggestionReactDelegate extends ActivityNameSuggestionDelegate {
    private static readonly INPUT_SELECTOR = "input[class*='InlineActivityNameEdit']";

    private nextRenderTextValue: string | null = null;

    get hostTextInput(): HTMLInputElement | null {
        return this.activityNameSuggestion.hostContainer.querySelector(ActivityNameSuggestionReactDelegate.INPUT_SELECTOR);
    }

    override get hostInsertBeforeElem(): HTMLElement | null {
        return null;
    }

    override get isEditing(): boolean {
        return Boolean(this.hostTextInput);
    }

    override onHostUpdate() {
        if (this.nextRenderTextValue && this.hostTextInput) {
            this.setInputValue(this.nextRenderTextValue);
            this.nextRenderTextValue = null;
        }
    }

    override startEditing() {
        this.activityNameSuggestion.hostContainer.querySelector("button")?.click();
    }

    override setInputValue(value: string) {
        const input = this.hostTextInput;

        if (input instanceof HTMLInputElement) {
            ReactHelper.updateInput(input, value);
        } else {
            this.nextRenderTextValue = value;
        }
    }
}
