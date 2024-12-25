import { initObservers } from "./Observers";
import { initXHRInterceptor } from "./XHRInterceptor";
import * as Components from "./components";
import { initFetchInterceptor } from "./FetchInterceptor";

Components;
initObservers();
initXHRInterceptor();
initFetchInterceptor();
