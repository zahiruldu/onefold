import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { component, getComponentRegistry, getComponentMeta, exportManifest } from '../src/core/meta.ts';

describe('Component metadata', () => {
  it('registers a component with metadata', () => {
    const MyComp = component({
      name: 'MyComp',
      description: 'A test component',
      props: { text: { type: 'string', required: true } },
      events: ['click'],
      tags: ['ui'],
      render: (props: { text: string }) => document.createTextNode(props.text),
    });

    const node = MyComp({ text: 'hello' });
    assert.equal(node.textContent, 'hello');
  });

  it('getComponentMeta retrieves metadata', () => {
    const meta = getComponentMeta('MyComp');
    assert.ok(meta);
    assert.equal(meta!.meta.name, 'MyComp');
    assert.equal(meta!.meta.description, 'A test component');
    assert.deepEqual(meta!.meta.events, ['click']);
  });

  it('getComponentRegistry returns all components', () => {
    const registry = getComponentRegistry();
    assert.ok(registry.has('MyComp'));
  });

  it('exportManifest returns JSON-serializable object', () => {
    const manifest = exportManifest() as any;
    assert.equal(manifest.framework, 'onefold');
    assert.ok(manifest.components.length > 0);
    // Should be serializable without error
    JSON.stringify(manifest);
  });
});
