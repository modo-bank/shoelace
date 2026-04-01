import { css } from 'lit';

/** Appended after `select.styles.ts` — rules only for `<sl-search-select>`. */
export default css`
  .select__searching,
  .select__empty {
    display: block;
    padding-block: var(--sl-spacing-x-small);
    padding-inline: var(--sl-spacing-medium);
  }
`;
