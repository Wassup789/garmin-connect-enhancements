import ExerciseSelector from "../components/ExerciseSelector";
import ExerciseOption from "../models/ExerciseOption";
import GenericSnackbar from "../components/GenericSnackbar";
import SnackbarService from "./SnackbarService";

export type HistoryData = { readonly elem: ExerciseSelector; readonly previousValue: ExerciseOption | null; readonly currentValue: ExerciseOption };

export default class HistoryService {
    private static _instance: HistoryService = null as unknown as never;

    private static readonly SNACKBAR_DURATION = 4500;

    static get INSTANCE(): HistoryService {
        if (!this._instance) {
            this._instance = new HistoryService();
        }

        return this._instance;
    }

    private _currentHistory: ReadonlyArray<HistoryData> = [];
    private get currentHistory(): ReadonlyArray<HistoryData> {
        return this._currentHistory;
    }
    private set currentHistory(value: ReadonlyArray<HistoryData>) {
        this._currentHistory.forEach((e) => e.elem.removeEventListener(ExerciseSelector.EVENT_ON_DISCONNECT, this.onHistoryElemDisconnect));
        this._currentHistory = value;
        this._currentHistory.forEach((e) => e.elem.addEventListener(ExerciseSelector.EVENT_ON_DISCONNECT, this.onHistoryElemDisconnect));
    }

    private currentSnackbar: GenericSnackbar | null = null;

    private constructor() {
    }

    setHistory(historyData: HistoryData[], showSnackbar: boolean = true) {
        this.currentHistory = [...historyData.filter((e) => !e.previousValue?.matches(e.currentValue))];

        const snackbarService = SnackbarService.INSTANCE;
        snackbarService.dismiss();
        if (this.currentHistory.length > 1 && showSnackbar) {
            snackbarService.show(`Updated ${this.currentHistory.length} sets`, HistoryService.SNACKBAR_DURATION, "Undo")
                .addEventListener(GenericSnackbar.EVENT_ACTION, () => this.undo());
        }
    }

    private onHistoryElemDisconnect = () => {
        SnackbarService.INSTANCE.dismiss();
    };

    static generateHistoryData(selector: ExerciseSelector, nextValue: ExerciseOption): HistoryData {
        return {
            elem: selector,
            previousValue: selector.savedOption,
            currentValue: nextValue,
        };
    }

    undo() {
        this.currentHistory.forEach((e) => {
            if (e.elem.isConnected) {
                e.elem.onSelectOption(e.previousValue);
            }
        });

        this.currentHistory = [];
    }
}
