import ExerciseSelector from "../components/ExerciseSelector";
import ExerciseGroup from "./ExerciseGroup";
import ExerciseOption from "./ExerciseOption";
import ExerciseSelectorDelegate from "./ExerciseSelectorDelegate";
import ReactExerciseOption from "./ReactExerciseOption";
import {
    isRawReactExerciseOption,
    isRawReactExercisePickerProps,
    RawReactExerciseOption,
    RawReactExercisePickerProps
} from "./ReactModels";

export default class ExerciseSelectorReactDelegate implements ExerciseSelectorDelegate {
    readonly exerciseSelector: ExerciseSelector;
    readonly suggestedGroup: ExerciseGroup;
    readonly reactProps: RawReactExercisePickerProps;

    private connectErrorListener?: () => void;
    private disconnectErrorListener?: () => void;

    constructor(reactProps: Record<string, unknown>, readonly container: HTMLElement) {
        if (!isRawReactExercisePickerProps(reactProps)) {
            throw new Error("Invalid react props given, missing required keys");
        }
        this.reactProps = reactProps;

        this.exerciseSelector = new ExerciseSelector(this, ExerciseSelectorReactDelegate.getType(reactProps), false, container);
        this.exerciseSelector.savedOption = this.getInitialSavedOption();
        this.suggestedGroup = new ExerciseGroup("Suggested");

        this.initErrorHandler();
    }

    private initErrorHandler() {
        const inputWrapperElem = this.container.closest("[class^='GarminInputWrapper_garminInputWrapper']");
        if (inputWrapperElem) {
            const onChildUpdate = () => {
                    const hasValidationError = Boolean(inputWrapperElem.querySelector("[class^='GarminInputWrapper_validationError']"));
                    this.exerciseSelector.onError(hasValidationError);
                },
                observer = new MutationObserver(onChildUpdate);

            this.connectErrorListener = () => {
                observer.observe(inputWrapperElem, { childList: true });
                onChildUpdate();
            };
            this.disconnectErrorListener = () => observer.disconnect();

            onChildUpdate();
        }
    }

    private static getType(reactProps: Record<string, unknown>): string {
        return `${"exerciseType" in reactProps ? reactProps.exerciseType : ""}:${(reactProps.flattenedExerciseTypes as Array<unknown>).length}`;
    }

    private getInitialSavedOption(): ExerciseOption | null {
        const reactProps = this.reactProps;
        if (
            "categoryKey" in reactProps && typeof reactProps.categoryKey === "string" &&
            "exerciseKey" in reactProps && typeof reactProps.exerciseKey === "string"
        ) {
            const exerciseOption = ReactExerciseOption.findExerciseOption(this.exerciseSelector.popupInstance.allOptions, reactProps.categoryKey, reactProps.exerciseKey);
            if (!exerciseOption) {
                console.warn("Failed to find the option instance for", this.reactProps);
            }

            return exerciseOption;
        }

        return null;
    }

    onConnected(): void {
        this.hideGarminElements();
        this.connectErrorListener?.();
    }

    onDisconnected(): void {
        this.disconnectErrorListener?.();
    }

    private hideGarminElements() {
        this.container.setAttribute("style", "opacity: 0;pointer-events: none;height: 0px;position: relative;max-width: none;width: 100%;display: block;");
    }

    generateOptions(): ExerciseOption[] {
        return (this.reactProps.flattenedExerciseTypes as RawReactExerciseOption[])
            .filter((e) => isRawReactExerciseOption(e))
            .map((e) => {
                return new ReactExerciseOption(e);
            });
    }

    onSelectOption(option: ExerciseOption | null): boolean {
        if (option) {
            this.reactProps.onChange({ categoryKey: option.categoryValue, exerciseKey: option.value });

            return true;
        }

        return false;
    }
}
