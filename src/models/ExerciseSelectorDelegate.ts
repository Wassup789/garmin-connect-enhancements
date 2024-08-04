import ExerciseOption from "./ExerciseOption";
import ExerciseGroup from "./ExerciseGroup";
import ExerciseSelector from "../components/ExerciseSelector";

export default interface ExerciseSelectorDelegate {
    readonly exerciseSelector: ExerciseSelector;
    readonly suggestedGroup: ExerciseGroup;

    onConnected(): void;
    onDisconnected(): void;

    generateOptions(): ExerciseOption[];

    onSelectOption(option: ExerciseOption | null): boolean;
}
