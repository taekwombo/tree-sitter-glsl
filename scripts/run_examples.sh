#!/bin/bash

code=0

for script in ./scripts/test_*.sh
do
    bash $script

    if test $? != 0; then
        code=$?
    fi
done

exit $code
