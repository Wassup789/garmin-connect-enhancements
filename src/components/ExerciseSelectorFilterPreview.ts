import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ExerciseMuscleGroups } from "../interceptors/ExerciseResponseInterceptor";

@customElement(ExerciseSelectorFilterPreview.NAME)
export default class ExerciseSelectorFilterPreview extends LitElement {
    static readonly NAME = "exercise-selector-filter-preview";

    private static readonly EMPTY_SET = new Set();

    static styles = css`
        .content-container:not([overlay-active]) {
            display: contents;
        }
        .content-container {
            cursor: pointer;
        }
        .content-container[overlay-active] {
            position: fixed;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 101;
            padding: 20%;
            box-sizing: border-box;
        }
        .content-container:not([overlay-active]) > div {
            display: none;
        }
        .content-container[overlay-active] > * {
            background: #FFFFFF;
            user-select: none;
            width: 100%;
            box-sizing: border-box;
        }
        .content-container[overlay-active] > div {
            font-size: 1.5rem;
            text-align: center;
            padding-top: 1.5rem;
            padding-bottom: 1.75rem;
        }
        .content-container[overlay-active] > *:not(div) {
            display: flex;
            flex-direction: column;
            max-height: 75vh;
            padding: 2rem 1rem;

            --legend-font-size: 1.5rem;
            --legend-column-gap: 1rem;
            --legend-row-gap: 1.5rem;
            --legend-margin-right: 0.5rem;
        }
        @media screen and (max-width: 1050px) {
            .content-container[overlay-active] > *:not(div) {
                --legend-font-size: 1rem;
                --legend-column-gap: 0.5rem;
                --legend-row-gap: 1.5rem;
            }
        }
        
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
        }
        .overlay:not([active]) {
            display: none;
        }
    `;

    @property({ reflect: true })
    overlayTitle: string = "";

    @property({ type: Object })
    muscleMap: ExerciseMuscleGroups | null = null;

    @state()
    private isOverlayActive: boolean = false;

    protected render(): unknown {
        return html`
            <exercise-selector-filter-group id="preview" name="Preview Targeted Muscles" togglable active>
                <div class="content-container"
                     ?overlay-active=${this.isOverlayActive}
                     @click=${() => this.onPreviewToggle()}>
                    <div ?active=${this.overlayTitle}>${this.overlayTitle}</div>
                    <muscle-group-preview
                            .primaryMuscleGroups=${this.muscleMap?.primaryMuscles || ExerciseSelectorFilterPreview.EMPTY_SET}
                            .secondaryMuscleGroups=${this.muscleMap?.secondaryMuscles || ExerciseSelectorFilterPreview.EMPTY_SET}
                            legend></muscle-group-preview>
                </div>
                <div class="overlay"
                     ?active=${this.isOverlayActive}
                     @click=${() => this.onPreviewClose()}></div>
            </exercise-selector-filter-group>
        `;
    }

    private onPreviewToggle() {
        this.isOverlayActive = !this.isOverlayActive;
    }

    private onPreviewClose() {
        this.isOverlayActive = false;
    }
}
