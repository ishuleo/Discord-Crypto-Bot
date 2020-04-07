module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    rules: {
        'indent': [ 'error', 4, {
            SwitchCase: 1
        } ],
        'quotes': [ 'error', 'single' ],
        'semi': [ 'error', 'always' ],
        'no-console': 'off',
        'object-curly-spacing': [ 'error', 'always' ],
        'computed-property-spacing': [ 'error', 'always' ],
        'key-spacing': [ 'error', {
            beforeColon: false,
            afterColon: true
        } ],
        'prefer-const': [ 'error' ],
        'no-empty': [ 'error', {
            allowEmptyCatch: true
        } ],
        'no-unreachable': [ 'error' ],
        'curly': [ 'error', 'multi-or-nest' ],
        'no-alert': [ 'error' ],
        'no-else-return': [ 'error' ],
        'no-extra-bind': [ 'error' ],
        'camelcase': [ 'error' ],
        'no-multiple-empty-lines': [ 'error', {
            max: 1
        } ],
        'no-tabs': [ 'error' ],
        'prefer-arrow-callback': [ 'error' ],
        'prefer-template': [ 'error' ],
        'space-before-blocks': [ 'error', 'always' ],
        'space-infix-ops': [ 'error' ],
        'no-multi-spaces': [ 'error' ],
        'block-spacing': [ 'error' ],
        'no-var': [ 'error' ],
        'no-new-object': [ 'error' ],
        'object-shorthand': [ 'error' ],
        'quote-props': [ 'error', 'as-needed' ],
        'no-array-constructor': [ 'error' ],
        'array-callback-return': [ 'error' ],
        'prefer-destructuring': [ 'error', {
            array: false
        } ],
        'func-style': [ 'error', 'expression' ],
        'arrow-spacing': [ 'error' ],
        'no-useless-constructor': [ 'error' ],
        'no-duplicate-imports': [ 'error' ],
        'dot-notation': [ 'error' ],
        'one-var': [ 'error', 'never' ],
        'no-multi-assign': [ 'error' ],
        'no-mixed-operators': [ 'error' ],
        'padded-blocks': [ 'error', 'never' ],
        'comma-spacing': [ 'error' ],
        'func-call-spacing': [ 'error' ],
        'no-trailing-spaces': [ 'error' ],
        'no-new-wrappers': [ 'error' ],
        'new-cap': [ 'error', {
            properties: false
        } ],
        'no-unused-vars': [ 'error', {
            args: 'none',
            ignoreRestSiblings: true
        } ],
        'jsx-quotes': [ 'error', 'prefer-single' ],
        'no-param-reassign': [ 'error' ],
        'eqeqeq': [ 'error', 'always' ],
        'template-curly-spacing': [ 'error', 'always' ],
        'keyword-spacing': [ 'error', {
            after: true,
            overrides: {
                if: {
                    after: false
                },
                for: {
                    after: false
                },
                while: {
                    after: false
                },
                catch: {
                    after: false
                }
            }
        } ]
    }
};