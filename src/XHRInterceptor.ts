import { ExerciseResponseInterceptor } from "./interceptors/ExerciseResponseInterceptor";
import { ExerciseSaveRequestInterceptor } from "./interceptors/ExerciseSaveRequestInterceptor";
import XHRBaseInterceptor from "./models/XHRBaseInterceptor";
import { ExerciseEquipmentResponseInterceptor } from "./interceptors/ExerciseEquipmentResponseInterceptor";

const originalSend = XMLHttpRequest.prototype.send,
    originalOpen = XMLHttpRequest.prototype.open,
    xhrMap = new Map();

const interceptors: ReadonlyArray<XHRBaseInterceptor> = [
    new ExerciseResponseInterceptor(),
    new ExerciseSaveRequestInterceptor(),
    new ExerciseEquipmentResponseInterceptor(),
];

export function initXHRInterceptor() {
    // @ts-expect-error function signature supports varargs despite error
    XMLHttpRequest.prototype.open = function(...originalArgs) {
        xhrMap.set(this, originalArgs[1]);

        return originalOpen.apply(this, originalArgs as unknown as never);
    };
    XMLHttpRequest.prototype.send = function(...originalArgs) {
        const url = xhrMap.get(this);
        let args: IArguments = originalArgs as unknown as IArguments;

        if (url) {
            xhrMap.delete(this);

            for (const interceptor of interceptors) {
                const newArgs = interceptor.interceptSend(this, url, args);

                if (newArgs) {
                    args = newArgs;
                }
            }
        }

        return originalSend.apply(this, args as unknown as never);
    };
}
