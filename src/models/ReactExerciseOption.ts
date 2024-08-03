import ExerciseOption from "./ExerciseOption";
import { RawReactExerciseOption } from "./ReactModels";

export default class ReactExerciseOption extends ExerciseOption {
    constructor(obj: RawReactExerciseOption) {
        super(
            obj.exerciseKey,
            obj.categoryKey,
            obj.exerciseName,
            false
        );
    }

    static findExerciseOption(exerciseOptions: readonly ExerciseOption[], categoryKey: string, exerciseKey: string): ExerciseOption | null {
        return exerciseOptions.find((e) => e.value === exerciseKey && e.categoryValue === categoryKey) ?? null;
    }
}
