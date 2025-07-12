import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import ExerciseOption from "../models/ExerciseOption";
import ExerciseSelectorPopup from "./ExerciseSelectorPopup";
import ExerciseGroup from "../models/ExerciseGroup";
import { TypedLitElement } from "../models/TypedEventTarget";
import ExerciseSelectorDelegate from "../delegates/exercise-selector/ExerciseSelectorDelegate";

@customElement(ExerciseSelector.NAME)
export default class ExerciseSelector extends (LitElement as TypedLitElement<ExerciseSelector, ExerciseSelectorEventMap>) {
    static readonly NAME = "exercise-selector";

    static readonly INSTANCES: Set<ExerciseSelector> = new Set();

    static readonly EVENT_ON_DISCONNECT = "on-disconnect";

    static readonly CLOSEST_DIALOG_SELECTOR = "[class^=\"Dialog\"]";

    static styles = css`
        * {
            box-sizing: border-box;
        }

        :host {
            position: relative;
            display: block;
            --width: 100%;
            --min-popup-width: 15rem;
            --link-color: #1976d2;
            --border-radius: 5px;
        }

        :host(:not([active])) :is(.options-container, .filters-container, input),
        :host([active]) .pseudo-select {
            display: none;
        }

        .pseudo-select {
            padding: 5px 25px 5px 5px;
            width: var(--width);
            border: 1px solid #aaaaaa;
            border-radius: var(--border-radius);
            user-select: none;
            box-sizing: border-box;
            position: relative;
            cursor: pointer;
            color: #535353;
        }

        :host([error="true"]) .pseudo-select {
            border-color: #E02C2C;
            color: #E02C2C;
        }

        .pseudo-select:after {
            content: "\\25bc";
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0.5rem;
            font-size: 0.65rem;
            display: inline-flex;
            align-items: center;
        }
    `;

    get suggestedGroup(): ExerciseGroup {
        return this.delegate.suggestedGroup;
    }

    readonly canApplyToMultipleSets: boolean;
    readonly type: string;
    private readonly delegate: ExerciseSelectorDelegate;

    private _popupInstance: ExerciseSelectorPopup;
    get popupInstance(): ExerciseSelectorPopup {
        return this._popupInstance;
    }
    private set popupInstance(value: ExerciseSelectorPopup) {
        this._popupInstance = value;
    }

    @property()
    savedOption: ExerciseOption | null = null;

    constructor(
        delegate: ExerciseSelectorDelegate,
        type: string,
        canApplyToMultipleSets: boolean,
        readonly parentElem: HTMLElement
    ) {
        super();

        this.canApplyToMultipleSets = canApplyToMultipleSets;
        this.type = type;
        this.delegate = delegate;

        this._popupInstance = ExerciseSelectorPopup.getInstanceForSelector(this);
    }

    resetPopupInstance() {
        this.popupInstance = ExerciseSelectorPopup.getInstanceForSelector(this);
    }

    protected render(): unknown {
        return html`
            <div class="pseudo-select" @click=${() => this.onPseudoClick()}>
                ${(this.savedOption ? this.savedOption.text : "") || ExerciseSelectorPopup.EMPTY_EXERCISE_NAME.value}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        this.delegate.onConnected();

        ExerciseSelector.INSTANCES.add(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.delegate.onDisconnected();
        this.dispatchEvent(new CustomEvent(ExerciseSelector.EVENT_ON_DISCONNECT));

        ExerciseSelector.INSTANCES.delete(this);
    }

    onPseudoClick = async () => {
        await this.popupInstance.activate(this);
    };

    onError = (isError: boolean) => {
        this.setAttribute("error", `${isError}`);
    };

    onInactive() {

    }

    onSelectOption(option: ExerciseOption | null) {
        if (this.delegate.onSelectOption(option)) {
            this.savedOption = option;
        }
    }

    generateOptions(): ExerciseOption[] {
        return this.delegate.generateOptions()
            .sort((a, b) => {
                return (Number(b.suggested) - Number(a.suggested)) || a.textCleaned.localeCompare(b.textCleaned);
            });
    }
}

interface ExerciseSelectorEventMap {
    [ExerciseSelector.EVENT_ON_DISCONNECT]: CustomEvent;
}
