import { customElement, property } from "lit/decorators.js";
import { LitElement, html, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import FavoritesService, { OnFavoriteEvent, OnFavoriteEventListener } from "../services/FavoritesService";
import ExerciseOption from "../models/ExerciseOption";

@customElement(ExerciseSelectorOption.NAME)
export default class ExerciseSelectorOption extends LitElement {
    static readonly NAME = "exercise-selector-option";

    static readonly EVENT_MOUSE_OVER = "mouse-over";
    static readonly EVENT_ON_SELECT = "on-select";
    static readonly EVENT_ON_FAVORITE_UPDATE = "on-favorite-update";

    static styles = css`
        .container {
            display: flex;
            flex-direction: row;
            cursor: pointer;
            user-select: none;
            font-size: 0.8rem;
        }
        .container > * {
            padding: 0.25rem 0.5rem;
        }

        :host(:not([visible])) .container {
            display: none;
        }

        :host([selected]) .container {
            background: var(--link-color);
            color: #FFFFFF;
        }

        .container span {
            flex-grow: 1;
            padding-right: 0;
        }

        :host([favorited]:not([selected])) .favorite {
            color: var(--link-color)
        }
    `;

    private readonly option: ExerciseOption;

    @property({ type: String, attribute: "data-value", reflect: true })
    value: string;

    @property()
    underlinedValue: string | null = null;

    @property({ type: Boolean, reflect: true })
    selected: boolean = false;

    @property({ type: Boolean, reflect: true })
    visible: boolean = true;

    @property({ type: Boolean, reflect: true })
    favorited: boolean = false;

    constructor(option: ExerciseOption) {
        super();

        const favoritesService = FavoritesService.INSTANCE;
        this.option = option;

        this.value = option.text;
        this.favorited = favoritesService.hasFavorite(option.categoryValue, option.value);

        this.addEventListener("mouseover", () => this.dispatchEvent(new CustomEvent(ExerciseSelectorOption.EVENT_MOUSE_OVER, { detail: { option: this.option } })));
        this.addEventListener("click", (e) => this.onClick(e));
    }
    connectedCallback() {
        super.connectedCallback();

        const favoritesService = FavoritesService.INSTANCE;
        this.favorited = favoritesService.hasFavorite(this.option.categoryValue, this.option.value);
        favoritesService.addEventListener(FavoritesService.EVENT_ON_FAVORITE_UPDATE, this.onFavoriteUpdate);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        const favoritesService = FavoritesService.INSTANCE;
        favoritesService.removeEventListener(FavoritesService.EVENT_ON_FAVORITE_UPDATE, this.onFavoriteUpdate);
    }

    protected render(): unknown {
        return html`
            <div class="container">
                <span>
                    ${unsafeHTML(this.underlinedValue || this.value)}
                </span>
                <div class="favorite" @click=${(event: MouseEvent) => this.onFavoriteToggle(event)}>${unsafeHTML(this.favorited ? "&#9733;" : "&#9734;")}</div>
            </div>
        `;
    }

    private onClick(e: MouseEvent) {
        if (e.button === 0) {
            this.dispatchEvent(new CustomEvent(ExerciseSelectorOption.EVENT_ON_SELECT, { detail: { option: this.option, metaKey: e.metaKey } }));
        }
    }

    private onFavoriteUpdate: OnFavoriteEventListener = (e: OnFavoriteEvent) => {
        if (e.detail.exerciseCategory === this.option.categoryValue && e.detail.exercise === this.option.value) {
            this.favorited = e.detail.isFavorite;

            this.dispatchEvent(new CustomEvent(ExerciseSelectorOption.EVENT_ON_FAVORITE_UPDATE, { detail: { option: this.option, isFavorited: this.favorited } }));
        }
    };

    private onFavoriteToggle(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        const favoritesService = FavoritesService.INSTANCE;
        favoritesService.updateFavorite(this.option.categoryValue, this.option.value, !favoritesService.hasFavorite(this.option.categoryValue, this.option.value));
    }

    // @ts-expect-error overridden from EventTarget
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => never, options?: boolean | AddEventListenerOptions): void;
    // @ts-expect-error see above
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => never, options?: boolean | EventListenerOptions): void;
    // @ts-expect-error see above
    addEventListener(type: "mouse-over", callback: ((evt: ExerciseSelectorOptionEvent) => void) | null, options?: AddEventListenerOptions | boolean): void;
    // @ts-expect-error see above
    removeEventListener(type: "mouse-over", callback: ((evt: ExerciseSelectorOptionEvent) => void) | null, options?: EventListenerOptions | boolean): void;
    // @ts-expect-error see above
    addEventListener(type: "on-select", callback: ((evt: ExerciseSelectorOptionSelectEvent) => void) | null, options?: AddEventListenerOptions | boolean): void;
    // @ts-expect-error see above
    removeEventListener(type: "on-select", callback: ((evt: ExerciseSelectorOptionSelectEvent) => void) | null, options?: EventListenerOptions | boolean): void;
    // @ts-expect-error see above
    addEventListener(type: "on-favorite-update", callback: ((evt: ExerciseSelectorOptionFavoriteUpdateEvent) => void) | null, options?: AddEventListenerOptions | boolean): void;
    // @ts-expect-error see above
    removeEventListener(type: "on-favorite-update", callback: ((evt: ExerciseSelectorOptionFavoriteUpdateEvent) => void) | null, options?: EventListenerOptions | boolean): void;
}

export type ExerciseSelectorOptionEvent = CustomEvent<{ option: ExerciseOption }>;
export type ExerciseSelectorOptionSelectEvent = ExerciseSelectorOptionEvent & CustomEvent<{ metaKey: boolean }>;
export type ExerciseSelectorOptionFavoriteUpdateEvent = ExerciseSelectorOptionEvent & CustomEvent<{ isFavorited: boolean }>;
