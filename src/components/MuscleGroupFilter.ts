import { customElement, property, query } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { MuscleGroupFilterValue } from "../models/MuscleGroupFilterValue";
import Helper from "../helpers/Helper";
import { TypedLitElement } from "../models/TypedEventTarget";
import CheckboxElement from "./CheckboxElement";

@customElement(MuscleGroupFilter.NAME)
export default class MuscleGroupFilter extends (LitElement as TypedLitElement<MuscleGroupFilter, MuscleGroupFilterEventMap>) {
    static readonly NAME = "muscle-group-filter";

    static readonly EVENT_ON_ACTIVE = "on-active";
    static readonly EVENT_ON_INACTIVE = "on-inactive";
    static readonly EVENT_ON_UPDATE = "on-update";
    static readonly EVENT_ON_PREVIEW_TOGGLE = "on-preview-toggle";

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

        .preview {
            margin-left: 0.25rem;
            font-size: 0.85em;
            cursor: pointer;
            user-select: none;
            color: var(--link-color);
        }
        .preview:hover {
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

    @query(".input-container checkbox-elem") input!: CheckboxElement;
    @query(".refined-container checkbox-elem:first-of-type") primaryInput!: CheckboxElement;
    @query(".refined-container checkbox-elem:last-of-type") secondaryInput!: CheckboxElement;

    protected render(): unknown {
        return html`
            <div class="input-container">
                <checkbox-elem
                        label=${Helper.toTitleCase(this.muscleGroup)} 
                        @on-input=${() => this.onInput()}></checkbox-elem>
                <span
                        class="preview" 
                        @mouseover=${() => this.onPreviewToggle(true)} 
                        @mouseout=${() => this.onPreviewToggle(false)}>?</span>
                <div class="flex-grow"></div>
                <div class="exclude-button" @click=${() => this.exclude()}>Exclude</div>
            </div>
            <div class="refined-container">
                <checkbox-elem
                        label="Primary Muscle"
                        @on-input=${() => this.onRefinedInput()}></checkbox-elem>
                <checkbox-elem
                        label="Secondary Muscle"
                        @on-input=${() => this.onRefinedInput()}></checkbox-elem>
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

    private onPreviewToggle(displayPreview: boolean) {
        this.dispatchEvent(new CustomEvent(MuscleGroupFilter.EVENT_ON_PREVIEW_TOGGLE, { detail: { filter: this, displayPreview: displayPreview } }));
    }
}

interface MuscleGroupFilterEventMap {
    [MuscleGroupFilter.EVENT_ON_ACTIVE]: CustomEvent<MuscleGroupFilter>;
    [MuscleGroupFilter.EVENT_ON_INACTIVE]: CustomEvent<MuscleGroupFilter>;
    [MuscleGroupFilter.EVENT_ON_UPDATE]: CustomEvent<MuscleGroupFilter>;
    [MuscleGroupFilter.EVENT_ON_PREVIEW_TOGGLE]: CustomEvent<{ filter: MuscleGroupFilter; displayPreview: boolean }>;
}
