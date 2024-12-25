import XHRBaseInterceptor from "../models/XHRBaseInterceptor";

export const EXERCISE_EQUIPMENTS: Set<string> = new Set();
export let EXERCISE_EQUIPMENT_MAPPINGS: ExerciseEquipmentsMap | null = null;
export const EXERCISE_EQUIPMENTS_LISTENERS: Set<() => void> = new Set();

interface ExerciseEquipmentsMap {
    readonly categories: Record<string, ExerciseEquipmentsCategory>;
}

export class ExerciseEquipmentsCategory {
    readonly exercises: Record<string, ReadonlySet<string>>;

    constructor(obj: unknown) {
        if (!(typeof obj === "object" && obj !== null &&
            "exerciseCategoryKey" in obj && typeof obj.exerciseCategoryKey === "string" && obj.exerciseCategoryKey &&
            "exercisesInCategory" in obj && typeof obj.exercisesInCategory === "object" && obj.exercisesInCategory !== null && Array.isArray(obj.exercisesInCategory))) {
            throw new Error("Invalid object given");
        }

        const exercises: Record<string, ReadonlySet<string>> = {};
        for (const exercise of obj.exercisesInCategory) {
            try {
                const exerciseInstance = new ExerciseEquipmentsExercise(exercise);

                exercises[exerciseInstance.key] = exerciseInstance.equipments;
            } catch (e) {
                console.warn(e);
                // do nothing; unable to create exercise
            }
        }

        this.exercises = exercises;
    }
}

export class ExerciseEquipmentsExercise {
    readonly key: string;
    readonly equipments: ReadonlySet<string>;

    constructor(obj: unknown) {
        if (!(typeof obj === "object" && obj !== null &&
            "exerciseKey" in obj && typeof obj.exerciseKey === "string" && obj.exerciseKey &&
            "equipmentKeys" in obj && typeof obj.equipmentKeys === "object" && obj.equipmentKeys !== null && Array.isArray(obj.equipmentKeys))) {
            throw new Error("Invalid object given");
        }

        this.key = obj.exerciseKey;
        this.equipments = ExerciseEquipmentsExercise.convertEquipmentsToSet(obj.equipmentKeys);
    }

    static convertEquipmentsToSet(equipments: unknown[]): Set<string> {
        return new Set(equipments.filter((e) => {
            const isValid = typeof e === "string" && e;

            if (isValid) {
                EXERCISE_EQUIPMENTS.add(e);
            }

            return isValid;
        })) as Set<string>;
    }
}

export class ExerciseEquipmentResponseInterceptor implements XHRBaseInterceptor {
    interceptSend(xhr: XMLHttpRequest, url: string, sendArgs: IArguments): IArguments | null {
        if (url.startsWith("/web-data/exercises/exerciseToEquipments.json")) {
            xhr.addEventListener("load", () => {
                parseExercisesResponse(xhr.responseText);
            });
        }

        return null;
    }
}
function parseExercisesResponse(exercisesText: string) {
    try {
        const data = JSON.parse(exercisesText);

        if (!(typeof data === "object" && Array.isArray(data))) {
            return;
        }

        const out: ExerciseEquipmentsMap = { categories: {} };

        for (const exerciseCategory of data) {
            try {
                const category = new ExerciseEquipmentsCategory(exerciseCategory);
                out.categories[exerciseCategory.exerciseCategoryKey] = category;
            } catch (e) {
                console.warn(e);
                // do nothing; unable to create category
            }
        }

        EXERCISE_EQUIPMENT_MAPPINGS = out;

        EXERCISE_EQUIPMENTS_LISTENERS.forEach((e) => e());
        EXERCISE_EQUIPMENTS_LISTENERS.clear();
    } catch (e) {
        // do nothing
    }
}
