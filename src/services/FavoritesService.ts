import StorageService from "./StorageService";

export default class FavoritesService extends EventTarget {
    private static _instance: FavoritesService = null as unknown as never;

    static get INSTANCE(): FavoritesService {
        if (!this._instance) {
            this._instance = new FavoritesService();
        }

        return this._instance;
    }

    private static readonly STORAGE_KEY = "favorites";
    static readonly EVENT_ON_FAVORITE_UPDATE = "on-favorite-update";

    private readonly favoritesRecord: Record<string, Set<string>>;

    private constructor() {
        super();

        this.favoritesRecord = StorageService.INSTANCE.get(FavoritesService.STORAGE_KEY, {});

        for (const key of Object.keys(this.favoritesRecord)) {
            this.favoritesRecord[key] = new Set(this.favoritesRecord[key]);
        }
    }

    updateFavorite(exerciseCategory: string, exercise: string, toFavorite: boolean) {
        if (!this.favoritesRecord[exerciseCategory]) {
            if (toFavorite) {
                this.favoritesRecord[exerciseCategory] = new Set();
            } else {
                return;
            }
        }

        if (toFavorite && !this.favoritesRecord[exerciseCategory].has(exercise)) {
            this.favoritesRecord[exerciseCategory].add(exercise);
        } else if (!toFavorite && this.favoritesRecord[exerciseCategory].has(exercise)) {
            this.favoritesRecord[exerciseCategory].delete(exercise);
        } else {
            return;
        }

        const event: OnFavoriteEvent = new CustomEvent(
            FavoritesService.EVENT_ON_FAVORITE_UPDATE,
            { detail:
                {
                    exerciseCategory: exerciseCategory,
                    exercise: exercise,
                    isFavorite: toFavorite,
                } }
        );
        this.dispatchEvent(event);

        this.save();
    }

    hasFavorite(exerciseCategory: string, exercise: string): boolean {
        return this.favoritesRecord[exerciseCategory] && this.favoritesRecord[exerciseCategory].has(exercise);
    }

    save() {
        const out: Record<string, string[]> = {};

        for (const key of Object.keys(this.favoritesRecord)) {
            const set = this.favoritesRecord[key];
            if (set.size > 0) {
                out[key] = Array.from(this.favoritesRecord[key]);
            }
        }

        StorageService.INSTANCE.set(FavoritesService.STORAGE_KEY, out);
    }

    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => never, options?: boolean | AddEventListenerOptions): void;
    // @ts-expect-error overridden from EventTarget
    addEventListener(type: "on-favorite-update", callback: OnFavoriteEventListener | null, options?: AddEventListenerOptions | boolean): void;
    // @ts-expect-error see above
    removeEventListener(type: "on-favorite-update", callback: OnFavoriteEventListener | null, options?: EventListenerOptions | boolean): void;
}

export type OnFavoriteEvent = CustomEvent<{ exerciseCategory: string; exercise: string; isFavorite: boolean }>;
export interface OnFavoriteEventListener {
    (evt: OnFavoriteEvent): void;
}
