var j=null;function B(e,t){j?j(e,t):t()}var Y=new Map;function _(e){return Y.get(e)}var w=null,Z=0,ee=new Set,$=class{constructor(t,r){this.deps=new Set,this.active=!0,this.fn=t,this.label=r}run(){if(!this.active)return;this.cleanup();let t=w;w=this;try{B(this.label,this.fn)}finally{w=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},A=class{constructor(t){this.value=t,this.subscribers=new Set}get(){return w&&(this.subscribers.add(w),w.deps.add(this)),this.value}set(t){let r=typeof t=="function"?t(this.value):t;Object.is(r,this.value)||(this.value=r,this.notify())}peek(){return this.value}notify(){if(Z>0)for(let t of this.subscribers)ee.add(t);else{let t=Array.from(this.subscribers);for(let r=0;r<t.length;r++)t[r].run()}}};function h(e){let t=new A(e),r=(()=>t.get());return r.set=o=>t.set(o),r.peek=()=>t.peek(),r}function v(e,t="effect"){let r=new $(e,t);return r.run(),()=>r.dispose()}var te=/^\s*(javascript|data|vbscript):/i,re=/^on/i;function N(e){return te.test(e)}function T(e){return re.test(e)}function F(e){let t=document.createElement("template");t.innerHTML=e;let r=o=>{let s=[];o.childNodes.forEach(i=>{if(i.nodeType===Node.ELEMENT_NODE){let n=i,c=n.tagName.toLowerCase();if(c==="script"||c==="style"||c==="iframe"||c==="object"||c==="embed"||c==="form"){s.push(i);return}Array.from(n.attributes).forEach(a=>{(T(a.name)||(a.name==="href"||a.name==="src")&&N(a.value))&&n.removeAttribute(a.name)}),r(n)}}),s.forEach(i=>i.remove())};return r(t.content),t.innerHTML}var k=null;function ne(){return k||(typeof window<"u"&&window.trustedTypes&&(k=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>F(e)})),k)}function L(e){let t=ne();return t?t.createHTML(e):F(e)}function R(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function I(e,t){t.textContent="",t.appendChild(e)}var C=new WeakMap,P=null;function oe(){if(P||typeof MutationObserver>"u"||typeof document>"u")return;P=new MutationObserver(t=>{for(let r of t)r.removedNodes.forEach(W)});let e=document.documentElement??document;P.observe(e,{childList:!0,subtree:!0})}function W(e){let t=C.get(e);if(t){for(let r of t)try{r()}catch(o){console.error("[onefold] Error while disposing a reactive binding:",o)}C.delete(e)}e.childNodes.forEach(W)}function O(e,t){oe();let r=C.get(e);r||(r=new Set,C.set(e,r)),r.add(t)}var b="\0nf_",x=/\x00nf_(\d+)\x00/g;function se(e){return`${b}${e}\0`}function d(e,t){return e.charAt(t)}function D(e){return parseInt(e[1]??"0",10)}function ie(e,t){let r="";for(let n=0;n<e.length;n++)r+=e[n],n<t.length&&(r+=se(n));let o=[],s=0,i=r.length;for(;s<i;){if(d(r,s)==="<"){if(r.startsWith("<!--",s)){let m=r.indexOf("-->",s+4);s=m===-1?i:m+3;continue}if(d(r,s+1)==="/"){let m=r.indexOf(">",s),S=r.slice(s+2,m).trim();o.push({kind:1,tag:S}),s=m+1;continue}let a=ce(r,s),l=d(r,a-1)==="/",f=r.slice(s+1,l?a-1:a),{tag:p,attrs:g}=ae(f,t);o.push({kind:0,tag:p});for(let m of g)o.push(m);l&&o.push({kind:1,tag:p}),s=a+1;continue}let n=r.indexOf("<",s),c=n===-1?r.slice(s):r.slice(s,n);if(s=n===-1?i:n,c.trim()||x.test(c)){x.lastIndex=0;let a=0,l;for(;(l=x.exec(c))!==null;){let p=c.slice(a,l.index);p&&o.push({kind:3,value:p}),o.push({kind:4,value:t[D(l)]}),a=l.index+l[0].length}let f=c.slice(a);f&&f.trim()&&o.push({kind:3,value:f})}}return o}function ce(e,t){let r=null;for(let o=t+1;o<e.length;o++){let s=d(e,o);if(r)s===r&&(r=null);else if(s==='"'||s==="'")r=s;else if(s===">")return o}return e.length-1}function E(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function ae(e,t){let r=e.search(/[\s/]/),o=r===-1?e:e.slice(0,r),s=[];if(r===-1)return{tag:o,attrs:s};let i=e.slice(r).trim();if(!i)return{tag:o,attrs:s};let n=0,c=i.length;for(;n<c;){for(;n<c&&E(d(i,n));)n++;if(n>=c)break;if(i.startsWith(b,n)){let f=i.indexOf("\0",n+b.length),p=parseInt(i.slice(n+b.length,f),10),g=t[p];if(g&&typeof g=="object")for(let[m,S]of Object.entries(g))s.push({kind:2,name:m,value:S});n=f+1;continue}let a=n;for(;n<c&&d(i,n)!=="="&&!E(d(i,n));)n++;let l=i.slice(a,n);if(!l){n++;continue}for(;n<c&&E(d(i,n));)n++;if(n>=c||d(i,n)!=="="){s.push({kind:2,name:l,value:!0});continue}for(n++;n<c&&E(d(i,n));)n++;if(i.startsWith(b,n)){let f=i.indexOf("\0",n+b.length),p=parseInt(i.slice(n+b.length,f),10);s.push({kind:2,name:l,value:t[p]}),n=f+1}else if(d(i,n)==='"'||d(i,n)==="'"){let f=d(i,n);n++;let p=n;for(;n<c&&d(i,n)!==f;)n++;let g=i.slice(p,n);n++,s.push({kind:2,name:l,value:U(g,t)})}else{let f=n;for(;n<c&&!E(d(i,n));)n++;let p=i.slice(f,n);s.push({kind:2,name:l,value:U(p,t)})}}return{tag:o,attrs:s}}function U(e,t){x.lastIndex=0;let r=x.exec(e);if(!r)return e;if(r.index===0&&r[0].length===e.length)return t[D(r)];x.lastIndex=0;let o=[],s=0,i;for(;(i=x.exec(e))!==null;){i.index>s&&o.push(e.slice(s,i.index));let n=t[D(i)];o.push(typeof n=="function"?n:()=>n),s=i.index+i[0].length}return s<e.length&&o.push(e.slice(s)),()=>o.map(n=>typeof n=="function"?n():n).join("")}function le(e){let t=document.createDocumentFragment(),r=[t],o=t;for(let s of e)switch(s.kind){case 0:{let i=document.createElement(s.tag);o.appendChild(i),r.push(i),o=i;break}case 1:{r.pop(),o=r.length>0?r[r.length-1]:t;break}case 2:{fe(o,s.name,s.value);break}case 3:{o.appendChild(document.createTextNode(s.value));break}case 4:{z(o,s.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function fe(e,t,r){if(t==="ref"){typeof r=="function"&&r(e);return}if(t==="class"){H(r,o=>ue(e,o),e);return}if(t==="style"){H(r,o=>Object.assign(e.style,o??{}),e);return}if(T(t)&&typeof r=="function"){e.addEventListener(t.slice(2).toLowerCase(),r);return}if(t.startsWith("d-")){let o=_(t.slice(2));o?H(r,s=>o(e,s),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}H(r,o=>pe(e,t,o),e)}function H(e,t,r){if(typeof e=="function"){let o=v(()=>t(e()));O(r,o)}else t(e)}function ue(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,r])=>r).map(([r])=>r).join(" ")):e.className=""}function pe(e,t,r){if(r===!1||r==null){e.removeAttribute(t);return}if(r===!0){e.setAttribute(t,"");return}let o=String(r);if((t==="href"||t==="src"||t==="action"||t==="formaction")&&N(o)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,o),e.removeAttribute(t);return}e.setAttribute(t,o)}function z(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let r of t)z(e,r);return}if(typeof t=="function"){let r=document.createComment("expr-start"),o=document.createComment("expr-end");e.appendChild(r),e.appendChild(o);let s=v(()=>{let i=t(),n=r.parentNode;if(!n)return;let c=r.nextSibling;for(;c&&c!==o;){let l=c.nextSibling;n.removeChild(c),c=l}let a=q(i);n.insertBefore(a,o)});O(e,s);return}if(R(t)){let r=document.createElement("span");r.innerHTML=L(t.html),e.appendChild(r);return}e.appendChild(document.createTextNode(String(t)))}}function q(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(R(e)){let t=document.createElement("span");return t.innerHTML=L(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let r of e)t.appendChild(q(r));return t}return document.createTextNode(String(e))}function u(e,...t){let r=ie(e,t);return le(r)}function M(e,t){let r=h(void 0),o=h(!1),s=h(void 0),i=0,n=l=>{let f=++i;o.set(!0),s.set(void 0),t(l).then(p=>{f===i&&(r.set(p),o.set(!1))}).catch(p=>{f===i&&(s.set(p),o.set(!1))})},c,a=v(()=>{let l=e();c=l,n(l)});return{data:r,loading:o,error:s,refetch:()=>n(c),dispose:()=>{a(),i++}}}function Q(e,t="Search heroes..."){let r=null;return u`
    <div class="search-box">
      <input
        type="text"
        class="search-input"
        placeholder=${t}
        oninput=${s=>{let i=s.target.value;r&&clearTimeout(r),r=setTimeout(()=>e(i),300)}}
      />
    </div>
  `}function X(e,t){let r=e.biography.alignment,o=r==="good"?"badge-good":r==="bad"?"badge-bad":"badge-neutral";return u`
    <div class="hero-card" onclick=${t?()=>t(e):void 0}>
      <img class="hero-img" src=${e.images.md} alt=${e.name} />
      <div class="hero-info">
        <h3 class="hero-name">${e.name}</h3>
        <p class="hero-fullname">${e.biography.fullName||"Unknown"}</p>
        <span class="badge ${o}">${r}</span>
        <span class="hero-publisher">${e.biography.publisher}</span>
      </div>
    </div>
  `}function y(e,t){let r=t>=80?"#22c55e":t>=50?"#eab308":"#ef4444";return u`
    <div class="stat-bar">
      <span class="stat-label">${e}</span>
      <div class="stat-track">
        <div class="stat-fill" style=${{width:`${t}%`,backgroundColor:r}}></div>
      </div>
      <span class="stat-value">${String(t)}</span>
    </div>
  `}function K(e,t){let r=e.powerstats;return u`
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
        ${y("Intelligence",r.intelligence)}
        ${y("Strength",r.strength)}
        ${y("Speed",r.speed)}
        ${y("Durability",r.durability)}
        ${y("Power",r.power)}
        ${y("Combat",r.combat)}
      </div>
    </div>
  `}function V(e="Loading..."){return u`
    <div class="spinner">
      <div class="spinner-ring"></div>
      <span>${e}</span>
    </div>
  `}function G(e,t){return u`
    <div class="error-box">
      <span class="error-icon">⚠</span>
      <p>${e}</p>
      ${t?u`<button class="btn btn-sm" onclick=${t}>Retry</button>`:null}
    </div>
  `}var de="https://akabab.github.io/superhero-api/api";async function J(){let e=await fetch(`${de}/all.json`);if(!e.ok)throw new Error(`Failed to fetch heroes: ${e.status}`);return e.json()}function me(){let e=h(""),t=h(null),r=M(()=>"all",()=>J()),o=()=>{let c=r.data();if(!c)return[];let a=e().toLowerCase();return a?c.filter(l=>l.name.toLowerCase().includes(a)||l.biography.fullName.toLowerCase().includes(a)||l.biography.publisher.toLowerCase().includes(a)):c.slice(0,20)},s=c=>e.set(c),i=c=>t.set(c),n=()=>t.set(null);return u`
    <div class="hero-app">
      <header class="hero-header">
        <h1>Superhero Database</h1>
        <p>Powered by onefold — fine-grained reactive signals, real DOM, zero dependencies</p>
      </header>

      ${()=>{let c=t();return c?K(c,n):r.loading()?V("Loading heroes from API..."):r.error()?G("Failed to load heroes.",()=>r.refetch()):u`
          <div class="hero-list-view">
            ${Q(s)}
            <div class="hero-grid">
              ${()=>{let a=o();return a.length===0?u`<p class="no-results">No heroes found matching your search.</p>`:a.map(l=>X(l,i))}}
            </div>
          </div>
        `}}
    </div>
  `}I(me(),document.getElementById("app"));
