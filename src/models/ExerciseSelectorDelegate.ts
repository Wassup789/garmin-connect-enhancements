import ExerciseOption from "./ExerciseOption";
import ExerciseGroup from "./ExerciseGroup";
import ExerciseSelector from "../components/ExerciseSelector";

export default abstract class ExerciseSelectorDelegate {
    static readonly INSTANCES: Set<ExerciseSelectorDelegate> = new Set();

    abstract readonly exerciseSelector: ExerciseSelector;
    abstract readonly suggestedGroup: ExerciseGroup;

    abstract onConnected(): void;
    abstract onDisconnected(): void;

    abstract generateOptions(): ExerciseOption[];

    protected abstract getInitialSavedOption(): ExerciseOption | null;
    abstract onSelectOption(option: ExerciseOption | null): boolean;

    protected constructor() {
        ExerciseSelectorDelegate.INSTANCES.add(this);
    }

    release() {
        ExerciseSelectorDelegate.INSTANCES.delete(this);
    }

    reset() {
        this.exerciseSelector.resetPopupInstance();
        this.exerciseSelector.savedOption = this.getInitialSavedOption();
    }
}
