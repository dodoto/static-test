import{E as e,a as t,b as n,T as a,C as l,H as c,S as r,R as o}from"./vendor.95ca0c83.js";!function(e=".",t="__import__"){try{self[t]=new Function("u","return import(u)")}catch(n){const a=new URL(e,location),l=e=>{URL.revokeObjectURL(e.src),e.remove()};self[t]=e=>new Promise(((n,c)=>{const r=new URL(e,a);if(self[t].moduleMap[r])return n(self[t].moduleMap[r]);const o=new Blob([`import * as m from '${r}';`,`${t}.moduleMap['${r}']=m;`],{type:"text/javascript"}),m=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(o),onerror(){c(new Error(`Failed to import: ${e}`)),l(m)},onload(){n(self[t].moduleMap[r]),l(m)}});document.head.appendChild(m)})),self[t].moduleMap={}}}("/assets/");e.object,e.bool,e.object,e.bool,e.func,e.func,e.func,e.func;const m=function(e,n){t.useEffect((()=>{document.title=e}),[...n])};var s=t.memo((function({url:e,image_url:n,title:a}){return t.createElement("div",{className:"anima-card",title:a},t.createElement("a",{href:e,target:"_blank"},t.createElement("img",{src:n,alt:a}),t.createElement("h3",null,a)))})),u=t.memo((function({children:e}){const a=document.createElement("div");return t.useEffect((()=>(a.classList.add("jikan-modal"),document.body.appendChild(a),document.body.classList.add("scroll-bar-hidde"),()=>{document.body.classList.remove("scroll-bar-hidde"),document.body.removeChild(a)})),[]),n.createPortal(e,a)})),i=t.memo((function(){return t.createElement(u,null,t.createElement("div",{className:"spinner"}))}));const d=[{path:"/jikan-search",name:"JikanSearch",component:function({title:e}){const n=t.useRef(null),[c,r]=t.useState(!1),[o,u]=t.useState([]),d=t.useCallback((e=>{e.preventDefault();const t=n.current.value.trim();t&&(r(!0),document.title=t,fetch(`https://api.jikan.moe/v3/search/anime?q=${t}`).then((e=>e.json())).then((e=>{u(e.results)})).catch((e=>{console.log(e.message)})).finally((()=>{r(!1)})))}),[n]);return m(e,[]),t.createElement(t.Fragment,null,t.createElement("div",{className:"jikan-search-input"},t.createElement("form",{onSubmit:d},t.createElement("input",{type:"text",ref:n,spellCheck:!1,placeholder:"搜索"}),t.createElement("button",{className:"fa fa-search"}))),t.createElement(a,{className:"jikan-search-res"},o.map((({mal_id:e,url:n,title:a,image_url:c})=>t.createElement(l,{key:a,timeout:500,classNames:"slideup"},t.createElement(s,{url:n,image_url:c,title:a}))))),c&&t.createElement(i,null))},exact:!0,title:"Jikan 搜索"},{path:"*",name:"NotFound",component:function({title:e}){return m(e,[]),t.createElement("div",{className:"not-found"})},exact:!1,title:"404"}];function p(){return t.createElement(c,null,t.createElement(r,null,d.map((e=>t.createElement(o,{exact:e.exact,key:e.path,path:e.path,name:e.name},t.createElement(e.component,{title:e.title}))))))}function f(){return t.createElement(p,null)}n.render(t.createElement(t.StrictMode,null,t.createElement(f,null)),document.getElementById("root"));