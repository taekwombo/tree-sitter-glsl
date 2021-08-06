float one = 1.0LF;
/* ^ type
          ^ operator
            ^ number
                 ^ punctuation.delimiter */

uniform uint one = 0x1U;
/* ^ type
        ^ type
                 ^ operator
                   ^ number */

bool t = true;
//       ^ boolean

bool t = false;
//       ^ boolean

void fn () {
    gl_FragCoord = 1.0;
    // ^ constant
}
