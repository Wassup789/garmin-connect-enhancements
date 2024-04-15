import XHRBaseInterceptor from "../models/XHRBaseInterceptor";

export const EXERCISE_MUSCLES: Set<string> = new Set();
export let EXERCISE_MUSCLE_MAPPINGS: ExerciseMuscleGroupsMap | null = null;
export const EXERCISE_MUSCLE_MAPPINGS_LISTENERS: Set<() => void> = new Set();

interface ExerciseMuscleGroupsMap {
    readonly categories: Record<string, ExerciseMuscleGroupsCategory>;
}
export interface ExerciseMuscleGroupsBase {
    readonly primaryMuscles: ReadonlySet<string>;
    readonly secondaryMuscles: ReadonlySet<string>;
    readonly isBodyWeight: boolean;
}

class ExerciseMuscleGroupCounterpartError extends Error {}

export class ExerciseMuscleGroupsCategory {
    readonly exercises: Record<string, ExerciseMuscleGroups>;
    readonly primaryMuscles?: ReadonlySet<string>;
    readonly secondaryMuscles?: ReadonlySet<string>;
    readonly isBodyWeight: false = false as const;

    constructor(obj: unknown) {
        if (!(typeof obj === "object" && obj !== null && "exercises" in obj && typeof obj.exercises === "object" && obj.exercises !== null && !Array.isArray(obj.exercises))) {
            throw new Error("Invalid object given");
        }

        if ("primaryMuscles" in obj && Array.isArray(obj.primaryMuscles) && "secondaryMuscles" in obj && Array.isArray(obj.secondaryMuscles)) {
            this.primaryMuscles = ExerciseMuscleGroups.convertMusclesToSet(obj.primaryMuscles);
            this.secondaryMuscles = ExerciseMuscleGroups.convertMusclesToSet(obj.secondaryMuscles);
        }

        const exercises: Record<string, ExerciseMuscleGroups> = {},
            exerciseKeys = Object.keys(obj.exercises);
        for (const exerciseKey of exerciseKeys) {
            try {
                const exerciseObj = (obj.exercises as Record<string, unknown>)[exerciseKey],
                    exerciseInstance = new ExerciseMuscleGroups(exerciseKey, exerciseObj);
                exercises[exerciseKey] = exerciseInstance;

                try {
                    const counterpartInstance = ExerciseMuscleGroups.createCounterpart(exerciseObj, exerciseInstance);

                    exercises[counterpartInstance.key] = counterpartInstance;
                } catch (e) {
                    if (!(e instanceof ExerciseMuscleGroupCounterpartError)) {
                        console.warn(e);
                    }
                    // do nothing; unable to create counterpart
                }
            } catch (e) {
                console.warn(e);
                // do nothing; unable to create exercise
            }
        }

        this.exercises = exercises;
    }
}

export class ExerciseMuscleGroups implements ExerciseMuscleGroupsBase {
    readonly key: string;
    readonly primaryMuscles: ReadonlySet<string>;
    readonly secondaryMuscles: ReadonlySet<string>;
    readonly isBodyWeight: boolean;

    private _counterpart: ExerciseMuscleGroups | null = null;
    get counterpart(): ExerciseMuscleGroups | null {
        return this._counterpart;
    }
    private set counterpart(value: ExerciseMuscleGroups | null) {
        this._counterpart = value;
    }

    static convertMusclesToSet(muscles: unknown[]): Set<string> {
        return new Set(muscles.filter((e) => {
            const isValid = typeof e === "string" && e;

            if (isValid) {
                EXERCISE_MUSCLES.add(e);
            }

            return isValid;
        })) as Set<string>;
    }

    static createCounterpart(exerciseObj: unknown, originalInstance: ExerciseMuscleGroups): ExerciseMuscleGroups {
        if (typeof exerciseObj === "object" && exerciseObj !== null && "counterpart" in exerciseObj && typeof exerciseObj.counterpart === "string" && exerciseObj.counterpart) {
            const counterpartKey = exerciseObj.counterpart,
                counterpartObj = Object.assign({}, exerciseObj, {
                    isBodyWeight: !("isBodyWeight" in exerciseObj && exerciseObj.isBodyWeight === true),
                }),
                counterpartInstance = new ExerciseMuscleGroups(counterpartKey, counterpartObj);

            counterpartInstance.counterpart = originalInstance;
            originalInstance.counterpart = counterpartInstance;

            return counterpartInstance;
        } else {
            throw new ExerciseMuscleGroupCounterpartError("Does not have a counterpart exercise");
        }
    }

    constructor(key: string, obj: unknown) {
        if (!(typeof obj === "object" && obj !== null && "primaryMuscles" in obj && Array.isArray(obj.primaryMuscles) && "secondaryMuscles" in obj && Array.isArray(obj.secondaryMuscles))) {
            throw new Error("Invalid object given");
        }

        this.key = key;
        this.primaryMuscles = ExerciseMuscleGroups.convertMusclesToSet(obj.primaryMuscles);
        this.secondaryMuscles = ExerciseMuscleGroups.convertMusclesToSet(obj.secondaryMuscles);

        this.isBodyWeight = "isBodyWeight" in obj && typeof obj.isBodyWeight === "boolean" && obj.isBodyWeight;
    }
}

export function isExerciseMuscleGroupsBase(obj: unknown): obj is ExerciseMuscleGroupsBase {
    return typeof obj === "object" && !Array.isArray(obj) && obj !== null &&
        "primaryMuscles" in obj && obj.primaryMuscles instanceof Set &&
        "secondaryMuscles" in obj && obj.secondaryMuscles instanceof Set &&
        "isBodyWeight" in obj && typeof obj.isBodyWeight === "boolean";
}

export class ExerciseResponseInterceptor implements XHRBaseInterceptor {
    interceptSend(xhr: XMLHttpRequest, url: string, sendArgs: IArguments): IArguments | null {
        if (url.startsWith("/web-data/exercises/Exercises.json")) {
            xhr.addEventListener("load", () => {
                parseExercisesResponse(xhr.responseText);
            });
        }

        return null;
    }
}

function parseExercisesResponse(exercisesText: string) {
    try {
        const exercises = JSON.parse(exercisesText);

        if (!(typeof exercises === "object" && !Array.isArray(exercises) && "categories" in exercises && typeof exercises.categories === "object" && !Array.isArray(exercises.categories))) {
            return;
        }

        const out: ExerciseMuscleGroupsMap = { categories: {} };

        for (const exerciseCategoryKey of Object.keys(exercises.categories)) {
            const exerciseCategory = exercises.categories[exerciseCategoryKey];

            try {
                out.categories[exerciseCategoryKey] = new ExerciseMuscleGroupsCategory(exerciseCategory);
            } catch (e) {
                console.warn(e);
                // do nothing; unable to create category
            }
        }

        EXERCISE_MUSCLE_MAPPINGS = out;

        EXERCISE_MUSCLE_MAPPINGS_LISTENERS.forEach((e) => e());
        EXERCISE_MUSCLE_MAPPINGS_LISTENERS.clear();
    } catch (e) {
        // do nothing
    }
}
