// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin"

export default tseslint.config({
    files: [
        "src/**/*.ts",
        "scripts/**/*.js"
    ],
    plugins: {
        "@stylistic": stylistic
    },
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
    ],
    rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "curly": "error",
        "@stylistic/array-bracket-spacing": ["error", "never"],
        "@stylistic/arrow-parens": ["error", "always"],
        "@stylistic/arrow-spacing": "error",
        "@stylistic/block-spacing": "error",
        "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
        "@stylistic/comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "never",
            "exports": "never",
            "functions": "never"
        }],
        "@stylistic/comma-spacing": ["error", { "before": false, "after": true }],
        "@stylistic/dot-location": ["error", "property"],
        "@stylistic/eol-last": ["error", "always"],
        "@stylistic/function-call-argument-newline": ["error", "consistent"],
        "@stylistic/function-call-spacing": ["error", "never"],
        "@stylistic/function-paren-newline": ["error", "consistent"],
        "@stylistic/implicit-arrow-linebreak": ["error", "beside"],
        "@stylistic/indent": ["error", 4, { "ignoredNodes": ["PropertyDefinition"] }],
        "@stylistic/indent-binary-ops": ["error", 4],
        "@stylistic/key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
        "@stylistic/keyword-spacing": ["error", { "before": true, "after": true }],
        "@stylistic/linebreak-style": ["error", "unix"],
        "@stylistic/member-delimiter-style": ["error"],
        "@stylistic/new-parens": ["error", "always"],
        "@stylistic/newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],
        "@stylistic/no-confusing-arrow": ["error"],
        "@stylistic/no-extra-semi": ["error"],
        "@stylistic/no-floating-decimal": ["error"],
        "@stylistic/no-mixed-operators": ["error"],
        "@stylistic/no-mixed-spaces-and-tabs": ["error"],
        "@stylistic/no-multi-spaces": ["error"],
        "@stylistic/no-multiple-empty-lines": ["error"],
        "@stylistic/no-tabs": ["error"],
        "@stylistic/no-trailing-spaces": ["error"],
        "@stylistic/no-whitespace-before-property": ["error"],
        "@stylistic/object-curly-newline": ["error"],
        "@stylistic/object-curly-spacing": ["error", "always"],
        "@stylistic/one-var-declaration-per-line": ["error"],
        "@stylistic/operator-linebreak": ["error", "after", { "overrides": { "?": "before", ":": "before" } }],
        "@stylistic/quote-props": ["error", "as-needed"],
        "@stylistic/quotes": ["error", "double"],
        "@stylistic/rest-spread-spacing": ["error", "never"],
        "@stylistic/semi": ["error", "always"],
        "@stylistic/semi-spacing": ["error", { "before": false, "after": true }],
        "@stylistic/semi-style": ["error", "last"],
        "@stylistic/space-before-blocks": ["error"],
        "@stylistic/space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always"
        }],
        "@stylistic/space-in-parens": ["error", "never"],
        "@stylistic/space-infix-ops": ["error"],
        "@stylistic/space-unary-ops": ["error"],
        "@stylistic/spaced-comment": ["error", "always"],
        "@stylistic/switch-colon-spacing": ["error"],
        "@stylistic/template-curly-spacing": ["error", "never"],
        "@stylistic/template-tag-spacing": ["error", "never"],
        "@stylistic/type-annotation-spacing": ["error", { "before": false, "after": true, "overrides": { "arrow": { "before": true, "after": true } } }],
        "@stylistic/type-generic-spacing": ["error"],
        "@stylistic/type-named-tuple-spacing": ["error"],
        "@stylistic/wrap-iife": ["error", "inside"],
    }
});