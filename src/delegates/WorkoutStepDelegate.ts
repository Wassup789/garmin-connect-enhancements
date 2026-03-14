import WorkoutStepCloneButton from "../components/WorkoutStepCloneButton";
import ReactHelper from "../helpers/ReactHelper";
import SnackbarService from "../services/SnackbarService";

export default class WorkoutStepDelegate {
    static hasInit = false;
    private static init() {
        const style = document.createElement("style");
        style.innerHTML = `
            /* Vertical overflow styling fix */
            [class*='WorkoutStep_stepTitleWrapper'],
            [class*='WorkoutRepeatStep_titleWrapper'] {
                overflow-x: visible !important;
            }
        `;

        document.body.append(style);
    }

    readonly isRepeatStep: boolean;
    readonly stepId;

    readonly cloneButton = new WorkoutStepCloneButton();

    isActive: boolean = false;

    private readonly titleWrapper: HTMLElement;

    private titleObserver: MutationObserver;

    get titleSelector(): string {
        return this.isRepeatStep ? "[class*='WorkoutRepeatStep_titleWrapper']" : "[class*='WorkoutStep_stepTitleWrapper']";
    }
    get titleRightSelector(): string {
        return this.isRepeatStep ? "[class*='WorkoutRepeatStep_repeatStepTitleRight']" : "[class*='WorkoutStep_stepTitleRight']";
    }

    get props(): WorkoutDataProps | null {
        const props = ReactHelper.closestProps(this.titleWrapper, ["workoutData", "updateWorkoutSegment"], 30);
        return isWorkoutDataProps(props) ? props : null;
    }

    constructor(container: HTMLElement) {
        if (!WorkoutStepDelegate.hasInit) {
            WorkoutStepDelegate.init();
            WorkoutStepDelegate.hasInit = true;
        }

        this.stepId = container.dataset["stepId"]!;
        this.isRepeatStep = container.classList.toString().includes("repeatStep");
        this.titleWrapper = container.querySelector(this.titleSelector)!;

        if (!this.titleWrapper || !this.props || !this.stepId) {
            throw new Error("Could not find required elements or props");
        }

        this.titleObserver = new MutationObserver(() => this.onTitleUpdate());
        this.titleObserver.observe(this.titleWrapper, { childList: true });

        this.cloneButton.addEventListener(WorkoutStepCloneButton.EVENT_CLICK, () => this.onClone());

        this.onTitleUpdate();
    }

    release() {
        this.titleObserver.disconnect();
    }

    private onTitleUpdate() {
        const rightTitleElem = this.titleWrapper.querySelector(this.titleRightSelector);
        this.isActive = Boolean(rightTitleElem);

        if (rightTitleElem) {
            const rightTitleLastChild = rightTitleElem.lastChild;
            if (rightTitleLastChild) {
                rightTitleElem.insertBefore(this.cloneButton, rightTitleLastChild);
            } else {
                rightTitleElem.append(this.cloneButton);
            }
        } else {
            this.cloneButton.remove();
        }
    }

    private onClone() {
        const props = this.props!,
            steps = WorkoutStepDelegate.findWorkoutStepPath(this.stepId, props.workoutData.workoutSegments[0]);
        if (steps) {
            props.updateWorkoutSegment((workoutSegment: WorkoutSegment) => {
                const targetIndex = steps[steps.length - 1];
                let parent: WorkoutStep[] = workoutSegment.workoutSteps,
                    targetStep: WorkoutStep | null = null;

                for (const [i, key] of steps.entries()) {
                    const current = parent[key];

                    if (isWorkoutStepRepeatGroup(current) && i < steps.length - 1) {
                        parent = current.workoutSteps;
                    } else {
                        targetStep = current;
                    }
                }

                if (targetStep) {
                    const clonedStep = WorkoutStepDelegate.cloneWorkoutStep(targetStep);

                    parent.splice(targetIndex, 0, clonedStep);
                } else {
                    console.warn("Workout step clone failed. Could not traverse steps for step: ", this.stepId);
                    this.onCloneError();
                }

                return workoutSegment;
            });
        } else {
            console.warn("Workout step clone failed. Unable to find steps for step: ", this.stepId);
            this.onCloneError();
        }
    }

    private onCloneError() {
        const snackbarService = SnackbarService.INSTANCE;
        snackbarService.show("An error occurred while attempting to clone the step", SnackbarService.DURATION_LONG);
    }

    static cloneWorkoutStep(workoutStep: WorkoutStep): WorkoutStep {
        let counter = Date.now();
        const updateWorkoutStepsIds = (step: WorkoutStep) => {
                step.stepId = counter++;
                step.stepOrder = -1;

                if (isWorkoutStepRepeatGroup(step)) {
                    step.workoutSteps.forEach(updateWorkoutStepsIds);
                }
            },
            clonedWorkoutStep: WorkoutStep = JSON.parse(JSON.stringify(workoutStep));

        updateWorkoutStepsIds(clonedWorkoutStep);

        return clonedWorkoutStep;
    }

    static findWorkoutStepPath(targetStepId: string, workoutSegment: WorkoutSegment): number[] | null {
        const out: number[] = [];

        if (workoutSegment && this.findWorkoutStepPathInternal(out, targetStepId, workoutSegment.workoutSteps)) {
            return out;
        }

        return null;
    }

    private static findWorkoutStepPathInternal(arr: number[], targetStepId: string, workoutSteps: WorkoutStep[]): boolean {
        for (const [i, workoutStep] of workoutSteps.entries()) {
            // @ts-expect-error Loose equality required here
            if (workoutStep.stepId == targetStepId) {
                arr.unshift(i);
                return true;
            } else if (isWorkoutStepRepeatGroup(workoutStep)) {
                if (this.findWorkoutStepPathInternal(arr, targetStepId, workoutStep.workoutSteps)) {
                    arr.unshift(i);
                    return true;
                }
            }
        }

        return false;
    }
}

type WorkoutDataProps = {
    workoutData: { workoutSegments: WorkoutSegment[] };
    updateWorkoutSegment: (updater: (workoutSegment: WorkoutSegment) => WorkoutSegment) => void;
};

function isWorkoutDataProps(obj: unknown): obj is WorkoutDataProps {
    return typeof obj === "object" && !Array.isArray(obj) && obj !== null &&
        "workoutData" in obj && !Array.isArray(obj.workoutData) && obj.workoutData !== null &&
        "updateWorkoutSegment" in obj && typeof obj.updateWorkoutSegment === "function";
}

interface WorkoutSegment {
    workoutSteps: WorkoutStep[];
}

interface WorkoutStep {
    childStepId: number;
    stepId: number;
    stepOrder: number;
    type: "RepeatGroupDTO" | "ExecutableStepDTO";
}

interface WorkoutStep_RepeatGroup extends WorkoutStep {
    type: "RepeatGroupDTO";
    workoutSteps: WorkoutStep[];
}

function isWorkoutStepRepeatGroup(obj: WorkoutStep): obj is WorkoutStep_RepeatGroup {
    return typeof obj === "object" && !Array.isArray(obj) && obj !== null &&
        "workoutSteps" in obj;
}
