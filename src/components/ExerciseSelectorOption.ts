import { customElement, property } from "lit/decorators.js";
import { LitElement, html, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import FavoritesService, { OnFavoriteEvent } from "../services/FavoritesService";
import ExerciseOption from "../models/ExerciseOption";
import { TypedLitElement } from "../models/TypedEventTarget";

@customElement(ExerciseSelectorOption.NAME)
export default class ExerciseSelectorOption extends (LitElement as TypedLitElement<ExerciseSelectorOption, ExerciseSelectorOptionEventMap>) {
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

    @property({ attribute: "data-label", reflect: true })
    readonly label: string;

    @property({ attribute: "data-category-value", reflect: true })
    readonly categoryValue: string;

    @property({ attribute: "data-value", reflect: true })
    readonly rawValue: string;

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

        this.label = option.text;
        this.categoryValue = option.categoryValue;
        this.rawValue = option.value;
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
                    ${unsafeHTML(this.underlinedValue || this.label)}
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

    private onFavoriteUpdate = (e: OnFavoriteEvent) => {
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
}

export type ExerciseSelectorOptionEvent = CustomEvent<{ option: ExerciseOption }>;
export type ExerciseSelectorOptionSelectEvent = ExerciseSelectorOptionEvent & CustomEvent<{ metaKey: boolean }>;
export type ExerciseSelectorOptionFavoriteUpdateEvent = ExerciseSelectorOptionEvent & CustomEvent<{ isFavorited: boolean }>;

interface ExerciseSelectorOptionEventMap {
    [ExerciseSelectorOption.EVENT_MOUSE_OVER]: ExerciseSelectorOptionEvent;
    [ExerciseSelectorOption.EVENT_ON_SELECT]: ExerciseSelectorOptionSelectEvent;
    [ExerciseSelectorOption.EVENT_ON_FAVORITE_UPDATE]: ExerciseSelectorOptionFavoriteUpdateEvent;
}
