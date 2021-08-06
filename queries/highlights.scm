(token_string) @string

[
 "continue"
 "break"
 "return"
 "discard"
 "struct"
 "switch"
 "case"
 "default"
 "if"
 "else"
 "do"
 "while"
 "for"
 "#define"
 "#undef"
 "#ifdef"
 "#ifndef"
 "#if"
 "#else"
 "#elif"
 "#endif"
 "#error"
 "#pragma"
 "#extension"
 "#version"
 "#line"
] @keyword

[
 "++"
 "--"
 "+"
 "-"
 "!"
 "~"
 "*"
 "/"
 "%"
 "<<"
 ">>"
 "<"
 ">"
 "<="
 ">="
 "=="
 "!="
 "&"
 "^"
 "|"
 "&&"
 "^^"
 "||"
 "="
 "*="
 "/="
 "%="
 "+="
 "-="
 "<<="
 ">>="
 "&="
 "^="
 "|="
] @operator

[ "." ";" ":" "," ] @punctuation.delimiter

[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket

(conditional_expression [ "?" ":" ] @conditional)

(bool_constant) @boolean

(line_concatenation) @string.escape

[
 (integer_constant)
 (float_constant)
] @number

[
 (basic_type)
 (type_qualifier)
 (type_specifier (identifier))
 "void"
] @type

(struct_specifier name: (identifier) @type)

(function_prototype name: (identifier) @function)
(function_call name: (identifier) @function)
(function_call name: (field_select_expression
                       (identifier) @function . ))

(parameter_declaration
  name: (identifier) @parameter)

((identifier) @constant
            (#match? @constant "gl_"))

(identifier) @variable

(comment) @comment
