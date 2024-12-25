import { EXERCISE_TYPE_TRANSLATIONS } from "../interceptors/ExerciseTranslationInterceptor";

export class I18n {
    public static getExerciseTranslation<T = null>(value: string, defaultValue: T = null as T): string | T {
        return EXERCISE_TYPE_TRANSLATIONS[value] || defaultValue;
    }

    public static getExerciseTranslationWithExercisePair<T = null>(value: string, categoryValue: string, defaultValue: T = null as T): string | T {
        return EXERCISE_TYPE_TRANSLATIONS[`${categoryValue}_${value}`] || defaultValue;
    }
}
