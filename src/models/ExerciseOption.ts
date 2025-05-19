import {
    EXERCISE_MUSCLE_MAPPINGS,
    ExerciseMuscleGroupsBase,
    isExerciseMuscleGroupsBase
} from "../interceptors/ExerciseResponseInterceptor";
import { MuscleGroupFilterValue } from "./MuscleGroupFilterValue";
import MuscleGroupFilter from "../components/MuscleGroupFilter";
import ExerciseSelectorOption from "../components/ExerciseSelectorOption";
import SearchHelper from "../helpers/SearchHelper";
import FavoritesService from "../services/FavoritesService";
import { I18n } from "./I18n";
import EquipmentFilter from "../components/EquipmentFilter";
import { EXERCISE_EQUIPMENT_MAPPINGS, EXERCISE_EQUIPMENTS } from "../interceptors/ExerciseEquipmentResponseInterceptor";

export default class ExerciseOption {
    readonly value: string;
    readonly categoryValue: string;
    readonly text: string;
    readonly textCleaned: string;

    favorited: boolean;

    elem!: ExerciseSelectorOption;

    private _visible: boolean = true;
    get visible(): boolean {
        return this._visible;
    }
    set visible(value: boolean) {
        this._visible = value;
        this.elem.visible = value;
    }

    private _filterVisible: boolean = true;
    get filterVisible(): boolean {
        return this._filterVisible;
    }

    suggested: boolean;

    private _underlinedText: string | null = null;
    get underlinedText(): string | null {
        return this._underlinedText;
    }
    set underlinedText(value: string | null) {
        if (!this.underlinedText && !value) {
            return;
        }

        this._underlinedText = value || null;
        this.elem.underlinedValue = this.underlinedText;
    }

    constructor(
        value: string,
        categoryValue: string,
        text: string,
        suggested: boolean
    ) {
        this.value = value;
        this.categoryValue = categoryValue;
        this.text = ExerciseOption.parseText(value, categoryValue, text);
        this.suggested = suggested;

        this.textCleaned = SearchHelper.clean(this.text);
        this.favorited = FavoritesService.INSTANCE.hasFavorite(this.categoryValue, this.value);
    }

    private static parseText(value: string, categoryValue: string, text: string): string {
        const out = text.trim();

        const mapping = I18n.getExerciseTranslationWithExercisePair(value, categoryValue) || I18n.getExerciseTranslation(out);
        if (mapping) {
            return mapping;
        }

        return out;
    }

    updateFilterVisibility(activeMuscleGroupFilters: ReadonlySet<MuscleGroupFilter>, activeEquipmentFilters: ReadonlySet<EquipmentFilter>, bodyweightFilter: boolean | null, hasFavoritesFilter: boolean) {
        const hasMuscleGroupFilter = activeMuscleGroupFilters.size !== 0,
            hasEquipmentFilter = activeEquipmentFilters.size !== 0,
            hasBodyweightFilter = bodyweightFilter !== null,
            setFilterVisibility = (visibility: boolean) => this._filterVisible = visibility;

        if (!hasMuscleGroupFilter && !hasEquipmentFilter && !hasBodyweightFilter && !hasFavoritesFilter) {
            return setFilterVisibility(true);
        }

        if (hasFavoritesFilter && !this.favorited) {
            return setFilterVisibility(false);
        }

        if (hasEquipmentFilter && EXERCISE_EQUIPMENT_MAPPINGS) {
            const exerciseCategory = EXERCISE_EQUIPMENT_MAPPINGS.categories[this.categoryValue];
            if (exerciseCategory) {
                const exerciseEquipments = exerciseCategory.exercises[this.value];

                if (exerciseEquipments) {
                    for (const filter of activeEquipmentFilters) {
                        const hasEquipment = exerciseEquipments.has(filter.equipment);

                        if (
                            (filter.value === false && hasEquipment) ||
                            (filter.value === true && !hasEquipment)
                        ) {
                            return setFilterVisibility(false);
                        }
                    }
                } else {
                    return setFilterVisibility(false);
                }
            } else {
                return setFilterVisibility(false);
            }
        }

        if ((hasMuscleGroupFilter || hasBodyweightFilter) && EXERCISE_MUSCLE_MAPPINGS) {
            const exerciseMuscleMap = this.getExerciseMuscleMap();

            if (exerciseMuscleMap) {
                if (hasBodyweightFilter &&
                    ((bodyweightFilter && (!("isBodyWeight" in exerciseMuscleMap) || exerciseMuscleMap.isBodyWeight === false)) ||
                    (!bodyweightFilter && (("isBodyWeight" in exerciseMuscleMap && exerciseMuscleMap.isBodyWeight === true))))
                ) {
                    return setFilterVisibility(false);
                }

                for (const filter of activeMuscleGroupFilters) {
                    const hasPrimary = exerciseMuscleMap.primaryMuscles.has(filter.muscleGroup),
                        hasSecondary = exerciseMuscleMap.secondaryMuscles.has(filter.muscleGroup);

                    if (
                        (filter.value === MuscleGroupFilterValue.EXCLUDE && (hasPrimary || hasSecondary)) ||
                        (filter.value === MuscleGroupFilterValue.ALL && !(hasPrimary || hasSecondary)) ||
                        (filter.value === MuscleGroupFilterValue.PRIMARY && !hasPrimary) ||
                        (filter.value === MuscleGroupFilterValue.SECONDARY && !hasSecondary)
                    ) {
                        return setFilterVisibility(false);
                    }
                }
            } else {
                return setFilterVisibility(false);
            }
        }

        setFilterVisibility(true);
    }

    getExerciseMuscleMap(): ExerciseMuscleGroupsBase | null {
        if (!EXERCISE_MUSCLE_MAPPINGS) {
            return null;
        }

        if (EXERCISE_MUSCLE_MAPPINGS.categories[this.categoryValue]) {
            const exerciseCategory = EXERCISE_MUSCLE_MAPPINGS.categories[this.categoryValue];
            let exerciseMuscleMap: ExerciseMuscleGroupsBase = exerciseCategory.exercises[this.value];

            if (!exerciseMuscleMap && this.categoryValue === this.value && isExerciseMuscleGroupsBase(exerciseCategory)) {
                exerciseMuscleMap = exerciseCategory;
            } else if (!exerciseMuscleMap) {
                return null;
            }

            return exerciseMuscleMap;
        }

        return null;
    }

    matches(other: ExerciseOption): boolean {
        return this.value === other.value && this.categoryValue === other.categoryValue;
    }

    findOptionFromSelectElement(selectElem: HTMLSelectElement): HTMLOptionElement | null {
        const optionElem = Array.from(selectElem.querySelectorAll("option"))
            .find((e) => e.getAttribute("value") === this.value && e.getAttribute("data-exercise-category") === this.categoryValue);

        return optionElem ?? null;
    }

    static getGroupName(option: ExerciseOption) {
        const char = option.textCleaned.charCodeAt(0);

        if (char >= 48 && char <= 57) {
            return "123";
        } else {
            return option.textCleaned.charAt(0);
        }
    }
}
