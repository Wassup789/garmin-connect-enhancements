import { customElement, property, query } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { MuscleGroupFilterValue } from "../models/MuscleGroupFilterValue";
import Helper from "../helpers/Helper";
import { TypedLitElement } from "../models/TypedEventTarget";

@customElement(MuscleGroupFilter.NAME)
export default class MuscleGroupFilter extends (LitElement as TypedLitElement<MuscleGroupFilter, MuscleGroupFilterEventMap>) {
    static readonly NAME = "muscle-group-filter";

    static readonly EVENT_ON_ACTIVE = "on-active";
    static readonly EVENT_ON_INACTIVE = "on-inactive";
    static readonly EVENT_ON_UPDATE = "on-update";

    static styles = css`
        .input-container {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        :host(:not([active="true"])) .refined-container,
        :host([value="4"]) .exclude-button {
            display: none;
        }
        .refined-container {
            display: grid;
            grid-template-columns: auto 1fr;
            margin-left: 15px;
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

    @property({ attribute: "value", reflect: true })
    private _value: MuscleGroupFilterValue = MuscleGroupFilterValue.INACTIVE;
    get value(): MuscleGroupFilterValue {
        return this._value;
    }

    @property()
    muscleGroup: string = "";

    @property({ reflect: true })
    active: boolean = false;

    @query(".input-container input") input!: HTMLInputElement;
    @query(".refined-container input:first-of-type") primaryInput!: HTMLInputElement;
    @query(".refined-container input:last-of-type") secondaryInput!: HTMLInputElement;

    protected render(): unknown {
        return html`
            <div class="input-container">
                <input
                        type="checkbox"
                        id=${this.muscleGroup}
                        @focus=${Helper.inputUnfocusHandler}
                        @input=${() => this.onInput()}>
                <label for=${this.muscleGroup}>${Helper.toTitleCase(this.muscleGroup)}</label>
                <div class="flex-grow"></div>
                <div class="exclude-button" @click=${() => this.exclude()}>Exclude</div>
            </div>
            <div class="refined-container">
                <input
                        type="checkbox"
                        id="${this.muscleGroup}-primary"
                        @focus=${Helper.inputUnfocusHandler}
                        @input=${() => this.onRefinedInput()}>
                <label for="${this.muscleGroup}-primary">Primary Muscle</label>
                
                <input
                        type="checkbox"
                        id="${this.muscleGroup}-secondary"
                        @focus=${Helper.inputUnfocusHandler}
                        @input=${() => this.onRefinedInput()}>
                <label for="${this.muscleGroup}-secondary">Secondary Muscle</label>
            </div>
        `;
    }

    onInput(skipUpdate: boolean = false) {
        this.active = this.input.checked;

        if (this.input.checked) {
            this.primaryInput.checked = true;
            this.secondaryInput.checked = true;

            this._value = MuscleGroupFilterValue.ALL;
            this.dispatchEvent(new CustomEvent(MuscleGroupFilter.EVENT_ON_ACTIVE, { detail: this }));
        } else {
            this._value = MuscleGroupFilterValue.INACTIVE;
            this.dispatchEvent(new CustomEvent(MuscleGroupFilter.EVENT_ON_INACTIVE, { detail: this }));
        }

        if (!skipUpdate) {
            this.internalOnUpdate();
        }
    }

    private onRefinedInput(skipUpdate: boolean = false) {
        if (!this.primaryInput.checked && !this.secondaryInput.checked) {
            this._value = MuscleGroupFilterValue.EXCLUDE;
        } else {
            this._value = (this.primaryInput.checked && this.secondaryInput.checked) ? MuscleGroupFilterValue.ALL : (this.primaryInput.checked ? MuscleGroupFilterValue.PRIMARY : MuscleGroupFilterValue.SECONDARY);
        }

        if (!skipUpdate) {
            this.internalOnUpdate();
        }
    }

    private internalOnUpdate() {
        this.dispatchEvent(new CustomEvent(MuscleGroupFilter.EVENT_ON_UPDATE, { detail: this }));
    }

    exclude(skipUpdate: boolean = false) {
        this.input.checked = true;
        this.onInput(true);
        this.primaryInput.checked = false;
        this.secondaryInput.checked = false;
        this.onRefinedInput(skipUpdate);
    }
}

interface MuscleGroupFilterEventMap {
    [MuscleGroupFilter.EVENT_ON_ACTIVE]: CustomEvent<MuscleGroupFilter>;
    [MuscleGroupFilter.EVENT_ON_INACTIVE]: CustomEvent<MuscleGroupFilter>;
    [MuscleGroupFilter.EVENT_ON_UPDATE]: CustomEvent<MuscleGroupFilter>;
}
