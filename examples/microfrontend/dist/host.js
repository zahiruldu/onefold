var B=null;function U(e,t){B?B(e,t):t()}var ne=new Map;function _(e){return ne.get(e)}var x=null,re=0,ie=new Set,I=class{constructor(t,o){this.deps=new Set,this.active=!0,this.fn=t,this.label=o}run(){if(!this.active)return;this.cleanup();let t=x;x=this;try{U(this.label,this.fn)}finally{x=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},L=class{constructor(t){this.value=t,this.subscribers=new Set}get(){return x&&(this.subscribers.add(x),x.deps.add(this)),this.value}set(t){let o=typeof t=="function"?t(this.value):t;Object.is(o,this.value)||(this.value=o,this.notify())}peek(){return this.value}notify(){if(re>0)for(let t of this.subscribers)ie.add(t);else{let t=Array.from(this.subscribers);for(let o=0;o<t.length;o++)t[o].run()}}};function E(e){let t=new L(e),o=(()=>t.get());return o.set=i=>t.set(i),o.peek=()=>t.peek(),o}function k(e,t="effect"){let o=new I(e,t);return o.run(),()=>o.dispose()}var se=/^\s*(javascript|data|vbscript):/i,ce=/^on/i;function H(e){return se.test(e)}function N(e){return ce.test(e)}function q(e){let t=document.createElement("template");t.innerHTML=e;let o=i=>{let n=[];i.childNodes.forEach(s=>{if(s.nodeType===Node.ELEMENT_NODE){let r=s,c=r.tagName.toLowerCase();if(c==="script"||c==="style"||c==="iframe"||c==="object"||c==="embed"||c==="form"){n.push(s);return}Array.from(r.attributes).forEach(d=>{(N(d.name)||(d.name==="href"||d.name==="src")&&H(d.value))&&r.removeAttribute(d.name)}),o(r)}}),n.forEach(s=>s.remove())};return o(t.content),t.innerHTML}var C=null;function ae(){return C||(typeof window<"u"&&window.trustedTypes&&(C=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>q(e)})),C)}function O(e){let t=ae();return t?t.createHTML(e):q(e)}function M(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function j(e,t){t.textContent="",t.appendChild(e)}var S=new WeakMap,D=null;function le(){if(D||typeof MutationObserver>"u"||typeof document>"u")return;D=new MutationObserver(t=>{for(let o of t)o.removedNodes.forEach(J)});let e=document.documentElement??document;D.observe(e,{childList:!0,subtree:!0})}function J(e){let t=S.get(e);if(t){for(let o of t)try{o()}catch(i){console.error("[onefold] Error while disposing a reactive binding:",i)}S.delete(e)}e.childNodes.forEach(J)}function P(e,t){le();let o=S.get(e);o||(o=new Set,S.set(e,o)),o.add(t)}var h="\0nf_",g=/\x00nf_(\d+)\x00/g;function de(e){return`${h}${e}\0`}function p(e,t){return e.charAt(t)}function z(e){return parseInt(e[1]??"0",10)}function fe(e,t){let o="";for(let r=0;r<e.length;r++)o+=e[r],r<t.length&&(o+=de(r));let i=[],n=0,s=o.length;for(;n<s;){if(p(o,n)==="<"){if(o.startsWith("<!--",n)){let m=o.indexOf("-->",n+4);n=m===-1?s:m+3;continue}if(p(o,n+1)==="/"){let m=o.indexOf(">",n),v=o.slice(n+2,m).trim();i.push({kind:1,tag:v}),n=m+1;continue}let d=pe(o,n),f=p(o,d-1)==="/",a=o.slice(n+1,f?d-1:d),{tag:l,attrs:u}=ue(a,t);i.push({kind:0,tag:l});for(let m of u)i.push(m);f&&i.push({kind:1,tag:l}),n=d+1;continue}let r=o.indexOf("<",n),c=r===-1?o.slice(n):o.slice(n,r);if(n=r===-1?s:r,c.trim()||g.test(c)){g.lastIndex=0;let d=0,f;for(;(f=g.exec(c))!==null;){let l=c.slice(d,f.index);l&&i.push({kind:3,value:l}),i.push({kind:4,value:t[z(f)]}),d=f.index+f[0].length}let a=c.slice(d);a&&a.trim()&&i.push({kind:3,value:a})}}return i}function pe(e,t){let o=null;for(let i=t+1;i<e.length;i++){let n=p(e,i);if(o)n===o&&(o=null);else if(n==='"'||n==="'")o=n;else if(n===">")return i}return e.length-1}function b(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function ue(e,t){let o=e.search(/[\s/]/),i=o===-1?e:e.slice(0,o),n=[];if(o===-1)return{tag:i,attrs:n};let s=e.slice(o).trim();if(!s)return{tag:i,attrs:n};let r=0,c=s.length;for(;r<c;){for(;r<c&&b(p(s,r));)r++;if(r>=c)break;if(s.startsWith(h,r)){let a=s.indexOf("\0",r+h.length),l=parseInt(s.slice(r+h.length,a),10),u=t[l];if(u&&typeof u=="object")for(let[m,v]of Object.entries(u))n.push({kind:2,name:m,value:v});r=a+1;continue}let d=r;for(;r<c&&p(s,r)!=="="&&!b(p(s,r));)r++;let f=s.slice(d,r);if(!f){r++;continue}for(;r<c&&b(p(s,r));)r++;if(r>=c||p(s,r)!=="="){n.push({kind:2,name:f,value:!0});continue}for(r++;r<c&&b(p(s,r));)r++;if(s.startsWith(h,r)){let a=s.indexOf("\0",r+h.length),l=parseInt(s.slice(r+h.length,a),10);n.push({kind:2,name:f,value:t[l]}),r=a+1}else if(p(s,r)==='"'||p(s,r)==="'"){let a=p(s,r);r++;let l=r;for(;r<c&&p(s,r)!==a;)r++;let u=s.slice(l,r);r++,n.push({kind:2,name:f,value:K(u,t)})}else{let a=r;for(;r<c&&!b(p(s,r));)r++;let l=s.slice(a,r);n.push({kind:2,name:f,value:K(l,t)})}}return{tag:i,attrs:n}}function K(e,t){g.lastIndex=0;let o=g.exec(e);if(!o)return e;if(o.index===0&&o[0].length===e.length)return t[z(o)];g.lastIndex=0;let i=[],n=0,s;for(;(s=g.exec(e))!==null;){s.index>n&&i.push(e.slice(n,s.index));let r=t[z(s)];i.push(typeof r=="function"?r:()=>r),n=s.index+s[0].length}return n<e.length&&i.push(e.slice(n)),()=>i.map(r=>typeof r=="function"?r():r).join("")}function me(e){let t=document.createDocumentFragment(),o=[t],i=t;for(let n of e)switch(n.kind){case 0:{let s=document.createElement(n.tag);i.appendChild(s),o.push(s),i=s;break}case 1:{o.pop(),i=o.length>0?o[o.length-1]:t;break}case 2:{he(i,n.name,n.value);break}case 3:{i.appendChild(document.createTextNode(n.value));break}case 4:{V(i,n.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function he(e,t,o){if(t==="ref"){typeof o=="function"&&o(e);return}if(t==="class"){A(o,i=>ge(e,i),e);return}if(t==="style"){A(o,i=>Object.assign(e.style,i??{}),e);return}if(N(t)&&typeof o=="function"){e.addEventListener(t.slice(2).toLowerCase(),o);return}if(t.startsWith("d-")){let i=_(t.slice(2));i?A(o,n=>i(e,n),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}A(o,i=>xe(e,t,i),e)}function A(e,t,o){if(typeof e=="function"){let i=k(()=>t(e()));P(o,i)}else t(e)}function ge(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,o])=>o).map(([o])=>o).join(" ")):e.className=""}function xe(e,t,o){if(o===!1||o==null){e.removeAttribute(t);return}if(o===!0){e.setAttribute(t,"");return}let i=String(o);if((t==="href"||t==="src"||t==="action"||t==="formaction")&&H(i)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,i),e.removeAttribute(t);return}e.setAttribute(t,i)}function V(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let o of t)V(e,o);return}if(typeof t=="function"){let o=document.createComment("expr-start"),i=document.createComment("expr-end");e.appendChild(o),e.appendChild(i);let n=k(()=>{let s=t(),r=o.parentNode;if(!r)return;let c=o.nextSibling;for(;c&&c!==i;){let f=c.nextSibling;r.removeChild(c),c=f}let d=X(s);r.insertBefore(d,i)});P(e,n);return}if(M(t)){let o=document.createElement("span");o.innerHTML=O(t.html),e.appendChild(o);return}e.appendChild(document.createTextNode(String(t)))}}function X(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(M(e)){let t=document.createElement("span");return t.innerHTML=O(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let o of e)t.appendChild(X(o));return t}return document.createTextNode(String(e))}function y(e,...t){let o=fe(e,t);return me(o)}var be=0,Q=new Map;function ye(){return`nf-${(be++).toString(36)}`}function G(e,t){let o=`.${t}`,i="",n=0,s=e.length;for(;n<s;){for(;n<s&&/\s/.test(e[n]);)i+=e[n],n++;if(n>=s)break;if(e[n]==="@"){let a=n;for(;n<s&&e[n]!=="{";)n++;i+=e.slice(a,n),n<s&&(i+=e[n],n++);let l=Y(e,n-1),u=l.slice(1,-1);i+=G(u,t),i+="}",n+=l.length-1;continue}let r=n;for(;n<s&&e[n]!=="{";)n++;let c=e.slice(r,n).trim();if(!c||n>=s)break;let d=c.split(",").map(a=>(a=a.trim(),a&&(a===":root"||a===":host"?o:a.startsWith("&")?o+a.slice(1):`${o} ${a}`))).join(", ");i+=d;let f=Y(e,n);i+=f,n+=f.length}return i}function Y(e,t){if(e[t]!=="{")return"";let o=0,i=t;for(;i<e.length;){if(e[i]==="{")o++;else if(e[i]==="}"&&(o--,o===0))return e.slice(t,i+1);i++}return e.slice(t)}function we(e,t){if(typeof document>"u"||document.getElementById(t))return;let o=document.createElement("style");o.id=t,o.textContent=e,document.head.appendChild(o)}function F(e,...t){let o="";for(let c=0;c<e.length;c++)o+=e[c],c<t.length&&(o+=String(t[c]));let i=Q.get(o);if(i)return i;let n=ye(),s=G(o,n);we(s,`style-${n}`);let r={scope:n,css:s};return Q.set(o,r),r}var w={};function Z(e){let t=w.trustedOrigins;if(!t||t.length===0)return;let o;try{o=new URL(e).origin}catch{throw new Error(`[onefold:security] Invalid remote URL: ${e}`)}if(!t.includes(o))throw new Error(`[onefold:security] Blocked untrusted origin "${o}". Trusted origins: ${t.join(", ")}. Add it to configureSecurity({ trustedOrigins: [...] }) if this is intentional.`)}async function ve(e,t,o){let i=new AbortController,n=o??w.timeout??1e4,s=setTimeout(()=>i.abort(),n);try{let r=await fetch(e,{signal:i.signal,credentials:"omit",mode:"cors"});if(!r.ok)throw new Error(`HTTP ${r.status}: ${r.statusText}`);let c=await r.text();if(t&&!await Ee(c,t))throw new Error(`[onefold:security] Integrity check FAILED for "${e}". The remote code has been tampered with or the hash is outdated.`);return c}finally{clearTimeout(s)}}async function Ee(e,t){let o=/^(sha256|sha384|sha512)-(.+)$/.exec(t);if(!o)return!1;let i=o[1],n=o[2],r=new TextEncoder().encode(e),c=i==="sha256"?"SHA-256":i==="sha384"?"SHA-384":"SHA-512",d=await crypto.subtle.digest(c,r),f=new Uint8Array(d);return btoa(String.fromCharCode(...f))===n}var W=new Map;async function ee(e,t,o){let i=`${e}#${t??"no-sri"}`;if(W.has(i))return W.get(i);let n=(async()=>{if(t||w.requireIntegrity){if(w.requireIntegrity&&!t)throw new Error(`[onefold:security] Integrity hash required for "${e}". Provide an integrity option or disable requireIntegrity.`);let s=await ve(e,t,o),r=new Blob([s],{type:"text/javascript"}),c=URL.createObjectURL(r);try{return await import(c)}finally{URL.revokeObjectURL(c)}}else return await import(e)})();return W.set(i,n),n}function ke(e,t,o,i){let n=document.createElement("iframe"),s=["allow-scripts"];o.includes("navigation")&&s.push("allow-top-navigation-by-user-activation"),n.setAttribute("sandbox",s.join(" ")),n.style.border="none",n.style.width="100%",n.style.height="100%",n.style.minHeight="200px";let r=e.replace(/['\\<]/g,l=>l==="'"?"%27":l==="\\"?"%5C":"&lt;"),c=JSON.stringify(i??{}).replace(/</g,"\\u003c"),d=`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;box-sizing:border-box;font-family:-apple-system,sans-serif;}</style>
</head><body>
<div id="root"></div>
<script type="module">
  import widget from '${r}';
  const props = ${c};
  const node = widget(props);
  document.getElementById('root').appendChild(node);

  // Auto-resize iframe to content height
  new ResizeObserver(() => {
    window.parent.postMessage({
      type: 'nf-resize',
      url: '${r}',
      height: document.body.scrollHeight
    }, '*');
  }).observe(document.body);
<\/script>
</body></html>`;n.srcdoc=d,t.appendChild(n);let f=l=>{l.data?.type==="nf-resize"&&l.data.url===e&&(n.style.height=`${l.data.height}px`)};window.addEventListener("message",f);let a=new MutationObserver(()=>{t.isConnected||(window.removeEventListener("message",f),a.disconnect())});t.parentNode&&a.observe(t.parentNode,{childList:!0})}function T(e){let{url:t,exportName:o="default",isolate:i="none",integrity:n,permissions:s=["dom"],fallback:r,onError:c,timeout:d}=e;return f=>{let a=document.createElement("div");a.setAttribute("data-remote",t),a.setAttribute("data-isolate",i);try{if(w.blockAll)throw new Error("[onefold:security] Remote loading is disabled (blockAll=true).");Z(t)}catch(l){return c?a.appendChild(c(l)):(console.error(l),a.textContent="Blocked by security policy"),a}return r&&a.appendChild(r()),i==="iframe"?(a.textContent="",ke(t,a,s,f),a):(ee(t,n,d).then(l=>{let u=l[o];if(typeof u!="function")throw new Error(`Remote "${t}" does not export "${o}" as a function.`);let m=u(f??{});a.textContent="",i==="shadow"?a.attachShadow({mode:"closed"}).appendChild(m):a.appendChild(m)}).catch(l=>{a.textContent="",c?a.appendChild(c(l)):(console.error(`[onefold] Failed to load remote: ${t}`,l),a.textContent="Failed to load remote module")}),a)}}function R(e,t){try{Z(e)}catch(o){return Promise.reject(o)}return ee(e,t).then(()=>{})}var Ce=F`
  .shell {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
  }
  .shell-header {
    text-align: center;
    margin-bottom: 32px;
  }
  .shell-header h1 {
    font-size: 28px;
    margin-bottom: 8px;
  }
  .shell-header p {
    color: #6b7280;
    font-size: 14px;
  }
  .architecture {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .architecture h2 { font-size: 16px; margin: 0 0 12px; }
  .architecture pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 14px;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'SF Mono', Menlo, monospace;
    overflow-x: auto;
    margin: 0;
  }
  .widgets {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 768px) {
    .widgets { grid-template-columns: 1fr; }
  }
  .widget-frame {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }
  .widget-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  .widget-toolbar span {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .team-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #eef2ff;
    color: #4f46e5;
  }
  .widget-content {
    padding: 20px;
  }
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px;
    color: #9ca3af;
    font-size: 14px;
  }
  .spinner-ring {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg {
    color: #dc2626;
    font-size: 13px;
    padding: 20px;
    text-align: center;
  }
  .controls {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .controls button {
    padding: 8px 16px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.15s;
  }
  .controls button:hover { border-color: #6366f1; color: #6366f1; }
  .controls button.active { background: #4f46e5; color: white; border-color: #4f46e5; }
  .isolation-note {
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
    margin-top: 6px;
    font-style: italic;
  }
`,$={billing:"http://localhost:3033/billing-widget.js",analytics:"http://localhost:3033/analytics-widget.js"};function te(){return y`
    <div class="spinner">
      <div class="spinner-ring"></div>
      <span>Loading remote widget...</span>
    </div>
  `}function oe(e){return y`<div class="error-msg">Failed to load: ${e.message}</div>`}function Se(){let e=E("none"),t=E("ACCT-7291"),o=T({url:$.billing,isolate:"none",fallback:te,onError:oe}),i=T({url:$.analytics,isolate:"none",fallback:te,onError:oe}),n=()=>R($.billing),s=()=>R($.analytics);return y`
    <div class=${Ce.scope}>
      <div class="shell">
        <div class="shell-header">
          <h1>Microfrontend Demo</h1>
          <p>Host shell loading independent remote widgets via <code>loadRemote()</code></p>
        </div>

        <div class="architecture">
          <h2>Architecture (Two Ports)</h2>
          <pre>Host Shell — http://localhost:3032
 │
 ├── loadRemote('http://localhost:3033/billing-widget.js')
 │   └── Team: Payments (deployed independently)
 │
 └── loadRemote('http://localhost:3033/analytics-widget.js')
     └── Team: Data (deployed independently)

Remote Server — http://localhost:3033  (CORS enabled)
 ├── billing-widget.js   (self-contained ES module)
 └── analytics-widget.js (self-contained ES module)</pre>
        </div>

        <div class="controls">
          <button
            class=${()=>e()==="none"?"active":""}
            onclick=${()=>e.set("none")}
          >No Isolation</button>
          <button
            class=${()=>e()==="shadow"?"active":""}
            onclick=${()=>e.set("shadow")}
          >Shadow DOM Isolation</button>
        </div>

        <div class="widgets">
          <div class="widget-frame" onmouseenter=${n}>
            <div class="widget-toolbar">
              <span>Billing Widget</span>
              <span class="team-badge">Team: Payments</span>
            </div>
            <div class="widget-content">
              ${o({accountId:t()})}
            </div>
            <p class="isolation-note">${()=>`Isolation: ${e()}`}</p>
          </div>

          <div class="widget-frame" onmouseenter=${s}>
            <div class="widget-toolbar">
              <span>Analytics Widget</span>
              <span class="team-badge">Team: Data</span>
            </div>
            <div class="widget-content">
              ${i({dashboardId:"main"})}
            </div>
            <p class="isolation-note">${()=>`Isolation: ${e()}`}</p>
          </div>
        </div>
      </div>
    </div>
  `}j(Se(),document.getElementById("app"));
