#!/bin/bash

# Get the directory of this script
# https://stackoverflow.com/questions/59895/getting-the-source-directory-of-a-bash-script-from-within
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

watchify "$DIR/public/js/dev2/main.js" --outfile "$DIR/public/js/main.bundled.js" --verbose --debug