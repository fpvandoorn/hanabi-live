#!/bin/bash

# Get the directory of this script
# https://stackoverflow.com/questions/59895/getting-the-source-directory-of-a-bash-script-from-within
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Use "go install" to create a new binary and then run it
# We explicitly do not use "go run ." because on Windows, Windows Firewall will pop up a new alert
# every time we want to re-run the server
cd "$DIR/src"
go install
if [ $? -eq 0 ]; then
    # The binary is called "src" by default, since the directory name is "src"
    mv "$GOPATH/bin/src" "$GOPATH/bin/hanabi-live"
    cd "$DIR"
    "$GOPATH/bin/hanabi-live"
else
    echo "hanabi-live - Go compilation failed!"
fi
