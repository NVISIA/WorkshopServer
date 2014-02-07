#!/bin/bash

# install node dependencies
sudo npm install

# run the tests
node ./node_modules/jasmine-node/bin/jasmine-node --color --captureExceptions spec