import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

export type ApplyMode = "single" | "*" | "-0" | "0" | "1" | "2" | "3" | "4" | "5";

@customElement(ExerciseSelectorFilterApplies.NAME)
export default class ExerciseSelectorFilterApplies extends LitElement {
    static readonly NAME = "exercise-selector-filter-applies";

    static readonly EVENT_INPUT = "on-input";

    private static savedValue: ApplyMode | null = null;

    private static readonly EVERY_X_INPUT_GROUPS: [string, ApplyMode][] = [["other", "1"], ["third", "2"], ["fourth", "3"], ["fifth", "4"], ["sixth", "5"]];
    private static readonly INPUT_GROUPS: { id: string; text: string; value: ApplyMode; checked?: boolean }[] = [
        { id: "apply-to-single", text: "Apply to only this set", value: "single", checked: true },
        { id: "apply-to-all", text: "Apply to all sets", value: "*" },
        { id: "apply-to-all-before", text: "Apply to all sets, this and before", value: "-0" },
        { id: "apply-to-all-after", text: "Apply to all sets, this and after", value: "0" },
        ...ExerciseSelectorFilterApplies.EVERY_X_INPUT_GROUPS
            .map((e) => { return { id: `apply-to-every-${e[0]}`, text: `Apply to every ${e[0]} set`, value: e[1] }; }),
    ];

    static styles = css`
        .container {
            display: grid;
            grid-template-columns: auto 1fr;
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
                    ${ExerciseSelectorFilterApplies.INPUT_GROUPS.map((e) => html`
                        <input 
                                type="radio"
                                name="apply-to"
                                value=${e.value}
                                id=${e.id}
                                ?checked=${e.checked}
                                @input=${() => this.onInput(e.value)}>
                        <label for=${e.id}>
                            ${e.text}
                        </label>
                    `)}
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
