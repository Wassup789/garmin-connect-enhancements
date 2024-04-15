import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ExerciseSelector from "../components/ExerciseSelector";

export function takeoverExerciseContainer(container: HTMLElement): OnObserverDestroyFunct {
    try {
        const exerciseSelector = new ExerciseSelector(container);

        container.append(exerciseSelector);
    } catch (e) {
        // do nothing, invalid element
        return false;
    }

    return () => {};
}
