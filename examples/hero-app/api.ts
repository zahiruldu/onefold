import type { Hero } from './components/HeroCard';

const API_BASE = 'https://akabab.github.io/superhero-api/api';

/** Fetch all heroes from the superhero API. */
export async function fetchAllHeroes(): Promise<Hero[]> {
  const res = await fetch(`${API_BASE}/all.json`);
  if (!res.ok) throw new Error(`Failed to fetch heroes: ${res.status}`);
  return res.json();
}

/** Fetch a single hero by ID. */
export async function fetchHeroById(id: number): Promise<Hero> {
  const res = await fetch(`${API_BASE}/id/${id}.json`);
  if (!res.ok) throw new Error(`Failed to fetch hero #${id}: ${res.status}`);
  return res.json();
}
