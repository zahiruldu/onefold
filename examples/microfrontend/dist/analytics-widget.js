var D=null;function P(t,e){D?D(t,e):e()}var X=new Map;function j(t){return X.get(t)}var b=null,K=0,Q=new Set,C=class{constructor(e,n){this.deps=new Set,this.active=!0,this.fn=e,this.label=n}run(){if(!this.active)return;this.cleanup();let e=b;b=this;try{P(this.label,this.fn)}finally{b=e}}cleanup(){for(let e of this.deps)e.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},M=class{constructor(e){this.value=e,this.subscribers=new Set}get(){return b&&(this.subscribers.add(b),b.deps.add(this)),this.value}set(e){let n=typeof e=="function"?e(this.value):e;Object.is(n,this.value)||(this.value=n,this.notify())}peek(){return this.value}notify(){if(K>0)for(let e of this.subscribers)Q.add(e);else{let e=Array.from(this.subscribers);for(let n=0;n<e.length;n++)e[n].run()}}};function h(t){let e=new M(t),n=(()=>e.get());return n.set=i=>e.set(i),n.peek=()=>e.peek(),n}function y(t,e="effect"){let n=new C(t,e);return n.run(),()=>n.dispose()}var G=/^\s*(javascript|data|vbscript):/i,J=/^on/i;function T(t){return G.test(t)}function N(t){return J.test(t)}function _(t){let e=document.createElement("template");e.innerHTML=t;let n=i=>{let r=[];i.childNodes.forEach(s=>{if(s.nodeType===Node.ELEMENT_NODE){let o=s,c=o.tagName.toLowerCase();if(c==="script"||c==="style"||c==="iframe"||c==="object"||c==="embed"||c==="form"){r.push(s);return}Array.from(o.attributes).forEach(f=>{(N(f.name)||(f.name==="href"||f.name==="src")&&T(f.value))&&o.removeAttribute(f.name)}),n(o)}}),r.forEach(s=>s.remove())};return n(e.content),e.innerHTML}var w=null;function Y(){return w||(typeof window<"u"&&window.trustedTypes&&(w=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:t=>_(t)})),w)}function L(t){let e=Y();return e?e.createHTML(t):_(t)}function R(t){return typeof t=="object"&&t!==null&&t.__onefoldRaw===!0}var E=new WeakMap,O=null;function Z(){if(O||typeof MutationObserver>"u"||typeof document>"u")return;O=new MutationObserver(e=>{for(let n of e)n.removedNodes.forEach(W)});let t=document.documentElement??document;O.observe(t,{childList:!0,subtree:!0})}function W(t){let e=E.get(t);if(e){for(let n of e)try{n()}catch(i){console.error("[onefold] Error while disposing a reactive binding:",i)}E.delete(t)}t.childNodes.forEach(W)}function $(t,e){Z();let n=E.get(t);n||(n=new Set,E.set(t,n)),n.add(e)}var g="\0nf_",x=/\x00nf_(\d+)\x00/g;function tt(t){return`${g}${t}\0`}function u(t,e){return t.charAt(e)}function H(t){return parseInt(t[1]??"0",10)}function et(t,e){let n="";for(let o=0;o<t.length;o++)n+=t[o],o<e.length&&(n+=tt(o));let i=[],r=0,s=n.length;for(;r<s;){if(u(n,r)==="<"){if(n.startsWith("<!--",r)){let m=n.indexOf("-->",r+4);r=m===-1?s:m+3;continue}if(u(n,r+1)==="/"){let m=n.indexOf(">",r),A=n.slice(r+2,m).trim();i.push({kind:1,tag:A}),r=m+1;continue}let f=nt(n,r),l=u(n,f-1)==="/",a=n.slice(r+1,l?f-1:f),{tag:d,attrs:p}=rt(a,e);i.push({kind:0,tag:d});for(let m of p)i.push(m);l&&i.push({kind:1,tag:d}),r=f+1;continue}let o=n.indexOf("<",r),c=o===-1?n.slice(r):n.slice(r,o);if(r=o===-1?s:o,c.trim()||x.test(c)){x.lastIndex=0;let f=0,l;for(;(l=x.exec(c))!==null;){let d=c.slice(f,l.index);d&&i.push({kind:3,value:d}),i.push({kind:4,value:e[H(l)]}),f=l.index+l[0].length}let a=c.slice(f);a&&a.trim()&&i.push({kind:3,value:a})}}return i}function nt(t,e){let n=null;for(let i=e+1;i<t.length;i++){let r=u(t,i);if(n)r===n&&(n=null);else if(r==='"'||r==="'")n=r;else if(r===">")return i}return t.length-1}function v(t){return t===" "||t==="	"||t===`
`||t==="\r"||t==="\f"}function rt(t,e){let n=t.search(/[\s/]/),i=n===-1?t:t.slice(0,n),r=[];if(n===-1)return{tag:i,attrs:r};let s=t.slice(n).trim();if(!s)return{tag:i,attrs:r};let o=0,c=s.length;for(;o<c;){for(;o<c&&v(u(s,o));)o++;if(o>=c)break;if(s.startsWith(g,o)){let a=s.indexOf("\0",o+g.length),d=parseInt(s.slice(o+g.length,a),10),p=e[d];if(p&&typeof p=="object")for(let[m,A]of Object.entries(p))r.push({kind:2,name:m,value:A});o=a+1;continue}let f=o;for(;o<c&&u(s,o)!=="="&&!v(u(s,o));)o++;let l=s.slice(f,o);if(!l){o++;continue}for(;o<c&&v(u(s,o));)o++;if(o>=c||u(s,o)!=="="){r.push({kind:2,name:l,value:!0});continue}for(o++;o<c&&v(u(s,o));)o++;if(s.startsWith(g,o)){let a=s.indexOf("\0",o+g.length),d=parseInt(s.slice(o+g.length,a),10);r.push({kind:2,name:l,value:e[d]}),o=a+1}else if(u(s,o)==='"'||u(s,o)==="'"){let a=u(s,o);o++;let d=o;for(;o<c&&u(s,o)!==a;)o++;let p=s.slice(d,o);o++,r.push({kind:2,name:l,value:z(p,e)})}else{let a=o;for(;o<c&&!v(u(s,o));)o++;let d=s.slice(a,o);r.push({kind:2,name:l,value:z(d,e)})}}return{tag:i,attrs:r}}function z(t,e){x.lastIndex=0;let n=x.exec(t);if(!n)return t;if(n.index===0&&n[0].length===t.length)return e[H(n)];x.lastIndex=0;let i=[],r=0,s;for(;(s=x.exec(t))!==null;){s.index>r&&i.push(t.slice(r,s.index));let o=e[H(s)];i.push(typeof o=="function"?o:()=>o),r=s.index+s[0].length}return r<t.length&&i.push(t.slice(r)),()=>i.map(o=>typeof o=="function"?o():o).join("")}function ot(t){let e=document.createDocumentFragment(),n=[e],i=e;for(let r of t)switch(r.kind){case 0:{let s=document.createElement(r.tag);i.appendChild(s),n.push(s),i=s;break}case 1:{n.pop(),i=n.length>0?n[n.length-1]:e;break}case 2:{it(i,r.name,r.value);break}case 3:{i.appendChild(document.createTextNode(r.value));break}case 4:{F(i,r.value);break}}return e.childNodes.length===1&&e.firstChild instanceof HTMLElement?e.firstChild:e}function it(t,e,n){if(e==="ref"){typeof n=="function"&&n(t);return}if(e==="class"){S(n,i=>st(t,i),t);return}if(e==="style"){S(n,i=>Object.assign(t.style,i??{}),t);return}if(N(e)&&typeof n=="function"){t.addEventListener(e.slice(2).toLowerCase(),n);return}if(e.startsWith("d-")){let i=j(e.slice(2));i?S(n,r=>i(t,r),t):console.warn(`[onefold] No directive registered for "${e}". Call registerDirective() first.`);return}S(n,i=>ct(t,e,i),t)}function S(t,e,n){if(typeof t=="function"){let i=y(()=>e(t()));$(n,i)}else e(t)}function st(t,e){e?typeof e=="string"?t.className=e:typeof e=="object"&&(t.className=Object.entries(e).filter(([,n])=>n).map(([n])=>n).join(" ")):t.className=""}function ct(t,e,n){if(n===!1||n==null){t.removeAttribute(e);return}if(n===!0){t.setAttribute(e,"");return}let i=String(n);if((e==="href"||e==="src"||e==="action"||e==="formaction")&&T(i)){console.warn(`[onefold] Blocked unsafe "${e}" value:`,i),t.removeAttribute(e);return}t.setAttribute(e,i)}function F(t,e){if(!(e==null||e===!1||e===!0)){if(e instanceof Node){t.appendChild(e);return}if(Array.isArray(e)){for(let n of e)F(t,n);return}if(typeof e=="function"){let n=document.createComment("expr-start"),i=document.createComment("expr-end");t.appendChild(n),t.appendChild(i);let r=y(()=>{let s=e(),o=n.parentNode;if(!o)return;let c=n.nextSibling;for(;c&&c!==i;){let l=c.nextSibling;o.removeChild(c),c=l}let f=B(s);o.insertBefore(f,i)});$(t,r);return}if(R(e)){let n=document.createElement("span");n.innerHTML=L(e.html),t.appendChild(n);return}t.appendChild(document.createTextNode(String(e)))}}function B(t){if(t==null||t===!1||t===!0)return document.createComment("");if(t instanceof Node)return t;if(R(t)){let e=document.createElement("span");return e.innerHTML=L(t.html),e}if(Array.isArray(t)){let e=document.createDocumentFragment();for(let n of t)e.appendChild(B(n));return e}return document.createTextNode(String(t))}function k(t,...e){let n=et(t,e);return ot(n)}var at=0,U=new Map;function ft(){return`nf-${(at++).toString(36)}`}function q(t,e){let n=`.${e}`,i="",r=0,s=t.length;for(;r<s;){for(;r<s&&/\s/.test(t[r]);)i+=t[r],r++;if(r>=s)break;if(t[r]==="@"){let a=r;for(;r<s&&t[r]!=="{";)r++;i+=t.slice(a,r),r<s&&(i+=t[r],r++);let d=V(t,r-1),p=d.slice(1,-1);i+=q(p,e),i+="}",r+=d.length-1;continue}let o=r;for(;r<s&&t[r]!=="{";)r++;let c=t.slice(o,r).trim();if(!c||r>=s)break;let f=c.split(",").map(a=>(a=a.trim(),a&&(a===":root"||a===":host"?n:a.startsWith("&")?n+a.slice(1):`${n} ${a}`))).join(", ");i+=f;let l=V(t,r);i+=l,r+=l.length}return i}function V(t,e){if(t[e]!=="{")return"";let n=0,i=e;for(;i<t.length;){if(t[i]==="{")n++;else if(t[i]==="}"&&(n--,n===0))return t.slice(e,i+1);i++}return t.slice(e)}function lt(t,e){if(typeof document>"u"||document.getElementById(e))return;let n=document.createElement("style");n.id=e,n.textContent=t,document.head.appendChild(n)}function I(t,...e){let n="";for(let c=0;c<t.length;c++)n+=t[c],c<e.length&&(n+=String(e[c]));let i=U.get(n);if(i)return i;let r=ft(),s=q(n,r);lt(s,`style-${r}`);let o={scope:r,css:s};return U.set(n,o),o}var dt=I`
  .analytics-widget {
    font-family: -apple-system, sans-serif;
  }
  .analytics-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .analytics-header h3 { margin: 0; font-size: 16px; }
  .live-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .stat-card {
    background: #f9fafb;
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .stat-label {
    font-size: 12px;
    color: #6b7280;
  }
  .stat-up { color: #16a34a; }
  .stat-down { color: #dc2626; }
  .chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 80px;
    padding: 8px 0;
  }
  .chart-bar {
    flex: 1;
    background: #6366f1;
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease;
    min-height: 4px;
  }
  .chart-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 4px;
  }
`;function ut(t){let e=h(1247),n=h(3891),i=h(32),r=h(185),s=h([35,52,41,67,45,78,62,55,71,48,83,59]),o=setInterval(()=>{e.set(c=>c+Math.floor(Math.random()*10)-3),n.set(c=>c+Math.floor(Math.random()*15)),i.set(()=>Math.floor(Math.random()*15)+25),r.set(()=>Math.floor(Math.random()*60)+150),s.set(c=>[...c.slice(1),Math.floor(Math.random()*60)+30])},2e3);return typeof MutationObserver<"u"&&setTimeout(()=>{let c=document.querySelector('[data-remote*="analytics"]');if(c){let f=new MutationObserver(()=>{c.isConnected||(clearInterval(o),f.disconnect())});c.parentNode&&f.observe(c.parentNode,{childList:!0})}},0),k`
    <div class=${dt.scope}>
      <div class="analytics-widget">
        <div class="analytics-header">
          <h3>Analytics${t.dashboardId?` \u2014 ${t.dashboardId}`:""}</h3>
          <span><span class="live-dot"></span>Live</span>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value stat-up">${()=>e().toLocaleString()}</div>
            <div class="stat-label">Active Visitors</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${()=>n().toLocaleString()}</div>
            <div class="stat-label">Page Views</div>
          </div>
          <div class="stat-card">
            <div class="stat-value stat-down">${()=>`${i()}%`}</div>
            <div class="stat-label">Bounce Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${()=>`${Math.floor(r()/60)}:${String(r()%60).padStart(2,"0")}`}</div>
            <div class="stat-label">Avg Duration</div>
          </div>
        </div>

        <div class="chart">
          ${()=>s().map(c=>k`
            <div class="chart-bar" style=${{height:`${c}%`}}></div>
          `)}
        </div>
        <div class="chart-label">
          <span>12 intervals ago</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  `}export{ut as default};
