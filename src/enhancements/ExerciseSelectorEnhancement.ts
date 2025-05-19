import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ExerciseSelectorBasicDelegate from "../models/ExerciseSelectorBasicDelegate";

export function takeoverExerciseContainer(container: HTMLElement): OnObserverDestroyFunct {
    let exerciseSelectorDelegate: ExerciseSelectorBasicDelegate | null = null;

    try {
        exerciseSelectorDelegate = new ExerciseSelectorBasicDelegate(container);

        container.append(exerciseSelectorDelegate.exerciseSelector);
    } catch (e) {
        // do nothing, invalid element
        return false;
    }

    return () => { exerciseSelectorDelegate?.release(); };
}
