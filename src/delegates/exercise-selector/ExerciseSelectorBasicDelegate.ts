import ExerciseSelector from "../../components/ExerciseSelector";
import ExerciseOption from "../../models/ExerciseOption";
import ExerciseSelectorDelegate from "./ExerciseSelectorDelegate";
import ExerciseGroup from "../../models/ExerciseGroup";
import ExerciseSelectorPopup from "../../components/ExerciseSelectorPopup";
import BasicExerciseOption from "../../models/BasicExerciseOption";

export default class ExerciseSelectorBasicDelegate extends ExerciseSelectorDelegate {
    readonly parentSelectElem: HTMLSelectElement;
    readonly exerciseSelector: ExerciseSelector;

    readonly suggestedGroup: ExerciseGroup;

    private connectErrorListener!: () => void;
    private disconnectErrorListener!: () => void;

    constructor(readonly container: HTMLElement) {
        super();

        this.parentSelectElem = container.querySelector("select.chosen-select")!;
        this.suggestedGroup = this.generateSuggestedGroup();

        const type = (this.parentSelectElem.querySelector("optgroup:last-child > option:last-child") as HTMLOptionElement).innerText,
            canApplyToMultipleSets = !this.parentSelectElem.matches(".workout-step-exercises");

        this.exerciseSelector = new ExerciseSelector(this, type, canApplyToMultipleSets, container);
        this.exerciseSelector.savedOption = this.getInitialSavedOption();

        this.initErrorHandler();
    }

    private initErrorHandler() {
        const errorElem = this.container.querySelector(".chosen-single")!;

        const observer = new MutationObserver(() => {
            this.exerciseSelector.onError(errorElem.classList.contains("error-tooltip-active"));
        });

        this.connectErrorListener = () => observer.observe(errorElem, { attributes: true, attributeFilter: ["class"] });
        this.disconnectErrorListener = () => observer.disconnect();
    }

    protected getInitialSavedOption(): ExerciseOption | null {
        const option = this.parentSelectElem.selectedOptions[0] ?? null;
        if (!option) {
            return null;
        }

        const exerciseOption = BasicExerciseOption.findExerciseOption(this.exerciseSelector.popupInstance.allOptions, option);
        if (!exerciseOption) {
            console.warn("Failed to find the option instance for", option);
        }

        return exerciseOption;
    }

    onConnected() {
        this.connectErrorListener?.();
        this.hideGarminElements();
    }

    onDisconnected() {
        this.disconnectErrorListener?.();
    }

    private hideGarminElements() {
        this.container.querySelector(".chosen-container.chosen-container-single")!.setAttribute("style", "opacity: 0;pointer-events: none;height: 0px;position: relative;max-width: none;width: 100%;display: block;");
    }

    private generateSuggestedGroup(): ExerciseGroup {
        const options = (Array.from(this.parentSelectElem.querySelectorAll("optgroup[label=\"Suggested\"] option")) as HTMLOptionElement[])
            .map((e) => new BasicExerciseOption(e))
            .sort((a, b) => a.textCleaned.localeCompare(b.textCleaned));

        return new ExerciseGroup("Suggested", options);
    }

    generateOptions(): ExerciseOption[] {
        const usedKeys: Record<string, true> = {};

        return Array.from(this.parentSelectElem.querySelectorAll("option"))
            .filter((e) => !e.parentElement!.matches("[label='Suggested']"))
            .map((e) => {
                return new BasicExerciseOption(e);
            })
            .filter((item) => {
                const key = item.categoryValue + "~~~" + item.value;
                return (item.value === ExerciseSelectorPopup.EMPTY_EXERCISE_VALUE || Object.prototype.hasOwnProperty.call(usedKeys, key)) ? false : (usedKeys[key] = true);
            });
    }

    onSelectOption(option: ExerciseOption | null): boolean {
        const optionElemIndex = !option ? -1 : option.findOptionFromSelectElement(this.parentSelectElem)?.index;

        if (optionElemIndex !== undefined) {
            this.parentSelectElem.selectedIndex = optionElemIndex;
            this.parentSelectElem.dispatchEvent(new Event("change"));

            return true;
        } else {
            console.warn("Failed to find the option element for", option);

            return false;
        }
    }
}
