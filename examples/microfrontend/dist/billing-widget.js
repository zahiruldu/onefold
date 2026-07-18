var I=null;function j(e,t){I?I(e,t):t()}var V=new Map;function D(e){return V.get(e)}var x=null,X=0,K=new Set,A=class{constructor(t,n){this.deps=new Set,this.active=!0,this.fn=t,this.label=n}run(){if(!this.active)return;this.cleanup();let t=x;x=this;try{j(this.label,this.fn)}finally{x=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},C=class{constructor(t){this.value=t,this.subscribers=new Set}get(){return x&&(this.subscribers.add(x),x.deps.add(this)),this.value}set(t){let n=typeof t=="function"?t(this.value):t;Object.is(n,this.value)||(this.value=n,this.notify())}peek(){return this.value}notify(){if(X>0)for(let t of this.subscribers)K.add(t);else{let t=Array.from(this.subscribers);for(let n=0;n<t.length;n++)t[n].run()}}};function T(e){let t=new C(e),n=(()=>t.get());return n.set=i=>t.set(i),n.peek=()=>t.peek(),n}function y(e,t="effect"){let n=new A(e,t);return n.run(),()=>n.dispose()}var Q=/^\s*(javascript|data|vbscript):/i,G=/^on/i;function $(e){return Q.test(e)}function N(e){return G.test(e)}function z(e){let t=document.createElement("template");t.innerHTML=e;let n=i=>{let r=[];i.childNodes.forEach(s=>{if(s.nodeType===Node.ELEMENT_NODE){let o=s,c=o.tagName.toLowerCase();if(c==="script"||c==="style"||c==="iframe"||c==="object"||c==="embed"||c==="form"){r.push(s);return}Array.from(o.attributes).forEach(f=>{(N(f.name)||(f.name==="href"||f.name==="src")&&$(f.value))&&o.removeAttribute(f.name)}),n(o)}}),r.forEach(s=>s.remove())};return n(t.content),t.innerHTML}var w=null;function Y(){return w||(typeof window<"u"&&window.trustedTypes&&(w=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>z(e)})),w)}function P(e){let t=Y();return t?t.createHTML(e):z(e)}function L(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}var E=new WeakMap,M=null;function Z(){if(M||typeof MutationObserver>"u"||typeof document>"u")return;M=new MutationObserver(t=>{for(let n of t)n.removedNodes.forEach(_)});let e=document.documentElement??document;M.observe(e,{childList:!0,subtree:!0})}function _(e){let t=E.get(e);if(t){for(let n of t)try{n()}catch(i){console.error("[onefold] Error while disposing a reactive binding:",i)}E.delete(e)}e.childNodes.forEach(_)}function R(e,t){Z();let n=E.get(e);n||(n=new Set,E.set(e,n)),n.add(t)}var h="\0nf_",g=/\x00nf_(\d+)\x00/g;function ee(e){return`${h}${e}\0`}function d(e,t){return e.charAt(t)}function H(e){return parseInt(e[1]??"0",10)}function te(e,t){let n="";for(let o=0;o<e.length;o++)n+=e[o],o<t.length&&(n+=ee(o));let i=[],r=0,s=n.length;for(;r<s;){if(d(n,r)==="<"){if(n.startsWith("<!--",r)){let m=n.indexOf("-->",r+4);r=m===-1?s:m+3;continue}if(d(n,r+1)==="/"){let m=n.indexOf(">",r),S=n.slice(r+2,m).trim();i.push({kind:1,tag:S}),r=m+1;continue}let f=ne(n,r),l=d(n,f-1)==="/",a=n.slice(r+1,l?f-1:f),{tag:u,attrs:p}=re(a,t);i.push({kind:0,tag:u});for(let m of p)i.push(m);l&&i.push({kind:1,tag:u}),r=f+1;continue}let o=n.indexOf("<",r),c=o===-1?n.slice(r):n.slice(r,o);if(r=o===-1?s:o,c.trim()||g.test(c)){g.lastIndex=0;let f=0,l;for(;(l=g.exec(c))!==null;){let u=c.slice(f,l.index);u&&i.push({kind:3,value:u}),i.push({kind:4,value:t[H(l)]}),f=l.index+l[0].length}let a=c.slice(f);a&&a.trim()&&i.push({kind:3,value:a})}}return i}function ne(e,t){let n=null;for(let i=t+1;i<e.length;i++){let r=d(e,i);if(n)r===n&&(n=null);else if(r==='"'||r==="'")n=r;else if(r===">")return i}return e.length-1}function b(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function re(e,t){let n=e.search(/[\s/]/),i=n===-1?e:e.slice(0,n),r=[];if(n===-1)return{tag:i,attrs:r};let s=e.slice(n).trim();if(!s)return{tag:i,attrs:r};let o=0,c=s.length;for(;o<c;){for(;o<c&&b(d(s,o));)o++;if(o>=c)break;if(s.startsWith(h,o)){let a=s.indexOf("\0",o+h.length),u=parseInt(s.slice(o+h.length,a),10),p=t[u];if(p&&typeof p=="object")for(let[m,S]of Object.entries(p))r.push({kind:2,name:m,value:S});o=a+1;continue}let f=o;for(;o<c&&d(s,o)!=="="&&!b(d(s,o));)o++;let l=s.slice(f,o);if(!l){o++;continue}for(;o<c&&b(d(s,o));)o++;if(o>=c||d(s,o)!=="="){r.push({kind:2,name:l,value:!0});continue}for(o++;o<c&&b(d(s,o));)o++;if(s.startsWith(h,o)){let a=s.indexOf("\0",o+h.length),u=parseInt(s.slice(o+h.length,a),10);r.push({kind:2,name:l,value:t[u]}),o=a+1}else if(d(s,o)==='"'||d(s,o)==="'"){let a=d(s,o);o++;let u=o;for(;o<c&&d(s,o)!==a;)o++;let p=s.slice(u,o);o++,r.push({kind:2,name:l,value:W(p,t)})}else{let a=o;for(;o<c&&!b(d(s,o));)o++;let u=s.slice(a,o);r.push({kind:2,name:l,value:W(u,t)})}}return{tag:i,attrs:r}}function W(e,t){g.lastIndex=0;let n=g.exec(e);if(!n)return e;if(n.index===0&&n[0].length===e.length)return t[H(n)];g.lastIndex=0;let i=[],r=0,s;for(;(s=g.exec(e))!==null;){s.index>r&&i.push(e.slice(r,s.index));let o=t[H(s)];i.push(typeof o=="function"?o:()=>o),r=s.index+s[0].length}return r<e.length&&i.push(e.slice(r)),()=>i.map(o=>typeof o=="function"?o():o).join("")}function oe(e){let t=document.createDocumentFragment(),n=[t],i=t;for(let r of e)switch(r.kind){case 0:{let s=document.createElement(r.tag);i.appendChild(s),n.push(s),i=s;break}case 1:{n.pop(),i=n.length>0?n[n.length-1]:t;break}case 2:{ie(i,r.name,r.value);break}case 3:{i.appendChild(document.createTextNode(r.value));break}case 4:{B(i,r.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function ie(e,t,n){if(t==="ref"){typeof n=="function"&&n(e);return}if(t==="class"){k(n,i=>se(e,i),e);return}if(t==="style"){k(n,i=>Object.assign(e.style,i??{}),e);return}if(N(t)&&typeof n=="function"){e.addEventListener(t.slice(2).toLowerCase(),n);return}if(t.startsWith("d-")){let i=D(t.slice(2));i?k(n,r=>i(e,r),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}k(n,i=>ce(e,t,i),e)}function k(e,t,n){if(typeof e=="function"){let i=y(()=>t(e()));R(n,i)}else t(e)}function se(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,n])=>n).map(([n])=>n).join(" ")):e.className=""}function ce(e,t,n){if(n===!1||n==null){e.removeAttribute(t);return}if(n===!0){e.setAttribute(t,"");return}let i=String(n);if((t==="href"||t==="src"||t==="action"||t==="formaction")&&$(i)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,i),e.removeAttribute(t);return}e.setAttribute(t,i)}function B(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let n of t)B(e,n);return}if(typeof t=="function"){let n=document.createComment("expr-start"),i=document.createComment("expr-end");e.appendChild(n),e.appendChild(i);let r=y(()=>{let s=t(),o=n.parentNode;if(!o)return;let c=n.nextSibling;for(;c&&c!==i;){let l=c.nextSibling;o.removeChild(c),c=l}let f=F(s);o.insertBefore(f,i)});R(e,r);return}if(L(t)){let n=document.createElement("span");n.innerHTML=P(t.html),e.appendChild(n);return}e.appendChild(document.createTextNode(String(t)))}}function F(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(L(e)){let t=document.createElement("span");return t.innerHTML=P(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let n of e)t.appendChild(F(n));return t}return document.createTextNode(String(e))}function v(e,...t){let n=te(e,t);return oe(n)}var ae=0,U=new Map;function fe(){return`nf-${(ae++).toString(36)}`}function J(e,t){let n=`.${t}`,i="",r=0,s=e.length;for(;r<s;){for(;r<s&&/\s/.test(e[r]);)i+=e[r],r++;if(r>=s)break;if(e[r]==="@"){let a=r;for(;r<s&&e[r]!=="{";)r++;i+=e.slice(a,r),r<s&&(i+=e[r],r++);let u=q(e,r-1),p=u.slice(1,-1);i+=J(p,t),i+="}",r+=u.length-1;continue}let o=r;for(;r<s&&e[r]!=="{";)r++;let c=e.slice(o,r).trim();if(!c||r>=s)break;let f=c.split(",").map(a=>(a=a.trim(),a&&(a===":root"||a===":host"?n:a.startsWith("&")?n+a.slice(1):`${n} ${a}`))).join(", ");i+=f;let l=q(e,r);i+=l,r+=l.length}return i}function q(e,t){if(e[t]!=="{")return"";let n=0,i=t;for(;i<e.length;){if(e[i]==="{")n++;else if(e[i]==="}"&&(n--,n===0))return e.slice(t,i+1);i++}return e.slice(t)}function le(e,t){if(typeof document>"u"||document.getElementById(t))return;let n=document.createElement("style");n.id=t,n.textContent=e,document.head.appendChild(n)}function O(e,...t){let n="";for(let c=0;c<e.length;c++)n+=e[c],c<t.length&&(n+=String(t[c]));let i=U.get(n);if(i)return i;let r=fe(),s=J(n,r);le(s,`style-${r}`);let o={scope:r,css:s};return U.set(n,o),o}var ue=O`
  .billing-widget {
    font-family: -apple-system, sans-serif;
  }
  .billing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .billing-header h3 {
    margin: 0;
    font-size: 16px;
  }
  .badge {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 12px;
    background: rgba(34,197,94,0.1);
    color: #16a34a;
    font-weight: 600;
  }
  .plan-card {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 12px;
    padding: 20px;
    color: white;
    margin-bottom: 16px;
  }
  .plan-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .plan-price { font-size: 14px; opacity: 0.8; }
  .usage-bar {
    height: 6px;
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
    margin-top: 12px;
    overflow: hidden;
  }
  .usage-fill {
    height: 100%;
    background: white;
    border-radius: 3px;
    transition: width 0.3s;
  }
  .invoices { list-style: none; padding: 0; margin: 0; }
  .invoices li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
  }
  .invoices li:last-child { border-bottom: none; }
  .amount { font-weight: 600; }
  button {
    width: 100%;
    padding: 10px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 12px;
  }
  button:hover { background: #4338ca; }
`;function de(e){let t=T(67),n=[{date:"Jul 2026",amount:"$49.00",status:"Paid"},{date:"Jun 2026",amount:"$49.00",status:"Paid"},{date:"May 2026",amount:"$39.00",status:"Paid"}],i=()=>{t.set(Math.min(100,Math.floor(Math.random()*40)+60))};return v`
    <div class=${ue.scope}>
      <div class="billing-widget">
        <div class="billing-header">
          <h3>Billing — ${e.accountId??"Default"}</h3>
          <span class="badge">Active</span>
        </div>

        <div class="plan-card">
          <div class="plan-name">Pro Plan</div>
          <div class="plan-price">$49/month · Renews Aug 1</div>
          <div class="usage-bar">
            <div class="usage-fill" style=${()=>({width:`${t()}%`})}></div>
          </div>
          <div class="plan-price" style=${{marginTop:"6px"}}>
            ${()=>`${t()}% of API quota used`}
          </div>
        </div>

        <h4 style=${{fontSize:"14px",margin:"0 0 8px"}}>Recent Invoices</h4>
        <ul class="invoices">
          ${n.map(r=>v`
            <li>
              <span>${r.date}</span>
              <span class="amount">${r.amount}</span>
              <span>${r.status}</span>
            </li>
          `)}
        </ul>

        <button onclick=${i}>Simulate API Usage</button>
      </div>
    </div>
  `}export{de as default};
