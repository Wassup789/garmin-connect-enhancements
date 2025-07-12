import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import ExerciseSelector from "./ExerciseSelector";
import Helper from "../helpers/Helper";
import SnackbarService from "../services/SnackbarService";
import { I18n } from "../models/I18n";
import ReactHelper from "../helpers/ReactHelper";
import ExerciseOption from "../models/ExerciseOption";
import TooltipService from "../services/TooltipService";
import ActivityNameSuggestionDelegate from "../delegates/activity-name-suggestion/ActivityNameSuggestionDelegate";
import ActivityNameSuggestionBasicDelegate from "../delegates/activity-name-suggestion/ActivityNameSuggestionBasicDelegate";

type ExtractionResult = { exerciseOptions: ExerciseOption[]; exercises: Set<string> };

@customElement(ActivityNameSuggestion.NAME)
export default class ActivityNameSuggestion extends LitElement {
    static readonly NAME = "activity-name-suggestion";

    private static readonly MAX_EXERCISES_FOR_TITLE = 3;
    private static readonly SNACKBAR_DURATION = 3000;
    private static readonly TABLE_SELECTOR = "#setsContainer";
    private static readonly TABLE_ROW_FALLBACK_SELECTOR = "#setsContainer td:nth-child(2):not(:has(a))";
    private static readonly TOOLTIP_TITLE = "Suggest title";

    static styles = css`
        :host {
            pointer-events: none;
        }
        :host([hidden]) {
            display: none;
        }
        
        .container {
            --icon-size: 24px;
            display: inline-block;
            height: var(--icon-size);
            cursor: pointer;
            vertical-align: middle;
            user-select: none;
            pointer-events: auto;
        }
        .container[type="basic"] {
            margin-top: -25px;
        }
        .container[type="react"] {
            margin-left: 20px;
        }
        
        svg {
            width: var(--icon-size);
            height: var(--icon-size);
            fill: #1976d2;
        }
  `;

    private hostObserver: MutationObserver;
    private pageObserver: MutationObserver;

    private readonly isBasic: boolean;

    @query(".container") contentContainer!: HTMLDivElement;

    @property({ type: Boolean, reflect: true })
    hidden: boolean = false;

    constructor(
        private readonly delegate: ActivityNameSuggestionDelegate,
        readonly hostContainer: HTMLElement
    ) {
        super();

        this.isBasic = delegate instanceof ActivityNameSuggestionBasicDelegate;

        this.hostObserver = new MutationObserver(() => this.onHostUpdate());
        this.hostObserver.observe(this.hostContainer, { childList: true, subtree: true, attributes: true });

        this.pageObserver = new MutationObserver(() => this.onPageUpdate());
        this.pageObserver.observe(document.body, { childList: true, subtree: true });

        this.addEventListener("click", (e) => this.onClick(e));
    }

    firstUpdated() {
        TooltipService.INSTANCE.attach(this.contentContainer, ActivityNameSuggestion.TOOLTIP_TITLE);
    }

    disconnect() {
        this.hostObserver.disconnect();
        this.pageObserver.disconnect();
    }

    protected render(): unknown {
        return html`
            <div
                    class="container" 
                    type=${this.isBasic ? "basic" : "react"}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M852-212 732-332l56-56 120 120-56 56ZM708-692l-56-56 120-120 56 56-120 120Zm-456 0L132-812l56-56 120 120-56 56ZM108-212l-56-56 120-120 56 56-120 120Zm246-75 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-361Z"/></svg>
            </div>
        `;
    }

    private isPageReady(): boolean {
        return Boolean(document.querySelector(`${ActivityNameSuggestion.TABLE_SELECTOR}, ${ExerciseSelector.NAME}`));
    }

    private onPageUpdate() {
        if (!this.hostContainer.querySelector(ActivityNameSuggestion.NAME) && this.isPageReady()) {
            this.hostContainer.insertBefore(this, this.delegate.hostInsertBeforeElem);
        }
    }

    private onHostUpdate() {
        this.hidden = this.delegate.isEditing;

        this.delegate.onHostUpdate();
    }

