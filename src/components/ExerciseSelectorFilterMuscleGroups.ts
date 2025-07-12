import {
    EXERCISE_MUSCLE_MAPPINGS,
    EXERCISE_MUSCLE_MAPPINGS_LISTENERS,
    EXERCISE_MUSCLES
} from "../interceptors/ExerciseResponseInterceptor";
import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import MuscleGroupFilter from "./MuscleGroupFilter";
import { TypedLitElement } from "../models/TypedEventTarget";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import { I18n } from "../models/I18n";
import Helper from "../helpers/Helper";

@customElement(ExerciseSelectorFilterMuscleGroups.NAME)
export default class ExerciseSelectorFilterMuscleGroups extends (LitElement as TypedLitElement<ExerciseSelectorFilterMuscleGroups, ExerciseSelectorFilterMuscleGroupsEventMap>) {
    static readonly NAME = "exercise-selector-filter-muscle-groups";

    static readonly EVENT_ACTIVE_FILTERS_UPDATE = "on-active-filters-update";

    static styles = css`
        :host {
            position: relative;
        }
        .bodyweight-container {
            display: flex;
            flex-direction: row;
        }
        .button-container {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            padding-bottom: 0.5rem;
        }
        .button {
            cursor: pointer;
            user-select: none;
            color: var(--link-color);
        }
        .button:hover {
            text-decoration: underline;
        }
        
        #muscle-group-preview-container {
            position: relative;
        }
        #muscle-group-preview-container:not([active]) {
            opacity: 0;
            pointer-events: none;
        }
        #muscle-group-preview-container muscle-group-preview {
            position: absolute;
            height: min-content;
            width: 100%;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background: #FFFFFF;
        }
        #muscle-group-preview-container:not(.left) muscle-group-preview {
            left: 100%;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        #muscle-group-preview-container.left muscle-group-preview {
            right: 100%;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        #muscle-group-preview-container:not([active]) muscle-group-preview {
            left: initial;
            right: initial;
        }
    `;

    private init: boolean = false;

    private initCallback = () => this.setupMuscleGroups();

    @state()
    private _filters: MuscleGroupFilter[] = [];
    get filters(): ReadonlyArray<MuscleGroupFilter> {
        return this._filters;
    }

    private _activeFilters: Set<MuscleGroupFilter> = new Set();
    get activeFilters(): ReadonlySet<MuscleGroupFilter> {
        return this._activeFilters;
    }

    @state()
    private hasActiveFilters: boolean = false;

    @state()
    private previewVisibility: { muscleGroupSet: Set<string>; offsetTop: number; displayToLeft: boolean } | null = null;

    @query("#muscle-group-preview-container") muscleGroupPreviewContainer!: HTMLDivElement;

    constructor() {
        super();

        this.setupMuscleGroups();
    }

    connectedCallback() {
        super.connectedCallback();

        window.addEventListener("resize", this.onWindowResize);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        window.removeEventListener("resize", this.onWindowResize);
    }

    private setupMuscleGroups() {
        if (!EXERCISE_MUSCLE_MAPPINGS || this.init) {
            if (!this.init) {
                EXERCISE_MUSCLE_MAPPINGS_LISTENERS.add(this.initCallback);
            }
            return;
        }

        this._filters.push(
            ...[...EXERCISE_MUSCLES]
                .map((muscleGroup) => {
                    const filter = new MuscleGroupFilter();
                    filter.muscleGroup = muscleGroup;
                    filter.label = I18n.getExerciseTranslation(`muscle_type_${muscleGroup}`, Helper.toTitleCase(muscleGroup));

                    filter.addEventListener(MuscleGroupFilter.EVENT_ON_ACTIVE, () => {
                        this._activeFilters.add(filter);
                        this.onActiveFiltersUpdate();
                    });
                    filter.addEventListener(MuscleGroupFilter.EVENT_ON_INACTIVE, () => {
                        this._activeFilters.delete(filter);
                        this.onActiveFiltersUpdate();
                    });
                    filter.addEventListener(MuscleGroupFilter.EVENT_ON_UPDATE, () => this.dispatchEvent(new Event(ExerciseSelectorFilterMuscleGroups.EVENT_ACTIVE_FILTERS_UPDATE)));
                    filter.addEventListener(MuscleGroupFilter.EVENT_ON_PREVIEW_TOGGLE, (e) => {
                        if (e.detail.displayPreview) {
                            this.previewVisibility = { offsetTop: e.detail.filter.offsetTop, muscleGroupSet: new Set([e.detail.filter.muscleGroup]), displayToLeft: false };
                            this.calculatePreviewPosition();
                        } else {
                            this.previewVisibility = null;
                        }
                    });

                    return filter;
                })
                .sort((a, b) => a.label.localeCompare(b.label))
        );

        this.requestUpdate();

        this.init = true;
    }

    private onWindowResize = () => {
        this.calculatePreviewPosition();
    };

    private calculatePreviewPosition() {
        if (this.previewVisibility) {
            const rightBound = this.getBoundingClientRect().right + this.muscleGroupPreviewContainer.getBoundingClientRect().width,
                displayToLeft = rightBound > window.innerWidth;

            if (displayToLeft != this.previewVisibility.displayToLeft) {
                this.previewVisibility.displayToLeft = displayToLeft;
                this.requestUpdate();
            }
        }
    }

    private onActiveFiltersUpdate() {
        this.hasActiveFilters = this._activeFilters.size > 0;
    }

    protected render(): unknown {
        if (this.filters.length === 0) {
            return "";
        }

        return html`
            <div
                    id="muscle-group-preview-container" 
                    ?active=${this.previewVisibility}
                    class=${classMap({ left: this.previewVisibility?.displayToLeft || false })}>
                <muscle-group-preview
                        style=${styleMap({ top: this.previewVisibility ? `${this.previewVisibility.offsetTop}px` : null })}
                        .primaryMuscleGroups=${this.previewVisibility?.muscleGroupSet || new Set()}></muscle-group-preview>
            </div>
            <exercise-selector-filter-group
                    id="muscle-group"
                    name="Filter by Muscle Group"
                    togglable
                    ?filterActive=${this.hasActiveFilters}
                    @on-reset=${() => this.onClear()}>
                <div class="button-container">
                    <div class="button" @click=${() => this.onExclude()}>Exclude all</div>
                    <div class="button" @click=${() => this.onClear()}>Clear</div>
                </div>
                <div>
                    ${this._filters}
                </div>
            </exercise-selector-filter-group>
        `;
    }

    private onExclude() {
        this.filters.forEach((filter, i) => {
            filter.exclude(i !== this.filters.length - 1);
        });
        this.onActiveFiltersUpdate();
    }

    private onClear() {
        this.filters.forEach((filter, i) => {
            filter.input.checked = null;
            filter.onInput(i !== this.filters.length - 1);
        });
        this.onActiveFiltersUpdate();
    }
}

interface ExerciseSelectorFilterMuscleGroupsEventMap {
    [ExerciseSelectorFilterMuscleGroups.EVENT_ACTIVE_FILTERS_UPDATE]: Event;
}
