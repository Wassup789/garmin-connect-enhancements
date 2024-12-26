import { customElement, property, query } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import Helper from "../helpers/Helper";
import { TypedLitElement } from "../models/TypedEventTarget";
import { I18n } from "../models/I18n";
import Checkbox3Element from "./Checkbox3Element";

@customElement(EquipmentFilter.NAME)
export default class EquipmentFilter extends (LitElement as TypedLitElement<EquipmentFilter, EquipmentFilterEventMap>) {
    static readonly NAME = "equipment-filter";

    static readonly EVENT_ON_ACTIVE = "on-active";
    static readonly EVENT_ON_INACTIVE = "on-inactive";
    static readonly EVENT_ON_UPDATE = "on-update";

    static styles = css`
        .input-container {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        :host([value="false"]) .exclude-button {
            display: none;
        }
        .flex-grow { flex-grow: 1; }
        .exclude-button {
            cursor: pointer;
            user-select: none;
            color: var(--link-color);
            text-align: right;
            font-size: 0.7rem;
        }
        .exclude-button:hover {
            text-decoration: underline;
        }
    `;

    private _value: boolean | null = null;
    @property({ reflect: true })
    private set value(val: boolean | null) {
        this._value = val;
    }
    get value(): boolean | null {
        return this._value;
    }

    @property({ reflect: true })
    equipment: string = "";

    @property({ reflect: true })
    label: string = "";

    @property({ type: Boolean, reflect: true })
    active: boolean = false;

    @query(".input-container checkbox3-elem") input!: Checkbox3Element;

    protected render(): unknown {
        return html`
            <div class="input-container">
                <checkbox3-elem
                        label=${this.label || Helper.toTitleCase(this.equipment)} 
                        @on-input=${() => this.onInput()}></checkbox3-elem>
                <div class="flex-grow"></div>
                <div class="exclude-button" @click=${() => this.exclude()}>Exclude</div>
            </div>
        `;
    }

    onInput(skipUpdate: boolean = false) {
        this.active = this.input.checked !== null;

        this.value = this.input.checked;
        this.dispatchEvent(new CustomEvent((this.active ? EquipmentFilter.EVENT_ON_ACTIVE : EquipmentFilter.EVENT_ON_INACTIVE), { detail: this }));

        if (!skipUpdate) {
            this.internalOnUpdate();
        }
    }

    private internalOnUpdate() {
        this.dispatchEvent(new CustomEvent(EquipmentFilter.EVENT_ON_UPDATE, { detail: this }));
    }

    exclude(skipUpdate: boolean = false) {
        this.input.checked = false;
        this.onInput(skipUpdate);
    }
}

interface EquipmentFilterEventMap {
    [EquipmentFilter.EVENT_ON_ACTIVE]: CustomEvent<EquipmentFilter>;
    [EquipmentFilter.EVENT_ON_INACTIVE]: CustomEvent<EquipmentFilter>;
    [EquipmentFilter.EVENT_ON_UPDATE]: CustomEvent<EquipmentFilter>;
}
