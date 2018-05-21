//! Copyright (c) 2017-2018 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

const assert = require('assert');
const rewire = require('rewire');
const lpm    = rewire('../lpm.js');

describe('Public functions', function() {

  describe('setWin', function() {
    it('should pass win instance', function() {

      assert.deepEqual(lpm.__get__('win'), undefined);
      lpm.setWin(1);
      assert.deepEqual(lpm.__get__('win'), 1);

    });
  });

  describe('setDocument', function() {
    it('should pass document instance', function() {

      assert.deepEqual(lpm.__get__('dom'), undefined);
      lpm.setDocument(1);
      assert.deepEqual(lpm.__get__('dom'), 1);

    });
  });

});
