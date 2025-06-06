import ExerciseOption from "../models/ExerciseOption";
import ExerciseGroup from "../models/ExerciseGroup";
import ExerciseSelectorFilterMuscleGroups from "./ExerciseSelectorFilterMuscleGroups";
import ExerciseSelectorOption, {
    ExerciseSelectorOptionEvent,
    ExerciseSelectorOptionFavoriteUpdateEvent,
    ExerciseSelectorOptionSelectEvent
} from "./ExerciseSelectorOption";
import MuscleGroupFilter from "./MuscleGroupFilter";
import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import SearchHelper from "../helpers/SearchHelper";
import ExerciseSelector from "./ExerciseSelector";
import { ApplyMode } from "./ExerciseSelectorFilterApplies";
import { styleMap } from "lit/directives/style-map.js";
import HistoryService, { HistoryData } from "../services/HistoryService";
import { I18n } from "../models/I18n";
import { Lazy } from "../models/Lazy";
import ExerciseSelectorFilterEquipments from "./ExerciseSelectorFilterEquipments";
import EquipmentFilter from "./EquipmentFilter";
import ExerciseSelectorDelegate from "../models/ExerciseSelectorDelegate";

type BestOptionDetails = { option: ExerciseOption | null; startsWith: boolean; rank: number };

@customElement(ExerciseSelectorPopup.NAME)
export default class ExerciseSelectorPopup extends LitElement {
    static readonly NAME = "exercise-selector-popup";

    static readonly SEPARATOR_HEIGHT = 30;
    static readonly EMPTY_EXERCISE_VALUE = "choose_an_exercise";
    static readonly EMPTY_EXERCISE_NAME = new Lazy<string>(() => I18n.getExerciseTranslation("exercise_type_DROPDOWN_PLACEHOLDER", "Choose an Exercise"));

    static readonly INSTANCES: Map<string, ExerciseSelectorPopup> = new Map();

    static getInstanceForSelector(selector: ExerciseSelector): ExerciseSelectorPopup {
        let instance = this.INSTANCES.get(selector.type);

        if (!instance) {
            instance = new ExerciseSelectorPopup(selector.generateOptions());
            this.INSTANCES.set(selector.type, instance);
        }

        return instance;
    }

    static styles = css`
        * {
            box-sizing: border-box;
        }

        :host {
            position: absolute;
            display: grid;
            grid-template-columns: auto var(--filters-width);
            top: 0;
            left: 0;
            z-index: 4;
            width: calc(var(--input-width) + var(--filters-width));
            
            --input-width: var(--width, 100%);
            --filters-width: 275px;
            --border-color: #d5d5d5;
        }

        input[type='search'] {
            padding: 5px;
            width: var(--input-width);
            border: 1px solid #aaaaaa;
            border-radius: var(--border-radius);
            user-select: none;
            box-sizing: border-box;
        }

        input[type='search'] {
            height: 32.5px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }

        .options-container, .filters-container {
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
        }
        .options-container {
            position: relative;
            width: var(--input-width);
            min-width: var(--min-popup-width);
            height: 17rem;
            overflow: auto;
            background: #FFFFFF;
            z-index: 1;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            grid-column: 1;
        }

        .option-separator {
            position: sticky;
            top: -0.5px;
            background: #EFEFEF;
            height: 1.875rem;
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
            box-sizing: border-box;
            vertical-align: middle;
        }
        .option-separator:not([visible]){
            display: none;
        }

        .empty-state {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: default;
        }
        .empty-state:not([active]) {
            display: none;
        }

        .popup-container {
            display: contents;
        }
        .filters-container {
            width: var(--filters-width);
            height: min-content;
            background: #fff;
            border-top-left-radius: 0;
        }
    `;

    private host: ExerciseSelector | null = null;
    @state()
    private suggestedGroup: ExerciseGroup | null = null;

    private _allOptions: ReadonlyArray<ExerciseOption> = [];
    get allOptions(): ReadonlyArray<ExerciseOption> {
        return this._allOptions;
    }
    private set allOptions(value: ReadonlyArray<ExerciseOption>) {
        this._allOptions = value;
    }

