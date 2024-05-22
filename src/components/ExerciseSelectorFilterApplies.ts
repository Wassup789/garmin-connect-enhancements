import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import Helper from "../helpers/Helper";
import ExerciseSelectorOption, {
    ExerciseSelectorOptionEvent, ExerciseSelectorOptionFavoriteUpdateEvent,
    ExerciseSelectorOptionSelectEvent
} from "./ExerciseSelectorOption";
import { TypedLitElement } from "../models/TypedEventTarget";
import { RadioGroup } from "../models/RadioGroup";

export type ApplyMode = "single" | "*" | "-0" | "0" | "1" | "2" | "3" | "4" | "5";

@customElement(ExerciseSelectorFilterApplies.NAME)
export default class ExerciseSelectorFilterApplies extends (LitElement as TypedLitElement<ExerciseSelectorFilterApplies, ExerciseSelectorFilterAppliesEventMap>) {
    static readonly NAME = "exercise-selector-filter-applies";

    static readonly EVENT_INPUT = "on-input";

    private static savedValue: ApplyMode | null = null;

    private static readonly EVERY_X_INPUT_GROUPS: [string, ApplyMode][] = [["other", "1"], ["third", "2"], ["fourth", "3"], ["fifth", "4"], ["sixth", "5"]];
    private static readonly INPUT_GROUPS: RadioGroup<string> = {
        name: "applies",
        values: [
            { name: "single", value: "single", label: "Apply to only this set", checked: true },
            { name: "all", value: "*", label: "Apply to all sets" },
            { name: "before", value: "-0", label: "Apply to all sets, this and before" },
            { name: "after", value: "0", label: "Apply to all sets, this and after" },
            ...ExerciseSelectorFilterApplies.EVERY_X_INPUT_GROUPS
                .map((e) => { return { name: `every-${e[0]}`, value: e[1], label: `Apply to every ${e[0]} set` }; }),
        ],
    };

    static styles = css`
        .container {
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
        }
  `;

    constructor() {
        super();

        this.postInit();
    }

    private async postInit() {
        await this.updateComplete;

        if (ExerciseSelectorFilterApplies.savedValue) {
            this.onInput(ExerciseSelectorFilterApplies.savedValue, false);
        }
    }

    connectedCallback() {
        super.connectedCallback();

        this.postInit();
    }

    protected render(): unknown {
        return html`
            <exercise-selector-filter-group id="apply" name="Apply to..." togglable active>
                <div class="container">
                    <radio-group
                            id="applies-radio-group" 
                            .radioGroup=${ExerciseSelectorFilterApplies.INPUT_GROUPS} 
                            @on-input=${(e: CustomEvent) => this.onInput(e.detail)}></radio-group>
                </div>
            </exercise-selector-filter-group>
        `;
    }

    private onInput = (value: ApplyMode, propagateChanges: boolean = true) => {
        this.dispatchEvent(new CustomEvent(ExerciseSelectorFilterApplies.EVENT_INPUT, { detail: value }));

        if (propagateChanges) {
            ExerciseSelectorFilterApplies.savedValue = value;
        } else {
            this.tryCheckRadioWithValue(value);
        }
    };

    private tryCheckRadioWithValue(value: ApplyMode) {
        if (this.shadowRoot) {
            const inputElem = this.shadowRoot!.querySelector(`input[value="${value}"]`) as HTMLInputElement | null;

            if (inputElem) {
                inputElem.checked = true;
            }
        }
    }
}

interface ExerciseSelectorFilterAppliesEventMap {
    [ExerciseSelectorOption.EVENT_MOUSE_OVER]: ExerciseSelectorOptionEvent;
    [ExerciseSelectorOption.EVENT_ON_SELECT]: ExerciseSelectorOptionSelectEvent;
    [ExerciseSelectorOption.EVENT_ON_FAVORITE_UPDATE]: ExerciseSelectorOptionFavoriteUpdateEvent;
}
