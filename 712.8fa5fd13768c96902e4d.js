"use strict";(self.webpackChunkgoogle_calendar_clone_vanilla=self.webpackChunkgoogle_calendar_clone_vanilla||[]).push([[712],{712:(e,t,n)=>{n.r(t),n.d(t,{default:()=>f});var o=n(432);const s=class{constructor(e){this.flag=e,this.tops=[20,20],this.heights=[18,18]}updateFlag(){this.flag=window.innerWidth<=530||window.innerHeight<=470}getFlag(){return this.flag}getTop(){const[e,t]=this.tops;return this.flag?e:t}getHeight(){const[e,t]=this.heights;return this.flag?e:t}getPrevTop(e){const[t,n]=this.tops;return e===t?n:t}};var a=n(151),i=n(634),r=n(375),d=n(748),l=n(340),c=n(287),m=n(944),u=n(683),p=n(611);const g=document.querySelector(".resize-overlay"),h=document.querySelector(".sidebar"),v=document.querySelector(".monthview--calendar");function f(e,t,n){const f=new s(window.innerWidth<=530||window.innerHeight<=470);function y(){h.classList.contains("hide-sidebar")||(n.resetDate(),e.setDateSelected(e.getDay()),(0,p.Z)(e,t,n))}function w(e){"hide"===e?(g.classList.add("hide-resize-overlay"),t.removeActiveOverlay("hide-resize-overlay")):(g.classList.remove("hide-resize-overlay"),t.addActiveOverlay("hide-resize-overlay"))}function b(){e.setComponent("day"),(0,o.Z)("day",e,t,n),y()}function x(e,n,o,s){const a=document.createElement("div");a.classList.add("monthview--box"),a.setAttribute("data-monthview-id",e),a.style.backgroundColor=t.getCtgColor(n),a.style.top=`${o}px`,a.style.height=`${f.getHeight()}px`,a.style.width="100%";const i=document.createElement("div");return i.classList.add("monthview--title"),i.textContent=s,a.append(i),a}function L(t,n,o,s){const r=[+t.getDay(),Math.floor(n/7)],d=document.createElement("div");d.classList.add("monthview--day"),d.setAttribute("data-mv-date",s),d.setAttribute("data-mv-idx",n),d.setAttribute("data-mv-coordinates",r);const l=document.createElement("button");l.classList.add("monthview--dayofmonth");const c=document.createElement("div");c.classList.add("monthview--daycontent"),t.getMonth()===e.getMonth()&&t.getDate()===e.getDateSelected()&&l.classList.add("monthview--dayofmonth-selected"),l.append(function(t,n){const{labels:o}=a.Z,s=`${n.getDate()} ${o.monthsShort[n.getMonth()]}`,r=document.createElement("span");return r.classList.add("monthview--daynumber"),n.getMonth()!==e.getMonth()?(r.textContent=s,r.classList.add("monthview--daynumber-prevnext")):1===n.getDate()?r.textContent=s:(0,i.aN)(n,new Date)?(r.textContent=n.getDate(),r.classList.add("monthview--daynumber-today"),t.classList.add("monthview--today")):r.textContent=n.getDate(),r}(d,t));let m=0;if(void 0!==o&&o.length>0)if((o=o.filter((e=>new Date(e.start).getMonth()===t.getMonth()))).length>=6)c.append(function(e,t){const n=document.createElement("div");n.classList.add("monthview--daygroup"),n.setAttribute("data-mvgrouped-date",e),n.setAttribute("data-mvgrouped-length",t);const o=document.createElement("div");o.classList.add("monthview--grouped");const s=document.createElement("div");return s.classList.add("monthview--daycontent__grouped-title"),s.textContent=`${t} more...`,o.append(s),n.append(o),n}(s,o.length)),c.classList.add("monthview--daycontent-grouped");else for(const[e,n]of o.entries())(0,i.aN)(new Date(n.start),t)&&(e>0&&(m+=f.getTop()),c.append(x(n.id,n.category,m,n.title)));d.append(l,c),v.append(d)}function C(){v.innerText="",v.onmousedown=null,v.onclick=null}function E(e){return e.getAttribute("data-mv-coordinates").split(",").map((e=>Number.parseInt(e)))}function A(e,n){const[o,s,a]=(0,i.pH)(e,"data-mv-date","month"),r=n.getAttribute("data-monthview-id"),d=t.getEntry(r),[l,c]=[new Date(d.start),new Date(d.end)],m=new Date(o,s,a),u=(0,i.Z_)(l,m),p=c.getDate()+Math.floor(u/86400)+1;t.updateEntry(r,{start:new Date(o,s,a,l.getHours(),l.getMinutes()),end:new Date(c.getFullYear(),c.getMonth(),p,c.getHours(),c.getMinutes())})}function D(e){e.classList.remove("box-mv-dragactive"),e.style.top="0px",e.style.left="0px",e.style.width="100%",e.style.height=`${f.getHeight()}px`}function _(e,t){if(0!==e.length&&void 0!==e)for(let n=0;n<e.length;n++)void 0===e[n]||null===e[n]||e[n].classList.contains("monthview--box__form-temp")||(e[n].style.top=n*f.getTop()+"px",t?(e[n].classList.add("monthview--box__drop"),setTimeout((()=>{e[n].classList.remove("monthview--box__drop")}),200)):e[n].setAttribute("class","monthview--box"))}function S(o,s){(0,r.iE)("dragstart",v,t);const a=Date.now(),l=s.parentElement,p=l.parentElement;p.classList.add("current-drop-zone");const g=document?.querySelector(".more-modal"),h=l.childElementCount,[w,b]=E(p);!function(e){const t=e.cloneNode(!0);v.prepend(t),t.classList.add("box-mv-dragactive"),t.focus()}(s);const x=document?.querySelector(".box-mv-dragactive");x.setAttribute("data-box-mvx",w),x.setAttribute("data-box-mvy",b);const L=p.getBoundingClientRect(),C=Number.parseFloat(L.width.toFixed(2)),S=Number.parseFloat(L.height.toFixed(2)),k=Number.parseInt(v.offsetLeft),$=s.getBoundingClientRect(),F=Number.parseFloat($.width),H=f.getHeight();x.style.top=`${l.offsetTop}px`,x.style.width=`${F}px`,x.style.height=`${H}px`,x.style.left=`${l.offsetLeft}px`,x.classList.add("hide-mv-clone");const M=v.classList.contains("five-weeks"),[q,T]=[o.clientX,o.clientY];let[Z,z]=[0,0],[I,R]=[w,b],B=!1,P=!1;const Y=e=>{Z=Math.abs(e.clientX-q),z=Math.abs(e.clientY-T),(Z>1||z>1)&&(P||(g&&g.remove(),document.body.style.cursor="move",P=!0)),(Z>3||z>3)&&(B||(s.style.opacity="0.5",x.classList.remove("hide-mv-clone")),B=!0);let t=Math.floor((e.clientX-v.offsetLeft)/C);if(t<0)return void(t=0);if(t>6)return void(t=6);if(I!==t){const e=t*C+k;x.style.left=`${Number.parseFloat(e.toFixed(2))}px`,I=t}let n=Math.floor((e.clientY-v.offsetTop)/S);if(n<0)n=0;else if(M&&n>4)n=4;else if(!M&&n>5)n=5;else{if(R!==n){const e=n*S+v.offsetTop+16;x.style.top=`${Number.parseFloat(e.toFixed(2))}px`,R=n}document.querySelector(".current-drop-zone")?.classList.remove("current-drop-zone"),document.querySelector(`[data-mv-coordinates="${t},${n}"]`).classList.add("current-drop-zone")}},W=()=>{const o=document?.querySelector(".current-drop-zone"),p=Date.now()-a,[f,L]=E(o);o.classList.remove("current-drop-zone");const C=o.children[1],S=C?.children;let k=!1;if(null==o)return(0,r.iE)("dragend",v,t),s.style.opacity="1",x.remove(),k=!1,document.removeEventListener("mousemove",Y),void document.removeEventListener("mouseup",W);f===w&&L===b?(k=!1,s.style.opacity="1",x.remove(),g&&g.remove(),p<200&&function(o,s){const a=o.getAttribute("data-monthview-id"),r=t.getEntry(a),l=r.start,p=t.getCtgColor(r.category),g=(0,d.hextorgba)(p,.5);s.classList.add("monthview--daycontent__form-temp"),s.style.backgroundColor=g;const h=s.getBoundingClientRect(),[v,f]=(0,d.placePopup)(360,165,[Number.parseInt(h.left),Number.parseInt(h.top)],[window.innerWidth,window.innerHeight]);t.setFormResetHandle("month",N);const y=new m.Z;y.setSubmission("edit",a,r.title,r.description),y.setCategory(r.category,p),y.setDates((0,i.cF)(l,r.end)),c.Z.setFormDatepickerDate(e,n,l);const w=()=>c.Z.getConfig(y.getSetup());(0,u.Z)(e,t,r,n,w);const b=document.querySelector(".entry__options");b.style.top=f+"px",b.style.left=v+"px"}(s,o)):(k=!0,void 0!==S[0]?S[0].classList.contains("monthview--daygroup")?(!function(e){const t=e.getAttribute("data-mvgrouped-length");e.setAttribute("data-mvgrouped-length",+t+1),e.firstChild.firstChild.textContent=`${e.getAttribute("data-mvgrouped-length")} more...`}(S[0]),A(o,x),x.remove(),s.remove()):(D(x),x.classList.remove("hide-mv-clone"),C.insertBefore(x,S[0]),A(o,x),s.remove(),S.length<=5?_(S,!0):function(e,t,n,o){const s=document.createElement("div");s.classList.add("monthview--daygroup"),s.setAttribute("data-mvgrouped-date",e.getAttribute("data-mv-date")),s.setAttribute("data-mvgrouped-length",n.length);const a=document.createElement("div");a.classList.add("monthview--grouped");const i=document.createElement("div");i.classList.add("monthview--daycontent__grouped-title"),i.textContent=`${n.length} more...`,t.innerText="",s.append(a),a.append(i),t.append(s),t.classList.add("monthview--daycontent-grouped"),o.remove()}(o,C,S,x)):(D(x),s.remove(),x.classList.remove("hide-mv-clone"),C.append(x),A(o,x),y())),k&&(1===h?y():_(l.children,!0)),(0,r.iE)("dragend",v,t),document.removeEventListener("mousemove",Y),document.removeEventListener("mouseup",W)};document.addEventListener("mousemove",Y),document.addEventListener("mouseup",W)}function k(e){"Escape"===e.key&&$()}function $(){const e=document?.querySelector(".more-modal");e&&e.remove(),w("hide"),document.removeEventListener("keydown",k)}function F(n){const{labels:o}=a.Z,s=function(e){const[n,o,s]=(0,i.pH)(e.target.parentElement.parentElement,"data-mv-date","month");return t.getDayEntriesArray(new Date(n,o,s))}(n);w("show");const r=n.target.parentElement.parentElement,c=document.createElement("div");c.classList.add("more-modal"),c.setAttribute("data-mv-modal",r.getAttribute("data-mv-idx"));let m=28*s.length+64;m>400&&(m=400);const u=r.getBoundingClientRect(),p=Number.parseInt(u.width),[h,f]=(0,d.placePopup)(216,m,[Number.parseInt(u.left),Number.parseInt(u.top)],[window.innerWidth,window.innerHeight],!0,p),y=+window.innerHeight-+f-24;c.setAttribute("style",`top: ${f}px; left: ${h}px; width: 216px; height: ${m}px; min-height: 120px; max-height: ${y}px;`);const x=document.createElement("div");x.classList.add("more-modal-header");const L=document.createElement("div");L.classList.add("more-modal-header-title");const C=(0,i.RU)(n.target.parentElement.parentElement.getAttribute("data-mv-date")),E=document.createElement("span");E.classList.add("more-modal-header-title-dow"),E.textContent=o.weekdaysShort[C.getDay()].toUpperCase();const A=document.createElement("span");A.classList.add("more-modal-header-title-dayn"),A.textContent=C.getDate();const D=document.createElement("div");D.classList.add("more-modal-header-close"),D.append((0,l.G0)("var(--white3)")),D.setAttribute("data-tooltip","Close"),L.append(D,E,A),x.append(L),c.append(x,function(e){const n=document.createElement("div");n.classList.add("more-modal-content");for(let o=0;o<e.length;o++){const s=e[o],a=document.createElement("div");a.classList.add("more-modal-entry"),a.style.top=22*o+"px",a.style.width="calc(100% - 16px)",a.style.height="20px",a.setAttribute("data-monthview-id",s.id),a.setAttribute("data-mvhidden-category",s.category),a.style.backgroundColor=t.getCtgColor(s.category);const i=document.createElement("div");i.classList.add("more-modal-entry-title"),i.textContent=s.title,a.append(i),n.append(a)}return n}(s)),v.append(c),A.addEventListener("click",(()=>{!function(t){w("hide"),e.setDate(t.getFullYear(),t.getMonth(),t.getDate()),b()}(C)}),{once:!0}),g.addEventListener("click",(()=>{$()}),{once:!0}),document.addEventListener("keydown",k)}function N(){const e=document.querySelector(".monthview--daycontent__form-temp");e&&(e.removeAttribute("style"),e.classList.remove("monthview--daycontent__form-temp"))}function H(){const e=document?.querySelector(".monthview--box__form-temp");if(!e)return;const t=e.parentElement,n=t.parentElement;n.removeAttribute("style"),n.classList.remove("monthview--daycontent__form-temp"),e.remove(),_(t.children,!1)}function M(o,s){if(o.target.classList.contains("monthview--daycontent")){const o=s.parentElement,a=o.getBoundingClientRect(),r=(0,i.pH)(o,"data-mv-date","month"),[l,u]=(0,i.tB)(r);let p,g;if(0===t.getActiveCategories().length){const e=t.getDefaultCtg();p=e[0],g=e[1].color}else{const e=t.getFirstActiveCategoryKeyPair();p=e[0],g=e[1]}!function(e,t,n,o){const s=x("temp",n,0,"( New Entry )");e.scrollTop=0,s.classList.add("monthview--box__form-temp"),t.classList.add("monthview--daycontent__form-temp"),t.style.backgroundColor=o,e.children.length>0?(e.insertBefore(s,e.children[0]),_(e.children,!1)):e.append(s)}(s,o,p,(0,d.hextorgba)(g,.5)),t.setFormResetHandle("month",H);const h=t.getRenderFormCallback(),v=new m.Z;v.setSubmission("create",null,null,null),v.setCategory(p,g),v.setDates((0,i.cF)(l,u)),h(),c.Z.setFormDatepickerDate(e,n,l),c.Z.getConfig(v.getSetup()),c.Z.setFormStyle(Number.parseInt(a.right),Number.parseInt(a.top),!1,null)}}function q(t){const n=(0,d.getClosest)(t,".monthview--box"),o=(0,d.getClosest)(t,".monthview--dayofmonth"),s=(0,d.getClosest)(t,".monthview--daygroup"),a=(0,d.getClosest)(t,".more-modal-entry"),r=(0,d.getClosest)(t,".more-modal-header-close");if(n){if(window.innerHeight<=280)return;S(t,t.target)}else{if(o)return t.stopPropagation(),void function(t){const[n,o,s]=(0,i.pH)(t.target.parentElement,"data-mv-date","month");e.setDate(n,o,s),e.setDateSelected(s),b()}(t);if(s)F(t);else if(a){if(window.innerHeight<=300)return;!function(e){const t=document.querySelector(".more-modal"),n=Number.parseInt(t.getAttribute("data-mv-modal")),o=document.querySelector(`[data-mv-idx="${n}"]`),s=e.target.cloneNode(!0);s.setAttribute("class","monthview--box"),s.firstChild.setAttribute("class","monthview--title"),s.style.top=`${f.getTop()}px`,s.style.left="0px",s.style.width="100%",o.lastChild.append(s);const a=o.lastChild.firstChild,i=Number.parseInt(a.getAttribute("data-mvgrouped-length"))-1;i<1?(o.lastChild.classList.remove("monthview--daycontent-grouped"),a.remove(),s.style.top="0px"):(a.setAttribute("data-mvgrouped-length",i),a.firstChild.firstChild.textContent=`${i} more...`),S(e,s),s.focus(),t.style.opacity="0.8"}(t)}else r&&$()}}function T(e){if((0,d.getClosest)(e,".monthview--daycontent")){if(window.innerHeight<=300)return;M(e,e.target)}else;}!function(){v.innerText="";let n=e.getMonthArray(),o=t.getMonthEntries(n),s=t.getGroupedMonthEntries(o);n.length<42?v.classList.add("five-weeks"):v.classList.remove("five-weeks");const a=e=>{const t=s[e.getDate()];return void 0!==t?t:[]};for(const[e,t]of n.entries())L(t,e,a(t),(0,i.OT)(t));n=null,o=null,s=null}(),v.onmousedown=q,v.onclick=T,t.setResetPreviousViewCallback(C)}}}]);