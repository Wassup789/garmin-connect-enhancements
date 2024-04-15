import { initObservers } from "./Observers";
import { initXHRInterceptor } from "./XHRInterceptor";
import * as Components from "./components";

Components;
initObservers();
initXHRInterceptor();
