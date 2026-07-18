/**
 * Settings page — preferences + profile form.
 * Demonstrates: persisted signals, theme, i18n, createForm, validation, announce
 */
import {
  html, inject, announce,
  createForm, required, email, minLength, maxLength,
} from '../../../src/index';
import { i18n } from '../config/i18n';
import { theme } from '../config/theme';
import { sidebarCollapsed, preferredLocale, notificationsEnabled } from '../services/store';
import { NotifyToken } from '../services/notifications';

export function SettingsPage(): Node {
  const contactForm = createForm({
    name: { initial: '', rules: [required('Name is required'), minLength(2)] },
    contactEmail: { initial: '', rules: [required('Email is required'), email('Invalid email format')] },
    bio: { initial: '', rules: [maxLength(500, 'Bio must be under 500 characters')] },
  });

  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t('settings.title')}<span class="feature-badge">Persist + Theme + i18n + Forms</span></h2>
      </div>

      <div class="settings-grid">
        <div class="card">
          <div class="settings-section">
            <h3>${() => i18n.t('settings.theme')}</h3>
            <div class="setting-row">
              <span>Dark Mode</span>
              <button
                class=${() => `toggle ${theme.current() === 'dark' ? 'on' : ''}`}
                onclick=${() => theme.toggle()}
                aria-label="Toggle dark mode"
                role="switch"
                aria-checked=${() => theme.current() === 'dark' ? 'true' : 'false'}
              ></button>
            </div>
            <div class="setting-row">
              <span>Current Theme</span>
              <span class="setting-value">${() => theme.current()}</span>
            </div>
          </div>

          <div class="settings-section">
            <h3>${() => i18n.t('settings.language')}</h3>
            <div class="setting-row">
              <span>Locale</span>
              <select class="form-select inline-select"
                onchange=${(e: Event) => preferredLocale.set((e.target as HTMLSelectElement).value)}
              >
                <option value="en" selected>English</option>
                <option value="es">Espanol</option>
              </select>
            </div>
            <div class="setting-row">
              <span>Active Locale</span>
              <span class="setting-value">${() => i18n.locale()}</span>
            </div>
          </div>

          <div class="settings-section">
            <h3>${() => i18n.t('settings.notifications')}</h3>
            <div class="setting-row">
              <span>Enable Notifications</span>
              <button
                class=${() => `toggle ${notificationsEnabled() ? 'on' : ''}`}
                onclick=${() => notificationsEnabled.set(!notificationsEnabled())}
                aria-label="Toggle notifications"
                role="switch"
                aria-checked=${() => notificationsEnabled() ? 'true' : 'false'}
              ></button>
            </div>
            <div class="setting-row">
              <span>Sidebar Collapsed</span>
              <button
                class=${() => `toggle ${sidebarCollapsed() ? 'on' : ''}`}
                onclick=${() => sidebarCollapsed.set(!sidebarCollapsed())}
                aria-label="Toggle sidebar"
                role="switch"
                aria-checked=${() => sidebarCollapsed() ? 'true' : 'false'}
              ></button>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Profile Form <span class="feature-badge">Form Validation</span></h3>
          <div class="form-body">
            <div class="form-group">
              <label class="form-label">${() => i18n.t('form.name')}</label>
              <input class="form-input" type="text" oninput=${contactForm.fields.name.handle} placeholder="Your name" />
              <div class="form-error">${() => contactForm.fields.name.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">${() => i18n.t('form.email')}</label>
              <input class="form-input" type="email" oninput=${contactForm.fields.contactEmail.handle} placeholder="your@email.com" />
              <div class="form-error">${() => contactForm.fields.contactEmail.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-input" rows="4" oninput=${contactForm.fields.bio.handle} placeholder="Tell us about yourself..."></textarea>
              <div class="form-error">${() => contactForm.fields.bio.error()}</div>
            </div>
            <div class="btn-row">
              <button class="btn btn-primary" onclick=${() => contactForm.submit((vals) => {
                inject(NotifyToken).add(`Profile saved for ${vals.name}`);
                announce('Profile saved successfully');
              })}>${() => i18n.t('common.save')}</button>
              <button class="btn btn-ghost" onclick=${() => contactForm.reset()}>${() => i18n.t('form.reset')}</button>
            </div>
            <p class="form-status">
              Form valid: ${() => contactForm.valid() ? 'Yes' : 'No'} |
              Dirty: ${() => contactForm.dirty() ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
