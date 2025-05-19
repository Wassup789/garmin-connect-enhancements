import { initObservers } from "./Observers";
import { initXHRInterceptor } from "./XHRInterceptor";
import * as Components from "./components";
import { initFetchInterceptor } from "./FetchInterceptor";

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
Components;
initObservers();
initXHRInterceptor();
initFetchInterceptor();
