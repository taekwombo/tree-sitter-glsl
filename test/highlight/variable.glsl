void fn () {
    const test = 0;
    //    ^ variable

    #define TEST
    //      ^ variable

    #undef TEST
    //     ^ variable

    call(gl_SomeName);
    //   ^ constant

    test = a + b;
    // <- variable
    //     ^ variable
    //         ^ variable
}
