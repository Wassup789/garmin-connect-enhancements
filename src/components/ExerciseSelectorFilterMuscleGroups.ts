import {
    EXERCISE_MUSCLE_MAPPINGS,
    EXERCISE_MUSCLE_MAPPINGS_LISTENERS,
    EXERCISE_MUSCLES
} from "../interceptors/ExerciseResponseInterceptor";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import MuscleGroupFilter from "./MuscleGroupFilter";

@customElement(ExerciseSelectorFilterMuscleGroups.NAME)
export default class ExerciseSelectorFilterMuscleGroups extends LitElement {
    static readonly NAME = "exercise-selector-filter-muscle-groups";

    static readonly EVENT_ACTIVE_FILTERS_UPDATE = "on-active-filters-update";

    static styles = css`
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
    `;

    private init: boolean = false;

    private initCallback = () => this.setupMuscleGroups();

    @property()
    private _filters: MuscleGroupFilter[] = [];
    get filters(): ReadonlyArray<MuscleGroupFilter> {
        return this._filters;
    }

    private _activeFilters: Set<MuscleGroupFilter> = new Set();
    get activeFilters(): ReadonlySet<MuscleGroupFilter> {
        return this._activeFilters;
    }

    @property()
    private hasActiveFilters: boolean = false;

    constructor() {
        super();

        this.setupMuscleGroups();
    }

    private setupMuscleGroups() {
        if (!EXERCISE_MUSCLE_MAPPINGS || this.init) {
            if (!this.init) {
                EXERCISE_MUSCLE_MAPPINGS_LISTENERS.add(this.initCallback);
            }
            return;
        }

        this._filters.push(...[...EXERCISE_MUSCLES].sort().map((e) => {
            const filter = new MuscleGroupFilter();
            filter.muscleGroup = e;

            filter.addEventListener(MuscleGroupFilter.EVENT_ON_ACTIVE, () => {
                this._activeFilters.add(filter);
                this.onActiveFiltersUpdate();
            });
            filter.addEventListener(MuscleGroupFilter.EVENT_ON_INACTIVE, () => {
                this._activeFilters.delete(filter);
                this.onActiveFiltersUpdate();
            });
            filter.addEventListener(MuscleGroupFilter.EVENT_ON_UPDATE, () => this.dispatchEvent(new Event(ExerciseSelectorFilterMuscleGroups.EVENT_ACTIVE_FILTERS_UPDATE)));

            return filter;
        }));

        this.requestUpdate();

        this.init = true;
    }

    private onActiveFiltersUpdate() {
        this.hasActiveFilters = this._activeFilters.size > 0;
    }

    protected render(): unknown {
        if (this.filters.length === 0) {
            return "";
        }

        return html`
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
            filter.input.checked = false;
            filter.onInput(i !== this.filters.length - 1);
        });
        this.onActiveFiltersUpdate();
    }
}
