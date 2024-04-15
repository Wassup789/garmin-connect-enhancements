export default class StorageService {
    private static _instance: StorageService = null as unknown as never;

    static get INSTANCE(): StorageService {
        if (!this._instance) {
            this._instance = new StorageService();
        }

        return this._instance;
    }

    private static readonly NAMESPACE = "gce-";

    private constructor() {

    }

    get<T>(key: string): T | null;
    get<T>(key: string, defaultValue: T): T;
    get<T>(key: string, defaultValue: T | null = null): T | null {
        try {
            const rawData = localStorage.getItem(StorageService.getLocalStorageKey(key));
            if (rawData !== null) {
                return JSON.parse(rawData);
            }
        } catch (e) {
            // ignored
        }
        return defaultValue;
    }

    set(key: string, data: unknown) {
        localStorage.setItem(StorageService.getLocalStorageKey(key), JSON.stringify(data));
    }

    private static getLocalStorageKey(key: string): string {
        return StorageService.NAMESPACE + key;
    }
}
