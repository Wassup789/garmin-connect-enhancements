import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { TypedLitElement } from "../models/TypedEventTarget";

@customElement(CheckboxElement.NAME)
export default class CheckboxElement extends (LitElement as TypedLitElement<CheckboxElement, CheckboxElementEventMap>) {
    static readonly NAME = "checkbox-elem";

    static readonly EVENT_INPUT = "on-input";

    static styles = css`
        :host {
            display: contents;
        }
        
        .input-radio, .input-text {
            cursor: default;
        }
        .input-radio {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 12px;
            height: 12px;
            border: 1px solid #686868;
            border-radius: 3px;
            margin-right: 4px;
            aspect-ratio: 1;
        }
        :host([checked]) .input-radio {
            border-color: var(--link-color);
            background: var(--link-color);
        }
        
        .input-radio svg {
            transform: scale(1.2);
            fill: #FFFFFF;
        }
        :host(:not([checked])) .input-radio svg {
            display: none;
        }
    `;

    @property()
    label: string = "";

    @property({ type: Boolean, reflect: true })
    checked: boolean = false;

    protected render(): unknown {
        return html`
            <div
                    class="input-radio"
                    @click=${() => this.setValue(!this.checked)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M389-227 154-461l91-92 144 145 327-326 91 90-418 417Z"/></svg>
            </div>
            <span
                    class="input-text"
                    @click=${() => this.setValue(!this.checked)}>${this.label}</span>
        `;
    }

    setValue(value: boolean) {
        if (this.checked === value) {
            return;
        }

        this.checked = value;
        this.dispatchEvent(new CustomEvent(CheckboxElement.EVENT_INPUT, { detail: this.checked }));
    }
}

interface CheckboxElementEventMap {
    [CheckboxElement.EVENT_INPUT]: boolean;
}
