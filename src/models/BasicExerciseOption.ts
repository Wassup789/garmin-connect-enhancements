import ExerciseOption from "./ExerciseOption";

export default class BasicExerciseOption extends ExerciseOption {
    constructor(optionElem: HTMLOptionElement) {
        super(
            BasicExerciseOption.findValue(optionElem) || "",
            BasicExerciseOption.findCategory(optionElem) || "",
            optionElem.innerText,
            optionElem.parentElement!.matches("[label='Suggested']")
        );
    }

    static findExerciseOption(exerciseOptions: readonly ExerciseOption[], option: HTMLOptionElement): ExerciseOption | null {
        const value = this.findValue(option),
            category = this.findCategory(option);

        if (!value || !category) {
            return null;
        }

        return exerciseOptions.find((e) => e.value === value && e.categoryValue === category) ?? null;
    }

    private static findValue(option: HTMLOptionElement): string {
        return option.value;
    }

    private static findCategory(option: HTMLOptionElement): string | null {
        return option.dataset["exerciseCategory"] ?? null;
    }
}
