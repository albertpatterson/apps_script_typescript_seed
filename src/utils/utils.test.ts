import {expect} from 'chai';

import {getMessage} from './utils';

describe('getMessage', () => {
  it('provides a message', () => {
    expect(getMessage()).to.equal('hello world');
  });
});
