module.exports = {
    // The linter base is the Airbnb style guide, located here:
    // https://github.com/airbnb/javascript
    // The actual ESLint config is located here:
    // https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js
    extends: 'airbnb-typescript/base',
    // extends: 'airbnb-base',

    env: {
        browser: true,
        jquery: true,
    },

    // We modify the base for some specific things
    // (listed in alphabetical order)
    rules: {
        // Airbnb uses 2 spaces, but it is harder to read block intendation at a glance
        '@typescript-eslint/indent': ['warn', 4],

        // The browser JavaScript makes use of tasteful alerts
        'no-alert': ['off'],

        // We need this for debugging
        'no-console': ['off'],

        // We make use of constant while loops where appropriate
        'no-constant-condition': ['off'],

        // Proper use of continues can reduce indentation for long blocks of code
        'no-continue': ['off'],

        // Airbnb disallows mixing * and /, which is fairly nonsensical
        'no-mixed-operators': ['error', {
            allowSamePrecedence: true,
        }],

        // We make use of parameter reassigning where appropriate
        'no-param-reassign': ['off'],

        // Airbnb disallows these because it can lead to errors with minified code;
        // we don't have to worry about this in for loops though
        'no-plusplus': ['error', {
            'allowForLoopAfterthoughts': true,
        }],

        // Clean code can arise from for-of statements if used properly
        'no-restricted-syntax': ['off', 'ForOfStatement'],

        // KineticJS's API has functions that are prefixed with an underscore
        // (remove this once the code base is transitioned to Phaser)
        'no-underscore-dangle': ['off'],

        // This allows code to be structured in a more logical order
        '@typescript-eslint/no-use-before-define': ['off'],

        // Array destructuring can result in non-intuitive code
        'prefer-destructuring': ['warn', {
            'array': false,
            'object': true,
        }],

        // This allows for cleaner looking code as recommended here:
        // https://blog.javascripting.com/2015/09/07/fine-tuning-airbnbs-eslint-config/
        'quote-props': ['warn', 'consistent-as-needed'],
    },

    settings: {
        'import/extensions': ['.js', '.ts'],
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts']
        },
        'import/resolver': {
            'node': {
                'extensions': ['.js', '.ts']
            }
        }
    }
};
