import { html } from 'onefold';
import { StatBar } from './StatBar';
import type { Hero } from './HeroCard';

/** A reusable hero detail panel showing full stats. */
export function HeroDetail(hero: Hero, onBack: () => void): Node {
  const stats = hero.powerstats;

  return html`
    <div class="hero-detail">
      <button class="btn btn-back" onclick=${onBack}>&larr; Back</button>
      <div class="hero-detail-header">
        <img class="hero-detail-img" src=${hero.images.lg} alt=${hero.name} />
        <div>
          <h2>${hero.name}</h2>
          <p class="hero-fullname">${hero.biography.fullName || 'Unknown identity'}</p>
          <p class="hero-meta">
            ${hero.appearance.race || 'Unknown race'} · ${hero.appearance.gender} · ${hero.biography.publisher}
          </p>
          <p class="hero-meta">${hero.biography.firstAppearance}</p>
        </div>
      </div>
      <h3>Power Stats</h3>
      <div class="stats-grid">
        ${StatBar('Intelligence', stats.intelligence)}
        ${StatBar('Strength', stats.strength)}
        ${StatBar('Speed', stats.speed)}
        ${StatBar('Durability', stats.durability)}
        ${StatBar('Power', stats.power)}
        ${StatBar('Combat', stats.combat)}
      </div>
    </div>
  `;
}
