var B=null;function U(e,t){B?B(e,t):t()}var te=new Map;function F(e){return te.get(e)}var E=null,ne=0,re=new Set,v=0,S=null,oe=200,T=class{constructor(t,n){this.deps=new Set,this.active=!0,this.fn=t,this.label=n}run(){if(!this.active)return;this.cleanup();let t=E;E=this;try{U(this.label,this.fn)}finally{E=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},N=class{constructor(t){this.value=t,this.subscribers=new Set}get(){return E&&(this.subscribers.add(E),E.deps.add(this)),this.value}set(t){let n=typeof t=="function"?t(this.value):t;Object.is(n,this.value)||(this.value=n,typeof __DEV__<"u"&&__DEV__&&(v++,S||(S=setTimeout(()=>{v=0,S=null},1e3)),v>oe&&(console.warn(`[onefold] Signal updated ${v} times in <1s. Possible infinite loop in an effect.`),v=0)),this.notify())}peek(){return this.value}notify(){if(ne>0)for(let t of this.subscribers)re.add(t);else{let t=Array.from(this.subscribers);for(let n=0;n<t.length;n++)t[n].run()}}};function m(e){let t=new N(e),n=(()=>t.get());return n.set=o=>t.set(o),n.peek=()=>t.peek(),n}function y(e,t="effect"){let n=t;if(typeof __DEV__<"u"&&__DEV__&&t==="effect")try{let i=(new Error().stack??"").split(`
`);for(let r=2;r<i.length&&r<8;r++){let c=i[r]?.trim()??"";if(!c||/\bcreateEffect\b|\bcreateComputed\b|\bbindReactive\b|\bapplyAttr\b|\bbuildDom\b|\bappendExpr\b|\brunWithHook\b|ReactiveEffect/.test(c))continue;let a=c.match(/at\s+([A-Z]\w+)\s+\(/);if(a){let l=c.match(/:(\d+):\d+\)?$/);n=l?`${a[1]} (:${l[1]})`:a[1];break}let f=c.match(/([^/\\:]+):(\d+):\d+\)?$/);if(f){n=`${f[1]}:${f[2]}`;break}}}catch{}let o=new T(e,n);return o.run(),()=>o.dispose()}var ie=/^\s*(javascript|data|vbscript):/i,se=/^on/i;function L(e){return ie.test(e)}function k(e){return se.test(e)}function W(e){let t=document.createElement("template");t.innerHTML=e;let n=o=>{let s=[];o.childNodes.forEach(i=>{if(i.nodeType===Node.ELEMENT_NODE){let r=i,c=r.tagName.toLowerCase();if(c==="script"||c==="style"||c==="iframe"||c==="object"||c==="embed"||c==="form"){s.push(i);return}Array.from(r.attributes).forEach(a=>{(k(a.name)||(a.name==="href"||a.name==="src")&&L(a.value))&&r.removeAttribute(a.name)}),n(r)}}),s.forEach(i=>i.remove())};return n(t.content),t.innerHTML}var _=null;function ce(){return _||(typeof window<"u"&&window.trustedTypes&&(_=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>W(e)})),_)}function D(e){let t=ce();return t?t.createHTML(e):W(e)}function R(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function I(e,t){t.replaceChildren(e)}var H=new WeakMap,O=null;function ae(){if(O||typeof MutationObserver>"u"||typeof document>"u")return;O=new MutationObserver(t=>{for(let n of t)n.removedNodes.forEach(V)});let e=document.documentElement??document;O.observe(e,{childList:!0,subtree:!0})}function V(e){let t=H.get(e);if(t){for(let n of t)try{n()}catch(o){console.error("[onefold] Error while disposing a reactive binding:",o)}H.delete(e)}e.childNodes.forEach(V)}function M(e,t){ae();let n=H.get(e);n||(n=new Set,H.set(e,n)),n.add(t)}var z=null;var b="\0nf_",x=/\x00nf_(\d+)\x00/g;function fe(e){return`${b}${e}\0`}function p(e,t){return e.charAt(t)}function j(e){return parseInt(e[1]??"0",10)}function le(e,t){let n="";for(let r=0;r<e.length;r++)n+=e[r],r<t.length&&(n+=fe(r));let o=[],s=0,i=n.length;for(;s<i;){if(p(n,s)==="<"){if(n.startsWith("<!--",s)){let h=n.indexOf("-->",s+4);s=h===-1?i:h+3;continue}if(p(n,s+1)==="/"){let h=n.indexOf(">",s),A=n.slice(s+2,h).trim();o.push({kind:1,tag:A}),s=h+1;continue}let a=ue(n,s),f=p(n,a-1)==="/",l=n.slice(s+1,f?a-1:a),{tag:d,attrs:g}=de(l,t);o.push({kind:0,tag:d});for(let h of g)o.push(h);f&&o.push({kind:1,tag:d}),s=a+1;continue}let r=n.indexOf("<",s),c=r===-1?n.slice(s):n.slice(s,r);if(s=r===-1?i:r,c.trim()||x.test(c)){x.lastIndex=0;let a=0,f;for(;(f=x.exec(c))!==null;){let d=c.slice(a,f.index);d&&o.push({kind:3,value:d}),o.push({kind:4,value:t[j(f)]}),a=f.index+f[0].length}let l=c.slice(a);l&&l.trim()&&o.push({kind:3,value:l})}}return o}function ue(e,t){let n=null;for(let o=t+1;o<e.length;o++){let s=p(e,o);if(n)s===n&&(n=null);else if(s==='"'||s==="'")n=s;else if(s===">")return o}return e.length-1}function $(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function de(e,t){let n=e.search(/[\s/]/),o=n===-1?e:e.slice(0,n),s=[];if(n===-1)return{tag:o,attrs:s};let i=e.slice(n).trim();if(!i)return{tag:o,attrs:s};let r=0,c=i.length;for(;r<c;){for(;r<c&&$(p(i,r));)r++;if(r>=c)break;if(i.startsWith(b,r)){let l=i.indexOf("\0",r+b.length),d=parseInt(i.slice(r+b.length,l),10),g=t[d];if(g&&typeof g=="object")for(let[h,A]of Object.entries(g))s.push({kind:2,name:h,value:A});r=l+1;continue}let a=r;for(;r<c&&p(i,r)!=="="&&!$(p(i,r));)r++;let f=i.slice(a,r);if(!f){r++;continue}for(;r<c&&$(p(i,r));)r++;if(r>=c||p(i,r)!=="="){s.push({kind:2,name:f,value:!0});continue}for(r++;r<c&&$(p(i,r));)r++;if(i.startsWith(b,r)){let l=i.indexOf("\0",r+b.length),d=parseInt(i.slice(r+b.length,l),10);s.push({kind:2,name:f,value:t[d]}),r=l+1}else if(p(i,r)==='"'||p(i,r)==="'"){let l=p(i,r);r++;let d=r;for(;r<c&&p(i,r)!==l;)r++;let g=i.slice(d,r);r++,s.push({kind:2,name:f,value:q(g,t)})}else{let l=r;for(;r<c&&!$(p(i,r));)r++;let d=i.slice(l,r);s.push({kind:2,name:f,value:q(d,t)})}}return{tag:o,attrs:s}}function q(e,t){x.lastIndex=0;let n=x.exec(e);if(!n)return e;if(n.index===0&&n[0].length===e.length)return t[j(n)];x.lastIndex=0;let o=[],s=0,i;for(;(i=x.exec(e))!==null;){i.index>s&&o.push(e.slice(s,i.index));let r=t[j(i)];o.push(typeof r=="function"?r:()=>r),s=i.index+i[0].length}return s<e.length&&o.push(e.slice(s)),()=>o.map(r=>typeof r=="function"?r():r).join("")}function pe(e){let t=document.createDocumentFragment(),n=[t],o=t;for(let s of e)switch(s.kind){case 0:{let i=document.createElement(s.tag);o.appendChild(i),n.push(i),o=i;break}case 1:{if(typeof __DEV__<"u"&&__DEV__){let i=o,r=i.tagName?.toLowerCase();(r==="input"||r==="textarea")&&!i.hasAttribute("value")&&i.getAttribute("data-nf-has-input")==="1"&&console.warn(`[onefold] <${r}> has oninput/onchange but no value=\${() => signal()} binding. The input won't clear on signal.set('') or form.reset(). Add: value=\${() => yourSignal()} for two-way binding.`,i)}n.pop(),o=n.length>0?n[n.length-1]:t;break}case 2:{he(o,s.name,s.value);break}case 3:{o.appendChild(document.createTextNode(s.value));break}case 4:{Q(o,s.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function he(e,t,n){if(t==="ref"){typeof n=="function"&&n(e);return}if(t==="class"){C(n,o=>me(e,o),e);return}if(t==="style"){C(n,o=>{typeof o=="string"?e.style.cssText=o:Object.assign(e.style,o??{})},e);return}if(k(t)&&typeof n=="function"){if(e.addEventListener(t.slice(2).toLowerCase(),n),typeof __DEV__<"u"&&__DEV__){let o=t.slice(2).toLowerCase();(o==="input"||o==="change")&&e.setAttribute("data-nf-has-input","1")}return}if(t.startsWith("d-")){let o=F(t.slice(2));o?C(n,s=>o(e,s),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}C(n,o=>ge(e,t,o),e)}function C(e,t,n){if(typeof e=="function"){let o=y(()=>t(e()));M(n,o)}else t(e)}function me(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,n])=>n).map(([n])=>n).join(" ")):e.className=""}function ge(e,t,n){if(n===!1||n==null){e.removeAttribute(t);return}if(n===!0){e.setAttribute(t,"");return}let o=String(n);if(k(t)){console.warn(`[onefold] Blocked string event handler "${t}". Use a function instead.`);return}if((t==="href"||t==="src"||t==="action"||t==="formaction"||t==="xlink:href")&&L(o)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,o),e.removeAttribute(t);return}if(t==="value"&&"value"in e){e.value=o;return}if(t==="checked"&&e instanceof HTMLInputElement){e.checked=n===!0||o==="true"||o==="";return}if(t==="selected"&&e instanceof HTMLOptionElement){e.selected=n===!0||o==="true"||o==="";return}e.setAttribute(t,o)}function Q(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let n of t)Q(e,n);return}if(typeof t=="function"){let n=document.createComment("expr-start"),o=document.createComment("expr-end");e.appendChild(n),e.appendChild(o);let s=y(()=>{let i=t(),r=n.parentNode;if(!r)return;let c=n.nextSibling;for(;c&&c!==o;){let f=c.nextSibling;r.removeChild(c),c=f}let a=X(i);r.insertBefore(a,o)});M(e,s);return}if(R(t)){let n=document.createElement("span");n.innerHTML=D(t.html),e.appendChild(n);return}e.appendChild(document.createTextNode(String(t)))}}function X(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(R(e)){let t=document.createElement("span");return t.innerHTML=D(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let n of e)t.appendChild(X(n));return t}return document.createTextNode(String(e))}function u(e,...t){if(z)return z(e,...t);let n=le(e,t);return pe(n)}function P(e,t){let n=m(void 0),o=m(!1),s=m(void 0),i=0,r=f=>{let l=++i;o.set(!0),s.set(void 0),t(f).then(d=>{l===i&&(n.set(d),o.set(!1))}).catch(d=>{l===i&&(s.set(d),o.set(!1))})},c,a=y(()=>{let f=e();c=f,r(f)});return{data:n,loading:o,error:s,refetch:()=>r(c),dispose:()=>{a(),i++}}}function Z(e,t="Search heroes..."){let n=null;return u`
    <div class="search-box">
      <input
        type="text"
        class="search-input"
        placeholder=${t}
        oninput=${s=>{let i=s.target.value;n&&clearTimeout(n),n=setTimeout(()=>e(i),300)}}
      />
    </div>
  `}function G(e,t){let n=e.biography.alignment,o=n==="good"?"badge-good":n==="bad"?"badge-bad":"badge-neutral";return u`
    <div class="hero-card" onclick=${t?()=>t(e):void 0}>
      <img class="hero-img" src=${e.images.md} alt=${e.name} />
      <div class="hero-info">
        <h3 class="hero-name">${e.name}</h3>
        <p class="hero-fullname">${e.biography.fullName||"Unknown"}</p>
        <span class="badge ${o}">${n}</span>
        <span class="hero-publisher">${e.biography.publisher}</span>
      </div>
    </div>
  `}function w(e,t){let n=t>=80?"#22c55e":t>=50?"#eab308":"#ef4444";return u`
    <div class="stat-bar">
      <span class="stat-label">${e}</span>
      <div class="stat-track">
        <div class="stat-fill" style=${{width:`${t}%`,backgroundColor:n}}></div>
      </div>
      <span class="stat-value">${String(t)}</span>
    </div>
  `}function J(e,t){let n=e.powerstats;return u`
    <div class="hero-detail">
      <button class="btn btn-back" onclick=${t}>&larr; Back</button>
      <div class="hero-detail-header">
        <img class="hero-detail-img" src=${e.images.lg} alt=${e.name} />
        <div>
          <h2>${e.name}</h2>
          <p class="hero-fullname">${e.biography.fullName||"Unknown identity"}</p>
          <p class="hero-meta">
            ${e.appearance.race||"Unknown race"} · ${e.appearance.gender} · ${e.biography.publisher}
          </p>
          <p class="hero-meta">${e.biography.firstAppearance}</p>
        </div>
      </div>
      <h3>Power Stats</h3>
      <div class="stats-grid">
        ${w("Intelligence",n.intelligence)}
        ${w("Strength",n.strength)}
        ${w("Speed",n.speed)}
        ${w("Durability",n.durability)}
        ${w("Power",n.power)}
        ${w("Combat",n.combat)}
      </div>
    </div>
  `}function K(e="Loading..."){return u`
    <div class="spinner">
      <div class="spinner-ring"></div>
      <span>${e}</span>
    </div>
  `}function Y(e,t){return u`
    <div class="error-box">
      <span class="error-icon">⚠</span>
      <p>${e}</p>
      ${t?u`<button class="btn btn-sm" onclick=${t}>Retry</button>`:null}
    </div>
  `}var be="https://akabab.github.io/superhero-api/api";async function ee(){let e=await fetch(`${be}/all.json`);if(!e.ok)throw new Error(`Failed to fetch heroes: ${e.status}`);return e.json()}function xe(){let e=m(""),t=m(null),n=P(()=>"all",()=>ee()),o=()=>{let c=n.data();if(!c)return[];let a=e().toLowerCase();return a?c.filter(f=>f.name.toLowerCase().includes(a)||f.biography.fullName.toLowerCase().includes(a)||f.biography.publisher.toLowerCase().includes(a)):c.slice(0,20)},s=c=>e.set(c),i=c=>t.set(c),r=()=>t.set(null);return u`
    <div class="hero-app">
      <header class="hero-header">
        <h1>Superhero Database</h1>
        <p>Powered by onefold — fine-grained reactive signals, real DOM, zero dependencies</p>
      </header>

      ${()=>{let c=t();return c?J(c,r):n.loading()?K("Loading heroes from API..."):n.error()?Y("Failed to load heroes.",()=>n.refetch()):u`
          <div class="hero-list-view">
            ${Z(s)}
            <div class="hero-grid">
              ${()=>{let a=o();return a.length===0?u`<p class="no-results">No heroes found matching your search.</p>`:a.map(f=>G(f,i))}}
            </div>
          </div>
        `}}
    </div>
  `}I(xe(),document.getElementById("app"));
