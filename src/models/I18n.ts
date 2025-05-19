import {
    EXERCISE_EQUIPMENT_TRANSLATIONS,
    EXERCISE_TYPE_TRANSLATIONS
} from "../interceptors/ExerciseTranslationInterceptor";

export class I18n {
    private static isExerciseTranslationReady: boolean = false;
    private static exerciseTranslationReadyListeners: Array<() => void> = [];

    public static addOnExerciseTranslationReady(callback: () => void) {
        if (!this.isExerciseTranslationReady) {
            this.exerciseTranslationReadyListeners.push(callback);
        }
    }

    public static onExerciseTranslationReady() {
        this.isExerciseTranslationReady = true;

        for (const listener of this.exerciseTranslationReadyListeners) {
            listener();
        }

        this.exerciseTranslationReadyListeners = [];
    }

    public static getExerciseTranslation<T = null>(value: string, defaultValue: T = null as T): string | T {
        return EXERCISE_TYPE_TRANSLATIONS[value] || defaultValue;
    }

    public static getExerciseTranslationWithExercisePair<T = null>(value: string, categoryValue: string, defaultValue: T = null as T): string | T {
        return EXERCISE_TYPE_TRANSLATIONS[`${categoryValue}_${value}`] || defaultValue;
    }

    public static getEquipmentTranslation<T = null>(value: string, defaultValue: T = null as T): string | T {
        return EXERCISE_EQUIPMENT_TRANSLATIONS[value] || defaultValue;
    }
}
