// override jasmine to shut down the server when all tests are completed
var _finishCallback = jasmine.Runner.prototype.finishCallback;

exports.onComplete = function(callback) {
    jasmine.Runner.prototype.finishCallback = function() {
        _finishCallback.apply(this);
        callback();
    }
};

global.fail = function(test) {
    throw new Error(test.results_.description);
}

global.pass = function() {
    // do nothing
}