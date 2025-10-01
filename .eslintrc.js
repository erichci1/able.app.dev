/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    // Next.js base rules + Core Web Vitals
    extends: ["next/core-web-vitals"],
    // Use TS parser even in mixed .ts/.tsx projects
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],

    rules: {
        /**
        * Avoid blocking builds while you refactor types.
        * (You’ll still see these in the console as warnings.)
        */
        "@typescript-eslint/no-explicit-any": "warn",

        /**
        * Reduce noise: allow underscore-prefixed args/vars as intentionally unused.
        */
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
        ],

        /**
        * Next recommends <Image/>, but you can migrate gradually.
        * Change to "off" or keep "warn" while you switch images.
        */
        "@next/next/no-img-element": "warn",

        /**
        * General hygiene — warnings are fine; don’t block builds.
        */
        "prefer-const": "warn",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "react/no-unescaped-entities": "off",
    },

    overrides: [
        // Dashboard cards often evolve quickly; be a bit looser if needed.
        {
            files: ["src/components/dashboard/**/*.{ts,tsx}"],
            rules: {
                "@typescript-eslint/no-explicit-any": "off",
            },
        },
        // Allow images in server-rendered content detail pages if you still use <img>
        {
            files: ["src/app/**/page.tsx", "src/app/**/page.ts"],
            rules: {
                "@next/next/no-img-element": "warn",
            },
        },
    ],
};