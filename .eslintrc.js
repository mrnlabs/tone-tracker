module.exports = {
    root: true,
    env: {
        node: true,
        'vue/setup-compiler-macros': true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-prettier'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        // Vue specific rules
        'vue/multi-word-component-names': 'off',
        'vue/no-unused-vars': 'error',
        'vue/component-definition-name-casing': ['error', 'PascalCase'],
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        'vue/max-attributes-per-line': ['error', {
            'singleline': { 'max': 3 },
            'multiline': { 'max': 1 }
        }],
        'vue/html-indent': ['error', 2],
        'vue/script-indent': ['error', 2],
        
        // General JavaScript rules
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        
        // Code quality
        'eqeqeq': ['error', 'always'],
        'curly': ['error', 'all'],
        'brace-style': ['error', '1tbs'],
        'comma-dangle': ['error', 'never'],
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
        'semi': ['error', 'never'],
        
        // Spacing and formatting
        'indent': ['error', 2, { 'SwitchCase': 1 }],
        'space-before-function-paren': ['error', 'always'],
        'keyword-spacing': 'error',
        'space-infix-ops': 'error',
        'comma-spacing': 'error',
        'key-spacing': 'error',
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never']
    },
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                'indent': 'off',
                'vue/script-indent': ['error', 2, { 'baseIndent': 0 }]
            }
        }
    ]
}