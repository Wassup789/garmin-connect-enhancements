import { ExerciseTranslationInterceptor } from "./interceptors/ExerciseTranslationInterceptor";
import FetchBaseInterceptor, { FetchArgs } from "./models/FetchBaseInterceptor";

const originalFetch = window.fetch;

const interceptors: ReadonlyArray<FetchBaseInterceptor> = [
    new ExerciseTranslationInterceptor(),
];

export function initFetchInterceptor() {
    window.fetch = async (...originalArgs) => {
        let args: FetchArgs = originalArgs;
        const resource = args[0];

        let url: string;
        if (resource instanceof URL) {
            url = resource.toString();
        } else if (resource instanceof Request) {
            url = resource.url;
        } else {
            url = resource;
        }

        for (const interceptor of interceptors) {
            const newArgs = interceptor.beforeFetch(url, args);

            if (newArgs) {
                args = newArgs;
            }
        }

        const response = await originalFetch(...args);

        for (const interceptor of interceptors) {
            const newResponse = interceptor.interceptFetch(url, args, response.clone());

            if (newResponse) {
                return newResponse;
            }
        }

        return response;
    };
}
