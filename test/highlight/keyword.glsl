struct Test {
// <- keyword
    float x;
};

void fn () {
    switch (1) {
    // <- keyword
        case 1: {
    //  ^ keyword
        }

        default:
    //  ^ keyword
    }

    if (0) {
    // <- keyword
    } else {
    // ^ keyword
    }

    do {
    // <- keyword
    } while (0);
    // ^ keyword

    for (i = 0;;) {
    // <- keyword
    }

    break;
    // <- keyword

    continue;
    // <- keyword

    return;
    // <- keyword

    discard;
    // <- keyword
}
