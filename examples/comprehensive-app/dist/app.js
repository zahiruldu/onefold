var Te=null;function et(e){Te=e}function tt(e,t){Te?Te(e,t):t()}var Gt=new Map;function nt(e){return Gt.get(e)}var U=null,re=0,we=new Set,W=0,ke=null,Yt=200,Se=class{constructor(t,n){this.deps=new Set;this.active=!0;this.fn=t,this.label=n}run(){if(!this.active)return;this.cleanup();let t=U;U=this;try{tt(this.label,this.fn)}finally{U=t}}cleanup(){for(let t of this.deps)t.subscribers.delete(this);this.deps.clear()}dispose(){this.active=!1,this.cleanup()}},Ee=class{constructor(t){this.value=t;this.subscribers=new Set}get(){return U&&(this.subscribers.add(U),U.deps.add(this)),this.value}set(t){let n=typeof t=="function"?t(this.value):t;Object.is(n,this.value)||(this.value=n,typeof __DEV__<"u"&&__DEV__&&(W++,ke||(ke=setTimeout(()=>{W=0,ke=null},1e3)),W>Yt&&(console.warn(`[onefold] Signal updated ${W} times in <1s. Possible infinite loop in an effect.`),W=0)),this.notify())}peek(){return this.value}notify(){if(re>0)for(let t of this.subscribers)we.add(t);else{let t=Array.from(this.subscribers);for(let n=0;n<t.length;n++)t[n].run()}}};function b(e){let t=new Ee(e),n=(()=>t.get());return n.set=o=>t.set(o),n.peek=()=>t.peek(),n}function y(e,t="effect"){let n=t;if(typeof __DEV__<"u"&&__DEV__&&t==="effect")try{let i=(new Error().stack??"").split(`
`);for(let s=2;s<i.length&&s<8;s++){let a=i[s]?.trim()??"";if(!a||/\bcreateEffect\b|\bcreateComputed\b|\bbindReactive\b|\bapplyAttr\b|\bbuildDom\b|\bappendExpr\b|\brunWithHook\b|ReactiveEffect/.test(a))continue;let c=a.match(/at\s+([A-Z]\w+)\s+\(/);if(c){let d=a.match(/:(\d+):\d+\)?$/);n=d?`${c[1]} (:${d[1]})`:c[1];break}let l=a.match(/([^/\\:]+):(\d+):\d+\)?$/);if(l){n=`${l[1]}:${l[2]}`;break}}}catch{}let o=new Se(e,n);return o.run(),()=>o.dispose()}function se(e){let t=b(void 0);y(()=>t.set(e()),"computed");let n=(()=>t());return n.peek=t.peek,n.set=()=>{throw new Error("[onefold] Cannot write to a computed signal.")},n}function _(e){re++;try{e()}finally{if(re--,re===0){let t=[...we];we.clear();for(let n of t)n.run()}}}var Jt=/^\s*(javascript|data|vbscript):/i,Xt=/^on/i;function $e(e){return Jt.test(e)}function ae(e){return Xt.test(e)}function Re(e){let t=document.createElement("template");t.innerHTML=e;let n=o=>{let r=[];o.childNodes.forEach(i=>{if(i.nodeType===Node.ELEMENT_NODE){let s=i,a=s.tagName.toLowerCase();if(a==="script"||a==="style"||a==="iframe"||a==="object"||a==="embed"||a==="form"){r.push(i);return}Array.from(s.attributes).forEach(c=>{(ae(c.name)||(c.name==="href"||c.name==="src")&&$e(c.value))&&s.removeAttribute(c.name)}),n(s)}}),r.forEach(i=>i.remove())};return n(t.content),t.innerHTML}var ie=null;function Qt(){return ie||(typeof window<"u"&&window.trustedTypes&&(ie=window.trustedTypes.createPolicy("onefold-sanitized",{createHTML:e=>Re(e)})),ie)}function Ce(e){let t=Qt();return t?t.createHTML(e):Re(e)}function Pe(e){return{__onefoldRaw:!0,html:Re(e)}}function Ae(e){return typeof e=="object"&&e!==null&&e.__onefoldRaw===!0}function Le(e,t){t.replaceChildren(e)}var le=new WeakMap,He=null;function Zt(){if(He||typeof MutationObserver>"u"||typeof document>"u")return;He=new MutationObserver(t=>{for(let n of t)n.removedNodes.forEach(ot)});let e=document.documentElement??document;He.observe(e,{childList:!0,subtree:!0})}function ot(e){let t=le.get(e);if(t){for(let n of t)try{n()}catch(o){console.error("[onefold] Error while disposing a reactive binding:",o)}le.delete(e)}e.childNodes.forEach(ot)}function D(e,t){Zt();let n=le.get(e);n||(n=new Set,le.set(e,n)),n.add(t)}var rt=null;var F="\0nf_",j=/\x00nf_(\d+)\x00/g;function en(e){return`${F}${e}\0`}function S(e,t){return e.charAt(t)}function Ne(e){return parseInt(e[1]??"0",10)}function tn(e,t){let n="";for(let s=0;s<e.length;s++)n+=e[s],s<t.length&&(n+=en(s));let o=[],r=0,i=n.length;for(;r<i;){if(S(n,r)==="<"){if(n.startsWith("<!--",r)){let u=n.indexOf("-->",r+4);r=u===-1?i:u+3;continue}if(S(n,r+1)==="/"){let u=n.indexOf(">",r),g=n.slice(r+2,u).trim();o.push({kind:1,tag:g}),r=u+1;continue}let c=nn(n,r),l=S(n,c-1)==="/",d=n.slice(r+1,l?c-1:c),{tag:f,attrs:h}=on(d,t);o.push({kind:0,tag:f});for(let u of h)o.push(u);l&&o.push({kind:1,tag:f}),r=c+1;continue}let s=n.indexOf("<",r),a=s===-1?n.slice(r):n.slice(r,s);if(r=s===-1?i:s,a.trim()||j.test(a)){j.lastIndex=0;let c=0,l;for(;(l=j.exec(a))!==null;){let f=a.slice(c,l.index);f&&o.push({kind:3,value:f}),o.push({kind:4,value:t[Ne(l)]}),c=l.index+l[0].length}let d=a.slice(c);d&&d.trim()&&o.push({kind:3,value:d})}}return o}function nn(e,t){let n=null;for(let o=t+1;o<e.length;o++){let r=S(e,o);if(n)r===n&&(n=null);else if(r==='"'||r==="'")n=r;else if(r===">")return o}return e.length-1}function G(e){return e===" "||e==="	"||e===`
`||e==="\r"||e==="\f"}function on(e,t){let n=e.search(/[\s/]/),o=n===-1?e:e.slice(0,n),r=[];if(n===-1)return{tag:o,attrs:r};let i=e.slice(n).trim();if(!i)return{tag:o,attrs:r};let s=0,a=i.length;for(;s<a;){for(;s<a&&G(S(i,s));)s++;if(s>=a)break;if(i.startsWith(F,s)){let d=i.indexOf("\0",s+F.length),f=parseInt(i.slice(s+F.length,d),10),h=t[f];if(h&&typeof h=="object")for(let[u,g]of Object.entries(h))r.push({kind:2,name:u,value:g});s=d+1;continue}let c=s;for(;s<a&&S(i,s)!=="="&&!G(S(i,s));)s++;let l=i.slice(c,s);if(!l){s++;continue}for(;s<a&&G(S(i,s));)s++;if(s>=a||S(i,s)!=="="){r.push({kind:2,name:l,value:!0});continue}for(s++;s<a&&G(S(i,s));)s++;if(i.startsWith(F,s)){let d=i.indexOf("\0",s+F.length),f=parseInt(i.slice(s+F.length,d),10);r.push({kind:2,name:l,value:t[f]}),s=d+1}else if(S(i,s)==='"'||S(i,s)==="'"){let d=S(i,s);s++;let f=s;for(;s<a&&S(i,s)!==d;)s++;let h=i.slice(f,s);s++,r.push({kind:2,name:l,value:st(h,t)})}else{let d=s;for(;s<a&&!G(S(i,s));)s++;let f=i.slice(d,s);r.push({kind:2,name:l,value:st(f,t)})}}return{tag:o,attrs:r}}function st(e,t){j.lastIndex=0;let n=j.exec(e);if(!n)return e;if(n.index===0&&n[0].length===e.length)return t[Ne(n)];j.lastIndex=0;let o=[],r=0,i;for(;(i=j.exec(e))!==null;){i.index>r&&o.push(e.slice(r,i.index));let s=t[Ne(i)];o.push(typeof s=="function"?s:()=>s),r=i.index+i[0].length}return r<e.length&&o.push(e.slice(r)),()=>o.map(s=>typeof s=="function"?s():s).join("")}function rn(e){let t=document.createDocumentFragment(),n=[t],o=t;for(let r of e)switch(r.kind){case 0:{let i=document.createElement(r.tag);o.appendChild(i),n.push(i),o=i;break}case 1:{if(typeof __DEV__<"u"&&__DEV__){let i=o,s=i.tagName?.toLowerCase();(s==="input"||s==="textarea")&&!i.hasAttribute("value")&&i.getAttribute("data-nf-has-input")==="1"&&console.warn(`[onefold] <${s}> has oninput/onchange but no value=\${() => signal()} binding. The input won't clear on signal.set('') or form.reset(). Add: value=\${() => yourSignal()} for two-way binding.`,i)}n.pop(),o=n.length>0?n[n.length-1]:t;break}case 2:{sn(o,r.name,r.value);break}case 3:{o.appendChild(document.createTextNode(r.value));break}case 4:{it(o,r.value);break}}return t.childNodes.length===1&&t.firstChild instanceof HTMLElement?t.firstChild:t}function sn(e,t,n){if(t==="ref"){typeof n=="function"&&n(e);return}if(t==="class"){ce(n,o=>an(e,o),e);return}if(t==="style"){ce(n,o=>{typeof o=="string"?e.style.cssText=o:Object.assign(e.style,o??{})},e);return}if(ae(t)&&typeof n=="function"){if(e.addEventListener(t.slice(2).toLowerCase(),n),typeof __DEV__<"u"&&__DEV__){let o=t.slice(2).toLowerCase();(o==="input"||o==="change")&&e.setAttribute("data-nf-has-input","1")}return}if(t.startsWith("d-")){let o=nt(t.slice(2));o?ce(n,r=>o(e,r),e):console.warn(`[onefold] No directive registered for "${t}". Call registerDirective() first.`);return}ce(n,o=>ln(e,t,o),e)}function ce(e,t,n){if(typeof e=="function"){let o=y(()=>t(e()));D(n,o)}else t(e)}function an(e,t){t?typeof t=="string"?e.className=t:typeof t=="object"&&(e.className=Object.entries(t).filter(([,n])=>n).map(([n])=>n).join(" ")):e.className=""}function ln(e,t,n){if(n===!1||n==null){e.removeAttribute(t);return}if(n===!0){e.setAttribute(t,"");return}let o=String(n);if(ae(t)){console.warn(`[onefold] Blocked string event handler "${t}". Use a function instead.`);return}if((t==="href"||t==="src"||t==="action"||t==="formaction"||t==="xlink:href")&&$e(o)){console.warn(`[onefold] Blocked unsafe "${t}" value:`,o),e.removeAttribute(t);return}if(t==="value"&&"value"in e){e.value=o;return}if(t==="checked"&&e instanceof HTMLInputElement){e.checked=n===!0||o==="true"||o==="";return}if(t==="selected"&&e instanceof HTMLOptionElement){e.selected=n===!0||o==="true"||o==="";return}e.setAttribute(t,o)}function it(e,t){if(!(t==null||t===!1||t===!0)){if(t instanceof Node){e.appendChild(t);return}if(Array.isArray(t)){for(let n of t)it(e,n);return}if(typeof t=="function"){let n=document.createComment("expr-start"),o=document.createComment("expr-end");e.appendChild(n),e.appendChild(o);let r=y(()=>{let i=t(),s=n.parentNode;if(!s)return;let a=n.nextSibling;for(;a&&a!==o;){let l=a.nextSibling;s.removeChild(a),a=l}let c=at(i);s.insertBefore(c,o)});D(e,r);return}if(Ae(t)){let n=document.createElement("span");n.innerHTML=Ce(t.html),e.appendChild(n);return}e.appendChild(document.createTextNode(String(t)))}}function at(e){if(e==null||e===!1||e===!0)return document.createComment("");if(e instanceof Node)return e;if(Ae(e)){let t=document.createElement("span");return t.innerHTML=Ce(e.html),t}if(Array.isArray(e)){let t=document.createDocumentFragment();for(let n of e)t.appendChild(at(n));return t}return document.createTextNode(String(e))}function p(e,...t){if(rt)return rt(e,...t);let n=tn(e,t);return rn(n)}var cn=0,lt=new Map;function dn(){return`nf-${(cn++).toString(36)}`}function dt(e,t){let n=`.${t}`,o="",r=0,i=e.length;for(;r<i;){for(;r<i&&/\s/.test(e[r]);)o+=e[r],r++;if(r>=i)break;if(e[r]==="@"){let d=r;for(;r<i&&e[r]!=="{";)r++;o+=e.slice(d,r),r<i&&(o+=e[r],r++);let f=ct(e,r-1),h=f.slice(1,-1);o+=dt(h,t),o+="}",r+=f.length-1;continue}let s=r;for(;r<i&&e[r]!=="{";)r++;let a=e.slice(s,r).trim();if(!a||r>=i)break;let c=a.split(",").map(d=>(d=d.trim(),d&&(d===":root"||d===":host"?n:d.startsWith("&")?n+d.slice(1):`${n} ${d}`))).join(", ");o+=c;let l=ct(e,r);o+=l,r+=l.length}return o}function ct(e,t){if(e[t]!=="{")return"";let n=0,o=t;for(;o<e.length;){if(e[o]==="{")n++;else if(e[o]==="}"&&(n--,n===0))return e.slice(t,o+1);o++}return e.slice(t)}function un(e,t){if(typeof document>"u"||document.getElementById(t))return;let n=document.createElement("style");n.id=t,n.textContent=e,document.head.appendChild(n)}function De(e,...t){let n="";for(let a=0;a<e.length;a++)n+=e[a],a<t.length&&(n+=String(t[a]));let o=lt.get(n);if(o)return o;let r=dn(),i=dt(n,r);un(i,`style-${r}`);let s={scope:r,css:i};return lt.set(n,s),s}var Y=null,Me=null;function Oe(){return Me===null&&(Me=typeof window<"u"&&window.location.protocol==="file:"),Me}function ut(){return typeof window>"u"?"/":Oe()?window.location.hash.slice(1)||"/":window.location.pathname}function Ie(){if(Y)return Y;if(Y=b(ut()),typeof window<"u"){let e=Oe()?"hashchange":"popstate";window.addEventListener(e,()=>Y.set(ut()))}return Y}function V(e){if(typeof window>"u")return;let t=Ie();Oe()?(window.location.hash=e,t.set(e)):(window.history.pushState({},"",e),t.set(e))}function J(){return Ie()()}function pn(e,t){let n=e.split("/"),o=t.split("/");if(n.length!==o.length)return null;let r={};for(let i=0;i<n.length;i++){let s=n[i],a=o[i];if(s.startsWith(":"))try{r[s.slice(1)]=decodeURIComponent(a)}catch{r[s.slice(1)]=a}else if(s!==a)return null}return r}function fn(e,t){if(e==="/")return{};let n=e.split("/").filter(Boolean),o=t.split("/").filter(Boolean);if(o.length<n.length)return null;let r={};for(let i=0;i<n.length;i++){let s=n[i],a=o[i];if(s.startsWith(":"))try{r[s.slice(1)]=decodeURIComponent(a)}catch{r[s.slice(1)]=a}else if(s!==a)return null}return r}function pt(e,t,n,o=""){for(let r of e){let i=gn(o,r.path);if(r.children&&r.children.length>0){let s=fn(i,t);if(s!==null){let c=pt(r.children,t,n,i)??n();return r.view(s,c)}}else{let s=pn(i,t);if(s!==null)return r.view(s)}}return null}function gn(e,t){if(!e||e==="/")return t;if(t==="/")return e;let n=e.endsWith("/")?e.slice(0,-1):e,o=t.startsWith("/")?t:"/"+t;return n+o}function _e(e,t){let n=Ie(),o=document.createElement("div"),r=y(()=>{let i=n(),s=null;if(Array.isArray(e))s=pt(e,i,t,"");else{let a=e[i];a&&(s=a())}o.textContent="",o.appendChild(s??t())});return D(o,r),o}function Fe(e){let t=b(e);return t.update=n=>{t.set(o=>({...o,...typeof n=="function"?n(o):n}))},t}function je(e,t){let n=b(void 0),o=b(!1),r=b(void 0),i=0,s=l=>{let d=++i;o.set(!0),r.set(void 0),t(l).then(f=>{d===i&&(n.set(f),o.set(!1))}).catch(f=>{d===i&&(r.set(f),o.set(!1))})},a,c=y(()=>{let l=e();a=l,s(l)});return{data:n,loading:o,error:r,refetch:()=>s(a),dispose:()=>{c(),i++}}}function Ke(e,t){let n=document.createElement("div");n.setAttribute("data-error-boundary","");function o(){n.textContent="";try{let r=e();n.appendChild(r)}catch(r){let i=r instanceof Error?r:new Error(String(r));n.appendChild(t(i,o))}}return o(),n}function Q(e){return{id:Symbol(e)}}var ze=new Map,X=[];function Z(e,t){X.length>0?X[X.length-1].set(e.id,t):ze.set(e.id,t)}function $(e){for(let t=X.length-1;t>=0;t--){let n=X[t];if(n.has(e.id))return n.get(e.id)}if(ze.has(e.id))return ze.get(e.id);throw new Error(`[onefold] No provider found for token: ${e.id.toString()}`)}var Ue=null;function ft(e){Ue=e}function Ve(){return Ue?Ue():new Set}function gt(e){return Ve().has(e)}function mt(e){let t=Ve();return e.some(n=>t.has(n))}function de(e,t,n){return o=>vt(e)?t(o):n?n(o):document.createComment("unauthorized")}function q(e,t,n){return vt(e)?t():n?n():null}function vt(e){let t=Ve();return typeof e=="function"?e(t):typeof e=="string"?t.has(e):e.every(n=>t.has(n))}var mn='a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';function bt(e){let t=null,n=!1;function o(){return Array.from(e.querySelectorAll(mn))}function r(i){if(i.key!=="Tab")return;let s=o();if(s.length===0)return;let a=s[0],c=s[s.length-1];i.shiftKey&&document.activeElement===a?(i.preventDefault(),c.focus()):!i.shiftKey&&document.activeElement===c&&(i.preventDefault(),a.focus())}return{get active(){return n},activate(){t=document.activeElement,n=!0,e.addEventListener("keydown",r);let i=o();i.length>0?i[0].focus():e.focus()},deactivate(){n=!1,e.removeEventListener("keydown",r),t?.focus(),t=null}}}var L=null;function vn(){return L&&L.isConnected||(L=document.createElement("div"),L.setAttribute("aria-live","polite"),L.setAttribute("aria-atomic","true"),L.setAttribute("role","status"),Object.assign(L.style,{position:"absolute",width:"1px",height:"1px",padding:"0",margin:"-1px",overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",border:"0"}),document.body.appendChild(L)),L}function K(e,t="polite"){let n=vn();n.setAttribute("aria-live",t),n.textContent="",setTimeout(()=>{n.textContent=e},50)}function ht(e,t){let n=new Map(Object.entries(e)),o=t??document;function r(s){let a=[];(s.ctrlKey||s.metaKey)&&a.push("Ctrl"),s.shiftKey&&a.push("Shift"),s.altKey&&a.push("Alt");let c=s.key.length===1?s.key.toUpperCase():s.key;return a.push(c),a.join("+")}function i(s){let a=r(s),c=n.get(a);c&&(s.preventDefault(),c(s))}return o.addEventListener("keydown",i),{destroy:()=>o.removeEventListener("keydown",i),add:(s,a)=>n.set(s,a),remove:s=>n.delete(s)}}function xt(e,t="Skip to main content"){let n=document.createElement("a");return n.href=e,n.textContent=t,n.className="nf-skip-link",Object.assign(n.style,{position:"absolute",top:"-100%",left:"0",padding:"8px 16px",background:"#1f2937",color:"#fff",fontSize:"14px",zIndex:"99999",textDecoration:"none",borderRadius:"0 0 4px 0",transition:"top 0.2s"}),n.addEventListener("focus",()=>{n.style.top="0"}),n.addEventListener("blur",()=>{n.style.top="-100%"}),n.addEventListener("click",o=>{o.preventDefault();let r=document.querySelector(e);r&&(r.setAttribute("tabindex","-1"),r.focus())}),n}function yt(e,t){let n=Object.keys(e),o=t??n[0]??"",r=b(o);return y(()=>{let i=r(),s=e[i];if(!s||typeof document>"u")return;let a=document.documentElement;for(let[c,l]of Object.entries(s))a.style.setProperty(`--${c}`,l)}),{current:r,set:i=>{e[i]&&r.set(i)},toggle:()=>{let i=n.indexOf(r());r.set(n[(i+1)%n.length])},themes:()=>n,tokens:()=>e[r()]??{}}}var H=yt({light:{"app-bg":"#f0f4f8","card-bg":"#ffffff","text-primary":"#1f2937","text-secondary":"#6b7280",accent:"#4f46e5","accent-hover":"#4338ca",border:"#e5e7eb",success:"#10b981",warning:"#f59e0b",danger:"#ef4444","sidebar-bg":"#1e293b","sidebar-text":"#f1f5f9"},dark:{"app-bg":"#0f172a","card-bg":"#1e293b","text-primary":"#f1f5f9","text-secondary":"#94a3b8",accent:"#818cf8","accent-hover":"#6366f1",border:"#334155",success:"#34d399",warning:"#fbbf24",danger:"#f87171","sidebar-bg":"#020617","sidebar-text":"#e2e8f0"}},"light");function Tt(e){let t=b(e.defaultLocale),n={...e.messages},o=e.fallbackLocale??e.defaultLocale,r=b(0);function i(l,d){let f=t();r();let u=n[f]?.[l]??n[o]?.[l]??l;if(d)for(let[g,m]of Object.entries(d))u=u.split(`{${g}}`).join(String(m));return u}function s(l){t.set(l)}function a(l,d){n[l]={...n[l],...d},r.set(f=>f+1)}function c(){return Object.keys(n)}return{locale:t,setLocale:s,t:i,addMessages:a,availableLocales:c}}var v=Tt({defaultLocale:"en",fallbackLocale:"en",messages:{en:{"app.title":"Task Dashboard","app.subtitle":"onefold Comprehensive Demo","nav.home":"Home","nav.tasks":"Tasks","nav.users":"Users","nav.settings":"Settings","nav.analytics":"Analytics","tasks.title":"Task Management","tasks.add":"Add Task","tasks.empty":"No tasks yet. Create your first task!","tasks.total":"{count} task(s)","users.title":"User Directory","settings.title":"Settings","settings.theme":"Theme","settings.language":"Language","settings.notifications":"Notifications","analytics.title":"Analytics Dashboard","form.name":"Name","form.email":"Email","form.submit":"Submit","form.reset":"Reset","common.save":"Save","common.cancel":"Cancel","common.delete":"Delete","common.edit":"Edit","common.loading":"Loading...","common.error":"Something went wrong"},es:{"app.title":"Panel de Tareas","app.subtitle":"Demo Completa de onefold","nav.home":"Inicio","nav.tasks":"Tareas","nav.users":"Usuarios","nav.settings":"Configuracion","nav.analytics":"Analiticas","tasks.title":"Gestion de Tareas","tasks.add":"Agregar Tarea","tasks.empty":"Sin tareas aun. Crea tu primera tarea!","tasks.total":"{count} tarea(s)","users.title":"Directorio de Usuarios","settings.title":"Configuracion","settings.theme":"Tema","settings.language":"Idioma","settings.notifications":"Notificaciones","analytics.title":"Panel de Analiticas","form.name":"Nombre","form.email":"Correo","form.submit":"Enviar","form.reset":"Reiniciar","common.save":"Guardar","common.cancel":"Cancelar","common.delete":"Eliminar","common.edit":"Editar","common.loading":"Cargando...","common.error":"Algo salio mal"}}});var kt=b(new Set(["admin","tasks:read","tasks:write","users:read","analytics:read"]));ft(kt);var Be=Q("AuthService"),qe=b({name:"Admin User",role:"admin"}),ue={user:qe,login:(e,t)=>qe.set({name:e,role:t}),logout:()=>qe.set(null)};Z(Be,ue);var A=Q("NotificationService"),We=b([]),wt={notifications:We,add:e=>{We.set(t=>[...t.slice(-4),e]),K(e)},clear:()=>We.set([])};Z(A,wt);function St(){let e=new Map;function t(c,l){e.has(c)||e.set(c,new Set);let d=e.get(c);return d.add(l),()=>{d.delete(l)}}function n(c,l){let d={...l,timestamp:Date.now()},f=e.get(c);if(f)for(let h of f)h(d)}function o(c,l){let d=performance.now(),f=l(),h=performance.now()-d;return n("render",{component:c,duration:h}),f}function r(c,l){try{return c()}catch(d){n("error",{error:d,context:l});return}}function i(c,l,d){n("metric",{name:c,value:l,tags:d})}function s(c,l,d){n("log",{level:c,message:l,data:d})}function a(){e.clear()}return{on:t,emit:n,trackRender:o,trackError:r,metric:i,log:s,clear:a}}var k=St();k.on("navigate",e=>{console.log(`[nav] ${e.from} \u2192 ${e.to}`)});k.on("error",e=>{console.error("[error]",e.error,e.context)});k.on("metric",e=>{console.log(`[metric] ${e.name}: ${e.value}`,e.tags)});function Et(){let e=new Map,t=new Map,n=new Map;function o(u,...g){let m=t.get(u);if(m)for(let w of m)w(...g)}function r(u){if(e.has(u.name))throw new Error(`[onefold] Plugin "${u.name}" is already registered.`);e.set(u.name,{definition:u,status:"registered",disposers:[],setupDisposer:null}),o("plugin:registered",u.name,u.version)}function i(u){let g=e.get(u);g&&(g.status==="active"&&a(u),e.delete(u))}function s(u){let g=e.get(u);if(!g||g.status==="active")return;let m=g.definition,w=m.sandbox!==!1,z=new Set(m.permissions??[]),T={name:m.name,permissions:z,hasPermission:x=>z.has(x),on:(x,E)=>{let C=`${u}:${x}`;n.has(C)||n.set(C,new Set);let O=n.get(C);O.add(E);let oe=()=>{O.delete(E)};return g.disposers.push(oe),oe},emit:(x,...E)=>{let C=`${u}:${x}`,O=n.get(C);if(O)for(let oe of O)oe(...E);o(`plugin:event:${x}`,u,...E)}};try{let x=m.setup(T);g.setupDisposer=typeof x=="function"?x:null,g.status="active",o("plugin:started",u)}catch(x){if(g.status="error",o("plugin:error",u,x),!w)throw x}}function a(u){let g=e.get(u);if(!g||g.status!=="active")return;let m=g.definition.sandbox!==!1;try{g.setupDisposer?.(),g.definition.teardown?.();for(let w of g.disposers)w();g.disposers.length=0}catch(w){if(o("plugin:error",u,w),!m)throw w}g.status="stopped",o("plugin:stopped",u)}function c(){for(let[u,g]of e)(g.status==="registered"||g.status==="stopped")&&s(u)}function l(){for(let[u,g]of e)g.status==="active"&&a(u)}function d(u){return e.get(u)?.status??null}function f(){return[...e.keys()]}function h(u,g){t.has(u)||t.set(u,new Set);let m=t.get(u);return m.add(g),()=>{m.delete(g)}}return{register:r,unregister:i,start:c,startPlugin:s,stop:l,stopPlugin:a,getStatus:d,list:f,on:h}}var N=Et();N.register({name:"analytics",version:"1.0.0",permissions:["observe","navigate"],setup:e=>(e.on("pageview",t=>{k.metric("pageview",1,{path:t})}),console.log(`[plugin] ${e.name} v1.0.0 loaded`),()=>console.log(`[plugin] ${e.name} unloaded`))});N.register({name:"perf-monitor",version:"1.0.0",permissions:["observe"],setup:e=>{let t=performance.now();e.on("check",()=>{k.metric("uptime",performance.now()-t)}),console.log(`[plugin] ${e.name} v1.0.0 loaded`)}});N.start();var bn=1,hn=1,Ge=new Map,Ye=new Map,pe=[],fe=[],Je=new Set;var Xe=null,ee=new Map;function $t(e,...t){let n=ee.get(e);if(n)for(let o of n)o(...t)}function Rt(){if(Xe)return Xe;let e=[],t=0;et((o,r)=>{let i=performance.now();try{r()}catch(l){throw t++,$t("error",l,o),l}let s=performance.now()-i,a="";try{let d=(new Error().stack??"").split(`
`),f=/devtools|signal|template|extend|lifecycle|runWithHook/i;for(let h=1;h<d.length;h++){let u=d[h]?.trim()??"";if(u&&!f.test(u)){let g=u.match(/at\s+(\S+)\s+\((.+)\)/)??u.match(/at\s+(.+)/);if(g){a=g[1]??u;let m=a.match(/([^/\\]+\.\w+:\d+)/);m&&(a=m[1])}break}}}catch{}let c={label:o,duration:s,timestamp:Date.now(),source:a};e.push(c),e.length>1e3&&e.shift(),$t("render",c)});let n={version:"0.1.1",active:!0,renders:e,signals:()=>{let o=[];for(let[,r]of Ge)o.push({id:r.id,label:r.label,value:r.getValue(),subscribers:r.getSubscriberCount(),lastUpdated:r.lastUpdated});return o},effects:()=>{let o=[];for(let[,r]of Ye)o.push({id:r.id,label:r.label,dependencies:r.getDependencyCount(),runCount:r.runCount,lastRun:r.lastRun,active:r.active});return o},stores:()=>[...pe],routes:()=>({current:fe[fe.length-1]??"/",history:[...fe]}),inspect:o=>{console.group("%c[onefold] Inspect Element","color:#4338CA;font-weight:bold"),console.log("Element:",o),console.log("Tag:",o.tagName.toLowerCase()),console.log("Classes:",o.className||"(none)"),console.log("Attributes:",Object.fromEntries(Array.from(o.attributes).map(r=>[r.name,r.value]))),console.log("Children:",o.childNodes.length),console.log("Text:",o.textContent?.substring(0,100)??""),console.log("Parent:",o.parentElement?.tagName.toLowerCase()??"(none)"),console.log("Data attrs:",Object.fromEntries(Array.from(o.attributes).filter(r=>r.name.startsWith("data-")).map(r=>[r.name,r.value]))),console.groupEnd()},highlight:o=>{let r=o.style.outline,i=o.style.transition;o.style.transition="outline 0.1s",o.style.outline="2px solid #4338CA",setTimeout(()=>{o.style.outline="2px solid transparent",setTimeout(()=>{o.style.outline=r,o.style.transition=i},300)},600)},trace:o=>(Je.add(o),console.log(`%c[onefold] Tracing "${o}" \u2014 changes will be logged`,"color:#4338CA"),()=>{Je.delete(o)}),stats:()=>{let o=e.length,r=o>0?e.reduce((s,a)=>s+a.duration,0)/o:0,i=[...e].sort((s,a)=>s.duration-a.duration);return{totalRenders:o,avgDuration:Math.round(r*100)/100,slowestRender:i.length>0?i[i.length-1]:null,fastestRender:i.length>0?i[0]:null,totalErrors:t,activeSignals:Ge.size,activeEffects:[...Ye.values()].filter(s=>s.active).length}},clear:()=>{e.length=0,t=0,Ge.clear(),Ye.clear(),pe.length=0,fe.length=0,Je.clear(),bn=1,hn=1},on:(o,r)=>(ee.has(o)||ee.set(o,new Set),ee.get(o).add(r),()=>{ee.get(o)?.delete(r)}),dump:()=>{let o=n.stats();if(console.group("%c[onefold devtools] State Dump","color:#4338CA;font-weight:bold;font-size:14px"),console.log("Version:",n.version),console.log(""),console.log("%cSignals (%d)","font-weight:bold",o.activeSignals),console.table(n.signals().map(i=>({id:i.id,label:i.label,value:typeof i.value=="object"?JSON.stringify(i.value):i.value,subscribers:i.subscribers}))),console.log(""),console.log("%cEffects (%d active)","font-weight:bold",o.activeEffects),console.table(n.effects().filter(i=>i.active).map(i=>({id:i.id,label:i.label,deps:i.dependencies,runs:i.runCount}))),console.log(""),console.log("%cPerformance","font-weight:bold"),console.log(`  Renders: ${o.totalRenders}`),console.log(`  Avg duration: ${o.avgDuration}ms`),console.log(`  Slowest: ${o.slowestRender?`${o.slowestRender.label} (${o.slowestRender.duration.toFixed(2)}ms) @ ${o.slowestRender.source}`:"N/A"}`),console.log(`  Errors: ${o.totalErrors}`),e.length>0&&(console.log(""),console.log("%cRecent Renders (last 10)","font-weight:bold"),console.table(e.slice(-10).map(i=>({label:i.label,duration:i.duration.toFixed(3)+"ms",source:i.source||"(internal)",time:new Date(i.timestamp).toLocaleTimeString()})))),console.log(""),pe.length>0){console.log("%cStores","font-weight:bold");for(let i of pe)console.log(`  ${i.label}:`,i.state);console.log("")}let r=n.routes();console.log("%cRouting","font-weight:bold"),console.log(`  Current: ${r.current}`),console.log(`  History: ${r.history.join(" \u2192 ")}`),console.groupEnd()}};return Xe=n,typeof window<"u"&&(window.__ONEFOLD_DEVTOOLS__=n,console.log("%c\u{1F537} onefold devtools enabled %cv"+n.version+"%c \u2014 type __ONEFOLD_DEVTOOLS__.dump() for full state","background:#4338CA;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold","background:#818CF8;color:#fff;padding:2px 6px;border-radius:3px;margin-left:4px","color:#64748b;margin-left:8px")),n}var B=Rt();B.on("render",e=>{let t=e;t.duration>5&&console.warn(`[perf] Slow effect: ${t.label} (${t.duration.toFixed(2)}ms)`)});var xn=new Set(["__proto__","constructor","prototype"]);function Qe(e){if(e===null||typeof e!="object")return e;if(Array.isArray(e))return e.map(Qe);let t={};for(let[n,o]of Object.entries(e))xn.has(n)||(t[n]=Qe(o));return t}var yn={get(e){if(typeof localStorage>"u")return;let t=localStorage.getItem(e);if(t!==null)try{return Qe(JSON.parse(t))}catch{return}},set(e,t){typeof localStorage>"u"||localStorage.setItem(e,JSON.stringify(t))},remove(e){typeof localStorage>"u"||localStorage.removeItem(e)}};function ge(e,t,n){let o=n?.storage??yn,r=n?.debounce??0,i=o.get(e),s=b(i!==void 0?i:t),a=null;y(()=>{let l=s();r>0?(a&&clearTimeout(a),a=setTimeout(()=>o.set(e,l),r)):o.set(e,l)});let c=s;return c.clear=()=>{a&&(clearTimeout(a),a=null),s.set(t),o.remove(e)},c}var M=Fe({tasks:[{id:1,title:"Implement authentication",description:"Add JWT-based auth flow",status:"done",priority:"high",assignee:"Alice",createdAt:"2024-01-15"},{id:2,title:"Design dashboard UI",description:"Create responsive layout",status:"in-progress",priority:"medium",assignee:"Bob",createdAt:"2024-01-16"},{id:3,title:"Write unit tests",description:"Cover critical paths",status:"todo",priority:"high",assignee:"Charlie",createdAt:"2024-01-17"},{id:4,title:"Setup CI/CD pipeline",description:"GitHub Actions workflow",status:"todo",priority:"medium",assignee:"Alice",createdAt:"2024-01-18"},{id:5,title:"API documentation",description:"OpenAPI spec for all endpoints",status:"in-progress",priority:"low",assignee:"Diana",createdAt:"2024-01-19"},{id:6,title:"Performance audit",description:"Lighthouse and bundle analysis",status:"todo",priority:"medium",assignee:"Bob",createdAt:"2024-01-20"}],filter:"all",searchQuery:""}),Ze=se(()=>{let e=M(),{tasks:t,filter:n,searchQuery:o}=e,r=t;if(n!=="all"&&(r=r.filter(i=>i.status===n)),o.trim()){let i=o.toLowerCase();r=r.filter(s=>s.title.toLowerCase().includes(i)||s.description.toLowerCase().includes(i)||s.assignee.toLowerCase().includes(i))}return r}),Ct=se(()=>{let{tasks:e}=M();return{total:e.length,todo:e.filter(t=>t.status==="todo").length,inProgress:e.filter(t=>t.status==="in-progress").length,done:e.filter(t=>t.status==="done").length,highPriority:e.filter(t=>t.priority==="high").length}}),P=ge("sidebar-collapsed",!1),te=ge("preferred-locale","en"),ne=ge("notifications-enabled",!0);y(()=>{v.setLocale(te())});function Pt(){return p`
    <aside class=${()=>`sidebar ${P()?"collapsed":""}`} role="navigation" aria-label="Main navigation">
      <div class="sidebar-header">
        <span class="sidebar-logo">◈</span>
        ${()=>P()?null:p`<h1>${()=>v.t("app.title")}</h1>`}
      </div>
      <nav>
        ${[{path:"/",icon:"\u25C9",label:()=>v.t("nav.home")},{path:"/tasks",icon:"\u2630",label:()=>v.t("nav.tasks")},{path:"/users",icon:"\u25CE",label:()=>v.t("nav.users")},{path:"/analytics",icon:"\u25C7",label:()=>v.t("nav.analytics")},{path:"/settings",icon:"\u2699",label:()=>v.t("nav.settings")}].map(t=>p`
          <button
            class=${()=>`nav-item ${J()===t.path?"active":""}`}
            onclick=${()=>{V(t.path),k.emit("navigate",{from:J(),to:t.path})}}
            aria-current=${()=>J()===t.path?"page":"false"}
          >
            <span class="icon">${t.icon}</span>
            ${()=>P()?null:p`<span>${t.label()}</span>`}
          </button>
        `)}
      </nav>
      <div class="sidebar-footer">
        ${()=>P()?null:p`
          <div class="sidebar-version">onefold v0.1.0</div>
        `}
      </div>
    </aside>
  `}function At(){let e=$(Be);return p`
    <header class="topbar" role="banner">
      <div class="topbar-left">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${()=>P.set(!P())}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <span class="topbar-subtitle">${()=>v.t("app.subtitle")}</span>
      </div>
      <div class="topbar-right">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${()=>H.toggle()}
          aria-label="Toggle theme"
        >
          ${()=>H.current()==="dark"?"\u2600":"\u263E"}
        </button>
        <select
          class="locale-select"
          onchange=${t=>te.set(t.target.value)}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        ${()=>{let t=e.user();return t?p`
            <div class="user-info">
              <div class="user-avatar-sm">${t.name.charAt(0)}</div>
              <span class="user-name">${t.name}</span>
              <button class="btn btn-ghost btn-sm" onclick=${()=>e.logout()}>Logout</button>
            </div>
          `:p`<button class="btn btn-primary btn-sm" onclick=${()=>e.login("Admin","admin")}>Login</button>`}}
      </div>
    </header>
  `}function Lt(){let e=$(A);return p`
    <div class="notification-toast">
      ${()=>e.notifications().map(t=>p`
        <div class="toast-item">${t}</div>
      `)}
    </div>
  `}var Tn=new Map;function me(e){let{render:t,...n}=e;return Tn.set(e.name,{meta:n,factory:t}),t}var R=me({name:"StatCard",description:"Displays a single statistic with label",props:{value:{type:"string | number",required:!0},label:{type:"string",required:!0},color:{type:"string",required:!1}},tags:["stat","dashboard"],render:({value:e,label:t,color:n})=>p`
    <div class="stat-card">
      <div class="stat-value" style=${n?{color:n}:{}}>${e}</div>
      <div class="stat-label">${t}</div>
    </div>
  `});function Ht(){return p`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("app.title")}<span class="feature-badge">Signals + Store + i18n</span></h2>
      </div>

      <div class="stats-grid">
        ${()=>{let e=Ct();return[R({value:e.total,label:"Total Tasks"}),R({value:e.todo,label:"To Do",color:"var(--warning)"}),R({value:e.inProgress,label:"In Progress",color:"var(--accent)"}),R({value:e.done,label:"Completed",color:"var(--success)"})]}}
      </div>

      <div class="card">
        <h3>Welcome to the onefold Comprehensive Demo</h3>
        <p class="card-description">
          This application demonstrates every feature of the onefold framework
          in a realistic task management dashboard. Navigate using the sidebar to
          explore different features.
        </p>
        <div class="feature-grid">
          ${kn()}
        </div>
      </div>
    </div>
  `}function kn(){return p`
    ${["Signals & Reactivity","HTML Templates","Scoped CSS","Router & Navigation","Store (State)","Dependency Injection","HTTP Client","Forms & Validation","i18n","Persisted State","RBAC Guards","Theming","Observability","Plugins","Error Boundaries","Suspense","Transitions","Virtual List","Streaming (WS/SSE)","Accessibility","DevTools","Component Meta"].map(t=>p`<div class="feature-item">${t}</div>`)}
  `}function I(e="Required"){return t=>t==null||t===""||Array.isArray(t)&&t.length===0?e:null}function Dt(e="Invalid email"){return t=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)?null:e}function ve(e,t){return n=>n.length>=e?null:t??`Minimum ${e} characters`}function be(e,t){return n=>n.length<=e?null:t??`Maximum ${e} characters`}function he(e){let t=Object.entries(e),n={},o=[];for(let[s,a]of t){let c=b(a.initial),l=b(!1),d=b(""),f=b(!0),h=a.rules??[];o.push(y(()=>{let u=c();if(!l()){d.set(""),f.set(Nt(h,u)===null);return}let g=Nt(h,u);d.set(g??""),f.set(g===null)})),n[s]={value:c,error:d,touched:l,valid:f,handle:u=>{let g=u.target,m=g.type==="checkbox"?g.checked:g.type==="number"?Number(g.value):g.value;_(()=>{c.set(m),l.set(!0)})},set:u=>{_(()=>{c.set(u),l.set(!0)})},reset:()=>{_(()=>{c.set(a.initial),l.set(!1)})}}}let r=b(!0),i=b(!1);return o.push(y(()=>{let s=!0,a=!1;for(let c of Object.values(n))c.valid()||(s=!1),c.touched()&&(a=!0);r.set(s),i.set(a)})),{fields:n,valid:r,dirty:i,values:()=>{let s={};for(let[a,c]of Object.entries(n))s[a]=c.value.peek();return s},submit:s=>{if(_(()=>{for(let a of Object.values(n))a.touched.set(!0)}),r.peek()){let a={};for(let[c,l]of Object.entries(n))a[c]=l.value.peek();s(a)}},reset:()=>{_(()=>{for(let s of Object.values(n))s.reset()})},dispose:()=>{for(let s of o)s()}}}function Nt(e,t){for(let n of e){let o=n(t);if(o)return o}return null}var Mt=me({name:"TaskCard",description:"Displays a single task with status management",props:{task:{type:"Task",required:!0,description:"The task object to display"},onStatusChange:{type:"function",required:!0,description:"Status change callback"}},tags:["task","card"],render:({task:e,onStatusChange:t})=>{let n=o=>({todo:"in-progress","in-progress":"done",done:"todo"})[o];return p`
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
    `}});function Ot(){let e=b(!1),t=he({title:{initial:"",rules:[I("Title is required"),ve(3,"At least 3 characters")]},description:{initial:"",rules:[I("Description is required"),be(200,"Max 200 chars")]},priority:{initial:"medium",rules:[I()]},assignee:{initial:"",rules:[I("Assignee is required")]}}),n=(s,a)=>{M.update(l=>({tasks:l.tasks.map(d=>d.id===s?{...d,status:a}:d)})),$(A).add(`Task status updated to "${a}"`),k.emit("custom",{type:"task-status-change",payload:{id:s,newStatus:a}})},o=()=>{t.submit(s=>{let a={id:Date.now(),title:s.title,description:s.description,status:"todo",priority:s.priority,assignee:s.assignee,createdAt:new Date().toISOString().split("T")[0]};M.update(c=>({tasks:[...c.tasks,a]})),$(A).add(`Task "${s.title}" created`),t.reset(),e.set(!1)})},r=s=>{M.update({filter:s})};return p`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("tasks.title")}<span class="feature-badge">Forms + Store + Guards</span></h2>
        ${()=>q(["tasks:write"],()=>p`
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
          value=${()=>M().searchQuery}
          oninput=${s=>{M.update({searchQuery:s.target.value})}}
          aria-label="Search tasks"
        />
        ${["all","todo","in-progress","done"].map(s=>p`
          <button
            class=${()=>`filter-btn ${M().filter===s?"active":""}`}
            onclick=${()=>r(s)}
          >
            ${s==="all"?"All":s}
          </button>
        `)}
        <span class="filter-count">
          ${()=>v.t("tasks.total",{count:Ze().length})}
        </span>
      </div>

      <div class="task-grid">
        ${()=>{let s=Ze();return s.length===0?p`<div class="card empty-state">
              <p>${()=>v.t("tasks.empty")}</p>
            </div>`:s.map(a=>Mt({task:a,onStatusChange:n}))}}
      </div>

      ${()=>e()?wn(t,o,()=>{e.set(!1),t.reset()}):null}
    </div>
  `}function wn(e,t,n){return setTimeout(()=>{let o=document.querySelector(".modal");o&&bt(o).activate()},0),p`
    <div class="modal-overlay" onclick=${o=>{o.target.classList.contains("modal-overlay")&&n()}}>
      <div class="modal">
        <h2>${()=>v.t("tasks.add")}</h2>

        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" type="text" value=${()=>e.fields.title.value()} oninput=${e.fields.title.handle} placeholder="Task title..." />
          <div class="form-error">${()=>e.fields.title.error()}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" rows="3" value=${()=>e.fields.description.value()} oninput=${e.fields.description.handle} placeholder="Task description..."></textarea>
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
          <input class="form-input" type="text" value=${()=>e.fields.assignee.value()} oninput=${e.fields.assignee.handle} placeholder="Assignee name..." />
          <div class="form-error">${()=>e.fields.assignee.error()}</div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick=${n}>${()=>v.t("common.cancel")}</button>
          <button class="btn btn-primary" onclick=${t}>${()=>v.t("form.submit")}</button>
        </div>
      </div>
    </div>
  `}function It(e){let{items:t,itemHeight:n,height:o,renderRow:r,overscan:i=6}=e,s=b(0),a=document.createElement("div");a.style.height=`${o}px`,a.style.overflowY="auto",a.style.position="relative",a.setAttribute("role","list");let c=document.createElement("div");c.style.position="relative",a.appendChild(c);let l=new Map;a.addEventListener("scroll",()=>s.set(a.scrollTop),{passive:!0});let d=y(()=>{let f=t(),h=f.length;c.style.height=`${h*n}px`;let u=s(),g=Math.max(0,Math.floor(u/n)-i),m=Math.ceil(o/n)+i*2,w=Math.min(h,g+m),z=new Set;for(let T=g;T<w;T++)z.add(T);for(let[T,x]of l)z.has(T)||(x.remove(),l.delete(T));for(let T=g;T<w;T++){if(l.has(T))continue;let x=f[T];if(x===void 0)continue;let E=r(x,T),C=E instanceof HTMLElement?E:(()=>{let O=document.createElement("div");return O.appendChild(E),O})();C.style.position="absolute",C.style.top=`${T*n}px`,C.style.left="0",C.style.right="0",C.style.height=`${n}px`,c.appendChild(C),l.set(T,C)}});return D(a,d),a}async function _t(e,t){let n=t;for(let o=e.length-1;o>=0;o--){let r=e[o];if(r.error)try{return await r.error(n)}catch(i){n=i}}throw n}function Ft(e){let t=e?.baseUrl??"",n=e?.headers??{},o=[...e?.interceptors??[]],r=e?.timeout??0;async function i(a){let l={url:a.url.startsWith("http")?a.url:a.url.startsWith("//")?(()=>{throw new Error("[onefold:http] Protocol-relative URLs are blocked to prevent open redirect.")})():`${t}${a.url}`,method:a.method,headers:{...n,...a.headers},body:a.body,params:a.params,signal:a.signal};for(let m of o)m.request&&(l=await m.request(l));let d=l.url;if(l.params&&Object.keys(l.params).length>0){let m=new URLSearchParams(l.params).toString();d+=(d.includes("?")?"&":"?")+m}let f={method:l.method,headers:l.headers,signal:l.signal};l.body!==void 0&&l.body!==null&&(typeof l.body=="string"||l.body instanceof FormData?f.body=l.body:(f.body=JSON.stringify(l.body),!l.headers["Content-Type"]&&!l.headers["content-type"]&&(f.headers["Content-Type"]="application/json")));let h=r,u=null,g=null;h>0&&!l.signal&&(g=new AbortController,f.signal=g.signal,u=setTimeout(()=>g.abort(),h));try{let m=await fetch(d,f);if(u&&clearTimeout(u),!m.ok){let x=null;try{x=await m.json()}catch{}let E={message:`HTTP ${m.status}: ${m.statusText}`,status:m.status,statusText:m.statusText,data:x,config:l};return await _t(o,E)}let w;(m.headers.get("content-type")??"").includes("application/json")?w=await m.json():w=await m.text();let T={data:w,status:m.status,statusText:m.statusText,headers:m.headers,config:l};for(let x=o.length-1;x>=0;x--){let E=o[x];E.response&&(T=await E.response(T))}return T}catch(m){if(u&&clearTimeout(u),typeof m=="object"&&m!==null&&"config"in m)throw m;let w={message:m instanceof Error?m.message:"Network error",status:0,statusText:"Network Error",data:null,config:l};return await _t(o,w)}}function s(a){return{headers:a?.headers,params:a?.params,signal:a?.signal}}return{get:(a,c)=>i({url:a,method:"GET",...s(c)}),post:(a,c,l)=>i({url:a,method:"POST",body:c,...s(l)}),put:(a,c,l)=>i({url:a,method:"PUT",body:c,...s(l)}),patch:(a,c,l)=>i({url:a,method:"PATCH",body:c,...s(l)}),delete:(a,c)=>i({url:a,method:"DELETE",...s(c)}),request:i,addInterceptor:a=>(o.push(a),()=>{let c=o.indexOf(a);c>=0&&o.splice(c,1)})}}var xe=Ft({baseUrl:"https://jsonplaceholder.typicode.com",headers:{Accept:"application/json"},interceptors:[{request:e=>{let t=ue.user.peek();return t&&(e.headers["X-User"]=t.name),k.log("info",`HTTP ${e.method} ${e.url}`),e},response:e=>(k.metric("http.response",e.status,{url:e.config.url}),e)}]});function jt(){return p`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("users.title")}<span class="feature-badge">Resource + ErrorBoundary + VirtualList</span></h2>
      </div>

      ${Ke(()=>Sn(),(e,t)=>p`
          <div class="card empty-state">
            <p class="error-text">${()=>v.t("common.error")}: ${e.message}</p>
            <button class="btn btn-primary" onclick=${t}>Retry</button>
          </div>
        `)}
    </div>
  `}function Sn(){let e=je(()=>"users",async()=>(await xe.get("/users")).data);return p`
    <div>
      ${()=>{if(e.loading())return p`<div class="card empty-state"><p>${()=>v.t("common.loading")}</p></div>`;if(e.error())return p`<div class="card empty-state">
            <p class="error-text">Failed to load users</p>
            <button class="btn btn-primary" onclick=${()=>e.refetch()}>Retry</button>
          </div>`;let t=e.data();return t?p`
          <div class="user-grid">
            ${t.map(n=>p`
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
            ${En()}
          </div>
        `:p`<p>No data</p>`}}
    </div>
  `}function En(){let e=b(Array.from({length:1e3},(t,n)=>({id:n+1,name:`Item #${n+1} \u2014 ${["Alpha","Beta","Gamma","Delta","Epsilon"][n%5]}`,value:Math.round(Math.random()*1e4)/100})));return It({items:e,itemHeight:40,height:300,overscan:4,renderRow:t=>p`
      <div class="virtual-row">
        <span class="virtual-row-id">#${t.id}</span>
        <span class="virtual-row-name">${t.name}</span>
        <span class="virtual-row-value">$${t.value.toFixed(2)}</span>
      </div>
    `})}function Kt(e,t){let n=document.createElement("div");n.setAttribute("data-suspense","");let{fallback:o,onError:r,minLoadingMs:i=0}=t??{};o&&n.appendChild(o());let s=Date.now(),a=!1;return e().then(async c=>{if((n.isConnected||n.parentNode)&&(a=!0),!(a&&!n.isConnected&&!n.parentNode)){if(i>0){let l=Date.now()-s;l<i&&await $n(i-l)}a&&!n.isConnected&&!n.parentNode||(n.textContent="",n.appendChild(c))}}).catch(c=>{if(a&&!n.isConnected&&!n.parentNode)return;n.textContent="";let l=c instanceof Error?c:new Error(String(c));r?n.appendChild(r(l)):n.textContent=`Error: ${l.message}`}),n}function $n(e){return new Promise(t=>setTimeout(t,e))}function Vt(e,t){let n=document.createElement("div");n.setAttribute("data-transition",""),n.style.position="relative";let{name:o,duration:r=300,enterFrom:i,enterTo:s,leaveTo:a,mode:c="default"}=t??{},l=null,d=y(()=>{let f=e();if(f===l)return;let h=l;c==="out-in"&&h&&h instanceof HTMLElement?Ut(h,{name:o,duration:r,leaveTo:a},()=>{n.textContent="",f&&(n.appendChild(f),f instanceof HTMLElement&&zt(f,{name:o,duration:r,enterFrom:i,enterTo:s}))}):(h&&h instanceof HTMLElement&&Ut(h,{name:o,duration:r,leaveTo:a},()=>{h.remove()}),f&&(n.appendChild(f),f instanceof HTMLElement&&zt(f,{name:o,duration:r,enterFrom:i,enterTo:s}))),l=f??null});return D(n,d),n}function zt(e,t){let{name:n,duration:o=300,enterFrom:r,enterTo:i}=t;n?(e.classList.add(`${n}-enter`,`${n}-enter-active`),requestAnimationFrame(()=>{e.classList.remove(`${n}-enter`),e.classList.add(`${n}-enter-to`)}),setTimeout(()=>{e.classList.remove(`${n}-enter-active`,`${n}-enter-to`)},o)):r&&(Object.assign(e.style,r),e.style.transition=`all ${o}ms ease`,requestAnimationFrame(()=>{Object.assign(e.style,i??{})}),setTimeout(()=>{e.style.transition=""},o))}function Ut(e,t,n){let{name:o,duration:r=300,leaveTo:i}=t;o?(e.classList.add(`${o}-leave`,`${o}-leave-active`),requestAnimationFrame(()=>{e.classList.remove(`${o}-leave`),e.classList.add(`${o}-leave-to`)}),setTimeout(n,r)):i?(e.style.transition=`all ${r}ms ease`,requestAnimationFrame(()=>{Object.assign(e.style,i)}),setTimeout(n,r)):n()}function qt(){let e=b("overview");return p`
    <div>
      <div class="page-header">
        <h2>${()=>v.t("analytics.title")}<span class="feature-badge">Suspense + Transition + DevTools</span></h2>
      </div>

      <div class="filter-bar">
        ${["overview","performance","plugins"].map(t=>p`
          <button
            class=${()=>`filter-btn ${e()===t?"active":""}`}
            onclick=${()=>e.set(t)}
          >
            ${t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        `)}
      </div>

      ${Vt(()=>{let t=e();return t==="overview"?Rn():t==="performance"?Cn():Pn()},{enterFrom:{opacity:"0",transform:"translateY(8px)"},enterTo:{opacity:"1",transform:"translateY(0)"},leaveTo:{opacity:"0",transform:"translateY(-8px)"},duration:200,mode:"out-in"})}
    </div>
  `}function Rn(){return Kt(async()=>{let t=(await xe.get("/todos?_limit=20")).data,n=t.filter(r=>r.completed).length,o=t.length-n;return p`
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
              ${t.map(r=>p`
                <div class="todo-item">
                  <span class=${r.completed?"todo-check done":"todo-check"}>
                    ${r.completed?"\u2713":"\u25CB"}
                  </span>
                  <span class=${r.completed?"todo-text completed":"todo-text"}>${r.title}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      `},{fallback:()=>p`
        <div class="card empty-state">
          <p>Loading analytics data...</p>
          <div class="spinner"></div>
        </div>
      `,onError:e=>p`
        <div class="card empty-state">
          <p class="error-text">Failed to load analytics: ${e.message}</p>
        </div>
      `})}function Cn(){let e=B.stats();return console.log("stats",e),p`
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
  `}function Pn(){return p`
    <div>
      <div class="card">
        <h3>Plugin System <span class="feature-badge">Plugins</span></h3>
        <p class="card-description">
          Plugins extend onefold with isolated lifecycle management and permissions.
        </p>
        <div class="plugin-list">
          ${N.list().map(e=>p`
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
          ${Pe("<strong>This is sanitized HTML via raw()</strong> \u2014 safe to use")}
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
          ${()=>q(["admin"],()=>p`<span class="badge badge-done">Admin Access</span>`)}
          ${()=>q(["tasks:write"],()=>p`<span class="badge badge-done">Tasks Write</span>`)}
          ${()=>q(["billing:manage"],()=>p`<span class="badge badge-high">Billing</span>`,()=>p`<span class="badge badge-todo">Billing (no access)</span>`)}
        </div>
        <p class="card-description">
          hasPermission('admin'): ${()=>gt("admin")?"true":"false"} |
          hasAnyPermission(['billing:manage','admin']): ${()=>mt(["billing:manage","admin"])?"true":"false"}
        </p>
      </div>
    </div>
  `}function Bt(){let e=he({name:{initial:"",rules:[I("Name is required"),ve(2)]},contactEmail:{initial:"",rules:[I("Email is required"),Dt("Invalid email format")]},bio:{initial:"",rules:[be(500,"Bio must be under 500 characters")]}});return p`
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
                class=${()=>`toggle ${H.current()==="dark"?"on":""}`}
                onclick=${()=>H.toggle()}
                aria-label="Toggle dark mode"
                role="switch"
                aria-checked=${()=>H.current()==="dark"?"true":"false"}
              ></button>
            </div>
            <div class="setting-row">
              <span>Current Theme</span>
              <span class="setting-value">${()=>H.current()}</span>
            </div>
          </div>

          <div class="settings-section">
            <h3>${()=>v.t("settings.language")}</h3>
            <div class="setting-row">
              <span>Locale</span>
              <select class="form-select inline-select"
                onchange=${t=>te.set(t.target.value)}
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
                class=${()=>`toggle ${ne()?"on":""}`}
                onclick=${()=>ne.set(!ne())}
                aria-label="Toggle notifications"
                role="switch"
                aria-checked=${()=>ne()?"true":"false"}
              ></button>
            </div>
            <div class="setting-row">
              <span>Sidebar Collapsed</span>
              <button
                class=${()=>`toggle ${P()?"on":""}`}
                onclick=${()=>P.set(!P())}
                aria-label="Toggle sidebar"
                role="switch"
                aria-checked=${()=>P()?"true":"false"}
              ></button>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Profile Form <span class="feature-badge">Form Validation</span></h3>
          <div class="form-body">
            <div class="form-group">
              <label class="form-label">${()=>v.t("form.name")}</label>
              <input class="form-input" type="text" value=${()=>e.fields.name.value()} oninput=${e.fields.name.handle} placeholder="Your name" />
              <div class="form-error">${()=>e.fields.name.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">${()=>v.t("form.email")}</label>
              <input class="form-input" type="email" value=${()=>e.fields.contactEmail.value()} oninput=${e.fields.contactEmail.handle} placeholder="your@email.com" />
              <div class="form-error">${()=>e.fields.contactEmail.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-input" rows="4" value=${()=>e.fields.bio.value()} oninput=${e.fields.bio.handle} placeholder="Tell us about yourself..."></textarea>
              <div class="form-error">${()=>e.fields.bio.error()}</div>
            </div>
            <div class="btn-row">
              <button class="btn btn-primary" onclick=${()=>e.submit(t=>{$(A).add(`Profile saved for ${t.name}`),K("Profile saved successfully")})}>${()=>v.t("common.save")}</button>
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
  `}function Wt(){return p`
    <div class="card empty-state">
      <h2 class="error-code">404</h2>
      <p class="error-text">Page not found</p>
      <button class="btn btn-primary" onclick=${()=>V("/")}>Go Home</button>
    </div>
  `}function ye(){return p`
    <div class="card empty-state">
      <h2 class="access-denied-title">Access Denied</h2>
      <p class="error-text">You don't have permission to view this page.</p>
      <button class="btn btn-primary" onclick=${()=>V("/")}>Go Home</button>
    </div>
  `}var An=De`
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
`;function Ln(){ht({Escape:()=>K("Modal closed"),"Ctrl+K":()=>{let t=document.querySelector(".search-input");t&&t.focus(),K("Search focused")}});let e=_e([{path:"/",view:()=>Ht()},{path:"/tasks",view:de(["tasks:read"],()=>Ot(),()=>ye())},{path:"/users",view:de(["users:read"],()=>jt(),()=>ye())},{path:"/analytics",view:de(["analytics:read"],()=>qt(),()=>ye())},{path:"/settings",view:()=>Bt()}],()=>Wt());return p`
    <div class=${An.scope}>
      ${xt("#main-content")}
      ${Lt()}
      <div class="app-shell">
        ${Pt()}
        <div class="main-area">
          ${At()}
          <main class="content" id="main-content" role="main">
            ${e}
          </main>
        </div>
      </div>
    </div>
  `}Le(Ln(),document.getElementById("app"));console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");console.log(" onefold Comprehensive Demo");console.log(" Features: 22+");console.log(" DevTools:",B.active?"enabled":"disabled");console.log(" Plugins:",N.list().join(", "));console.log(" Theme:",H.current());console.log(" Locale:",v.locale());console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
