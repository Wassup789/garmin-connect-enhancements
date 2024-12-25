import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { TypedLitElement } from "../models/TypedEventTarget";

@customElement(Checkbox3Element.NAME)
export default class Checkbox3Element extends (LitElement as TypedLitElement<Checkbox3Element, CheckboxElementEventMap>) {
    static readonly NAME = "checkbox3-elem";

    static readonly EVENT_INPUT = "on-input";

    private static readonly SVG_CHECKED = html`<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M389-227 154-461l91-92 144 145 327-326 91 90-418 417Z"/></svg>`;
    private static readonly SVG_CLOSE = html`<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m254-159-94-95 225-226-225-226 94-96 226 226 226-226 94 96-225 226 225 226-94 95-226-226-226 226Z"/></svg>`;

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

    @property({ reflect: true })
    checked: boolean | null = null;

    protected render(): unknown {
        return html`
            <div
                    class="input-radio"
                    @click=${() => this.toggleValue()}>
                ${this.checked ? Checkbox3Element.SVG_CHECKED : Checkbox3Element.SVG_CLOSE}
            </div>
            <span
                    class="input-text"
                    @click=${() => this.toggleValue()}>${this.label}</span>
        `;
    }

    setValue(value: boolean | null) {
        if (this.checked === value) {
            return;
        }

        this.checked = value;
        this.dispatchEvent(new CustomEvent(Checkbox3Element.EVENT_INPUT, { detail: this.checked }));
    }

    toggleValue() {
        if (this.checked !== null) {
            this.setValue(null);
        } else {
            this.setValue(true);
        }
    }
}

interface CheckboxElementEventMap {
    [Checkbox3Element.EVENT_INPUT]: boolean | null;
}
