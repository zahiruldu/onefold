import { html } from 'onefold';

export interface Hero {
  id: number;
  name: string;
  slug: string;
  powerstats: {
    intelligence: number;
    strength: number;
    speed: number;
    durability: number;
    power: number;
    combat: number;
  };
  appearance: {
    gender: string;
    race: string | null;
    height: [string, string];
    weight: [string, string];
    eyeColor: string;
    hairColor: string;
  };
  biography: {
    fullName: string;
    alterEgos: string;
    aliases: string[];
    placeOfBirth: string;
    firstAppearance: string;
    publisher: string;
    alignment: string;
  };
  work: {
    occupation: string;
    base: string;
  };
  connections: {
    groupAffiliation: string;
    relatives: string;
  };
  images: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
}

/** A reusable hero card component displaying hero info. */
export function HeroCard(hero: Hero, onSelect?: (hero: Hero) => void): Node {
  const alignment = hero.biography.alignment;
  const alignClass = alignment === 'good' ? 'badge-good' : alignment === 'bad' ? 'badge-bad' : 'badge-neutral';

  return html`
    <div class="hero-card" onclick=${onSelect ? () => onSelect(hero) : undefined}>
      <img class="hero-img" src=${hero.images.md} alt=${hero.name} />
      <div class="hero-info">
        <h3 class="hero-name">${hero.name}</h3>
        <p class="hero-fullname">${hero.biography.fullName || 'Unknown'}</p>
        <span class="badge ${alignClass}">${alignment}</span>
        <span class="hero-publisher">${hero.biography.publisher}</span>
      </div>
    </div>
  `;
}
