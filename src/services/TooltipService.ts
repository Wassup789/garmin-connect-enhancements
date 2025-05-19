import { GenericTooltip } from "../components";

export default class TooltipService {
    private static _instance: TooltipService = null as unknown as never;

    static get INSTANCE(): TooltipService {
        if (!this._instance) {
            this._instance = new TooltipService();
        }

        return this._instance;
    }

    private constructor() {
    }

    attach(elem: HTMLElement, text: string) {
        new GenericTooltip(elem, text);
    }
}
