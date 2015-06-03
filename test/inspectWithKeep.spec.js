var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src');

describe('with the keep reset', function() {
    beforeEach(function () {
        Reflux.__keep.reset();
    });

    describe('when an action is created', function() {
        var action;

        beforeEach(function () {
            action = Reflux.createAction();
        });

        it('should be in the keep', function() {
            assert.equal(Reflux.__keep.createdActions[0], action);
        });
    });
});
