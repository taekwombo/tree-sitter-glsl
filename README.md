tree-sitter-glsl
================

[GLSL] grammar for [tree-sitter]

> In general the above ([GLSL]) grammar describes a super set of the OpenGL Shading Language. Certain constructs that are valid purely in terms of the grammar are disallowed by statements elsewhere in this specification.

### Development

Install the dependencies:

    npm install

Run the tests:

    npm run test

Run the build and tests in watch mode:

    npm run test:watch

Test parser against example files (requires git submodule initialisation):

    npm run test:examples

### Git Submodules

* [glsl-optimizer]
* [@McNopper OpenGL]

#### References
* [tree-sitter-c]
* [GLSL Specification]

[tree-sitter-c]: https://github.com/tree-sitter/tree-sitter-c
[GLSL Specification]: https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html
[glsl-optimizer]: https://github.com/aras-p/glsl-optimizer
[@McNopper OpenGL]: https://github.com/McNopper/OpenGL
[GLSL]: https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#shading-language-grammar
[tree-sitter]: https://github.com/tree-sitter/tree-sitter