    private onClick(e: MouseEvent) {
        const exercises = this.extractExercises();

        if (exercises.size === 0) {
            SnackbarService.INSTANCE.show("No activity name to suggest", ActivityNameSuggestion.SNACKBAR_DURATION);
            return;
        }
        if (exercises.size > ActivityNameSuggestion.MAX_EXERCISES_FOR_TITLE) {
            SnackbarService.INSTANCE.show("No activity name to suggest, too many exercises", ActivityNameSuggestion.SNACKBAR_DURATION);
            return;
        }

        this.delegate.startEditing();
        this.delegate.setInputValue(Array.from(exercises).join(" x "));
    }

    private extractExercises(): Set<string> {
        const hasTable = Boolean(document.querySelector(ActivityNameSuggestion.TABLE_SELECTOR));
        const result = hasTable ? this.extractExercisesFromTable() : this.extractExercisesFromSelector();

        if (result.exercises.size > ActivityNameSuggestion.MAX_EXERCISES_FOR_TITLE) {
            const muscleCountEntries: [string, number][] = Object.entries(
                result.exerciseOptions
                    .map((e) => e?.getExerciseMuscleMap()?.primaryMuscles)
                    .filter((e) => e)
                    .reduce(
                        (muscleCountMap, muscleGroups) => {
                            muscleGroups!.forEach((muscleGroup) => {
                                muscleCountMap[muscleGroup] = (muscleCountMap[muscleGroup] || 0) + 1;
                            });

                            return muscleCountMap;
                        },
                        {} as Record<string, number>
                    )
            );

            result.exercises = new Set(
                muscleCountEntries
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, ActivityNameSuggestion.MAX_EXERCISES_FOR_TITLE)
                    .map((e) => I18n.getExerciseTranslation(`muscle_type_${e[0]}`, Helper.toTitleCase(e[0])))
            );
        }

        return result.exercises;
    }

    private extractExercisesFromSelector(): ExtractionResult {
        const selectors = Array.from(ExerciseSelector.INSTANCES)
                .filter((e) => !e.closest(ExerciseSelector.CLOSEST_DIALOG_SELECTOR)),
            selectorOptions = selectors
                .map((e) => e.savedOption)
                .filter((e) => e) as ExerciseOption[];

        const exercises = new Set<string>(
            selectors
                .map((e) => e.savedOption?.text)
                .filter((e) => e) as string[]
        );

        return {
            exerciseOptions: selectorOptions,
            exercises: exercises,
        };
    }

    private extractExercisesFromTable(): ExtractionResult {
        const tableElem = document.querySelector(ActivityNameSuggestion.TABLE_SELECTOR) as HTMLElement,
            props = ReactHelper.closestProps(tableElem, ["exerciseSets"], 10),
            exerciseOptions: ExerciseOption[] = [],
            exercises = new Set<string>();

        if (props && "exerciseSets" in props && Array.isArray(props.exerciseSets)) {
            for (const exerciseSet of props.exerciseSets) {
                if (
                    typeof exerciseSet === "object" && exerciseSet && !Array.isArray(exerciseSet) &&
                    "categoryKey" in exerciseSet && typeof exerciseSet.categoryKey === "string" && exerciseSet.categoryKey &&
                    "exerciseKey" in exerciseSet && typeof exerciseSet.exerciseKey === "string" && exerciseSet.exerciseKey
                ) {
                    const originalName: string = ("localizeString" in exerciseSet && typeof exerciseSet.localizeString === "string" && exerciseSet.localizeString) ? exerciseSet.localizeString : exerciseSet.exerciseKey,
                        name = I18n.getExerciseTranslationWithExercisePair(exerciseSet.exerciseKey, exerciseSet.categoryKey, originalName);

                    exerciseOptions.push(new ExerciseOption(exerciseSet.exerciseKey, exerciseSet.categoryKey, name, false));
                    exercises.add(name);
                }
            }
        } else {
            Array.from(document.querySelectorAll(ActivityNameSuggestion.TABLE_ROW_FALLBACK_SELECTOR))
                .map((e) => (e as HTMLElement).innerText.trim())
                .forEach((e) => {
                    if (e) {
                        exercises.add(e);
                    }
                });
        }

        return {
            exerciseOptions: exerciseOptions,
            exercises: exercises,
        };
    }
}
