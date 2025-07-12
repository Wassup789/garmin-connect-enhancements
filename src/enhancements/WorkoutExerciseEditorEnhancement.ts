import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ReactHelper from "../helpers/ReactHelper";
import ExerciseSelectorReactDelegate from "../delegates/exercise-selector/ExerciseSelectorReactDelegate";

export function takeoverWorkoutExerciseEditor(container: HTMLElement): OnObserverDestroyFunct {
    let exerciseSelectorDelegate: ExerciseSelectorReactDelegate | null = null;

    try {
        const props = ReactHelper.closestProps(container, ["exerciseKey", "categoryKey", "onChange"], 20),
            exerciseProps = ReactHelper.closestProps(container, ["flattenedExerciseTypes"], 20);
        if (props && exerciseProps) {
            exerciseSelectorDelegate = new ExerciseSelectorReactDelegate(props, exerciseProps, container);
            container.parentElement!.append(exerciseSelectorDelegate.exerciseSelector);
        }
    } catch (e) {
        // do nothing, invalid element
        return false;
    }

    return () => { exerciseSelectorDelegate?.release(); };
}
