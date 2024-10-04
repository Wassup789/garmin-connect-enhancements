export interface RawReactExerciseOption {
    categoryKey: string;
    exerciseKey: string;
    exerciseName: string;
}

export function isRawReactExerciseOption(obj: unknown): obj is RawReactExerciseOption {
    return Boolean(
        typeof obj === "object" && obj && !Array.isArray(obj) &&
        "categoryKey" in obj && typeof obj.categoryKey === "string" &&
        "exerciseKey" in obj && typeof obj.exerciseKey === "string" &&
        "exerciseName" in obj && typeof obj.exerciseName === "string"
    );
}

export interface RawReactExercisePickerProps {
    categoryKey: string;
    exerciseKey: string;
    onChange: ((changed: { categoryKey: string; exerciseKey: string }) => void);
}

export function isRawReactExercisePickerProps(obj: unknown): obj is RawReactExercisePickerProps {
    return Boolean(
        typeof obj === "object" && obj && !Array.isArray(obj) &&
        "onChange" in obj && typeof obj.onChange === "function"
    );
}

export interface RawReactExercisePickerExercisesProps {
    flattenedExerciseTypes: Array<RawReactExerciseOption>;
}

export function isRawReactExercisePickerExercisesProps(obj: unknown): obj is RawReactExercisePickerExercisesProps {
    return Boolean(
        typeof obj === "object" && obj && !Array.isArray(obj) &&
        "flattenedExerciseTypes" in obj && Array.isArray(obj.flattenedExerciseTypes)
    );
}
