import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { TypedLitElement } from "../models/TypedEventTarget";
import {
    EXERCISE_EQUIPMENT_MAPPINGS, EXERCISE_EQUIPMENTS,
    EXERCISE_EQUIPMENTS_LISTENERS
} from "../interceptors/ExerciseEquipmentResponseInterceptor";
import EquipmentFilter from "./EquipmentFilter";

@customElement(ExerciseSelectorFilterEquipments.NAME)
export default class ExerciseSelectorFilterEquipments extends (LitElement as TypedLitElement<ExerciseSelectorFilterEquipments, ExerciseSelectorFilterEquipmentsEventMap>) {
    static readonly NAME = "exercise-selector-filter-equipments";

    static readonly EVENT_ACTIVE_FILTERS_UPDATE = "on-active-filters-update";

    static styles = css`
        :host {
            position: relative;
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

    private initCallback = () => this.setupEquipments();

    @state()
    private _filters: EquipmentFilter[] = [];
    get filters(): ReadonlyArray<EquipmentFilter> {
        return this._filters;
    }

    private _activeFilters: Set<EquipmentFilter> = new Set();
    get activeFilters(): ReadonlySet<EquipmentFilter> {
        return this._activeFilters;
    }

    @state()
    private hasActiveFilters: boolean = false;

    constructor() {
        super();

        this.setupEquipments();
    }

    private setupEquipments() {
        if (!EXERCISE_EQUIPMENT_MAPPINGS || this.init) {
            if (!this.init) {
                EXERCISE_EQUIPMENTS_LISTENERS.add(this.initCallback);
            }
            return;
        }

        this._filters.push(...[...EXERCISE_EQUIPMENTS].sort().map((e) => {
            const filter = new EquipmentFilter();
            filter.equipment = e;

            filter.addEventListener(EquipmentFilter.EVENT_ON_ACTIVE, () => {
                this._activeFilters.add(filter);
                this.onActiveFiltersUpdate();
            });
            filter.addEventListener(EquipmentFilter.EVENT_ON_INACTIVE, () => {
                this._activeFilters.delete(filter);
                this.onActiveFiltersUpdate();
            });
            filter.addEventListener(EquipmentFilter.EVENT_ON_UPDATE, () => this.dispatchEvent(new Event(ExerciseSelectorFilterEquipments.EVENT_ACTIVE_FILTERS_UPDATE)));

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
                    id="equipment"
                    name="Filter by Equipment"
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

interface ExerciseSelectorFilterEquipmentsEventMap {
    [ExerciseSelectorFilterEquipments.EVENT_ACTIVE_FILTERS_UPDATE]: Event;
}
