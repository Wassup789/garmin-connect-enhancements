import FetchBaseInterceptor, { FetchArgs } from "../models/FetchBaseInterceptor";

type TranslationMap = Record<string, string>;

const exerciseEquipmentTranslations: TranslationMap = {},
    exerciseTypeTranslations: TranslationMap = {};

export const EXERCISE_EQUIPMENT_TRANSLATIONS: Readonly<TranslationMap> = exerciseEquipmentTranslations;
export const EXERCISE_TYPE_TRANSLATIONS: Readonly<TranslationMap> = exerciseTypeTranslations;

export class ExerciseTranslationInterceptor extends FetchBaseInterceptor {
    private static readonly EXERCISE_EQUIPMENT_URL_REGEX = /\/web-translations\/exercise_equipments\/exercise_equipments(_[^.]+)?\.properties/;
    private static readonly EXERCISE_TYPES_URL_REGEX = /\/web-translations\/exercise_types\/exercise_types(_[^.]+)?\.properties/;

    private wasEquipmentI18n: boolean = false;
    private wasTypesI18n: boolean = false;

    interceptFetch(url: string, args: FetchArgs, response: Response): Response | null {
        const baseUrl = this.parseAsRelativeUrlOrNull(url);
        if (!baseUrl) {
            return null;
        }

        let result;
        if ((result = ExerciseTranslationInterceptor.EXERCISE_EQUIPMENT_URL_REGEX.exec(baseUrl)) !== null) {
            if (!this.wasEquipmentI18n) {
                this.wasEquipmentI18n = Boolean(result[1]);

                this.interceptExerciseEquipmentTranslations(response);
            }
        } else if ((result = ExerciseTranslationInterceptor.EXERCISE_TYPES_URL_REGEX.exec(baseUrl)) !== null) {
            if (!this.wasTypesI18n) {
                this.wasTypesI18n = Boolean(result[1]);

                this.interceptExerciseTranslations(response);
            }
        }

        return null;
    }

    private async interceptExerciseEquipmentTranslations(response: Response) {
        const data = await response.text();

        this.parseWebTranslations(data, (key, value) => {
            exerciseEquipmentTranslations[key] = value;
        });
    }

    private async interceptExerciseTranslations(response: Response) {
        const data = await response.text();

        this.parseWebTranslations(data, (key, value) => {
            exerciseTypeTranslations[key] = value;
        });
    }

    private parseWebTranslations(input: string, callback: (key: string, value: string) => void) {
        const lineRegex = /^([^=]+)=(.+)$/gm;

        let result;
        while ((result = lineRegex.exec(input)) !== null) {
            if (result.index === lineRegex.lastIndex) {
                lineRegex.lastIndex++;
            }

            const [_, key, value] = result;
            callback(key, value);
        }
    }

    private parseAsRelativeUrlOrNull(url: string): string | null {
        let baseUrl = url;
        try {
            const parsedUrl = new URL(url, window.location.origin);

            if (parsedUrl.origin !== window.location.origin) {
                return null;
            }
            baseUrl = parsedUrl.pathname;
        } catch (e) {
            // do nothing
        }

        return baseUrl;
    }
}
