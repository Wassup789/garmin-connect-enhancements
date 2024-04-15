import ExerciseOption from "./ExerciseOption";

export default class ExerciseGroup {
    readonly name: string;
    readonly nameUpper: string;
    readonly options: ExerciseOption[];

    visible: boolean = true;

    constructor(name: string, initialOptions: ExerciseOption[] = []) {
        this.name = name;
        this.nameUpper = this.name.toUpperCase();
        this.options = [...initialOptions];
    }
}
