one = float(1);
/*    ^ type
           ^ punctuation.bracket
             ^ punctuation.bracket
              ^ punctuation.delimiter */

one = obj.method(1);
/*       ^ punctuation.delimiter
          ^ function */

one = obj.property.method(1);
/*^ variable
      ^ variable
          ^ variable
                   ^ function */

void fn () {}
/* ^ type
     ^ function */

float fn (float x, float y) {}
/* ^ type
     ^ function
                ^ parameter
          ^ type
                   ^ type
                         ^ parameter */
void fn ( void ) {}
/* ^ type
     ^ function
          ^ type */
