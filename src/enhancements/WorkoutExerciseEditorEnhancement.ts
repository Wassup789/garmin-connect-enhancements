import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ReactHelper from "../helpers/ReactHelper";
import ExerciseSelectorReactDelegate from "../models/ExerciseSelectorReactDelegate";

export function takeoverWorkoutExerciseEditor(container: HTMLElement): OnObserverDestroyFunct {
    try {
        const props = ReactHelper.closestProps(container, ["exerciseKey", "categoryKey", "onChange"], 20),
            exerciseProps = ReactHelper.closestProps(container, ["flattenedExerciseTypes"], 20);
        if (props && exerciseProps) {
            const reactExerciseSelector = new ExerciseSelectorReactDelegate(props, exerciseProps, container);
            container.parentElement!.append(reactExerciseSelector.exerciseSelector);
        }
    } catch (e) {
        // do nothing, invalid element
        return false;
    }

    return () => {};
}
