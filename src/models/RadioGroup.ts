import { RadioGroupValue } from "./RadioGroupValue";

export interface RadioGroup<T> {
    name: string;
    values: RadioGroupValue<T>[];
}
