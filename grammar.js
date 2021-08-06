'use strict';

// TODO: optionally improve rules for switch

const BASIC_TYPES = require('./grammar/basic-types.js');

const PRECEDENCE = {
    PAREN_EXPR: 15,
    ARRAY_SUBSCRIPT: 14,
    FUNC_CALL: 14,
    FIELD_SELECT: 14,
    POSTFIX_INC_DEC: 14,
    PREFIX_INC_DEC: 13,
    UNARY: 13,
    MULTIPLICATIVE: 12,
    ADDITIVE: 11,
    BIT_WISE_SHIFT: 10,
    RELATIONAL: 9,
    EQUALITY: 8,
    BIT_WISE_AND: 7,
    BIT_WISE_EXCLUSIVE_OR: 6,
    BIT_WISE_INCLUSIVE_OR: 5,
    LOGICAL_AND: 4,
    LOGICAL_EXCLUSIVE_OR: 3,
    LOGICAL_INCLUSIVE_OR: 2,
    CONDITIONAL_SELECTION: 1,
    ASSIGNMENT: 0,
    SEQUENCE: -1,
};

const PREPROC = {
    DEFINE: 'define',
    UNDEF: 'undef',
    IF: 'if',
    IFDEF: 'ifdef',
    IFNDEF: 'ifndef',
    ELSE: 'else',
    ELIF: 'elif',
    ENDIF: 'endif',
    ERROR: 'error',
    PRAGMA: 'pragma',
    EXTENSION: 'extension',
    VERSION: 'version',
    LINE: 'line',
};

const NEW_LINE = '\n';

const Expression = {
    parenthesised($, rule) {
        return prec(PRECEDENCE.PAREN_EXPR, seq(
            '(',
            rule,
            ')',
        ));
    },
    function_call($, rule) {
        return prec.left(PRECEDENCE.FUNC_CALL, rule);
    },
    array_subscript($, rule) {
        return prec.left(PRECEDENCE.ARRAY_SUBSCRIPT, seq(
            rule,
            '[',
            rule,
            ']',
        ));
    },
    field_select($, rule) {
        return prec.left(PRECEDENCE.FIELD_SELECT, seq(
            rule,
            '.',
            $.identifier,
        ));
    },
    postfix($, rule) {
        return prec.left(PRECEDENCE.POSTFIX_INC_DEC, seq(
            rule,
            choice('++', '--'),
        ));
    },
    prefix($, rule) {
        return prec.right(PRECEDENCE.PREFIX_INC_DEC, seq(
            choice('++', '--'),
            rule,
        ));
    },
    unary($, rule, ...operators) {
        return prec.right(PRECEDENCE.UNARY, seq(
            choice(
                '+',
                '-',
                '!',
                '~',
                ...operators,
            ),
            rule,
        ));
    },
    multiplicative($, rule) {
        return prec.left(PRECEDENCE.MULTIPLICATIVE, seq(
            rule,
            choice('*', '/', '%'),
            rule,
        ));
    },
    additive($, rule) {
        return prec.left(PRECEDENCE.ADDITIVE, seq(
            rule,
            choice('+', '-'),
            rule,
        ));
    },
    shift($, rule) {
        return prec.left(PRECEDENCE.BIT_WISE_SHIFT, seq(
            rule,
            choice('<<', '>>'),
            rule,
        ));
    },
    relational($, rule) {
        return prec.left(PRECEDENCE.RELATIONAL, seq(
            rule,
            choice('<', '>', '<=', '>='),
            rule,
        ));
    },
    equality($, rule) {
        return prec.left(PRECEDENCE.EQUALITY, seq(
            rule,
            choice('==', '!='),
            rule,
        ));
    },
    bitwise_and($, rule) {
        return prec.left(PRECEDENCE.BIT_WISE_AND, seq(
            rule,
            '&',
            rule,
        ));
    },
    bitwise_exclusive_or($, rule) {
        return prec.left(PRECEDENCE.BIT_WISE_EXCLUSIVE_OR, seq(
            rule,
            '^',
            rule,
        ));
    },
    bitwise_inclusive_or($, rule) {
        return prec.left(PRECEDENCE.BIT_WISE_INCLUSIVE_OR, seq(
            rule,
            '|',
            rule,
        ));
    },
    logical_and($, rule) {
        return prec.left(PRECEDENCE.LOGICAL_AND, seq(
            rule,
            '&&',
            rule,
        ));
    },
    logical_xor($, rule) {
        return prec.left(PRECEDENCE.LOGICAL_EXCLUSIVE_OR, seq(
            rule,
            '^^',
            rule,
        ));
    },
    logical_or($, rule) {
        return prec.left(PRECEDENCE.LOGICAL_INCLUSIVE_OR, seq(
            rule,
            '||',
            rule,
        ));
    },
    conditional($, rule) {
        return prec.right(PRECEDENCE.CONDITIONAL_SELECTION, seq(
            rule,
            '?',
            rule,
            ':',
            rule,
        ));
    },
    assignment($, rule) {
        return prec.right(PRECEDENCE.ASSIGNMENT, seq(
            rule,
            choice(
                '=',
                '*=',
                '/=',
                '%=',
                '+=',
                '-=',
                '<<=',
                '>>=',
                '&=',
                '^=',
                '|=',
            ),
            rule,
        ));
    },
    sequence($, rule) {
        return prec.left(PRECEDENCE.SEQUENCE, seq(
            rule,
            repeat1(prec.left(PRECEDENCE.SEQUENCE, seq(
                ',',
                rule,
            ))),
        ));
    },
};

