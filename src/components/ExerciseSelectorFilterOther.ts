import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { RadioGroup } from "../models/RadioGroup";
import RadioGroupElement from "./RadioGroupElement";
import { TypedLitElement } from "../models/TypedEventTarget";

@customElement(ExerciseSelectorFilterOther.NAME)
export default class ExerciseSelectorFilterOther extends (LitElement as TypedLitElement<ExerciseSelectorFilterOther, ExerciseSelectorFilterOtherEventMap>) {
    static readonly NAME = "exercise-selector-filter-other";

    static readonly EVENT_BODYWEIGHT_UPDATE = "on-bodyweight-update";
    static readonly EVENT_FAVORITES_UPDATE = "on-favorites-update";

    private static readonly BODYWEIGHT_RADIO_GROUP: RadioGroup<boolean | null> = {
        name: "bodyweight",
        values: [
            { name: "any", value: null, label: "Bodyweight and weighted exercises", checked: true },
            { name: "only", value: true, label: "Only bodyweight exercises" },
            { name: "no", value: false, label: "Only weighted exercises" },
        ],
    };
    private static readonly FAVORITES_RADIO_GROUP: RadioGroup<boolean | null> = {
        name: "favorites",
        values: [
            { name: "off", value: false, label: "Any exercise", checked: true },
            { name: "on", value: true, label: "Only favorited exercises" },
        ],
    };

    static styles = css`
        .filters-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .filter-container, .favorites-container {
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
        }
    `;

    private bodyweightFilter: boolean | null = null;
    private favoritesFilter: boolean = false;

    @property()
    hasActiveFilters: boolean = false;

    @query("#bodyweight-radio-group") bodyweightRadioGroup!: RadioGroupElement<boolean | null>;
    @query("#favorites-radio-group") favoritesRadioGroup!: RadioGroupElement<boolean>;

    protected render(): unknown {
        return html`
            <exercise-selector-filter-group
                    id="other"
                    name="Other filters"
                    togglable
                    ?filterActive=${this.hasActiveFilters}
                    @on-reset=${() => this.onClear()}>
                <div class="filters-container">
                    <div class="filter-container">
                        <radio-group
                                id="bodyweight-radio-group"
                                .radioGroup=${ExerciseSelectorFilterOther.BODYWEIGHT_RADIO_GROUP}
                                @on-input=${(e: CustomEvent) => this.onBodyweightUpdate(e.detail)}></radio-group>
                    </div>
                    <div class="filter-container">
                        <radio-group
                                id="favorites-radio-group"
                                .radioGroup=${ExerciseSelectorFilterOther.FAVORITES_RADIO_GROUP}
                                @on-input=${(e: CustomEvent) => this.onFavoritesUpdate(e.detail)}></radio-group>
                    </div>
                </div>
            </exercise-selector-filter-group>
        `;
    }

    private onBodyweightUpdate(value: boolean | null) {
        this.bodyweightFilter = value;

        this.dispatchEvent(new CustomEvent(ExerciseSelectorFilterOther.EVENT_BODYWEIGHT_UPDATE, { detail: this.bodyweightFilter }));

        this.onFiltersUpdate();
    }

    updateBodyweightValue(value: boolean | null) {
        this.bodyweightRadioGroup.setValue(value);
    }

    private onFavoritesUpdate(value: boolean) {
        this.favoritesFilter = value;

        this.dispatchEvent(new CustomEvent(ExerciseSelectorFilterOther.EVENT_FAVORITES_UPDATE, { detail: this.favoritesFilter }));

        this.onFiltersUpdate();
    }

    updateFavoritesValue(value: boolean) {
        this.favoritesRadioGroup.setValue(value);
    }

    private onFiltersUpdate() {
        this.hasActiveFilters = this.bodyweightFilter !== null || this.favoritesFilter;
    }

    private onClear() {
        this.updateBodyweightValue(null);
        this.updateFavoritesValue(false);
    }
}

interface ExerciseSelectorFilterOtherEventMap {
    [ExerciseSelectorFilterOther.EVENT_FAVORITES_UPDATE]: CustomEvent<boolean>;
    [ExerciseSelectorFilterOther.EVENT_BODYWEIGHT_UPDATE]: CustomEvent<boolean | null>;
}
