var ne=null;function ie(t,o){ne?ne(t,o):o()}var Ot=new Map;function ae(t){return Ot.get(t)}var E=null,Ut=0,Bt=new Set;var _=class{constructor(o,n){this.deps=new Set,this.active=!0,this.fn=o,this.label=n}run(){if(!this.active)return;this.cleanup();let o=E;E=this;try{ie(this.label,this.fn)}finally{E=o}}cleanup(){for(let o of this.deps)o.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},z=class{constructor(o){this.value=o,this.subscribers=new Set}get(){return E&&(this.subscribers.add(E),E.deps.add(this)),this.value}set(o){let n=typeof o=="function"?o(this.value):o;Object.is(n,this.value)||(this.value=n,this.notify())}peek(){return this.value}notify(){if(Ut>0)for(let o of this.subscribers)Bt.add(o);else{let o=Array.from(this.subscribers);for(let n=0;n<o.length;n++)o[n].run()}}};function b(t){let o=new z(t),n=(()=>o.get());return n.set=s=>o.set(s),n.peek=()=>o.peek(),n}function P(t,o="effect"){let n=o,s=new _(t,n);return s.run(),()=>s.dispose()}var jt=/^\s*(javascript|data|vbscript):/i,Ft=/^on/i;function q(t){return jt.test(t)}function B(t){return Ft.test(t)}function se(t){let o=document.createElement("template");o.innerHTML=t;let n=s=>{let d=[];s.childNodes.forEach(l=>{if(l.nodeType===Node.ELEMENT_NODE){let i=l,c=i.tagName.toLowerCase();if(c==="script"||c==="style"||c==="iframe"||c==="object"||c==="embed"||c==="form"){d.push(l);return}Array.from(i.attributes).forEach(p=>{(B(p.name)||(p.name==="href"||p.name==="src")&&q(p.value))&&i.removeAttribute(p.name)}),n(i)}}),d.forEach(l=>l.remove())};return n(o.content),o.innerHTML}var U=null;function Wt(){return U||(typeof window<"u"&&window.trustedTypes&&(U=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:t=>se(t)})),U)}function V(t){let o=Wt();return o?o.createHTML(t):se(t)}function G(t){return typeof t=="object"&&t!==null&&t.__onefoldRaw===!0}function J(t,o){o.replaceChildren(t)}var j=new WeakMap,Y=null;function _t(){if(Y||typeof MutationObserver>"u"||typeof document>"u")return;Y=new MutationObserver(o=>{for(let n of o)n.removedNodes.forEach(de)});let t=document.documentElement??document;Y.observe(t,{childList:!0,subtree:!0})}function de(t){let o=j.get(t);if(o){for(let n of o)try{n()}catch(s){console.error("[onefold] Error while disposing a reactive binding:",s)}j.delete(t)}t.childNodes.forEach(de)}function D(t,o){_t();let n=j.get(t);n||(n=new Set,j.set(t,n)),n.add(o)}var le=null;var R="\0nf_",N=/\x00nf_(\d+)\x00/g;function zt(t){return`${R}${t}\0`}function y(t,o){return t.charAt(o)}function K(t){return parseInt(t[1]??"0",10)}function qt(t,o){let n="";for(let i=0;i<t.length;i++)n+=t[i],i<o.length&&(n+=zt(i));let s=[],d=0,l=n.length;for(;d<l;){if(y(n,d)==="<"){if(n.startsWith("<!--",d)){let S=n.indexOf("-->",d+4);d=S===-1?l:S+3;continue}if(y(n,d+1)==="/"){let S=n.indexOf(">",d),A=n.slice(d+2,S).trim();s.push({kind:1,tag:A}),d=S+1;continue}let p=Vt(n,d),f=y(n,p-1)==="/",v=n.slice(d+1,f?p-1:p),{tag:g,attrs:x}=Gt(v,o);s.push({kind:0,tag:g});for(let S of x)s.push(S);f&&s.push({kind:1,tag:g}),d=p+1;continue}let i=n.indexOf("<",d),c=i===-1?n.slice(d):n.slice(d,i);if(d=i===-1?l:i,c.trim()||N.test(c)){N.lastIndex=0;let p=0,f;for(;(f=N.exec(c))!==null;){let g=c.slice(p,f.index);g&&s.push({kind:3,value:g}),s.push({kind:4,value:o[K(f)]}),p=f.index+f[0].length}let v=c.slice(p);v&&v.trim()&&s.push({kind:3,value:v})}}return s}function Vt(t,o){let n=null;for(let s=o+1;s<t.length;s++){let d=y(t,s);if(n)d===n&&(n=null);else if(d==='"'||d==="'")n=d;else if(d===">")return s}return t.length-1}function L(t){return t===" "||t==="	"||t===`
`||t==="\r"||t==="\f"}function Gt(t,o){let n=t.search(/[\s/]/),s=n===-1?t:t.slice(0,n),d=[];if(n===-1)return{tag:s,attrs:d};let l=t.slice(n).trim();if(!l)return{tag:s,attrs:d};let i=0,c=l.length;for(;i<c;){for(;i<c&&L(y(l,i));)i++;if(i>=c)break;if(l.startsWith(R,i)){let v=l.indexOf("\0",i+R.length),g=parseInt(l.slice(i+R.length,v),10),x=o[g];if(x&&typeof x=="object")for(let[S,A]of Object.entries(x))d.push({kind:2,name:S,value:A});i=v+1;continue}let p=i;for(;i<c&&y(l,i)!=="="&&!L(y(l,i));)i++;let f=l.slice(p,i);if(!f){i++;continue}for(;i<c&&L(y(l,i));)i++;if(i>=c||y(l,i)!=="="){d.push({kind:2,name:f,value:!0});continue}for(i++;i<c&&L(y(l,i));)i++;if(l.startsWith(R,i)){let v=l.indexOf("\0",i+R.length),g=parseInt(l.slice(i+R.length,v),10);d.push({kind:2,name:f,value:o[g]}),i=v+1}else if(y(l,i)==='"'||y(l,i)==="'"){let v=y(l,i);i++;let g=i;for(;i<c&&y(l,i)!==v;)i++;let x=l.slice(g,i);i++,d.push({kind:2,name:f,value:ce(x,o)})}else{let v=i;for(;i<c&&!L(y(l,i));)i++;let g=l.slice(v,i);d.push({kind:2,name:f,value:ce(g,o)})}}return{tag:s,attrs:d}}function ce(t,o){N.lastIndex=0;let n=N.exec(t);if(!n)return t;if(n.index===0&&n[0].length===t.length)return o[K(n)];N.lastIndex=0;let s=[],d=0,l;for(;(l=N.exec(t))!==null;){l.index>d&&s.push(t.slice(d,l.index));let i=o[K(l)];s.push(typeof i=="function"?i:()=>i),d=l.index+l[0].length}return d<t.length&&s.push(t.slice(d)),()=>s.map(i=>typeof i=="function"?i():i).join("")}function Jt(t){let o=document.createDocumentFragment(),n=[o],s=o;for(let d of t)switch(d.kind){case 0:{let l=document.createElement(d.tag);s.appendChild(l),n.push(l),s=l;break}case 1:{n.pop(),s=n.length>0?n[n.length-1]:o;break}case 2:{Yt(s,d.name,d.value);break}case 3:{s.appendChild(document.createTextNode(d.value));break}case 4:{pe(s,d.value);break}}return o.childNodes.length===1&&o.firstChild instanceof HTMLElement?o.firstChild:o}function Yt(t,o,n){if(o==="ref"){typeof n=="function"&&n(t);return}if(o==="class"){F(n,s=>Kt(t,s),t);return}if(o==="style"){F(n,s=>{typeof s=="string"?t.style.cssText=s:Object.assign(t.style,s??{})},t);return}if(B(o)&&typeof n=="function"){t.addEventListener(o.slice(2).toLowerCase(),n);return}if(o.startsWith("d-")){let s=ae(o.slice(2));s?F(n,d=>s(t,d),t):console.warn(`[onefold] No directive registered for "${o}". Call registerDirective() first.`);return}F(n,s=>Xt(t,o,s),t)}function F(t,o,n){if(typeof t=="function"){let s=P(()=>o(t()));D(n,s)}else o(t)}function Kt(t,o){o?typeof o=="string"?t.className=o:typeof o=="object"&&(t.className=Object.entries(o).filter(([,n])=>n).map(([n])=>n).join(" ")):t.className=""}function Xt(t,o,n){if(n===!1||n==null){t.removeAttribute(o);return}if(n===!0){t.setAttribute(o,"");return}let s=String(n);if(B(o)){console.warn(`[onefold] Blocked string event handler "${o}". Use a function instead.`);return}if((o==="href"||o==="src"||o==="action"||o==="formaction"||o==="xlink:href")&&q(s)){console.warn(`[onefold] Blocked unsafe "${o}" value:`,s),t.removeAttribute(o);return}if(o==="value"&&"value"in t){t.value=s;return}if(o==="checked"&&t instanceof HTMLInputElement){t.checked=n===!0||s==="true"||s==="";return}if(o==="selected"&&t instanceof HTMLOptionElement){t.selected=n===!0||s==="true"||s==="";return}t.setAttribute(o,s)}function pe(t,o){if(!(o==null||o===!1||o===!0)){if(o instanceof Node){t.appendChild(o);return}if(Array.isArray(o)){for(let n of o)pe(t,n);return}if(typeof o=="function"){let n=document.createComment("expr-start"),s=document.createComment("expr-end");t.appendChild(n),t.appendChild(s);let d=P(()=>{let l=o(),i=n.parentNode;if(!i)return;let c=n.nextSibling;for(;c&&c!==s;){let f=c.nextSibling;i.removeChild(c),c=f}let p=ue(l);i.insertBefore(p,s)});D(t,d);return}if(G(o)){let n=document.createElement("span");n.innerHTML=V(o.html),t.appendChild(n);return}t.appendChild(document.createTextNode(String(o)))}}function ue(t){if(t==null||t===!1||t===!0)return document.createComment("");if(t instanceof Node)return t;if(G(t)){let o=document.createElement("span");return o.innerHTML=V(t.html),o}if(Array.isArray(t)){let o=document.createDocumentFragment();for(let n of t)o.appendChild(ue(n));return o}return document.createTextNode(String(t))}function r(t,...o){if(le)return le(t,...o);let n=qt(t,o);return Jt(n)}var M=null,W=null;function X(t){t.hash!==void 0&&(W=t.hash)}function Q(){return W===null&&(W=typeof window<"u"&&window.location.protocol==="file:"),W}function he(){return typeof window>"u"?"/":Q()?window.location.hash.slice(1)||"/":window.location.pathname}function Z(){if(M)return M;if(M=b(he()),typeof window<"u"){let t=Q()?"hashchange":"popstate";window.addEventListener(t,()=>M.set(he()))}return M}function k(t){if(typeof window>"u")return;let o=Z();Q()?(window.location.hash=t,o.set(t)):(window.history.pushState({},"",t),o.set(t))}function I(){return Z()()}function Qt(t,o){let n=t.split("/"),s=o.split("/");if(n.length!==s.length)return null;let d={};for(let l=0;l<n.length;l++){let i=n[l],c=s[l];if(i.startsWith(":"))try{d[i.slice(1)]=decodeURIComponent(c)}catch{d[i.slice(1)]=c}else if(i!==c)return null}return d}function Zt(t,o){if(t==="/")return{};let n=t.split("/").filter(Boolean),s=o.split("/").filter(Boolean);if(s.length<n.length)return null;let d={};for(let l=0;l<n.length;l++){let i=n[l],c=s[l];if(i.startsWith(":"))try{d[i.slice(1)]=decodeURIComponent(c)}catch{d[i.slice(1)]=c}else if(i!==c)return null}return d}function me(t,o,n,s=""){for(let d of t){let l=eo(s,d.path);if(d.children&&d.children.length>0){let i=Zt(l,o);if(i!==null){let p=me(d.children,o,n,l)??n();return d.view(i,p)}}else{let i=Qt(l,o);if(i!==null)return d.view(i)}}return null}function eo(t,o){if(!t||t==="/")return o;if(o==="/")return t;let n=t.endsWith("/")?t.slice(0,-1):t,s=o.startsWith("/")?o:"/"+o;return n+s}function ee(t,o){let n=Z(),s=document.createElement("div"),d=P(()=>{let l=n(),i=null;if(Array.isArray(t))i=me(t,l,o,"");else{let c=t[l];c&&(i=c())}s.textContent="",s.appendChild(i??o())});return D(s,d),s}function te(t,o){let n=new Map(Object.entries(t)),s=o??document;function d(i){let c=[];(i.ctrlKey||i.metaKey)&&c.push("Ctrl"),i.shiftKey&&c.push("Shift"),i.altKey&&c.push("Alt");let p=i.key.length===1?i.key.toUpperCase():i.key;return c.push(p),c.join("+")}function l(i){let c=d(i),p=n.get(c);p&&(i.preventDefault(),p(i))}return s.addEventListener("keydown",l),{destroy:()=>s.removeEventListener("keydown",l),add:(i,c)=>n.set(i,c),remove:i=>n.delete(i)}}var T=[{title:"Get Started",links:[{label:"Introduction",path:"/"},{label:"Installation",path:"/getting-started/install"},{label:"Quick Start",path:"/getting-started/quickstart"}]},{title:"Fundamentals",links:[{label:"Signals (Reactivity)",path:"/core/signals"},{label:"Templates (html)",path:"/core/templates"},{label:"Mounting (mount)",path:"/core/mounting"},{label:"Scoped CSS (css)",path:"/core/css"}]},{title:"UI & Styling",links:[{label:"Theming",path:"/theming"},{label:"Transitions",path:"/transitions"},{label:"Accessibility",path:"/a11y"}]},{title:"Routing",links:[{label:"Router",path:"/routing/router"},{label:"configureRouter",path:"/routing/configure"},{label:"Nested Routes",path:"/routing/nested"},{label:"Dynamic Params",path:"/routing/params"},{label:"Navigate",path:"/routing/navigate"},{label:"Link",path:"/routing/link"}]},{title:"State Management",links:[{label:"Store",path:"/state/store"},{label:"Persisted Signals",path:"/state/persisted"},{label:"Dependency Injection",path:"/di"}]},{title:"Data Fetching",links:[{label:"Resource",path:"/data/resource"},{label:"HTTP Client",path:"/data/http-client"},{label:"Interceptors",path:"/data/interceptors"}]},{title:"Forms",links:[{label:"createForm",path:"/forms/create-form"},{label:"Validation Rules",path:"/forms/validation"}]},{title:"Real-time",links:[{label:"WebSocket",path:"/streaming/websocket"},{label:"Server-Sent Events",path:"/streaming/sse"}]},{title:"Async Patterns",links:[{label:"Suspense",path:"/async/suspense"},{label:"Lazy Loading",path:"/async/lazy-loading"},{label:"Error Boundaries",path:"/async/error-boundaries"}]},{title:"Security",links:[{label:"XSS Prevention",path:"/security/xss"},{label:"RBAC Guards",path:"/security/guards"}]},{title:"Performance",links:[{label:"VirtualList",path:"/performance/virtual-list"},{label:"Code Splitting",path:"/performance/code-splitting"}]},{title:"Server-Side Rendering",links:[{label:"renderHTML",path:"/ssr"}]},{title:"Internationalization",links:[{label:"i18n",path:"/i18n"}]},{title:"Microfrontends",links:[{label:"loadRemote",path:"/microfrontends/load-remote"},{label:"Isolation Modes",path:"/microfrontends/isolation"},{label:"Communication",path:"/microfrontends/communication"},{label:"configureSecurity",path:"/microfrontends/security"},{label:"SRI Integrity",path:"/microfrontends/sri"},{label:"Shared Dependencies",path:"/microfrontends/shared-deps"},{label:"Cross-Framework",path:"/microfrontends/cross-framework"},{label:"Deployment",path:"/microfrontends/deployment"},{label:"API Reference",path:"/microfrontends/api-reference"}]},{title:"Interop",links:[{label:"wrapImperative",path:"/interop/wrap-imperative"},{label:"embedForeign",path:"/interop/embed-foreign"}]},{title:"Plugins & Observability",links:[{label:"Plugins",path:"/plugins"},{label:"Observability",path:"/observability"},{label:"Component Metadata",path:"/meta"}]},{title:"Tooling",links:[{label:"CLI (create-onefold)",path:"/cli"},{label:"DevTools",path:"/devtools"},{label:"Extensions",path:"/extensions"},{label:"Utilities",path:"/utilities"}]},{title:"Deployment",links:[{label:"GitHub Pages",path:"/deployment/github-pages"},{label:"Vercel",path:"/deployment/vercel"},{label:"Netlify",path:"/deployment/netlify"},{label:"Cloudflare Pages",path:"/deployment/cloudflare"},{label:"AWS S3 + CloudFront",path:"/deployment/aws"},{label:"Docker / Node",path:"/deployment/docker"}]},{title:"Playground",links:[{label:"Live Editor",path:"/playground"}]}];function $(t){let o=document.createElement("div");return o.innerHTML=t,o.firstElementChild??document.createComment("svg-empty")}var fe=()=>$(`<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect y="3" width="20" height="2" rx="1"/>
    <rect y="9" width="20" height="2" rx="1"/>
    <rect y="15" width="20" height="2" rx="1"/>
  </svg>`),ge=()=>$(`<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242.156a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/>
  </svg>`),ve=()=>$(`<svg width="32" height="32" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <polygon points="83.8,39.8 108,64 64,108 20,64 44.2,39.8" fill="#4338CA"/>
    <polygon points="83.8,39.8 44.2,39.8 64,59.6" fill="#818CF8"/>
  </svg>`),be=()=>$(`<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2l10 6-10 6V2z"/>
  </svg>`),ye=()=>$(`<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1h5v2H3.414L6.707 6.293l-1.414 1.414L2 4.414V7H0V1h1zm14 0h-5v2h2.586L9.293 6.293l1.414 1.414L14 4.414V7h2V1h-1zM1 15h5v-2H3.414l3.293-3.293-1.414-1.414L2 11.586V9H0v6h1zm14 0h-5v-2h2.586l-3.293-3.293 1.414-1.414L14 11.586V9h2v6h-1z"/>
  </svg>`),we=()=>$(`<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 1v4H1v2h5a1 1 0 001-1V1H5zm6 0v5a1 1 0 001 1h5V5h-4V1h-2zM1 9v2h4v4h2v-5a1 1 0 00-1-1H1zm9 0a1 1 0 00-1 1v5h2v-4h4V9h-5z"/>
  </svg>`);function Se(){let t=b(new Set(["Get Started"]));P(()=>{let s=I();for(let d of T)for(let l of d.links)if(l.path===s){t.set(i=>{let c=new Set(i);return c.add(d.title),c});return}});let o=s=>{t.set(d=>{let l=new Set(d);return l.has(s)?l.delete(s):l.add(s),l})},n=s=>{k(s),document.getElementById("sidebar")?.classList.remove("open"),document.getElementById("overlay")?.classList.remove("open")};return r`
    <aside id="sidebar" class="sidebar">
      <div class="sidebar-logo">
        ${ve()}
        <span class="wordmark">one<span>fold</span></span>
        <span class="version">v0.1.3</span>
      </div>
      <nav class="sidebar-nav">
        ${()=>T.map(s=>r`
          <div class=${()=>"sidebar-section"+(t().has(s.title)?"":" collapsed")}>
            <div class="sidebar-section-title" onclick=${()=>o(s.title)}>
              ${s.title}
              <span class="arrow">▼</span>
            </div>
            <ul class="sidebar-links">
              ${s.links.map(d=>r`
                <li>
                  <a class=${()=>"sidebar-link"+(I()===d.path?" active":"")}
                     onclick=${()=>n(d.path)}>
                    ${d.label}
                  </a>
                </li>
              `)}
            </ul>
          </div>
        `)}
      </nav>
    </aside>
  `}function ke(){let t=b(""),o=b(!1),n=T.flatMap(c=>c.links.map(p=>({...p,section:c.title}))),s=()=>{let c=t().toLowerCase().trim();return c?n.filter(p=>p.label.toLowerCase().includes(c)||p.section.toLowerCase().includes(c)).slice(0,10):[]},d=c=>{t.set(c.target.value),o.set(t().trim().length>0)},l=c=>{k(c),t.set(""),o.set(!1)};return r`
    <header class="header">
      <div class="header-left">
        <button class="sidebar-toggle" onclick=${()=>{document.getElementById("sidebar")?.classList.toggle("open"),document.getElementById("overlay")?.classList.toggle("open")}} aria-label="Toggle menu">
          ${fe()}
        </button>
        <div class="search">
          <span class="s-icon">${ge()}</span>
          <input
            type="text"
            placeholder="Search docs..."
            oninput=${d}
            onfocus=${()=>{t().trim()&&o.set(!0)}}
            onblur=${()=>setTimeout(()=>o.set(!1),200)}
          />
          <div class=${()=>"search-results"+(o()&&s().length>0?" visible":"")}>
            ${()=>s().map(c=>r`
              <div class="search-result" onclick=${()=>l(c.path)}>
                <span style="font-size:10px;text-transform:uppercase;color:var(--accent);letter-spacing:0.05em">${c.section}</span><br/>
                ${c.label}
              </div>
            `)}
          </div>
        </div>
      </div>
      <div class="header-actions">
        <a href="https://github.com/zahiruldu/onefold" target="_blank">GitHub</a>
        <a href="https://www.npmjs.com/package/onefold" target="_blank">npm</a>
      </div>
    </header>
  `}function xe(){let t=new Map;for(let s of T)for(let d of s.links)t.set(d.path,{section:s.title,label:d.label});let o=new Map;for(let s of T)s.links.length>0&&o.set(s.title,s.links[0].path);let n=s=>d=>{d.preventDefault(),k(s)};return r`
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      ${()=>{let s=I(),d=t.get(s);if(s==="/")return document.createTextNode("");let l=[];if(l.push(r`<a class="breadcrumb-link" href="/" onclick=${n("/")}>Home</a>`),l.push(r`<span class="breadcrumb-sep" aria-hidden="true">/</span>`),d){let c=o.get(d.section)??"/";c!==s&&(l.push(r`<a class="breadcrumb-link" href="${c}" onclick=${n(c)}>${d.section}</a>`),l.push(r`<span class="breadcrumb-sep" aria-hidden="true">/</span>`)),l.push(r`<span class="breadcrumb-current" aria-current="page">${d.label}</span>`)}else{let c=s.split("/").filter(Boolean),p=c[c.length-1]??"Page";l.push(r`<span class="breadcrumb-current" aria-current="page">${p}</span>`)}let i=document.createDocumentFragment();for(let c of l)i.appendChild(c);return i}}
    </nav>
  `}function Ce(t){return r`
    <div class="overlay" id="overlay"></div>
    <div class="app-shell">
      ${Se()}
      ${ke()}
      <main class="content">
        ${xe()}
        ${t}
      </main>
    </div>
  `}function to(t){return t.replace(/^(export\s+)?(interface|type)\s+\w+[^]*?\n\}/gm,"").replace(/\)\s*:\s*[A-Za-z<>\[\]|&\s,]+\s*\{/g,") {").replace(/\)\s*:\s*[A-Za-z<>\[\]|&\s,]+\s*=>/g,") =>").replace(/(const|let|var)\s+(\w+)\s*:\s*[A-Za-z<>\[\]|&\s,]+\s*=/g,"$1 $2 =").replace(/(\w)\s*:\s*(?:[A-Z]\w*(?:<[^>]*>)?(?:\[\])?|string|number|boolean|void|any|unknown|never)(\s*[,)=])/g,"$1$2").replace(/(\w)<[^>]+>\(/g,"$1(").replace(/\s+as\s+[A-Z]\w*(?:<[^>]*>)?/g,"").replace(/\n{3,}/g,`

`)}function u(t,o="Live Example"){let n=b(t.trim()),s=b(null),d=b("result"),l=b([]),i=b(t.trim().split(`
`).length),c=b(!1),p=b(!1),f=()=>{p.set(h=>!h),document.body.style.overflow=p()?"hidden":""};te({Escape:()=>{p()&&(p.set(!1),document.body.style.overflow="")},"Ctrl+Enter":()=>g()});let v=h=>{let m=to(h);return['<!DOCTYPE html><html><head><meta charset="utf-8">',"<style>","* { box-sizing: border-box; margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }","body { padding: 12px; font-size: 14px; line-height: 1.6; color: #1a1a2e; }","button { padding: 6px 12px; border-radius: 4px; border: 1px solid #e5e7eb; cursor: pointer; margin: 4px 4px 4px 0; background: #fff; }","button:hover { background: #f3f4f6; }","h1,h2,h3 { margin-bottom: 8px; }","p { margin-bottom: 8px; }","input,textarea,select { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 4px; margin: 4px 0; font-size: 14px; }","ul,ol { padding-left: 20px; }","li { margin: 4px 0; }",".error { color: #dc2626; font-family: monospace; font-size: 12px; white-space: pre-wrap; padding: 8px; background: #fef2f2; border-radius: 4px; }","</style></head><body>",'<div id="app"></div>','<script type="module">',"const CODE = "+JSON.stringify(m)+";","","// Console capture","const _logs = [];","const _origLog = console.log;",'console.log = (...a) => { _logs.push(a.map(x => typeof x === "object" ? JSON.stringify(x,null,2) : String(x)).join(" ")); _origLog(...a); window.parent.postMessage({type:"pg-log",logs:[..._logs]},"*"); };','console.warn = (...a) => console.log("[warn]", ...a);','console.error = (...a) => console.log("[error]", ...a);',"","// Minimal reactive runtime","let _ae = null;","function createSignal(init) {","  let val = init; const subs = new Set();","  const sig = () => { if (_ae) subs.add(_ae); return val; };",'  sig.set = (v) => { const nv = typeof v === "function" ? v(val) : v; if (Object.is(nv, val)) return; val = nv; for (const s of [...subs]) s(); };',"  sig.peek = () => val; return sig;","}","function createEffect(fn) { const eff = () => { const p = _ae; _ae = eff; try { fn(); } finally { _ae = p; } }; eff(); return () => {}; }",'function createComputed(fn) { const s = createSignal(undefined); createEffect(() => s.set(fn())); const r = () => s(); r.peek = s.peek; r.set = () => { throw new Error("Cannot write to computed"); }; return r; }',"function batch(fn) { fn(); }","","function html(strings, ...values) {",'  const PH = "\\x01PH";','  let markup = "";','  for (let i = 0; i < strings.length; i++) { markup += strings[i]; if (i < values.length) { const v = values[i]; if (typeof v === "string" || typeof v === "number") markup += String(v); else markup += PH + i + "\\x01"; } }','  const tpl = document.createElement("template"); tpl.innerHTML = markup; const frag = tpl.content;',"","  const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);","  const tns = []; while (walker.nextNode()) tns.push(walker.currentNode);","  for (const tn of tns) {","    const re = /\\x01PH(\\d+)\\x01/g; let m;","    if ((m = re.exec(tn.textContent)) !== null) {","      const idx = parseInt(m[1]); const val = values[idx];",'      if (typeof val === "function") {','        const marker = document.createTextNode(""); tn.replaceWith(marker); let cur = [];',"        createEffect(() => {","          const r = val(); for (const n of cur) n.remove(); cur = [];",'          if (Array.isArray(r)) { const p = marker.parentNode; if (p) for (const c of r) { if (c instanceof Node) { p.insertBefore(c, marker); cur.push(c); } else { const t = document.createTextNode(String(c??"")); p.insertBefore(t, marker); cur.push(t); } } }',"          else if (r instanceof Node) { if (marker.parentNode) { marker.parentNode.insertBefore(r, marker); cur.push(r); } }",'          else { const t = document.createTextNode(String(r??"")); if (marker.parentNode) { marker.parentNode.insertBefore(t, marker); cur.push(t); } }',"        });","      } else if (val instanceof Node) { tn.replaceWith(val); }","    }","  }","",'  frag.querySelectorAll("*").forEach(el => {',"    for (const attr of [...el.attributes]) {","      const m2 = attr.value.match(/\\x01PH(\\d+)\\x01/);","      if (m2) {","        const idx = parseInt(m2[1]); const val = values[idx];",'        if (attr.name.startsWith("on") && typeof val === "function") { el.removeAttribute(attr.name); el.addEventListener(attr.name.slice(2), val); }','        else if (attr.name === "class" && typeof val === "function") { el.removeAttribute(attr.name); createEffect(() => { el.className = val() || ""; }); }','        else if (attr.name === "style" && typeof val === "object") { el.removeAttribute(attr.name); Object.assign(el.style, val); }','        else if (typeof val === "function") { el.removeAttribute(attr.name); createEffect(() => { const v = val(); if (v === false || v == null) el.removeAttribute(attr.name); else el.setAttribute(attr.name, String(v)); }); }','        else { el.setAttribute(attr.name, String(val ?? "")); }',"      }","    }","  });","","  if (frag.childNodes.length === 1 && frag.firstChild instanceof HTMLElement) return frag.firstChild;",'  const w = document.createElement("div"); w.appendChild(frag); return w;',"}","","function mount(node, container) { container.replaceChildren(node); }",'function css() { return { scope: "", css: "" }; }',"","try {",'  const fn = new Function("createSignal","createEffect","createComputed","batch","html","mount","css",','    CODE + "\\n\\n" +','    "if (typeof App===\\"function\\") mount(App(), document.getElementById(\\"app\\"));\\n" +','    "else if (typeof Counter===\\"function\\") mount(Counter(), document.getElementById(\\"app\\"));\\n" +','    "else if (typeof Main===\\"function\\") mount(Main(), document.getElementById(\\"app\\"));\\n" +','    "else if (typeof Todo===\\"function\\") mount(Todo(), document.getElementById(\\"app\\"));\\n"',"  );","  fn(createSignal, createEffect, createComputed, batch, html, mount, css);",'  window.parent.postMessage({type:"pg-ready"},"*");',"} catch(e) {",`  document.getElementById("app").innerHTML = '<div class="error">' + e.message + '</div>';`,'  window.parent.postMessage({type:"pg-log",logs:["[error] " + e.message]},"*");',"}","<\/script></body></html>"].join(`
`)},g=()=>{let h=s();h&&(c.set(!0),l.set([]),h.srcdoc=v(n()),setTimeout(()=>c.set(!1),300))},x=null,S=()=>{x&&clearTimeout(x),x=setTimeout(g,800)},A=h=>{let m=h.target.value;n.set(m),i.set(m.split(`
`).length),S()},It=h=>{if(h.key==="Tab"){h.preventDefault();let m=h.target,C=m.selectionStart,H=m.selectionEnd;m.value=m.value.substring(0,C)+"  "+m.value.substring(H),m.selectionStart=m.selectionEnd=C+2,n.set(m.value),i.set(m.value.split(`
`).length),S()}},At=h=>{let m=h.target,C=m.previousElementSibling;C&&(C.scrollTop=m.scrollTop)},Dt=()=>{n.set(t.trim()),i.set(t.trim().split(`
`).length);let h=document.querySelector(".playground-editor");h&&(h.value=t.trim()),g()};typeof window<"u"&&window.addEventListener("message",h=>{h.data?.type==="pg-log"&&l.set(h.data.logs??[])});let Lt=h=>{let m=!1,C=0,H=0;h.addEventListener("mousedown",O=>{m=!0,C=O.clientX,H=h.previousElementSibling.getBoundingClientRect().width,document.body.style.cursor="col-resize",document.body.style.userSelect="none",O.preventDefault()}),document.addEventListener("mousemove",O=>{if(!m)return;let re=h.parentElement,Mt=re.getBoundingClientRect().width-120,Ht=Math.max(120,Math.min(Mt,H+(O.clientX-C)))/re.getBoundingClientRect().width*100;h.previousElementSibling.style.cssText=`flex:none;width:${Ht}%;min-width:120px`,h.nextElementSibling.style.flex="1"}),document.addEventListener("mouseup",()=>{m&&(m=!1,document.body.style.cursor="",document.body.style.userSelect="")})};return setTimeout(g,200),r`
    <div class=${()=>"playground"+(p()?" playground-fullscreen":"")}>
      <div class="playground-toolbar">
        <div class="playground-toolbar-left">
          <span class="playground-title">${o}</span>
        </div>
        <div class="playground-toolbar-right">
          <button class="pg-btn pg-btn-run" onclick=${g}>
            ${be()}
            Run
          </button>
          <button class="pg-btn" onclick=${Dt}>Reset</button>
          <button class="pg-btn" onclick=${f} title="Toggle fullscreen (Esc to exit)">
            ${()=>p()?we():ye()}
          </button>
        </div>
      </div>
      <div class="playground-body">
        <div class="playground-left">
          <div class="pg-gutter">${()=>Array.from({length:i()},(h,m)=>r`<div class="pg-line-num">${String(m+1)}</div>`)}</div>
          <textarea
            class="playground-editor"
            oninput=${A}
            onkeydown=${It}
            onscroll=${At}
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          >${t.trim()}</textarea>
        </div>
        <div class="playground-divider" ref=${h=>Lt(h)}></div>
        <div class="playground-right">
          <div class="pg-tabs">
            <button class=${()=>"pg-tab"+(d()==="result"?" active":"")} onclick=${()=>d.set("result")}>Result</button>
            <button class=${()=>"pg-tab"+(d()==="console"?" active":"")} onclick=${()=>d.set("console")}>
              Console${()=>l().length>0?r`<span class="pg-tab-badge">${String(l().length)}</span>`:""}
            </button>
          </div>
          <div class="pg-output-result" style=${()=>d()==="result"?"":"display:none"}>
            <iframe
              ref=${h=>s.set(h)}
              sandbox="allow-scripts"
            ></iframe>
          </div>
          <div class="pg-output-console" style=${()=>d()==="console"?"":"display:none"}>
            ${()=>l().length===0?r`<div class="pg-console-empty">No output. Run the code to see console.log results.</div>`:r`<div class="pg-console-entries">${l().map(h=>r`<div class="pg-console-line"><span class="pg-console-chevron">${">"}</span> ${h}</div>`)}</div>`}
          </div>
        </div>
      </div>
    </div>
  `}var oo=()=>$(`<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
  </svg>`),ro=()=>$(`<svg width="14" height="14" viewBox="0 0 16 16" fill="#16a34a" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
  </svg>`);function e(t,o="ts"){let n=b(!1);return r`
    <div class="code-block-wrapper">
      <button class="code-copy-btn" onclick=${()=>{navigator.clipboard.writeText(t).then(()=>{n.set(!0),setTimeout(()=>n.set(!1),2e3)}).catch(()=>{let d=document.createElement("textarea");d.value=t,d.style.position="fixed",d.style.opacity="0",document.body.appendChild(d),d.select(),document.execCommand("copy"),document.body.removeChild(d),n.set(!0),setTimeout(()=>n.set(!1),2e3)})}} title="Copy to clipboard">
        ${()=>n()?ro():oo()}
        ${()=>n()?"Copied!":""}
      </button>
      <pre><code>${t}</code></pre>
    </div>
  `}function a(t,o="info"){return r`<div class=${o==="warn"?"callout callout-warn":o==="danger"?"callout callout-danger":"callout"}><p>${t}</p></div>`}function $e(){return r`
    <div>
      <div style="text-align:center;margin-bottom:32px">
        <img src="./images/logo.svg" alt="onefold" width="96" height="96" style="display:inline-block;margin-bottom:12px" />
        <h1 style="margin-bottom:4px">onefold</h1>
        <p style="font-size:18px;color:var(--muted);max-width:600px;margin:0 auto">A modern lightweight UI reactive framework for building everything from simple websites to enterprise-scale web applications. Signals, routing, forms, i18n, microfrontend security — no virtual DOM, no compiler, no dependencies.</p>
      </div>

      <div class="hero-stats">
        <div class="hero-stat"><span class="val">3kb</span><span class="lbl">Core (gzipped)</span></div>
        <div class="hero-stat"><span class="val">0</span><span class="lbl">Dependencies</span></div>
        <div class="hero-stat"><span class="val">TypeScript</span><span class="lbl">First-class</span></div>
        <div class="hero-stat"><span class="val">ES2022</span><span class="lbl">Target</span></div>
      </div>

      <h2>Get Started in Seconds</h2>
      ${e(`npm create onefold@latest my-app
cd my-app
npm install
npm run dev`)}

      <h2>Why onefold?</h2>

      <h3>Fine-grained Reactivity</h3>
      <p>Each signal update touches only the exact DOM node that depends on it. No virtual DOM diffing. No tree reconciliation. Updates are O(1) per change — the same architecture class as SolidJS and Svelte 5 runes.</p>

      <h3>Secure by Default</h3>
      <p>Text interpolation always goes through <code>textContent</code>, never <code>innerHTML</code>. XSS from dynamic data is structurally impossible. Event handler strings are blocked. URL schemes are validated. Trusted Types integration for CSP compliance.</p>

      <h3>Complete Toolkit</h3>
      <p>Everything ships in one package — no decision fatigue, no version mismatches between 10 npm packages:</p>
      <ul>
        <li>Routing (nested, dynamic params, programmatic navigation)</li>
        <li>State management (store, persisted signals, DI)</li>
        <li>Forms with validation (8 built-in rules)</li>
        <li>HTTP client with interceptor pipeline</li>
        <li>Internationalization (reactive locale switching)</li>
        <li>Theming (CSS custom properties)</li>
        <li>Microfrontend security (SRI, Shadow DOM, iframe sandbox)</li>
        <li>Streaming (WebSocket, SSE — reactive)</li>
        <li>SSR (renderHTML — zero dependencies, no jsdom)</li>
      </ul>

      <h3>No Compiler Required</h3>
      <p>No JSX transform, no Babel plugin, no Vite config. The <code>html</code> tagged template works at runtime with any bundler — or no bundler at all. Drop a <code>&lt;script type="module"&gt;</code> and go.</p>

      <h3>TypeScript-First</h3>
      <p>Built under <code>strict: true</code> with <code>noUncheckedIndexedAccess</code>. Full type inference. Illegal states fail at compile time, not at runtime.</p>

      ${a("onefold is what you get when you take a fine-grained signal engine, remove the compiler requirement, and ship the entire application toolkit in one package with enterprise security built into the foundation.")}

      <h2>Quick Example</h2>

      <h3>Static rendering</h3>
      <p>The <code>html</code> tagged template creates real DOM nodes. No compilation step — this is runtime code:</p>

      ${u(`// Static \u2014 no signals, just HTML
const welcome = html\`
  <div style="text-align:center">
    <h1>Welcome to onefold!</h1>
    <p>Edit this code and click Run.</p>
    <p>No build step. No compiler. Just tagged templates.</p>
  </div>
\`;

mount(welcome, document.getElementById('app'));`,"Static Rendering")}

      <h3>Dynamic rendering (reactive)</h3>
      <p>Wrap values in <code>() =&gt;</code> to make them reactive. The framework tracks which DOM node reads which signal and updates only that node when the signal changes:</p>

      ${u(`function Counter() {
  const count = createSignal(0);
  const double = createComputed(() => count() * 2);

  return html\`
    <div style="text-align:center">
      <h2>Count: \${() => count()}</h2>
      <p>Double: \${() => double()}</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <button onclick=\${() => count.set(n => n - 1)}>-</button>
        <button onclick=\${() => count.set(n => n + 1)}>+</button>
        <button onclick=\${() => count.set(0)}>Reset</button>
      </div>
    </div>
  \`;
}

mount(Counter(), document.getElementById('app'));`,"Signals + Computed")}

      <h2>Architecture</h2>
      <p>onefold uses fine-grained signals bound directly to real DOM nodes:</p>
      ${e(`Signal changes \u2192 Effect runs \u2192 One DOM node updates

// No virtual DOM tree
// No diffing algorithm
// No reconciliation pass
// No scheduler queue
// Just: signal.set(newValue) \u2192 that one <span> updates`)}

      <p>This is measurably faster than virtual DOM reconciliation on update-heavy workloads because it skips the diff step entirely. The same architecture powers SolidJS and Svelte 5.</p>

      <h2>What's Included</h2>
      <table>
        <tr><th>Category</th><th>Features</th></tr>
        <tr><td><strong>Core</strong></td><td>createSignal, createEffect, createComputed, batch, html, css, mount</td></tr>
        <tr><td><strong>Routing</strong></td><td>Router, nested routes, dynamic params, navigate, Link</td></tr>
        <tr><td><strong>State</strong></td><td>createStore, createPersisted, provide/inject (DI)</td></tr>
        <tr><td><strong>Data</strong></td><td>createResource, createHttpClient, interceptors</td></tr>
        <tr><td><strong>Forms</strong></td><td>createForm, required, email, minLength, maxLength, pattern, min, max, custom</td></tr>
        <tr><td><strong>Microfrontends</strong></td><td>loadRemote, configureSecurity, SRI integrity, Shadow DOM/iframe isolation</td></tr>
        <tr><td><strong>i18n</strong></td><td>createI18n, reactive locale switching, interpolation</td></tr>
        <tr><td><strong>Theming</strong></td><td>createTheme, CSS custom properties, toggle</td></tr>
        <tr><td><strong>Async</strong></td><td>Suspense, SuspenseAll, ErrorBoundary, lazy</td></tr>
        <tr><td><strong>Streaming</strong></td><td>createWebSocket, createEventSource (reactive signals)</td></tr>
        <tr><td><strong>Accessibility</strong></td><td>FocusTrap, announce, useKeyboard, SkipLink</td></tr>
        <tr><td><strong>Performance</strong></td><td>VirtualList (windowed rendering), code splitting</td></tr>
        <tr><td><strong>Interop</strong></td><td>wrapImperative (Chart.js, D3), embedForeign (React, Vue)</td></tr>
        <tr><td><strong>Security</strong></td><td>RBAC guards, XSS prevention, Trusted Types, cssValue sanitizer</td></tr>
        <tr><td><strong>SSR</strong></td><td>renderHTML (zero deps, no jsdom, ~0.5ms/page)</td></tr>
        <tr><td><strong>DevTools</strong></td><td>enableDevtools, render profiling, auto-labeling, signal tracking</td></tr>
        <tr><td><strong>Utilities</strong></td><td>formatDate, timeAgo, formatCurrency, debounce, throttle, pipe, slugify, pluralize</td></tr>
      </table>

      <h2>Comparison</h2>
      <table>
        <tr><th>Framework</th><th>Core Size (gzip)</th><th>Includes</th><th>Compiler</th></tr>
        <tr><td><strong>onefold</strong></td><td>~3kb</td><td>Everything (router, forms, i18n, MFE, SSR...)</td><td>None</td></tr>
        <tr><td>React 19 + ReactDOM</td><td>~42kb</td><td>VDOM + reconciler only (need router, state, forms...)</td><td>JSX transform</td></tr>
        <tr><td>Vue 3</td><td>~16-33kb</td><td>Reactivity + templates (need vue-router, Pinia...)</td><td>SFC compiler</td></tr>
        <tr><td>SolidJS</td><td>~7kb</td><td>Signals + JSX (need @solidjs/router, store...)</td><td>JSX + Babel plugin</td></tr>
        <tr><td>Svelte 5</td><td>~3-5kb runtime</td><td>Runes + compiled output (need SvelteKit for routing)</td><td>Svelte compiler (required)</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/getting-started/install">Installation</a> — npm, CDN, or scaffold a project</li>
        <li><a href="/getting-started/quickstart">Quick Start</a> — build your first app in 2 minutes</li>
        <li><a href="/core/signals">Signals</a> — the reactivity primitive</li>
        <li><a href="/core/templates">Templates</a> — how to write UI with <code>html</code></li>
        <li><a href="/playground">Playground</a> — experiment with code live in the browser</li>
      </ul>
    </div>
  `}function Pe(){return r`
    <div>
      <h1>Installation</h1>
      <p>Get onefold into your project.</p>

      <h2>Scaffold a New Project (Recommended)</h2>
      <p>The fastest way to start is with the official CLI:</p>
      ${e(`npm create onefold@latest my-app
cd my-app
npm install
npm run dev`)}

      <p>This creates a fully configured project with TypeScript, a dev server, and a production build script.</p>

      <h2>Add to an Existing Project</h2>
      ${e(`# npm
npm install onefold

# pnpm
pnpm add onefold

# yarn
yarn add onefold`)}

      <h2>CDN / No Bundler</h2>
      <p>Import directly from a CDN for prototyping:</p>
      ${e(`<script type="module">
  import { createSignal, html, mount } from 'https://esm.sh/onefold@latest';

  const count = createSignal(0);
  mount(
    html\`<button onclick=\${() => count.set(n => n + 1)}>
      Clicked \${() => count()} times
    </button>\`,
    document.getElementById('app')
  );
<\/script>`)}

      ${a("onefold ships as standard ES modules. No special bundler plugins or Babel transforms are needed.")}

      <h2>TypeScript Configuration</h2>
      <p>For the best experience, use strict mode in your <code>tsconfig.json</code>:</p>
      ${e(`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}`)}

      <h2>Requirements</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>Any modern bundler (esbuild, Vite, Rollup, webpack) — or none at all</li>
        <li>Modern browser (Chrome 89+, Firefox 108+, Safari 16.4+, Edge 89+)</li>
      </ul>
    </div>
  `}function Te(){return r`
    <div>
      <h1>Quick Start</h1>
      <p>Build your first onefold app in under 2 minutes.</p>

      <h2>1. Create a Project</h2>
      ${e(`npm create onefold@latest my-app
cd my-app
npm install`)}

      <h2>2. Write a Component</h2>
      <p>Open <code>src/main.ts</code> and replace its content:</p>
      ${e(`import { createSignal, html, mount } from 'onefold';

function App(): Node {
  const name = createSignal('World');

  return html\`
    <div>
      <h1>Hello, \${() => name()}!</h1>
      <input
        type="text"
        value=\${() => name()}
        oninput=\${(e: Event) => name.set((e.target as HTMLInputElement).value)}
      />
    </div>
  \`;
}

mount(App(), document.getElementById('app')!);`)}

      <h2>3. Run It</h2>
      ${e(`npm run dev
# \u2192 http://localhost:3000`)}

      <p>Type in the input — the heading updates instantly. That's reactive signals at work.</p>

      <h2>Try It Live</h2>
      ${u(`function App(): Node {
  const name = createSignal('World');

  return html\`
    <div>
      <h1>Hello, \${() => name()}!</h1>
      <input
        type="text"
        value=\${() => name()}
        oninput=\${(e) => name.set(e.target.value)}
      />
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Hello World")}

      <h2>Key Concepts</h2>
      <ul>
        <li><strong><code>createSignal(value)</code></strong> — creates a reactive value. Call it to read, call <code>.set()</code> to write.</li>
        <li><strong><code>html\`...\`</code></strong> — a tagged template that builds real DOM nodes. Wrap dynamic values in <code>() =></code> to make them reactive.</li>
        <li><strong><code>mount(node, el)</code></strong> — attaches a component tree to the page.</li>
      </ul>

      ${a("The most common mistake: forgetting the () => arrow wrapper. html`<p>${count}</p>` renders once and never updates. html`<p>${() => count()}</p>` updates every time count changes.")}

      <h2>4. Build for Production</h2>
      ${e(`npm run build     # \u2192 dist/
npm run preview   # \u2192 http://localhost:4000`)}

      <p>The production build uses esbuild — typically completes in under 50ms.</p>

      <h2>Next Steps</h2>
      <ul>
        <li>Learn about <a href="/core/signals">Signals</a> — the reactivity primitive</li>
        <li>Explore <a href="/core/templates">Templates</a> — how to write UI</li>
        <li>Add <a href="/routing/router">Routing</a> — for multi-page apps</li>
      </ul>
    </div>
  `}function Re(){return r`
    <div>
      <h1>Signals</h1>
      <p>Signals are the reactive primitive in onefold. They hold a value and automatically notify subscribers when it changes.</p>

      <h2>createSignal</h2>
      ${e(`import { createSignal } from 'onefold';

const count = createSignal(0);

count()              // read current value \u2192 0
count.set(5)         // write a new value
count.set(n => n + 1) // update from previous \u2192 6
count.peek()         // read without subscribing`)}

      <h2>createEffect</h2>
      <p>Run side effects whenever dependencies change. Dependencies are tracked automatically — any signal read inside the effect is subscribed to.</p>
      ${e(`import { createEffect } from 'onefold';

createEffect(() => {
  console.log('Count changed:', count());
});
// Logs immediately, then again on every count.set() call`)}

      <p><code>createEffect</code> returns a disposer function to stop the effect:</p>
      ${e(`const stop = createEffect(() => { /* ... */ });
stop(); // unsubscribes from all signals`)}

      <h2>createComputed</h2>
      <p>Create derived values that only recompute when their dependencies change.</p>
      ${e(`import { createComputed } from 'onefold';

const count = createSignal(3);
const double = createComputed(() => count() * 2);

double() // 6 \u2014 cached until count changes
// double.set(10) \u2192 throws Error (read-only)`)}

      <h2>batch</h2>
      <p>Group multiple signal writes into a single effect flush to avoid intermediate renders.</p>
      ${e(`import { batch } from 'onefold';

const a = createSignal(0);
const b = createSignal(0);

batch(() => {
  a.set(1);
  b.set(2);
}); // effects run once, not twice`)}

      ${a("Without batch, each set() triggers effects immediately. With batch, all sets are collected and effects fire only once at the end.")}

      <h2>Try It</h2>
      ${u(`function App(): Node {
  const count = createSignal(0);
  const double = createComputed(() => count() * 2);

  return html\`
    <div>
      <p>Count: \${() => count()}</p>
      <p>Double: \${() => double()}</p>
      <button onclick=\${() => count.set(n => n + 1)}>+1</button>
      <button onclick=\${() => count.set(n => n - 1)}>-1</button>
      <button onclick=\${() => count.set(0)}>Reset</button>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Signals + Computed")}

      <h2>API Reference</h2>
      <table>
        <tr><th>Function</th><th>Returns</th><th>Description</th></tr>
        <tr><td><code>createSignal(initial)</code></td><td>Signal&lt;T&gt;</td><td>Create a reactive signal</td></tr>
        <tr><td><code>signal()</code></td><td>T</td><td>Read value and subscribe</td></tr>
        <tr><td><code>signal.set(value)</code></td><td>void</td><td>Set new value, notify subscribers</td></tr>
        <tr><td><code>signal.set(fn)</code></td><td>void</td><td>Update from previous value</td></tr>
        <tr><td><code>signal.peek()</code></td><td>T</td><td>Read without subscribing</td></tr>
        <tr><td><code>createEffect(fn)</code></td><td>() => void</td><td>Side effects on dependency change</td></tr>
        <tr><td><code>createComputed(fn)</code></td><td>Signal&lt;T&gt;</td><td>Cached derived computation (read-only)</td></tr>
        <tr><td><code>batch(fn)</code></td><td>void</td><td>Group updates, single flush</td></tr>
      </table>
    </div>
  `}function Ne(){return r`
    <div>
      <h1>Templates (html)</h1>
      <p>The <code>html</code> tagged template literal creates real DOM nodes — no virtual DOM, no diffing. Reactive expressions (functions) are tracked and updated in place.</p>

      <h2>Basic Usage</h2>
      ${e(`import { html } from 'onefold';

// Static content
html\`<div class="card">Hello World</div>\`

// Reactive text
html\`<span>\${() => count()}</span>\`

// Reactive attributes
html\`<div class=\${() => active() ? 'active' : ''}> ... </div>\`

// Static attributes
html\`<div class=\${cls}> ... </div>\``)}

      <h2>Styles</h2>
      ${e(`// Style as string
html\`<div style="color: red; font-size: 16px;">...</div>\`

// Style as object (reactive-friendly)
html\`<div style=\${{ color: 'red', fontSize: '16px' }}>...</div>\``)}

      <h2>Events</h2>
      ${e("// Inline handler\nhtml`<button onclick=${() => count.set(n => n + 1)}>Click</button>`\n\n// Named handler\nconst handleClick = (e: Event) => { /* ... */ };\nhtml`<button onclick=${handleClick}>Click</button>`")}

      <h2>Reactive Lists</h2>
      ${e("const items = createSignal(['Apple', 'Banana', 'Cherry']);\n\nhtml`<ul>\n  ${() => items().map(item => html`<li>${item}</li>`)}\n</ul>`")}

      ${a("The key pattern: wrap dynamic values in () => to make them reactive. Without the arrow, the value is captured once and never updates.")}

      <h2>Two-Way Input Binding</h2>
      <p>Bind a signal to an input's value so the DOM stays in sync when the signal resets:</p>
      ${e(`const name = createSignal('');

html\`<input
  value=\${() => name()}
  oninput=\${(e: Event) => name.set((e.target as HTMLInputElement).value)}
/>\`

// Clearing the signal visually clears the input:
name.set('');`)}

      <h2>Refs</h2>
      <p>Access the underlying DOM element after it's created:</p>
      ${e("html`<input ref=${(el) => el.focus()} />`")}

      <h2>Directives</h2>
      <p>Use registered directives with the <code>d-</code> prefix:</p>
      ${e(`// Register once
registerDirective('tooltip', (el, value) => { /* ... */ });

// Use in templates
html\`<button d-tooltip="Save changes">Save</button>\``)}

      <h2>Conditional Rendering</h2>
      ${e('html`<div>\n  ${() => loggedIn()\n    ? html`<span>Welcome, ${() => user().name}</span>`\n    : html`<a href="/login">Sign in</a>`\n  }\n</div>`')}

      <h2>Try It</h2>
      ${u(`function App(): Node {
  const items = createSignal(['Apple', 'Banana', 'Cherry']);
  const newItem = createSignal('');

  const addItem = () => {
    if (newItem().trim()) {
      items.set(prev => [...prev, newItem()]);
      newItem.set('');
    }
  };

  return html\`
    <div>
      <h3>Shopping List</h3>
      <ul>\${() => items().map(item => html\`<li>\${item}</li>\`)}</ul>
      <input
        placeholder="Add item..."
        oninput=\${(e) => newItem.set(e.target.value)}
        value=\${() => newItem()}
      />
      <button onclick=\${addItem}>Add</button>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Reactive List")}
    </div>
  `}function Ee(){return r`
    <div>
      <h1>Scoped CSS (css)</h1>
      <p>The <code>css</code> tagged template creates scoped stylesheets. Selectors are automatically prefixed with a unique class so styles never leak to other components.</p>

      <h2>Basic Usage</h2>
      ${e(`import { css, html } from 'onefold';

const styles = css\`
  .card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .title {
    font-size: 18px;
    font-weight: bold;
  }
\`;

function Card(): Node {
  return html\`<div class=\${styles.scope}>
    <div class="card">
      <h2 class="title">Scoped!</h2>
      <p>These styles won't affect other components.</p>
    </div>
  </div>\`;
}`)}

      <p>The <code>styles.scope</code> property is a generated class name (e.g. <code>nf-0</code>) that gets prepended to every selector in your CSS block.</p>

      <h2>How It Works</h2>
      <p>At runtime:</p>
      <ol>
        <li>A unique class name is generated (<code>nf-0</code>, <code>nf-1</code>, ...)</li>
        <li>Every selector in your CSS is prefixed with <code>.nf-0</code></li>
        <li>A <code>&lt;style&gt;</code> element is injected into <code>&lt;head&gt;</code> (deduplicated)</li>
        <li>You apply the scope class to your component's root element</li>
      </ol>

      ${a("Styles are deduplicated \u2014 calling css with the same template string reuses the same scope class and does not inject a second <style> element.")}

      <h2>cssValue — Safe User Input</h2>
      <p>When interpolating user-provided values into CSS, use <code>cssValue()</code> to prevent injection:</p>
      ${e(`import { css, cssValue } from 'onefold';

const userColor = 'red; background: url(evil)';
css\`.card { background: \${cssValue(userColor)}; }\`
// Only "red" is applied \u2014 injection is stripped`)}

      <p><code>cssValue()</code> strips <code>{ } &lt; &gt; ;</code>, blocks <code>url()</code> and <code>expression()</code>, and removes <code>@import</code>.</p>

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Returns</th><th>Description</th></tr>
        <tr><td><code>css\`...\`</code></td><td>ScopedStyle</td><td>Create scoped stylesheet, inject into head</td></tr>
        <tr><td><code>styles.scope</code></td><td>string</td><td>Class name to apply to root element</td></tr>
        <tr><td><code>styles.css</code></td><td>string</td><td>Generated CSS text (for SSR/inspection)</td></tr>
        <tr><td><code>cssValue(str)</code></td><td>string</td><td>Sanitize user input for CSS interpolation</td></tr>
      </table>
    </div>
  `}function Ie(){return r`
    <div>
      <h1>Mounting (mount)</h1>
      <p>Attach a component tree to the DOM.</p>

      <h2>Usage</h2>
      ${e(`import { mount, html } from 'onefold';

const app = html\`<div>Hello, World</div>\`;
mount(app, document.getElementById('app')!);`)}

      <p><code>mount</code> clears the container's content and appends the node. This is the one place in your app where you connect onefold to the page.</p>

      <h2>With a Component Function</h2>
      ${e(`function App(): Node {
  return html\`<div>My Application</div>\`;
}

mount(App(), document.getElementById('app')!);`)}

      ${a("mount() replaces the container content. If you need to append instead, use container.appendChild(node) directly with the result of html`...`.")}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Description</th></tr>
        <tr><td><code>mount(node, container)</code></td><td>Clear container and append node. The single "render" call.</td></tr>
      </table>

      <h2>raw() — Explicit HTML Insertion</h2>
      <p>If you need to insert actual HTML markup (not text), use <code>raw()</code>:</p>
      ${e("import { raw } from 'onefold';\n\n// Only for trusted, developer-authored HTML \u2014 never user input\nhtml`<div>${raw('<strong>Bold text</strong>')}</div>`")}

      ${a("raw() runs a minimal sanitizer (strips scripts, event handlers, unsafe URLs). For user-generated HTML, pipe through DOMPurify first.","warn")}
    </div>
  `}function Ae(){return r`
    <div>
      <h1>Router</h1>
      <p>Client-side routing with nested routes, dynamic parameters, and programmatic navigation.</p>

      <h2>Basic Setup</h2>
      ${e(`import { Router, navigate, Link } from 'onefold';

const App = Router([
  { path: '/', view: () => Home() },
  { path: '/about', view: () => About() },
  { path: '/users/:id', view: (params) => UserProfile(params) },
], () => NotFound());`)}

      <h2>How It Works</h2>
      <p>The Router listens to <code>popstate</code> events (History API) and swaps the rendered view when the path changes. Only the matched route's view function is called — other routes remain unmounted.</p>

      ${a("The Router returns a single DOM Node. Mount it once at your app root \u2014 route changes swap content in-place without a full re-render.")}

      <h2>Route Definition</h2>
      <table>
        <tr><th>Property</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>path</code></td><td>string</td><td>URL pattern to match. Supports <code>:param</code> segments.</td></tr>
        <tr><td><code>view</code></td><td>(params, outlet?) => Node</td><td>Render function called when route matches.</td></tr>
        <tr><td><code>children</code></td><td>RouteDefinition[]</td><td>Nested child routes (optional).</td></tr>
      </table>

      <h2>Full Example</h2>
      ${e(`import { Router, navigate, Link, html, mount } from 'onefold';

function Home(): Node {
  return html\`<h2>Welcome Home</h2>\`;
}

function About(): Node {
  return html\`<h2>About Us</h2>\`;
}

function NotFound(): Node {
  return html\`<h2>404 - Not Found</h2>\`;
}

function App(): Node {
  return html\`
    <div>
      <nav>
        \${Link('/', html\`<span>Home</span>\`)}
        \${Link('/about', html\`<span>About</span>\`)}
      </nav>
      \${Router([
        { path: '/', view: () => Home() },
        { path: '/about', view: () => About() },
      ], () => NotFound())}
    </div>
  \`;
}

mount(App(), document.getElementById('app')!);`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/routing/nested">Nested Routes</a> — share layouts across related pages</li>
        <li><a href="/routing/navigate">Navigate</a> — programmatic navigation from code</li>
        <li><a href="/routing/params">Dynamic Params</a> — capture URL segments as parameters</li>
      </ul>
    </div>
  `}function De(){return r`
    <div>
      <h1>configureRouter</h1>
      <p>Configure the router's navigation strategy. By default, onefold uses <strong>path-based routing</strong> (History API). Use <code>configureRouter</code> to switch to hash-based routing for static hosting environments.</p>

      <h2>Routing Modes</h2>
      <table>
        <tr><th>Mode</th><th>URL Format</th><th>When to Use</th></tr>
        <tr><td><strong>Path</strong> (default)</td><td><code>/about</code>, <code>/users/42</code></td><td>Servers with SPA fallback (Express, Nginx, Vercel, Netlify with <code>_redirects</code>)</td></tr>
        <tr><td><strong>Hash</strong></td><td><code>#/about</code>, <code>#/users/42</code></td><td>Static hosting without server config (GitHub Pages, S3, local <code>file://</code>)</td></tr>
      </table>

      <h2>Default Behavior</h2>
      <p>Without calling <code>configureRouter</code>, the router uses path-based routing. It automatically falls back to hash mode when running on the <code>file:</code> protocol (e.g. opening an HTML file directly in the browser).</p>

      ${e(`import { Router, navigate } from 'onefold';

// Path-based by default \u2014 no configuration needed
const app = Router([
  { path: '/', view: () => Home() },
  { path: '/about', view: () => About() },
], () => NotFound());

navigate('/about'); // URL becomes: /about`)}

      <h2>Enabling Hash Mode</h2>
      <p>Call <code>configureRouter({ hash: true })</code> <strong>before</strong> creating any Router or calling <code>navigate()</code>.</p>

      ${e(`import { configureRouter, Router, navigate } from 'onefold';

// Enable hash routing for GitHub Pages / static hosting
configureRouter({ hash: true });

const app = Router([
  { path: '/', view: () => Home() },
  { path: '/about', view: () => About() },
], () => NotFound());

navigate('/about'); // URL becomes: #/about`)}

      ${a("configureRouter must be called before any Router or navigate call. Once the router initializes, changing the mode has no effect.")}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>configureRouter</code></td><td><code>{ hash?: boolean }</code></td><td>Set the routing strategy. <code>hash: true</code> enables hash-based routing.</td></tr>
      </table>

      <h2>How Each Mode Works</h2>

      <h3>Path Mode (default)</h3>
      <ul>
        <li>Uses <code>history.pushState()</code> to update the URL</li>
        <li>Listens to <code>popstate</code> events for back/forward navigation</li>
        <li>Requires the server to serve <code>index.html</code> for all routes (SPA fallback)</li>
        <li>Clean URLs: <code>/users/42</code></li>
      </ul>

      <h3>Hash Mode</h3>
      <ul>
        <li>Uses <code>window.location.hash</code> to store the route</li>
        <li>Listens to <code>hashchange</code> events for navigation</li>
        <li>Works on any static file server — no server config needed</li>
        <li>URLs include <code>#</code>: <code>example.com/#/users/42</code></li>
      </ul>

      <h2>Deployment Guide</h2>

      <h3>GitHub Pages</h3>
      ${e(`// main.ts
import { configureRouter, Router, mount } from 'onefold';

configureRouter({ hash: true });

const app = Router([...routes], () => NotFound());
mount(app, document.getElementById('app')!);`)}
      <p>Also ensure your <code>index.html</code> uses relative paths for assets:</p>
      ${e(`<!-- Use ./ instead of / for asset paths -->
<link rel="stylesheet" href="./style.css" />
<script type="module" src="./app.js"><\/script>`,"html")}

      <h3>Intercepting Internal Links (Hash Mode)</h3>
      <p>When using hash mode, any raw <code>&lt;a href="/..."&gt;</code> links in your page content will trigger a full page navigation instead of client-side routing. To fix this, add a global click interceptor after mounting your app:</p>
      ${e(`import { configureRouter, Router, navigate, mount } from 'onefold';

configureRouter({ hash: true });

const app = Router([...routes], () => NotFound());
mount(app, document.getElementById('app')!);

// Intercept internal links so raw <a href="/..."> in page content
// uses client-side navigation instead of full page reload
document.addEventListener('click', (e) => {
  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
  e.preventDefault();
  navigate(href);
});

// Navigate to home if no hash is present on initial load
if (!location.hash || location.hash === '#/') {
  navigate('/');
}`)}
      ${a('This interceptor is only needed if your page content contains plain <a href="/path"> links that are not using the Link component. If all navigation uses Link or navigate(), you can skip this.')}


      <h3>Server with SPA Fallback (Nginx)</h3>
      ${e(`# No configureRouter needed \u2014 path mode works out of the box
# nginx.conf
location / {
  try_files $uri $uri/ /index.html;
}`,"nginx")}

      <h3>Vercel / Netlify</h3>
      <p>These platforms support SPA fallback natively. Use path mode (the default) with no extra config.</p>

      <h2>Link Behavior</h2>
      <p>The <code>Link</code> component automatically adapts to the configured mode:</p>
      ${e(`import { Link } from 'onefold';

// Path mode \u2192 <a href="/about">About</a>
// Hash mode \u2192 <a href="#/about">About</a>
Link('/about', 'About');`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/routing/router">Router</a> — route definitions and matching</li>
        <li><a href="/routing/navigate">Navigate</a> — programmatic navigation</li>
        <li><a href="/routing/link">Link</a> — declarative navigation with active state</li>
        <li><a href="/routing/nested">Nested Routes</a> — layouts with child routes</li>
      </ul>
    </div>
  `}function Le(){return r`
    <div>
      <h1>Nested Routes</h1>
      <p>Parent layouts can render child routes via the <code>outlet</code> parameter. This lets you share layout elements (navbars, sidebars) across related pages.</p>

      <h2>How It Works</h2>
      <p>When a route has <code>children</code>, its view function receives a second argument — the <code>outlet</code>. The outlet is the rendered child route's Node. Place it wherever you want the nested content to appear.</p>

      <h2>Example: Settings Layout</h2>
      ${e(`import { Router, Link, html, mount } from 'onefold';

function SettingsLayout(params: any, outlet: Node): Node {
  return html\`
    <div class="settings">
      <nav class="settings-nav">
        \${Link('/settings/profile', html\`<span>Profile</span>\`)}
        \${Link('/settings/billing', html\`<span>Billing</span>\`)}
        \${Link('/settings/notifications', html\`<span>Notifications</span>\`)}
      </nav>
      <div class="settings-content">
        \${outlet}
      </div>
    </div>
  \`;
}

function ProfilePage(): Node {
  return html\`<h2>Profile Settings</h2>\`;
}

function BillingPage(): Node {
  return html\`<h2>Billing & Subscription</h2>\`;
}

function NotificationsPage(): Node {
  return html\`<h2>Notification Preferences</h2>\`;
}

const App = Router([
  { path: '/settings', view: SettingsLayout, children: [
    { path: '/profile', view: () => ProfilePage() },
    { path: '/billing', view: () => BillingPage() },
    { path: '/notifications', view: () => NotificationsPage() },
  ]},
]);`)}

      ${a("Child paths are relative to the parent. /settings/profile matches the parent /settings and then the child /profile.")}

      <h2>Multiple Nesting Levels</h2>
      <p>Nesting can go as deep as needed. Each level receives its own outlet:</p>
      ${e(`const routes = [
  { path: '/app', view: AppLayout, children: [
    { path: '/dashboard', view: DashboardLayout, children: [
      { path: '/stats', view: () => StatsPage() },
      { path: '/charts', view: () => ChartsPage() },
    ]},
    { path: '/settings', view: SettingsLayout, children: [
      { path: '/profile', view: () => ProfilePage() },
    ]},
  ]},
];`)}

      <h2>Index Routes</h2>
      <p>Use an empty child path to define a default view for a parent route:</p>
      ${e(`{ path: '/settings', view: SettingsLayout, children: [
  { path: '', view: () => SettingsOverview() },  // /settings
  { path: '/profile', view: () => ProfilePage() }, // /settings/profile
]}`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/routing/link">Link</a> — declarative navigation with active state</li>
        <li><a href="/routing/params">Dynamic Params</a> — capture URL segments as parameters</li>
      </ul>
    </div>
  `}function Me(){return r`
    <div>
      <h1>Programmatic Navigation</h1>
      <p>Use <code>navigate(path)</code> to change routes from code — after form submissions, authentication, or any event handler.</p>

      <h2>Basic Usage</h2>
      ${e(`import { navigate } from 'onefold';

// Navigate to a path
navigate('/dashboard');

// Navigate with a dynamic segment
const userId = '42';
navigate(\`/users/\${userId}\`);`)}

      <h2>Common Patterns</h2>

      <h3>After Form Submit</h3>
      ${e(`function LoginForm(): Node {
  const handleSubmit = async () => {
    const success = await login(email(), password());
    if (success) {
      navigate('/dashboard');
    }
  };

  return html\`
    <form onsubmit=\${(e: Event) => { e.preventDefault(); handleSubmit(); }}>
      <!-- form fields -->
      <button type="submit">Log In</button>
    </form>
  \`;
}`)}

      <h3>Conditional Redirect</h3>
      ${e(`import { navigate, createEffect } from 'onefold';

createEffect(() => {
  if (!isAuthenticated()) {
    navigate('/login');
  }
});`)}

      ${a("navigate() uses the History API (pushState) under the hood. The browser URL updates without a page reload.")}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>navigate</code></td><td><code>path: string</code></td><td>Push a new entry to browser history and trigger route matching.</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/routing/link">Link</a> — declarative navigation with active state</li>
        <li><a href="/routing/router">Router</a> — client-side routing overview</li>
      </ul>
    </div>
  `}function He(){return r`
    <div>
      <h1>Link Component</h1>
      <p>Declarative navigation with automatic active state. <code>Link</code> renders an anchor that prevents default navigation and uses <code>navigate()</code> internally.</p>

      <h2>Basic Usage</h2>
      ${e("import { Link, html } from 'onefold';\n\nfunction Nav(): Node {\n  return html`\n    <nav>\n      ${Link('/', html`<span>Home</span>`)}\n      ${Link('/about', html`<span>About</span>`)}\n      ${Link('/contact', html`<span>Contact</span>`, 'nav-link')}\n    </nav>\n  `;\n}")}

      <h2>Signature</h2>
      ${e("Link(href: string, child: Node, className?: string): Node")}

      <table>
        <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>href</code></td><td>string</td><td>Target path for navigation.</td></tr>
        <tr><td><code>child</code></td><td>Node</td><td>Content to render inside the link.</td></tr>
        <tr><td><code>className</code></td><td>string (optional)</td><td>CSS class to apply to the anchor element.</td></tr>
      </table>

      <h2>Active State</h2>
      <p>When the current route matches the link's <code>href</code>, the anchor receives an <code>active</code> class. You can style it with CSS:</p>
      ${e(`/* Style active navigation links */
a.active {
  color: var(--primary);
  font-weight: 600;
  border-bottom: 2px solid var(--primary);
}`)}

      ${a("Link uses client-side navigation \u2014 no full page reload. It calls event.preventDefault() and uses navigate() internally.")}

      <h2>Link vs navigate()</h2>
      <table>
        <tr><th>Use Case</th><th>Approach</th></tr>
        <tr><td>Navigation menus, breadcrumbs</td><td><code>Link()</code> — declarative, accessible</td></tr>
        <tr><td>After form submit, conditional redirect</td><td><code>navigate()</code> — imperative, from code</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/routing/navigate">Navigate</a> — programmatic navigation from code</li>
        <li><a href="/routing/params">Dynamic Params</a> — capture URL segments as parameters</li>
      </ul>
    </div>
  `}function Oe(){return r`
    <div>
      <h1>Dynamic Parameters</h1>
      <p>Define URL segments that capture values at runtime using the <code>:param</code> syntax. Captured values are passed to the view function as a params object.</p>

      <h2>Defining Dynamic Routes</h2>
      ${e(`import { Router, html } from 'onefold';

const App = Router([
  { path: '/users/:id', view: (params) => UserProfile(params) },
  { path: '/posts/:slug', view: (params) => BlogPost(params) },
  { path: '/org/:orgId/team/:teamId', view: (params) => TeamPage(params) },
]);`)}

      <h2>Accessing Parameters</h2>
      <p>The <code>params</code> object is a plain key-value map of captured segments:</p>
      ${e(`function UserProfile(params: { id: string }): Node {
  return html\`
    <div>
      <h2>User: \${params.id}</h2>
      <!-- fetch user data using params.id -->
    </div>
  \`;
}

// URL: /users/42 \u2192 params = { id: '42' }
// URL: /users/abc \u2192 params = { id: 'abc' }`)}

      <h2>Multiple Parameters</h2>
      ${e(`function TeamPage(params: { orgId: string; teamId: string }): Node {
  return html\`
    <div>
      <h2>Org: \${params.orgId} / Team: \${params.teamId}</h2>
    </div>
  \`;
}

// URL: /org/acme/team/engineering
// params = { orgId: 'acme', teamId: 'engineering' }`)}

      ${a("All param values are strings. Parse numbers yourself: parseInt(params.id, 10).")}

      <h2>Combined with Resource</h2>
      <p>Use params with <code>createResource</code> for reactive data fetching:</p>
      ${e(`import { createSignal, createResource, html } from 'onefold';

function UserProfile(params: { id: string }): Node {
  const userId = createSignal(params.id);
  const user = createResource(userId, async (id) => {
    const res = await fetch(\`/api/users/\${id}\`);
    return res.json();
  });

  return html\`
    <div>
      <h2>\${() => user.data()?.name ?? 'Loading...'}</h2>
      <p>\${() => user.data()?.email ?? ''}</p>
    </div>
  \`;
}`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/data/resource">Resource</a> — reactive async data fetching</li>
        <li><a href="/routing/router">Router</a> — client-side routing overview</li>
      </ul>
    </div>
  `}function Ue(){return r`
    <div>
      <h1>Store</h1>
      <p><code>createStore</code> is a signal over an object with a convenient <code>.update()</code> method for partial merges. Use it for managing structured application state.</p>

      <h2>Basic Usage</h2>
      ${e(`import { createStore } from 'onefold';

interface AppState {
  user: string | null;
  theme: 'light' | 'dark';
  count: number;
}

const store = createStore<AppState>({
  user: null,
  theme: 'light',
  count: 0,
});

// Read the full state
store()  // { user: null, theme: 'light', count: 0 }

// Partial update \u2014 merges with existing state
store.update({ count: 5 });
// { user: null, theme: 'light', count: 5 }

store.update({ user: 'Alice', theme: 'dark' });
// { user: 'Alice', theme: 'dark', count: 5 }`)}

      <h2>Reactivity</h2>
      <p>Store is a signal — use it in templates and effects just like <code>createSignal</code>:</p>
      ${e(`import { createEffect, html } from 'onefold';

createEffect(() => {
  console.log('Theme changed:', store().theme);
});

function ThemeDisplay(): Node {
  return html\`
    <p>Current theme: \${() => store().theme}</p>
    <button onclick=\${() => store.update({
      theme: store().theme === 'light' ? 'dark' : 'light'
    })}>Toggle Theme</button>
  \`;
}`)}

      ${a("store.update() performs a shallow merge (like Object.assign). For deeply nested state, spread inner objects yourself.")}

      <h2>Replace vs Update</h2>
      ${e(`// .update() \u2014 shallow merge (keeps other fields)
store.update({ count: 10 });

// .set() \u2014 full replacement (overwrites the entire object)
store.set({ user: null, theme: 'light', count: 0 });`)}

      <h2>API Reference</h2>
      <table>
        <tr><th>Method</th><th>Description</th></tr>
        <tr><td><code>store()</code></td><td>Read current state (subscribes in reactive context).</td></tr>
        <tr><td><code>store.set(value)</code></td><td>Replace the entire state object.</td></tr>
        <tr><td><code>store.update(partial)</code></td><td>Shallow merge partial into current state.</td></tr>
        <tr><td><code>store.peek()</code></td><td>Read current state without subscribing.</td></tr>
      </table>

      ${u(`function App() {
  const todos = createSignal([]);
  const input = createSignal('');

  function addTodo() {
    const text = input().trim();
    if (!text) return;
    todos.set(prev => [...prev, { id: Date.now(), text, done: false }]);
    input.set('');
    // Clear the actual DOM input
    const el = document.querySelector('#todo-input');
    if (el) el.value = '';
  }

  function removeTodo(id) {
    todos.set(prev => prev.filter(t => t.id !== id));
  }

  function toggleTodo(id) {
    todos.set(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  return html\`
    <div>
      <h3>Todo List (Store Demo)</h3>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input
          id="todo-input"
          oninput=\${(e) => input.set(e.target.value)}
          onkeydown=\${(e) => { if (e.key === 'Enter') addTodo(); }}
          placeholder="Add a todo..."
          style="flex:1"
        />
        <button onclick=\${addTodo}>Add</button>
      </div>
      <ul style="list-style:none;padding:0">
        \${() => todos().map(t => html\`
          <li style="display:flex;align-items:center;gap:8px;padding:4px 0">
            <input type="checkbox" \${t.done ? 'checked' : ''} onchange=\${() => toggleTodo(t.id)} />
            <span style=\${t.done ? 'text-decoration:line-through;opacity:0.5' : ''}>\${t.text}</span>
            <button onclick=\${() => removeTodo(t.id)} style="margin-left:auto;font-size:12px">Remove</button>
          </li>
        \`)}
      </ul>
      <p style="font-size:12px;color:#666">\${() => todos().length} item(s) total</p>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Todo List with Store")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/state/persisted">Persisted Signals</a> — automatically sync state to localStorage</li>
        <li><a href="/data/resource">Resource</a> — reactive async data fetching</li>
      </ul>
    </div>
  `}function Be(){return r`
    <div>
      <h1>Persisted Signals</h1>
      <p><code>createPersisted</code> creates a signal that automatically syncs with <code>localStorage</code>. The value persists across page refreshes and browser sessions.</p>

      <h2>Basic Usage</h2>
      ${e(`import { createPersisted } from 'onefold';

// Persists under key 'user-theme' in localStorage
const theme = createPersisted('user-theme', 'light');

theme()       // 'light' (or stored value if previously set)
theme.set('dark');  // updates signal AND localStorage`)}

      <h2>With Objects</h2>
      ${e(`interface Preferences {
  fontSize: number;
  sidebarOpen: boolean;
  locale: string;
}

const prefs = createPersisted<Preferences>('app-prefs', {
  fontSize: 14,
  sidebarOpen: true,
  locale: 'en',
});

// Objects are serialized as JSON
prefs.set({ ...prefs(), fontSize: 16 });`)}

      <h2>Options</h2>
      ${e(`const token = createPersisted('auth-token', '', {
  storage: sessionStorage,   // use sessionStorage instead
  serialize: (v) => btoa(v), // custom serializer
  deserialize: (s) => atob(s), // custom deserializer
});`)}

      <table>
        <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
        <tr><td><code>storage</code></td><td>Storage</td><td>localStorage</td><td>Storage backend (localStorage, sessionStorage).</td></tr>
        <tr><td><code>serialize</code></td><td>(value) => string</td><td>JSON.stringify</td><td>Custom serializer for storage.</td></tr>
        <tr><td><code>deserialize</code></td><td>(raw) => T</td><td>JSON.parse</td><td>Custom deserializer from storage.</td></tr>
      </table>

      ${a("If localStorage is unavailable (e.g., incognito mode in some browsers), createPersisted falls back to an in-memory signal.")}

      <h2>Reactive in Templates</h2>
      ${e(`function SettingsPanel(): Node {
  const fontSize = createPersisted('font-size', 14);

  return html\`
    <div>
      <p>Font size: \${() => fontSize()}px</p>
      <button onclick=\${() => fontSize.set(s => s + 1)}>Increase</button>
      <button onclick=\${() => fontSize.set(s => s - 1)}>Decrease</button>
      <button onclick=\${() => fontSize.set(14)}>Reset</button>
    </div>
  \`;
}`)}

      ${u(`function App() {
  const theme = createSignal('light');
  const saved = createSignal('light');

  function toggle() {
    const next = theme() === 'light' ? 'dark' : 'light';
    theme.set(next);
    saved.set(next);
  }

  function simulateReload() {
    // Simulates restoring from "persisted" storage
    const stored = saved();
    theme.set(stored);
  }

  return html\`
    <div>
      <h3>Persisted Theme Preference</h3>
      <p>Current theme: <strong>\${() => theme()}</strong></p>
      <p style="font-size:12px;color:#666">Saved in storage: \${() => saved()}</p>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button onclick=\${toggle}>Toggle Theme</button>
        <button onclick=\${simulateReload}>Simulate Reload</button>
      </div>
      <div style=\${() => 'margin-top:16px;padding:16px;border-radius:8px;' + (theme() === 'dark' ? 'background:#1e293b;color:#e2e8f0' : 'background:#f8fafc;color:#1a1a2e;border:1px solid #e5e7eb')}>
        <p>This card reflects the current theme.</p>
        <p style="font-size:12px">The value persists across simulated reloads.</p>
      </div>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Persisted Theme Preference")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/state/store">Store</a> — manage structured application state</li>
        <li><a href="/theming">Theming</a> — reactive CSS custom properties with theme switching</li>
      </ul>
    </div>
  `}function je(){return r`
    <div>
      <h1>Resource</h1>
      <p><code>createResource</code> provides reactive async data fetching. It tracks loading state, errors, and data — and automatically refetches when the source signal changes.</p>

      <h2>Basic Usage</h2>
      ${e(`import { createSignal, createResource } from 'onefold';

const userId = createSignal(1);

const user = createResource(userId, async (id) => {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
});

// Reactive accessors
user.data()     // T | undefined
user.loading()  // boolean
user.error()    // Error | null`)}

      <h2>In Templates</h2>
      ${e(`function UserCard(): Node {
  const userId = createSignal(1);
  const user = createResource(userId, async (id) => {
    const res = await fetch(\`/api/users/\${id}\`);
    return res.json();
  });

  return html\`
    <div>
      \${() => user.loading()
        ? html\`<p>Loading...</p>\`
        : user.error()
          ? html\`<p class="error">\${user.error()!.message}</p>\`
          : html\`<p>\${user.data()?.name}</p>\`
      }
      <button onclick=\${() => userId.set(n => n + 1)}>Next User</button>
    </div>
  \`;
}`)}

      <h2>Manual Refetch</h2>
      ${e(`// Refetch with the current source value
user.refetch();`)}

      <h2>Cleanup</h2>
      ${e(`// Stop watching the source signal
user.dispose();`)}

      ${a("When the source signal changes, any in-flight request from the previous source value is ignored (its result will not update .data()).")}

      <h2>Without a Source Signal</h2>
      <p>Pass <code>null</code> as the source to fetch once on creation:</p>
      ${e(`const posts = createResource(null, async () => {
  const res = await fetch('/api/posts');
  return res.json();
});

// Fetch again manually
posts.refetch();`)}

      <h2>API Reference</h2>
      <table>
        <tr><th>Property/Method</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>.data()</code></td><td>T | undefined</td><td>The resolved data (reactive).</td></tr>
        <tr><td><code>.loading()</code></td><td>boolean</td><td>True while fetching (reactive).</td></tr>
        <tr><td><code>.error()</code></td><td>Error | null</td><td>The rejection error, if any (reactive).</td></tr>
        <tr><td><code>.refetch()</code></td><td>void</td><td>Re-run the fetcher with current source.</td></tr>
        <tr><td><code>.dispose()</code></td><td>void</td><td>Stop watching the source signal.</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/data/http-client">HTTP Client</a> — typed HTTP client with interceptors</li>
        <li><a href="/async/suspense">Suspense</a> — show fallback UI while data loads</li>
      </ul>
    </div>
  `}function Fe(){return r`
    <div>
      <h1>HTTP Client</h1>
      <p><code>createHttpClient</code> provides a typed HTTP client with interceptors, automatic JSON handling, and a clean API for <code>get</code>, <code>post</code>, <code>put</code>, <code>patch</code>, and <code>delete</code> methods.</p>

      <h2>Setup</h2>
      ${e(`import { createHttpClient } from 'onefold';

const http = createHttpClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});`)}

      <h2>Making Requests</h2>
      ${e(`// GET
const users = await http.get<User[]>('/users');

// POST
const newUser = await http.post<User>('/users', {
  body: { name: 'Alice', email: 'alice@example.com' },
});

// PUT
await http.put<User>('/users/1', {
  body: { name: 'Alice Updated' },
});

// PATCH
await http.patch<User>('/users/1', {
  body: { email: 'newemail@example.com' },
});

// DELETE
await http.delete('/users/1');`)}

      <h2>Options</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>baseUrl</code></td><td>string</td><td>Prepended to all request paths.</td></tr>
        <tr><td><code>headers</code></td><td>Record&lt;string, string&gt;</td><td>Default headers for every request.</td></tr>
        <tr><td><code>interceptors</code></td><td>Interceptors</td><td>Request/response/error hooks.</td></tr>
      </table>

      <h2>Request Options</h2>
      ${e(`const data = await http.get<User>('/users/1', {
  headers: { 'X-Custom': 'value' },  // merged with defaults
  signal: abortController.signal,     // AbortSignal for cancellation
});`)}

      ${a("All methods automatically serialize request bodies to JSON and parse JSON responses. Non-JSON responses return the raw Response object.")}

      <h2>Error Handling</h2>
      ${e(`try {
  const user = await http.get<User>('/users/999');
} catch (err) {
  // err.status \u2014 HTTP status code
  // err.message \u2014 error message
  // err.data \u2014 parsed response body (if JSON)
}`)}

      <h2>With createResource</h2>
      ${e(`import { createSignal, createResource } from 'onefold';

const userId = createSignal(1);
const user = createResource(userId, (id) => http.get<User>(\`/users/\${id}\`));

// user.data(), user.loading(), user.error() \u2014 all reactive`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/data/interceptors">Interceptors</a> — transform requests and handle errors globally</li>
        <li><a href="/data/resource">Resource</a> — reactive async data fetching</li>
      </ul>
    </div>
  `}function We(){return r`
    <div>
      <h1>HTTP Interceptors</h1>
      <p>Interceptors let you transform requests before they're sent, process responses before they reach your code, and handle errors globally.</p>

      <h2>Adding Interceptors</h2>
      ${e(`import { createHttpClient } from 'onefold';

const http = createHttpClient({
  baseUrl: '/api',
  interceptors: {
    request: (config) => {
      // Add auth token to every request
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: \`Bearer \${token}\`,
        };
      }
      return config;
    },
    response: (response) => {
      // Log all responses
      console.log(\`[\${response.status}] \${response.url}\`);
      return response;
    },
    error: (error) => {
      // Global error handling
      if (error.status === 401) {
        navigate('/login');
      }
      throw error; // re-throw to propagate
    },
  },
});`)}

      <h2>Interceptor Pipeline</h2>
      <p>The execution order is:</p>
      <ol>
        <li><strong>Request interceptor</strong> — modify config (headers, body, URL) before fetch.</li>
        <li><strong>Network request</strong> — the actual HTTP call.</li>
        <li><strong>Response interceptor</strong> — process/transform successful responses.</li>
        <li><strong>Error interceptor</strong> — handle non-2xx responses or network failures.</li>
      </ol>

      ${a("Each interceptor must return the config/response (or a modified version). Forgetting to return will break the chain.")}

      <h2>Use Cases</h2>

      <h3>Token Refresh</h3>
      ${e(`interceptors: {
  error: async (error) => {
    if (error.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newToken = await refreshToken();
      localStorage.setItem('token', newToken);
      return http.request(error.config); // retry
    }
    throw error;
  },
}`)}

      <h3>Request Timing</h3>
      ${e(`interceptors: {
  request: (config) => {
    config._startTime = performance.now();
    return config;
  },
  response: (response) => {
    const duration = performance.now() - response.config._startTime;
    console.log(\`Request took \${duration.toFixed(0)}ms\`);
    return response;
  },
}`)}

      <h2>API</h2>
      <table>
        <tr><th>Interceptor</th><th>Signature</th><th>Description</th></tr>
        <tr><td><code>request</code></td><td>(config) => config</td><td>Modify request before sending.</td></tr>
        <tr><td><code>response</code></td><td>(response) => response</td><td>Process successful responses.</td></tr>
        <tr><td><code>error</code></td><td>(error) => throw | response</td><td>Handle errors globally.</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/data/http-client">HTTP Client</a> — typed HTTP client setup and usage</li>
        <li><a href="/security/guards">RBAC Guards</a> — role-based access control for routes</li>
      </ul>
    </div>
  `}function _e(){return r`
    <div>
      <h1>Forms</h1>
      <p><code>createForm</code> provides reactive form management with field-level state tracking, validation, dirty/touched states, and submission handling.</p>

      <h2>Basic Usage</h2>
      ${e(`import { createForm, required, email } from 'onefold';

const form = createForm({
  fields: {
    name: { initial: '', rules: [required()] },
    email: { initial: '', rules: [required(), email()] },
    age: { initial: 18, rules: [] },
  },
  onSubmit: (values) => {
    console.log('Submitted:', values);
  },
});`)}

      <h2>Binding to Templates</h2>
      ${e(`function ContactForm(): Node {
  const form = createForm({
    fields: {
      name: { initial: '', rules: [required()] },
      email: { initial: '', rules: [required(), email()] },
      message: { initial: '', rules: [required()] },
    },
    onSubmit: async (values) => {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
  });

  return html\`
    <form onsubmit=\${form.handleSubmit}>
      <div>
        <label>Name</label>
        <input
          value=\${() => form.field('name').value()}
          oninput=\${(e: Event) => form.field('name').set((e.target as HTMLInputElement).value)}
          onblur=\${() => form.field('name').touch()}
        />
        \${() => form.field('name').error()
          ? html\`<span class="error">\${form.field('name').error()}</span>\`
          : html\`<span></span>\`
        }
      </div>

      <button type="submit" disabled=\${() => !form.valid()}>
        Submit
      </button>
    </form>
  \`;
}`)}

      <h2>Field API</h2>
      <table>
        <tr><th>Property/Method</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>.value()</code></td><td>T</td><td>Current field value (reactive).</td></tr>
        <tr><td><code>.set(value)</code></td><td>void</td><td>Update the field value.</td></tr>
        <tr><td><code>.error()</code></td><td>string | null</td><td>First validation error (reactive).</td></tr>
        <tr><td><code>.errors()</code></td><td>string[]</td><td>All validation errors (reactive).</td></tr>
        <tr><td><code>.touched()</code></td><td>boolean</td><td>True after user interaction.</td></tr>
        <tr><td><code>.touch()</code></td><td>void</td><td>Mark field as touched.</td></tr>
        <tr><td><code>.dirty()</code></td><td>boolean</td><td>True if value differs from initial.</td></tr>
        <tr><td><code>.reset()</code></td><td>void</td><td>Reset to initial value.</td></tr>
      </table>

      <h2>Form API</h2>
      <table>
        <tr><th>Property/Method</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>form.valid()</code></td><td>boolean</td><td>True when all fields pass validation.</td></tr>
        <tr><td><code>form.dirty()</code></td><td>boolean</td><td>True when any field is dirty.</td></tr>
        <tr><td><code>form.field(name)</code></td><td>Field</td><td>Access a field's reactive state.</td></tr>
        <tr><td><code>form.handleSubmit</code></td><td>(e: Event) => void</td><td>Submit handler (prevents default, validates, calls onSubmit).</td></tr>
        <tr><td><code>form.reset()</code></td><td>void</td><td>Reset all fields to initial values.</td></tr>
        <tr><td><code>form.values()</code></td><td>Record</td><td>Current values of all fields.</td></tr>
      </table>

      ${a("Validation runs on every .set() call. Errors are reactive \u2014 your UI updates automatically when a field becomes valid or invalid.")}

      ${u(`function App() {
  const email = createSignal('');
  const password = createSignal('');
  const errors = createSignal({ email: '', password: '' });
  const submitted = createSignal(false);

  function validate() {
    const errs = { email: '', password: '' };
    const emailVal = email().trim();
    const passVal = password();

    if (!emailVal) errs.email = 'Email is required';
    else if (!emailVal.includes('@')) errs.email = 'Must be a valid email';

    if (!passVal) errs.password = 'Password is required';
    else if (passVal.length < 6) errs.password = 'Must be at least 6 characters';

    errors.set(errs);
    return !errs.email && !errs.password;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      submitted.set(true);
    }
  }

  return html\`
    <div>
      <h3>Login Form</h3>
      \${() => submitted()
        ? html\`<p style="color:green">Login successful!</p>\`
        : html\`<span></span>\`
      }
      <form onsubmit=\${handleSubmit}>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:13px;margin-bottom:4px">Email</label>
          <input
            type="email"
            value=\${() => email()}
            oninput=\${(e) => { email.set(e.target.value); validate(); }}
            placeholder="you@example.com"
            style="width:100%"
          />
          \${() => errors().email ? html\`<p style="color:#dc2626;font-size:12px;margin:4px 0 0">\${errors().email}</p>\` : html\`<span></span>\`}
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:13px;margin-bottom:4px">Password</label>
          <input
            type="password"
            value=\${() => password()}
            oninput=\${(e) => { password.set(e.target.value); validate(); }}
            placeholder="Enter password"
            style="width:100%"
          />
          \${() => errors().password ? html\`<p style="color:#dc2626;font-size:12px;margin:4px 0 0">\${errors().password}</p>\` : html\`<span></span>\`}
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Login Form with Validation")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/forms/validation">Validation Rules</a> — built-in and custom validation rules</li>
        <li><a href="/data/http-client">HTTP Client</a> — submit form data to your API</li>
      </ul>
    </div>
  `}function ze(){return r`
    <div>
      <h1>Validation Rules</h1>
      <p>onefold ships with 8 built-in validation rules. Combine them per field or write custom validators.</p>

      <h2>Built-in Rules</h2>
      <table>
        <tr><th>Rule</th><th>Import</th><th>Description</th></tr>
        <tr><td><code>required()</code></td><td><code>required</code></td><td>Value must be non-empty (trims whitespace).</td></tr>
        <tr><td><code>email()</code></td><td><code>email</code></td><td>Must match a valid email pattern.</td></tr>
        <tr><td><code>minLength(n)</code></td><td><code>minLength</code></td><td>String length must be at least n.</td></tr>
        <tr><td><code>maxLength(n)</code></td><td><code>maxLength</code></td><td>String length must be at most n.</td></tr>
        <tr><td><code>pattern(re)</code></td><td><code>pattern</code></td><td>Must match the given RegExp.</td></tr>
        <tr><td><code>min(n)</code></td><td><code>min</code></td><td>Numeric value must be at least n.</td></tr>
        <tr><td><code>max(n)</code></td><td><code>max</code></td><td>Numeric value must be at most n.</td></tr>
        <tr><td><code>custom(fn)</code></td><td><code>custom</code></td><td>Custom validation function.</td></tr>
      </table>

      <h2>Usage</h2>
      ${e(`import { createForm, required, email, minLength, maxLength, min, max, pattern, custom } from 'onefold';

const form = createForm({
  fields: {
    username: {
      initial: '',
      rules: [required(), minLength(3), maxLength(20)],
    },
    email: {
      initial: '',
      rules: [required(), email()],
    },
    age: {
      initial: 18,
      rules: [min(13), max(120)],
    },
    phone: {
      initial: '',
      rules: [pattern(/^\\+?[\\d\\s-]{10,}$/)],
    },
    password: {
      initial: '',
      rules: [
        required(),
        minLength(8),
        custom((value) =>
          /[A-Z]/.test(value) ? null : 'Must contain an uppercase letter'
        ),
        custom((value) =>
          /[0-9]/.test(value) ? null : 'Must contain a number'
        ),
      ],
    },
  },
  onSubmit: (values) => console.log(values),
});`)}

      <h2>Custom Validators</h2>
      <p>The <code>custom()</code> rule takes a function that returns <code>null</code> for valid or an error string:</p>
      ${e(`// Synchronous custom validator
custom((value) => {
  if (value.includes(' ')) return 'No spaces allowed';
  return null;
})

// Confirm password match
const form = createForm({
  fields: {
    password: { initial: '', rules: [required(), minLength(8)] },
    confirm: {
      initial: '',
      rules: [
        required(),
        custom((value) =>
          value === form.field('password').value()
            ? null
            : 'Passwords do not match'
        ),
      ],
    },
  },
  onSubmit: (values) => { /* ... */ },
});`)}

      ${a("Rules are evaluated in order. The first failing rule produces the .error() value. All failures appear in .errors().")}

      <h2>Custom Error Messages</h2>
      <p>Each built-in rule accepts an optional message parameter:</p>
      ${e(`rules: [
  required('Please enter your name'),
  minLength(3, 'Name must be at least 3 characters'),
  email('Please enter a valid email address'),
]`)}
    </div>
  `}function qe(){return r`
    <div>
      <h1>configureSecurity</h1>
      <p>Establish a security perimeter for remote module loading. Call <code>configureSecurity</code> once at app startup — before any <code>loadRemote</code> calls — to enforce origin whitelisting, SRI integrity checks, timeouts, and sandboxing.</p>

      ${a('If you have not used loadRemote yet, start with the <a href="/microfrontends/load-remote">loadRemote</a> page to understand how remote modules work, then come back here to lock them down.')}

      <h2>When Do You Need This?</h2>
      <p><code>loadRemote</code> works without <code>configureSecurity</code> — but in production you should always configure it to prevent untrusted code from executing in your app. It answers: <em>which origins can load code into my application?</em></p>

      <h2>Configuration</h2>
      ${e(`import { configureSecurity } from 'onefold';

configureSecurity({
  trustedOrigins: ['https://cdn.example.com', 'https://widgets.example.com'],
  requireIntegrity: true,
  blockAll: false,
  timeout: 10000,
});`)}

      <h2>Options</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
        <tr><td><code>trustedOrigins</code></td><td>string[]</td><td>[]</td><td>Allowed origins for remote modules.</td></tr>
        <tr><td><code>requireIntegrity</code></td><td>boolean</td><td>false</td><td>Require SRI hash for all remote loads.</td></tr>
        <tr><td><code>blockAll</code></td><td>boolean</td><td>false</td><td>Block all remote loading (kill switch).</td></tr>
        <tr><td><code>timeout</code></td><td>number</td><td>10000</td><td>Maximum load time in ms before failing.</td></tr>
      </table>

      <h2>The 7 Security Layers</h2>
      <ol>
        <li><strong>Origin Allowlist</strong> — Only modules from <code>trustedOrigins</code> can be loaded. All other origins are rejected before any network request.</li>
        <li><strong>SRI Integrity</strong> — When <code>requireIntegrity</code> is true, every module must provide a hash. The fetched content is verified against the hash before execution.</li>
        <li><strong>Timeout</strong> — Modules that take longer than <code>timeout</code> ms are aborted. Prevents slow-loris attacks on the host application.</li>
        <li><strong>Isolation</strong> — Shadow DOM or iframe sandboxing prevents DOM access leaks between host and remote.</li>
        <li><strong>CSP Compatible</strong> — No <code>eval()</code>, no <code>Function()</code>, no inline scripts. Works with strict Content-Security-Policy headers.</li>
        <li><strong>Error Containment</strong> — Errors in remote modules are caught and contained. They cannot crash the host application.</li>
        <li><strong>Kill Switch</strong> — Set <code>blockAll: true</code> to instantly disable all remote module loading in production.</li>
      </ol>

      ${a("Always use requireIntegrity: true in production. Without it, a compromised CDN could serve malicious code that passes origin checks.","warn")}

      <h2>Production Example</h2>
      ${e(`configureSecurity({
  trustedOrigins: [
    'https://cdn.yourcompany.com',
    'https://widgets.yourcompany.com',
  ],
  requireIntegrity: true,
  blockAll: false,
  timeout: 8000,
});`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/microfrontends/sri">SRI Integrity</a> — generating and verifying integrity hashes</li>
        <li><a href="/microfrontends/isolation">Isolation Modes</a> — Shadow DOM and iframe sandboxing</li>
        <li><a href="/microfrontends/deployment">Deployment</a> — deploying microfrontend architectures</li>
      </ul>
    </div>
  `}function Ve(){return r`
    <div>
      <h1>loadRemote</h1>
      <p>Load remote ES modules as components at runtime. This is the core API for building microfrontend architectures with onefold — compose independently deployed modules into a single host application.</p>

      <h2>What are Microfrontends?</h2>
      <p>Microfrontends split a large frontend into smaller, independently built and deployed pieces. Each team owns a "remote" module that the host application loads at runtime. onefold provides:</p>
      <ul>
        <li><strong>loadRemote</strong> — fetch and render remote modules dynamically</li>
        <li><strong>Isolation</strong> — sandbox remotes with Shadow DOM or iframes</li>
        <li><strong>Security</strong> — origin allowlisting, SRI integrity, and sandboxing</li>
        <li><strong>Communication</strong> — type-safe messaging between host and remotes</li>
      </ul>

      <h2>Basic Usage</h2>
      <p>The simplest way to load a remote module — provide a URL and an optional fallback:</p>
      ${e(`import { loadRemote, html } from 'onefold';

function App(): Node {
  return html\`
    <div>
      <h1>Host Application</h1>
      \${loadRemote({
        url: 'https://cdn.example.com/widgets/billing.js',
        fallback: () => html\`<p>Loading billing widget...</p>\`,
      })}
    </div>
  \`;
}`)}

      ${a("The remote module must export a default function that returns a Node. onefold calls it with the provided props.")}

      <h2>Remote Module Format</h2>
      <p>A remote is a standard ES module with a default export:</p>
      ${e(`// billing-widget.ts (deployed separately)
import { html, createSignal } from 'onefold';

export default function BillingWidget(props: { plan: string }): Node {
  const expanded = createSignal(false);

  return html\`
    <div class="billing">
      <h3>Plan: \${props.plan}</h3>
      <button onclick=\${() => expanded.set(v => !v)}>Details</button>
      \${() => expanded() ? html\`<p>Billing details here...</p>\` : html\`<span></span>\`}
    </div>
  \`;
}`)}

      <h2>Passing Props</h2>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widgets/billing.js',
  props: { plan: 'enterprise', userId: '42' },
  fallback: () => html\`<p>Loading...</p>\`,
})`)}

      <h2>Error Handling</h2>
      <p>Provide an <code>onError</code> handler for graceful degradation when a remote fails to load:</p>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widgets/billing.js',
  fallback: () => html\`<p>Loading...</p>\`,
  onError: (err) => html\`<p class="error">Widget unavailable: \${err.message}</p>\`,
})`)}

      <h2>With Integrity Verification</h2>
      <p>Add SRI hashes to verify the remote hasn't been tampered with:</p>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widgets/billing.js',
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux...',
  fallback: () => html\`<p>Loading...</p>\`,
})`)}

      <h2>With Isolation</h2>
      <p>Isolate the remote's DOM and styles from the host:</p>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widgets/legacy.js',
  isolation: 'shadow',  // Shadow DOM \u2014 styles don't leak in or out
  fallback: () => html\`<p>Loading...</p>\`,
})`)}

      <h2>Options Reference</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>url</code></td><td>string</td><td>Yes</td><td>URL of the remote ES module.</td></tr>
        <tr><td><code>integrity</code></td><td>string</td><td>No*</td><td>SRI hash for verification.</td></tr>
        <tr><td><code>fallback</code></td><td>() => Node</td><td>No</td><td>UI shown while loading.</td></tr>
        <tr><td><code>onError</code></td><td>(err) => Node</td><td>No</td><td>UI shown on load failure.</td></tr>
        <tr><td><code>props</code></td><td>Record</td><td>No</td><td>Props passed to the remote component.</td></tr>
        <tr><td><code>isolation</code></td><td>'none' | 'shadow' | 'iframe'</td><td>No</td><td>DOM isolation mode.</td></tr>
        <tr><td><code>timeout</code></td><td>number</td><td>No</td><td>Override global timeout (ms) for this load.</td></tr>
      </table>

      <p>* Required when <code>configureSecurity({ requireIntegrity: true })</code> is set.</p>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/microfrontends/isolation">Isolation Modes</a> — Shadow DOM vs iframe sandboxing</li>
        <li><a href="/microfrontends/communication">Communication</a> — messaging between host and remotes</li>
        <li><a href="/microfrontends/security">configureSecurity</a> — origin allowlisting and security perimeter</li>
        <li><a href="/microfrontends/sri">SRI Integrity</a> — verifying remote code hasn't been tampered with</li>
      </ul>
    </div>
  `}function Ge(){return r`
    <div>
      <h1>Isolation Modes</h1>
      <p>Control how remote microfrontends interact with the host DOM. Choose the right level of isolation for your use case.</p>

      <h2>Comparison</h2>
      <table>
        <tr><th>Mode</th><th>DOM Access</th><th>Style Leak</th><th>JS Scope</th><th>Performance</th><th>Use Case</th></tr>
        <tr><td><code>none</code></td><td>Full</td><td>Yes</td><td>Shared</td><td>Best</td><td>Trusted, same-team remotes</td></tr>
        <tr><td><code>shadow</code></td><td>Scoped</td><td>No</td><td>Shared</td><td>Good</td><td>Style isolation needed</td></tr>
        <tr><td><code>iframe</code></td><td>None</td><td>No</td><td>Isolated</td><td>Fair</td><td>Untrusted or legacy code</td></tr>
      </table>

      <h2>None (Default)</h2>
      <p>The remote component renders directly into the host DOM. No boundaries.</p>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widget.js',
  isolation: 'none', // default
})`)}
      <ul>
        <li>Host CSS affects the remote.</li>
        <li>Remote can access host DOM via standard APIs.</li>
        <li>Best performance — no extra layers.</li>
      </ul>

      <h2>Shadow DOM</h2>
      <p>Renders the remote inside a Shadow DOM boundary. Styles are encapsulated.</p>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widget.js',
  isolation: 'shadow',
})`)}
      <ul>
        <li>Host styles don't leak into the remote.</li>
        <li>Remote styles don't affect the host.</li>
        <li>JavaScript scope is still shared (same window).</li>
        <li>Good for design system isolation between teams.</li>
      </ul>

      <h2>Iframe</h2>
      <p>Full isolation via a sandboxed iframe. The remote runs in a separate browsing context.</p>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widget.js',
  isolation: 'iframe',
})`)}
      <ul>
        <li>Complete DOM isolation.</li>
        <li>Separate JavaScript execution context.</li>
        <li>Communication via <code>postMessage</code> only.</li>
        <li>Higher memory overhead.</li>
        <li>Best for untrusted third-party code.</li>
      </ul>

      ${a('Use "shadow" for same-organization teams that need style isolation. Use "iframe" only for untrusted or legacy code that might pollute globals.',"warn")}

      <h2>Choosing the Right Mode</h2>
      <table>
        <tr><th>Scenario</th><th>Recommended</th></tr>
        <tr><td>Internal widget, same design system</td><td><code>none</code></td></tr>
        <tr><td>Internal widget, different team/styles</td><td><code>shadow</code></td></tr>
        <tr><td>Third-party embed, untrusted code</td><td><code>iframe</code></td></tr>
        <tr><td>Legacy jQuery/Angular widget</td><td><code>iframe</code></td></tr>
      </table>
    </div>
  `}function Je(){return r`
    <div>
      <h1>Communication</h1>
      <p>How host and remote microfrontends exchange data. The pattern depends on the isolation mode.</p>

      <h2>Host → Remote (Props)</h2>
      <p>Pass data down via the <code>props</code> option. The remote's default export receives them as its argument.</p>
      ${e(`// Host
loadRemote({
  url: 'https://cdn.example.com/widgets/billing.js',
  props: {
    userId: currentUser().id,
    plan: 'pro',
    theme: 'dark',
  },
});

// Remote (billing.js)
export default function BillingWidget(props: {
  userId: string;
  plan: string;
  theme: string;
}): Node {
  return html\`<div class=\${props.theme}>Plan: \${props.plan}</div>\`;
}`)}

      <h2>Remote → Host (Callbacks)</h2>
      <p>Pass callback functions as props. The remote calls them to communicate back.</p>
      ${e(`// Host
function App(): Node {
  const handleUpgrade = (newPlan: string) => {
    console.log('User upgraded to:', newPlan);
    store.update({ plan: newPlan });
  };

  return html\`
    <div>
      \${loadRemote({
        url: 'https://cdn.example.com/widgets/billing.js',
        props: {
          plan: store().plan,
          onUpgrade: handleUpgrade,
        },
      })}
    </div>
  \`;
}

// Remote
export default function BillingWidget(props: {
  plan: string;
  onUpgrade: (plan: string) => void;
}): Node {
  return html\`
    <div>
      <p>Current: \${props.plan}</p>
      <button onclick=\${() => props.onUpgrade('enterprise')}>
        Upgrade to Enterprise
      </button>
    </div>
  \`;
}`)}

      <h2>Iframe Communication (postMessage)</h2>
      <p>When using <code>isolation: 'iframe'</code>, props and callbacks aren't available directly. Use <code>postMessage</code>:</p>
      ${e(`// Host \u2014 sending data to iframe remote
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://cdn.example.com') return;

  if (event.data.type === 'UPGRADE_REQUEST') {
    store.update({ plan: event.data.plan });
  }
});

// Remote (inside iframe) \u2014 sending data to host
window.parent.postMessage(
  { type: 'UPGRADE_REQUEST', plan: 'enterprise' },
  'https://host-app.example.com'
);`)}

      ${a("Always validate event.origin in postMessage handlers. Never trust messages from unknown origins.","warn")}

      <h2>Communication Summary</h2>
      <table>
        <tr><th>Isolation</th><th>Host → Remote</th><th>Remote → Host</th></tr>
        <tr><td><code>none</code></td><td>Props (direct)</td><td>Callbacks (direct)</td></tr>
        <tr><td><code>shadow</code></td><td>Props (direct)</td><td>Callbacks (direct)</td></tr>
        <tr><td><code>iframe</code></td><td>postMessage</td><td>postMessage</td></tr>
      </table>
    </div>
  `}function Ye(){return r`
    <div>
      <h1>SRI (Subresource Integrity)</h1>
      <p>SRI ensures that fetched remote modules haven't been tampered with. The browser (or onefold's loader) verifies a cryptographic hash of the file's content before execution.</p>

      <h2>How It Works</h2>
      <ol>
        <li>You compute a hash of the remote module at build/deploy time.</li>
        <li>You provide that hash in the <code>integrity</code> option.</li>
        <li>onefold fetches the module, computes its hash, and compares.</li>
        <li>If hashes don't match → load is rejected, <code>onError</code> fires.</li>
      </ol>

      <h2>Usage</h2>
      ${e(`loadRemote({
  url: 'https://cdn.example.com/widgets/billing.js',
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxANQFe...',
  fallback: () => html\`<p>Loading...</p>\`,
  onError: (err) => html\`<p class="error">Integrity check failed</p>\`,
});`)}

      <h2>Generating Hashes</h2>
      <p>Use any of these commands to generate an SRI hash:</p>

      <h3>OpenSSL</h3>
      ${e("openssl dgst -sha384 -binary billing.js | openssl base64 -A")}

      <h3>shasum + base64</h3>
      ${e("shasum -b -a 384 billing.js | awk '{ print $1 }' | xxd -r -p | base64")}

      <h3>Node.js</h3>
      ${e(`const crypto = require('crypto');
const fs = require('fs');

const content = fs.readFileSync('billing.js');
const hash = crypto.createHash('sha384').update(content).digest('base64');
console.log(\`sha384-\${hash}\`);`)}

      <h2>Attack Comparison</h2>
      <table>
        <tr><th>Attack</th><th>Without SRI</th><th>With SRI</th></tr>
        <tr><td>CDN compromise</td><td>Malicious code executes</td><td>Load rejected, fallback shown</td></tr>
        <tr><td>Man-in-the-middle</td><td>Injected code runs</td><td>Hash mismatch, blocked</td></tr>
        <tr><td>DNS hijacking</td><td>Fake module loads</td><td>Origin check + hash fails</td></tr>
        <tr><td>Cache poisoning</td><td>Stale/malicious cache served</td><td>Hash mismatch, blocked</td></tr>
      </table>

      ${a("SRI hashes must be regenerated every time the remote module is rebuilt. Automate this in your CI/CD pipeline.","warn")}

      <h2>Hash Validity</h2>
      <p>Supported algorithms (in order of preference):</p>
      <ul>
        <li><strong>sha512</strong> — strongest, recommended for high-security environments</li>
        <li><strong>sha384</strong> — standard, used by most CDNs</li>
        <li><strong>sha256</strong> — minimum acceptable strength</li>
      </ul>
      <p>The integrity string format is: <code>algorithm-base64hash</code></p>
      ${e(`// Valid formats
'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux...'
'sha512-abc123def456...'
'sha256-xyz789...'`)}
    </div>
  `}function Ke(){return r`
    <div>
      <h1>Deployment</h1>
      <p>Microfrontends in onefold are independently deployable ES modules. Each team owns their remote, deploys on their own schedule, and the host loads them at runtime.</p>

      <h2>Independent Deployment</h2>
      <ul>
        <li>Each remote is built and deployed separately.</li>
        <li>The host only knows the remote's URL — not its source.</li>
        <li>Teams can use different CI/CD pipelines, release cadences, and environments.</li>
        <li>SRI hashes are updated in the host config when a remote deploys.</li>
      </ul>

      <h2>Project Structure</h2>
      ${e(`my-microfrontend-app/
\u251C\u2500\u2500 host/                    # Host shell application
\u2502   \u251C\u2500\u2500 src/
\u2502   \u2502   \u251C\u2500\u2500 main.ts         # Router + loadRemote calls
\u2502   \u2502   \u2514\u2500\u2500 config.ts       # Remote URLs + integrity hashes
\u2502   \u251C\u2500\u2500 package.json
\u2502   \u2514\u2500\u2500 build.mjs
\u251C\u2500\u2500 remotes/
\u2502   \u251C\u2500\u2500 billing/            # Billing team's widget
\u2502   \u2502   \u251C\u2500\u2500 src/index.ts
\u2502   \u2502   \u251C\u2500\u2500 package.json
\u2502   \u2502   \u2514\u2500\u2500 build.mjs
\u2502   \u251C\u2500\u2500 analytics/          # Analytics team's widget
\u2502   \u2502   \u251C\u2500\u2500 src/index.ts
\u2502   \u2502   \u251C\u2500\u2500 package.json
\u2502   \u2502   \u2514\u2500\u2500 build.mjs
\u2502   \u2514\u2500\u2500 shared/             # Shared component library
\u2514\u2500\u2500 package.json            # Workspace root (optional)`)}

      <h2>Performance Features</h2>
      <table>
        <tr><th>Feature</th><th>Description</th></tr>
        <tr><td>Lazy loading</td><td>Remotes load only when their route is visited.</td></tr>
        <tr><td>Parallel loading</td><td>Multiple remotes can load concurrently.</td></tr>
        <tr><td>Caching</td><td>Loaded modules are cached — subsequent navigations are instant.</td></tr>
        <tr><td>Prefetch</td><td>Preload remotes on hover/idle for perceived performance.</td></tr>
        <tr><td>Fallback UI</td><td>Show skeleton/spinner while loading.</td></tr>
      </table>

      <h2>Error Handling</h2>
      ${e(`loadRemote({
  url: remoteConfig.billingUrl,
  integrity: remoteConfig.billingHash,
  timeout: 5000,
  fallback: () => html\`<div class="skeleton">Loading billing...</div>\`,
  onError: (err) => html\`
    <div class="error-card">
      <h3>Billing widget unavailable</h3>
      <p>\${err.message}</p>
      <button onclick=\${() => location.reload()}>Retry</button>
    </div>
  \`,
});`)}

      <h2>CLI Scaffold</h2>
      <p>Use <code>create-onefold</code> to scaffold a microfrontend project:</p>
      ${e(`npm create onefold@latest my-app -- --template microfrontend

# Creates:
# my-app/
#   host/          \u2014 Host shell with router
#   remotes/       \u2014 Example remote widgets
#   build.mjs      \u2014 Build script for all packages`)}

      ${a("Each remote should be served with immutable cache headers (e.g., Cache-Control: public, max-age=31536000, immutable) and content-addressed filenames for cache busting.")}
    </div>
  `}function Xe(){return r`
    <div>
      <h1>Shared Dependencies</h1>
      <p>When multiple remotes use onefold (or other shared libraries), Import Maps prevent duplicate downloads and ensure a single instance.</p>

      <h2>The Problem</h2>
      <p>Without sharing, each remote bundles its own copy of onefold. This means:</p>
      <ul>
        <li>3kb × N remotes downloaded redundantly.</li>
        <li>Multiple signal systems — signals don't cross remote boundaries.</li>
        <li>Larger memory footprint.</li>
      </ul>

      <h2>Import Maps Solution</h2>
      ${e(`<!-- index.html (host) -->
<script type="importmap">
{
  "imports": {
    "onefold": "https://cdn.example.com/onefold@1.2.0/index.js"
  }
}
<\/script>`)}

      <p>Remotes use bare imports that resolve via the map:</p>
      ${e(`// Remote widget \u2014 bare import (resolved by import map)
import { html, createSignal } from 'onefold';

export default function Widget(): Node {
  const count = createSignal(0);
  return html\`<button onclick=\${() => count.set(n => n + 1)}>\${() => count()}</button>\`;
}`)}

      <h2>Comparison</h2>
      <table>
        <tr><th>Approach</th><th>Bundle Size</th><th>Shared State</th><th>Complexity</th></tr>
        <tr><td>Each remote bundles onefold</td><td>Large (duplicated)</td><td>No</td><td>Low</td></tr>
        <tr><td>Import Map (shared)</td><td>Minimal (single copy)</td><td>Yes</td><td>Medium</td></tr>
        <tr><td>External (CDN + global)</td><td>Minimal</td><td>Yes</td><td>Medium</td></tr>
      </table>

      <h2>Versioning Strategy</h2>
      <p>Pin the shared dependency to a specific version in the import map:</p>
      ${e(`{
  "imports": {
    "onefold": "https://cdn.example.com/onefold@1.2.0/index.js"
  }
}`)}
      <ul>
        <li><strong>Patch updates</strong> — safe to update the import map URL. Remotes don't need redeployment.</li>
        <li><strong>Minor updates</strong> — generally safe. Test remotes against the new version first.</li>
        <li><strong>Major updates</strong> — coordinate with all teams. Update remotes before changing the map.</li>
      </ul>

      ${a("Import Maps are supported in all modern browsers. For older browsers, use the es-module-shims polyfill.")}

      <h2>Build Configuration</h2>
      <p>Mark <code>onefold</code> as external in your remote's build config so it's not bundled:</p>
      ${e(`// esbuild config for remote
import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  external: ['onefold'],  // Don't bundle \u2014 resolved via import map
  outfile: 'dist/widget.js',
});`)}
    </div>
  `}function Qe(){return r`
    <div>
      <h1>Cross-Framework Integration</h1>
      <p>Embed React, Vue, or other framework components inside onefold apps — or load legacy apps in isolated iframes.</p>

      <h2>embedForeign (React/Vue)</h2>
      ${e(`import { embedForeign } from 'onefold';

// Embed a React component
const ReactWidget = embedForeign({
  mount: (container, props) => {
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container);
      root.render(React.createElement(MyReactComponent, props));
      return { root };
    });
  },
  unmount: (container, { root }) => {
    root.unmount();
  },
  props: { title: 'Hello from onefold' },
});`)}

      <h2>Embed Vue</h2>
      ${e(`const VueWidget = embedForeign({
  mount: (container, props) => {
    import('vue').then(({ createApp }) => {
      const app = createApp(MyVueComponent, props);
      app.mount(container);
      return { app };
    });
  },
  unmount: (container, { app }) => {
    app.unmount();
  },
  props: { message: 'Hello from onefold' },
});`)}

      <h2>loadRemote with iframe (Legacy)</h2>
      <p>For legacy jQuery/Angular.js apps that pollute globals:</p>
      ${e(`loadRemote({
  url: 'https://legacy.example.com/widget.js',
  isolation: 'iframe',
  fallback: () => html\`<p>Loading legacy widget...</p>\`,
});`)}

      ${a("iframe isolation is the safest option for legacy code that uses document.write, global variables, or older module formats.")}

      <h2>Comparison</h2>
      <table>
        <tr><th>Approach</th><th>Framework</th><th>Isolation</th><th>Performance</th></tr>
        <tr><td><code>embedForeign</code></td><td>React, Vue, Svelte</td><td>None (shared DOM)</td><td>Good</td></tr>
        <tr><td><code>loadRemote</code> + iframe</td><td>Any / Legacy</td><td>Full</td><td>Fair</td></tr>
      </table>
    </div>
  `}function Ze(){return r`
    <div>
      <h1>Microfrontend API Reference</h1>
      <p>Complete reference for <code>loadRemote</code> and <code>configureSecurity</code>.</p>

      <h2>loadRemote(options)</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
        <tr><td><code>url</code></td><td>string</td><td>Yes</td><td>—</td><td>URL of the remote ES module.</td></tr>
        <tr><td><code>integrity</code></td><td>string</td><td>No*</td><td>—</td><td>SRI hash (sha256/sha384/sha512).</td></tr>
        <tr><td><code>fallback</code></td><td>() => Node</td><td>No</td><td>—</td><td>UI to show while loading.</td></tr>
        <tr><td><code>onError</code></td><td>(err: Error) => Node</td><td>No</td><td>—</td><td>UI to show on failure.</td></tr>
        <tr><td><code>props</code></td><td>Record&lt;string, any&gt;</td><td>No</td><td>{}</td><td>Props passed to the remote default export.</td></tr>
        <tr><td><code>isolation</code></td><td>'none' | 'shadow' | 'iframe'</td><td>No</td><td>'none'</td><td>DOM isolation mode.</td></tr>
        <tr><td><code>timeout</code></td><td>number</td><td>No</td><td>10000</td><td>Max load time in ms (overrides global).</td></tr>
      </table>
      <p>* Required when <code>configureSecurity({ requireIntegrity: true })</code> is active.</p>

      <h2>configureSecurity(options)</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
        <tr><td><code>trustedOrigins</code></td><td>string[]</td><td>No</td><td>[]</td><td>Allowed origins. Modules from other origins are rejected.</td></tr>
        <tr><td><code>requireIntegrity</code></td><td>boolean</td><td>No</td><td>false</td><td>Require SRI hash for all loadRemote calls.</td></tr>
        <tr><td><code>blockAll</code></td><td>boolean</td><td>No</td><td>false</td><td>Kill switch — blocks all remote loading.</td></tr>
        <tr><td><code>timeout</code></td><td>number</td><td>No</td><td>10000</td><td>Global timeout in ms for remote loads.</td></tr>
      </table>

      <h2>embedForeign(options)</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>mount</code></td><td>(container, props) => context</td><td>Yes</td><td>Mount the foreign framework into the container element.</td></tr>
        <tr><td><code>unmount</code></td><td>(container, context) => void</td><td>Yes</td><td>Cleanup when the node is removed from DOM.</td></tr>
        <tr><td><code>props</code></td><td>Record&lt;string, any&gt;</td><td>No</td><td>Props passed to the mount function.</td></tr>
      </table>

      <h2>Return Values</h2>
      ${e(`// loadRemote returns a Node (renders immediately with fallback)
const node: Node = loadRemote({ url: '...', fallback: () => html\`...\` });

// configureSecurity returns void (global side effect)
configureSecurity({ trustedOrigins: ['...'] });

// embedForeign returns a Node
const node: Node = embedForeign({ mount: ..., unmount: ... });`)}
    </div>
  `}function et(){return r`
    <div>
      <h1>Suspense</h1>
      <p><code>Suspense</code> shows a fallback UI while async children are loading. <code>SuspenseAll</code> waits for multiple async components before revealing content.</p>

      <h2>Suspense</h2>
      ${e(`import { Suspense, html } from 'onefold';

function App(): Node {
  return html\`
    <div>
      \${Suspense(
        () => UserProfile(),  // async component
        () => html\`<p>Loading profile...</p>\`  // fallback
      )}
    </div>
  \`;
}`)}

      <h2>SuspenseAll</h2>
      <p>Wait for multiple async resources before showing any content:</p>
      ${e(`import { SuspenseAll, html } from 'onefold';

function Dashboard(): Node {
  return html\`
    <div>
      \${SuspenseAll(
        [() => UserStats(), () => RecentActivity(), () => Notifications()],
        () => html\`<div class="skeleton">Loading dashboard...</div>\`
      )}
    </div>
  \`;
}`)}

      ${a("Suspense works with createResource, lazy(), and any component that returns a Promise<Node>.")}

      <h2>Nested Suspense</h2>
      ${e(`function App(): Node {
  return html\`
    <div>
      \${Suspense(
        () => html\`
          <div>
            <h1>Dashboard</h1>
            \${Suspense(
              () => ExpensiveChart(),
              () => html\`<div class="chart-skeleton"></div>\`
            )}
          </div>
        \`,
        () => html\`<p>Loading app...</p>\`
      )}
    </div>
  \`;
}`)}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>Suspense</code></td><td>(content, fallback)</td><td>Show fallback while content resolves.</td></tr>
        <tr><td><code>SuspenseAll</code></td><td>(contents[], fallback)</td><td>Show fallback until all contents resolve.</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/async/lazy-loading">Lazy Loading</a> — load components on demand with code splitting</li>
        <li><a href="/async/error-boundaries">Error Boundaries</a> — catch render errors gracefully</li>
      </ul>
    </div>
  `}function tt(){return r`
    <div>
      <h1>Lazy Loading</h1>
      <p><code>lazy()</code> enables code splitting by loading components on demand. The module is only fetched when the component is first rendered.</p>

      <h2>Basic Usage</h2>
      ${e(`import { lazy, Suspense, html } from 'onefold';

const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard(): Node {
  return html\`
    <div>
      <h1>Dashboard</h1>
      \${Suspense(
        () => HeavyChart(),
        () => html\`<p>Loading chart...</p>\`
      )}
    </div>
  \`;
}`)}

      <h2>With Router</h2>
      <p>Combine <code>lazy()</code> with the router for route-level code splitting:</p>
      ${e(`import { Router, lazy } from 'onefold';

const Home = lazy(() => import('./pages/Home'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

const App = Router([
  { path: '/', view: () => Home() },
  { path: '/settings', view: () => Settings() },
  { path: '/analytics', view: () => Analytics() },
]);`)}

      ${a("lazy() caches the module after the first load. Navigating back to a lazy-loaded route is instant.")}

      <h2>How It Works</h2>
      <ol>
        <li>On first render, <code>lazy()</code> calls the import function.</li>
        <li>The browser fetches the chunk over the network.</li>
        <li>The module's default export is called to produce a Node.</li>
        <li>The Node replaces the fallback in the DOM.</li>
        <li>Subsequent renders use the cached module — no network request.</li>
      </ol>

      <h2>Module Format</h2>
      <p>The lazily-loaded module must have a default export returning a Node:</p>
      ${e(`// pages/Analytics.ts
import { html, createSignal } from 'onefold';

export default function Analytics(): Node {
  const period = createSignal('week');
  return html\`
    <div>
      <h2>Analytics</h2>
      <select onchange=\${(e: Event) => period.set((e.target as HTMLSelectElement).value)}>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
      <p>Showing: \${() => period()}</p>
    </div>
  \`;
}`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/performance/code-splitting">Code Splitting</a> — optimize bundle size with dynamic imports</li>
        <li><a href="/routing/router">Router</a> — route-level lazy loading integration</li>
      </ul>
    </div>
  `}function ot(){return r`
    <div>
      <h1>Error Boundaries</h1>
      <p><code>ErrorBoundary</code> catches errors thrown during rendering or in async operations. Instead of crashing the whole app, it shows a fallback UI.</p>

      <h2>Basic Usage</h2>
      ${e(`import { ErrorBoundary, html } from 'onefold';

function App(): Node {
  return html\`
    <div>
      \${ErrorBoundary(
        () => RiskyComponent(),
        (error) => html\`
          <div class="error-card">
            <h3>Something went wrong</h3>
            <p>\${error.message}</p>
            <button onclick=\${() => location.reload()}>Retry</button>
          </div>
        \`
      )}
    </div>
  \`;
}`)}

      <h2>With Suspense</h2>
      <p>Combine ErrorBoundary with Suspense for complete async handling:</p>
      ${e(`import { ErrorBoundary, Suspense, html } from 'onefold';

function App(): Node {
  return html\`
    <div>
      \${ErrorBoundary(
        () => Suspense(
          () => AsyncDataComponent(),
          () => html\`<p>Loading...</p>\`
        ),
        (error) => html\`<p class="error">Failed: \${error.message}</p>\`
      )}
    </div>
  \`;
}`)}

      ${a("ErrorBoundary catches both synchronous render errors and rejected promises from async components.")}

      <h2>Nested Boundaries</h2>
      ${e(`function App(): Node {
  return html\`
    <div>
      \${ErrorBoundary(
        () => html\`
          <div>
            <header>\${Header()}</header>
            \${ErrorBoundary(
              () => MainContent(),
              (err) => html\`<p>Content failed: \${err.message}</p>\`
            )}
            \${ErrorBoundary(
              () => Sidebar(),
              (err) => html\`<p>Sidebar unavailable</p>\`
            )}
          </div>
        \`,
        (err) => html\`<p>App crashed: \${err.message}</p>\`
      )}
    </div>
  \`;
}`)}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>ErrorBoundary</code></td><td>(content: () => Node, fallback: (error: Error) => Node)</td><td>Catch errors in content and render fallback.</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/async/suspense">Suspense</a> — show fallback UI while async content loads</li>
        <li><a href="/observability">Observability</a> — monitor and debug your application</li>
      </ul>
    </div>
  `}var no=`<!-- Save as: client.html (in same folder as server.mjs) -->
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>onefold WebSocket Chat</title></head>
<body>
<div id="app"></div>
<script type="module">
import { createSignal, createWebSocket, html, mount } from 'https://esm.sh/onefold@latest';

const chat = createWebSocket('ws://localhost:3000');

function App() {
  const input = createSignal('');
  const name = createSignal('User');

  const send = () => {
    const text = input().trim();
    if (!text) return;
    chat.send({ user: name(), text });
    input.set('');
  };

  return html\`
    <div style="max-width:500px;margin:20px auto;font-family:sans-serif">
      <h2>Chat (\${() => chat.status()})</h2>
      <div style="height:300px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-bottom:10px;border-radius:8px">
        \${() => chat.data().map(m => html\`
          <div style="margin-bottom:6px"><b>\${m.user}</b>: \${m.text}</div>
        \`)}
      </div>
      <div style="display:flex;gap:8px">
        <input value=\${() => name()} oninput=\${(e) => name.set(e.target.value)} placeholder="Name" style="width:80px;padding:6px" />
        <input value=\${() => input()} oninput=\${(e) => input.set(e.target.value)} onkeydown=\${(e) => { if(e.key==='Enter') send(); }} placeholder="Message..." style="flex:1;padding:6px" />
        <button onclick=\${send} style="padding:6px 12px">Send</button>
      </div>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));
<\/script>
</body></html>`;function rt(){return r`
    <div>
      <h1>WebSocket</h1>
      <p><code>createWebSocket</code> wraps the native WebSocket API in reactive signals with auto-reconnect, typed messages, and connection state tracking.</p>

      <h2>Client Usage</h2>
      ${e(`import { createWebSocket, html, mount } from 'onefold';

interface ChatMessage {
  user: string;
  text: string;
  ts: number;
}

const chat = createWebSocket<ChatMessage>('ws://localhost:3000/ws');

// Reactive signals \u2014 UI updates automatically when messages arrive
chat.data()      // Signal<ChatMessage[]> \u2014 all received messages
chat.latest()    // Signal<ChatMessage | null> \u2014 most recent message
chat.status()    // Signal<'connecting' | 'open' | 'closed' | 'error'>

// Send a message (serialized to JSON automatically)
chat.send({ user: 'Alice', text: 'Hello!' });

// Close / reconnect
chat.close();
chat.reconnect();`)}

      <h2>Chat App Example</h2>
      ${e(`import { createSignal, createWebSocket, html, mount } from 'onefold';

interface ChatMessage { user: string; text: string; ts: number; }

const chat = createWebSocket<ChatMessage>('ws://localhost:3000/ws');

function ChatApp() {
  const input = createSignal('');
  const username = createSignal('Anonymous');

  const send = () => {
    const text = input().trim();
    if (!text) return;
    chat.send({ user: username(), text, ts: Date.now() });
    input.set('');
  };

  return html\`
    <div>
      <h2>Chat (\${() => chat.status()})</h2>
      <div style="height:250px;overflow-y:auto;border:1px solid #e5e7eb;padding:8px;border-radius:8px;margin-bottom:12px">
        \${() => chat.data().map(msg => html\`
          <div style="margin-bottom:6px">
            <strong>\${msg.user}</strong>: \${msg.text}
            <small style="color:#999;margin-left:8px">\${new Date(msg.ts).toLocaleTimeString()}</small>
          </div>
        \`)}
      </div>
      <div style="display:flex;gap:8px">
        <input placeholder="Name" value=\${() => username()} oninput=\${(e) => username.set(e.target.value)} style="width:100px" />
        <input placeholder="Message..." value=\${() => input()} oninput=\${(e) => input.set(e.target.value)} onkeydown=\${(e) => { if (e.key === 'Enter') send(); }} style="flex:1" />
        <button onclick=\${send}>Send</button>
      </div>
    </div>
  \`;
}

mount(ChatApp(), document.getElementById('app')!);`)}

      <h2>Server (Node.js)</h2>
      <p>A simple WebSocket server using the <code>ws</code> package:</p>
      ${e(`// server.mjs
import { WebSocketServer } from 'ws';
import http from 'node:http';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send welcome
  ws.send(JSON.stringify({ user: 'System', text: 'Welcome!', ts: Date.now() }));

  // Broadcast incoming messages to all clients
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    msg.ts = Date.now();
    for (const client of clients) {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify(msg));
      }
    }
  });

  ws.on('close', () => clients.delete(ws));
});

server.listen(3000, () => console.log('WebSocket server on :3000'));`)}

      <h2>Authentication</h2>
      <p>WebSocket doesn't send custom headers during the initial handshake in browsers. Common auth patterns:</p>

      <h3>Option 1: Token in URL (simplest)</h3>
      ${e(`// Client \u2014 pass token in query string
const token = getAuthToken();
const chat = createWebSocket<Msg>(\`ws://localhost:3000/ws?token=\${token}\`);

// Server \u2014 validate on connection
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  if (!token || !verifyToken(token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  // Token valid \u2014 proceed
  const user = decodeToken(token);
  ws.userId = user.id;
});`)}

      ${a("Token in URL is visible in server logs and browser history. Use short-lived tokens (e.g., 30-second JWTs) that are exchanged for the WebSocket session.","warn")}

      <h3>Option 2: First-message auth (more secure)</h3>
      ${e(`// Client \u2014 send auth as first message after connection
const chat = createWebSocket<Msg>('ws://localhost:3000/ws');

// Wait for connection, then authenticate
createEffect(() => {
  if (chat.status() === 'open') {
    chat.send({ type: 'auth', token: getAuthToken() });
  }
});

// Server \u2014 require auth before accepting messages
wss.on('connection', (ws) => {
  let authenticated = false;

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());

    if (!authenticated) {
      if (msg.type === 'auth' && verifyToken(msg.token)) {
        authenticated = true;
        ws.send(JSON.stringify({ type: 'auth_ok' }));
      } else {
        ws.close(4001, 'Unauthorized');
      }
      return;
    }

    // Normal message handling (only after auth)
    broadcast(msg);
  });

  // Disconnect if not authenticated within 5 seconds
  setTimeout(() => {
    if (!authenticated) ws.close(4001, 'Auth timeout');
  }, 5000);
});`)}

      <h3>Option 3: Cookie-based (for same-origin)</h3>
      ${e(`// Client \u2014 no extra code needed (browser sends cookies automatically)
const chat = createWebSocket<Msg>('ws://localhost:3000/ws');

// Server \u2014 read cookie from upgrade request
wss.on('connection', (ws, req) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies['session_id'];

  if (!sessionId || !validateSession(sessionId)) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  const user = getSessionUser(sessionId);
  ws.userId = user.id;
});`)}

      <h2>Authorization (room-based)</h2>
      ${e(`// Server \u2014 check permissions per action
ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());

  switch (msg.type) {
    case 'join_room':
      if (!userCanAccessRoom(ws.userId, msg.roomId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Access denied' }));
        return;
      }
      rooms.get(msg.roomId)?.add(ws);
      break;

    case 'send_message':
      if (!userCanWrite(ws.userId, msg.roomId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Read-only access' }));
        return;
      }
      broadcastToRoom(msg.roomId, msg);
      break;
  }
});`)}

      <h2>Options</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
        <tr><td><code>maxMessages</code></td><td>number</td><td>100</td><td>Max messages kept in data() array</td></tr>
        <tr><td><code>autoReconnect</code></td><td>boolean</td><td>true</td><td>Auto-reconnect on disconnect</td></tr>
        <tr><td><code>reconnectDelay</code></td><td>number</td><td>3000</td><td>Delay before reconnecting (ms)</td></tr>
        <tr><td><code>maxRetries</code></td><td>number</td><td>5</td><td>Max reconnect attempts</td></tr>
        <tr><td><code>parse</code></td><td>function</td><td>JSON.parse</td><td>Custom message parser</td></tr>
      </table>

      <h2>Try It (Simulated WebSocket)</h2>
      <p>This playground simulates a WebSocket connection so you can see how the reactive signals update the UI. Run the server code above locally to connect for real.</p>

      ${u(`// Simulated WebSocket \u2014 demonstrates the reactive API pattern
// For a real app, use: createWebSocket('ws://localhost:3000/ws')

const messages = createSignal([]);
const status = createSignal('connecting');
const input = createSignal('');
const username = createSignal('You');

// Simulate connection after 500ms
setTimeout(() => {
  status.set('open');
  messages.set(prev => [...prev, { user: 'System', text: 'Connected!', ts: Date.now() }]);
}, 500);

// Simulate receiving messages every 3s
setInterval(() => {
  if (status() !== 'open') return;
  const bots = ['Alice', 'Bob', 'Charlie'];
  const texts = ['Hey there!', 'How is it going?', 'onefold is great!', 'Anyone here?'];
  messages.set(prev => [...prev, {
    user: bots[Math.floor(Math.random() * bots.length)],
    text: texts[Math.floor(Math.random() * texts.length)],
    ts: Date.now()
  }]);
}, 3000);

function sendMessage() {
  const text = input().trim();
  if (!text || status() !== 'open') return;
  messages.set(prev => [...prev, { user: username(), text, ts: Date.now() }]);
  input.set('');
  const el = document.getElementById('msg-input');
  if (el) el.value = '';
}

function App() {
  return html\`
    <div>
      <h3>Chat (\${() => status()})</h3>
      <div style="height:150px;overflow-y:auto;border:1px solid #e5e7eb;padding:8px;border-radius:6px;margin-bottom:8px;font-size:13px">
        \${() => messages().map(m => html\`
          <div style="margin-bottom:4px">
            <strong>\${m.user}</strong>: \${m.text}
            <small style="color:#999;margin-left:6px">\${new Date(m.ts).toLocaleTimeString()}</small>
          </div>
        \`)}
      </div>
      <div style="display:flex;gap:6px">
        <input id="msg-input" placeholder="Message..." oninput=\${(e) => input.set(e.target.value)} onkeydown=\${(e) => { if (e.key === 'Enter') sendMessage(); }} style="flex:1" />
        <button onclick=\${sendMessage}>Send</button>
      </div>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"WebSocket Chat (Simulated)")}

      <div class="callout">
        <p><strong>To connect to a real server:</strong> Replace the simulated signals above with <code>createWebSocket('ws://localhost:3000/ws')</code> and run the Node.js server code shown earlier. The reactive API (<code>.data()</code>, <code>.latest()</code>, <code>.status()</code>, <code>.send()</code>) works identically.</p>
      </div>

      <h2>Run Locally (Copy and Paste)</h2>
      <p>Save these two files, run the server, then open the client in a browser:</p>

      <h3>Step 1: server.mjs</h3>
      ${e(`// Save as: server.mjs
// Run: npm install ws && node server.mjs
import { WebSocketServer } from 'ws';
import http from 'node:http';
import { readFileSync } from 'node:fs';

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync('client.html'));
    return;
  }
  res.writeHead(404); res.end();
});

const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ user: 'System', text: 'Welcome! ' + clients.size + ' online', ts: Date.now() }));

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    msg.ts = Date.now();
    for (const c of clients) {
      if (c.readyState === 1) c.send(JSON.stringify(msg));
    }
  });

  ws.on('close', () => clients.delete(ws));
});

