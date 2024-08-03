import { takeoverExerciseContainer } from "./enhancements/ExerciseSelectorEnhancement";
import { monitorWeightContainer } from "./enhancements/ExerciseSetWeightEnhancement";
import { OnObserverDestroyFunct } from "./models/OnObserverDestroyFunct";
import { takeoverWorkoutExerciseEditor } from "./enhancements/WorkoutExerciseEditorEnhancement";

const CHOSEN_PARENT_CONTAINER_SELECTOR = ".workout-name, .workout-step-exercises",
    WEIGHT_CONTAINER_SELECTOR = ".input-append.weight-entry",
    WORKOUT_EXERCISE_CONTAINER_SELECTOR = "[class^='ExercisePicker_dropdown_']",
    CONTAINER_MAPPINGS: ReadonlyArray<[string, (parent: HTMLElement) => void]> = [
        [CHOSEN_PARENT_CONTAINER_SELECTOR, addExerciseContainersFromParent],
        [WEIGHT_CONTAINER_SELECTOR, addWeightContainersFromParent],
        [WORKOUT_EXERCISE_CONTAINER_SELECTOR, addExerciseContainersForWorkoutsFromParent],
    ],
    knownContainers: Map<HTMLElement, Exclude<OnObserverDestroyFunct, false>> = new Map();

export function initObservers() {
    const creationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const [selector, funct] of CONTAINER_MAPPINGS) {
                const target = mutation.target as HTMLElement;
                if (target.querySelector(selector) || target.matches(selector)) {
                    funct(target);
                }
            }
        }
    });
    creationObserver.observe(document.body, { childList: true, subtree: true });

    const deletionObserver = new MutationObserver((mutations) => {
        Array.from(knownContainers.keys()).forEach((e) => {
            if (!document.body.contains(e)) {
                const containerDestroyFunct = knownContainers.get(e);
                if (containerDestroyFunct) {
                    containerDestroyFunct();
                }
                knownContainers.delete(e);
            }
        });
    });
    deletionObserver.observe(document.body, { childList: true });
}

function addExerciseContainersFromParent(parent: HTMLElement) {
    addGenericContainersFromParent(parent, CHOSEN_PARENT_CONTAINER_SELECTOR, (container) => takeoverExerciseContainer(container));
}
function addWeightContainersFromParent(parent: HTMLElement) {
    addGenericContainersFromParent(parent, WEIGHT_CONTAINER_SELECTOR, (container) => monitorWeightContainer(container));
}
function addExerciseContainersForWorkoutsFromParent(parent: HTMLElement) {
    addGenericContainersFromParent(parent, WORKOUT_EXERCISE_CONTAINER_SELECTOR, (container) => takeoverWorkoutExerciseEditor(container));
}

function addGenericContainersFromParent(parent: HTMLElement, containerSelector: string, callback: (container: HTMLElement) => OnObserverDestroyFunct) {
    const containers = Array.from(parent.querySelectorAll(containerSelector)) as HTMLElement[];

    containers.forEach((container) => {
        if (!knownContainers.has(container)) {
            const result = callback(container);

            if (result !== false) {
                knownContainers.set(container, result);
            }
        }
    });
}
