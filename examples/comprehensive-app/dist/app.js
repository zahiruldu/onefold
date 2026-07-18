var be=null;function dt(e){be=e}function pt(e,t){be?be(e,t):t()}var Ft=new Map;function ut(e){return Ft.get(e)}var U=null,le=0,he=new Set,xe=class{constructor(t,n){this.deps=new Set;this.active=!0;this.fn=t,this.label=n}run(){if(!this.active)return;this.cleanup();let t=U;U=this;try{pt(this.label,this.fn)}finally{U=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},ye=class{constructor(t){this.value=t;this.subscribers=new Set}get(){return U&&(this.subscribers.add(U),U.deps.add(this)),this.value}set(t){let n=typeof t=="function"?t(this.value):t;Object.is(n,this.value)||(this.value=n,this.notify())}peek(){return this.value}notify(){if(le>0)for(let t of this.subscribers)he.add(t);else{let t=Array.from(this.subscribers);for(let n=0;n<t.length;n++)t[n].run()}}};function b(e){let t=new ye(e),n=(()=>t.get());return n.set=o=>t.set(o),n.peek=()=>t.peek(),n}function y(e,t="effect"){let n=new xe(e,t);return n.run(),()=>n.dispose()}function ce(e){let t=b(void 0);y(()=>t.set(e()),"computed");let n=(()=>t());return n.peek=t.peek,n.set=()=>{throw new Error("[onefold] Cannot write to a computed signal.")},n}function j(e){le++;try{e()}finally{if(le--,le===0){let t=[...he];he.clear();for(let n of t)n.run()}}}var jt=/^\s*(javascript|data|vbscript):/i,Kt=/^on/i;function Te(e){return jt.test(e)}function ke(e){return Kt.test(e)}function we(e){let t=document.createElement("template");t.innerHTML=e;let n=o=>{let s=[];o.childNodes.forEach(i=>{if(i.nodeType===Node.ELEMENT_NODE){let r=i,a=r.tagName.toLowerCase();if(a==="script"||a==="style"||a==="iframe"||a==="object"||a==="embed"||a==="form"){s.push(i);return}Array.from(r.attributes).forEach(l=>{(ke(l.name)||(l.name==="href"||l.name==="src")&&Te(l.value))&&r.removeAttribute(l.name)}),n(r)}}),s.forEach(i=>i.remove())};return n(t.content),t.innerHTML}var de=null;function zt(){return de||(typeof window<"u"&&window.trustedTypes&&(de=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>we(e)})),de)}function Se(e){let t=zt();return t?t.createHTML(e):we(e)}function Ee(e){return{__onefoldRaw:!0,html:we(e)}}function $e(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function Re(e,t){t.textContent="",t.appendChild(e)}var pe=new WeakMap,Pe=null;function qt(){if(Pe||typeof MutationObserver>"u"||typeof document>"u")return;Pe=new MutationObserver(t=>{for(let n of t)n.removedNodes.forEach(ft)});let e=document.documentElement??document;Pe.observe(e,{childList:!0,subtree:!0})}function ft(e){let t=pe.get(e);if(t){for(let n of t)try{n()}catch(o){console.error("[onefold] Error while disposing a reactive binding:",o)}pe.delete(e)}e.childNodes.forEach(ft)}function M(e,t){qt();let n=pe.get(e);n||(n=new Set,pe.set(e,n)),n.add(t)}var K="\0nf_",z=/\x00nf_(\d+)\x00/g;function _t(e){return`${K}${e}\0`}function S(e,t){return e.charAt(t)}function Ce(e){return parseInt(e[1]??"0",10)}function Ut(e,t){let n="";for(let r=0;r<e.length;r++)n+=e[r],r<t.length&&(n+=_t(r));let o=[],s=0,i=n.length;for(;s<i;){if(S(n,s)==="<"){if(n.startsWith("<!--",s)){let p=n.indexOf("-->",s+4);s=p===-1?i:p+3;continue}if(S(n,s+1)==="/"){let p=n.indexOf(">",s),m=n.slice(s+2,p).trim();o.push({kind:1,tag:m}),s=p+1;continue}let l=Vt(n,s),c=S(n,l-1)==="/",d=n.slice(s+1,c?l-1:l),{tag:f,attrs:h}=Bt(d,t);o.push({kind:0,tag:f});for(let p of h)o.push(p);c&&o.push({kind:1,tag:f}),s=l+1;continue}let r=n.indexOf("<",s),a=r===-1?n.slice(s):n.slice(s,r);if(s=r===-1?i:r,a.trim()||z.test(a)){z.lastIndex=0;let l=0,c;for(;(c=z.exec(a))!==null;){let f=a.slice(l,c.index);f&&o.push({kind:3,value:f}),o.push({kind:4,value:t[Ce(c)]}),l=c.index+c[0].length}let d=a.slice(l);d&&d.trim()&&o.push({kind:3,value:d})}}return o}function Vt(e,t){let n=null;for(let o=t+1;o<e.length;o++){let s=S(e,o);if(n)s===n&&(n=null);else if(s==='"'||s==="'")n=s;else if(s===">")return o}return e.length-1}function W(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function Bt(e,t){let n=e.search(/[\s/]/),o=n===-1?e:e.slice(0,n),s=[];if(n===-1)return{tag:o,attrs:s};let i=e.slice(n).trim();if(!i)return{tag:o,attrs:s};let r=0,a=i.length;for(;r<a;){for(;r<a&&W(S(i,r));)r++;if(r>=a)break;if(i.startsWith(K,r)){let d=i.indexOf("\0",r+K.length),f=parseInt(i.slice(r+K.length,d),10),h=t[f];if(h&&typeof h=="object")for(let[p,m]of Object.entries(h))s.push({kind:2,name:p,value:m});r=d+1;continue}let l=r;for(;r<a&&S(i,r)!=="="&&!W(S(i,r));)r++;let c=i.slice(l,r);if(!c){r++;continue}for(;r<a&&W(S(i,r));)r++;if(r>=a||S(i,r)!=="="){s.push({kind:2,name:c,value:!0});continue}for(r++;r<a&&W(S(i,r));)r++;if(i.startsWith(K,r)){let d=i.indexOf("\0",r+K.length),f=parseInt(i.slice(r+K.length,d),10);s.push({kind:2,name:c,value:t[f]}),r=d+1}else if(S(i,r)==='"'||S(i,r)==="'"){let d=S(i,r);r++;let f=r;for(;r<a&&S(i,r)!==d;)r++;let h=i.slice(f,r);r++,s.push({kind:2,name:c,value:mt(h,t)})}else{let d=r;for(;r<a&&!W(S(i,r));)r++;let f=i.slice(d,r);s.push({kind:2,name:c,value:mt(f,t)})}}return{tag:o,attrs:s}}function mt(e,t){z.lastIndex=0;let n=z.exec(e);if(!n)return e;if(n.index===0&&n[0].length===e.length)return t[Ce(n)];z.lastIndex=0;let o=[],s=0,i;for(;(i=z.exec(e))!==null;){i.index>s&&o.push(e.slice(s,i.index));let r=t[Ce(i)];o.push(typeof r=="function"?r:()=>r),s=i.index+i[0].length}return s<e.length&&o.push(e.slice(s)),()=>o.map(r=>typeof r=="function"?r():r).join("")}function Wt(e){let t=document.createDocumentFragment(),n=[t],o=t;for(let s of e)switch(s.kind){case 0:{let i=document.createElement(s.tag);o.appendChild(i),n.push(i),o=i;break}case 1:{n.pop(),o=n.length>0?n[n.length-1]:t;break}case 2:{Gt(o,s.name,s.value);break}case 3:{o.appendChild(document.createTextNode(s.value));break}case 4:{gt(o,s.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function Gt(e,t,n){if(t==="ref"){typeof n=="function"&&n(e);return}if(t==="class"){ue(n,o=>Yt(e,o),e);return}if(t==="style"){ue(n,o=>Object.assign(e.style,o??{}),e);return}if(ke(t)&&typeof n=="function"){e.addEventListener(t.slice(2).toLowerCase(),n);return}if(t.startsWith("d-")){let o=ut(t.slice(2));o?ue(n,s=>o(e,s),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}ue(n,o=>Jt(e,t,o),e)}function ue(e,t,n){if(typeof e=="function"){let o=y(()=>t(e()));M(n,o)}else t(e)}function Yt(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,n])=>n).map(([n])=>n).join(" ")):e.className=""}function Jt(e,t,n){if(n===!1||n==null){e.removeAttribute(t);return}if(n===!0){e.setAttribute(t,"");return}let o=String(n);if((t==="href"||t==="src"||t==="action"||t==="formaction")&&Te(o)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,o),e.removeAttribute(t);return}e.setAttribute(t,o)}function gt(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let n of t)gt(e,n);return}if(typeof t=="function"){let n=document.createComment("expr-start"),o=document.createComment("expr-end");e.appendChild(n),e.appendChild(o);let s=y(()=>{let i=t(),r=n.parentNode;if(!r)return;let a=n.nextSibling;for(;a&&a!==o;){let c=a.nextSibling;r.removeChild(a),a=c}let l=vt(i);r.insertBefore(l,o)});M(e,s);return}if($e(t)){let n=document.createElement("span");n.innerHTML=Se(t.html),e.appendChild(n);return}e.appendChild(document.createTextNode(String(t)))}}function vt(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if($e(e)){let t=document.createElement("span");return t.innerHTML=Se(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let n of e)t.appendChild(vt(n));return t}return document.createTextNode(String(e))}function u(e,...t){let n=Ut(e,t);return Wt(n)}var Xt=0,bt=new Map;function Qt(){return`nf-${(Xt++).toString(36)}`}function xt(e,t){let n=`.${t}`,o="",s=0,i=e.length;for(;s<i;){for(;s<i&&/\s/.test(e[s]);)o+=e[s],s++;if(s>=i)break;if(e[s]==="@"){let d=s;for(;s<i&&e[s]!=="{";)s++;o+=e.slice(d,s),s<i&&(o+=e[s],s++);let f=ht(e,s-1),h=f.slice(1,-1);o+=xt(h,t),o+="}",s+=f.length-1;continue}let r=s;for(;s<i&&e[s]!=="{";)s++;let a=e.slice(r,s).trim();if(!a||s>=i)break;let l=a.split(",").map(d=>(d=d.trim(),d&&(d===":root"||d===":host"?n:d.startsWith("&")?n+d.slice(1):`${n} ${d}`))).join(", ");o+=l;let c=ht(e,s);o+=c,s+=c.length}return o}function ht(e,t){if(e[t]!=="{")return"";let n=0,o=t;for(;o<e.length;){if(e[o]==="{")n++;else if(e[o]==="}"&&(n--,n===0))return e.slice(t,o+1);o++}return e.slice(t)}function Zt(e,t){if(typeof document>"u"||document.getElementById(t))return;let n=document.createElement("style");n.id=t,n.textContent=e,document.head.appendChild(n)}function Ae(e,...t){let n="";for(let a=0;a<e.length;a++)n+=e[a],a<t.length&&(n+=String(t[a]));let o=bt.get(n);if(o)return o;let s=Qt(),i=xt(n,s);Zt(i,`style-${s}`);let r={scope:s,css:i};return bt.set(n,r),r}function He(e){let{items:t,itemHeight:n,height:o,renderRow:s,overscan:i=6}=e,r=b(0),a=document.createElement("div");a.style.height=`${o}px`,a.style.overflowY="auto",a.style.position="relative",a.setAttribute("role","list");let l=document.createElement("div");l.style.position="relative",a.appendChild(l);let c=new Map;a.addEventListener("scroll",()=>r.set(a.scrollTop),{passive:!0});let d=y(()=>{let f=t(),h=f.length;l.style.height=`${h*n}px`;let p=r(),m=Math.max(0,Math.floor(p/n)-i),g=Math.ceil(o/n)+i*2,w=Math.min(h,m+g),_=new Set;for(let T=m;T<w;T++)_.add(T);for(let[T,x]of c)_.has(T)||(x.remove(),c.delete(T));for(let T=m;T<w;T++){if(c.has(T))continue;let x=f[T];if(x===void 0)continue;let E=s(x,T),P=E instanceof HTMLElement?E:(()=>{let D=document.createElement("div");return D.appendChild(E),D})();P.style.position="absolute",P.style.top=`${T*n}px`,P.style.left="0",P.style.right="0",P.style.height=`${n}px`,l.appendChild(P),c.set(T,P)}});return M(a,d),a}function Le(e,t){let n=b(void 0),o=b(!1),s=b(void 0),i=0,r=c=>{let d=++i;o.set(!0),s.set(void 0),t(c).then(f=>{d===i&&(n.set(f),o.set(!1))}).catch(f=>{d===i&&(s.set(f),o.set(!1))})},a,l=y(()=>{let c=e();a=c,r(c)});return{data:n,loading:o,error:s,refetch:()=>r(a),dispose:()=>{l(),i++}}}function Ne(e){let t=b(e);return t.update=n=>{t.set(o=>({...o,...typeof n=="function"?n(o):n}))},t}var G=null,Me=null;function Oe(){return Me===null&&(Me=typeof window<"u"&&window.location.protocol==="file:"),Me}function yt(){return typeof window>"u"?"/":Oe()?window.location.hash.slice(1)||"/":window.location.pathname}function De(){if(G)return G;if(G=b(yt()),typeof window<"u"){let e=Oe()?"hashchange":"popstate";window.addEventListener(e,()=>G.set(yt()))}return G}function V(e){if(typeof window>"u")return;let t=De();Oe()?window.location.hash=e:(window.history.pushState({},"",e),t.set(e))}function Y(){return De()()}function en(e,t){let n=e.split("/"),o=t.split("/");if(n.length!==o.length)return null;let s={};for(let i=0;i<n.length;i++){let r=n[i],a=o[i];if(r.startsWith(":"))s[r.slice(1)]=decodeURIComponent(a);else if(r!==a)return null}return s}function Ie(e,t){let n=De(),o=document.createElement("div"),s=y(()=>{let i=n(),r=null;if(Array.isArray(e))for(let a of e){let l=en(a.path,i);if(l!==null){r=a.view(l);break}}else{let a=e[i];a&&(r=a())}o.textContent="",o.appendChild(r??t())});return M(o,s),o}function X(e){return{id:Symbol(e)}}var Fe=new Map,J=[];function Q(e,t){J.length>0?J[J.length-1].set(e.id,t):Fe.set(e.id,t)}function $(e){for(let t=J.length-1;t>=0;t--){let n=J[t];if(n.has(e.id))return n.get(e.id)}if(Fe.has(e.id))return Fe.get(e.id);throw new Error(`[onefold] No provider found for token: ${e.id.toString()}`)}function O(e="Required"){return t=>t==null||t===""||Array.isArray(t)&&t.length===0?e:null}function je(e="Invalid email"){return t=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)?null:e}function Z(e,t){return n=>n.length>=e?null:t??`Minimum ${e} characters`}function ee(e,t){return n=>n.length<=e?null:t??`Maximum ${e} characters`}function te(e){let t=Object.entries(e),n={},o=[];for(let[r,a]of t){let l=b(a.initial),c=b(!1),d=b(""),f=b(!0),h=a.rules??[];o.push(y(()=>{let p=l();if(!c()){d.set(""),f.set(Tt(h,p)===null);return}let m=Tt(h,p);d.set(m??""),f.set(m===null)})),n[r]={value:l,error:d,touched:c,valid:f,handle:p=>{let m=p.target,g=m.type==="checkbox"?m.checked:m.type==="number"?Number(m.value):m.value;j(()=>{l.set(g),c.set(!0)})},set:p=>{j(()=>{l.set(p),c.set(!0)})},reset:()=>{j(()=>{l.set(a.initial),c.set(!1)})}}}let s=b(!0),i=b(!1);return o.push(y(()=>{let r=!0,a=!1;for(let l of Object.values(n))l.valid()||(r=!1),l.touched()&&(a=!0);s.set(r),i.set(a)})),{fields:n,valid:s,dirty:i,values:()=>{let r={};for(let[a,l]of Object.entries(n))r[a]=l.value.peek();return r},submit:r=>{if(j(()=>{for(let a of Object.values(n))a.touched.set(!0)}),s.peek()){let a={};for(let[l,c]of Object.entries(n))a[l]=c.value.peek();r(a)}},reset:()=>{j(()=>{for(let r of Object.values(n))r.reset()})},dispose:()=>{for(let r of o)r()}}}function Tt(e,t){for(let n of e){let o=n(t);if(o)return o}return null}function Ke(e){let t=b(e.defaultLocale),n={...e.messages},o=e.fallbackLocale??e.defaultLocale,s=b(0);function i(c,d){let f=t();s();let p=n[f]?.[c]??n[o]?.[c]??c;if(d)for(let[m,g]of Object.entries(d))p=p.split(`{${m}}`).join(String(g));return p}function r(c){t.set(c)}function a(c,d){n[c]={...n[c],...d},s.set(f=>f+1)}function l(){return Object.keys(n)}return{locale:t,setLocale:r,t:i,addMessages:a,availableLocales:l}}function ze(){let e=new Map;function t(l,c){e.has(l)||e.set(l,new Set);let d=e.get(l);return d.add(c),()=>{d.delete(c)}}function n(l,c){let d={...c,timestamp:Date.now()},f=e.get(l);if(f)for(let h of f)h(d)}function o(l,c){let d=performance.now(),f=c(),h=performance.now()-d;return n("render",{component:l,duration:h}),f}function s(l,c){try{return l()}catch(d){n("error",{error:d,context:c});return}}function i(l,c,d){n("metric",{name:l,value:c,tags:d})}function r(l,c,d){n("log",{level:l,message:c,data:d})}function a(){e.clear()}return{on:t,emit:n,trackRender:o,trackError:s,metric:i,log:r,clear:a}}function qe(){let e=new Map,t=new Map,n=new Map;function o(p,...m){let g=t.get(p);if(g)for(let w of g)w(...m)}function s(p){if(e.has(p.name))throw new Error(`[onefold] Plugin "${p.name}" is already registered.`);e.set(p.name,{definition:p,status:"registered",disposers:[],setupDisposer:null}),o("plugin:registered",p.name,p.version)}function i(p){let m=e.get(p);m&&(m.status==="active"&&a(p),e.delete(p))}function r(p){let m=e.get(p);if(!m||m.status==="active")return;let g=m.definition,w=g.sandbox!==!1,_=new Set(g.permissions??[]),T={name:g.name,permissions:_,hasPermission:x=>_.has(x),on:(x,E)=>{let P=`${p}:${x}`;n.has(P)||n.set(P,new Set);let D=n.get(P);D.add(E);let ae=()=>{D.delete(E)};return m.disposers.push(ae),ae},emit:(x,...E)=>{let P=`${p}:${x}`,D=n.get(P);if(D)for(let ae of D)ae(...E);o(`plugin:event:${x}`,p,...E)}};try{let x=g.setup(T);m.setupDisposer=typeof x=="function"?x:null,m.status="active",o("plugin:started",p)}catch(x){if(m.status="error",o("plugin:error",p,x),!w)throw x}}function a(p){let m=e.get(p);if(!m||m.status!=="active")return;let g=m.definition.sandbox!==!1;try{m.setupDisposer?.(),m.definition.teardown?.();for(let w of m.disposers)w();m.disposers.length=0}catch(w){if(o("plugin:error",p,w),!g)throw w}m.status="stopped",o("plugin:stopped",p)}function l(){for(let[p,m]of e)(m.status==="registered"||m.status==="stopped")&&r(p)}function c(){for(let[p,m]of e)m.status==="active"&&a(p)}function d(p){return e.get(p)?.status??null}function f(){return[...e.keys()]}function h(p,m){t.has(p)||t.set(p,new Set);let g=t.get(p);return g.add(m),()=>{g.delete(m)}}return{register:s,unregister:i,start:l,startPlugin:r,stop:c,stopPlugin:a,getStatus:d,list:f,on:h}}var tn=new Set(["__proto__","constructor","prototype"]);function _e(e){if(e===null||typeof e!="object")return e;if(Array.isArray(e))return e.map(_e);let t={};for(let[n,o]of Object.entries(e))tn.has(n)||(t[n]=_e(o));return t}var kt={get(e){if(typeof localStorage>"u")return;let t=localStorage.getItem(e);if(t!==null)try{return _e(JSON.parse(t))}catch{return}},set(e,t){typeof localStorage>"u"||localStorage.setItem(e,JSON.stringify(t))},remove(e){typeof localStorage>"u"||localStorage.removeItem(e)}};function ne(e,t,n){let o=n?.storage??kt,s=n?.debounce??0,i=o.get(e),r=b(i!==void 0?i:t),a=null;y(()=>{let c=r();s>0?(a&&clearTimeout(a),a=setTimeout(()=>o.set(e,c),s)):o.set(e,c)});let l=r;return l.clear=()=>{a&&(clearTimeout(a),a=null),r.set(t),o.remove(e)},l}var Ue=null;function Ve(e){Ue=e}function fe(){return Ue?Ue():new Set}function Be(e){return fe().has(e)}function We(e){let t=fe();return e.some(n=>t.has(n))}function re(e,t,n){return o=>wt(e)?t(o):n?n(o):document.createComment("unauthorized")}function q(e,t,n){return wt(e)?t():n?n():null}function wt(e){let t=fe();return typeof e=="function"?e(t):typeof e=="string"?t.has(e):e.every(n=>t.has(n))}function Ge(e,t){let n=Object.keys(e),o=t??n[0]??"",s=b(o);return y(()=>{let i=s(),r=e[i];if(!r||typeof document>"u")return;let a=document.documentElement;for(let[l,c]of Object.entries(r))a.style.setProperty(`--${l}`,c)}),{current:s,set:i=>{e[i]&&s.set(i)},toggle:()=>{let i=n.indexOf(s());s.set(n[(i+1)%n.length])},themes:()=>n,tokens:()=>e[s()]??{}}}async function St(e,t){let n=t;for(let o=e.length-1;o>=0;o--){let s=e[o];if(s.error)try{return await s.error(n)}catch(i){n=i}}throw n}function Ye(e){let t=e?.baseUrl??"",n=e?.headers??{},o=[...e?.interceptors??[]],s=e?.timeout??0;async function i(a){let c={url:a.url.startsWith("http")?a.url:a.url.startsWith("//")?(()=>{throw new Error("[onefold:http] Protocol-relative URLs are blocked to prevent open redirect.")})():`${t}${a.url}`,method:a.method,headers:{...n,...a.headers},body:a.body,params:a.params,signal:a.signal};for(let g of o)g.request&&(c=await g.request(c));let d=c.url;if(c.params&&Object.keys(c.params).length>0){let g=new URLSearchParams(c.params).toString();d+=(d.includes("?")?"&":"?")+g}let f={method:c.method,headers:c.headers,signal:c.signal};c.body!==void 0&&c.body!==null&&(typeof c.body=="string"||c.body instanceof FormData?f.body=c.body:(f.body=JSON.stringify(c.body),!c.headers["Content-Type"]&&!c.headers["content-type"]&&(f.headers["Content-Type"]="application/json")));let h=s,p=null,m=null;h>0&&!c.signal&&(m=new AbortController,f.signal=m.signal,p=setTimeout(()=>m.abort(),h));try{let g=await fetch(d,f);if(p&&clearTimeout(p),!g.ok){let x=null;try{x=await g.json()}catch{}let E={message:`HTTP ${g.status}: ${g.statusText}`,status:g.status,statusText:g.statusText,data:x,config:c};return await St(o,E)}let w;(g.headers.get("content-type")??"").includes("application/json")?w=await g.json():w=await g.text();let T={data:w,status:g.status,statusText:g.statusText,headers:g.headers,config:c};for(let x=o.length-1;x>=0;x--){let E=o[x];E.response&&(T=await E.response(T))}return T}catch(g){if(p&&clearTimeout(p),typeof g=="object"&&g!==null&&"config"in g)throw g;let w={message:g instanceof Error?g.message:"Network error",status:0,statusText:"Network Error",data:null,config:c};return await St(o,w)}}function r(a){return{headers:a?.headers,params:a?.params,signal:a?.signal}}return{get:(a,l)=>i({url:a,method:"GET",...r(l)}),post:(a,l,c)=>i({url:a,method:"POST",body:l,...r(c)}),put:(a,l,c)=>i({url:a,method:"PUT",body:l,...r(c)}),patch:(a,l,c)=>i({url:a,method:"PATCH",body:l,...r(c)}),delete:(a,l)=>i({url:a,method:"DELETE",...r(l)}),request:i,addInterceptor:a=>(o.push(a),()=>{let l=o.indexOf(a);l>=0&&o.splice(l,1)})}}function Je(e,t){let n=document.createElement("div");n.setAttribute("data-error-boundary","");function o(){n.textContent="";try{let s=e();n.appendChild(s)}catch(s){let i=s instanceof Error?s:new Error(String(s));n.appendChild(t(i,o))}}return o(),n}function Xe(e,t){let n=document.createElement("div");n.setAttribute("data-suspense","");let{fallback:o,onError:s,minLoadingMs:i=0}=t??{};o&&n.appendChild(o());let r=Date.now();return e().then(async a=>{if(i>0){let l=Date.now()-r;l<i&&await nn(i-l)}n.textContent="",n.appendChild(a)}).catch(a=>{n.textContent="";let l=a instanceof Error?a:new Error(String(a));s?n.appendChild(s(l)):n.textContent=`Error: ${l.message}`}),n}function nn(e){return new Promise(t=>setTimeout(t,e))}function et(e,t){let n=document.createElement("div");n.setAttribute("data-transition",""),n.style.position="relative";let{name:o,duration:s=300,enterFrom:i,enterTo:r,leaveTo:a,mode:l="default"}=t??{},c=null,d=y(()=>{let f=e();if(f===c)return;let h=c;l==="out-in"&&h&&h instanceof HTMLElement?Ze(h,{name:o,duration:s,leaveTo:a},()=>{n.textContent="",f&&(n.appendChild(f),f instanceof HTMLElement&&Qe(f,{name:o,duration:s,enterFrom:i,enterTo:r}))}):(h&&h instanceof HTMLElement&&Ze(h,{name:o,duration:s,leaveTo:a},()=>{h.remove()}),f&&(n.appendChild(f),f instanceof HTMLElement&&Qe(f,{name:o,duration:s,enterFrom:i,enterTo:r}))),c=f??null});return M(n,d),n}function Qe(e,t){let{name:n,duration:o=300,enterFrom:s,enterTo:i}=t;n?(e.classList.add(`${n}-enter`,`${n}-enter-active`),requestAnimationFrame(()=>{e.classList.remove(`${n}-enter`),e.classList.add(`${n}-enter-to`)}),setTimeout(()=>{e.classList.remove(`${n}-enter-active`,`${n}-enter-to`)},o)):s&&(Object.assign(e.style,s),e.style.transition=`all ${o}ms ease`,requestAnimationFrame(()=>{Object.assign(e.style,i??{})}),setTimeout(()=>{e.style.transition=""},o))}function Ze(e,t,n){let{name:o,duration:s=300,leaveTo:i}=t;o?(e.classList.add(`${o}-leave`,`${o}-leave-active`),requestAnimationFrame(()=>{e.classList.remove(`${o}-leave`),e.classList.add(`${o}-leave-to`)}),setTimeout(n,s)):i?(e.style.transition=`all ${s}ms ease`,requestAnimationFrame(()=>{Object.assign(e.style,i)}),setTimeout(n,s)):n()}var rn=new Map;function oe(e){let{render:t,...n}=e;return rn.set(e.name,{meta:n,factory:t}),t}var on='a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';function tt(e){let t=null,n=!1;function o(){return Array.from(e.querySelectorAll(on))}function s(i){if(i.key!=="Tab")return;let r=o();if(r.length===0)return;let a=r[0],l=r[r.length-1];i.shiftKey&&document.activeElement===a?(i.preventDefault(),l.focus()):!i.shiftKey&&document.activeElement===l&&(i.preventDefault(),a.focus())}return{get active(){return n},activate(){t=document.activeElement,n=!0,e.addEventListener("keydown",s);let i=o();i.length>0?i[0].focus():e.focus()},deactivate(){n=!1,e.removeEventListener("keydown",s),t?.focus(),t=null}}}var H=null;function sn(){return H&&H.isConnected||(H=document.createElement("div"),H.setAttribute("aria-live","polite"),H.setAttribute("aria-atomic","true"),H.setAttribute("role","status"),Object.assign(H.style,{position:"absolute",width:"1px",height:"1px",padding:"0",margin:"-1px",overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",border:"0"}),document.body.appendChild(H)),H}function I(e,t="polite"){let n=sn();n.setAttribute("aria-live",t),n.textContent="",setTimeout(()=>{n.textContent=e},50)}function nt(e,t){let n=new Map(Object.entries(e)),o=t??document;function s(r){let a=[];(r.ctrlKey||r.metaKey)&&a.push("Ctrl"),r.shiftKey&&a.push("Shift"),r.altKey&&a.push("Alt");let l=r.key.length===1?r.key.toUpperCase():r.key;return a.push(l),a.join("+")}function i(r){let a=s(r),l=n.get(a);l&&(r.preventDefault(),l(r))}return o.addEventListener("keydown",i),{destroy:()=>o.removeEventListener("keydown",i),add:(r,a)=>n.set(r,a),remove:r=>n.delete(r)}}function rt(e,t="Skip to main content"){let n=document.createElement("a");return n.href=e,n.textContent=t,n.className="nf-skip-link",Object.assign(n.style,{position:"absolute",top:"-100%",left:"0",padding:"8px 16px",background:"#1f2937",color:"#fff",fontSize:"14px",zIndex:"99999",textDecoration:"none",borderRadius:"0 0 4px 0",transition:"top 0.2s"}),n.addEventListener("focus",()=>{n.style.top="0"}),n.addEventListener("blur",()=>{n.style.top="-100%"}),n.addEventListener("click",o=>{o.preventDefault();let s=document.querySelector(e);s&&(s.setAttribute("tabindex","-1"),s.focus())}),n}var ot=null;function st(){if(ot)return ot;let e=[],t=new Map,n=0;function o(i,...r){let a=t.get(i);if(a)for(let l of a)l(...r)}dt((i,r)=>{let a=performance.now();try{r()}catch(d){throw n++,o("error",d,i),d}let l=performance.now()-a,c={label:i,duration:l,timestamp:Date.now()};e.push(c),e.length>500&&e.shift(),o("render",c)});let s={version:"0.1.0",active:!0,renders:e,inspect:i=>{console.group("[onefold devtools] Inspect:",i),console.log("Tag:",i.tagName.toLowerCase()),console.log("Attributes:",Array.from(i.attributes).map(r=>`${r.name}="${r.value}"`)),console.log("Children:",i.childNodes.length),console.log("Data-remote:",i.getAttribute("data-remote")??"none"),console.groupEnd()},stats:()=>{let i=e.length,r=i>0?e.reduce((l,c)=>l+c.duration,0)/i:0,a=i>0?e.reduce((l,c)=>c.duration>l.duration?c:l,e[0]):null;return{totalRenders:i,avgDuration:r,slowestRender:a,totalErrors:n}},clear:()=>{e.length=0,n=0},on:(i,r)=>(t.has(i)||t.set(i,new Set),t.get(i).add(r),()=>{t.get(i)?.delete(r)})};return ot=s,typeof window<"u"&&(window.__NANOFRAME_DEVTOOLS__=s),s}var L=Ge({light:{"app-bg":"#f0f4f8","card-bg":"#ffffff","text-primary":"#1f2937","text-secondary":"#6b7280",accent:"#4f46e5","accent-hover":"#4338ca",border:"#e5e7eb",success:"#10b981",warning:"#f59e0b",danger:"#ef4444","sidebar-bg":"#1e293b","sidebar-text":"#f1f5f9"},dark:{"app-bg":"#0f172a","card-bg":"#1e293b","text-primary":"#f1f5f9","text-secondary":"#94a3b8",accent:"#818cf8","accent-hover":"#6366f1",border:"#334155",success:"#34d399",warning:"#fbbf24",danger:"#f87171","sidebar-bg":"#020617","sidebar-text":"#e2e8f0"}},"light");var v=Ke({defaultLocale:"en",fallbackLocale:"en",messages:{en:{"app.title":"Task Dashboard","app.subtitle":"onefold Comprehensive Demo","nav.home":"Home","nav.tasks":"Tasks","nav.users":"Users","nav.settings":"Settings","nav.analytics":"Analytics","tasks.title":"Task Management","tasks.add":"Add Task","tasks.empty":"No tasks yet. Create your first task!","tasks.total":"{count} task(s)","users.title":"User Directory","settings.title":"Settings","settings.theme":"Theme","settings.language":"Language","settings.notifications":"Notifications","analytics.title":"Analytics Dashboard","form.name":"Name","form.email":"Email","form.submit":"Submit","form.reset":"Reset","common.save":"Save","common.cancel":"Cancel","common.delete":"Delete","common.edit":"Edit","common.loading":"Loading...","common.error":"Something went wrong"},es:{"app.title":"Panel de Tareas","app.subtitle":"Demo Completa de onefold","nav.home":"Inicio","nav.tasks":"Tareas","nav.users":"Usuarios","nav.settings":"Configuracion","nav.analytics":"Analiticas","tasks.title":"Gestion de Tareas","tasks.add":"Agregar Tarea","tasks.empty":"Sin tareas aun. Crea tu primera tarea!","tasks.total":"{count} tarea(s)","users.title":"Directorio de Usuarios","settings.title":"Configuracion","settings.theme":"Tema","settings.language":"Idioma","settings.notifications":"Notificaciones","analytics.title":"Panel de Analiticas","form.name":"Nombre","form.email":"Correo","form.submit":"Enviar","form.reset":"Reiniciar","common.save":"Guardar","common.cancel":"Cancelar","common.delete":"Eliminar","common.edit":"Editar","common.loading":"Cargando...","common.error":"Algo salio mal"}}});var Et=b(new Set(["admin","tasks:read","tasks:write","users:read","analytics:read"]));Ve(Et);var at=X("AuthService"),it=b({name:"Admin User",role:"admin"}),me={user:it,login:(e,t)=>it.set({name:e,role:t}),logout:()=>it.set(null)};Q(at,me);var A=X("NotificationService"),lt=b([]),$t={notifications:lt,add:e=>{lt.set(t=>[...t.slice(-4),e]),I(e)},clear:()=>lt.set([])};Q(A,$t);var k=ze();k.on("navigate",e=>{console.log(`[nav] ${e.from} \u2192 ${e.to}`)});k.on("error",e=>{console.error("[error]",e.error,e.context)});k.on("metric",e=>{console.log(`[metric] ${e.name}: ${e.value}`,e.tags)});var N=qe();N.register({name:"analytics",version:"1.0.0",permissions:["observe","navigate"],setup:e=>(e.on("pageview",t=>{k.metric("pageview",1,{path:t})}),console.log(`[plugin] ${e.name} v1.0.0 loaded`),()=>console.log(`[plugin] ${e.name} unloaded`))});N.register({name:"perf-monitor",version:"1.0.0",permissions:["observe"],setup:e=>{let t=performance.now();e.on("check",()=>{k.metric("uptime",performance.now()-t)}),console.log(`[plugin] ${e.name} v1.0.0 loaded`)}});N.start();var B=st();B.on("render",e=>{let t=e;t.duration>5&&console.warn(`[perf] Slow effect: ${t.label} (${t.duration.toFixed(2)}ms)`)});var F=Ne({tasks:[{id:1,title:"Implement authentication",description:"Add JWT-based auth flow",status:"done",priority:"high",assignee:"Alice",createdAt:"2024-01-15"},{id:2,title:"Design dashboard UI",description:"Create responsive layout",status:"in-progress",priority:"medium",assignee:"Bob",createdAt:"2024-01-16"},{id:3,title:"Write unit tests",description:"Cover critical paths",status:"todo",priority:"high",assignee:"Charlie",createdAt:"2024-01-17"},{id:4,title:"Setup CI/CD pipeline",description:"GitHub Actions workflow",status:"todo",priority:"medium",assignee:"Alice",createdAt:"2024-01-18"},{id:5,title:"API documentation",description:"OpenAPI spec for all endpoints",status:"in-progress",priority:"low",assignee:"Diana",createdAt:"2024-01-19"},{id:6,title:"Performance audit",description:"Lighthouse and bundle analysis",status:"todo",priority:"medium",assignee:"Bob",createdAt:"2024-01-20"}],filter:"all",searchQuery:""}),ct=ce(()=>{let e=F(),{tasks:t,filter:n,searchQuery:o}=e,s=t;if(n!=="all"&&(s=s.filter(i=>i.status===n)),o.trim()){let i=o.toLowerCase();s=s.filter(r=>r.title.toLowerCase().includes(i)||r.description.toLowerCase().includes(i)||r.assignee.toLowerCase().includes(i))}return s}),Rt=ce(()=>{let{tasks:e}=F();return{total:e.length,todo:e.filter(t=>t.status==="todo").length,inProgress:e.filter(t=>t.status==="in-progress").length,done:e.filter(t=>t.status==="done").length,highPriority:e.filter(t=>t.priority==="high").length}}),C=ne("sidebar-collapsed",!1),se=ne("preferred-locale","en"),ie=ne("notifications-enabled",!0);y(()=>{v.setLocale(se())});function Pt(){return u`
    <aside class=${()=>`sidebar ${C()?"collapsed":""}`} role="navigation" aria-label="Main navigation">
      <div class="sidebar-header">
        <span class="sidebar-logo">◈</span>
        ${()=>C()?null:u`<h1>${()=>v.t("app.title")}</h1>`}
      </div>
      <nav>
        ${[{path:"/",icon:"\u25C9",label:()=>v.t("nav.home")},{path:"/tasks",icon:"\u2630",label:()=>v.t("nav.tasks")},{path:"/users",icon:"\u25CE",label:()=>v.t("nav.users")},{path:"/analytics",icon:"\u25C7",label:()=>v.t("nav.analytics")},{path:"/settings",icon:"\u2699",label:()=>v.t("nav.settings")}].map(t=>u`
          <button
            class=${()=>`nav-item ${Y()===t.path?"active":""}`}
            onclick=${()=>{V(t.path),k.emit("navigate",{from:Y(),to:t.path})}}
            aria-current=${()=>Y()===t.path?"page":"false"}
          >
            <span class="icon">${t.icon}</span>
            ${()=>C()?null:u`<span>${t.label()}</span>`}
          </button>
        `)}
      </nav>
      <div class="sidebar-footer">
        ${()=>C()?null:u`
          <div class="sidebar-version">onefold v0.1.0</div>
        `}
      </div>
    </aside>
  `}function Ct(){let e=$(at);return u`
    <header class="topbar" role="banner">
      <div class="topbar-left">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${()=>C.set(!C())}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <span class="topbar-subtitle">${()=>v.t("app.subtitle")}</span>
      </div>
      <div class="topbar-right">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${()=>L.toggle()}
          aria-label="Toggle theme"
        >
          ${()=>L.current()==="dark"?"\u2600":"\u263E"}
        </button>
        <select
          class="locale-select"
          onchange=${t=>se.set(t.target.value)}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        ${()=>{let t=e.user();return t?u`
            <div class="user-info">
              <div class="user-avatar-sm">${t.name.charAt(0)}</div>
              <span class="user-name">${t.name}</span>
              <button class="btn btn-ghost btn-sm" onclick=${()=>e.logout()}>Logout</button>
            </div>
          `:u`<button class="btn btn-primary btn-sm" onclick=${()=>e.login("Admin","admin")}>Login</button>`}}
      </div>
    </header>
  `}function At(){let e=$(A);return u`
    <div class="notification-toast">
      ${()=>e.notifications().map(t=>u`
        <div class="toast-item">${t}</div>
      `)}
    </div>
  `}var R=oe({name:"StatCard",description:"Displays a single statistic with label",props:{value:{type:"string | number",required:!0},label:{type:"string",required:!0},color:{type:"string",required:!1}},tags:["stat","dashboard"],render:({value:e,label:t,color:n})=>u`
    <div class="stat-card">
      <div class="stat-value" style=${n?{color:n}:{}}>${e}</div>
      <div class="stat-label">${t}</div>
    </div>
  `});function Ht(){return u`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("app.title")}<span class="feature-badge">Signals + Store + i18n</span></h2>
      </div>

      <div class="stats-grid">
        ${()=>{let e=Rt();return[R({value:e.total,label:"Total Tasks"}),R({value:e.todo,label:"To Do",color:"var(--warning)"}),R({value:e.inProgress,label:"In Progress",color:"var(--accent)"}),R({value:e.done,label:"Completed",color:"var(--success)"})]}}
      </div>

      <div class="card">
        <h3>Welcome to the onefold Comprehensive Demo</h3>
        <p class="card-description">
          This application demonstrates every feature of the onefold framework
          in a realistic task management dashboard. Navigate using the sidebar to
          explore different features.
        </p>
        <div class="feature-grid">
          ${an()}
        </div>
      </div>
    </div>
  `}function an(){return u`
    ${["Signals & Reactivity","HTML Templates","Scoped CSS","Router & Navigation","Store (State)","Dependency Injection","HTTP Client","Forms & Validation","i18n","Persisted State","RBAC Guards","Theming","Observability","Plugins","Error Boundaries","Suspense","Transitions","Virtual List","Streaming (WS/SSE)","Accessibility","DevTools","Component Meta"].map(t=>u`<div class="feature-item">${t}</div>`)}
  `}var Lt=oe({name:"TaskCard",description:"Displays a single task with status management",props:{task:{type:"Task",required:!0,description:"The task object to display"},onStatusChange:{type:"function",required:!0,description:"Status change callback"}},tags:["task","card"],render:({task:e,onStatusChange:t})=>{let n=o=>({todo:"in-progress","in-progress":"done",done:"todo"})[o];return u`
      <div class="task-card">
        <div class="task-info">
          <div class="task-title">${e.title}</div>
          <div class="task-desc">${e.description}</div>
          <div class="task-meta">
            <span class=${`badge badge-${e.status}`}>${e.status}</span>
            <span class=${`badge badge-${e.priority}`}>${e.priority}</span>
            <span class="task-assignee">${e.assignee}</span>
          </div>
        </div>
        <button
          class="btn btn-ghost btn-sm"
          onclick=${()=>t(e.id,n(e.status))}
          aria-label=${`Move task "${e.title}" to ${n(e.status)}`}
        >
          Next
        </button>
      </div>
    `}});function Nt(){let e=b(!1),t=te({title:{initial:"",rules:[O("Title is required"),Z(3,"At least 3 characters")]},description:{initial:"",rules:[O("Description is required"),ee(200,"Max 200 chars")]},priority:{initial:"medium",rules:[O()]},assignee:{initial:"",rules:[O("Assignee is required")]}}),n=(r,a)=>{F.update(c=>({tasks:c.tasks.map(d=>d.id===r?{...d,status:a}:d)})),$(A).add(`Task status updated to "${a}"`),k.emit("custom",{type:"task-status-change",payload:{id:r,newStatus:a}})},o=()=>{t.submit(r=>{let a={id:Date.now(),title:r.title,description:r.description,status:"todo",priority:r.priority,assignee:r.assignee,createdAt:new Date().toISOString().split("T")[0]};F.update(l=>({tasks:[...l.tasks,a]})),$(A).add(`Task "${r.title}" created`),t.reset(),e.set(!1)})},s=r=>{F.update({filter:r})};return u`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("tasks.title")}<span class="feature-badge">Forms + Store + Guards</span></h2>
        ${()=>q(["tasks:write"],()=>u`
          <button class="btn btn-primary" onclick=${()=>e.set(!0)}>
            + ${()=>v.t("tasks.add")}
          </button>
        `)}
      </div>

      <div class="filter-bar">
        <input
          class="search-input"
          type="text"
          placeholder="Search tasks..."
          oninput=${r=>{F.update({searchQuery:r.target.value})}}
          aria-label="Search tasks"
        />
        ${["all","todo","in-progress","done"].map(r=>u`
          <button
            class=${()=>`filter-btn ${F().filter===r?"active":""}`}
            onclick=${()=>s(r)}
          >
            ${r==="all"?"All":r}
          </button>
        `)}
        <span class="filter-count">
          ${()=>v.t("tasks.total",{count:ct().length})}
        </span>
      </div>

      <div class="task-grid">
        ${()=>{let r=ct();return r.length===0?u`<div class="card empty-state">
              <p>${()=>v.t("tasks.empty")}</p>
            </div>`:r.map(a=>Lt({task:a,onStatusChange:n}))}}
      </div>

      ${()=>e()?ln(t,o,()=>{e.set(!1),t.reset()}):null}
    </div>
  `}function ln(e,t,n){return setTimeout(()=>{let o=document.querySelector(".modal");o&&tt(o).activate()},0),u`
    <div class="modal-overlay" onclick=${o=>{o.target.classList.contains("modal-overlay")&&n()}}>
      <div class="modal">
        <h2>${()=>v.t("tasks.add")}</h2>

        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" type="text" oninput=${e.fields.title.handle} placeholder="Task title..." />
          <div class="form-error">${()=>e.fields.title.error()}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" rows="3" oninput=${e.fields.description.handle} placeholder="Task description..."></textarea>
          <div class="form-error">${()=>e.fields.description.error()}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" onchange=${e.fields.priority.handle}>
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Assignee</label>
          <input class="form-input" type="text" oninput=${e.fields.assignee.handle} placeholder="Assignee name..." />
          <div class="form-error">${()=>e.fields.assignee.error()}</div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick=${n}>${()=>v.t("common.cancel")}</button>
          <button class="btn btn-primary" onclick=${t}>${()=>v.t("form.submit")}</button>
        </div>
      </div>
    </div>
  `}var ge=Ye({baseUrl:"https://jsonplaceholder.typicode.com",headers:{Accept:"application/json"},interceptors:[{request:e=>{let t=me.user.peek();return t&&(e.headers["X-User"]=t.name),k.log("info",`HTTP ${e.method} ${e.url}`),e},response:e=>(k.metric("http.response",e.status,{url:e.config.url}),e)}]});function Mt(){return u`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("users.title")}<span class="feature-badge">Resource + ErrorBoundary + VirtualList</span></h2>
      </div>

      ${Je(()=>cn(),(e,t)=>u`
          <div class="card empty-state">
            <p class="error-text">${()=>v.t("common.error")}: ${e.message}</p>
            <button class="btn btn-primary" onclick=${t}>Retry</button>
          </div>
        `)}
    </div>
  `}function cn(){let e=Le(()=>"users",async()=>(await ge.get("/users")).data);return u`
    <div>
      ${()=>{if(e.loading())return u`<div class="card empty-state"><p>${()=>v.t("common.loading")}</p></div>`;if(e.error())return u`<div class="card empty-state">
            <p class="error-text">Failed to load users</p>
            <button class="btn btn-primary" onclick=${()=>e.refetch()}>Retry</button>
          </div>`;let t=e.data();return t?u`
          <div class="user-grid">
            ${t.map(n=>u`
              <div class="user-card">
                <div class="user-avatar">${n.name.charAt(0)}</div>
                <div class="user-details">
                  <div class="user-name">${n.name}</div>
                  <div class="user-email">${n.email}</div>
                  <div class="user-company">${n.company.name}</div>
                </div>
              </div>
            `)}
          </div>

          <div class="virtual-list-section">
            <h3>Virtual List Demo (1000 items, windowed)
              <span class="feature-badge">VirtualList</span>
            </h3>
            ${dn()}
          </div>
        `:u`<p>No data</p>`}}
    </div>
  `}function dn(){let e=b(Array.from({length:1e3},(t,n)=>({id:n+1,name:`Item #${n+1} \u2014 ${["Alpha","Beta","Gamma","Delta","Epsilon"][n%5]}`,value:Math.round(Math.random()*1e4)/100})));return He({items:e,itemHeight:40,height:300,overscan:4,renderRow:t=>u`
      <div class="virtual-row">
        <span class="virtual-row-id">#${t.id}</span>
        <span class="virtual-row-name">${t.name}</span>
        <span class="virtual-row-value">$${t.value.toFixed(2)}</span>
      </div>
    `})}function Ot(){let e=b("overview");return u`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("analytics.title")}<span class="feature-badge">Suspense + Transition + DevTools</span></h2>
      </div>

      <div class="filter-bar">
        ${["overview","performance","plugins"].map(t=>u`
          <button
            class=${()=>`filter-btn ${e()===t?"active":""}`}
            onclick=${()=>e.set(t)}
          >
            ${t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        `)}
      </div>

      ${et(()=>{let t=e();return t==="overview"?pn():t==="performance"?un():fn()},{enterFrom:{opacity:"0",transform:"translateY(8px)"},enterTo:{opacity:"1",transform:"translateY(0)"},leaveTo:{opacity:"0",transform:"translateY(-8px)"},duration:200,mode:"out-in"})}
    </div>
  `}function pn(){return Xe(async()=>{let t=(await ge.get("/todos?_limit=20")).data,n=t.filter(s=>s.completed).length,o=t.length-n;return u`
        <div>
          <div class="stats-grid">
            ${R({value:t.length,label:"Total Items Fetched"})}
            ${R({value:n,label:"Completed",color:"var(--success)"})}
            ${R({value:o,label:"Pending",color:"var(--warning)"})}
            ${R({value:`${Math.round(n/t.length*100)}%`,label:"Completion Rate",color:"var(--accent)"})}
          </div>
          <div class="card">
            <h3>Remote Data (JSONPlaceholder API) <span class="feature-badge">HTTP Client</span></h3>
            <div class="todo-list">
              ${t.map(s=>u`
                <div class="todo-item">
                  <span class=${s.completed?"todo-check done":"todo-check"}>
                    ${s.completed?"\u2713":"\u25CB"}
                  </span>
                  <span class=${s.completed?"todo-text completed":"todo-text"}>${s.title}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      `},{fallback:()=>u`
        <div class="card empty-state">
          <p>Loading analytics data...</p>
          <div class="spinner"></div>
        </div>
      `,onError:e=>u`
        <div class="card empty-state">
          <p class="error-text">Failed to load analytics: ${e.message}</p>
        </div>
      `})}function un(){let e=B.stats();return u`
    <div>
      <div class="stats-grid">
        ${R({value:e.totalRenders,label:"Total Renders"})}
        ${R({value:e.avgDuration.toFixed(2)+"ms",label:"Avg Duration"})}
        ${R({value:e.slowestRender?e.slowestRender.duration.toFixed(2)+"ms":"N/A",label:"Slowest Render"})}
        ${R({value:e.totalErrors,label:"Total Errors"})}
      </div>

      <div class="card">
        <h3>DevTools Performance Data <span class="feature-badge">DevTools</span></h3>
        <p class="card-description">
          The devtools hook monitors every effect execution. Connect to APM via the observer.
        </p>
        <button class="btn btn-ghost" onclick=${()=>{B.clear(),$(A).add("DevTools data cleared")}}>Clear Stats</button>
      </div>

      <div class="card section-gap">
        <h3>Observability Events <span class="feature-badge">Observer</span></h3>
        <p class="card-description">
          Check the browser console to see structured events being emitted.
        </p>
        <div class="btn-row">
          <button class="btn btn-ghost btn-sm" onclick=${()=>k.emit("navigate",{from:"/analytics",to:"/test"})}>Emit Navigate</button>
          <button class="btn btn-ghost btn-sm" onclick=${()=>k.metric("test-metric",Math.random()*100)}>Emit Metric</button>
          <button class="btn btn-ghost btn-sm" onclick=${()=>k.log("info","Test log message",{source:"analytics"})}>Emit Log</button>
        </div>
      </div>
    </div>
  `}function fn(){return u`
    <div>
      <div class="card">
        <h3>Plugin System <span class="feature-badge">Plugins</span></h3>
        <p class="card-description">
          Plugins extend onefold with isolated lifecycle management and permissions.
        </p>
        <div class="plugin-list">
          ${N.list().map(e=>u`
            <div class="plugin-item">
              <div class="plugin-info">
                <span class="plugin-name">${e}</span>
                <span class="badge badge-done">${N.getStatus(e)}</span>
              </div>
              <div class="btn-row">
                <button class="btn btn-ghost btn-sm" onclick=${()=>{N.stopPlugin(e),$(A).add(`Plugin "${e}" stopped`)}}>Stop</button>
                <button class="btn btn-ghost btn-sm" onclick=${()=>{N.startPlugin(e),$(A).add(`Plugin "${e}" started`)}}>Start</button>
              </div>
            </div>
          `)}
        </div>
      </div>

      <div class="card section-gap">
        <h3>Security Features <span class="feature-badge">Security</span></h3>
        <p class="card-description">
          onefold uses textContent by default. The raw() function provides sanitized HTML.
        </p>
        <div class="code-block">
          ${Ee("<strong>This is sanitized HTML via raw()</strong> \u2014 safe to use")}
        </div>
        <div class="code-block">
          XSS attempt (auto-escaped): ${'<script>alert("xss")<\/script>'}
        </div>
      </div>

      <div class="card section-gap">
        <h3>RBAC Guards <span class="feature-badge">Guards</span></h3>
        <p class="card-description">
          Permission-based access control. Current: admin, tasks:read/write, users:read, analytics:read
        </p>
        <div class="badge-row">
          ${()=>q(["admin"],()=>u`<span class="badge badge-done">Admin Access</span>`)}
          ${()=>q(["tasks:write"],()=>u`<span class="badge badge-done">Tasks Write</span>`)}
          ${()=>q(["billing:manage"],()=>u`<span class="badge badge-high">Billing</span>`,()=>u`<span class="badge badge-todo">Billing (no access)</span>`)}
        </div>
        <p class="card-description">
          hasPermission('admin'): ${()=>Be("admin")?"true":"false"} |
          hasAnyPermission(['billing:manage','admin']): ${()=>We(["billing:manage","admin"])?"true":"false"}
        </p>
      </div>
    </div>
  `}function Dt(){let e=te({name:{initial:"",rules:[O("Name is required"),Z(2)]},contactEmail:{initial:"",rules:[O("Email is required"),je("Invalid email format")]},bio:{initial:"",rules:[ee(500,"Bio must be under 500 characters")]}});return u`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("settings.title")}<span class="feature-badge">Persist + Theme + i18n + Forms</span></h2>
      </div>

      <div class="settings-grid">
        <div class="card">
          <div class="settings-section">
            <h3>${()=>v.t("settings.theme")}</h3>
            <div class="setting-row">
              <span>Dark Mode</span>
              <button
                class=${()=>`toggle ${L.current()==="dark"?"on":""}`}
                onclick=${()=>L.toggle()}
                aria-label="Toggle dark mode"
                role="switch"
                aria-checked=${()=>L.current()==="dark"?"true":"false"}
              ></button>
            </div>
            <div class="setting-row">
              <span>Current Theme</span>
              <span class="setting-value">${()=>L.current()}</span>
            </div>
          </div>

          <div class="settings-section">
            <h3>${()=>v.t("settings.language")}</h3>
            <div class="setting-row">
              <span>Locale</span>
              <select class="form-select inline-select"
                onchange=${t=>se.set(t.target.value)}
              >
                <option value="en" selected>English</option>
                <option value="es">Espanol</option>
              </select>
            </div>
            <div class="setting-row">
              <span>Active Locale</span>
              <span class="setting-value">${()=>v.locale()}</span>
            </div>
          </div>

          <div class="settings-section">
            <h3>${()=>v.t("settings.notifications")}</h3>
            <div class="setting-row">
              <span>Enable Notifications</span>
              <button
                class=${()=>`toggle ${ie()?"on":""}`}
                onclick=${()=>ie.set(!ie())}
                aria-label="Toggle notifications"
                role="switch"
                aria-checked=${()=>ie()?"true":"false"}
              ></button>
            </div>
            <div class="setting-row">
              <span>Sidebar Collapsed</span>
              <button
                class=${()=>`toggle ${C()?"on":""}`}
                onclick=${()=>C.set(!C())}
                aria-label="Toggle sidebar"
                role="switch"
                aria-checked=${()=>C()?"true":"false"}
              ></button>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Profile Form <span class="feature-badge">Form Validation</span></h3>
          <div class="form-body">
            <div class="form-group">
              <label class="form-label">${()=>v.t("form.name")}</label>
              <input class="form-input" type="text" oninput=${e.fields.name.handle} placeholder="Your name" />
              <div class="form-error">${()=>e.fields.name.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">${()=>v.t("form.email")}</label>
              <input class="form-input" type="email" oninput=${e.fields.contactEmail.handle} placeholder="your@email.com" />
              <div class="form-error">${()=>e.fields.contactEmail.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-input" rows="4" oninput=${e.fields.bio.handle} placeholder="Tell us about yourself..."></textarea>
              <div class="form-error">${()=>e.fields.bio.error()}</div>
            </div>
            <div class="btn-row">
              <button class="btn btn-primary" onclick=${()=>e.submit(t=>{$(A).add(`Profile saved for ${t.name}`),I("Profile saved successfully")})}>${()=>v.t("common.save")}</button>
              <button class="btn btn-ghost" onclick=${()=>e.reset()}>${()=>v.t("form.reset")}</button>
            </div>
            <p class="form-status">
              Form valid: ${()=>e.valid()?"Yes":"No"} |
              Dirty: ${()=>e.dirty()?"Yes":"No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  `}function It(){return u`
    <div class="card empty-state">
      <h2 class="error-code">404</h2>
      <p class="error-text">Page not found</p>
      <button class="btn btn-primary" onclick=${()=>V("/")}>Go Home</button>
    </div>
  `}function ve(){return u`
    <div class="card empty-state">
      <h2 class="access-denied-title">Access Denied</h2>
      <p class="error-text">You don't have permission to view this page.</p>
      <button class="btn btn-primary" onclick=${()=>V("/")}>Go Home</button>
    </div>
  `}var mn=Ae`
  .app-shell {
    display: flex;
    min-height: 100vh;
    background: var(--app-bg);
    color: var(--text-primary);
    transition: background 0.3s, color 0.3s;
  }

  .sidebar {
    width: 260px;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    overflow: hidden;
  }
  .sidebar.collapsed { width: 60px; }
  .sidebar-header {
    padding: 0 20px;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sidebar-header h1 { font-size: 18px; white-space: nowrap; }
  .sidebar-logo { font-size: 24px; }
  .sidebar-footer { margin-top: auto; padding: 12px 20px; }
  .sidebar-version { font-size: 11px; color: rgba(255,255,255,0.5); }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: var(--sidebar-text);
    text-decoration: none;
    transition: background 0.2s;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-size: 14px;
  }
  .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); }
  .nav-item .icon { width: 20px; text-align: center; flex-shrink: 0; }

  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  .topbar {
    height: 60px;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  .topbar-left { display: flex; align-items: center; gap: 16px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .topbar-subtitle { font-size: 14px; color: var(--text-secondary); }
  .locale-select {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 12px;
  }
  .user-info { display: flex; align-items: center; gap: 8px; }
  .user-avatar-sm {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px;
  }
  .user-name { font-size: 13px; }

  .content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-ghost { background: transparent; color: var(--text-primary); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--border); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-row { display: flex; gap: 12px; }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
  }
  .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .card-description { margin-top: 12px; color: var(--text-secondary); font-size: 13px; }
  .section-gap { margin-top: 16px; }

  .badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-todo { background: #dbeafe; color: #1e40af; }
  .badge-in-progress { background: #fef3c7; color: #92400e; }
  .badge-done { background: #d1fae5; color: #065f46; }
  .badge-high { background: #fee2e2; color: #991b1b; }
  .badge-medium { background: #fef3c7; color: #92400e; }
  .badge-low { background: #d1fae5; color: #065f46; }
  .badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

  .notification-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .toast-item {
    background: var(--card-bg);
    border: 1px solid var(--border);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    font-size: 14px;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .stat-value { font-size: 32px; font-weight: 700; color: var(--accent); }
  .stat-label { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

  .task-grid { display: grid; gap: 12px; }
  .task-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
  }
  .task-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .task-info { flex: 1; }
  .task-title { font-weight: 600; margin-bottom: 4px; }
  .task-desc { font-size: 13px; color: var(--text-secondary); }
  .task-meta { display: flex; gap: 8px; margin-top: 8px; }
  .task-assignee { font-size: 12px; color: var(--text-secondary); }

  .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .filter-btn {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  .filter-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .filter-count { margin-left: auto; font-size: 13px; color: var(--text-secondary); }
  .search-input {
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
    width: 240px;
    transition: all 0.2s;
  }
  .search-input:focus { outline: none; border-color: var(--accent); width: 300px; }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  .modal h2 { margin-bottom: 20px; font-size: 20px; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); }
  .form-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .form-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
  .form-error { color: var(--danger); font-size: 12px; margin-top: 4px; min-height: 16px; }
  .form-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
  }
  .inline-select { width: auto; }
  .form-body { margin-top: 16px; }
  .form-status { margin-top: 12px; font-size: 12px; color: var(--text-secondary); }

  .user-grid { display: grid; gap: 12px; }
  .user-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  .user-avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 18px;
  }
  .user-details { flex: 1; }
  .user-name { font-weight: 600; }
  .user-email { font-size: 13px; color: var(--text-secondary); }
  .user-company { font-size: 12px; color: var(--text-secondary); }

  .virtual-list-section { margin-top: 24px; }
  .virtual-list-section h3 { margin-bottom: 12px; }
  .virtual-row {
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .virtual-row-id { width: 60px; color: var(--text-secondary); }
  .virtual-row-name { flex: 1; font-weight: 500; }
  .virtual-row-value { width: 100px; text-align: right; color: var(--accent); }

  .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .settings-section { margin-bottom: 24px; }
  .settings-section h3 { margin-bottom: 12px; font-size: 16px; }
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .setting-value { color: var(--accent); font-weight: 600; }
  .toggle {
    width: 44px; height: 24px;
    border-radius: 12px;
    background: var(--border);
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    border: none;
  }
  .toggle.on { background: var(--accent); }
  .toggle::after {
    content: '';
    width: 20px; height: 20px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px; left: 2px;
    transition: transform 0.2s;
  }
  .toggle.on::after { transform: translateX(20px); }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .page-header h2 { font-size: 24px; font-weight: 700; }
  .feature-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    background: var(--accent);
    color: white;
    margin-left: 8px;
    vertical-align: middle;
  }
  .feature-grid { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 12px; }
  .feature-item { padding: 8px 12px; background: var(--app-bg); border-radius: 6px; font-size: 13px; border: 1px solid var(--border); }

  .empty-state { text-align: center; padding: 40px; }
  .error-text { color: var(--danger); }
  .error-code { font-size: 48px; color: var(--text-secondary); }
  .access-denied-title { font-size: 32px; color: var(--danger); }

  .todo-list { margin-top: 12px; max-height: 300px; overflow-y: auto; }
  .todo-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .todo-check { font-size: 16px; color: var(--text-secondary); }
  .todo-check.done { color: var(--success); }
  .todo-text.completed { text-decoration: line-through; color: var(--text-secondary); }

  .code-block { margin-top: 8px; padding: 12px; background: var(--app-bg); border-radius: 8px; font-family: monospace; font-size: 13px; }

  .plugin-list { margin-top: 16px; }
  .plugin-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .plugin-info { display: flex; align-items: center; gap: 8px; }
  .plugin-name { font-weight: 600; }

  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 12px auto 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;function gn(){nt({Escape:()=>I("Modal closed"),"Ctrl+K":()=>{let t=document.querySelector(".search-input");t&&t.focus(),I("Search focused")}});let e=Ie([{path:"/",view:()=>Ht()},{path:"/tasks",view:re(["tasks:read"],()=>Nt(),()=>ve())},{path:"/users",view:re(["users:read"],()=>Mt(),()=>ve())},{path:"/analytics",view:re(["analytics:read"],()=>Ot(),()=>ve())},{path:"/settings",view:()=>Dt()}],()=>It());return u`
    <div class=${mn.scope}>
      ${rt("#main-content")}
      ${At()}
      <div class="app-shell">
        ${Pt()}
        <div class="main-area">
          ${Ct()}
          <main class="content" id="main-content" role="main">
            ${e}
          </main>
        </div>
      </div>
    </div>
  `}Re(gn(),document.getElementById("app"));console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");console.log(" onefold Comprehensive Demo");console.log(" Features: 22+");console.log(" DevTools:",B.active?"enabled":"disabled");console.log(" Plugins:",N.list().join(", "));console.log(" Theme:",L.current());console.log(" Locale:",v.locale());console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
