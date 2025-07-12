import { OnObserverDestroyFunct } from "../models/OnObserverDestroyFunct";
import ActivityNameSuggestionBasicDelegate from "../delegates/activity-name-suggestion/ActivityNameSuggestionBasicDelegate";
import ActivityNameSuggestionReactDelegate from "../delegates/activity-name-suggestion/ActivityNameSuggestionReactDelegate";

export function addActivityNameSuggestion(container: HTMLElement): OnObserverDestroyFunct {
    const element = container.classList.contains("activity-name-edit") ? new ActivityNameSuggestionBasicDelegate(container) : new ActivityNameSuggestionReactDelegate(container);

    return () => {
        element.activityNameSuggestion.disconnect();
    };
}
