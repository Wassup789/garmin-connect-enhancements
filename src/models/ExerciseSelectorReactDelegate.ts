import ExerciseSelector from "../components/ExerciseSelector";
import ExerciseGroup from "./ExerciseGroup";
import ExerciseOption from "./ExerciseOption";
import ExerciseSelectorDelegate from "./ExerciseSelectorDelegate";
import ReactExerciseOption from "./ReactExerciseOption";
import {
    isRawReactExerciseOption, isRawReactExercisePickerExercisesProps,
    isRawReactExercisePickerProps,
    RawReactExerciseOption, RawReactExercisePickerExercisesProps,
    RawReactExercisePickerProps
} from "./ReactModels";

export default class ExerciseSelectorReactDelegate implements ExerciseSelectorDelegate {
    readonly exerciseSelector: ExerciseSelector;
    readonly suggestedGroup: ExerciseGroup;
    readonly stateProps: RawReactExercisePickerProps;
    readonly exercisesProps: RawReactExercisePickerExercisesProps;

    private connectErrorListener?: () => void;
    private disconnectErrorListener?: () => void;

    constructor(reactStateProps: Record<string, unknown>, reactExercisesProps: Record<string, unknown>, readonly container: HTMLElement) {
        if (!isRawReactExercisePickerProps(reactStateProps)) {
            throw new Error("Invalid react state props given, missing required keys");
        }
        if (!isRawReactExercisePickerExercisesProps(reactExercisesProps)) {
            throw new Error("Invalid react exercises props given, missing required keys");
        }
        this.stateProps = reactStateProps;
        this.exercisesProps = reactExercisesProps;

        this.exerciseSelector = new ExerciseSelector(this, ExerciseSelectorReactDelegate.getType(reactStateProps, reactExercisesProps), false, container);
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

    private static getType(reactProps: RawReactExercisePickerProps, reactExercisesProps: RawReactExercisePickerExercisesProps): string {
        return `${"exerciseType" in reactProps ? reactProps.exerciseType : ""}:${(reactExercisesProps.flattenedExerciseTypes as Array<unknown>).length}`;
    }

    private getInitialSavedOption(): ExerciseOption | null {
        const reactProps = this.stateProps;
        if (
            "categoryKey" in reactProps && typeof reactProps.categoryKey === "string" &&
            "exerciseKey" in reactProps && typeof reactProps.exerciseKey === "string"
        ) {
            const exerciseOption = ReactExerciseOption.findExerciseOption(this.exerciseSelector.popupInstance.allOptions, reactProps.categoryKey, reactProps.exerciseKey);
            if (!exerciseOption) {
                console.warn("Failed to find the option instance for", this.stateProps);
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
        return (this.exercisesProps.flattenedExerciseTypes as RawReactExerciseOption[])
            .filter((e) => isRawReactExerciseOption(e))
            .map((e) => {
                return new ReactExerciseOption(e);
            });
    }

    onSelectOption(option: ExerciseOption | null): boolean {
        if (option) {
            this.stateProps.onChange({ categoryKey: option.categoryValue, exerciseKey: option.value });

            return true;
        }

        return false;
    }
}
