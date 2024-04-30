import GenericSnackbar from "../components/GenericSnackbar";

export default class SnackbarService {
    private static _instance: SnackbarService = null as unknown as never;

    static get INSTANCE(): SnackbarService {
        if (!this._instance) {
            this._instance = new SnackbarService();
        }

        return this._instance;
    }

    private currentSnackbar: GenericSnackbar | null = null;

    private constructor() {
    }

    show(label: string, durationMs: number = 0, actionLabel: string | null = null): GenericSnackbar {
        this.dismiss();

        const snackbarElem = new GenericSnackbar(label, durationMs, actionLabel);
        document.body.append(snackbarElem);

        this.currentSnackbar = snackbarElem;

        return snackbarElem;
    }

    dismiss() {
        this.currentSnackbar?.dismiss();
        this.currentSnackbar = null;
    }
}
