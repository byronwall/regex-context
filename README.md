# regex-context README

This extension is meant to provide better control over string processing operations in VS Code. The main focus is to allow for recursive application of regexes to do find/replace operations in open files.

## Features

The core feature is a find/replace mechanism which is first limited by a "context". The context is used to do an initial find. The results of that find are then eligible for the find replace command.

The eventual goal is to support nested contexts. Need to see how the first version works though.

## Extension Settings

No settings added

## Known Issues

May not have the correct state on initial load. Likely need a serialization step.

## Release Notes

See CHANGELOG
