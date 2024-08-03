import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ExerciseSelectorBasicDelegate from "../models/ExerciseSelectorBasicDelegate";

export function takeoverExerciseContainer(container: HTMLElement): OnObserverDestroyFunct {
    try {
        const basicExerciseSelector = new ExerciseSelectorBasicDelegate(container);

        container.append(basicExerciseSelector.exerciseSelector);
    } catch (e) {
        // do nothing, invalid element
        return false;
    }

    return () => {};
}
