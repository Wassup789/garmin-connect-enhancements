import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import WorkoutStepDelegate from "../delegates/WorkoutStepDelegate";

export function addCloneButtonToWorkoutStep(container: HTMLElement): OnObserverDestroyFunct {
    if (container.classList.toString().includes("sortable")) {
        return false;
    }

    let monitor: WorkoutStepDelegate;
    try {
        monitor = new WorkoutStepDelegate(container);
    } catch (e) {
        // do nothing, invalid element
        return false;
    }

    return () => {
        monitor.release();
    };
}
