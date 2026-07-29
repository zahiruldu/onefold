var J=null;function X(e,t){J?J(e,t):t()}var he=new Map;function Q(e){return he.get(e)}var k=null,me=0,ge=new Set,S=0,D=null,be=200,z=class{constructor(t,n){this.deps=new Set,this.active=!0,this.fn=t,this.label=n}run(){if(!this.active)return;this.cleanup();let t=k;k=this;try{X(this.label,this.fn)}finally{k=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},O=class{constructor(t){this.value=t,this.subscribers=new Set}get(){return k&&(this.subscribers.add(k),k.deps.add(this)),this.value}set(t){let n=typeof t=="function"?t(this.value):t;Object.is(n,this.value)||(this.value=n,typeof __DEV__<"u"&&__DEV__&&(S++,D||(D=setTimeout(()=>{S=0,D=null},1e3)),S>be&&(console.warn(`[onefold] Signal updated ${S} times in <1s. Possible infinite loop in an effect.`),S=0)),this.notify())}peek(){return this.value}notify(){if(me>0)for(let t of this.subscribers)ge.add(t);else{let t=Array.from(this.subscribers);for(let n=0;n<t.length;n++)t[n].run()}}};function m(e){let t=new O(e),n=(()=>t.get());return n.set=o=>t.set(o),n.peek=()=>t.peek(),n}function v(e,t="effect"){let n=t;if(typeof __DEV__<"u"&&__DEV__&&t==="effect")try{let s=(new Error().stack??"").split(`
`);for(let r=2;r<s.length&&r<8;r++){let a=s[r]?.trim()??"";if(!a||/\bcreateEffect\b|\bcreateComputed\b|\bbindReactive\b|\bapplyAttr\b|\bbuildDom\b|\bappendExpr\b|\brunWithHook\b|ReactiveEffect/.test(a))continue;let l=a.match(/at\s+([A-Z]\w+)\s+\(/);if(l){let c=a.match(/:(\d+):\d+\)?$/);n=c?`${l[1]} (:${c[1]})`:l[1];break}let d=a.match(/([^/\\:]+):(\d+):\d+\)?$/);if(d){n=`${d[1]}:${d[2]}`;break}}}catch{}let o=new z(e,n);return o.run(),()=>o.dispose()}var xe=/^\s*(javascript|data|vbscript):/i,ve=/^on/i;function E(e){return xe.test(e)}function N(e){return ve.test(e)}function Y(e){let t=document.createElement("template");t.innerHTML=e;let n=o=>{let i=[];o.childNodes.forEach(s=>{if(s.nodeType===Node.ELEMENT_NODE){let r=s,a=r.tagName.toLowerCase();if(a==="script"||a==="style"||a==="iframe"||a==="object"||a==="embed"||a==="form"){i.push(s);return}Array.from(r.attributes).forEach(l=>{(N(l.name)||(l.name==="href"||l.name==="src")&&E(l.value))&&r.removeAttribute(l.name)}),n(r)}}),i.forEach(s=>s.remove())};return n(t.content),t.innerHTML}var P=null;function ye(){return P||(typeof window<"u"&&window.trustedTypes&&(P=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>Y(e)})),P)}function I(e){let t=ye();return t?t.createHTML(e):Y(e)}function j(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function B(e,t){t.replaceChildren(e)}var A=new WeakMap,U=null;function we(){if(U||typeof MutationObserver>"u"||typeof document>"u")return;U=new MutationObserver(t=>{for(let n of t)n.removedNodes.forEach(Z)});let e=document.documentElement??document;U.observe(e,{childList:!0,subtree:!0})}function Z(e){let t=A.get(e);if(t){for(let n of t)try{n()}catch(o){console.error("[onefold] Error while disposing a reactive binding:",o)}A.delete(e)}e.childNodes.forEach(Z)}function $(e,t){we();let n=A.get(e);n||(n=new Set,A.set(e,n)),n.add(t)}var K=null;var y="\0nf_",w=/\x00nf_(\d+)\x00/g;function ke(e){return`${y}${e}\0`}function h(e,t){return e.charAt(t)}function W(e){return parseInt(e[1]??"0",10)}function $e(e,t){let n="";for(let r=0;r<e.length;r++)n+=e[r],r<t.length&&(n+=ke(r));let o=[],i=0,s=n.length;for(;i<s;){if(h(n,i)==="<"){if(n.startsWith("<!--",i)){let b=n.indexOf("-->",i+4);i=b===-1?s:b+3;continue}if(h(n,i+1)==="/"){let b=n.indexOf(">",i),M=n.slice(i+2,b).trim();o.push({kind:1,tag:M}),i=b+1;continue}let l=Se(n,i),d=h(n,l-1)==="/",c=n.slice(i+1,d?l-1:l),{tag:u,attrs:g}=Ee(c,t);o.push({kind:0,tag:u});for(let b of g)o.push(b);d&&o.push({kind:1,tag:u}),i=l+1;continue}let r=n.indexOf("<",i),a=r===-1?n.slice(i):n.slice(i,r);if(i=r===-1?s:r,a.trim()||w.test(a)){w.lastIndex=0;let l=0,d;for(;(d=w.exec(a))!==null;){let u=a.slice(l,d.index);u&&o.push({kind:3,value:u}),o.push({kind:4,value:t[W(d)]}),l=d.index+d[0].length}let c=a.slice(l);c&&c.trim()&&o.push({kind:3,value:c})}}return o}function Se(e,t){let n=null;for(let o=t+1;o<e.length;o++){let i=h(e,o);if(n)i===n&&(n=null);else if(i==='"'||i==="'")n=i;else if(i===">")return o}return e.length-1}function C(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function Ee(e,t){let n=e.search(/[\s/]/),o=n===-1?e:e.slice(0,n),i=[];if(n===-1)return{tag:o,attrs:i};let s=e.slice(n).trim();if(!s)return{tag:o,attrs:i};let r=0,a=s.length;for(;r<a;){for(;r<a&&C(h(s,r));)r++;if(r>=a)break;if(s.startsWith(y,r)){let c=s.indexOf("\0",r+y.length),u=parseInt(s.slice(r+y.length,c),10),g=t[u];if(g&&typeof g=="object")for(let[b,M]of Object.entries(g))i.push({kind:2,name:b,value:M});r=c+1;continue}let l=r;for(;r<a&&h(s,r)!=="="&&!C(h(s,r));)r++;let d=s.slice(l,r);if(!d){r++;continue}for(;r<a&&C(h(s,r));)r++;if(r>=a||h(s,r)!=="="){i.push({kind:2,name:d,value:!0});continue}for(r++;r<a&&C(h(s,r));)r++;if(s.startsWith(y,r)){let c=s.indexOf("\0",r+y.length),u=parseInt(s.slice(r+y.length,c),10);i.push({kind:2,name:d,value:t[u]}),r=c+1}else if(h(s,r)==='"'||h(s,r)==="'"){let c=h(s,r);r++;let u=r;for(;r<a&&h(s,r)!==c;)r++;let g=s.slice(u,r);r++,i.push({kind:2,name:d,value:ee(g,t)})}else{let c=r;for(;r<a&&!C(h(s,r));)r++;let u=s.slice(c,r);i.push({kind:2,name:d,value:ee(u,t)})}}return{tag:o,attrs:i}}function ee(e,t){w.lastIndex=0;let n=w.exec(e);if(!n)return e;if(n.index===0&&n[0].length===e.length)return t[W(n)];w.lastIndex=0;let o=[],i=0,s;for(;(s=w.exec(e))!==null;){s.index>i&&o.push(e.slice(i,s.index));let r=t[W(s)];o.push(typeof r=="function"?r:()=>r),i=s.index+s[0].length}return i<e.length&&o.push(e.slice(i)),()=>o.map(r=>typeof r=="function"?r():r).join("")}function Ce(e){let t=document.createDocumentFragment(),n=[t],o=t;for(let i of e)switch(i.kind){case 0:{let s=document.createElement(i.tag);o.appendChild(s),n.push(s),o=s;break}case 1:{if(typeof __DEV__<"u"&&__DEV__){let s=o,r=s.tagName?.toLowerCase();(r==="input"||r==="textarea")&&!s.hasAttribute("value")&&s.getAttribute("data-nf-has-input")==="1"&&console.warn(`[onefold] <${r}> has oninput/onchange but no value=\${() => signal()} binding. The input won't clear on signal.set('') or form.reset(). Add: value=\${() => yourSignal()} for two-way binding.`,s)}n.pop(),o=n.length>0?n[n.length-1]:t;break}case 2:{Te(o,i.name,i.value);break}case 3:{o.appendChild(document.createTextNode(i.value));break}case 4:{te(o,i.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function Te(e,t,n){if(t==="ref"){typeof n=="function"&&n(e);return}if(t==="class"){H(n,o=>_e(e,o),e);return}if(t==="style"){H(n,o=>{typeof o=="string"?e.style.cssText=o:Object.assign(e.style,o??{})},e);return}if(N(t)&&typeof n=="function"){if(e.addEventListener(t.slice(2).toLowerCase(),n),typeof __DEV__<"u"&&__DEV__){let o=t.slice(2).toLowerCase();(o==="input"||o==="change")&&e.setAttribute("data-nf-has-input","1")}return}if(t.startsWith("d-")){let o=Q(t.slice(2));o?H(n,i=>o(e,i),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}H(n,o=>Re(e,t,o),e)}function H(e,t,n){if(typeof e=="function"){let o=v(()=>t(e()));$(n,o)}else t(e)}function _e(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,n])=>n).map(([n])=>n).join(" ")):e.className=""}function Re(e,t,n){if(n===!1||n==null){e.removeAttribute(t);return}if(n===!0){e.setAttribute(t,"");return}let o=String(n);if(N(t)){console.warn(`[onefold] Blocked string event handler "${t}". Use a function instead.`);return}if((t==="href"||t==="src"||t==="action"||t==="formaction"||t==="xlink:href")&&E(o)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,o),e.removeAttribute(t);return}if(t==="value"&&"value"in e){e.value=o;return}if(t==="checked"&&e instanceof HTMLInputElement){e.checked=n===!0||o==="true"||o==="";return}if(t==="selected"&&e instanceof HTMLOptionElement){e.selected=n===!0||o==="true"||o==="";return}e.setAttribute(t,o)}function te(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let n of t)te(e,n);return}if(typeof t=="function"){let n=document.createComment("expr-start"),o=document.createComment("expr-end");e.appendChild(n),e.appendChild(o);let i=v(()=>{let s=t(),r=n.parentNode;if(!r)return;let a=n.nextSibling;for(;a&&a!==o;){let d=a.nextSibling;r.removeChild(a),a=d}let l=ne(s);r.insertBefore(l,o)});$(e,i);return}if(j(t)){let n=document.createElement("span");n.innerHTML=I(t.html),e.appendChild(n);return}e.appendChild(document.createTextNode(String(t)))}}function ne(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(j(e)){let t=document.createElement("span");return t.innerHTML=I(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let n of e)t.appendChild(ne(n));return t}return document.createTextNode(String(e))}function p(e,...t){if(K)return K(e,...t);let n=$e(e,t);return Ce(n)}var Pe=0,oe=new Map;function Ne(){return`nf-${(Pe++).toString(36)}`}function re(e,t){let n=`.${t}`,o="",i=0,s=e.length;for(;i<s;){for(;i<s&&/\s/.test(e[i]);)o+=e[i],i++;if(i>=s)break;if(e[i]==="@"){let c=i;for(;i<s&&e[i]!=="{";)i++;o+=e.slice(c,i),i<s&&(o+=e[i],i++);let u=ie(e,i-1),g=u.slice(1,-1);o+=re(g,t),o+="}",i+=u.length-1;continue}let r=i;for(;i<s&&e[i]!=="{";)i++;let a=e.slice(r,i).trim();if(!a||i>=s)break;let l=a.split(",").map(c=>(c=c.trim(),c&&(c===":root"||c===":host"?n:c.startsWith("&")?n+c.slice(1):`${n} ${c}`))).join(", ");o+=l;let d=ie(e,i);o+=d,i+=d.length}return o}function ie(e,t){if(e[t]!=="{")return"";let n=0,o=t;for(;o<e.length;){if(e[o]==="{")n++;else if(e[o]==="}"&&(n--,n===0))return e.slice(t,o+1);o++}return e.slice(t)}function Ae(e,t){if(typeof document>"u"||document.getElementById(t))return;let n=document.createElement("style");n.id=t,n.textContent=e,document.head.appendChild(n)}function x(e,...t){let n="";for(let a=0;a<e.length;a++)n+=e[a],a<t.length&&(n+=String(t[a]));let o=oe.get(n);if(o)return o;let i=Ne(),s=re(n,i);Ae(s,`style-${i}`);let r={scope:i,css:s};return oe.set(n,r),r}var T=null,F=null;function L(){return F===null&&(F=typeof window<"u"&&window.location.protocol==="file:"),F}function se(){return typeof window>"u"?"/":L()?window.location.hash.slice(1)||"/":window.location.pathname}function V(){if(T)return T;if(T=m(se()),typeof window<"u"){let e=L()?"hashchange":"popstate";window.addEventListener(e,()=>T.set(se()))}return T}function ae(e){if(typeof window>"u")return;let t=V();L()?(window.location.hash=e,t.set(e)):(window.history.pushState({},"",e),t.set(e))}function _(){return V()()}function He(e,t){let n=e.split("/"),o=t.split("/");if(n.length!==o.length)return null;let i={};for(let s=0;s<n.length;s++){let r=n[s],a=o[s];if(r.startsWith(":"))try{i[r.slice(1)]=decodeURIComponent(a)}catch{i[r.slice(1)]=a}else if(r!==a)return null}return i}function Le(e,t){if(e==="/")return{};let n=e.split("/").filter(Boolean),o=t.split("/").filter(Boolean);if(o.length<n.length)return null;let i={};for(let s=0;s<n.length;s++){let r=n[s],a=o[s];if(r.startsWith(":"))try{i[r.slice(1)]=decodeURIComponent(a)}catch{i[r.slice(1)]=a}else if(r!==a)return null}return i}function ce(e,t,n,o=""){for(let i of e){let s=Me(o,i.path);if(i.children&&i.children.length>0){let r=Le(s,t);if(r!==null){let l=ce(i.children,t,n,s)??n();return i.view(r,l)}}else{let r=He(s,t);if(r!==null)return i.view(r)}}return null}function Me(e,t){if(!e||e==="/")return t;if(t==="/")return e;let n=e.endsWith("/")?e.slice(0,-1):e,o=t.startsWith("/")?t:"/"+t;return n+o}function q(e,t){let n=V(),o=document.createElement("div"),i=v(()=>{let s=n(),r=null;if(Array.isArray(e))r=ce(e,s,t,"");else{let a=e[s];a&&(r=a())}o.textContent="",o.appendChild(r??t())});return $(o,i),o}function f(e,t,n){let o=document.createElement("a");if(E(e)?typeof __DEV__<"u"&&__DEV__&&console.warn(`[onefold] Blocked unsafe URL in Link: "${e}"`):o.setAttribute("href",L()?`#${e}`:e),n)if(typeof n=="function"){let i=v(()=>{o.className=n()});$(o,i)}else o.className=n;return o.addEventListener("click",i=>{i.preventDefault(),ae(e)}),typeof t=="string"?o.textContent=t:o.appendChild(t),o}var De=[{id:1,title:"Getting Started with Nanoframe",excerpt:"Learn how to build reactive UIs with zero dependencies and fine-grained signals.",date:"2026-07-01"},{id:2,title:"Signals vs Virtual DOM",excerpt:"Why fine-grained reactivity outperforms diffing on update-heavy workloads.",date:"2026-06-28"},{id:3,title:"Building a Router from Scratch",excerpt:"Client-side routing with the History API in under 50 lines of TypeScript.",date:"2026-06-20"},{id:4,title:"The html`` Tagged Template",excerpt:"Write templates that look like HTML with full reactive bindings \u2014 no compiler needed.",date:"2026-06-15"}];function le(e){return p`
    <div class="page">
      <section class="hero-section">
        <h1>Nanoframe Blog</h1>
        <p class="hero-subtitle">Exploring modern web development with fine-grained reactivity</p>
      </section>

      <section class="posts-section">
        <h2>Recent Posts</h2>
        <div class="post-list">
          ${De.map(t=>p`
              <article class="post-card">
                <span class="post-date">${t.date}</span>
                <h3>${f(`/posts/${t.id}`,t.title,"post-link")}</h3>
                <p class="post-excerpt">${t.excerpt}</p>
              </article>
            `)}
        </div>
      </section>
    </div>
  `}function de(e){return p`
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
  `}var ze={1:{id:1,title:"Getting Started with Nanoframe",date:"2026-07-01",author:"Core Team",content:`
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
    `}};function pe(e){let t=ze[e.id??""];return t?p`
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
          ${()=>{let n=document.createElement("div");return n.innerHTML=t.content,n}}
        </div>
      </article>
    </div>
  `:p`
      <div class="page">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        ${f("/","Back to Home","btn")}
      </div>
    `}var Oe=x`
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
`;function fe(e){return p`
    <div class=${Oe.scope}>
      <div class="header">
        <h1>Component-Scoped Styling</h1>
        <p class="intro">
          Each component defines its styles with <code>css\`...\`</code>. Styles are automatically
          scoped — they never leak to other components. No global CSS file needed.
        </p>
      </div>

      <div class="demos">
        ${je()}
        ${Ue()}
        ${Fe()}
        ${qe()}
        ${Je()}
        ${Qe()}
      </div>

      <div style=${{marginTop:"32px"}}>
        ${f("/","\u2190 Back to Home","btn")}
      </div>
    </div>
  `}var Ie=x`
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
`;function je(){let e=m(0);return p`
    <div class=${Ie.scope}>
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
  `}var Be=x`
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
`,G=[{name:"Indigo",border:"#6366f1",bg:"rgba(99,102,241,0.08)",color:"#6366f1"},{name:"Emerald",border:"#10b981",bg:"rgba(16,185,129,0.08)",color:"#10b981"},{name:"Amber",border:"#f59e0b",bg:"rgba(245,158,11,0.08)",color:"#f59e0b"},{name:"Rose",border:"#f43f5e",bg:"rgba(244,63,94,0.08)",color:"#f43f5e"}];function Ue(){let e=m(0),t=()=>G[e()%G.length],n=()=>e.set(o=>(o+1)%G.length);return p`
    <div class=${Be.scope}>
      <div class="card">
        <h2>2. Dynamic Styles (Reactive)</h2>
        <p class="desc">Use <code>style=\${() => ({...})}</code> for reactive inline styles driven by signals.</p>
        <div class="preview" style=${()=>({borderColor:t().border,backgroundColor:t().bg})}>
          <p class="label" style=${()=>({color:t().color})}>${()=>t().name}</p>
          <p>Border and background react to signal changes</p>
        </div>
        <button onclick=${n}>Next Theme</button>
      </div>
    </div>
  `}var We=x`
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
`;function Fe(){let e=m(!1),t=m(!1),n=m(!1),o=m(!1);return p`
    <div class=${We.scope}>
      <div class="card">
        <h2>3. Class Object Map</h2>
        <p class="desc">Pass an object to <code>class</code> — keys are class names, values are booleans.</p>
        <p class=${()=>({sample:!0,bold:e(),italic:t(),underline:n(),highlight:o()})}>The quick brown fox jumps over the lazy dog</p>
        <div class="toggles">
          <label><input type="checkbox" onchange=${()=>e.set(i=>!i)} /> Bold</label>
          <label><input type="checkbox" onchange=${()=>t.set(i=>!i)} /> Italic</label>
          <label><input type="checkbox" onchange=${()=>n.set(i=>!i)} /> Underline</label>
          <label><input type="checkbox" onchange=${()=>o.set(i=>!i)} /> Highlight</label>
        </div>
      </div>
    </div>
  `}var Ve=x`
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
`;function qe(){let e=m(48),t=m(0),n=m(250);return p`
    <div class=${Ve.scope}>
      <div class="card">
        <h2>4. Reactive Inline Style Object</h2>
        <p class="desc">Style as a JS object with camelCase keys. Wrap in a function for reactivity.</p>
        <div class="area">
          <div style=${()=>({width:`${e()}px`,height:`${e()}px`,transform:`rotate(${t()}deg)`,backgroundColor:`hsl(${n()}, 70%, 60%)`,borderRadius:`${Math.min(e()/4,20)}px`,transition:"all 0.15s ease"})}></div>
        </div>
        <div class="sliders">
          <label>Size: ${()=>`${e()}px`}
            <input type="range" min="24" max="120" value="48"
              oninput=${o=>e.set(Number(o.target.value))} />
          </label>
          <label>Rotation: ${()=>`${t()}\xB0`}
            <input type="range" min="0" max="360" value="0"
              oninput=${o=>t.set(Number(o.target.value))} />
          </label>
          <label>Hue: ${()=>String(n())}
            <input type="range" min="0" max="360" value="250"
              oninput=${o=>n.set(Number(o.target.value))} />
          </label>
        </div>
      </div>
    </div>
  `}var Ge=x`
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
`;function R(e,t){return p`<span class="badge" style=${{backgroundColor:t}}>${e}</span>`}function Je(){return p`
    <div class=${Ge.scope}>
      <div class="card">
        <h2>5. Reusable Styled Components</h2>
        <p class="desc">Define styles once, use the component anywhere. The .badge class is scoped — won't leak.</p>
        <div class="row">
          ${R("Success","#22c55e")}
          ${R("Warning","#eab308")}
          ${R("Error","#ef4444")}
          ${R("Info","#3b82f6")}
          ${R("Neutral","#6b7280")}
        </div>
      </div>
    </div>
  `}var Xe=x`
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
`;function Qe(){return p`
    <div class=${Xe.scope}>
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
  `}function ue(){return p`
    <div class="page not-found">
      <h1>404</h1>
      <p>Page not found. The route you visited doesn't match any defined pattern.</p>
      ${f("/","Go Home","btn")}
    </div>
  `}function Ye(){return p`
    <nav class="navbar">
      <div class="nav-brand">
        ${f("/","onefold blog","brand-link")}
      </div>
      <div class="nav-links">
        ${f("/","Home",()=>_()==="/"?"nav-link active":"nav-link")}
        ${f("/styling","Styling",()=>_()==="/styling"?"nav-link active":"nav-link")}
        ${f("/about","About",()=>_()==="/about"?"nav-link active":"nav-link")}
      </div>
    </nav>
  `}function Ze(){let e=q([{path:"/",view:t=>le(t)},{path:"/about",view:t=>de(t)},{path:"/styling",view:t=>fe(t)},{path:"/posts/:id",view:t=>pe(t)}],ue);return p`
    <div class="app-shell">
      ${Ye()}
      <main class="main-content">
        ${e}
      </main>
      <footer class="footer">
        <p>Built with onefold — fine-grained signals · real DOM · zero dependencies</p>
      </footer>
    </div>
  `}B(Ze(),document.getElementById("app"));
