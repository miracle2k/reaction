exports.createdActions = [];

exports.reset = function() {
    while(exports.createdActions.length) {
        exports.createdActions.pop();
    }
};
