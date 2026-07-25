var B=null;function U(e,t){B?B(e,t):t()}var te=new Map;function F(e){return te.get(e)}var E=null,re=0,ne=new Set,y=0,A=null,oe=200,T=class{constructor(t,r){this.deps=new Set,this.active=!0,this.fn=t,this.label=r}run(){if(!this.active)return;this.cleanup();let t=E;E=this;try{U(this.label,this.fn)}finally{E=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},N=class{constructor(t){this.value=t,this.subscribers=new Set}get(){return E&&(this.subscribers.add(E),E.deps.add(this)),this.value}set(t){let r=typeof t=="function"?t(this.value):t;Object.is(r,this.value)||(this.value=r,typeof __DEV__<"u"&&__DEV__&&(y++,A||(A=setTimeout(()=>{y=0,A=null},1e3)),y>oe&&(console.warn(`[onefold] Signal updated ${y} times in <1s. Possible infinite loop in an effect.`),y=0)),this.notify())}peek(){return this.value}notify(){if(re>0)for(let t of this.subscribers)ne.add(t);else{let t=Array.from(this.subscribers);for(let r=0;r<t.length;r++)t[r].run()}}};function h(e){let t=new N(e),r=(()=>t.get());return r.set=o=>t.set(o),r.peek=()=>t.peek(),r}function w(e,t="effect"){let r=t;if(typeof __DEV__<"u"&&__DEV__&&t==="effect")try{let i=(new Error().stack??"").split(`
`);for(let n=2;n<i.length&&n<8;n++){let c=i[n]?.trim()??"";if(!c||/\bcreateEffect\b|\bcreateComputed\b|\bbindReactive\b|\bapplyAttr\b|\bbuildDom\b|\bappendExpr\b|\brunWithHook\b|ReactiveEffect/.test(c))continue;let a=c.match(/at\s+([A-Z]\w+)\s+\(/);if(a){let l=c.match(/:(\d+):\d+\)?$/);r=l?`${a[1]} (:${l[1]})`:a[1];break}let f=c.match(/([^/\\:]+):(\d+):\d+\)?$/);if(f){r=`${f[1]}:${f[2]}`;break}}}catch{}let o=new T(e,r);return o.run(),()=>o.dispose()}var ie=/^\s*(javascript|data|vbscript):/i,se=/^on/i;function L(e){return ie.test(e)}function k(e){return se.test(e)}function W(e){let t=document.createElement("template");t.innerHTML=e;let r=o=>{let s=[];o.childNodes.forEach(i=>{if(i.nodeType===Node.ELEMENT_NODE){let n=i,c=n.tagName.toLowerCase();if(c==="script"||c==="style"||c==="iframe"||c==="object"||c==="embed"||c==="form"){s.push(i);return}Array.from(n.attributes).forEach(a=>{(k(a.name)||(a.name==="href"||a.name==="src")&&L(a.value))&&n.removeAttribute(a.name)}),r(n)}}),s.forEach(i=>i.remove())};return r(t.content),t.innerHTML}var $=null;function ce(){return $||(typeof window<"u"&&window.trustedTypes&&($=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>W(e)})),$)}function R(e){let t=ce();return t?t.createHTML(e):W(e)}function D(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function I(e,t){t.replaceChildren(e)}var H=new WeakMap,M=null;function ae(){if(M||typeof MutationObserver>"u"||typeof document>"u")return;M=new MutationObserver(t=>{for(let r of t)r.removedNodes.forEach(V)});let e=document.documentElement??document;M.observe(e,{childList:!0,subtree:!0})}function V(e){let t=H.get(e);if(t){for(let r of t)try{r()}catch(o){console.error("[onefold] Error while disposing a reactive binding:",o)}H.delete(e)}e.childNodes.forEach(V)}function O(e,t){ae();let r=H.get(e);r||(r=new Set,H.set(e,r)),r.add(t)}var z=null;var b="\0nf_",x=/\x00nf_(\d+)\x00/g;function fe(e){return`${b}${e}\0`}function p(e,t){return e.charAt(t)}function P(e){return parseInt(e[1]??"0",10)}function le(e,t){let r="";for(let n=0;n<e.length;n++)r+=e[n],n<t.length&&(r+=fe(n));let o=[],s=0,i=r.length;for(;s<i;){if(p(r,s)==="<"){if(r.startsWith("<!--",s)){let m=r.indexOf("-->",s+4);s=m===-1?i:m+3;continue}if(p(r,s+1)==="/"){let m=r.indexOf(">",s),C=r.slice(s+2,m).trim();o.push({kind:1,tag:C}),s=m+1;continue}let a=ue(r,s),f=p(r,a-1)==="/",l=r.slice(s+1,f?a-1:a),{tag:d,attrs:g}=de(l,t);o.push({kind:0,tag:d});for(let m of g)o.push(m);f&&o.push({kind:1,tag:d}),s=a+1;continue}let n=r.indexOf("<",s),c=n===-1?r.slice(s):r.slice(s,n);if(s=n===-1?i:n,c.trim()||x.test(c)){x.lastIndex=0;let a=0,f;for(;(f=x.exec(c))!==null;){let d=c.slice(a,f.index);d&&o.push({kind:3,value:d}),o.push({kind:4,value:t[P(f)]}),a=f.index+f[0].length}let l=c.slice(a);l&&l.trim()&&o.push({kind:3,value:l})}}return o}function ue(e,t){let r=null;for(let o=t+1;o<e.length;o++){let s=p(e,o);if(r)s===r&&(r=null);else if(s==='"'||s==="'")r=s;else if(s===">")return o}return e.length-1}function _(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function de(e,t){let r=e.search(/[\s/]/),o=r===-1?e:e.slice(0,r),s=[];if(r===-1)return{tag:o,attrs:s};let i=e.slice(r).trim();if(!i)return{tag:o,attrs:s};let n=0,c=i.length;for(;n<c;){for(;n<c&&_(p(i,n));)n++;if(n>=c)break;if(i.startsWith(b,n)){let l=i.indexOf("\0",n+b.length),d=parseInt(i.slice(n+b.length,l),10),g=t[d];if(g&&typeof g=="object")for(let[m,C]of Object.entries(g))s.push({kind:2,name:m,value:C});n=l+1;continue}let a=n;for(;n<c&&p(i,n)!=="="&&!_(p(i,n));)n++;let f=i.slice(a,n);if(!f){n++;continue}for(;n<c&&_(p(i,n));)n++;if(n>=c||p(i,n)!=="="){s.push({kind:2,name:f,value:!0});continue}for(n++;n<c&&_(p(i,n));)n++;if(i.startsWith(b,n)){let l=i.indexOf("\0",n+b.length),d=parseInt(i.slice(n+b.length,l),10);s.push({kind:2,name:f,value:t[d]}),n=l+1}else if(p(i,n)==='"'||p(i,n)==="'"){let l=p(i,n);n++;let d=n;for(;n<c&&p(i,n)!==l;)n++;let g=i.slice(d,n);n++,s.push({kind:2,name:f,value:q(g,t)})}else{let l=n;for(;n<c&&!_(p(i,n));)n++;let d=i.slice(l,n);s.push({kind:2,name:f,value:q(d,t)})}}return{tag:o,attrs:s}}function q(e,t){x.lastIndex=0;let r=x.exec(e);if(!r)return e;if(r.index===0&&r[0].length===e.length)return t[P(r)];x.lastIndex=0;let o=[],s=0,i;for(;(i=x.exec(e))!==null;){i.index>s&&o.push(e.slice(s,i.index));let n=t[P(i)];o.push(typeof n=="function"?n:()=>n),s=i.index+i[0].length}return s<e.length&&o.push(e.slice(s)),()=>o.map(n=>typeof n=="function"?n():n).join("")}function pe(e){let t=document.createDocumentFragment(),r=[t],o=t;for(let s of e)switch(s.kind){case 0:{let i=document.createElement(s.tag);o.appendChild(i),r.push(i),o=i;break}case 1:{if(typeof __DEV__<"u"&&__DEV__){let i=o,n=i.tagName?.toLowerCase();(n==="input"||n==="textarea")&&!i.hasAttribute("value")&&i.getAttribute("data-nf-has-input")==="1"&&console.warn(`[onefold] <${n}> has oninput/onchange but no value=\${() => signal()} binding. The input won't clear on signal.set('') or form.reset(). Add: value=\${() => yourSignal()} for two-way binding.`,i)}r.pop(),o=r.length>0?r[r.length-1]:t;break}case 2:{me(o,s.name,s.value);break}case 3:{o.appendChild(document.createTextNode(s.value));break}case 4:{Q(o,s.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function me(e,t,r){if(t==="ref"){typeof r=="function"&&r(e);return}if(t==="class"){S(r,o=>he(e,o),e);return}if(t==="style"){S(r,o=>{typeof o=="string"?e.style.cssText=o:Object.assign(e.style,o??{})},e);return}if(k(t)&&typeof r=="function"){if(e.addEventListener(t.slice(2).toLowerCase(),r),typeof __DEV__<"u"&&__DEV__){let o=t.slice(2).toLowerCase();(o==="input"||o==="change")&&e.setAttribute("data-nf-has-input","1")}return}if(t.startsWith("d-")){let o=F(t.slice(2));o?S(r,s=>o(e,s),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}S(r,o=>ge(e,t,o),e)}function S(e,t,r){if(typeof e=="function"){let o=w(()=>t(e()));O(r,o)}else t(e)}function he(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,r])=>r).map(([r])=>r).join(" ")):e.className=""}function ge(e,t,r){if(r===!1||r==null){e.removeAttribute(t);return}if(r===!0){e.setAttribute(t,"");return}let o=String(r);if(k(t)){console.warn(`[onefold] Blocked string event handler "${t}". Use a function instead.`);return}if((t==="href"||t==="src"||t==="action"||t==="formaction"||t==="xlink:href")&&L(o)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,o),e.removeAttribute(t);return}if(t==="value"&&"value"in e){e.value=o;return}if(t==="checked"&&e instanceof HTMLInputElement){e.checked=r===!0||o==="true"||o==="";return}if(t==="selected"&&e instanceof HTMLOptionElement){e.selected=r===!0||o==="true"||o==="";return}e.setAttribute(t,o)}function Q(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let r of t)Q(e,r);return}if(typeof t=="function"){let r=document.createComment("expr-start"),o=document.createComment("expr-end");e.appendChild(r),e.appendChild(o);let s=w(()=>{let i=t(),n=r.parentNode;if(!n)return;let c=r.nextSibling;for(;c&&c!==o;){let f=c.nextSibling;n.removeChild(c),c=f}let a=X(i);n.insertBefore(a,o)});O(e,s);return}if(D(t)){let r=document.createElement("span");r.innerHTML=R(t.html),e.appendChild(r);return}e.appendChild(document.createTextNode(String(t)))}}function X(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(D(e)){let t=document.createElement("span");return t.innerHTML=R(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let r of e)t.appendChild(X(r));return t}return document.createTextNode(String(e))}function u(e,...t){if(z)return z(e,...t);let r=le(e,t);return pe(r)}function j(e,t){let r=h(void 0),o=h(!1),s=h(void 0),i=0,n=f=>{let l=++i;o.set(!0),s.set(void 0),t(f).then(d=>{l===i&&(r.set(d),o.set(!1))}).catch(d=>{l===i&&(s.set(d),o.set(!1))})},c,a=w(()=>{let f=e();c=f,n(f)});return{data:r,loading:o,error:s,refetch:()=>n(c),dispose:()=>{a(),i++}}}function K(e,t="Search heroes..."){let r=null;return u`
    <div class="search-box">
      <input
        type="text"
        class="search-input"
        placeholder=${t}
        oninput=${s=>{let i=s.target.value;r&&clearTimeout(r),r=setTimeout(()=>e(i),300)}}
      />
    </div>
  `}function Z(e,t){let r=e.biography.alignment,o=r==="good"?"badge-good":r==="bad"?"badge-bad":"badge-neutral";return u`
    <div class="hero-card" onclick=${t?()=>t(e):void 0}>
      <img class="hero-img" src=${e.images.md} alt=${e.name} />
      <div class="hero-info">
        <h3 class="hero-name">${e.name}</h3>
        <p class="hero-fullname">${e.biography.fullName||"Unknown"}</p>
        <span class="badge ${o}">${r}</span>
        <span class="hero-publisher">${e.biography.publisher}</span>
      </div>
    </div>
  `}function v(e,t){let r=t>=80?"#22c55e":t>=50?"#eab308":"#ef4444";return u`
    <div class="stat-bar">
      <span class="stat-label">${e}</span>
      <div class="stat-track">
        <div class="stat-fill" style=${{width:`${t}%`,backgroundColor:r}}></div>
      </div>
      <span class="stat-value">${String(t)}</span>
    </div>
  `}function G(e,t){let r=e.powerstats;return u`
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
        ${v("Intelligence",r.intelligence)}
        ${v("Strength",r.strength)}
        ${v("Speed",r.speed)}
        ${v("Durability",r.durability)}
        ${v("Power",r.power)}
        ${v("Combat",r.combat)}
      </div>
    </div>
  `}function J(e="Loading..."){return u`
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
  `}var be="https://akabab.github.io/superhero-api/api";async function ee(){let e=await fetch(`${be}/all.json`);if(!e.ok)throw new Error(`Failed to fetch heroes: ${e.status}`);return e.json()}function xe(){let e=h(""),t=h(null),r=j(()=>"all",()=>ee()),o=()=>{let c=r.data();if(!c)return[];let a=e().toLowerCase();return a?c.filter(f=>f.name.toLowerCase().includes(a)||f.biography.fullName.toLowerCase().includes(a)||f.biography.publisher.toLowerCase().includes(a)):c.slice(0,20)},s=c=>e.set(c),i=c=>t.set(c),n=()=>t.set(null);return u`
    <div class="hero-app">
      <header class="hero-header">
        <h1>Superhero Database</h1>
        <p>Powered by onefold — fine-grained reactive signals, real DOM, zero dependencies</p>
      </header>

      ${()=>{let c=t();return c?G(c,n):r.loading()?J("Loading heroes from API..."):r.error()?Y("Failed to load heroes.",()=>r.refetch()):u`
          <div class="hero-list-view">
            ${K(s)}
            <div class="hero-grid">
              ${()=>{let a=o();return a.length===0?u`<p class="no-results">No heroes found matching your search.</p>`:a.map(f=>Z(f,i))}}
            </div>
          </div>
        `}}
    </div>
  `}I(xe(),document.getElementById("app"));
