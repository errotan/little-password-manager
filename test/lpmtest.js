var assert = require('assert');
var rewire = require('rewire');
var lpm    = rewire('../lpm.js');

describe('Public functions', function() {

  describe('setWin', function() {
    it('should set win instance', function() {

      assert.deepEqual(lpm.__get__('win'), undefined);
      lpm.setWin(1);
      assert.deepEqual(lpm.__get__('win'), 1);

    });
  });

  describe('setDocument', function() {
    it('should set document instance', function() {

      assert.deepEqual(lpm.__get__('document'), undefined);
      lpm.setDocument(1);
      assert.deepEqual(lpm.__get__('document'), 1);

    });
  });

});