server.listen(3000, () => console.log('Chat server: http://localhost:3000'));`)}

      <h3>Step 2: client.html</h3>
      ${e(no)}

      <h3>Step 3: Run</h3>
      ${e(`npm install ws
node server.mjs
# Open http://localhost:3000 in multiple tabs to chat between them`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/streaming/sse">Server-Sent Events</a> — one-way server push (simpler, works through proxies)</li>
        <li><a href="/data/http-client">HTTP Client</a> — for request/response communication</li>
        <li><a href="/security/guards">RBAC Guards</a> — client-side route protection</li>
      </ul>
    </div>
  `}var io=`<!-- Save as: client.html (in same folder as server.mjs) -->
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>onefold SSE Notifications</title></head>
<body>
<div id="app"></div>
<script type="module">
import { createEventSource, html, mount } from 'https://esm.sh/onefold@latest';

const feed = createEventSource('/api/notifications');

function App() {
  return html\`
    <div style="max-width:500px;margin:20px auto;font-family:sans-serif">
      <h2>Live Notifications (\${() => feed.status()})</h2>
      <div style="padding:10px;background:#f0fdf4;border-radius:8px;margin-bottom:12px">
        Latest: <strong>\${() => feed.latest()?.message ?? 'Waiting...'}</strong>
      </div>
      <div style="max-height:400px;overflow-y:auto">
        \${() => feed.data().map(n => html\`
          <div style="padding:8px;margin-bottom:4px;border-left:3px solid #4338CA;background:#f8f9fb;border-radius:0 6px 6px 0">
            \${n.message}
            <small style="color:#999;margin-left:8px">\${new Date(n.timestamp).toLocaleTimeString()}</small>
          </div>
        \`)}
      </div>
      <button onclick=\${() => feed.close()} style="margin-top:12px;padding:6px 12px">Disconnect</button>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));
<\/script>
</body></html>`;function nt(){return r`
    <div>
      <h1>Server-Sent Events (SSE)</h1>
      <p><code>createEventSource</code> wraps the native EventSource API in reactive signals. One-way server push — the server sends events to the client over a persistent HTTP connection.</p>

      <h2>Client Usage</h2>
      ${e(`import { createEventSource, html, mount } from 'onefold';

interface Notification {
  id: string;
  message: string;
  type: string;
  timestamp: number;
}

const feed = createEventSource<Notification>('/api/notifications');

// Reactive signals \u2014 UI updates when events arrive
feed.data()      // Signal<Notification[]> \u2014 all received events
feed.latest()    // Signal<Notification | null> \u2014 most recent event
feed.status()    // Signal<'connecting' | 'open' | 'closed' | 'error'>

// Close the connection
feed.close();`)}

      <h2>Live Notifications Example</h2>
      ${e(`import { createEventSource, html, mount } from 'onefold';

interface Notification { id: string; message: string; type: string; timestamp: number; }

const notifications = createEventSource<Notification>('/api/notifications');

function NotificationPanel() {
  return html\`
    <div>
      <h2>Notifications (\${() => notifications.status()})</h2>
      <p>Latest: <strong>\${() => notifications.latest()?.message ?? 'Waiting...'}</strong></p>

      <ul style="list-style:none;padding:0">
        \${() => notifications.data().map(n => html\`
          <li style="padding:8px;margin-bottom:4px;border-left:3px solid #4338CA;background:#f8f9fb;border-radius:0 6px 6px 0">
            <strong>\${n.message}</strong><br/>
            <small style="color:#64748b">\${new Date(n.timestamp).toLocaleTimeString()}</small>
          </li>
        \`)}
      </ul>

      <button onclick=\${() => notifications.close()}>Disconnect</button>
    </div>
  \`;
}

mount(NotificationPanel(), document.getElementById('app')!);`)}

      <h2>Server (Express.js)</h2>
      <p>SSE is just a long-lived HTTP response with <code>Content-Type: text/event-stream</code>:</p>
      ${e(`// server.mjs
import express from 'express';

const app = express();
const clients = new Set();

// SSE endpoint
app.get('/api/notifications', (req, res) => {
  // Required headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send initial event
  res.write(\`data: \${JSON.stringify({ id: '0', message: 'Connected', type: 'system', timestamp: Date.now() })}\\n\\n\`);

  clients.add(res);

  // Cleanup on client disconnect
  req.on('close', () => {
    clients.delete(res);
  });
});

// Push an event to all connected clients
function broadcast(event) {
  const data = JSON.stringify(event);
  for (const client of clients) {
    client.write(\`data: \${data}\\n\\n\`);
  }
}

// Example: push events when something happens
app.post('/api/orders', express.json(), (req, res) => {
  // Process order...
  const order = { id: Date.now(), ...req.body };

  // Notify all connected clients
  broadcast({
    id: String(order.id),
    message: \`New order #\${order.id} received\`,
    type: 'order',
    timestamp: Date.now(),
  });

  res.json({ success: true, orderId: order.id });
});

app.listen(3000, () => console.log('SSE server on :3000'));`)}

      <h2>Server (Node.js — no Express)</h2>
      ${e(`// server.mjs \u2014 pure Node.js
import http from 'node:http';

const clients = new Set();

const server = http.createServer((req, res) => {
  if (req.url === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(\`data: \${JSON.stringify({ message: 'Connected' })}\\n\\n\`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Push events periodically
setInterval(() => {
  const event = { message: 'Server tick', timestamp: Date.now() };
  for (const client of clients) {
    client.write(\`data: \${JSON.stringify(event)}\\n\\n\`);
  }
}, 3000);

server.listen(3000);`)}

      <h2>SSE Wire Format</h2>
      <p>The protocol is simple text. Each message is <code>data:</code> followed by the payload, terminated by two newlines:</p>
      ${e(`// Single event
data: {"message":"Hello"}\\n\\n

// Event with ID (for reconnection)
id: 42\\n
data: {"message":"Hello"}\\n\\n

// Named event type
event: notification\\n
data: {"message":"New order"}\\n\\n

// Multi-line data
data: line 1\\n
data: line 2\\n\\n`)}

      ${a("The browser automatically reconnects SSE if the connection drops. If you send an id: field, the browser includes Last-Event-ID header on reconnect so the server can resume from where it left off.")}

      <h2>Authentication</h2>
      <p>Unlike WebSocket, SSE is a standard HTTP request — it sends cookies automatically and supports all HTTP auth mechanisms.</p>

      <h3>Option 1: Cookie-based (simplest)</h3>
      ${e(`// Client \u2014 cookies are sent automatically, no extra code
const feed = createEventSource<Notification>('/api/notifications');

// Server (Express) \u2014 check session cookie
app.get('/api/notifications', (req, res) => {
  const session = req.cookies.session_id;
  if (!session || !validateSession(session)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Authenticated \u2014 proceed with SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  clients.add(res);
  req.on('close', () => clients.delete(res));
});`)}

      <h3>Option 2: Token in URL</h3>
      ${e(`// Client \u2014 pass token in query parameter
const token = getAuthToken();
const feed = createEventSource<Notification>(\`/api/notifications?token=\${token}\`);

// Server \u2014 validate token from query string
app.get('/api/notifications', (req, res) => {
  const token = req.query.token;
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = decodeToken(token);

  res.writeHead(200, { 'Content-Type': 'text/event-stream', ... });

  // Only send events this user is authorized to see
  clients.set(res, { userId: user.id, roles: user.roles });
  req.on('close', () => clients.delete(res));
});`)}

      ${a("SSE does NOT support custom headers in the browser (the EventSource API has no headers option). Use cookies or URL tokens for authentication.")}

      <h3>Authorization (per-event filtering)</h3>
      ${e(`// Server \u2014 only send events the user is allowed to see
function broadcast(event, requiredRole) {
  for (const [client, meta] of clients) {
    // Skip clients without the required role
    if (requiredRole && !meta.roles.includes(requiredRole)) continue;
    client.write(\`data: \${JSON.stringify(event)}\\n\\n\`);
  }
}

// Only admins see this
broadcast({ message: 'Server restarting' }, 'admin');

// Everyone sees this
broadcast({ message: 'New product available' });`)}

      <h2>When to Use SSE vs WebSocket</h2>
      <table>
        <tr><th>Use SSE when...</th><th>Use WebSocket when...</th></tr>
        <tr><td>Server pushes data to client (one-way)</td><td>Client AND server exchange messages (two-way)</td></tr>
        <tr><td>Notifications, live feeds, dashboards</td><td>Chat, gaming, collaborative editing</td></tr>
        <tr><td>Works through CDNs and reverse proxies</td><td>May be blocked by some proxies</td></tr>
        <tr><td>Auto-reconnect built into browser</td><td>Need manual reconnect logic</td></tr>
        <tr><td>Standard HTTP (easy to debug, curl-friendly)</td><td>Separate protocol (harder to debug)</td></tr>
        <tr><td>Text only</td><td>Text and binary</td></tr>
      </table>

      <h2>Options</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
        <tr><td><code>maxEvents</code></td><td>number</td><td>100</td><td>Max events kept in data() array</td></tr>
        <tr><td><code>eventName</code></td><td>string</td><td>'message'</td><td>Event type to listen for</td></tr>
        <tr><td><code>parse</code></td><td>function</td><td>JSON.parse</td><td>Custom event data parser</td></tr>
      </table>

      <h2>Try It (Simulated SSE)</h2>
      <p>This playground simulates server-sent events so you can see how the reactive signals update the UI. Run the Express server above to connect for real.</p>

      ${u(`// Simulated SSE \u2014 demonstrates the reactive API pattern
// For a real app, use: createEventSource('/api/notifications')

const events = createSignal([]);
const latest = createSignal(null);
const status = createSignal('connecting');

// Simulate connection
setTimeout(() => {
  status.set('open');
  const welcome = { id: '0', message: 'Stream connected', type: 'system', timestamp: Date.now() };
  events.set([welcome]);
  latest.set(welcome);
}, 400);

// Simulate server pushing events every 2 seconds
const types = ['order', 'payment', 'shipping', 'review'];
const messages = [
  'New order #1042 received',
  'Payment of $49.99 processed',
  'Package shipped to NYC',
  'New 5-star review posted',
  'User signed up',
  'Subscription renewed',
  'Refund issued for #1038',
];

setInterval(() => {
  if (status() !== 'open') return;
  const event = {
    id: String(Date.now()),
    message: messages[Math.floor(Math.random() * messages.length)],
    type: types[Math.floor(Math.random() * types.length)],
    timestamp: Date.now(),
  };
  latest.set(event);
  events.set(prev => {
    const next = [...prev, event];
    return next.length > 20 ? next.slice(-20) : next;
  });
}, 2000);

function App() {
  return html\`
    <div>
      <h3>Live Notifications (\${() => status()})</h3>
      <div style="margin-bottom:8px;padding:8px;background:#f0fdf4;border-radius:6px;font-size:13px">
        Latest: <strong>\${() => latest()?.message ?? 'Waiting...'}</strong>
      </div>
      <div style="height:180px;overflow-y:auto;font-size:12px">
        \${() => events().map(n => html\`
          <div style="padding:6px 8px;margin-bottom:4px;border-left:3px solid \${n.type === 'order' ? '#4338CA' : n.type === 'payment' ? '#16a34a' : '#ca8a04'};background:#f8f9fb;border-radius:0 4px 4px 0">
            \${n.message}
            <small style="color:#64748b;margin-left:6px">\${new Date(n.timestamp).toLocaleTimeString()}</small>
          </div>
        \`)}
      </div>
      <button onclick=\${() => status.set('closed')} style="margin-top:8px">Disconnect</button>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"SSE Notifications (Simulated)")}

      <div class="callout">
        <p><strong>To connect to a real server:</strong> Replace the simulated signals with <code>createEventSource('/api/notifications')</code> and run the Express/Node.js server code above. The API (<code>.data()</code>, <code>.latest()</code>, <code>.status()</code>, <code>.close()</code>) is identical.</p>
      </div>

      <h2>Run Locally (Copy and Paste)</h2>
      <p>Save these two files, run the server, then open the client in a browser:</p>

      <h3>Step 1: server.mjs</h3>
      ${e(`// Save as: server.mjs
// Run: node server.mjs
import http from 'node:http';
import { readFileSync } from 'node:fs';

const clients = new Set();

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync('client.html'));
    return;
  }

  if (req.url === '/api/notifications') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(\`data: \${JSON.stringify({ id: '0', message: 'Connected!', type: 'system', timestamp: Date.now() })}\\n\\n\`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  res.writeHead(404); res.end();
});

// Push a random event every 2 seconds
const messages = ['New order received', 'Payment processed', 'User signed up', 'Review posted', 'Item shipped'];
setInterval(() => {
  const event = {
    id: String(Date.now()),
    message: messages[Math.floor(Math.random() * messages.length)],
    type: 'notification',
    timestamp: Date.now(),
  };
  for (const client of clients) {
    client.write(\`data: \${JSON.stringify(event)}\\n\\n\`);
  }
}, 2000);

server.listen(3000, () => console.log('SSE server: http://localhost:3000'));`)}

      <h3>Step 2: client.html</h3>
      ${e(io)}

      <h3>Step 3: Run</h3>
      ${e(`node server.mjs
# Open http://localhost:3000 \u2014 events appear every 2 seconds
# Open in multiple tabs \u2014 all receive the same events`)}

      <h2>Testing SSE with curl</h2>
      ${e(`# Connect and see events stream in real-time
curl -N http://localhost:3000/api/notifications

# With auth token
curl -N "http://localhost:3000/api/notifications?token=eyJhbG..."

# With cookie
curl -N -b "session_id=abc123" http://localhost:3000/api/notifications`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/streaming/websocket">WebSocket</a> — for bidirectional communication</li>
        <li><a href="/data/http-client">HTTP Client</a> — for request/response APIs</li>
        <li><a href="/data/interceptors">Interceptors</a> — add auth headers to HTTP requests</li>
      </ul>
    </div>
  `}function it(){return r`
    <div>
      <h1>Internationalization (i18n)</h1>
      <p><code>createI18n</code> provides reactive translations with interpolation. When the locale changes, all translated text in the UI updates automatically.</p>

      <h2>Setup</h2>
      ${e(`import { createI18n } from 'onefold';

const { t, setLocale, locale } = createI18n({
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, {{name}}!',
      items: '{{count}} items',
      nav: {
        home: 'Home',
        settings: 'Settings',
      },
    },
    es: {
      greeting: 'Hola, {{name}}!',
      items: '{{count}} elementos',
      nav: {
        home: 'Inicio',
        settings: 'Configuraci\xF3n',
      },
    },
  },
});`)}

      <h2>Using Translations</h2>
      ${e(`function Header(): Node {
  return html\`
    <header>
      <h1>\${() => t('greeting', { name: 'World' })}</h1>
      <nav>
        <a href="/">\${() => t('nav.home')}</a>
        <a href="/settings">\${() => t('nav.settings')}</a>
      </nav>
      <p>Current locale: \${() => locale()}</p>
    </header>
  \`;
}`)}

      <h2>Switching Locale</h2>
      ${e(`function LocaleSwitcher(): Node {
  return html\`
    <div>
      <button onclick=\${() => setLocale('en')}>English</button>
      <button onclick=\${() => setLocale('es')}>Espa\xF1ol</button>
      <button onclick=\${() => setLocale('fr')}>Fran\xE7ais</button>
    </div>
  \`;
}`)}

      ${a('Wrapping t() in an arrow function (e.g., () => t("key")) makes it reactive. The text updates when the locale signal changes.')}

      <h2>Interpolation</h2>
      <p>Use <code>{{placeholder}}</code> in translation strings:</p>
      ${e(`// Translation: 'Hello, {{name}}! You have {{count}} messages.'
t('welcome', { name: 'Alice', count: 5 })
// \u2192 "Hello, Alice! You have 5 messages."`)}

      <h2>Nested Keys</h2>
      <p>Access nested translation objects with dot notation:</p>
      ${e(`t('nav.home')      // \u2192 "Home"
t('nav.settings')  // \u2192 "Settings"`)}

      <h2>API</h2>
      <table>
        <tr><th>Export</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>t(key, params?)</code></td><td>(string, Record?) => string</td><td>Translate a key with optional interpolation.</td></tr>
        <tr><td><code>setLocale(locale)</code></td><td>(string) => void</td><td>Switch the active locale.</td></tr>
        <tr><td><code>locale()</code></td><td>Signal&lt;string&gt;</td><td>Current locale (reactive).</td></tr>
      </table>

      ${u(`function App() {
  const locale = createSignal('en');

  const translations = {
    en: { greeting: 'Hello, World!', welcome: 'Welcome to the app', button: 'Switch to Spanish' },
    es: { greeting: 'Hola, Mundo!', welcome: 'Bienvenido a la aplicacion', button: 'Cambiar a ingles' }
  };

  function t(key) {
    return translations[locale()][key] || key;
  }

  function toggleLocale() {
    locale.set(locale() === 'en' ? 'es' : 'en');
  }

  return html\`
    <div>
      <h3>\${() => t('greeting')}</h3>
      <p>\${() => t('welcome')}</p>
      <p style="font-size:12px;color:#666">Locale: <strong>\${() => locale()}</strong></p>
      <button onclick=\${toggleLocale}>\${() => t('button')}</button>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"i18n Language Switcher")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/theming">Theming</a> — reactive theme switching with CSS variables</li>
        <li><a href="/routing/router">Router</a> — client-side routing with nested routes</li>
      </ul>
    </div>
  `}function at(){return r`
    <div>
      <h1>Theming</h1>
      <p><code>createTheme</code> manages CSS custom properties reactively. Switch between light/dark (or any custom themes) and the UI updates instantly via CSS variables.</p>

      <h2>Setup</h2>
      ${e(`import { createTheme } from 'onefold';

const { theme, setTheme, toggle } = createTheme({
  light: {
    '--bg': '#ffffff',
    '--text': '#1a1a1a',
    '--primary': '#3b82f6',
    '--border': '#e5e7eb',
  },
  dark: {
    '--bg': '#0f172a',
    '--text': '#e2e8f0',
    '--primary': '#60a5fa',
    '--border': '#334155',
  },
}, 'light'); // default theme`)}

      <h2>Usage in Components</h2>
      ${e(`function ThemeSwitcher(): Node {
  return html\`
    <div>
      <p>Current: \${() => theme()}</p>
      <button onclick=\${toggle}>Toggle Theme</button>
      <button onclick=\${() => setTheme('light')}>Light</button>
      <button onclick=\${() => setTheme('dark')}>Dark</button>
    </div>
  \`;
}`)}

      <h2>CSS Custom Properties</h2>
      <p>Use the theme variables in your CSS — they update automatically when the theme changes:</p>
      ${e(`/* style.css */
body {
  background: var(--bg);
  color: var(--text);
}

button {
  background: var(--primary);
  border: 1px solid var(--border);
}

a {
  color: var(--primary);
}`)}

      ${a("createTheme sets CSS custom properties on document.documentElement. All elements that reference those variables update instantly.")}

      <h2>Persistence</h2>
      <p>The selected theme is automatically persisted to localStorage. On page reload, the user's preference is restored.</p>

      <h2>System Preference Detection</h2>
      ${e(`// Respect prefers-color-scheme on first visit
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const { theme, setTheme, toggle } = createTheme(themes, prefersDark ? 'dark' : 'light');`)}

      <h2>API</h2>
      <table>
        <tr><th>Export</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>theme()</code></td><td>Signal&lt;string&gt;</td><td>Current theme name (reactive).</td></tr>
        <tr><td><code>setTheme(name)</code></td><td>(string) => void</td><td>Switch to a named theme.</td></tr>
        <tr><td><code>toggle()</code></td><td>() => void</td><td>Toggle between themes (cycles if >2).</td></tr>
      </table>

      ${u(`function App() {
  const theme = createSignal('light');

  function toggle() {
    theme.set(theme() === 'light' ? 'dark' : 'light');
  }

  return html\`
    <div>
      <h3>Theme Toggle</h3>
      <p>Current theme: <strong>\${() => theme()}</strong></p>
      <button onclick=\${toggle}>Toggle Theme</button>
      <div style=\${() => 'margin-top:16px;padding:20px;border-radius:8px;transition:all 0.3s;' + (theme() === 'dark' ? 'background:#1e293b;color:#e2e8f0;border:1px solid #334155' : 'background:#ffffff;color:#1a1a2e;border:1px solid #e5e7eb')}>
        <h4 style="margin-bottom:8px">Card Component</h4>
        <p style="font-size:14px">This card responds to the current theme. Click the button to switch between light and dark.</p>
        <span style=\${() => 'display:inline-block;padding:4px 8px;border-radius:4px;font-size:12px;' + (theme() === 'dark' ? 'background:#334155;color:#94a3b8' : 'background:#f1f5f9;color:#64748b')}>\${() => theme()} mode</span>
      </div>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Light/Dark Theme Toggle")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/core/css">Scoped CSS</a> — component-scoped styles that avoid global collisions</li>
        <li><a href="/i18n">i18n</a> — internationalization with reactive translations</li>
      </ul>
    </div>
  `}function st(){return r`
    <div>
      <h1>Accessibility (a11y)</h1>
      <p>onefold provides built-in accessibility primitives: focus trapping, live announcements, keyboard shortcuts, and skip navigation.</p>

      <h2>FocusTrap</h2>
      <p>Trap keyboard focus within a container (modals, dialogs, drawers):</p>
      ${e(`import { FocusTrap, html } from 'onefold';

function Modal(content: Node): Node {
  return FocusTrap(html\`
    <div class="modal" role="dialog" aria-modal="true">
      <h2>Confirm Action</h2>
      \${content}
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  \`);
}`)}

      <h2>announce</h2>
      <p>Send messages to screen readers via a live region:</p>
      ${e(`import { announce } from 'onefold';

// Polite announcement (waits for current speech to finish)
announce('Item added to cart');

// Assertive announcement (interrupts current speech)
announce('Form has errors. Please fix highlighted fields.', 'assertive');`)}

      <h2>useKeyboard</h2>
      <p>Declarative keyboard shortcut handling:</p>
      ${e(`import { useKeyboard } from 'onefold';

useKeyboard({
  'Ctrl+K': () => openSearch(),
  'Escape': () => closeModal(),
  'Ctrl+S': (e) => { e.preventDefault(); save(); },
  'Alt+1': () => navigate('/'),
  'Alt+2': () => navigate('/settings'),
});`)}

      <h2>SkipLink</h2>
      <p>Skip navigation link for keyboard users:</p>
      ${e(`import { SkipLink, html } from 'onefold';

function App(): Node {
  return html\`
    <div>
      \${SkipLink('#main-content', 'Skip to main content')}
      <nav><!-- navigation --></nav>
      <main id="main-content">
        <!-- main content -->
      </main>
    </div>
  \`;
}`)}

      ${a("SkipLink is visually hidden until focused. It becomes visible when a keyboard user tabs to it.")}

      <h2>API Reference</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>FocusTrap</code></td><td>(content: Node)</td><td>Trap focus within the content node.</td></tr>
        <tr><td><code>announce</code></td><td>(message, priority?)</td><td>Announce to screen readers. Priority: 'polite' | 'assertive'.</td></tr>
        <tr><td><code>useKeyboard</code></td><td>(shortcuts: Record)</td><td>Register keyboard shortcuts.</td></tr>
        <tr><td><code>SkipLink</code></td><td>(target, label)</td><td>Render a skip navigation link.</td></tr>
      </table>

      ${u(`function App() {
  const isOpen = createSignal(false);
  const announcement = createSignal('');

  function openModal() {
    isOpen.set(true);
    announcement.set('Modal opened. Focus is trapped inside.');
  }

  function closeModal() {
    isOpen.set(false);
    announcement.set('Modal closed.');
  }

  return html\`
    <div>
      <h3>Accessibility: Focus Trap Demo</h3>
      <button onclick=\${openModal}>Open Modal</button>
      \${() => announcement() ? html\`<p role="status" aria-live="polite" style="font-size:12px;color:#3b82f6;margin-top:8px">\${announcement()}</p>\` : html\`<span></span>\`}
      \${() => isOpen() ? html\`
        <div style="margin-top:16px;padding:20px;border:2px solid #3b82f6;border-radius:8px;background:#eff6ff">
          <h4 style="margin-bottom:12px">Confirm Action</h4>
          <p style="font-size:14px;margin-bottom:12px">Are you sure you want to proceed?</p>
          <div style="display:flex;gap:8px">
            <button onclick=\${closeModal}>Cancel</button>
            <button onclick=\${closeModal} style="background:#3b82f6;color:white;border-color:#3b82f6">Confirm</button>
          </div>
          <p style="font-size:11px;color:#666;margin-top:12px">Focus is trapped within this dialog.</p>
        </div>
      \` : html\`<span></span>\`}
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Focus Trap & Announcements")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/transitions">Transitions</a> — animate elements entering and leaving the DOM</li>
        <li><a href="/core/templates">Templates</a> — the html tagged template literal</li>
      </ul>
    </div>
  `}function dt(){return r`
    <div>
      <h1>Transitions</h1>
      <p><code>Transition</code>, <code>animateEnter</code>, and <code>animateLeave</code> animate elements entering and leaving the DOM.</p>

      <h2>Inline Style Transitions</h2>
      <p>Define enter/leave styles directly — no CSS classes needed:</p>
      ${e(`import { Transition, createSignal, html } from 'onefold';

const view = createSignal('home');

Transition(() => currentView(), {
  duration: 300,
  enterFrom: { opacity: '0', transform: 'translateY(10px)' },
  enterTo:   { opacity: '1', transform: 'translateY(0)' },
  leaveTo:   { opacity: '0', transform: 'translateY(-10px)' },
});`)}

      <h2>CSS Class Transitions</h2>
      ${e(`// Use named CSS classes for enter/leave
Transition(() => currentView(), {
  name: 'fade',    // applies .fade-enter, .fade-enter-to, .fade-leave, .fade-leave-to
  duration: 300,
});

/* CSS:
.fade-enter       { opacity: 0; }
.fade-enter-active { transition: opacity 0.3s; }
.fade-leave-active { opacity: 0; transition: opacity 0.3s; }
*/`)}

      <h2>animateEnter / animateLeave</h2>
      <p>Lower-level utilities for custom animation logic on individual elements:</p>
      ${e(`import { animateEnter, animateLeave } from 'onefold';

// Animate an element entering
animateEnter(element, {
  name: 'slide',
  duration: 400,
});

// Animate an element leaving, then call done()
animateLeave(element, {
  name: 'slide',
  duration: 400,
}, () => element.remove());`)}

      ${a("Transition waits for the leave animation to finish before removing the element. No flicker, no layout jumps.")}

      <h2>Try It</h2>
      <p>Click the buttons to see fade and slide transitions:</p>

      ${u(`function App() {
  const visible = createSignal(true);
  const color = createSignal('#4338CA');

  const colors = ['#4338CA', '#16a34a', '#dc2626', '#ca8a04', '#0891b2'];
  let colorIdx = 0;

  function toggle() {
    visible.set(v => !v);
  }

  function changeColor() {
    colorIdx = (colorIdx + 1) % colors.length;
    color.set(colors[colorIdx]);
  }

  return html\`
    <div>
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button onclick=\${toggle}>\${() => visible() ? 'Hide' : 'Show'}</button>
        <button onclick=\${changeColor}>Change Color</button>
      </div>
      <div style="min-height:80px">
        \${() => visible() ? html\`
          <div style=\${{
            padding: '20px',
            background: color(),
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
          }}>
            Hello! I am visible.
          </div>
        \` : html\`<div style="color:#94a3b8;padding:20px;text-align:center">Hidden \u2014 click Show</div>\`}
      </div>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Toggle Visibility")}

      ${u(`function App() {
  const items = createSignal(['Apple', 'Banana', 'Cherry']);
  const input = createSignal('');

  function addItem() {
    const text = input().trim();
    if (!text) return;
    items.set(prev => [...prev, text]);
    input.set('');
    const el = document.getElementById('anim-input');
    if (el) el.value = '';
  }

  function removeItem(idx) {
    items.set(prev => prev.filter((_, i) => i !== idx));
  }

  return html\`
    <div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input id="anim-input" placeholder="Add fruit..."
          oninput=\${(e) => input.set(e.target.value)}
          onkeydown=\${(e) => { if (e.key === 'Enter') addItem(); }}
          style="flex:1;padding:6px 10px;border:1px solid #e5e7eb;border-radius:4px" />
        <button onclick=\${addItem}>Add</button>
      </div>
      <ul style="list-style:none;padding:0">
        \${() => items().map((item, i) => html\`
          <li style="padding:8px 12px;margin-bottom:4px;background:#f8f9fb;border-radius:6px;display:flex;justify-content:space-between;align-items:center;animation:slideIn 0.2s ease">
            \${item}
            <button onclick=\${() => removeItem(i)} style="color:#ef4444;border:none;background:none;cursor:pointer;font-size:16px">x</button>
          </li>
        \`)}
      </ul>
      <style>
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
      </style>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Animated List")}

      <h2>Options</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>name</code></td><td>string</td><td>CSS class prefix (.name-enter, .name-leave, etc.)</td></tr>
        <tr><td><code>duration</code></td><td>number</td><td>Animation duration in ms (default: 300)</td></tr>
        <tr><td><code>enterFrom</code></td><td>CSSStyleDeclaration</td><td>Inline styles at start of enter</td></tr>
        <tr><td><code>enterTo</code></td><td>CSSStyleDeclaration</td><td>Inline styles at end of enter</td></tr>
        <tr><td><code>leaveTo</code></td><td>CSSStyleDeclaration</td><td>Inline styles at end of leave</td></tr>
        <tr><td><code>mode</code></td><td>'default' | 'out-in'</td><td>'out-in' waits for leave before enter</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/core/templates">Templates</a> — conditional rendering patterns</li>
        <li><a href="/routing/router">Router</a> — page transitions between routes</li>
        <li><a href="/a11y">Accessibility</a> — motion preferences (prefers-reduced-motion)</li>
      </ul>
    </div>
  `}function lt(){return r`
    <div>
      <h1>Dependency Injection</h1>
      <p>onefold provides a lightweight DI system with <code>createToken</code>, <code>provide</code>, <code>inject</code>, and <code>runWithProviders</code> for testable, decoupled architecture.</p>

      <h2>createToken</h2>
      ${e(`import { createToken } from 'onefold';

// Define typed injection tokens
const HttpToken = createToken<HttpClient>('HttpClient');
const AuthToken = createToken<AuthService>('AuthService');
const LoggerToken = createToken<Logger>('Logger');`)}

      <h2>provide / inject</h2>
      ${e(`import { provide, inject } from 'onefold';

// Provide implementations
provide(HttpToken, new HttpClient({ baseUrl: '/api' }));
provide(AuthToken, new AuthService());

// Inject in any component
function UserList(): Node {
  const http = inject(HttpToken);
  const auth = inject(AuthToken);

  // Use the injected services
  return html\`<p>Logged in: \${auth.isAuthenticated()}</p>\`;
}`)}

      <h2>runWithProviders</h2>
      <p>Scope providers to a specific subtree (useful for testing or isolation):</p>
      ${e(`import { runWithProviders } from 'onefold';

// Production
runWithProviders([
  [HttpToken, new HttpClient({ baseUrl: '/api' })],
  [AuthToken, new AuthService()],
  [LoggerToken, new ConsoleLogger()],
], () => {
  mount(App(), document.getElementById('app')!);
});

// Testing \u2014 swap implementations
runWithProviders([
  [HttpToken, new MockHttpClient()],
  [AuthToken, new MockAuthService()],
  [LoggerToken, new NoopLogger()],
], () => {
  // App uses mocks \u2014 no network calls
  mount(App(), container);
});`)}

      ${a("DI makes your components testable without modifying their source. Swap the real HTTP client for a mock in tests.")}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>createToken</code></td><td>(name: string)</td><td>Create a typed injection token.</td></tr>
        <tr><td><code>provide</code></td><td>(token, value)</td><td>Register a value for a token.</td></tr>
        <tr><td><code>inject</code></td><td>(token)</td><td>Retrieve the value for a token.</td></tr>
        <tr><td><code>runWithProviders</code></td><td>(providers[], fn)</td><td>Run a function with scoped providers.</td></tr>
      </table>

      ${u(`function App() {
  // Simple DI container
  const container = {};

  function provide(key, value) {
    container[key] = value;
  }

  function inject(key) {
    return container[key];
  }

  // Provide a UserService
  provide('UserService', {
    name: 'Alice',
    role: 'Admin',
    getGreeting() { return 'Hello, ' + this.name + '!'; }
  });

  provide('Logger', {
    log(msg) { return '[LOG] ' + msg; }
  });

  // Inject and use
  const userService = inject('UserService');
  const logger = inject('Logger');

  const output = createSignal(userService.getGreeting());

  function refresh() {
    const svc = inject('UserService');
    const log = inject('Logger');
    output.set(log.log(svc.getGreeting() + ' Role: ' + svc.role));
  }

  return html\`
    <div>
      <h3>Dependency Injection</h3>
      <p>Injected UserService and Logger from container:</p>
      <div style="padding:12px;background:#f8fafc;border-radius:6px;border:1px solid #e5e7eb;margin:12px 0">
        <code>\${() => output()}</code>
      </div>
      <button onclick=\${refresh}>Call via Logger</button>
      <p style="font-size:12px;color:#666;margin-top:8px">Services are resolved from the DI container at runtime.</p>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Provide / Inject Demo")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/security/guards">RBAC Guards</a> — role-based access control for routes</li>
        <li><a href="/state/store">Store</a> — manage structured application state</li>
      </ul>
    </div>
  `}function ct(){return r`
    <div>
      <h1>Permission Guards</h1>
      <p>Control UI visibility and route access based on user permissions using <code>setPermissions</code>, <code>hasPermission</code>, <code>guard</code>, and <code>guardedNode</code>.</p>

      <h2>Setup Permissions</h2>
      ${e(`import { setPermissions } from 'onefold';

// Set after login \u2014 pass the user's permission list
setPermissions(['read:users', 'write:posts', 'admin:settings']);`)}

      <h2>Check Permissions</h2>
      ${e(`import { hasPermission } from 'onefold';

// Returns a reactive boolean signal
hasPermission('admin:settings')  // true
hasPermission('delete:users')    // false`)}

      <h2>guardedNode</h2>
      <p>Conditionally render UI based on permissions:</p>
      ${e(`import { guardedNode, html } from 'onefold';

function AdminPanel(): Node {
  return html\`
    <div>
      <h2>Admin Panel</h2>
      \${guardedNode('admin:settings', () => html\`
        <button>Delete All Users</button>
        <button>Reset Database</button>
      \`)}
      \${guardedNode('write:posts', () => html\`
        <button>Create Post</button>
      \`)}
    </div>
  \`;
}`)}

      <h2>Route Guards</h2>
      <p>Protect entire routes with the <code>guard</code> wrapper:</p>
      ${e(`import { Router, guard, navigate } from 'onefold';

const App = Router([
  { path: '/', view: () => Home() },
  { path: '/admin', view: guard('admin:settings', () => AdminPage(), () => {
    navigate('/unauthorized');
  })},
  { path: '/posts/new', view: guard('write:posts', () => CreatePost()) },
]);`)}

      ${a("Permissions are reactive. If you call setPermissions() with a new list (e.g., after role change), guarded nodes update automatically.")}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>setPermissions</code></td><td>(perms: string[])</td><td>Set the active permission list.</td></tr>
        <tr><td><code>hasPermission</code></td><td>(perm: string)</td><td>Check if permission exists (reactive).</td></tr>
        <tr><td><code>guard</code></td><td>(perm, view, onDeny?)</td><td>Protect a route view function.</td></tr>
        <tr><td><code>guardedNode</code></td><td>(perm, content)</td><td>Conditionally render based on permission.</td></tr>
      </table>
    </div>
  `}function pt(){return r`
    <div>
      <h1>XSS Prevention</h1>
      <p>onefold is secure by default. Text interpolation uses <code>textContent</code>, making XSS structurally impossible in the default path.</p>

      <h2>How onefold Prevents XSS</h2>
      <ul>
        <li><strong>textContent by default</strong> — string interpolations in templates set <code>textContent</code>, not <code>innerHTML</code>. HTML in user data renders as text.</li>
        <li><strong>No eval()</strong> — no dynamic code execution anywhere in the framework.</li>
        <li><strong>No innerHTML</strong> — the template engine constructs real DOM nodes, never parses HTML strings.</li>
        <li><strong>CSP compatible</strong> — works with strict Content-Security-Policy headers out of the box.</li>
      </ul>

      ${e(`import { html } from 'onefold';

const userInput = '<script>alert("xss")<\/script>';

// SAFE \u2014 renders as text, not HTML
html\`<p>\${userInput}</p>\`;
// Result: <p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>`)}

      ${a("Unlike frameworks that use innerHTML or dangerouslySetInnerHTML, onefold never interprets strings as HTML. This eliminates the most common XSS vector.","info")}

      <h2>Sanitization for Raw HTML</h2>
      <p>If you must render trusted HTML (e.g., from a CMS), sanitize it first:</p>
      ${e(`import { html } from 'onefold';

// Use DOMPurify or similar library
import DOMPurify from 'dompurify';

function RichContent(rawHtml: string): Node {
  const clean = DOMPurify.sanitize(rawHtml);
  const container = document.createElement('div');
  container.innerHTML = clean;
  return container;
}`)}

      <h2>Trusted Types</h2>
      <p>onefold is compatible with the Trusted Types API for defense in depth:</p>
      ${e(`// CSP header
Content-Security-Policy: require-trusted-types-for 'script'

// onefold never triggers Trusted Types violations because
// it never assigns to innerHTML, outerHTML, or similar sinks.`)}
  `}function ut(){return r`
    <div>
      <h1>Virtual List</h1>
      <p><code>VirtualList</code> renders only visible items in a scrollable list. Handles thousands of items without DOM overhead.</p>

      <h2>Basic Usage</h2>
      ${e(`import { VirtualList, html, createSignal } from 'onefold';

function UserList(): Node {
  const users = createSignal(Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: \`User \${i}\`,
  })));

  return VirtualList({
    items: users,
    itemHeight: 48,
    containerHeight: 400,
    renderItem: (user) => html\`
      <div class="user-row" style="height:48px;display:flex;align-items:center">
        <span>\${user.name}</span>
      </div>
    \`,
  });
}`)}

      <h2>Options</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>items</code></td><td>Signal&lt;T[]&gt;</td><td>Yes</td><td>Reactive list of all items.</td></tr>
        <tr><td><code>itemHeight</code></td><td>number</td><td>Yes</td><td>Fixed height of each item in pixels.</td></tr>
        <tr><td><code>containerHeight</code></td><td>number</td><td>Yes</td><td>Height of the scrollable viewport.</td></tr>
        <tr><td><code>renderItem</code></td><td>(item: T, index: number) => Node</td><td>Yes</td><td>Render function for each item.</td></tr>
        <tr><td><code>overscan</code></td><td>number</td><td>No</td><td>Extra items rendered above/below viewport (default: 5).</td></tr>
      </table>

      ${a("VirtualList uses a fixed item height for O(1) scroll position calculations. Variable-height items are not supported.")}

      <h2>How It Works</h2>
      <ol>
        <li>Only items visible in the viewport (plus overscan) are rendered as DOM nodes.</li>
        <li>A spacer element maintains the correct scroll height.</li>
        <li>On scroll, items are recycled — removed from one end, added to the other.</li>
        <li>With 10,000 items and 400px viewport, only ~15 DOM nodes exist at any time.</li>
      </ol>

      <h2>With Filtering</h2>
      ${e(`const allUsers = createSignal(generateUsers(10000));
const filter = createSignal('');

const filtered = createComputed(() =>
  allUsers().filter(u => u.name.toLowerCase().includes(filter().toLowerCase()))
);

function FilterableList(): Node {
  return html\`
    <div>
      <input value=\${() => filter()} oninput=\${(e: Event) => filter.set((e.target as HTMLInputElement).value)} placeholder="Search..." />
      \${VirtualList({
        items: filtered,
        itemHeight: 48,
        containerHeight: 400,
        renderItem: (user) => html\`<div class="row">\${user.name}</div>\`,
      })}
    </div>
  \`;
}`)}
    </div>
  `}function ht(){return r`
    <div>
      <h1>Code Splitting</h1>
      <p>Use <code>lazy()</code> with the Router for automatic route-based code splitting. Each page is loaded only when the user navigates to it.</p>

      <h2>Route-Based Splitting</h2>
      ${e(`import { Router, lazy, Suspense, html, mount } from 'onefold';

// Each import() creates a separate chunk at build time
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App(): Node {
  return html\`
    <div>
      \${Suspense(
        () => Router([
          { path: '/', view: () => Home() },
          { path: '/dashboard', view: () => Dashboard() },
          { path: '/settings', view: () => Settings() },
          { path: '/analytics', view: () => Analytics() },
        ]),
        () => html\`<div class="loading">Loading...</div>\`
      )}
    </div>
  \`;
}

mount(App(), document.getElementById('app')!);`)}

      <h2>Build Configuration</h2>
      <p>Most bundlers (esbuild, Vite, webpack) split dynamic imports into separate chunks automatically:</p>
      ${e(`// esbuild
import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  splitting: true,    // enables code splitting
  format: 'esm',     // required for splitting
  outdir: 'dist',
});`)}

      ${a("Code splitting only works with ESM output format. Make sure your build tool outputs ES modules.")}

      <h2>Chunk Naming</h2>
      ${e(`// Output:
// dist/main.js         \u2014 entry point + router
// dist/chunk-Home.js   \u2014 Home page
// dist/chunk-Dashboard.js \u2014 Dashboard page
// dist/chunk-Settings.js  \u2014 Settings page`)}

      <h2>Preloading</h2>
      <p>Preload likely-needed chunks on hover or idle:</p>
      ${e(`// Preload on link hover
function NavLink(href: string, label: string, loader: () => Promise<any>): Node {
  return html\`
    <a
      href=\${href}
      onmouseenter=\${() => loader()}
      onclick=\${(e: Event) => { e.preventDefault(); navigate(href); }}
    >\${label}</a>
  \`;
}

// Usage
NavLink('/dashboard', 'Dashboard', () => import('./pages/Dashboard'));`)}

      <h2>Bundle Analysis</h2>
      <p>Add <code>metafile: true</code> to esbuild to analyze chunk sizes:</p>
      ${e(`const result = await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir: 'dist',
  metafile: true,
});

// Write analysis
const text = await esbuild.analyzeMetafile(result.metafile);
console.log(text);`)}
    </div>
  `}function mt(){return r`
    <div>
      <h1>wrapImperative</h1>
      <p><code>wrapImperative</code> bridges imperative libraries (Chart.js, D3, Three.js) with onefold's reactive system. It manages lifecycle and re-renders when signals change.</p>

      <h2>Chart.js Example</h2>
      ${e(`import { wrapImperative, createSignal, html } from 'onefold';
import Chart from 'chart.js/auto';

function ReactiveChart(): Node {
  const data = createSignal([12, 19, 3, 5, 2, 3]);

  const chart = wrapImperative({
    create: (container) => {
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      return new Chart(canvas, {
        type: 'bar',
        data: { labels: ['A', 'B', 'C', 'D', 'E', 'F'], datasets: [{ data: data() }] },
      });
    },
    update: (instance) => {
      instance.data.datasets[0].data = data();
      instance.update();
    },
    destroy: (instance) => {
      instance.destroy();
    },
    deps: [data],
  });

  return html\`
    <div>
      \${chart}
      <button onclick=\${() => data.set(d => d.map(() => Math.random() * 20))}>
        Randomize
      </button>
    </div>
  \`;
}`)}

      <h2>D3 Example</h2>
      ${e(`import { wrapImperative, createSignal } from 'onefold';
import * as d3 from 'd3';

function D3Visualization(): Node {
  const radius = createSignal(50);

  return wrapImperative({
    create: (container) => {
      const svg = d3.select(container).append('svg')
        .attr('width', 200).attr('height', 200);
      svg.append('circle')
        .attr('cx', 100).attr('cy', 100)
        .attr('r', radius())
        .attr('fill', 'steelblue');
      return svg;
    },
    update: (svg) => {
      svg.select('circle').attr('r', radius());
    },
    destroy: (svg) => {
      svg.remove();
    },
    deps: [radius],
  });
}`)}

      ${a("wrapImperative calls update() whenever any signal in deps changes. The imperative library stays in sync with reactive state.")}

      <h2>Options</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>create</code></td><td>(container: HTMLElement) => T</td><td>Initialize the imperative library. Return the instance.</td></tr>
        <tr><td><code>update</code></td><td>(instance: T) => void</td><td>Called when deps change. Update the instance.</td></tr>
        <tr><td><code>destroy</code></td><td>(instance: T) => void</td><td>Cleanup when the node is removed from DOM.</td></tr>
        <tr><td><code>deps</code></td><td>Signal[]</td><td>Signals to watch for changes.</td></tr>
      </table>
    </div>
  `}function ft(){return r`
    <div>
      <h1>embedForeign</h1>
      <p><code>embedForeign</code> mounts React, Vue, Svelte, or any framework component inside an onefold application. You control the mount/unmount lifecycle.</p>

      <h2>React Integration</h2>
      ${e(`import { embedForeign } from 'onefold';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { DatePicker } from './react-components/DatePicker';

function App(): Node {
  const datePicker = embedForeign({
    mount: (container, props) => {
      const root = createRoot(container);
      root.render(React.createElement(DatePicker, props));
      return { root };
    },
    unmount: (container, { root }) => {
      root.unmount();
    },
    props: {
      onChange: (date: Date) => console.log('Selected:', date),
      minDate: new Date(),
    },
  });

  return html\`
    <div>
      <h2>Pick a date</h2>
      \${datePicker}
    </div>
  \`;
}`)}

      <h2>Vue Integration</h2>
      ${e(`import { embedForeign } from 'onefold';
import { createApp } from 'vue';
import ChartComponent from './vue-components/Chart.vue';

const vueChart = embedForeign({
  mount: (container, props) => {
    const app = createApp(ChartComponent, props);
    app.mount(container);
    return { app };
  },
  unmount: (container, { app }) => {
    app.unmount();
  },
  props: { data: [1, 2, 3, 4, 5] },
});`)}

      ${a("embedForeign creates a container div and passes it to your mount function. You own the lifecycle \u2014 mount however the foreign framework requires.")}

      <h2>Svelte Integration</h2>
      ${e(`import { embedForeign } from 'onefold';
import Counter from './svelte-components/Counter.svelte';

const svelteCounter = embedForeign({
  mount: (container, props) => {
    const component = new Counter({ target: container, props });
    return { component };
  },
  unmount: (container, { component }) => {
    component.$destroy();
  },
  props: { initial: 0 },
});`)}

      <h2>API</h2>
      <table>
        <tr><th>Option</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>mount</code></td><td>(container: HTMLElement, props: P) => C</td><td>Mount the foreign component. Return a context for cleanup.</td></tr>
        <tr><td><code>unmount</code></td><td>(container: HTMLElement, context: C) => void</td><td>Cleanup when the node leaves the DOM.</td></tr>
        <tr><td><code>props</code></td><td>P</td><td>Props passed to the mount function.</td></tr>
      </table>
    </div>
  `}function gt(){return r`
    <div>
      <h1>Plugins</h1>
      <p><code>createPluginHost</code> enables an extensible plugin architecture with sandboxed permissions and lifecycle hooks.</p>

      <h2>Creating a Plugin Host</h2>
      ${e(`import { createPluginHost } from 'onefold';

const plugins = createPluginHost({
  permissions: ['read:state', 'write:state', 'ui:render'],
});`)}

      <h2>Registering Plugins</h2>
      ${e(`plugins.register({
  name: 'analytics-plugin',
  version: '1.0.0',
  permissions: ['read:state'],
  hooks: {
    onInit: (ctx) => {
      console.log('Analytics plugin initialized');
    },
    onRouteChange: (ctx, route) => {
      trackPageView(route.path);
    },
    onStateChange: (ctx, state) => {
      trackEvent('state-change', state);
    },
  },
});

plugins.register({
  name: 'theme-plugin',
  version: '1.0.0',
  permissions: ['read:state', 'ui:render'],
  hooks: {
    onInit: (ctx) => {
      ctx.provide('theme-toggle', () => toggleTheme());
    },
  },
});`)}

      <h2>Permissions</h2>
      <p>Plugins can only access APIs they've been granted permission for:</p>
      <table>
        <tr><th>Permission</th><th>Description</th></tr>
        <tr><td><code>read:state</code></td><td>Read application state.</td></tr>
        <tr><td><code>write:state</code></td><td>Modify application state.</td></tr>
        <tr><td><code>ui:render</code></td><td>Render UI elements into slots.</td></tr>
        <tr><td><code>network</code></td><td>Make HTTP requests.</td></tr>
        <tr><td><code>storage</code></td><td>Access localStorage/sessionStorage.</td></tr>
      </table>

      ${a("A plugin that requests a permission not in the host's allowed list is rejected at registration time.")}

      <h2>Lifecycle Hooks</h2>
      <table>
        <tr><th>Hook</th><th>When</th></tr>
        <tr><td><code>onInit</code></td><td>Plugin is registered and ready.</td></tr>
        <tr><td><code>onDestroy</code></td><td>Plugin is unregistered.</td></tr>
        <tr><td><code>onRouteChange</code></td><td>Navigation occurs.</td></tr>
        <tr><td><code>onStateChange</code></td><td>Application state updates.</td></tr>
        <tr><td><code>onError</code></td><td>Unhandled error in the app.</td></tr>
      </table>

      <h2>Plugin Context</h2>
      ${e(`// The ctx object provides scoped access:
ctx.provide(key, value)  // expose a value to other plugins
ctx.consume(key)         // read a value from another plugin
ctx.getState()           // read state (if permitted)
ctx.setState(partial)    // update state (if permitted)`)}
    </div>
  `}function vt(){return r`
    <div>
      <h1>Observability</h1>
      <p><code>createObserver</code> provides structured logging, metrics collection, and performance tracking for production applications.</p>

      <h2>Setup</h2>
      ${e(`import { createObserver } from 'onefold';

const observer = createObserver({
  onLog: (level, message, data) => {
    // Send to your logging service
    console.log(\`[\${level}] \${message}\`, data);
  },
  onMetric: (name, value, tags) => {
    // Send to metrics backend (Datadog, Prometheus, etc.)
    analytics.track(name, { value, ...tags });
  },
  onError: (error, context) => {
    // Send to error tracking (Sentry, Bugsnag, etc.)
    errorTracker.captureException(error, { extra: context });
  },
});`)}

      <h2>Logging</h2>
      ${e(`observer.log('info', 'User logged in', { userId: '123' });
observer.log('warn', 'API response slow', { duration: 2500 });
observer.log('error', 'Payment failed', { code: 'CARD_DECLINED' });`)}

      <h2>Metrics</h2>
      ${e(`// Track custom metrics
observer.metric('page-load', 1.2, { route: '/dashboard' });
observer.metric('api-latency', 340, { endpoint: '/users' });
observer.metric('bundle-size', 48000, { chunk: 'main' });`)}

      <h2>Performance Tracking</h2>
      ${e(`// Time an operation
const end = observer.startTimer('fetch-users');
const users = await http.get('/users');
end(); // automatically records duration as a metric`)}

      ${a("createObserver is a thin abstraction. It does not bundle any specific logging/metrics library \u2014 you wire it to your own backend.")}

      <h2>Integration Example</h2>
      ${e(`// Sentry + Datadog integration
const observer = createObserver({
  onLog: (level, msg, data) => {
    if (level === 'error') Sentry.captureMessage(msg, { extra: data });
  },
  onMetric: (name, value, tags) => {
    datadogRum.addTiming(name, value);
  },
  onError: (error, ctx) => {
    Sentry.captureException(error, { contexts: { app: ctx } });
  },
});`)}

      <h2>API</h2>
      <table>
        <tr><th>Method</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>.log</code></td><td>(level, message, data?)</td><td>Structured log entry.</td></tr>
        <tr><td><code>.metric</code></td><td>(name, value, tags?)</td><td>Record a metric.</td></tr>
        <tr><td><code>.startTimer</code></td><td>(name)</td><td>Start timing, returns end() function.</td></tr>
      </table>
    </div>
  `}function bt(){return r`
    <div>
      <h1>Component Metadata</h1>
      <p><code>component()</code> registers components with metadata for dev tools, documentation generation, and design system catalogs.</p>

      <h2>Registering Components</h2>
      ${e(`import { component, html } from 'onefold';

const Button = component({
  name: 'Button',
  description: 'Primary action button',
  props: {
    label: { type: 'string', required: true },
    variant: { type: 'string', default: 'primary' },
    disabled: { type: 'boolean', default: false },
  },
  render: (props) => html\`
    <button class=\${\`btn btn-\${props.variant}\`} disabled=\${props.disabled}>
      \${props.label}
    </button>
  \`,
});`)}

      <h2>getComponentRegistry</h2>
      <p>Retrieve all registered components (useful for dev tools and design systems):</p>
      ${e(`import { getComponentRegistry } from 'onefold';

const registry = getComponentRegistry();
// Map<string, ComponentMeta>

for (const [name, meta] of registry) {
  console.log(name, meta.description, meta.props);
}`)}

      <h2>exportManifest</h2>
      <p>Export a JSON manifest of all components for documentation tools:</p>
      ${e(`import { exportManifest } from 'onefold';

const manifest = exportManifest();
// {
//   components: [
//     { name: 'Button', description: '...', props: [...] },
//     { name: 'Card', description: '...', props: [...] },
//   ]
// }

// Write to file in a build script
fs.writeFileSync('component-manifest.json', JSON.stringify(manifest, null, 2));`)}

      ${a("Component metadata is optional \u2014 it does not affect runtime behavior. Use it for tooling, documentation, and design system governance.")}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>component</code></td><td>(meta: ComponentMeta)</td><td>Register a component with metadata and render function.</td></tr>
        <tr><td><code>getComponentRegistry</code></td><td>()</td><td>Get all registered components.</td></tr>
        <tr><td><code>exportManifest</code></td><td>()</td><td>Export JSON manifest of all components.</td></tr>
      </table>
    </div>
  `}var ao=`// server.ts \u2014 Express SSR with onefold
import express from 'express';
import { renderHTML, html } from 'onefold';

const app = express();
app.use('/public', express.static('dist/public'));

// Static page \u2014 pure server render, no client JS needed
app.get('/', (req, res) => {
  const body = renderHTML(() => html\`
    <div>
      <h1>Welcome</h1>
      <p>This content is fully server-rendered.</p>
    </div>
  \`);
  res.send(shell('Home', body));
});

// Async page \u2014 fetch data on server, render to HTML
app.get('/users', async (req, res) => {
  const body = await renderHTML(async () => {
    const users = await db.getUsers();
    return html\`
      <ul>
        \${users.map(u => html\`<li>\${u.name} \u2014 \${u.role}</li>\`)}
      </ul>
    \`;
  });
  res.send(shell('Users', body));
});

// Interactive page \u2014 server renders shell, client mounts live component
app.get('/counter', (req, res) => {
  const body = renderHTML(() => html\`
    <div>
      <h1>Counter</h1>
      <div id="interactive">Loading...</div>
    </div>
  \`);
  res.send(shell('Counter', body));
});

function shell(title, body) {
  return \`<!DOCTYPE html>
<html>
<head><title>\${title}</title></head>
<body>
  <div id="app">\${body}</div>
  <script type="module" src="/public/app.js"><\/script>
</body>
</html>\`;
}

app.listen(3000);`,so=`// client.ts \u2014 selective hydration
import { mount, createSignal, html } from 'onefold';

const path = window.location.pathname;
const root = document.getElementById('interactive');

// Only mount on pages that need interactivity
if (path === '/counter' && root) {
  const count = createSignal(0);
  mount(html\`
    <div>
      <h2>\${() => count()}</h2>
      <button onclick=\${() => count.set(n => n + 1)}>+</button>
    </div>
  \`, root);
}

// Static pages (/, /users): no JS runs. Server HTML stays as-is.`,lo=`// build.mjs
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('dist/public', { recursive: true });

// Server bundle (Node.js)
await build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: 'dist/server.mjs',
  packages: 'external',
});

// Client bundle (browser)
await build({
  entryPoints: ['src/client.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/public/app.js',
  minify: true,
});

console.log('dist/server.mjs  \u2014 run with: node dist/server.mjs');
console.log('dist/public/app.js \u2014 loaded by browser');`,co=`src/
  shared/              Shared between server + client (zero duplication)
    components/Nav.ts  Navigation bar
    layouts/Page.ts    Page wrapper
    types.ts           Interfaces
  pages/               Page components (rendered by server)
    HomePage.ts        Static \u2014 no client JS
    UsersPage.ts       Static + async data fetch
    CounterPage.ts     Interactive \u2014 client mounts into #interactive
  server/              Server-only code
    index.ts           Express app
    routes.ts          Route definitions
    data.ts            Database / API calls
  client/              Client-only code
    index.ts           Selective hydration
dist/                  Build output (deployable)
  server.mjs           Node.js server
  public/app.js        Client bundle`;function yt(){return r`
    <div>
      <h1>Server-Side Rendering</h1>
      <p><code>renderHTML</code> converts onefold components to HTML strings on the server. Zero dependencies. No jsdom. Fully tree-shakable.</p>

      <h2>How It Works</h2>
      ${e(`import { renderHTML, html } from 'onefold';

// Sync render
const result = renderHTML(() => html\`<h1>Hello</h1>\`);
// \u2192 '<h1>Hello</h1>'

// Async render (with data fetching)
const result = await renderHTML(async () => {
  const data = await fetch('/api/users').then(r => r.json());
  return html\`<ul>\${data.map(u => html\`<li>\${u.name}</li>\`)}</ul>\`;
});`)}

      <p>Uses the same tokenizer as client-side <code>html</code>. Reactive expressions evaluate once. Event handlers are stripped. Same XSS escaping applies.</p>

      ${a("renderHTML is tree-shakable. If your client bundle never imports it, it adds 0 bytes. Only server code pays for it.")}

      <h2>Properties</h2>
      <table>
        <tr><th>Property</th><th>Value</th></tr>
        <tr><td>Dependencies</td><td>Zero (no jsdom, no DOM polyfill)</td></tr>
        <tr><td>Performance</td><td>~0.5ms per page</td></tr>
        <tr><td>Tree-shakable</td><td>0 bytes in client bundle if not imported</td></tr>
        <tr><td>Async support</td><td>Yes — accepts async component functions</td></tr>
        <tr><td>Security</td><td>Same escaping: HTML entities, URL scheme blocking, event stripping</td></tr>
        <tr><td>Per-page opt-in</td><td>SSR whichever routes you want, skip the rest</td></tr>
      </table>

      <h2>The Pattern</h2>
      <p>onefold SSR uses <strong>selective hydration</strong>:</p>
      <ul>
        <li><strong>Static pages</strong> — server renders full HTML. Client does nothing. Zero JS overhead.</li>
        <li><strong>Interactive pages</strong> — server renders a shell (nav, title, placeholder). Client mounts a live component into the placeholder.</li>
      </ul>

      <table>
        <tr><th>Route</th><th>Server</th><th>Client</th></tr>
        <tr><td><code>/</code></td><td>Renders full content</td><td>No JS runs</td></tr>
        <tr><td><code>/users</code></td><td>Fetches data, renders HTML</td><td>No JS runs</td></tr>
        <tr><td><code>/counter</code></td><td>Renders shell with <code>#interactive</code></td><td>Mounts live counter</td></tr>
      </table>

      <h2>Server Example</h2>
      ${e(ao)}

      <h2>Client Example</h2>
      ${e(so)}

      <h2>Build Script</h2>
      <p>Use esbuild to produce both server and client bundles:</p>
      ${e(lo)}

      <h2>Project Structure</h2>
      <p>Recommended layout for scalable SSR apps with zero code duplication:</p>
      ${e(co)}

      <h2>What Gets Stripped in SSR Output</h2>
      <table>
        <tr><th>Feature</th><th>In HTML output?</th><th>Why</th></tr>
        <tr><td>Text content</td><td>Yes (escaped)</td><td>Content is the point of SSR</td></tr>
        <tr><td>Attributes (class, style, href)</td><td>Yes (escaped)</td><td>Styling + structure</td></tr>
        <tr><td>Event handlers (onclick)</td><td>Stripped</td><td>Can't execute in static HTML</td></tr>
        <tr><td>ref callbacks</td><td>Stripped</td><td>No DOM node on server</td></tr>
        <tr><td>Reactive expressions</td><td>Evaluated once</td><td>Snapshot of current signal value</td></tr>
        <tr><td>Unsafe URLs (javascript:)</td><td>Blocked</td><td>Same security as client</td></tr>
      </table>

      <h2>Deploy</h2>
      ${e(`# Build
npm run build

# Run
node dist/server.mjs

# Or with PORT env
PORT=8080 node dist/server.mjs`)}

      <p>The <code>dist/</code> folder is self-contained — deploy to any Node.js host (Railway, Render, Fly.io, VPS).</p>

      <h2>When to Use SSR</h2>
      <table>
        <tr><th>Use SSR</th><th>Skip SSR (client-only SPA)</th></tr>
        <tr><td>Landing pages, marketing sites</td><td>Dashboards, admin panels</td></tr>
        <tr><td>Blog posts, documentation</td><td>Behind-login features</td></tr>
        <tr><td>E-commerce product pages</td><td>Real-time collaborative apps</td></tr>
        <tr><td>Social media link previews needed</td><td>Heavy client-side interaction</td></tr>
        <tr><td>SEO matters</td><td>Content is user-specific anyway</td></tr>
      </table>

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Signature</th><th>Description</th></tr>
        <tr><td><code>renderHTML</code></td><td><code>(() =&gt; unknown) =&gt; string</code></td><td>Sync render — returns HTML string immediately</td></tr>
        <tr><td><code>renderHTML</code></td><td><code>(() =&gt; Promise) =&gt; Promise&lt;string&gt;</code></td><td>Async render — waits for data, then returns HTML string</td></tr>
      </table>

      <h2>Run the Example</h2>
      ${e(`# Full working SSR app is in examples/ssr-app/
cd examples/ssr-app
npm install
npm run build
npm start
# \u2192 http://localhost:3000

# Routes:
#   /          Static (SSR only)
#   /about     Static (SSR only)
#   /users     Static + async data fetch
#   /counter   Interactive (client mounts)
#   /todo      Interactive (client mounts)
#   /search    Interactive (client mounts)`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/core/templates">Templates</a> — same components work on server and client</li>
        <li><a href="/data/resource">Resource</a> — async data fetching patterns</li>
        <li><a href="/routing/router">Router</a> — client-side navigation after hydration</li>
        <li><a href="/performance/code-splitting">Code Splitting</a> — reduce client bundle size</li>
      </ul>
    </div>
  `}function wt(){return r`
    <div>
      <h1>DevTools</h1>
      <p><code>enableDevtools</code> activates browser console integration for inspecting signals, effects, and component trees during development.</p>

      <h2>Enable in Development</h2>
      ${e(`import { enableDevtools } from 'onefold';

if (import.meta.env?.MODE === 'development') {
  enableDevtools();
}`)}

      <h2>Features</h2>
      <ul>
        <li><strong>Signal Inspector</strong> — View all active signals and their current values.</li>
        <li><strong>Effect Tracker</strong> — See which effects depend on which signals.</li>
        <li><strong>Update Log</strong> — Console log of every signal change and resulting DOM update.</li>
        <li><strong>Component Tree</strong> — Visualize the component hierarchy.</li>
        <li><strong>Performance</strong> — Track update timing and identify slow renders.</li>
      </ul>

      <h2>Disable</h2>
      ${e(`import { disableDevtools } from 'onefold';

// Turn off devtools (e.g., before production build check)
disableDevtools();`)}

      ${a("DevTools add runtime overhead. Never enable them in production. Use conditional checks like import.meta.env.MODE.")}

      <h2>Console API</h2>
      <p>When devtools are enabled, a global <code>__ONEFOLD__</code> object is available in the browser console:</p>
      ${e(`// In browser console:
__ONEFOLD__.signals       // List all active signals
__ONEFOLD__.effects       // List all active effects
__ONEFOLD__.components    // Component tree
__ONEFOLD__.inspect(signal) // Detailed info about a signal`)}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Description</th></tr>
        <tr><td><code>enableDevtools()</code></td><td>Activate devtools integration.</td></tr>
        <tr><td><code>disableDevtools()</code></td><td>Deactivate devtools integration.</td></tr>
      </table>
    </div>
  `}function St(){return r`
    <div>
      <h1>Utilities</h1>
      <p>onefold ships common utility functions to reduce external dependencies. All are tree-shakeable — only imported functions are bundled.</p>

      <h2>Date & Time</h2>
      ${e(`import { formatDate, timeAgo } from 'onefold';

formatDate(new Date(), 'YYYY-MM-DD')    // '2024-01-15'
formatDate(new Date(), 'MMM D, YYYY')   // 'Jan 15, 2024'
formatDate(new Date(), 'HH:mm:ss')      // '14:30:00'

timeAgo(new Date(Date.now() - 60000))   // '1 minute ago'
timeAgo(new Date(Date.now() - 3600000)) // '1 hour ago'
timeAgo(new Date('2024-01-01'))         // '2 weeks ago'`)}

      <h2>Formatting</h2>
      ${e(`import { formatCurrency, truncate, slugify, pluralize } from 'onefold';

formatCurrency(1234.5, 'USD')  // '$1,234.50'
formatCurrency(999, 'EUR')     // '\u20AC999.00'
formatCurrency(50, 'GBP')     // '\xA350.00'

truncate('Hello World this is a long string', 20)  // 'Hello World this ...'
truncate('Short', 20)  // 'Short'

slugify('Hello World!')      // 'hello-world'
slugify('Caf\xE9 & R\xE9sum\xE9')     // 'cafe-resume'

pluralize('item', 0)   // 'items'
pluralize('item', 1)   // 'item'
pluralize('item', 5)   // 'items'
pluralize('child', 3, 'children')  // 'children'`)}

      <h2>Function Utilities</h2>
      ${e(`import { debounce, throttle, pipe } from 'onefold';

// Debounce \u2014 only fires after 300ms of inactivity
const search = debounce((query: string) => {
  fetchResults(query);
}, 300);

// Throttle \u2014 fires at most once every 100ms
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);

// Pipe \u2014 compose functions left to right
const transform = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.replace(/\\s+/g, '-'),
);
transform('  Hello World  ') // 'hello-world'`)}

      <h2>API Reference</h2>
      <table>
        <tr><th>Function</th><th>Signature</th><th>Description</th></tr>
        <tr><td><code>formatDate</code></td><td>(date, format) => string</td><td>Format a Date with a pattern string.</td></tr>
        <tr><td><code>timeAgo</code></td><td>(date) => string</td><td>Human-readable relative time.</td></tr>
        <tr><td><code>formatCurrency</code></td><td>(amount, currency) => string</td><td>Format number as currency.</td></tr>
        <tr><td><code>truncate</code></td><td>(str, maxLen) => string</td><td>Truncate with ellipsis.</td></tr>
        <tr><td><code>slugify</code></td><td>(str) => string</td><td>URL-safe slug from string.</td></tr>
        <tr><td><code>pluralize</code></td><td>(word, count, plural?) => string</td><td>Pluralize based on count.</td></tr>
        <tr><td><code>debounce</code></td><td>(fn, ms) => fn</td><td>Delay execution until idle.</td></tr>
        <tr><td><code>throttle</code></td><td>(fn, ms) => fn</td><td>Limit execution frequency.</td></tr>
        <tr><td><code>pipe</code></td><td>(...fns) => fn</td><td>Left-to-right function composition.</td></tr>
      </table>

      ${u(`function App() {
  const input = createSignal('Hello World! This is OneFold.');
  const count = createSignal(3);

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function pluralize(word, n) {
    return n === 1 ? word : word + 's';
  }

  function timeAgo(ms) {
    var seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds + ' seconds ago';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
    var hours = Math.floor(minutes / 60);
    return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
  }

  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  return html\`
    <div>
      <h3>Utilities Demo</h3>
      <div style="margin-bottom:12px">
        <label style="font-size:13px;display:block;margin-bottom:4px">Input text:</label>
        <input value=\${() => input()} oninput=\${(e) => input.set(e.target.value)} style="width:100%" />
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:13px;display:block;margin-bottom:4px">Count:</label>
        <input type="number" value=\${() => count()} oninput=\${(e) => count.set(Number(e.target.value))} style="width:80px" />
      </div>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:6px"><strong>slugify</strong></td><td style="padding:6px"><code>\${() => slugify(input())}</code></td></tr>
        <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:6px"><strong>pluralize("item", count)</strong></td><td style="padding:6px"><code>\${() => count() + ' ' + pluralize('item', count())}</code></td></tr>
        <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:6px"><strong>formatDate(now)</strong></td><td style="padding:6px"><code>\${() => formatDate(new Date())}</code></td></tr>
        <tr><td style="padding:6px"><strong>timeAgo(5 min)</strong></td><td style="padding:6px"><code>\${() => timeAgo(300000)}</code></td></tr>
      </table>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Utilities Live Output")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/core/templates">Templates</a> — the html tagged template literal</li>
        <li><a href="/core/signals">Signals</a> — reactive primitives powering the UI</li>
      </ul>
    </div>
  `}function kt(){return r`
    <div>
      <h1>Extensions</h1>
      <p><code>registerDirective</code> and <code>setEffectHook</code> allow you to extend onefold's template engine and effect system.</p>

      <h2>registerDirective</h2>
      <p>Add custom behavior to elements via attribute directives:</p>
      ${e(`import { registerDirective } from 'onefold';

// Register a tooltip directive
registerDirective('tooltip', (element, value) => {
  element.setAttribute('title', value);
  element.style.cursor = 'help';
});

// Usage in templates
html\`<span tooltip="More info here">Hover me</span>\``)}

      <h2>More Directive Examples</h2>
      ${e(`// Click-outside directive
registerDirective('click-outside', (element, handler) => {
  const listener = (e: Event) => {
    if (!element.contains(e.target as Node)) {
      handler();
    }
  };
  document.addEventListener('click', listener);
  // Return cleanup function
  return () => document.removeEventListener('click', listener);
});

// Auto-focus directive
registerDirective('autofocus', (element) => {
  requestAnimationFrame(() => (element as HTMLElement).focus());
});

// Intersection observer directive
registerDirective('visible', (element, callback) => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) callback();
  });
  observer.observe(element);
  return () => observer.disconnect();
});`)}

      <h2>setEffectHook</h2>
      <p>Intercept or wrap the effect system for logging, profiling, or debugging:</p>
      ${e(`import { setEffectHook } from 'onefold';

// Log every effect execution
setEffectHook({
  onRun: (effectId, fn) => {
    console.log(\`Effect \${effectId} running\`);
    const start = performance.now();
    fn();
    console.log(\`Effect \${effectId} took \${performance.now() - start}ms\`);
  },
  onDispose: (effectId) => {
    console.log(\`Effect \${effectId} disposed\`);
  },
});`)}

      ${a("Extensions are global. Register them once at app startup, before mounting.")}

      <h2>API</h2>
      <table>
        <tr><th>Function</th><th>Parameters</th><th>Description</th></tr>
        <tr><td><code>registerDirective</code></td><td>(name, handler)</td><td>Register a custom attribute directive.</td></tr>
        <tr><td><code>setEffectHook</code></td><td>(hooks)</td><td>Intercept effect creation and disposal.</td></tr>
      </table>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/devtools">DevTools</a> — inspect state, effects, and component trees</li>
        <li><a href="/plugins">Plugins</a> — reusable feature packages for onefold apps</li>
      </ul>
    </div>
  `}function xt(){return r`
    <div>
      <h1>CLI (create-onefold)</h1>
      <p><code>create-onefold</code> scaffolds new onefold projects with pre-configured templates, build tools, and dev servers.</p>

      <h2>Quick Start</h2>
      ${e(`npm create onefold@latest my-app
cd my-app
npm install
npm run dev`)}

      <h2>Templates</h2>
      <table>
        <tr><th>Template</th><th>Command</th><th>Description</th></tr>
        <tr><td>SPA</td><td><code>--template spa</code></td><td>Single-page app with router, esbuild, dev server.</td></tr>
        <tr><td>Fullstack</td><td><code>--template fullstack</code></td><td>SPA + Express server with SSR support.</td></tr>
        <tr><td>Microfrontend</td><td><code>--template microfrontend</code></td><td>Host + remote widgets with security config.</td></tr>
      </table>

      <h2>Usage</h2>
      ${e(`# Interactive mode (prompts for template)
npm create onefold@latest my-app

# Specify template directly
npm create onefold@latest my-app -- --template spa
npm create onefold@latest my-app -- --template fullstack
npm create onefold@latest my-app -- --template microfrontend`)}

      <h2>Generated Structure (SPA)</h2>
      ${e(`my-app/
\u251C\u2500\u2500 src/
\u2502   \u251C\u2500\u2500 main.ts          # Entry point
\u2502   \u251C\u2500\u2500 pages/
\u2502   \u2502   \u251C\u2500\u2500 Home.ts
\u2502   \u2502   \u2514\u2500\u2500 About.ts
\u2502   \u2514\u2500\u2500 components/
\u251C\u2500\u2500 index.html           # HTML shell
\u251C\u2500\u2500 style.css            # Global styles
\u251C\u2500\u2500 build.mjs            # esbuild config
\u251C\u2500\u2500 server.mjs           # Dev server
\u251C\u2500\u2500 tsconfig.json
\u2514\u2500\u2500 package.json`)}

      <h2>Generated Structure (Microfrontend)</h2>
      ${e(`my-app/
\u251C\u2500\u2500 host/
\u2502   \u251C\u2500\u2500 src/main.ts      # Host shell with loadRemote
\u2502   \u251C\u2500\u2500 build.mjs
\u2502   \u2514\u2500\u2500 package.json
\u251C\u2500\u2500 remotes/
\u2502   \u251C\u2500\u2500 billing/
\u2502   \u2502   \u251C\u2500\u2500 src/index.ts # Remote widget
\u2502   \u2502   \u2514\u2500\u2500 build.mjs
\u2502   \u2514\u2500\u2500 analytics/
\u2502       \u251C\u2500\u2500 src/index.ts
\u2502       \u2514\u2500\u2500 build.mjs
\u2514\u2500\u2500 package.json`)}

      ${a("All templates use esbuild for fast builds. No webpack, no Vite \u2014 just a 5-line build.mjs script.")}

      <h2>Options</h2>
      <table>
        <tr><th>Flag</th><th>Description</th></tr>
        <tr><td><code>--template &lt;name&gt;</code></td><td>Template to use (spa, fullstack, microfrontend).</td></tr>
        <tr><td><code>--help</code></td><td>Show help.</td></tr>
        <tr><td><code>--version</code></td><td>Show CLI version.</td></tr>
      </table>
    </div>
  `}function Ct(){return r`
    <div>
      <h1>Playground</h1>
      <p>Try onefold in the browser. Edit the code below and click Run to see the result.</p>

      <h2>Counter</h2>
      ${u(`function Counter(): Node {
  const count = createSignal(0);

  return html\`
    <div>
      <h2>Count: \${() => count()}</h2>
      <button onclick=\${() => count.set(n => n - 1)}>-</button>
      <button onclick=\${() => count.set(n => n + 1)}>+</button>
      <button onclick=\${() => count.set(0)}>Reset</button>
    </div>
  \`;
}

mount(Counter(), document.getElementById('app'));`,"Counter Example")}

      <h2>Todo List</h2>
      ${u(`function App(): Node {
  const todos = createSignal([]);
  const input = createSignal('');

  const add = () => {
    if (input().trim()) {
      todos.set(t => [...t, { id: Date.now(), text: input(), done: false }]);
      input.set('');
    }
  };

  const toggle = (id) => {
    todos.set(t => t.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const remove = (id) => {
    todos.set(t => t.filter(todo => todo.id !== id));
  };

  return html\`
    <div>
      <h2>Todo List</h2>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input
          value=\${() => input()}
          oninput=\${(e) => input.set(e.target.value)}
          onkeydown=\${(e) => e.key === 'Enter' && add()}
          placeholder="Add a task..."
          style="flex:1"
        />
        <button onclick=\${add}>Add</button>
      </div>
      <ul>
        \${() => todos().map(todo => html\`
          <li style="display:flex;align-items:center;gap:8px;margin:4px 0">
            <input type="checkbox" checked=\${todo.done} onchange=\${() => toggle(todo.id)} />
            <span style=\${'text-decoration:' + (todo.done ? 'line-through' : 'none')}>\${todo.text}</span>
            <button onclick=\${() => remove(todo.id)} style="margin-left:auto">x</button>
          </li>
        \`)}
      </ul>
      <p>\${() => todos().filter(t => !t.done).length} items remaining</p>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Todo List")}

      <h2>Reactive Theme</h2>
      ${u(`function App(): Node {
  const dark = createSignal(false);

  const styles = () => dark()
    ? 'background:#1a1a2e;color:#e0e0e0;padding:16px;border-radius:8px'
    : 'background:#f8f9fa;color:#1a1a1a;padding:16px;border-radius:8px';

  return html\`
    <div style=\${styles}>
      <h2>\${() => dark() ? 'Dark Mode' : 'Light Mode'}</h2>
      <p>Click the button to toggle the theme.</p>
      <button onclick=\${() => dark.set(d => !d)}>
        \${() => dark() ? 'Switch to Light' : 'Switch to Dark'}
      </button>
    </div>
  \`;
}

mount(App(), document.getElementById('app'));`,"Theme Toggle")}
    </div>
  `}function oe(){return r`
    <div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button onclick=${()=>k("/")} style="padding:8px 16px;border-radius:6px;border:1px solid var(--border);cursor:pointer;margin-top:12px">
        Go to Introduction
      </button>
    </div>
  `}function $t(){return r`
    <div>
      <h1>Deploy to GitHub Pages</h1>
      <p>GitHub Pages serves static files directly from a repository. Since there's no server-side SPA fallback, onefold apps should use <strong>hash-based routing</strong>.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A GitHub repository with your onefold project</li>
        <li>The project builds to a <code>dist/</code> folder</li>
      </ul>

      <h2>1. Configure Hash Routing</h2>
      ${e(`// main.ts
import { configureRouter, Router, navigate, mount } from 'onefold';

configureRouter({ hash: true });

const app = Router([...routes], () => NotFound());
mount(app, document.getElementById('app')!);

// Intercept internal links for hash-based navigation
document.addEventListener('click', (e) => {
  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
  e.preventDefault();
  navigate(href);
});

// Navigate to home on initial load
if (!location.hash || location.hash === '#/') {
  navigate('/');
}`)}

      <h2>2. Use Relative Asset Paths</h2>
      <p>Your <code>index.html</code> must use <code>./</code> relative paths so assets load correctly regardless of the repository subpath:</p>
      ${e(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"><\/script>
</body>
</html>`,"html")}

      ${a("Do NOT use absolute paths like /app.js \u2014 on GitHub Pages at username.github.io/repo-name/, they resolve to username.github.io/app.js which does not exist.")}

      <h2>3. GitHub Actions Workflow</h2>
      <p>Create <code>.github/workflows/deploy.yml</code>:</p>
      ${e(`name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4`,"yaml")}

      <h2>4. Enable Pages in Repository Settings</h2>
      <ol>
        <li>Go to your repo → Settings → Pages</li>
        <li>Under "Source", select <strong>GitHub Actions</strong></li>
        <li>Push to <code>main</code> — the workflow will deploy automatically</li>
      </ol>

      <h2>Manual Deploy (gh-pages branch)</h2>
      <p>Alternatively, deploy from a <code>gh-pages</code> branch:</p>
      ${e(`# Install gh-pages
npm install -D gh-pages

# Add deploy script to package.json
# "deploy": "npm run build && gh-pages -d dist"

npm run deploy`,"bash")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/routing/configure">configureRouter</a> — routing mode configuration details</li>
        <li><a href="/deployment/vercel">Vercel</a> — deploy with path-based routing</li>
      </ul>
    </div>
  `}function Pt(){return r`
    <div>
      <h1>Deploy to Vercel</h1>
      <p>Vercel supports SPA fallback out of the box. Use the default <strong>path-based routing</strong> — no <code>configureRouter</code> call needed.</p>

      <h2>Quick Deploy</h2>
      <ol>
        <li>Push your project to GitHub/GitLab/Bitbucket</li>
        <li>Go to <a href="https://vercel.com/new" target="_blank">vercel.com/new</a> and import the repo</li>
        <li>Set the build command and output directory:</li>
      </ol>

      <table>
        <tr><th>Setting</th><th>Value</th></tr>
        <tr><td>Build Command</td><td><code>npm run build</code></td></tr>
        <tr><td>Output Directory</td><td><code>dist</code></td></tr>
        <tr><td>Install Command</td><td><code>npm install</code></td></tr>
      </table>

      <h2>SPA Fallback Configuration</h2>
      <p>Create a <code>vercel.json</code> at the project root to explicitly configure the SPA rewrite:</p>
      ${e(`{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`,"json")}

      ${a("The rewrites rule ensures all paths serve index.html, allowing the client-side router to handle them.")}

      <h2>Router Configuration</h2>
      <p>No special configuration needed — path mode is the default:</p>
      ${e(`import { Router, mount } from 'onefold';

// Path-based routing works out of the box on Vercel
const app = Router([
  { path: '/', view: () => Home() },
  { path: '/about', view: () => About() },
], () => NotFound());

mount(app, document.getElementById('app')!);`)}

      <h2>Environment Variables</h2>
      <p>Set environment variables in Vercel's dashboard under Project Settings → Environment Variables. Access them at build time via your bundler's <code>define</code> option:</p>
      ${e(`// build.mjs (esbuild)
await build({
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL || ''),
  },
});`)}

      <h2>Deploy via CLI</h2>
      ${e(`# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Deploy to production
vercel --prod`,"bash")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/deployment/netlify">Netlify</a> — similar platform with _redirects file</li>
        <li><a href="/deployment/cloudflare">Cloudflare Pages</a> — edge deployment</li>
      </ul>
    </div>
  `}function Tt(){return r`
    <div>
      <h1>Deploy to Netlify</h1>
      <p>Netlify supports SPA fallback via a <code>_redirects</code> file. Use the default <strong>path-based routing</strong>.</p>

      <h2>Quick Deploy</h2>
      <ol>
        <li>Push your project to GitHub/GitLab/Bitbucket</li>
        <li>Go to <a href="https://app.netlify.com/start" target="_blank">app.netlify.com</a> and connect your repo</li>
        <li>Configure build settings:</li>
      </ol>

      <table>
        <tr><th>Setting</th><th>Value</th></tr>
        <tr><td>Build command</td><td><code>npm run build</code></td></tr>
        <tr><td>Publish directory</td><td><code>dist</code></td></tr>
      </table>

      <h2>SPA Fallback with _redirects</h2>
      <p>Create a <code>public/_redirects</code> file (or place in your <code>dist/</code> output) so Netlify serves <code>index.html</code> for all routes:</p>
      ${e("/*    /index.html   200","text")}

      <p>If you use a <code>public/</code> folder that gets copied to dist, place <code>_redirects</code> there. Otherwise add it to your build script:</p>
      ${e(`// build.mjs
import { writeFileSync } from 'node:fs';

// ... after esbuild ...

// SPA fallback for Netlify
writeFileSync('dist/_redirects', '/*    /index.html   200\\n');`)}

      ${a("Without the _redirects file, navigating directly to /about will return a 404 from Netlify.")}

      <h2>Alternative: netlify.toml</h2>
      <p>You can also configure redirects in <code>netlify.toml</code> at the project root:</p>
      ${e(`[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`,"toml")}

      <h2>Router Configuration</h2>
      <p>No special configuration needed — path mode works with the redirect rule:</p>
      ${e(`import { Router, mount } from 'onefold';

const app = Router([
  { path: '/', view: () => Home() },
  { path: '/about', view: () => About() },
], () => NotFound());

mount(app, document.getElementById('app')!);`)}

      <h2>Deploy via CLI</h2>
      ${e(`# Install Netlify CLI
npm i -g netlify-cli

# Link to site and deploy
netlify link
netlify deploy --dir=dist

# Deploy to production
netlify deploy --dir=dist --prod`,"bash")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/deployment/cloudflare">Cloudflare Pages</a> — edge deployment with Workers</li>
        <li><a href="/deployment/aws">AWS S3 + CloudFront</a> — self-managed hosting</li>
      </ul>
    </div>
  `}function Rt(){return r`
    <div>
      <h1>Deploy to Cloudflare Pages</h1>
      <p>Cloudflare Pages serves static sites from their global edge network with built-in SPA support. Use the default <strong>path-based routing</strong>.</p>

      <h2>Quick Deploy</h2>
      <ol>
        <li>Go to the <a href="https://dash.cloudflare.com/?to=/:account/pages" target="_blank">Cloudflare Pages dashboard</a></li>
        <li>Click "Create a project" → Connect to Git</li>
        <li>Select your repository and configure:</li>
      </ol>

      <table>
        <tr><th>Setting</th><th>Value</th></tr>
        <tr><td>Build command</td><td><code>npm run build</code></td></tr>
        <tr><td>Build output directory</td><td><code>dist</code></td></tr>
      </table>

      <h2>SPA Fallback</h2>
      <p>Cloudflare Pages automatically serves <code>index.html</code> for paths that don't match a static file (404 fallback). No extra configuration is needed for SPA routing.</p>

      ${a("Cloudflare Pages handles SPA fallback automatically. You do not need a _redirects file or custom rules for client-side routing.")}

      <h2>Custom Headers and Redirects</h2>
      <p>If you need custom headers, create a <code>public/_headers</code> file:</p>
      ${e(`/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin`,"text")}

      <h2>Router Configuration</h2>
      ${e(`import { Router, mount } from 'onefold';

// Path-based routing \u2014 no configureRouter needed
const app = Router([
  { path: '/', view: () => Home() },
  { path: '/dashboard', view: () => Dashboard() },
], () => NotFound());

mount(app, document.getElementById('app')!);`)}

      <h2>Deploy via Wrangler CLI</h2>
      ${e(`# Install Wrangler
npm i -g wrangler

# Build and deploy
npm run build
wrangler pages deploy dist --project-name=my-app`,"bash")}

      <h2>Environment Variables</h2>
      <p>Set build-time environment variables in the Cloudflare Pages dashboard under Settings → Environment variables. Use them in your build script:</p>
      ${e(`// build.mjs
await build({
  define: {
    '__API_URL__': JSON.stringify(process.env.API_URL || '/api'),
  },
});`)}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/deployment/aws">AWS S3 + CloudFront</a> — self-managed static hosting</li>
        <li><a href="/deployment/docker">Docker / Node</a> — containerized deployment</li>
      </ul>
    </div>
  `}function Nt(){return r`
    <div>
      <h1>Deploy to AWS (S3 + CloudFront)</h1>
      <p>Host your onefold app on S3 with CloudFront as the CDN. Configure a custom error response to enable SPA fallback with <strong>path-based routing</strong>.</p>

      <h2>Option A: Path-Based Routing (Recommended)</h2>
      <p>Use CloudFront's custom error response to serve <code>index.html</code> for all 404s.</p>

      <h3>1. Create an S3 Bucket</h3>
      ${e("aws s3 mb s3://my-onefold-app --region us-east-1","bash")}

      <h3>2. Upload the Build</h3>
      ${e(`npm run build
aws s3 sync dist/ s3://my-onefold-app --delete`,"bash")}

      <h3>3. Configure CloudFront</h3>
      <p>Create a CloudFront distribution with the S3 bucket as origin. Add a custom error response:</p>

      <table>
        <tr><th>Setting</th><th>Value</th></tr>
        <tr><td>HTTP Error Code</td><td>403</td></tr>
        <tr><td>Response Page Path</td><td><code>/index.html</code></td></tr>
        <tr><td>Response Code</td><td>200</td></tr>
      </table>

      <p>Add a second rule for 404:</p>
      <table>
        <tr><th>Setting</th><th>Value</th></tr>
        <tr><td>HTTP Error Code</td><td>404</td></tr>
        <tr><td>Response Page Path</td><td><code>/index.html</code></td></tr>
        <tr><td>Response Code</td><td>200</td></tr>
      </table>

      ${a("S3 returns 403 (not 404) for paths that do not exist when using OAI/OAC. Configure both 403 and 404 error responses.")}

      <h3>4. Router Configuration</h3>
      ${e(`import { Router, mount } from 'onefold';

// Path-based (default) \u2014 works with CloudFront error response
const app = Router([
  { path: '/', view: () => Home() },
  { path: '/about', view: () => About() },
], () => NotFound());

mount(app, document.getElementById('app')!);`)}

      <h2>Option B: Hash-Based Routing (No CloudFront)</h2>
      <p>If you're serving directly from S3 static website hosting without CloudFront, use hash-based routing:</p>

      ${e(`import { configureRouter, Router, navigate, mount } from 'onefold';

configureRouter({ hash: true });

const app = Router([...routes], () => NotFound());
mount(app, document.getElementById('app')!);

// Intercept internal links
document.addEventListener('click', (e) => {
  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
  e.preventDefault();
  navigate(href);
});

if (!location.hash || location.hash === '#/') {
  navigate('/');
}`)}

      <p>And use relative asset paths in <code>index.html</code>:</p>
      ${e(`<link rel="stylesheet" href="./style.css" />
<script type="module" src="./app.js"><\/script>`,"html")}

      <h2>AWS CLI Deploy Script</h2>
      ${e(`#!/bin/bash
# deploy.sh
npm run build
aws s3 sync dist/ s3://my-onefold-app --delete \\
  --cache-control "public, max-age=31536000, immutable" \\
  --exclude "index.html"

# index.html should not be cached long-term
aws s3 cp dist/index.html s3://my-onefold-app/index.html \\
  --cache-control "public, max-age=0, must-revalidate"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \\
  --distribution-id YOUR_DIST_ID \\
  --paths "/*"`,"bash")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/deployment/docker">Docker / Node</a> — containerized deployment with a server</li>
        <li><a href="/deployment/github-pages">GitHub Pages</a> — free static hosting</li>
      </ul>
    </div>
  `}function Et(){return r`
    <div>
      <h1>Deploy with Docker / Node Server</h1>
      <p>Containerize your onefold app with Nginx or a Node.js server for self-hosted environments. Use <strong>path-based routing</strong> with server-side SPA fallback.</p>

      <h2>Option A: Nginx in Docker (Recommended)</h2>

      <h3>Nginx Configuration</h3>
      <p>Create <code>nginx.conf</code>:</p>
      ${e(`server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback \u2014 serve index.html for all routes
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets aggressively
  location ~* \\.(js|css|svg|png|jpg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # No cache for index.html
  location = /index.html {
    expires -1;
    add_header Cache-Control "no-store, must-revalidate";
  }
}`,"nginx")}

      <h3>Dockerfile</h3>
      ${e(`# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,"dockerfile")}

      <h3>Build and Run</h3>
      ${e(`docker build -t my-onefold-app .
docker run -p 8080:80 my-onefold-app`,"bash")}

      ${a("The try_files directive is the key to SPA fallback \u2014 it tells Nginx to serve index.html when no matching file exists.")}

      <h2>Option B: Node.js Server</h2>
      <p>Use a minimal Express server with <code>express.static</code> and a fallback to <code>index.html</code>:</p>

      <h3>server.mjs</h3>
      ${e(`import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist
app.use(express.static(resolve(__dirname, 'dist')));

// SPA fallback \u2014 all other routes serve index.html
app.get('*', (_req, res) => {
  res.sendFile(resolve(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`)}

      <h3>Dockerfile (Node version)</h3>
      ${e(`FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs .
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "server.mjs"]`,"dockerfile")}

      <h2>Router Configuration</h2>
      <p>With either Nginx or Node serving as SPA fallback, use the default path-based routing:</p>
      ${e(`import { Router, mount } from 'onefold';

const app = Router([
  { path: '/', view: () => Home() },
  { path: '/dashboard', view: () => Dashboard() },
], () => NotFound());

mount(app, document.getElementById('app')!);`)}

      <h2>Docker Compose</h2>
      ${e(`# docker-compose.yml
services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped`,"yaml")}

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/deployment/vercel">Vercel</a> — zero-config deployment</li>
        <li><a href="/deployment/github-pages">GitHub Pages</a> — free static hosting with hash routing</li>
        <li><a href="/ssr">Server-Side Rendering</a> — pre-render pages for SEO</li>
      </ul>
    </div>
  `}X({hash:!0});var w=(t,o)=>o??oe(),po=[{path:"/",view:()=>$e()},{path:"/getting-started",view:w,children:[{path:"/install",view:()=>Pe()},{path:"/quickstart",view:()=>Te()}]},{path:"/core",view:w,children:[{path:"/signals",view:()=>Re()},{path:"/templates",view:()=>Ne()},{path:"/css",view:()=>Ee()},{path:"/mounting",view:()=>Ie()}]},{path:"/routing",view:w,children:[{path:"/router",view:()=>Ae()},{path:"/configure",view:()=>De()},{path:"/nested",view:()=>Le()},{path:"/navigate",view:()=>Me()},{path:"/link",view:()=>He()},{path:"/params",view:()=>Oe()}]},{path:"/state",view:w,children:[{path:"/store",view:()=>Ue()},{path:"/persisted",view:()=>Be()}]},{path:"/data",view:w,children:[{path:"/resource",view:()=>je()},{path:"/http-client",view:()=>Fe()},{path:"/interceptors",view:()=>We()}]},{path:"/forms",view:w,children:[{path:"/create-form",view:()=>_e()},{path:"/validation",view:()=>ze()}]},{path:"/microfrontends",view:w,children:[{path:"/load-remote",view:()=>Ve()},{path:"/isolation",view:()=>Ge()},{path:"/communication",view:()=>Je()},{path:"/security",view:()=>qe()},{path:"/sri",view:()=>Ye()},{path:"/shared-deps",view:()=>Xe()},{path:"/cross-framework",view:()=>Qe()},{path:"/deployment",view:()=>Ke()},{path:"/api-reference",view:()=>Ze()}]},{path:"/async",view:w,children:[{path:"/suspense",view:()=>et()},{path:"/lazy-loading",view:()=>tt()},{path:"/error-boundaries",view:()=>ot()}]},{path:"/streaming",view:w,children:[{path:"/websocket",view:()=>rt()},{path:"/sse",view:()=>nt()}]},{path:"/security",view:w,children:[{path:"/guards",view:()=>ct()},{path:"/xss",view:()=>pt()}]},{path:"/performance",view:w,children:[{path:"/virtual-list",view:()=>ut()},{path:"/code-splitting",view:()=>ht()}]},{path:"/interop",view:w,children:[{path:"/wrap-imperative",view:()=>mt()},{path:"/embed-foreign",view:()=>ft()}]},{path:"/i18n",view:()=>it()},{path:"/theming",view:()=>at()},{path:"/a11y",view:()=>st()},{path:"/transitions",view:()=>dt()},{path:"/di",view:()=>lt()},{path:"/plugins",view:()=>gt()},{path:"/observability",view:()=>vt()},{path:"/meta",view:()=>bt()},{path:"/ssr",view:()=>yt()},{path:"/devtools",view:()=>wt()},{path:"/utilities",view:()=>St()},{path:"/extensions",view:()=>kt()},{path:"/cli",view:()=>xt()},{path:"/playground",view:()=>Ct()},{path:"/deployment",view:w,children:[{path:"/github-pages",view:()=>$t()},{path:"/vercel",view:()=>Pt()},{path:"/netlify",view:()=>Tt()},{path:"/cloudflare",view:()=>Rt()},{path:"/aws",view:()=>Nt()},{path:"/docker",view:()=>Et()}]}],uo=Ce(ee(po,()=>oe()));J(uo,document.getElementById("app"));document.addEventListener("click",t=>{let o=t.target.closest("a");if(!o)return;let n=o.getAttribute("href");!n||n.startsWith("http")||n.startsWith("#")||n.startsWith("mailto:")||(t.preventDefault(),k(n))});(!location.hash||location.hash==="#/")&&k("/");
//# sourceMappingURL=app.js.map
