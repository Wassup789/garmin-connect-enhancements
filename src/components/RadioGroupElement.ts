import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { RadioGroup } from "../models/RadioGroup";
import { RadioGroupValue } from "../models/RadioGroupValue";
import Helper from "../helpers/Helper";

@customElement(RadioGroupElement.NAME)
export default class RadioGroupElement<T> extends LitElement {
    static readonly NAME = "radio-group";

    static readonly EVENT_INPUT = "on-input";

    static styles = css`
        :host {
            display: contents;
        }
    `;

    @property({ type: Object })
    radioGroup: RadioGroup<T> | null = null;

    protected render(): unknown {
        return this.radioGroup ? html`
            ${this.radioGroup.values.map((e) => html`
                <input
                        type="radio"
                        name=${this.radioGroup!.name}
                        id=${this.getRadioValueId(e)}
                        ?checked=${e.checked}
                        @focus=${Helper.inputUnfocusHandler}
                        @input=${() => this.onInput(e)}>
                <label for=${this.getRadioValueId(e)}>${e.label}</label>
            `)}
        ` : "";
    }

    setValue(value: T): boolean {
        if (!this.radioGroup) {
            return false;
        }

        let inputElem: HTMLInputElement | null;
        for (const radioValue of this.radioGroup.values) {
            if (radioValue.value === value && (inputElem = this.renderRoot.querySelector(`#${this.getRadioValueId(radioValue)}`))) {
                inputElem.checked = true;

                this.onInput(radioValue);
                return true;
            }
        }

        return false;
    }

    private getRadioValueId(value: RadioGroupValue<T>): string {
        return `${this.radioGroup!.name}-${value.name}`;
    }

    private onInput(value: RadioGroupValue<T>) {
        this.dispatchEvent(new CustomEvent(RadioGroupElement.EVENT_INPUT, { detail: value.value }));
    }
}
