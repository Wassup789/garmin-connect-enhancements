import { customElement, property } from "lit/decorators.js";
import { css, LitElement, html, PropertyValues } from "lit";
import StorageService from "../services/StorageService";
import { TypedLitElement } from "../models/TypedEventTarget";

type FilterGroupStorageData = Record<string, boolean>;

@customElement(ExerciseSelectorFilterGroup.NAME)
export default class ExerciseSelectorFilterGroup extends (LitElement as TypedLitElement<ExerciseSelectorFilterGroup, ExerciseSelectorFilterGroupEventMap>) {
    static readonly NAME = "exercise-selector-filter-group";

    private static readonly STORAGE_DATA_KEY = "filter-group-data";

    private static readonly INSTANCES: Map<string, Set<ExerciseSelectorFilterGroup>> = new Map();

    static readonly EVENT_RESET = "on-reset";

    static styles = css`
        .header {
            display: flex;
            flex-direction: row;
            background: #EFEFEF;
            padding: 0.5rem;
            user-select: none;
            align-items: center;
        }
        .header > span {
            flex-grow: 1;
        }

        :host([togglable]) .container .header {
            cursor: pointer;
        }

        .header-toggle {
            display: flex;
            width: 20px;
            justify-content: center;
        }
        .header-toggle::after {
            font-size: 1.4rem;
            color: var(--link-color);
            vertical-align: middle;
        }
        :host(:not([active]))  .header-toggle::after {
            content: "+";
        }
        :host([active]) .header-toggle::after {
            content: "-";
        }
        :host(:not([active])) .content {
            display: none;
        }
        .header-active {
            border: 3px solid var(--link-color);
            padding: 0 0.25rem;
            color: var(--link-color);
            margin-right: 0.25rem;
            border-radius: 0.25rem;
            font-weight: 700;
            font-size: 0.75rem;
        }
        .header-active:not([active]) {
            opacity: 0;
            pointer-events: none;
        }
        .header-active:hover {
            background: color-mix(in srgb, var(--link-color) 10%, transparent);
        }
        
        .content {
            padding: 0.5rem;
        }
    `;

    @property()
    id: string = "";

    @property({ reflect: true })
    name: string = "";

    @property({ type: Boolean, reflect: true })
    togglable: boolean = false;

    @property({ type: Boolean, reflect: true })
    active: boolean = false;

    @property({ type: Boolean, reflect: true })
    filterActive: boolean = false;

    private get storageService(): StorageService {
        return StorageService.INSTANCE;
    }

    private get storageData(): FilterGroupStorageData {
        return this.storageService.get(ExerciseSelectorFilterGroup.STORAGE_DATA_KEY, {});
    }

    get canSaveState(): boolean {
        return Boolean(this.id) && this.togglable;
    }

    constructor() {
        super();

        this.postInit();
    }

    private async postInit() {
        await this.updateComplete;

        if (this.togglable) {
            const savedState = this.getSavedState();
            if (savedState !== null) {
                this.active = savedState;
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.togglable && this.id) {
            let instances: Set<ExerciseSelectorFilterGroup> = new Set();
            if (ExerciseSelectorFilterGroup.INSTANCES.has(this.id)) {
                instances = ExerciseSelectorFilterGroup.INSTANCES.get(this.id)!;
            } else {
                ExerciseSelectorFilterGroup.INSTANCES.set(this.id, instances);
            }

            instances.add(this);
        }

        this.postInit();
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        if (this.togglable && this.id && ExerciseSelectorFilterGroup.INSTANCES.has(this.id)) {
            const instances = ExerciseSelectorFilterGroup.INSTANCES.get(this.id)!;

            instances.delete(this);
        }
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);

        if (this.canSaveState && changedProperties.has("active") && typeof changedProperties.get("active") !== "undefined") {
            const saved = this.saveState();

            if (saved) {
                this.propagateState();
            }
        }
    }

    private getSavedState(): boolean | null {
        if (!this.canSaveState) {
            return null;
        }

        const storageData = this.storageData;

        if (typeof storageData[this.id] === "boolean") {
            return storageData[this.id];
        }

        return null;
    }

    private saveState(): boolean {
        if (!this.canSaveState) {
            return false;
        }

        const storageData = this.storageData;

        if (storageData[this.id] !== this.active) {
            storageData[this.id] = this.active;

            this.storageService.set(ExerciseSelectorFilterGroup.STORAGE_DATA_KEY, storageData);

            return true;
        }

        return false;
    }

    private propagateState() {
        if (!this.canSaveState || !ExerciseSelectorFilterGroup.INSTANCES.has(this.id)) {
            return;
        }

        const instances = ExerciseSelectorFilterGroup.INSTANCES.get(this.id)!;
        instances.forEach((e) => e.active = this.active);
    }

    protected render(): unknown {
        let headerSuffix;
        if (this.togglable) {
            headerSuffix = html`
                <span>${this.name}</span>
                <div class="header-active"
                     ?active=${this.filterActive} 
                     @click=${(event: MouseEvent) => this.onHeaderActiveClick(event)}>ACTIVE</div>
                <div class="header-toggle"></div>
            `;
        } else {
            headerSuffix = html`${this.name}`;
        }

        return html`
            <div class="container">
                <div class="header" @click=${() => this.active = !this.active}>${headerSuffix}</div>
                <div class="content">
                    <slot></slot>
                </div>
            </div>
        `;
    }

    private onHeaderActiveClick(event: MouseEvent) {
        this.dispatchEvent(new Event(ExerciseSelectorFilterGroup.EVENT_RESET));

        event.stopPropagation();
    }
}

interface ExerciseSelectorFilterGroupEventMap {
    [ExerciseSelectorFilterGroup.EVENT_RESET]: Event;
}
