import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { TypedLitElement } from "../models/TypedEventTarget";

@customElement(WorkoutStepCloneButton.NAME)
export default class WorkoutStepCloneButton extends (LitElement as TypedLitElement<WorkoutStepCloneButton, WorkoutStepCloneButtonEventMap>) {
    static readonly NAME = "workout-step-clone-button";

    static readonly EVENT_CLICK = "on-click";

    static styles = css`
        span {
            font-size: 12px;
            color: #1265c2;
            cursor: pointer;
            margin-right: 0.5rem;
        }
        span:hover {
            text-decoration: underline;
        }
    `;

    protected render() {
        return html`
            <span
                @click=${(e: MouseEvent) => this.onClick(e)}>
                Clone
            </span>
        `;
    }

    private onClick(e: MouseEvent) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        this.dispatchEvent(new CustomEvent(WorkoutStepCloneButton.EVENT_CLICK, { detail: null }));
    }
}

interface WorkoutStepCloneButtonEventMap {
    [WorkoutStepCloneButton.EVENT_CLICK]: null;
}
