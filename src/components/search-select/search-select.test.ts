import '../../../dist/shoelace.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { clickOnElement } from '../../internal/test.js';
import sinon from 'sinon';
import type SlOption from '../option/option.js';
import type SlSearchSelect from './search-select.js';

function getDefaultOptionsSlotWrapper(el: SlSearchSelect) {
  const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])');
  return slot?.parentElement as HTMLDivElement | undefined;
}

describe('<sl-search-select>', () => {
  it('should render an editable display input', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select>
        <sl-option value="a">A</sl-option>
      </sl-search-select>
    `);
    const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
    expect(displayInput.readOnly).to.be.false;
  });

  it('should update searchQuery and emit sl-input when typing', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select>
        <sl-option value="a">Alpha</sl-option>
      </sl-search-select>
    `);
    const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
    const inputHandler = sinon.spy();
    el.addEventListener('sl-input', inputHandler);

    displayInput.value = 'al';
    displayInput.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.searchQuery).to.equal('al');
    expect(inputHandler).to.have.been.calledOnce;
  });

  it('should clear value and preserve typed character when typing with a selection', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select value="option-1">
        <sl-option value="option-1">Option 1</sl-option>
        <sl-option value="option-2">Option 2</sl-option>
      </sl-search-select>
    `);
    const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
    const changeHandler = sinon.spy();
    const inputHandler = sinon.spy();
    el.addEventListener('sl-change', changeHandler);
    el.addEventListener('sl-input', inputHandler);

    displayInput.value = 'x';
    displayInput.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.value).to.equal('');
    expect(el.searchQuery).to.equal('x');
    expect(changeHandler).to.have.been.calledOnce;
    expect(inputHandler).to.have.been.calledOnce;
  });

  it('should not open the listbox when the display input receives focus only', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select>
        <sl-option value="a">A</sl-option>
      </sl-search-select>
    `);
    const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
    displayInput.focus();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('should open the listbox when the user types a non-empty character', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select>
        <sl-option value="a">A</sl-option>
      </sl-search-select>
    `);
    const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
    displayInput.focus();
    await el.updateComplete;
    expect(el.open).to.be.false;

    displayInput.value = 'a';
    displayInput.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await waitUntil(() => el.open);
    expect(el.open).to.be.true;
  });

  it('should close the listbox after selecting an option', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select>
        <sl-option value="a">A</sl-option>
        <sl-option value="b">B</sl-option>
      </sl-search-select>
    `);
    const secondOption = el.querySelectorAll<SlOption>('sl-option')[1];

    await el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;

    await clickOnElement(secondOption);
    await el.updateComplete;
    await waitUntil(() => !el.open);

    expect(el.open).to.be.false;
    expect(el.value).to.equal('b');
  });

  it('should reflect searching on aria-busy and hide the options slot while searching', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select searching>
        <span slot="searching">Loading</span>
        <sl-option value="a">A</sl-option>
      </sl-search-select>
    `);
    const displayInput = el.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
    await el.updateComplete;

    expect(el.searching).to.be.true;
    expect(displayInput.getAttribute('aria-busy')).to.equal('true');
    expect(el.shadowRoot!.querySelector('[part="searching"]')).to.exist;
    expect(getDefaultOptionsSlotWrapper(el)?.hasAttribute('hidden')).to.be.true;
  });

  it('should show the empty slot and hide the options slot when there are no options', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select>
        <span slot="empty">No results</span>
      </sl-search-select>
    `);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('[part="empty"]')).to.exist;
    expect(getDefaultOptionsSlotWrapper(el)?.hasAttribute('hidden')).to.be.true;
  });

  it('should not render the empty region when options exist', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select>
        <span slot="empty">No results</span>
        <sl-option value="a">A</sl-option>
      </sl-search-select>
    `);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('[part="empty"]')).to.be.null;
    expect(getDefaultOptionsSlotWrapper(el)?.hasAttribute('hidden')).to.be.false;
  });

  it('should prefer searching over empty when there are no options', async () => {
    const el = await fixture<SlSearchSelect>(html`
      <sl-search-select searching>
        <span slot="searching">Loading</span>
        <span slot="empty">No results</span>
      </sl-search-select>
    `);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('[part="searching"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="empty"]')).to.be.null;
  });
});
