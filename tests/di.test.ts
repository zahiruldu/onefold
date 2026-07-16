import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createToken, provide, inject, tryInject, runWithProviders } from '../src/core/di.ts';

describe('DI (provide/inject)', () => {
  it('provides and injects a value', () => {
    const TOKEN = createToken<number>('num');
    provide(TOKEN, 42);
    assert.equal(inject(TOKEN), 42);
  });

  it('throws on missing token', () => {
    const TOKEN = createToken<string>('missing');
    assert.throws(() => inject(TOKEN), /No provider found/);
  });

  it('tryInject returns undefined for missing token', () => {
    const TOKEN = createToken<string>('optional');
    assert.equal(tryInject(TOKEN), undefined);
  });

  it('scoped providers override global', () => {
    const TOKEN = createToken<string>('scoped');
    provide(TOKEN, 'global');

    let innerValue = '';
    runWithProviders([[TOKEN, 'scoped']], () => {
      innerValue = inject(TOKEN);
    });

    assert.equal(innerValue, 'scoped');
    assert.equal(inject(TOKEN), 'global');
  });

  it('nested scopes resolve innermost first', () => {
    const TOKEN = createToken<number>('nested');
    provide(TOKEN, 1);

    let result = 0;
    runWithProviders([[TOKEN, 2]], () => {
      runWithProviders([[TOKEN, 3]], () => {
        result = inject(TOKEN);
      });
    });
    assert.equal(result, 3);
  });
});
