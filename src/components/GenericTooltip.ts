import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement(GenericTooltip.NAME)
export default class GenericTooltip extends LitElement {
    static readonly NAME = "generic-tooltip";

    private static readonly TRANSITION_DURATION = 0.2;

    static styles = css`
        :host {
            --background-color: #3C3C3C;
            
            position: absolute;
            background: var(--background-color);
            color: #FFFFFF;
            padding: 5px 6px;
            margin: 6px 0;
            font-size: 13px;
            z-index: 100;
            pointer-events: none;
            opacity: 1;
            transform: translate3d(-50%, 0, 0);
            transition-property: opacity;
            transition-duration: ${unsafeCSS(GenericTooltip.TRANSITION_DURATION + "s")};
        }
        :host::before {
            content: "";
            position: absolute;
            top: -1px;
            left: 50%;
            width: 20px;
            height: 20px;
            background: var(--background-color);
            transform: translate(-50%) rotate(45deg);
            z-index: -1;
        }
        :host([removing]) {
            opacity: 0;
        }
    `;

    protected render(): unknown {
        return html`<div></div>${this.text}`;
    }

    @property({ type: Boolean, reflect: true })
    removing: boolean = false;

    interval: number | undefined = undefined;

    private parent: HTMLElement | null = null;

    constructor(
        private readonly host: HTMLElement,
        private readonly text: string
    ) {
        super();

        host.addEventListener("mouseenter", () => this.onHostMouseEnter());
        host.addEventListener("mouseleave", () => this.onHostMouseLeave());
    }

    private onHostMouseEnter() {
        clearTimeout(this.interval);
        this.removing = true;

        // Assumes scroll parent has relative positioning
        const parent = GenericTooltip.findScrollParent(this.host);
        this.parent = parent;
        this.parent.append(this);
        requestAnimationFrame(() => {
            const rect = this.host.getBoundingClientRect(),
                parentRect = parent.getBoundingClientRect();

            this.style.left = `${rect.left - parentRect.left + parent.scrollLeft + (rect.width / 2)}px`;
            this.style.top = `${rect.top - parentRect.top + rect.height + parent.scrollTop}px`;

            this.removing = false;
        });
    }

    private onHostMouseLeave() {
        this.removing = true;

        this.interval = setTimeout(() => this.parent?.removeChild(this), GenericTooltip.TRANSITION_DURATION * 1000);
    }

    private static findScrollParent(elem: HTMLElement): HTMLElement {
        if (!(elem instanceof HTMLElement)) {
            return null!;
        }

        const style = window.getComputedStyle(elem);
        const overflow = style.overflowY;
        const hasScroller = elem.scrollHeight > elem.clientHeight;

        if (hasScroller && !overflow.includes("visible") && !overflow.includes("hidden")) {
            return elem;
        }

        return this.findScrollParent(elem.parentElement as HTMLElement) || document.body;
    }
}
