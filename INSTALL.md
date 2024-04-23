# Installation

## Prerequisites

1. Install [Node](https://nodejs.org/) v20 or later.
2. Enable Corepack for [Yarn](https://yarnpkg.com/) v4
3. Run `yarn install`

## Build

#### Development Build
Run `yarn run build:dev`

#### Production Build
Run `yarn run build:prod`

## Packaging
* To build for UserScript: `yarn run package:add-userscript-header`
* To build for Chrome extension / Firefox add-on `yarn run package:setup-browser`

## Complete production build
 * Alternatively, to build for production against all platforms, run `yarn run prod`

## Build and distributable directories breakdown
* `build/` _(contains the raw build files)_
* `dist/`
  * `browser/`
    * `chrome/` _(contains the Chrome extension files)_
    * `gecko/` _(contains the Firefox add-on files)_
  * `userscript/` _(contains the UserScript distributable)_

## Build & Watch For Changes
For use during development:

1. Run `yarn run dev`