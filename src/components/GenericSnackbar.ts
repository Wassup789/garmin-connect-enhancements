import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import { TypedLitElement } from "../models/TypedEventTarget";
import { when } from "lit/directives/when.js";

@customElement(GenericSnackbar.NAME)
export default class GenericSnackbar extends (LitElement as TypedLitElement<GenericSnackbar, GenericSnackbarEventMap>) {
    static readonly NAME = "generic-snackbar";

    private static readonly DISPLAY_DURATION = 0.2;

    static readonly EVENT_ACTION = "on-action-click";

    static styles = css`
        :host {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100vw;
            z-index: 100;
        }

        #container {
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            margin: 8px;
        }

        #content {
            display: flex;
            flex-direction: row;
            pointer-events: auto;
            background: #2f3033;
            color: #FFF;
            border-radius: 4px;
            padding-right: 8px;
            box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
            animation-name: display;
            animation-duration: ${unsafeCSS(GenericSnackbar.DISPLAY_DURATION + "s")};
        }

        #content[removing] {
            animation-name: display-remove;
            animation-duration: ${unsafeCSS(GenericSnackbar.DISPLAY_DURATION + "s")};
            pointer-events: none;
        }

        label {
            padding: 14px 8px 14px 16px;
            flex-grow: 1;
        }

        button {
            cursor: pointer;
            background: none;
            color: #1976d2;
            font-weight: bold;
            border: none;
            padding: 0 1rem;
        }

        @media screen and (max-width: 600px) {
            #content {
                width: 100%;
            }
        }

        @keyframes display {
            from {
                transform: scale(0.95);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        @keyframes display-remove {
            from {
                transform: scale(1);
                opacity: 1;
            }
            to {
                transform: scale(0.95);
                opacity: 0;
            }
        }
    `;

    @state()
    private isRemoving: boolean = false;

    constructor(
        private readonly label: string,
        private readonly durationMs: number = 0,
        private readonly actionLabel: string | null
    ) {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.durationMs > 0) {
            setTimeout(() => this.dismiss(), this.durationMs);
        }
    }

    protected render(): unknown {
        return html`
            <div id="container">
                <div id="content" ?removing=${this.isRemoving}>
                    <label>${this.label}</label>
                    ${when(this.actionLabel, () => html`
                        <button @click=${() => this.onActionClick()}>
                            ${this.actionLabel}
                        </button>
                    `, () => "")}
                </div>
            </div>
        `;
    }

    dismiss() {
        this.isRemoving = true;
        setTimeout(() => this.remove(), GenericSnackbar.DISPLAY_DURATION * 1000);
    }

    onActionClick() {
        this.dismiss();

        this.dispatchEvent(new CustomEvent(GenericSnackbar.EVENT_ACTION, { detail: this }));
    }
}

interface GenericSnackbarEventMap {
    [GenericSnackbar.EVENT_ACTION]: CustomEvent<GenericSnackbar>;
}
