#!/bin/bash

code=0
failing_files=""

for file in ./examples/glsl-optimizer/tests/**/*-in{.txt,ES.txt,ES3.txt}
do
    ./node_modules/.bin/tree-sitter parse $file > /dev/null

    if test $? != 0; then
       failing_files="$failing_files$file\n"
    fi
done

expected_failing_files="$(cat ./scripts/test_glsl_optimizer_failing.txt)"

if test "$expected_failing_files" != "$failing_files"; then
    printf "Expected failing files differ from the test output.\n"
    printf "expected:\n$expected_failing_files"
    printf "\n"
    printf "received:\n$failing_files"
    code=1
fi

exit $code

