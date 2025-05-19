import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ActivityNameSuggestion from "../components/ActivityNameSuggestion";

export function addActivityNameSuggestion(container: HTMLElement): OnObserverDestroyFunct {
    const element = new ActivityNameSuggestion(container);

    return () => {
        element.disconnect();
    };
}
