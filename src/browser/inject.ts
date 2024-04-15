const script = document.createElement("script");
script.src = ("chrome" in window ? chrome : browser).runtime.getURL("app.js");
script.type = "module";

document.querySelector("head")!.append(script);
