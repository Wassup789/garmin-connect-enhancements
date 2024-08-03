import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ReactHelper from "../helpers/ReactHelper";
import ExerciseSelectorReactDelegate from "../models/ExerciseSelectorReactDelegate";

export function takeoverWorkoutExerciseEditor(container: HTMLElement): OnObserverDestroyFunct {
    try {
        const props = ReactHelper.closestProps(container, ["flattenedExerciseTypes", "onChange"], 5);

        if (props) {
            const reactExerciseSelector = new ExerciseSelectorReactDelegate(props, container);
            container.parentElement!.append(reactExerciseSelector.exerciseSelector);
        }
    } catch (e) {
        // do nothing, invalid element
        return false;
    }

    return () => {};
}