module.exports = grammar({
    name: 'glsl',

    extras: $ => [
        $.comment,
        $.line_concatenation,
        $.preprocessor_define,
        $.preprocessor_undefine,
        $.preprocessor_if,
        $.preprocessor_ifdef,
        $.preprocessor_ifndef,
        $.preprocessor_else,
        $.preprocessor_elif,
        $.preprocessor_endif,
        $.preprocessor_error,
        $.preprocessor_pragma,
        $.preprocessor_extension,
        $.preprocessor_version,
        $.preprocessor_line,
        /\s/,
    ],

    inline: $ => [
        $.external_declaration,
        $.function_call_generic,
        $.function_call_header,
        $.function_call_header_no_parameters,
        $.function_call_header_with_parameters,
        $.function_call_or_method,
        $.function_declarator,
        $.function_header,
        $.function_header_with_parameters,
        $.function_identifier,
        $.identifier_list,
        $.parameter_declarator,
        $.parameter_type_specifier,
        $.primary_expression,
        $.simple_statement,
        $.single_type_qualifier,
        $.statement,
        $.statement_list,
        $.struct_declaration_list,
        $.struct_declarator_list,
        $.type_name,
        $.type_name_list,
        $.type_specifier_nonarray,
    ],

    conflicts: $ => [
        [$._expression, $.type_specifier],
    ],

    rules: {
        /*
         * translation_unit :
         *   external_declaration
         *   translation_unit external_declaration
         */
        translation_unit: $ => optional(repeat1(
            $.external_declaration,
        )),

        /*
         * external_declaration :
         *   function_definition
         *   declaration
         *   SEMICOLON
         */
        external_declaration: $ => choice(
            $.function_definition,
            $.declaration,
            ';',
        ),

        /*
         * https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#preprocessor
         *
         * preprocessor_define :
         *   #define identifier_list
         *   #define identifier_list token_string_repeat
         *
         * preprocessor_undefine :
         *   #undef identifier
         *
         * token_string :
         *   /\S+/
         *
         * preprocessor_if :
         *   #if preprocessor_expression
         *
         * preprocessor_ifdef :
         *   #ifdef identifier
         *
         * preprocessor_ifndef :
         *   #ifndef identifier
         *
         * preprocessor_else :
         *   #else
         *
         * preprocessor_elif :
         *   #elif preprocessor_expression
         *
         * preprocessor_endif :
         *   #endif
         *
         * preprocessor_error :
         *   #error token_string
         *
         * preprocessor_pragma :
         *   #pragma token_string
         *
         * preprocessor_extension :
         *   #extension name : behavior
         *
         * preprocessor_version :
         *   #version integer_constant
         *   #version integer_constant token_string
         *
         * preprocessor_line :
         *   #line integer_constant
         *   #line integer_constant token_string
         */
        preprocessor_define: $ => seq(
            preprocessor(PREPROC.DEFINE),
            commaSeparated(field('name', $.identifier)),
            optional(field('value', repeat1($.token_string))),
            NEW_LINE,
        ),
        preprocessor_undefine: $ => seq(
            preprocessor(PREPROC.UNDEF),
            field('name', $.identifier),
            NEW_LINE,
        ),
        preprocessor_if: $ => seq(
            preprocessor(PREPROC.IF),
            field('condition', $._preprocessor_expression),
            NEW_LINE,
        ),
        preprocessor_ifdef: $ => seq(
            preprocessor(PREPROC.IFDEF),
            field('name', $.identifier),
            NEW_LINE,
        ),
        preprocessor_ifndef: $ => seq(
            preprocessor(PREPROC.IFNDEF),
            field('name', $.identifier),
            NEW_LINE,
        ),
        preprocessor_else: $ => seq(
            preprocessor(PREPROC.ELSE),
            NEW_LINE,
        ),
        preprocessor_elif: $ => seq(
            preprocessor(PREPROC.ELIF),
            field('condition', $._preprocessor_expression),
            NEW_LINE,
        ),
        preprocessor_endif: $ => seq(
            preprocessor(PREPROC.ENDIF),
            NEW_LINE,
        ),
        preprocessor_error: $ => seq(
            preprocessor(PREPROC.ERROR),
            repeat1($.token_string),
            NEW_LINE,
        ),
        preprocessor_pragma: $ => seq(
            preprocessor(PREPROC.PRAGMA),
            repeat1($.token_string),
            NEW_LINE,
        ),
        preprocessor_extension: $ => seq(
            preprocessor(PREPROC.EXTENSION),
            field('extension', $.token_string),
            ':',
            field('behavior', $.token_string),
            NEW_LINE,
        ),
        preprocessor_version: $ => seq(
            preprocessor(PREPROC.VERSION),
            $.integer_constant,
            optional($.token_string),
            NEW_LINE,
        ),
        preprocessor_line: $ => seq(
            preprocessor(PREPROC.LINE),
            $.integer_constant,
            optional($.token_string),
            NEW_LINE,
        ),

        token_string: $ => /\S+/,

        _preprocessor_expression: $ => choice(
            $.identifier,
            $.integer_constant,
            $.bool_constant,
            $.float_constant,
            alias(
                $.preprocessor_parenthesised_expression,
                $.parenthesised_expression,
            ),
            alias(
                $.preprocessor_unary_expression,
                $.unary_expression,
            ),
            alias(
                $.preprocessor_multiplicative_expression,
                $.multiplicative_expression,
            ),
            alias(
                $.preprocessor_additive_expression,
                $.additive_expression
            ),
            alias(
                $.preprocessor_shift_expression,
                $.shift_expression,
            ),
            alias(
                $.preprocessor_relational_expression,
                $.relational_expression,
            ),
            alias(
                $.preprocessor_equality_expression,
                $.equality_expression,
            ),
            alias(
                $.preprocessor_and_expression,
                $.and_expression,
            ),
            alias(
                $.preprocessor_exclusive_or_expression,
                $.exclusive_or_expression,
            ),
            alias(
                $.preprocessor_inclusive_or_expression,
                $.inclusive_or_expression,
            ),
            alias(
                $.preprocessor_logical_and_expression,
                $.logical_and_expression,
            ),
            alias(
                $.preprocessor_logical_or_expression,
                $.logical_or_expression,
            ),
        ),

        preprocessor_parenthesised_expression: $ => Expression.parenthesised(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_unary_expression: $ => Expression.unary(
            $,
            $._preprocessor_expression,
            'defined',
        ),
        preprocessor_multiplicative_expression: $ => Expression.multiplicative(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_additive_expression: $ => Expression.additive(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_shift_expression: $ => Expression.shift(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_relational_expression: $ => Expression.relational(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_equality_expression: $ => Expression.equality(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_and_expression: $ => Expression.bitwise_and(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_exclusive_or_expression: $ => Expression.bitwise_exclusive_or(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_inclusive_or_expression: $ => Expression.bitwise_inclusive_or(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_logical_and_expression: $ => Expression.logical_and(
            $,
            $._preprocessor_expression,
        ),
        preprocessor_logical_or_expression: $ => Expression.logical_or(
            $,
            $._preprocessor_expression,
        ),

        /*
         * function_definition :
         *   function_prototype compound_statement_no_new_scope
         */
        function_definition: $ => seq(
            $.function_prototype,
            $.compound_statement_no_new_scope,
        ),

        /*
         * variable_identifier :
         *   IDENTIFIER
         *
         * primary_expression :
         *   variable_identifier
         *   INTCONSTANT
         *   UINTCONSTANT
         *   FLOATCONSTANT
         *   BOOLCONSTANT
         *   DOUBLECONSTANT
         *   LEFT_PAREN expression RIGHT_PAREN
         */
        primary_expression: $ => choice(
            $.identifier,
            $.integer_constant,
            $.bool_constant,
            $.float_constant,
            $.parenthesised_expression,
        ),

        /*
         * integer_expression :
         *   expression
         *
         * postfix_expression :
         *   primary_expression
         *   postfix_expression LEFT_BRACKET integer_expression RIGHT_BRACKET
         *   function_call
         *   postfix_expression DOT FIELD_SELECTION
         *   postfix_expression INC_OP
         *   postfix_expression DEC_OP
         *
         * unary_expression :
         *   postfix_expression
         *   INC_OP unary_expression
         *   DEC_OP unary_expression
         *   unary_operator unary_expression
         *
         * multiplicative_expression :
         *   unary_expression
         *   multiplicative_expression STAR unary_expression
         *   multiplicative_expression SLASH unary_expression
         *   multiplicative_expression PERCENT unary_expression
         *
         * additive_expression :
         *   multiplicative_expression
         *   additive_expression PLUS multiplicative_expression
         *   additive_expression DASH multiplicative_expression
         *
         * shift_expression :
         *   additive_expression
         *   shift_expression LEFT_OP additive_expression
         *   shift_expression RIGHT_OP additive_expression
         *
         * relational_expression :
         *   shift_expression
         *   relational_expression LEFT_ANGLE shift_expression
         *   relational_expression RIGHT_ANGLE shift_expression
         *   relational_expression LE_OP shift_expression
         *   relational_expression GE_OP shift_expression
         *
         * equality_expression :
         *   relational_expression
         *   equality_expression EQ_OP relational_expression
         *   equality_expression NE_OP relational_expression
         *
         * and_expression :
         *   equality_expression
         *   and_expression AMPERSAND equality_expression
         *
         * exclusive_or_expression :
         *   and_expression
         *   exclusive_or_expression CARET and_expression
         *
         * inclusive_or_expression :
         *   exclusive_or_expression
         *   inclusive_or_expression VERTICAL_BAR exclusive_or_expression
         *
         * logical_and_expression :
         *   inclusive_or_expression
         *   logical_and_expression AND_OP inclusive_or_expression
         *
         * logical_xor_expression :
         *   logical_and_expression
         *   logical_xor_expression XOR_OP logical_and_expression
         *
         * logical_or_expression :
         *   logical_xor_expression
         *   logical_or_expression OR_OP logical_xor_expression
         *
         * conditional_expression :
         *   logical_or_expression
         *   logical_or_expression QUESTION expression COLON assignment_expression
         *
         * assignment_expression :
         *   conditional_expression
         *   unary_expression assignment_operator assignment_expression
         *
         * expression :
         *   assignment_expression
         *   expression COMMA assignment_expression
         *
         */
        _expression: $ => choice(
            $.primary_expression,
            $.function_call_expression,
            $.array_subscript_expression,
            $.field_select_expression,
            $.postfix_expression,
            $.prefix_expression,
            $.unary_expression,
            $.multiplicative_expression,
            $.additive_expression,
            $.shift_expression,
            $.relational_expression,
            $.equality_expression,
            $.and_expression,
            $.exclusive_or_expression,
            $.inclusive_or_expression,
            $.logical_and_expression,
            $.logical_xor_expression,
            $.logical_or_expression,
            $.conditional_expression,
            $.assignment_expression,
            $.sequence_expression,
        ),

        parenthesised_expression: $ => Expression.parenthesised($, $._expression),
        function_call_expression: $ => Expression.function_call($, $.function_call),
        array_subscript_expression: $ => Expression.array_subscript($, $._expression),
        field_select_expression: $ => Expression.field_select($, $._expression),
        postfix_expression: $ => Expression.postfix($, $._expression),
        prefix_expression: $ => Expression.prefix($, $._expression),
        unary_expression: $ => Expression.unary($, $._expression),
        multiplicative_expression: $ => Expression.multiplicative($, $._expression),
        additive_expression: $ => Expression.additive($, $._expression),
        shift_expression: $ => Expression.shift($, $._expression),
        relational_expression: $ => Expression.relational($, $._expression),
        equality_expression: $ => Expression.equality($, $._expression),
        and_expression: $ => Expression.bitwise_and($, $._expression),
        exclusive_or_expression: $ => Expression.bitwise_exclusive_or($, $._expression),
        inclusive_or_expression: $ => Expression.bitwise_inclusive_or($, $._expression),
        logical_and_expression: $ => Expression.logical_and($, $._expression),
        logical_xor_expression: $ => Expression.logical_xor($, $._expression),
        logical_or_expression: $ => Expression.logical_or($, $._expression),
        conditional_expression: $ => Expression.conditional($, $._expression),
        assignment_expression: $ => Expression.assignment($, $._expression),
        sequence_expression: $ => Expression.sequence($, $._expression),

        /*
         * function_call :
         *   function_call_or_method
         */
        function_call: $ => $.function_call_or_method,

        /*
         * function_call_or_method :
         *   function_call_generic
         */
        function_call_or_method: $ => $.function_call_generic,

        /*
         * function_call_generic :
         *   function_call_header_with_parameters RIGHT_PAREN
         *   function_call_header_no_parameters RIGHT_PAREN
         */
        function_call_generic: $ => seq(
            choice(
                $.function_call_header_with_parameters,
                $.function_call_header_no_parameters,
            ),
            ')',
        ),

        /*
         * function_call_header_no_parameters :
         *   function_call_header VOID
         *   function_call_header
         */
        function_call_header_no_parameters: $ => seq(
            $.function_call_header,
            optional('void'),
        ),

        /*
         * function_call_header_with_parameters :
         *   function_call_header assignment_expression
         *   function_call_header_with_parameters COMMA assignment_expression
         */
        function_call_header_with_parameters: $ => seq(
            $.function_call_header,
            commaSeparated(field('parameter', $._expression)),
        ),

        /*
         * function_call_header :
         *   function_identifier LEFT_PAREN
         */
        function_call_header: $ => seq(
            field('name', $.function_identifier),
            '(',
        ),

        /*
         * function_identifier :
         *   type_specifier
         *   postfix_expression
         */
        function_identifier: $ => prec(PRECEDENCE.FUNC_CALL, choice(
            $.type_specifier,
            $._expression,
        )),

        /*
         * declaration :
         *   function_prototype SEMICOLON
         *   init_declarator_list SEMICOLON
         *   PRECISION precision_qualifier type_specifier SEMICOLON
         *   type_qualifier IDENTIFIER LEFT_BRACE struct_declaration_list RIGHT_BRACE SEMICOLON
         *   type_qualifier IDENTIFIER LEFT_BRACE struct_declaration_list RIGHT_BRACE IDENTIFIER SEMICOLON
         *   type_qualifier IDENTIFIER LEFT_BRACE struct_declaration_list RIGHT_BRACE IDENTIFIER array_specifier SEMICOLON
         *   type_qualifier SEMICOLON
         *   type_qualifier IDENTIFIER SEMICOLON
         *   type_qualifier IDENTIFIER identifier_list SEMICOLON
         */
        declaration: $ => choice(
            seq($.function_prototype, ';'),
            seq($.init_declarator_list, ';'),
            seq(
                'precision',
                $.precision_qualifier,
                $.type_specifier,
                ';',
            ),
            seq(
                $.type_qualifier,
                $.identifier,
                '{',
                $.struct_declaration_list,
                '}',
                optional(seq(
                    $.identifier,
                    optional($.array_specifier),
                )),
                ';',
            ),
            seq(
                $.type_qualifier,
                optional(seq(
                    $.identifier,
                    optional($.identifier_list),
                )),
                ';',
            ),
        ),

        /*
         * identifier_list :
         *   COMMA IDENTIFIER
         *   identifier_list COMMA IDENTIFIER
         */
        identifier_list: $ => repeat1(seq(
            ',',
            $.identifier,
        )),

        /*
         * function_prototype :
         *   function_declarator RIGHT_PAREN
         */
        function_prototype: $ => seq(
            $.function_declarator,
            ')',
        ),

        /*
         * function_declarator :
         *   function_header
         *   function_header_with_parameters
         */
        function_declarator: $ => choice(
            $.function_header,
            $.function_header_with_parameters,
        ),

        /*
         * function_header_with_parameters :
         *   function_header parameter_declaration
         *   function_header_with_parameters COMMA parameter_declaration
         */
        function_header_with_parameters: $ => seq(
            $.function_header,
            commaSeparated(field('parameter', $.parameter_declaration)),
        ),

        /*
         * function_header :
         *   fully_specified_type IDENTIFIER LEFT_PAREN
         */
        function_header: $ => seq(
            field('type', $.fully_specified_type),
            field('name', $.identifier),
            '(',
        ),

        /*
         * parameter_declarator :
         *   type_specifier IDENTIFIER
         *   type_specifier IDENTIFIER array_specifier
         */
        parameter_declarator: $ => seq(
            field('type', $.type_specifier),
            field('name', $.identifier),
            optional($.array_specifier),
        ),

        /*
         * parameter_declaration :
         *   type_qualifier parameter_declarator
         *   parameter_declarator
         *   type_qualifier parameter_type_specifier
         *   parameter_type_specifier
         */
        parameter_declaration: $ => choice(
            seq(
                $.type_qualifier,
                choice(
                    $.parameter_declarator,
                    field('type', $.parameter_type_specifier),
                ),
            ),
            $.parameter_declarator,
            field('type', $.parameter_type_specifier),
        ),

        /*
         * parameter_type_specifier :
         *   type_specifier
         */
        parameter_type_specifier: $ => $.type_specifier,

        /*
         * single_declaration :
         *   fully_specified_type
         *   fully_specified_type IDENTIFIER
         *   fully_specified_type IDENTIFIER array_specifier
         *   fully_specified_type IDENTIFIER array_specifier EQUAL initializer
         *   fully_specified_type IDENTIFIER EQUAL initializer
         *
         * init_declarator_list :
         *   single_declaration
         *   init_declarator_list COMMA IDENTIFIER
         *   init_declarator_list COMMA IDENTIFIER array_specifier
         *   init_declarator_list COMMA IDENTIFIER array_specifier EQUAL initializer
         *   init_declarator_list COMMA IDENTIFIER EQUAL initializer
         */
        init_declarator_list: $ => seq(
            field('type', $.fully_specified_type),
            optional(commaSeparated(field('variable', $.init_declarator))),
        ),

        init_declarator: $ => seq(
            field('name', $.identifier),
            optional($.array_specifier),
            optional(seq(
                '=',
                field('value', $.initializer),
            )),
        ),

        /*
         * fully_specified_type :
         *   type_specifier
         *   type_qualifier type_specifier
         */
        fully_specified_type: $ => seq(
            optional($.type_qualifier),
            $.type_specifier,
        ),

        /*
         * invariant_qualifier :
         *  INVARIANT
         */
        invariant_qualifier: $ => 'invariant',

        /*
         * interpolation_qualifier :
         *   SMOOTH
         *   FLAT
         *   NOPERSPECTIVE
         */
        interpolation_qualifier: $ => choice(
            'smooth',
            'flat',
            'noperspective',
        ),

        /*
         * layout_qualifier :
         *   LAYOUT LEFT_PAREN layout_qualifier_id_list RIGHT_PAREN
         *
         * layout_qualifier_id_list :
         *   layout_qualifier_id
         *   layout_qualifier_id_list COMMA layout_qualifier_id
         */
        layout_qualifier: $ => seq(
            'layout',
            '(',
            commaSeparated($.layout_qualifier_id),
            ')',
        ),

        /*
         * constant_expression :
         *   conditional_expression
         *
         * layout_qualifier_id :
         *   IDENTIFIER
         *   IDENTIFIER EQUAL constant_expression
         *   SHARED
         */
        layout_qualifier_id: $ => prec.right(1, choice(
            $.identifier,
            seq($.identifier, '=', $._expression),
        )),

        /*
         * precise_qualifier :
         *   PRECISE
         */
        precise_qualifier: $ => 'precise',

        /*
         * type_qualifier :
         *   single_type_qualifier
         *   type_qualifier single_type_qualifier
         */
        type_qualifier: $ => repeat1(
            $.single_type_qualifier
        ),

        /*
         * single_type_qualifier :
         *   storage_qualifier
         *   layout_qualifier
         *   precision_qualifier
         *   interpolation_qualifier
         *   invariant_qualifier
         *   precise_qualifier
         */
        single_type_qualifier: $ => choice(
            $.storage_qualifier,
            $.layout_qualifier,
            $.precision_qualifier,
            $.interpolation_qualifier,
            $.invariant_qualifier,
            $.precise_qualifier,
        ),

        /*
         * storage_qualifier :
         *   VARYING
         *   CONST
         *   IN
         *   OUT
         *   INOUT
         *   CENTROID
         *   PATCH
         *   SAMPLE
         *   UNIFORM
         *   BUFFER
         *   SHARED
         *   COHERENT
         *   VOLATILE
         *   RESTRICT
         *   READONLY
         *   WRITEONLY
         *   SUBROUTINE
         *   SUBROUTINE LEFT_PAREN type_name_list RIGHT_PAREN
         */
        storage_qualifier: $ => prec.right(choice(
            'attribute',
            'buffer',
            'centroid',
            'coherent',
            'const',
            'in',
            'inout',
            'out',
            'patch',
            'readonly',
            'restrict',
            'sample',
            'shared',
            'subroutine',
            'uniform',
            'varying',
            'volatile',
            'writeonly',
            seq(
                'subroutine',
                '(',
                $.type_name_list,
                ')',
            ),
        )),

        /*
         * type_name_list :
         *   TYPE_NAME
         *   type_name_list COMMA TYPE_NAME
         */
        type_name_list: $ => commaSeparated(
            $.type_name,
        ),

        /*
         * type_specifier :
         *   type_specifier_nonarray
         *   type_specifier_nonarray array_specifier
         */
        type_specifier: $ => prec.left(seq(
            $.type_specifier_nonarray,
            optional($.array_specifier),
        )),

        /*
         * array_specifier :
         *   LEFT_BRACKET RIGHT_BRACKET
         *   LEFT_BRACKET conditional_expression RIGHT_BRACKET
         *   array_specifier LEFT_BRACKET RIGHT_BRACKET
         *   array_specifier LEFT_BRACKET conditional_expression RIGHT_BRACKET
         */
        array_specifier: $ => repeat1(seq(
            '[',
            optional($._expression),
            ']',
        )),

        /*
         * type_specifier_nonarray :
         *   basic_type
         *   struct_specifier
         *   TYPE_NAME
         */
        type_specifier_nonarray: $ => choice(
            $.basic_type,
            $.struct_specifier,
            $.type_name,
        ),

        // https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#basic-types
        basic_type: $ => choice(...BASIC_TYPES),

        /*
         * precision_qualifier :
         *   HIGH_PRECISION
         *   MEDIUM_PRECISION
         *   LOW_PRECISION
         */
        precision_qualifier: () => choice(
            'highp',
            'mediump',
            'lowp',
        ),

        /*
         * struct_specifier :
         *   STRUCT IDENTIFIER LEFT_BRACE struct_declaration_list RIGHT_BRACE
         *   STRUCT LEFT_BRACE struct_declaration_list RIGHT_BRACE
         */
        struct_specifier: $ => seq(
            'struct',
            field('name', optional($.identifier)),
            '{',
            $.struct_declaration_list,
            '}',
        ),

        /*
         * struct_declaration_list :
         *   struct_declaration
         *   struct_declaration_list struct_declaration
         */
        struct_declaration_list: $ => repeat1(
            $.struct_declaration,
        ),

        /*
         * struct_declaration :
         *   type_specifier struct_declarator_list SEMICOLON
         *   type_qualifier type_specifier struct_declarator_list SEMICOLON
         */
        struct_declaration: $ => seq(
            optional($.type_qualifier),
            $.type_specifier,
            $.struct_declarator_list,
            ';',
        ),

        /*
         * struct_declarator_list :
         *   struct_declarator
         *   struct_declarator_list COMMA struct_declarator
         */
        struct_declarator_list: $ => commaSeparated(
            $.struct_declarator,
        ),

        /*
         * struct_declarator :
         *   IDENTIFIER
         *   IDENTIFIER array_specifier
         */
        struct_declarator: $ => seq(
            $.identifier,
            optional($.array_specifier),
        ),

        /*
         * initializer_list :
         *   initializer
         *   initializer_list COMMA initializer
         *
         * initializer :
         *   assignment_expression
         *   LEFT_BRACE initializer_list RIGHT_BRACE
         *   LEFT_BRACE initializer_list COMMA RIGHT_BRACE
         */
        initializer: $ => choice(
            $._expression,
            $.array_initializer,
        ),
        array_initializer: $ => seq(
            '{',
            commaSeparated($.initializer),
            optional(','),
            '}',
        ),

        /*
         * declaration_statement :
         *   declaration
         */
        declaration_statement: $ => $.declaration,

        /*
         * statement :
         *   compound_statement
         *   simple_statement
         */
        statement: $ => choice(
            $.simple_statement,
            $.compound_statement,
        ),

        /*
         * simple_statement :
         *   declaration_statement
         *   expression_statement
         *   selection_statement
         *   switch_statement
         *   case_label
         *   iteration_statement
         *   jump_statement
         */
        simple_statement: $ => choice(
            $.declaration_statement,
            $.expression_statement,
            $.selection_statement,
            $.switch_statement,
            $.case_label,
            $.iteration_statement,
            $.jump_statement,
        ),

        /*
         * compound_statement :
         *   LEFT_BRACE RIGHT_BRACE
         *   LEFT_BRACE statement_list RIGHT_BRACE
         */
        compound_statement: $ => seq(
            '{',
            optional($.statement_list),
            '}',
        ),

        /*
         * statement_no_new_scope :
         *   compound_statement_no_new_scope
         *   simple_statement
         */
        statement_no_new_scope: $ => choice(
            $.compound_statement_no_new_scope,
            $.simple_statement,
        ),

        /*
         * compound_statement_no_new_scope :
         *   LEFT_BRACE RIGHT_BRACE
         *   LEFT_BRACE statement_list RIGHT_BRACE
         */
        compound_statement_no_new_scope: $ => seq(
            '{',
            optional($.statement_list),
            '}',
        ),

        /*
         * statement_list :
         *   statement
         *   statement_list statement
         */
        statement_list: $ => prec.right(repeat1(
            $.statement,
        )),

        /*
         * expression_statement :
         *   SEMICOLON
         *   expression SEMICOLON
         */
        expression_statement: $ => seq(
            optional($._expression),
            ';',
        ),

        /*
         * selection_statement :
         *   IF LEFT_PAREN expression RIGHT_PAREN selection_rest_statement
         */
        selection_statement: $ => seq(
            'if',
            '(',
            $._expression,
            ')',
            $.selection_rest_statement,
        ),

        /*
         * selection_rest_statement :
         *   statement ELSE statement
         *   statement
         */
        selection_rest_statement: $ => prec.right(choice(
            $.statement,
            seq($.statement, 'else', $.statement),
        )),

        /*
         * condition :
         *   expression
         *   fully_specified_type IDENTIFIER EQUAL initializer
         */
        condition: $ => choice(
            $._expression,
            seq(
                $.fully_specified_type,
                $.identifier,
                '=',
                $.initializer,
            ),
        ),

        /*
         * switch_statement_list :
         *   __NOTHING__ 
         *   statement_list
         *
         * switch_statement :
         *   SWITCH LEFT_PAREN expression RIGHT_PAREN LEFT_BRACE switch_statement_list RIGHT_BRACE
         */
        switch_statement: $ => seq(
            'switch',
            '(',
            $._expression,
            ')',
            '{',
            optional($.statement_list),
            '}',
        ),

        /*
         * case_label :
         *   CASE expression COLON
         *   DEFAULT COLON
         */
        case_label: $ => choice(
            seq('case', $._expression, ':'),
            seq('default', ':'),
        ),

        /*
         * iteration_statement :
         *   WHILE LEFT_PAREN condition RIGHT_PAREN statement_no_new_scope
         *   DO statement WHILE LEFT_PAREN expression RIGHT_PAREN SEMICOLON
         *   FOR LEFT_PAREN for_init_statement for_rest_statement RIGHT_PAREN statement_no_new_scope
         */
        iteration_statement: $ => choice(
            seq(
                'while',
                '(',
                $.condition,
                ')',
                $.statement_no_new_scope,
            ),
            seq(
                'do',
                $.statement,
                'while',
                '(',
                $._expression,
                ')',
                ';',
            ),
            seq(
                'for',
                '(',
                $.for_init_statement,
                $.for_rest_statement,
                ')',
                $.statement_no_new_scope,
            ),
        ),

        /*
         * for_init_statement :
         *   expression_statement
         *   declaration_statement
         */
        for_init_statement: $ => choice(
            $.expression_statement,
            $.declaration_statement,
        ),

        /*
         * conditionopt :
         *   condition
         *   __EMPTY__
         *
         * for_rest_statement :
         *   conditionopt SEMICOLON
         *   conditionopt SEMICOLON expression
         */
        for_rest_statement: $ => seq(
            optional($.condition),
            ';',
            optional($._expression),
        ),

        /*
         * jump_statement :
         *   CONTINUE SEMICOLON
         *   BREAK SEMICOLON
         *   RETURN SEMICOLON
         *   RETURN expression SEMICOLON
         *   DISCARD SEMICOLON // Fragment shader only.
         */
        jump_statement: $ => seq(
            choice(
                'continue',
                'break',
                seq('return', optional($._expression)),
                'discard',
            ),
            ';',
        ),

        type_name: $ => $.identifier,

        // https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#character-set
        // line_concatenation: $ => /\\(\r|\n|\r\n)/,
        identifier: $ => choice(
            /[a-zA-Z_][a-zA-Z0-9_]*/,
            /[a-zA-Z_][a-zA-Z0-9_]*\\(\r|\n|\r\n)[a-zA-Z0-9_]+/,
        ),

        line_concatenation: $ => /\\(\r|\n|\r\n)/,

        /* 
         * https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#integers
         *
         * digit :
         *   0
         *   nonzero_digit
         *
         * nonzero_digit : one of
         *   1 2 3 4 5 6 7 9
         *
         * octal_digit : one of
         *   1 2 3 4 5 6 7
         *
         * hexadecimal_digit : one of
         *   0 1 2 3 4 5 6 7 8 9
         *   a b c d e f
         *   A B C D E F
         *
         * decimal_constant :
         *   nonzero_digit
         *   decimal_constant digit
         *
         * octal_constant :
         *   0
         *   nonzero_digit
         *
         * hexadecimal_constant :
         *   0x hexadecimal_digit
         *   0X hexadecimal_digit
         *   hexadecimal_constant hexadecimal_digit
         *
         * integer_suffix :
         *   u
         *   U
         *
         * integer_constant :
         *   decimal_constant
         *   decimal_constant integer_suffix
         *   octal_constant
         *   octal_constant integer_suffix
         *   hexadecimal_constant
         *   hexadecimal_constant integer_suffix
         */
        integer_constant: $ => choice(
            $.decimal_constant,
            $.octal_constant,
            $.hexadecimal_constant,
        ),
        decimal_constant: () => /[1-9][0-9]*[uU]?/,
        octal_constant: () => /0[0-7]*[uU]?/,
        hexadecimal_constant: () => /0[xX][0-9a-fA-F]+[uU]?/,

        /* BOOL */
        bool_constant: () => choice('true', 'false'),

        /*
         * https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#floats
         *
         * floating_suffix : one of
         *   f F lf LF
         *
         * digit_sequence :
         *   digit
         *   digit_sequence digit
         *
         * sign :
         *   MINUS
         *   PLUS
         *
         * epxonent_part :
         *   e digit_sequence
         *   e sign digit_sequence
         *   E digit_sequence
         *   E sign digit_sequence
         *
         * fractional_constant :
         *   digit_sequence DOT digit_sequence
         *   digit_sequence DOT
         *   DOT digit_sequence
         *
         * floating_constant :
         *   fractional_constant
         *   fractional_constant exponent_part
         *   fractional_constant floating_suffix
         *   fractional_constant exponent_part floating_suffix
         *   digit_sequence exponent_part
         *   digit_sequence exponent_part floating_suffix
         */
        float_constant: () => token(seq(
            choice(
                /[0-9]+\.[0-9]+/,
                /\.[0-9]+/,
                /[0-9]+\./,
                /[0-9]+/,
            ),
            optional(/[eE][-+]?[0-9]+/),
            optional(choice('f', 'F', 'lf', 'LF')),
        )),

        // https://github.com/tree-sitter/tree-sitter-c/blob/88592f162e218e3d0de28f1e5d1835e6ef2c57b6/grammar.js#L966
        comment: () => token(choice(
            seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
            seq(
                '/*',
                /[^*]*\*+([^/*][^*]*\*+)*/,
                '/'
            )
        )),
    },
});

function commaSeparated(rule) {
    return seq(
        rule,
        repeat(seq(',', rule)),
    );
}

function preprocessor(command) {
  return alias(new RegExp('#[ \t]*' + command), '#' + command)
}
