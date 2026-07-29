import { currentRoute, html, Link, mount, Router } from 'onefold';
import { HomePage } from './pages/Home';
import { AboutPage } from './pages/About';
import { PostPage } from './pages/Post';
import { StylingPage } from './pages/Styling';
import { NotFoundPage } from './pages/NotFound';

function NavBar(): Node {
  return html`
    <nav class="navbar">
      <div class="nav-brand">
        ${Link('/', 'onefold blog', 'brand-link')}
      </div>
      <div class="nav-links">
        ${Link('/', 'Home', () => currentRoute() === '/' ? 'nav-link active' : 'nav-link')}
        ${Link('/styling', 'Styling', () => currentRoute() === '/styling' ? 'nav-link active' : 'nav-link')}
        ${Link('/about', 'About', () => currentRoute() === '/about' ? 'nav-link active' : 'nav-link')}
      </div>
    </nav>
  `;
}

function App(): Node {
  const router = Router(
    [
      { path: '/', view: (params) => HomePage(params) },
      { path: '/about', view: (params) => AboutPage(params) },
      { path: '/styling', view: (params) => StylingPage(params) },
      { path: '/posts/:id', view: (params) => PostPage(params) },
    ],
    NotFoundPage
  );

  return html`
    <div class="app-shell">
      ${NavBar()}
      <main class="main-content">
        ${router}
      </main>
      <footer class="footer">
        <p>Built with onefold — fine-grained signals · real DOM · zero dependencies</p>
      </footer>
    </div>
  `;
}

mount(App(), document.getElementById('app')!);
