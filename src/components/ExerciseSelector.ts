import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import ExerciseOption from "../models/ExerciseOption";
import ExerciseSelectorPopup from "./ExerciseSelectorPopup";
import ExerciseGroup from "../models/ExerciseGroup";

@customElement(ExerciseSelector.NAME)
export default class ExerciseSelector extends LitElement {
    static readonly NAME = "exercise-selector";

    static readonly INSTANCES: Set<ExerciseSelector> = new Set();

    static styles = css`
        * {
            box-sizing: border-box;
        }

        :host {
            position: relative;
            --width: 100%;
            --link-color: #1976d2;
        }

        :host(:not([active])) :is(.options-container, .filters-container, input),
        :host([active]) .pseudo-select {
            display: none;
        }

        .pseudo-select {
            padding: 5px 25px 5px 5px;
            width: var(--width);
            border: 1px solid #aaaaaa;
            border-radius: 5px;
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

    readonly parentSelectElem: HTMLSelectElement;
    readonly suggestedGroup: ExerciseGroup;

    readonly type: string;

    readonly popupInstance: ExerciseSelectorPopup;

    @property()
    savedOption: ExerciseOption | null = null;

    connectErrorListener!: () => void;
    disconnectErrorListener!: () => void;

    constructor(readonly parentElem: HTMLElement) {
        super();

        this.parentSelectElem = parentElem.querySelector("select.chosen-select")!;
        this.suggestedGroup = this.generateSuggestedGroup();
        this.type = ExerciseSelector.getType(this);
        this.popupInstance = ExerciseSelectorPopup.getInstanceForSelector(this);

        this.findSavedOption();
        this.setupErrorListener();
    }

    private static getType(selector: ExerciseSelector) {
        const option = selector.parentSelectElem.querySelector("optgroup:last-child > option:last-child") as HTMLOptionElement;

        return option.innerText;
    }

    private generateSuggestedGroup(): ExerciseGroup {
        const options = (Array.from(this.parentSelectElem.querySelectorAll("optgroup[label=\"Suggested\"] option")) as HTMLOptionElement[])
            .map((e) => new ExerciseOption(e))
            .sort((a, b) => a.textCleaned.localeCompare(b.textCleaned));

        return new ExerciseGroup("Suggested", options);
    }

    findSavedOption() {
        const option = this.parentSelectElem.selectedOptions[0] ?? null;
        if (!option) {
            return;
        }

        const exerciseOption = ExerciseOption.findExerciseOptionFromOptionElement(this.popupInstance.allOptions, option);

        if (exerciseOption) {
            this.savedOption = exerciseOption;
        } else {
            console.warn("Failed to find the option instance for", option);
        }
    }

    setupErrorListener() {
        const errorElem = this.parentElem.querySelector(".chosen-single")!;

        const observer = new MutationObserver(() => {
            this.onError(errorElem.classList.contains("error-tooltip-active"));
        });

        this.connectErrorListener = () => observer.observe(errorElem, { attributes: true, attributeFilter: ["class"] });
        this.disconnectErrorListener = () => observer.disconnect();
    }

    protected render(): unknown {
        return html`
            <div class="pseudo-select" @click=${() => this.onPseudoClick()}>
                ${(this.savedOption ? this.savedOption.text : "") || ExerciseSelectorPopup.EMPTY_EXERCISE_NAME}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        this.connectErrorListener?.();

        this.hideGarminElements();

        ExerciseSelector.INSTANCES.add(this);
    }

    hideGarminElements() {
        this.parentElem.querySelector(".chosen-container.chosen-container-single")!.setAttribute("style", "opacity: 0;pointer-events: none;height: 0px;position: relative;max-width: none;width: 100%;display: block;");
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.disconnectErrorListener?.();

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

    onSelectOption(option: ExerciseOption) {
        const optionElem = option.findOptionFromSelectElement(this.parentSelectElem);

        if (optionElem) {
            this.parentSelectElem.selectedIndex = optionElem.index;
            this.parentSelectElem.dispatchEvent(new Event("change"));

            this.savedOption = option;
        } else {
            console.warn("Failed to find the option element for", option);
        }
    }
}