    readonly options: ReadonlyArray<ExerciseOption>;
    readonly groups: ReadonlyArray<ExerciseGroup> = [];

    @query("exercise-selector-filter-muscle-groups") filterMuscleGroups!: ExerciseSelectorFilterMuscleGroups;
    get activeMuscleGroupFilters(): ReadonlySet<MuscleGroupFilter> {
        return this.filterMuscleGroups.activeFilters;
    }

    @query("exercise-selector-filter-equipments") filterEquipments!: ExerciseSelectorFilterEquipments;
    get activeEquipmentFilters(): ReadonlySet<EquipmentFilter> {
        return this.filterEquipments.activeFilters;
    }

    private applyMode: ApplyMode = "single";
    private bodyweightFilter: boolean | null = null;
    private favoritesFilter: boolean = false;

    @state()
    private selectedOption: ExerciseOption | null = null;

    @state()
    private optionsEmpty: boolean = false;

    @query(".pseudo-select") pseudoSelectElem!: HTMLDivElement;
    @query("input") inputElem!: HTMLInputElement;
    @query(".options-container") optionsElem!: HTMLInputElement;

    private constructor(options: ExerciseOption[]) {
        super();

        this.options = options;
        this.allOptions = this.options;
        this.groups = this.generateOptionGroups();
        this.populateOptionElements();

        this.requestUpdate();
    }

