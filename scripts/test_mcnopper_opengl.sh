#!/bin/bash

code=0
failing_files=""

echo "Testing mcnopper_opengl"

for file in ./examples/mcnopper_opengl/**/shader/*.glsl
do
    ./node_modules/.bin/tree-sitter parse $file > /dev/null

    if test $? != 0; then
       failing_files="$failing_files$file\n"
    fi
done

expected_failing_files="$(cat ./scripts/test_mcnopper_opengl_failing.txt)"

if test "$expected_failing_files" != "$failing_files"; then
    printf "Expected failing files differ from the test output.\n"
    printf "expected:\n$expected_failing_files"
    printf "\n"
    printf "received:\n$failing_files"
    code=1
fi

exit $code

