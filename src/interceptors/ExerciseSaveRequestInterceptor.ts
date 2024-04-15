import XHRBaseInterceptor from "../models/XHRBaseInterceptor";
import ExerciseSelector from "../components/ExerciseSelector";

export class ExerciseSaveRequestInterceptor implements XHRBaseInterceptor {
    interceptSend(xhr: XMLHttpRequest, url: string, sendArgs: IArguments): IArguments | null {
        let id;
        if ((id = /^\/activity-service\/activity\/(\d+)\/exerciseSets$/.exec(url))) {
            return interceptExerciseRequest(parseInt(id[1]), sendArgs);
        }

        return null;
    }
}

function interceptExerciseRequest(id: number, sendArgs: IArguments) {
    try {
        const payload = JSON.parse(sendArgs[0]);

        if (typeof payload === "object" && !Array.isArray(payload) && "exerciseSets" in payload && Array.isArray(payload.exerciseSets)) {
            for (const exerciseSelector of ExerciseSelector.INSTANCES) {
                const tableRow = exerciseSelector.parentElem.closest("tr");
                if (exerciseSelector.savedOption && tableRow) {
                    const index = tableRow.sectionRowIndex * 2;

                    if (index > -1 && index < payload.exerciseSets.length && typeof payload.exerciseSets[index] === "object" && !Array.isArray(payload.exerciseSets[index]) &&
                        "setType" in payload.exerciseSets[index] && payload.exerciseSets[index].setType === "ACTIVE" &&
                        "exercises" in payload.exerciseSets[index] && Array.isArray(payload.exerciseSets[index].exercises)
                    ) {
                        const exerciseSet = payload.exerciseSets[index];
                        for (const key of exerciseSet.exercises.keys()) {
                            const exercise = exerciseSet.exercises[key];
                            if (typeof exercise === "object" && !Array.isArray(exercise) &&
                                "probability" in exercise && "category" in exercise && "name" in exercise &&
                                exercise.probability === 100
                            ) {
                                exercise.category = exerciseSelector.savedOption.categoryValue;
                                exercise.name = exerciseSelector.savedOption.value;

                                if (exercise.category === exercise.name) {
                                    exercise.name = null;
                                }
                            }
                            if (typeof exercise === "object" && !Array.isArray(exercise) &&
                                "probability" in exercise && !("category" in exercise) && "name" in exercise &&
                                exercise.name === null
                            ) {
                                exercise.category = "UNKNOWN";
                            }
                        }
                    }
                }
            }

            sendArgs[0] = JSON.stringify(payload);
        }
    } catch (e) {
        // ignored
    }

    return sendArgs;
}
