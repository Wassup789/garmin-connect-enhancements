import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";

const EMPTY_WEIGHT_VALUE = "-1",
    USER_EDITED_DATASET_KEY = "userEditedValue";

export function monitorWeightContainer(container: HTMLElement): OnObserverDestroyFunct {
    const inputElem = container.querySelector("input.weight-input")! as HTMLInputElement,
        buttonElem = container.parentElement!.querySelector("button"),
        updateWeight = () => {
            const currentValue = inputElem.value.trim(),
                initialValue = inputElem.getAttribute("value")!,
                isUserEdited = typeof inputElem.dataset[USER_EDITED_DATASET_KEY] !== "undefined",
                userEditedValue = inputElem.dataset[USER_EDITED_DATASET_KEY];

            if ((!currentValue || (currentValue === EMPTY_WEIGHT_VALUE && initialValue !== EMPTY_WEIGHT_VALUE)) && (!isUserEdited || userEditedValue !== currentValue)) {
                let value: string;

                if (isUserEdited) {
                    value = userEditedValue!;
                } else if (initialValue === EMPTY_WEIGHT_VALUE) {
                    value = "";
                } else {
                    value = initialValue;
                }

                inputElem.value = value;
            }

            if (buttonElem && !buttonElem.style.display) {
                container.style.display = "";
                buttonElem.style.display = "none";
            }
        };

    inputElem.addEventListener("input", () => {
        inputElem.dataset[USER_EDITED_DATASET_KEY] = inputElem.value;
    });

    const containerObserver = new MutationObserver(() => updateWeight());
    containerObserver.observe(container, { attributes: true });

    updateWeight();

    return () => containerObserver.disconnect();
}
