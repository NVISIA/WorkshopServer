echo off

rem Install node dependencies locally
call npm install

rem run the tests
call node ./node_modules/jasmine-node/bin/jasmine-node --color spec