    protected render(): unknown {
        const groupOptionsMap = (e: ExerciseGroup) => html`
                        <div>
                            <div class="option-separator" ?visible=${e.visible}>${e.name}</div>
                            ${e.options.map((e) => html`
                                ${e.elem}
                            `)}
                        </div>
                    `;

        return html`
            <input type="search" 
                   placeholder=${ExerciseSelectorPopup.EMPTY_EXERCISE_NAME.value}
                   @input=${() => this.onInput()}
                   @keydown=${(evt: KeyboardEvent) => this.onKeyDown(evt)}
                   @focus=${() => this.onFocus()}>
            <div class="options-container">
                ${this.suggestedGroup ? groupOptionsMap(this.suggestedGroup) : ""}
                ${this.groups.map(groupOptionsMap)}
                <div class="empty-state" ?active=${this.optionsEmpty}>No exercises found</div>
            </div>
            <div class="filters-container">
                <exercise-selector-filter-applies
                        style=${styleMap({ display: this.host && this.host.canApplyToMultipleSets ? "" : "none" })}
                        @on-input=${(evt: CustomEvent<ApplyMode>) => this.applyMode = evt.detail}></exercise-selector-filter-applies>
                <exercise-selector-filter-preview
                        .overlayTitle=${this.selectedOption?.text || ""}
                        .muscleMap=${this.selectedOption?.getExerciseMuscleMap() || null}></exercise-selector-filter-preview>
                <exercise-selector-filter-muscle-groups 
                        @on-active-filters-update=${() => this.updateOptionsFilterVisibility()}></exercise-selector-filter-muscle-groups>
                <exercise-selector-filter-equipments 
                        @on-active-filters-update=${() => this.updateOptionsFilterVisibility()}></exercise-selector-filter-equipments>
                <exercise-selector-filter-other
                        @on-bodyweight-update=${(evt: CustomEvent) => { this.bodyweightFilter = evt.detail; this.updateOptionsFilterVisibility(); }}
                        @on-favorites-update=${(evt: CustomEvent) => { this.favoritesFilter = evt.detail; this.updateOptionsFilterVisibility(); }}></exercise-selector-filter-other>
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        document.addEventListener("click", this.onDocumentClick);
        document.addEventListener("keydown", this.onDocumentKeydown);
        // window.addEventListener("blur", this.onWindowBlur);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        document.removeEventListener("click", this.onDocumentClick);
        document.removeEventListener("keydown", this.onDocumentKeydown);
        window.removeEventListener("blur", this.onWindowBlur);
    }

    private generateOptionGroups() {
        const groups: ExerciseGroup[] = [];

        let currentGroup = null;
        for (const option of this.options) {
            if (!currentGroup || currentGroup.name !== ExerciseOption.getGroupName(option)) {
                const currentName = ExerciseOption.getGroupName(option);
                currentGroup = new ExerciseGroup(currentName);

                groups.push(currentGroup);
            }

            currentGroup.options.push(option);
        }

        return groups;
    }

    private populateOptionElements() {
        for (const option of this.options) {
            this.setupOptionElement(option);
        }
    }

    private setupOptionElement(option: ExerciseOption) {
        const optionElem = option.elem || new ExerciseSelectorOption(option);

        optionElem.addEventListener(ExerciseSelectorOption.EVENT_MOUSE_OVER, this.onOptionMouseOver);
        optionElem.addEventListener(ExerciseSelectorOption.EVENT_ON_SELECT, this.onOptionSelect);
        optionElem.addEventListener(ExerciseSelectorOption.EVENT_ON_FAVORITE_UPDATE, this.onOptionFavoriteUpdate);

        option.elem = optionElem;
    }

    private disconnectOptionElement(option: ExerciseOption) {
        option.elem.removeEventListener(ExerciseSelectorOption.EVENT_MOUSE_OVER, this.onOptionMouseOver);
        option.elem.removeEventListener(ExerciseSelectorOption.EVENT_ON_SELECT, this.onOptionSelect);
        option.elem.removeEventListener(ExerciseSelectorOption.EVENT_ON_FAVORITE_UPDATE, this.onOptionFavoriteUpdate);
    }

    private onOptionMouseOver = (event: ExerciseSelectorOptionEvent) => {
        if (this.selectedOption) {
            this.selectedOption.elem.selected = false;
        }

        this.selectedOption = event.detail.option;
        this.selectedOption.elem.selected = true;
    };
    private onOptionSelect = (event: ExerciseSelectorOptionSelectEvent) => {
        this.onUserSelectOption(event.detail.option, event.detail.metaKey ? "*" : undefined);
    };
    private onOptionFavoriteUpdate = (event: ExerciseSelectorOptionFavoriteUpdateEvent) => {
        event.detail.option.favorited = event.detail.isFavorited;

        this.updateFilterVisibilityForOption(event.detail.option);
    };

    private updateOptionsFilterVisibility() {
        this.allOptions.forEach((e) => this.updateFilterVisibilityForOption(e));
        this.onInput();
    }

    activate = async (selector: ExerciseSelector) => {
        if (this.host) {
            this.deactivate();
        }

        this.host = selector;
        this.suggestedGroup = this.host.suggestedGroup;
        this.allOptions = [...this.suggestedGroup.options, ...this.options];

        this.suggestedGroup.options.forEach((e) => this.setupOptionElement(e));

        this.host.renderRoot.append(this);

        await this.updateComplete;

        this.inputElem.focus();
    };

    deactivate() {
        this.remove();

        this.suggestedGroup?.options.forEach((e) => this.disconnectOptionElement(e));
        this.suggestedGroup = null;
        this.allOptions = this.options;

        this.host?.onInactive();
        this.host = null;
    }

    onKeyDown = (event: KeyboardEvent) => {
        const isDown = event.key === "ArrowDown",
            isUp = event.key === "ArrowUp";

        if (this.selectedOption) {
            if (isDown || isUp) {
                event.preventDefault();

                let siblingIndex = this.allOptions.indexOf(this.selectedOption);
                do {
                    siblingIndex += isDown ? 1 : -1;
                } while (siblingIndex > -1 && siblingIndex < this.allOptions.length && !this.allOptions[siblingIndex].visible);

                if (siblingIndex > -1 && siblingIndex < this.allOptions.length) {
                    this.setSelectedOption(this.allOptions[siblingIndex], true);
                }
            } else if (event.key === "Enter") {
                this.onUserSelectOption(this.selectedOption);
            }
        }

        if (event.key === "Escape") {
            if (this.inputElem.value) {
                this.inputElem.value = "";
                this.onInput();
            } else {
                this.deactivate();
            }
        }
    };

    onInput = () => {
        const value = SearchHelper.clean(this.inputElem.value, true),
            groups = this.suggestedGroup ? [...this.groups, this.suggestedGroup] : this.groups;

        if (!value) {
            let hasOneGroupVisible = false;
            for (const group of groups) {
                const groupOptionsFailed = group.options.filter((e) => {
                    e.visible = e.filterVisible;
                    e.underlinedText = null;

                    return !e.filterVisible;
                }).length;

                group.visible = group.options.length !== groupOptionsFailed;
                if (group.visible) {
                    hasOneGroupVisible = true;
                }
            }

            this.optionsEmpty = !hasOneGroupVisible;

            (async (savedOption) => {
                await this.requestUpdate();

                if (savedOption) {
                    this.setSelectedOption(savedOption);
                } else {
                    this.optionsElem.scrollTop = 0;
                }
            })(this.host?.savedOption);

            return;
        }

        const bestOptionDetails: BestOptionDetails = { option: null, startsWith: false, rank: 0 },
            bestFavoritedOptionDetails: BestOptionDetails = { option: null, startsWith: false, rank: 0 };
        let firstVisibleOption: ExerciseOption | null = null;
        const searchWords = value.split(/\s+/);
        for (const group of groups) {
            let groupOptionsFailed = 0;
            const matchesGroupName = group.nameUpper.startsWith(value);

            for (const option of group.options) {
                const fullText = option.textCleaned;
                let visible = option.filterVisible;

                if (visible) {
                    const [score, usedSubstrings] = SearchHelper.findUsedSubstrings(searchWords, fullText),
                        searchMatch = usedSubstrings.length === searchWords.length;

                    if (searchMatch) {
                        option.underlinedText = SearchHelper.addUnderlineToText(usedSubstrings, option.text);

                        const relativeRank = score / fullText.length,
                            hasBetterRank = relativeRank > bestOptionDetails.rank,
                            optionStartsWith = usedSubstrings[0][0] === 0,
                            fullStartsWith = option.textCleaned.startsWith(value);
                        if (
                            (!bestOptionDetails.startsWith && hasBetterRank && optionStartsWith) ||
                            (hasBetterRank && fullStartsWith)
                        ) {
                            bestOptionDetails.option = option;
                            bestOptionDetails.startsWith = fullStartsWith;
                            bestOptionDetails.rank = relativeRank;
                        }

                        const hasBetterFavoriteRank = relativeRank > bestFavoritedOptionDetails.rank;
                        if (option.favorited && hasBetterFavoriteRank && optionStartsWith) {
                            bestFavoritedOptionDetails.option = option;
                            bestFavoritedOptionDetails.startsWith = fullStartsWith;
                            bestFavoritedOptionDetails.rank = relativeRank;
                        }
                    } else {
                        if (!matchesGroupName) {
                            visible = false;
                            groupOptionsFailed++;
                        } else {
                            option.underlinedText = null;
                        }
                    }

                    if (visible && !firstVisibleOption) {
                        firstVisibleOption = option;
                    }
                } else {
                    groupOptionsFailed++;
                }

                option.visible = visible;
            }

            group.visible = group.options.length !== groupOptionsFailed;
        }

        this.optionsEmpty = !firstVisibleOption;

        (async () => {
            await this.requestUpdate();

            // Select this best option unless a favorite option exists while the best option does not start with the query
            if (bestOptionDetails.option && (!bestFavoritedOptionDetails.option || (bestOptionDetails.startsWith && !bestFavoritedOptionDetails.startsWith))) {
                this.setSelectedOption(bestOptionDetails.option);
            } else if (bestFavoritedOptionDetails.option) {
                this.setSelectedOption(bestFavoritedOptionDetails.option);
            } else if (firstVisibleOption) {
                this.setSelectedOption(firstVisibleOption);
            } else {
                this.optionsElem.scrollTop = 0;
            }
        })();
    };

    setSelectedOption(option: ExerciseOption, fromArrowUpDown: boolean = false) {
        if (this.selectedOption) {
            this.selectedOption.elem.selected = false;
        }

        this.selectedOption = option;
        this.selectedOption.elem.selected = true;

        this.scrollToOptionIfNeeded(this.selectedOption, !fromArrowUpDown);
    }

    scrollToOptionIfNeeded(option: ExerciseOption, force: boolean = false) {
        if (force) {
            this.scrollToYOffset(option.elem.offsetTop);
        } else {
            const containerYTop = this.optionsElem.scrollTop + ExerciseSelectorPopup.SEPARATOR_HEIGHT,
                containerYBottom = containerYTop + this.optionsElem.clientHeight - ExerciseSelectorPopup.SEPARATOR_HEIGHT,
                optionYTop = option.elem.offsetTop,
                optionYBottom = optionYTop + option.elem.clientHeight;

            if (containerYTop > optionYTop || containerYBottom < optionYBottom) {
                this.scrollToYOffset(option.elem.offsetTop);
            }
        }
    }

    scrollToYOffset(yOffset: number) {
        this.optionsElem.scrollTop = yOffset - ExerciseSelectorPopup.SEPARATOR_HEIGHT;
    }

    onUserSelectOption(option: ExerciseOption, applyMode: ApplyMode = this.applyMode) {
        if (!this.host) {
            return;
        }
        if (!this.host.canApplyToMultipleSets) {
            applyMode = "single";
        }

        const historyDatas: HistoryData[] = [HistoryService.generateHistoryData(this.host, option)];

        if (applyMode === "*") {
            for (const exerciseSelector of ExerciseSelector.INSTANCES) {
                if (
                    this.host === exerciseSelector ||
                    exerciseSelector.popupInstance !== this ||
                    exerciseSelector.closest(ExerciseSelector.CLOSEST_DIALOG_SELECTOR)
                ) {
                    continue;
                }

                historyDatas.push(HistoryService.generateHistoryData(exerciseSelector, option));
                exerciseSelector.onSelectOption(option);
            }
        } else if (applyMode !== "single") {
            const rawSkipCount = parseInt(applyMode),
                skipCount = Math.abs(rawSkipCount),
                isForward = rawSkipCount >= 0 && !applyMode.startsWith("-");

            let current: ChildNode | null = this.host.closest("tr"),
                i = 0;
            while (current) {
                current = isForward ? current.nextSibling : current.previousSibling;
                i = (i + 1) % (skipCount + 1);

                let exerciseSelector: ExerciseSelector;
                if (i == 0 && current instanceof HTMLElement && (exerciseSelector = current.querySelector(ExerciseSelector.NAME) as ExerciseSelector) && exerciseSelector.popupInstance === this) {
                    historyDatas.push(HistoryService.generateHistoryData(exerciseSelector, option));
                    exerciseSelector.onSelectOption(option);
                }
            }
        }

        HistoryService.INSTANCE.setHistory(historyDatas);
        this.onSelectOption(option);
    }

    onSelectOption(option: ExerciseOption) {
        this.host?.onSelectOption(option);

        this.inputElem.value = "";

        this.deactivate();
    }

    onFocus = () => {
        this.onInput();
    };

    onDocumentClick = (event: MouseEvent) => {
        if (event.target !== this.host) {
            this.deactivate();
        }
    };

    onDocumentKeydown = (event: KeyboardEvent) => {
        if (event.target !== this.host) {
            if (event.key === "Escape") {
                this.deactivate();
            } else if (this.selectedOption && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter")) {
                this.onKeyDown(event);
            }
        }
    };

    onWindowBlur = () => {
        this.deactivate();
    };

    private updateFilterVisibilityForOption(option: ExerciseOption) {
        option.updateFilterVisibility(this.activeMuscleGroupFilters, this.activeEquipmentFilters, this.bodyweightFilter, this.favoritesFilter);
    }
}

I18n.addOnExerciseTranslationReady(() => {
    ExerciseSelectorPopup.INSTANCES.clear();

    for (const delegate of ExerciseSelectorDelegate.INSTANCES) {
        delegate.reset();
    }
});
