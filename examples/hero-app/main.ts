import { createSignal, createResource, html, mount } from 'onefold';
import { SearchInput } from './components/SearchInput';
import { HeroCard, type Hero } from './components/HeroCard';
import { HeroDetail } from './components/HeroDetail';
import { Spinner } from './components/Spinner';
import { ErrorBox } from './components/ErrorBox';
import { fetchAllHeroes } from './api';

function HeroApp(): Node {
  const searchQuery = createSignal('');
  const selectedHero = createSignal<Hero | null>(null);

  // Fetch all heroes once
  const heroes = createResource(
    () => 'all' as const,
    () => fetchAllHeroes()
  );

  // Derived: filtered heroes based on search
  const filteredHeroes = (): Hero[] => {
    const data = heroes.data();
    if (!data) return [];
    const q = searchQuery().toLowerCase();
    if (!q) return data.slice(0, 20); // Show first 20 by default
    return data.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.biography.fullName.toLowerCase().includes(q) ||
        h.biography.publisher.toLowerCase().includes(q)
    );
  };

  const handleSearch = (query: string) => searchQuery.set(query);
  const handleSelect = (hero: Hero) => selectedHero.set(hero);
  const handleBack = () => selectedHero.set(null);

  return html`
    <div class="hero-app">
      <header class="hero-header">
        <h1>Superhero Database</h1>
        <p>Powered by onefold — fine-grained reactive signals, real DOM, zero dependencies</p>
      </header>

      ${() => {
        const selected = selectedHero();
        if (selected) {
          return HeroDetail(selected, handleBack);
        }

        if (heroes.loading()) return Spinner('Loading heroes from API...');
        if (heroes.error()) return ErrorBox('Failed to load heroes.', () => heroes.refetch());

        return html`
          <div class="hero-list-view">
            ${SearchInput(handleSearch)}
            <div class="hero-grid">
              ${() => {
                const list = filteredHeroes();
                if (list.length === 0) {
                  return html`<p class="no-results">No heroes found matching your search.</p>`;
                }
                return list.map((hero) => HeroCard(hero, handleSelect));
              }}
            </div>
          </div>
        `;
      }}
    </div>
  `;
}

mount(HeroApp(), document.getElementById('app')!);
