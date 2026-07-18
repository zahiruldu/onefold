var q=null;function G(e,t){q?q(e,t):t()}var de=new Map;function J(e){return de.get(e)}var k=null,pe=0,fe=new Set,H=class{constructor(t,o){this.deps=new Set,this.active=!0,this.fn=t,this.label=o}run(){if(!this.active)return;this.cleanup();let t=k;k=this;try{G(this.label,this.fn)}finally{k=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},M=class{constructor(t){this.value=t,this.subscribers=new Set}get(){return k&&(this.subscribers.add(k),k.deps.add(this)),this.value}set(t){let o=typeof t=="function"?t(this.value):t;Object.is(o,this.value)||(this.value=o,this.notify())}peek(){return this.value}notify(){if(pe>0)for(let t of this.subscribers)fe.add(t);else{let t=Array.from(this.subscribers);for(let o=0;o<t.length;o++)t[o].run()}}};function h(e){let t=new M(e),o=(()=>t.get());return o.set=n=>t.set(n),o.peek=()=>t.peek(),o}function v(e,t="effect"){let o=new H(e,t);return o.run(),()=>o.dispose()}var ue=/^\s*(javascript|data|vbscript):/i,me=/^on/i;function z(e){return ue.test(e)}function O(e){return me.test(e)}function X(e){let t=document.createElement("template");t.innerHTML=e;let o=n=>{let r=[];n.childNodes.forEach(s=>{if(s.nodeType===Node.ELEMENT_NODE){let i=s,a=i.tagName.toLowerCase();if(a==="script"||a==="style"||a==="iframe"||a==="object"||a==="embed"||a==="form"){r.push(s);return}Array.from(i.attributes).forEach(l=>{(O(l.name)||(l.name==="href"||l.name==="src")&&z(l.value))&&i.removeAttribute(l.name)}),o(i)}}),r.forEach(s=>s.remove())};return o(t.content),t.innerHTML}var R=null;function he(){return R||(typeof window<"u"&&window.trustedTypes&&(R=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>X(e)})),R)}function I(e){let t=he();return t?t.createHTML(e):X(e)}function D(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function j(e,t){t.textContent="",t.appendChild(e)}var N=new WeakMap,F=null;function ge(){if(F||typeof MutationObserver>"u"||typeof document>"u")return;F=new MutationObserver(t=>{for(let o of t)o.removedNodes.forEach(K)});let e=document.documentElement??document;F.observe(e,{childList:!0,subtree:!0})}function K(e){let t=N.get(e);if(t){for(let o of t)try{o()}catch(n){console.error("[onefold] Error while disposing a reactive binding:",n)}N.delete(e)}e.childNodes.forEach(K)}function S(e,t){ge();let o=N.get(e);o||(o=new Set,N.set(e,o)),o.add(t)}var y="\0nf_",w=/\x00nf_(\d+)\x00/g;function be(e){return`${y}${e}\0`}function m(e,t){return e.charAt(t)}function B(e){return parseInt(e[1]??"0",10)}function xe(e,t){let o="";for(let i=0;i<e.length;i++)o+=e[i],i<t.length&&(o+=be(i));let n=[],r=0,s=o.length;for(;r<s;){if(m(o,r)==="<"){if(o.startsWith("<!--",r)){let b=o.indexOf("-->",r+4);r=b===-1?s:b+3;continue}if(m(o,r+1)==="/"){let b=o.indexOf(">",r),L=o.slice(r+2,b).trim();n.push({kind:1,tag:L}),r=b+1;continue}let l=ve(o,r),p=m(o,l-1)==="/",c=o.slice(r+1,p?l-1:l),{tag:u,attrs:g}=ye(c,t);n.push({kind:0,tag:u});for(let b of g)n.push(b);p&&n.push({kind:1,tag:u}),r=l+1;continue}let i=o.indexOf("<",r),a=i===-1?o.slice(r):o.slice(r,i);if(r=i===-1?s:i,a.trim()||w.test(a)){w.lastIndex=0;let l=0,p;for(;(p=w.exec(a))!==null;){let u=a.slice(l,p.index);u&&n.push({kind:3,value:u}),n.push({kind:4,value:t[B(p)]}),l=p.index+p[0].length}let c=a.slice(l);c&&c.trim()&&n.push({kind:3,value:c})}}return n}function ve(e,t){let o=null;for(let n=t+1;n<e.length;n++){let r=m(e,n);if(o)r===o&&(o=null);else if(r==='"'||r==="'")o=r;else if(r===">")return n}return e.length-1}function $(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function ye(e,t){let o=e.search(/[\s/]/),n=o===-1?e:e.slice(0,o),r=[];if(o===-1)return{tag:n,attrs:r};let s=e.slice(o).trim();if(!s)return{tag:n,attrs:r};let i=0,a=s.length;for(;i<a;){for(;i<a&&$(m(s,i));)i++;if(i>=a)break;if(s.startsWith(y,i)){let c=s.indexOf("\0",i+y.length),u=parseInt(s.slice(i+y.length,c),10),g=t[u];if(g&&typeof g=="object")for(let[b,L]of Object.entries(g))r.push({kind:2,name:b,value:L});i=c+1;continue}let l=i;for(;i<a&&m(s,i)!=="="&&!$(m(s,i));)i++;let p=s.slice(l,i);if(!p){i++;continue}for(;i<a&&$(m(s,i));)i++;if(i>=a||m(s,i)!=="="){r.push({kind:2,name:p,value:!0});continue}for(i++;i<a&&$(m(s,i));)i++;if(s.startsWith(y,i)){let c=s.indexOf("\0",i+y.length),u=parseInt(s.slice(i+y.length,c),10);r.push({kind:2,name:p,value:t[u]}),i=c+1}else if(m(s,i)==='"'||m(s,i)==="'"){let c=m(s,i);i++;let u=i;for(;i<a&&m(s,i)!==c;)i++;let g=s.slice(u,i);i++,r.push({kind:2,name:p,value:Q(g,t)})}else{let c=i;for(;i<a&&!$(m(s,i));)i++;let u=s.slice(c,i);r.push({kind:2,name:p,value:Q(u,t)})}}return{tag:n,attrs:r}}function Q(e,t){w.lastIndex=0;let o=w.exec(e);if(!o)return e;if(o.index===0&&o[0].length===e.length)return t[B(o)];w.lastIndex=0;let n=[],r=0,s;for(;(s=w.exec(e))!==null;){s.index>r&&n.push(e.slice(r,s.index));let i=t[B(s)];n.push(typeof i=="function"?i:()=>i),r=s.index+s[0].length}return r<e.length&&n.push(e.slice(r)),()=>n.map(i=>typeof i=="function"?i():i).join("")}function we(e){let t=document.createDocumentFragment(),o=[t],n=t;for(let r of e)switch(r.kind){case 0:{let s=document.createElement(r.tag);n.appendChild(s),o.push(s),n=s;break}case 1:{o.pop(),n=o.length>0?o[o.length-1]:t;break}case 2:{ke(n,r.name,r.value);break}case 3:{n.appendChild(document.createTextNode(r.value));break}case 4:{Y(n,r.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function ke(e,t,o){if(t==="ref"){typeof o=="function"&&o(e);return}if(t==="class"){A(o,n=>Se(e,n),e);return}if(t==="style"){A(o,n=>Object.assign(e.style,n??{}),e);return}if(O(t)&&typeof o=="function"){e.addEventListener(t.slice(2).toLowerCase(),o);return}if(t.startsWith("d-")){let n=J(t.slice(2));n?A(o,r=>n(e,r),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}A(o,n=>$e(e,t,n),e)}function A(e,t,o){if(typeof e=="function"){let n=v(()=>t(e()));S(o,n)}else t(e)}function Se(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,o])=>o).map(([o])=>o).join(" ")):e.className=""}function $e(e,t,o){if(o===!1||o==null){e.removeAttribute(t);return}if(o===!0){e.setAttribute(t,"");return}let n=String(o);if((t==="href"||t==="src"||t==="action"||t==="formaction")&&z(n)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,n),e.removeAttribute(t);return}e.setAttribute(t,n)}function Y(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let o of t)Y(e,o);return}if(typeof t=="function"){let o=document.createComment("expr-start"),n=document.createComment("expr-end");e.appendChild(o),e.appendChild(n);let r=v(()=>{let s=t(),i=o.parentNode;if(!i)return;let a=o.nextSibling;for(;a&&a!==n;){let p=a.nextSibling;i.removeChild(a),a=p}let l=Z(s);i.insertBefore(l,n)});S(e,r);return}if(D(t)){let o=document.createElement("span");o.innerHTML=I(t.html),e.appendChild(o);return}e.appendChild(document.createTextNode(String(t)))}}function Z(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(D(e)){let t=document.createElement("span");return t.innerHTML=I(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let o of e)t.appendChild(Z(o));return t}return document.createTextNode(String(e))}function d(e,...t){let o=xe(e,t);return we(o)}var Ce=0,ee=new Map;function Ee(){return`nf-${(Ce++).toString(36)}`}function oe(e,t){let o=`.${t}`,n="",r=0,s=e.length;for(;r<s;){for(;r<s&&/\s/.test(e[r]);)n+=e[r],r++;if(r>=s)break;if(e[r]==="@"){let c=r;for(;r<s&&e[r]!=="{";)r++;n+=e.slice(c,r),r<s&&(n+=e[r],r++);let u=te(e,r-1),g=u.slice(1,-1);n+=oe(g,t),n+="}",r+=u.length-1;continue}let i=r;for(;r<s&&e[r]!=="{";)r++;let a=e.slice(i,r).trim();if(!a||r>=s)break;let l=a.split(",").map(c=>(c=c.trim(),c&&(c===":root"||c===":host"?o:c.startsWith("&")?o+c.slice(1):`${o} ${c}`))).join(", ");n+=l;let p=te(e,r);n+=p,r+=p.length}return n}function te(e,t){if(e[t]!=="{")return"";let o=0,n=t;for(;n<e.length;){if(e[n]==="{")o++;else if(e[n]==="}"&&(o--,o===0))return e.slice(t,n+1);n++}return e.slice(t)}function Te(e,t){if(typeof document>"u"||document.getElementById(t))return;let o=document.createElement("style");o.id=t,o.textContent=e,document.head.appendChild(o)}function x(e,...t){let o="";for(let a=0;a<e.length;a++)o+=e[a],a<t.length&&(o+=String(t[a]));let n=ee.get(o);if(n)return n;let r=Ee(),s=oe(o,r);Te(s,`style-${r}`);let i={scope:r,css:s};return ee.set(o,i),i}var C=null,W=null;function E(){return W===null&&(W=typeof window<"u"&&window.location.protocol==="file:"),W}function ne(){return typeof window>"u"?"/":E()?window.location.hash.slice(1)||"/":window.location.pathname}function _(){if(C)return C;if(C=h(ne()),typeof window<"u"){let e=E()?"hashchange":"popstate";window.addEventListener(e,()=>C.set(ne()))}return C}function re(e){if(typeof window>"u")return;let t=_();E()?window.location.hash=e:(window.history.pushState({},"",e),t.set(e))}function T(){return _()()}function Pe(e,t){let o=e.split("/"),n=t.split("/");if(o.length!==n.length)return null;let r={};for(let s=0;s<o.length;s++){let i=o[s],a=n[s];if(i.startsWith(":"))r[i.slice(1)]=decodeURIComponent(a);else if(i!==a)return null}return r}function U(e,t){let o=_(),n=document.createElement("div"),r=v(()=>{let s=o(),i=null;if(Array.isArray(e))for(let a of e){let l=Pe(a.path,s);if(l!==null){i=a.view(l);break}}else{let a=e[s];a&&(i=a())}n.textContent="",n.appendChild(i??t())});return S(n,r),n}function f(e,t,o){let n=document.createElement("a");if(n.setAttribute("href",E()?`#${e}`:e),o)if(typeof o=="function"){let r=v(()=>{n.className=o()});S(n,r)}else n.className=o;return n.addEventListener("click",r=>{E()||(r.preventDefault(),re(e))}),typeof t=="string"?n.textContent=t:n.appendChild(t),n}var Re=[{id:1,title:"Getting Started with Nanoframe",excerpt:"Learn how to build reactive UIs with zero dependencies and fine-grained signals.",date:"2026-07-01"},{id:2,title:"Signals vs Virtual DOM",excerpt:"Why fine-grained reactivity outperforms diffing on update-heavy workloads.",date:"2026-06-28"},{id:3,title:"Building a Router from Scratch",excerpt:"Client-side routing with the History API in under 50 lines of TypeScript.",date:"2026-06-20"},{id:4,title:"The html`` Tagged Template",excerpt:"Write templates that look like HTML with full reactive bindings \u2014 no compiler needed.",date:"2026-06-15"}];function ie(e){return d`
    <div class="page">
      <section class="hero-section">
        <h1>Nanoframe Blog</h1>
        <p class="hero-subtitle">Exploring modern web development with fine-grained reactivity</p>
      </section>

      <section class="posts-section">
        <h2>Recent Posts</h2>
        <div class="post-list">
          ${Re.map(t=>d`
              <article class="post-card">
                <span class="post-date">${t.date}</span>
                <h3>${f(`/posts/${t.id}`,t.title,"post-link")}</h3>
                <p class="post-excerpt">${t.excerpt}</p>
              </article>
            `)}
        </div>
      </section>
    </div>
  `}function se(e){return d`
    <div class="page">
      <h1>About</h1>
      <p class="about-intro">
        This is a demo blog app built with <strong>onefold</strong> to showcase client-side routing
        with dynamic parameters, navigation links, and page transitions — all in under 5kb of framework code.
      </p>

      <h2>Features Demonstrated</h2>
      <ul class="feature-list">
        <li><strong>Router</strong> — pattern-based route matching with dynamic <code>:id</code> params</li>
        <li><strong>Link</strong> — SPA navigation without full page reloads</li>
        <li><strong>html template</strong> — declarative markup with reactive bindings</li>
        <li><strong>currentRoute()</strong> — reactive route signal for active nav highlighting</li>
        <li><strong>navigate()</strong> — programmatic navigation from JS</li>
      </ul>

      <h2>How the Routing Works</h2>
      <pre><code>import { Router, Link, navigate } from 'onefold';

// Define routes with patterns
const app = Router([
  { path: '/', view: () => HomePage() },
  { path: '/about', view: () => AboutPage() },
  { path: '/posts/:id', view: (params) => PostPage(params) },
], () => NotFoundPage());

// Link component for declarative navigation
Link('/about', 'About Us')

// Programmatic navigation
navigate('/posts/3');</code></pre>

      <p>${f("/","\u2190 Back to Home","btn")}</p>
    </div>
  `}var Ne={1:{id:1,title:"Getting Started with Nanoframe",date:"2026-07-01",author:"Core Team",content:`
      <p>Nanoframe is a tiny, dependency-free TypeScript UI library. It uses fine-grained
      reactive signals bound directly to real DOM nodes \u2014 no virtual DOM, no diffing.</p>
      <h3>Installation</h3>
      <pre><code>npm install onefold</code></pre>
      <h3>Your First Component</h3>
      <p>A component is just a function that returns a DOM Node. Use the html tagged template
      to write markup naturally:</p>
      <pre><code>import { createSignal, html, mount } from 'onefold';

function Counter() {
  const count = createSignal(0);
  return html\`
    &lt;button onclick=\${() => count.set(c => c + 1)}&gt;
      Clicked \${() => count()} times
    &lt;/button&gt;
  \`;
}

mount(Counter(), document.getElementById('app')!);</code></pre>
      <p>That's it. No build step required, no CLI to learn, no configuration files.</p>
    `},2:{id:2,title:"Signals vs Virtual DOM",date:"2026-06-28",author:"Core Team",content:`
      <p>Virtual DOM frameworks (React, Vue 2) re-render an entire component subtree, diff
      the old and new virtual trees, then patch the real DOM. This is O(tree size) per update.</p>
      <p>Signal-based frameworks (Solid, Svelte 5, onefold) wire each piece of state directly
      to the DOM node that reads it. An update is O(1) \u2014 only the exact node changes.</p>
      <h3>When does it matter?</h3>
      <p>For simple apps, both approaches are fast enough. The difference shows up in:</p>
      <ul>
        <li>Large tables with frequent cell updates</li>
        <li>Real-time dashboards with many independent data streams</li>
        <li>Animations driven by state changes</li>
      </ul>
      <p>In these scenarios, skipping the diff step entirely means consistently smooth 60fps.</p>
    `},3:{id:3,title:"Building a Router from Scratch",date:"2026-06-20",author:"Core Team",content:`
      <p>A client-side router needs three things:</p>
      <ol>
        <li>A way to intercept navigation (History API)</li>
        <li>A way to match URLs to views (pattern matching)</li>
        <li>A way to reactively swap the current view (signals)</li>
      </ol>
      <p>Nanoframe's router supports both exact paths and dynamic parameters:</p>
      <pre><code>Router([
  { path: '/', view: () => HomePage() },
  { path: '/posts/:id', view: (params) => PostPage(params) },
], NotFoundPage);</code></pre>
      <p>The Link component intercepts clicks and calls navigate() for seamless SPA behavior.</p>
    `},4:{id:4,title:"The html`` Tagged Template",date:"2026-06-15",author:"Core Team",content:`
      <p>Instead of nested h() calls, use the html tagged template literal for a syntax that
      reads like actual HTML:</p>
      <pre><code>html\`
  &lt;div class="card"&gt;
    &lt;h2&gt;\${() => title()}&lt;/h2&gt;
    &lt;button onclick=\${handleClick}&gt;Click me&lt;/button&gt;
  &lt;/div&gt;
\`</code></pre>
      <p>It supports everything h() does: reactive attributes, event handlers, refs, directives,
      class objects, style objects, nested templates, and arrays of nodes.</p>
      <p>The security model is identical \u2014 text always goes through textContent, never innerHTML.</p>
    `}};function ae(e){let t=Ne[e.id??""];return t?d`
    <div class="page">
      <article class="post-full">
        <div class="post-header">
          ${f("/","\u2190 Back to all posts","back-link")}
          <h1>${t.title}</h1>
          <div class="post-meta">
            <span>${t.author}</span> · <span>${t.date}</span>
          </div>
        </div>
        <div class="post-body">
          ${()=>{let o=document.createElement("div");return o.innerHTML=t.content,o}}
        </div>
      </article>
    </div>
  `:d`
      <div class="page">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        ${f("/","Back to Home","btn")}
      </div>
    `}var Ae=x`
  .header { margin-bottom: 32px; }
  .header h1 { font-size: 28px; margin-bottom: 8px; }
  .intro { color: #6b7280; font-size: 15px; line-height: 1.6; }
  .intro code {
    background: #eef2ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', Menlo, monospace;
  }
  .demos { display: flex; flex-direction: column; gap: 20px; }
`;function ce(e){return d`
    <div class=${Ae.scope}>
      <div class="header">
        <h1>Component-Scoped Styling</h1>
        <p class="intro">
          Each component defines its styles with <code>css\`...\`</code>. Styles are automatically
          scoped — they never leak to other components. No global CSS file needed.
        </p>
      </div>

      <div class="demos">
        ${He()}
        ${ze()}
        ${Ie()}
        ${je()}
        ${Be()}
        ${_e()}
      </div>

      <div style=${{marginTop:"32px"}}>
        ${f("/","\u2190 Back to Home","btn")}
      </div>
    </div>
  `}var Le=x`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .count { font-size: 48px; font-weight: 700; margin: 8px 0; }
  .row { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
  button {
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s;
  }
  button:hover { border-color: #4f46e5; color: #4f46e5; }
`;function He(){let e=h(0);return d`
    <div class=${Le.scope}>
      <div class="card">
        <h2>1. Scoped Counter</h2>
        <p class="desc">Styles defined with <code>css\`...\`</code> — the button styles here won't affect buttons elsewhere.</p>
        <div class="count">${()=>String(e())}</div>
        <div class="row">
          <button onclick=${()=>e.set(t=>t-1)}>−</button>
          <button onclick=${()=>e.set(0)}>Reset</button>
          <button onclick=${()=>e.set(t=>t+1)}>+</button>
        </div>
      </div>
    </div>
  `}var Me=x`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .preview {
    padding: 20px;
    border-radius: 10px;
    border: 2px solid transparent;
    margin-bottom: 12px;
    transition: all 0.3s;
  }
  .preview p { margin: 4px 0; font-size: 14px; }
  .label { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
  button {
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s;
  }
  button:hover { border-color: #4f46e5; color: #4f46e5; }
`,V=[{name:"Indigo",border:"#6366f1",bg:"rgba(99,102,241,0.08)",color:"#6366f1"},{name:"Emerald",border:"#10b981",bg:"rgba(16,185,129,0.08)",color:"#10b981"},{name:"Amber",border:"#f59e0b",bg:"rgba(245,158,11,0.08)",color:"#f59e0b"},{name:"Rose",border:"#f43f5e",bg:"rgba(244,63,94,0.08)",color:"#f43f5e"}];function ze(){let e=h(0),t=()=>V[e()%V.length],o=()=>e.set(n=>(n+1)%V.length);return d`
    <div class=${Me.scope}>
      <div class="card">
        <h2>2. Dynamic Styles (Reactive)</h2>
        <p class="desc">Use <code>style=\${() => ({...})}</code> for reactive inline styles driven by signals.</p>
        <div class="preview" style=${()=>({borderColor:t().border,backgroundColor:t().bg})}>
          <p class="label" style=${()=>({color:t().color})}>${()=>t().name}</p>
          <p>Border and background react to signal changes</p>
        </div>
        <button onclick=${o}>Next Theme</button>
      </div>
    </div>
  `}var Oe=x`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .sample {
    font-size: 16px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
    margin-bottom: 12px;
    transition: all 0.2s;
    min-height: 48px;
  }
  .bold { font-weight: 700; }
  .italic { font-style: italic; }
  .underline { text-decoration: underline; }
  .highlight { background: #fef08a; }
  .toggles { display: flex; gap: 16px; flex-wrap: wrap; }
  .toggles label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
`;function Ie(){let e=h(!1),t=h(!1),o=h(!1),n=h(!1);return d`
    <div class=${Oe.scope}>
      <div class="card">
        <h2>3. Class Object Map</h2>
        <p class="desc">Pass an object to <code>class</code> — keys are class names, values are booleans.</p>
        <p class=${()=>({sample:!0,bold:e(),italic:t(),underline:o(),highlight:n()})}>The quick brown fox jumps over the lazy dog</p>
        <div class="toggles">
          <label><input type="checkbox" onchange=${()=>e.set(r=>!r)} /> Bold</label>
          <label><input type="checkbox" onchange=${()=>t.set(r=>!r)} /> Italic</label>
          <label><input type="checkbox" onchange=${()=>o.set(r=>!r)} /> Underline</label>
          <label><input type="checkbox" onchange=${()=>n.set(r=>!r)} /> Highlight</label>
        </div>
      </div>
    </div>
  `}var De=x`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .area {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 140px;
    margin-bottom: 16px;
  }
  .sliders { display: flex; flex-direction: column; gap: 10px; }
  .sliders label { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6b7280; }
  .sliders input[type="range"] { flex: 1; cursor: pointer; }
`;function je(){let e=h(48),t=h(0),o=h(250);return d`
    <div class=${De.scope}>
      <div class="card">
        <h2>4. Reactive Inline Style Object</h2>
        <p class="desc">Style as a JS object with camelCase keys. Wrap in a function for reactivity.</p>
        <div class="area">
          <div style=${()=>({width:`${e()}px`,height:`${e()}px`,transform:`rotate(${t()}deg)`,backgroundColor:`hsl(${o()}, 70%, 60%)`,borderRadius:`${Math.min(e()/4,20)}px`,transition:"all 0.15s ease"})}></div>
        </div>
        <div class="sliders">
          <label>Size: ${()=>`${e()}px`}
            <input type="range" min="24" max="120" value="48"
              oninput=${n=>e.set(Number(n.target.value))} />
          </label>
          <label>Rotation: ${()=>`${t()}\xB0`}
            <input type="range" min="0" max="360" value="0"
              oninput=${n=>t.set(Number(n.target.value))} />
          </label>
          <label>Hue: ${()=>String(o())}
            <input type="range" min="0" max="360" value="250"
              oninput=${n=>o.set(Number(n.target.value))} />
          </label>
        </div>
      </div>
    </div>
  `}var Fe=x`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: white;
  }
`;function P(e,t){return d`<span class="badge" style=${{backgroundColor:t}}>${e}</span>`}function Be(){return d`
    <div class=${Fe.scope}>
      <div class="card">
        <h2>5. Reusable Styled Components</h2>
        <p class="desc">Define styles once, use the component anywhere. The .badge class is scoped — won't leak.</p>
        <div class="row">
          ${P("Success","#22c55e")}
          ${P("Warning","#eab308")}
          ${P("Error","#ef4444")}
          ${P("Info","#3b82f6")}
          ${P("Neutral","#6b7280")}
        </div>
      </div>
    </div>
  `}var We=x`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 12px; }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 13px;
    font-family: 'SF Mono', Menlo, monospace;
    line-height: 1.5;
  }
  .summary {
    margin-top: 16px;
    font-size: 14px;
    color: #374151;
    line-height: 1.7;
  }
  .summary strong { color: #1f2937; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  th { background: #f9fafb; font-weight: 600; }
  code {
    background: #eef2ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', Menlo, monospace;
  }
`;function _e(){return d`
    <div class=${We.scope}>
      <div class="card">
        <h2>How It Works</h2>
        <pre>import { css, html } from 'onefold';

// Define scoped styles for a component
const styles = css\`
  .card { background: white; padding: 16px; }
  .title { font-size: 20px; color: #333; }
  button { padding: 8px; border-radius: 4px; }
\`;

function MyCard() {
  return html\`
    &lt;div class=\${styles.scope}&gt;
      &lt;h2 class="title"&gt;Scoped!&lt;/h2&gt;
      &lt;div class="card"&gt;...&lt;/div&gt;
    &lt;/div&gt;
  \`;
}</pre>
        <div class="summary">
          <table>
            <thead><tr><th>Feature</th><th>Syntax</th></tr></thead>
            <tbody>
              <tr><td>Scoped CSS</td><td><code>css\`...\`</code> → attach <code>styles.scope</code> to root</td></tr>
              <tr><td>Static class</td><td><code>class="foo"</code></td></tr>
              <tr><td>Reactive class</td><td><code>class=\${() => expr}</code></td></tr>
              <tr><td>Class map</td><td><code>class=\${() => ({ active: bool })}</code></td></tr>
              <tr><td>Static style</td><td><code>style=\${{ color: 'red' }}</code></td></tr>
              <tr><td>Reactive style</td><td><code>style=\${() => ({ ... })}</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function le(){return d`
    <div class="page not-found">
      <h1>404</h1>
      <p>Page not found. The route you visited doesn't match any defined pattern.</p>
      ${f("/","Go Home","btn")}
    </div>
  `}function Ue(){return d`
    <nav class="navbar">
      <div class="nav-brand">
        ${f("/","onefold blog","brand-link")}
      </div>
      <div class="nav-links">
        ${f("/","Home",()=>T()==="/"?"nav-link active":"nav-link")}
        ${f("/styling","Styling",()=>T()==="/styling"?"nav-link active":"nav-link")}
        ${f("/about","About",()=>T()==="/about"?"nav-link active":"nav-link")}
      </div>
    </nav>
  `}function Ve(){let e=U([{path:"/",view:t=>ie(t)},{path:"/about",view:t=>se(t)},{path:"/styling",view:t=>ce(t)},{path:"/posts/:id",view:t=>ae(t)}],le);return d`
    <div class="app-shell">
      ${Ue()}
      <main class="main-content">
        ${e}
      </main>
      <footer class="footer">
        <p>Built with onefold — fine-grained signals · real DOM · zero dependencies</p>
      </footer>
    </div>
  `}j(Ve(),document.getElementById("app"));
