import { html } from 'onefold';

/** A reusable search input component with debounced callback. */
export function SearchInput(onSearch: (query: string) => void, placeholder = 'Search heroes...'): Node {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => onSearch(value), 300);
  };

  return html`
    <div class="search-box">
      <input
        type="text"
        class="search-input"
        placeholder=${placeholder}
        oninput=${handleInput}
      />
    </div>
  `;
}
