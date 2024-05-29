import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import { RadioGroup } from "../models/RadioGroup";
import { RadioGroupValue } from "../models/RadioGroupValue";
import { TypedLitElement } from "../models/TypedEventTarget";

@customElement(RadioGroupElement.NAME)
export default class RadioGroupElement<T> extends (LitElement as TypedLitElement<RadioGroupElement<unknown>, RadioGroupElementEventMap<unknown>>) {
    static readonly NAME = "radio-group";

    static readonly EVENT_INPUT = "on-input";

    static styles = css`
        :host {
            display: contents;
        }
        
        .input-radio, .input-text {
            cursor: default;
        }
        .input-radio {
            display: inline-flex;
            --size: 14px;
            width: var(--size);
            height: var(--size);
            padding-right: 4px;
            aspect-ratio: 1;
        }
        
        .input-radio svg {
            fill: #686868;
            overflow: visible;
        }
        .input-radio[active] svg {
            fill: var(--link-color);
        }
    `;

    @property({ type: Object })
    radioGroup: RadioGroup<T> | null = null;

    @state()
    private checkedRadioGroupValue: RadioGroupValue<T> | null = null;

    protected render(): unknown {
        return this.radioGroup ? html`
            ${this.radioGroup.values.map((e) => html`
                <div
                        class="input-radio"
                        @click=${() => this.setValue(e.value)}
                        ?active=${this.checkedRadioGroupValue === e}>
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /><circle fill="#FFFFFF" cx="50" cy="50" r="${this.checkedRadioGroupValue === e ? "25" : "42"}" /></svg>
                </div>
                <span
                        class="input-text"
                        @click=${() => this.setValue(e.value)}>${e.label}</span>
            `)}
        ` : "";
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);

        if (changedProperties.has("radioGroup")) {
            this.checkedRadioGroupValue = this.radioGroup?.values.find((e) => e.checked) ?? null;
        }
    }

    setValue(value: T): boolean {
        if (!this.radioGroup) {
            return false;
        }

        let inputElem: HTMLInputElement | null;
        for (const radioValue of this.radioGroup.values) {
            if (radioValue.value === value) {
                this.checkedRadioGroupValue = radioValue;

                this.onInput(radioValue);
                return true;
            }
        }

        return false;
    }

    private onInput(value: RadioGroupValue<T>) {
        this.dispatchEvent(new CustomEvent(RadioGroupElement.EVENT_INPUT, { detail: value.value }));
    }
}

interface RadioGroupElementEventMap<T> {
    [RadioGroupElement.EVENT_INPUT]: T;
}
