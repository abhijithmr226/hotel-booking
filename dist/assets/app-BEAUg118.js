(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(i){if(i.ep)return;i.ep=!0;const o=n(i);fetch(i.href,o)}})();function $t(){try{const e=localStorage.getItem("hbooking_user");return e?JSON.parse(e):null}catch{return null}}const Fe=[];function it(e,t){Fe.push(t);const n=$t();return t(n?{uid:n.uid,email:n.email,displayName:n.name,photoURL:n.photoURL}:null),()=>{const a=Fe.indexOf(t);a!==-1&&Fe.splice(a,1)}}function St(e){Fe.forEach(t=>{try{t(e?{uid:e.uid,email:e.email,displayName:e.name,photoURL:e.photoURL}:null)}catch(n){console.error("Auth listener error:",n)}})}async function st(){localStorage.removeItem("hbooking_user"),localStorage.removeItem("hbooking_session_type"),St(null)}const Ie={},rt={platformName:"HotelsNearMeInKerala.com",taxRate:18,logoUrl:"/logo.png",notifyEmail:!0,notifyWhatsapp:!0,enableSound:!0,currency:"INR",whatsappNumber:"919876543210",autoInvoice:!0},lt={heroTitle:"Find The Perfect Stay Anywhere in Kerala",heroSubtext:"Search and book the best hotels, resorts, homestays, and houseboats across God's Own Country.",trustBadge:"Trusted by 25,000+ Happy Travelers"},k={hotels:[],bookings:[],rooms:[],users:[],reviews:[],coupons:[],audit_logs:[],system_users:[],settings:{...rt},seo:{...lt}};let Je;const Tt=new Promise(e=>{Je=e}),ze=new Set;function ne(e){ze.forEach(t=>{try{t(e,k)}catch(n){console.error(n)}})}function ot(e,t="createdAt"){return[...e].sort((n,a)=>(a[t]||"").localeCompare(n[t]||""))}function Oe(e){return ze.add(e),()=>ze.delete(e)}async function ae(){return await Tt,k}async function je(){try{const e=["hotels","bookings","rooms","users","reviews","coupons","audit_logs","system_users"];await Promise.all([...e.map(async a=>{try{const i=await fetch(`/api/${a}`);if(i.ok){const o=await i.json();a==="bookings"||a==="reviews"?k[a]=ot(o):a==="audit_logs"?k.audit_logs=ot(o,"timestamp"):k[a]=o,ne(a)}}catch(i){console.warn(`Error fetching ${a}:`,i.message)}}),(async()=>{try{const a=await fetch("/api/config/settings");if(a.ok){const i=await a.json();k.settings={...rt,...i},ne("settings")}}catch(a){console.warn("Error fetching settings:",a.message)}})(),(async()=>{try{const a=await fetch("/api/config/seo");if(a.ok){const i=await a.json();k.seo={...lt,...i},ne("seo")}}catch(a){console.warn("Error fetching seo:",a.message)}})()]);const t=(()=>{try{return JSON.parse(localStorage.getItem("hbooking_hotels_local")||"[]")}catch{return[]}})(),n=(()=>{try{return JSON.parse(localStorage.getItem("hbooking_rooms_local")||"[]")}catch{return[]}})();k.hotels.length===0&&t.length>0&&(k.hotels=t,ne("hotels")),k.rooms.length===0&&n.length>0&&(k.rooms=n,ne("rooms")),Je(k)}catch(e){console.error("Failed to sync backend data:",e),Je(k)}}async function Lt(){return await je(),setInterval(async()=>{await je()},6e3),console.log("Connected to PostgreSQL REST API."),k}async function Ee(){return await ae(),[...k.hotels]}async function dt(){return await ae(),[...k.bookings]}async function Te(){return await ae(),[...k.rooms]}async function At(){return await ae(),[...k.users]}async function Ge(){return await ae(),[...k.reviews]}async function ct(){return await ae(),[...k.coupons]}async function Ct(){return await ae(),[...k.audit_logs]}async function Nt(){return await ae(),[...k.system_users]}async function Ve(){return await ae(),{...k.settings}}async function We(){return await ae(),{...k.seo}}async function Mt(e){return await ae(),k.users.find(t=>t.uid===e)||null}const ut="hbooking_hotels_local",mt="hbooking_rooms_local";function He(){try{return JSON.parse(localStorage.getItem(ut)||"[]")}catch{return[]}}function Pe(e){localStorage.setItem(ut,JSON.stringify(e))}function _e(){try{return JSON.parse(localStorage.getItem(mt)||"[]")}catch{return[]}}function Ue(e){localStorage.setItem(mt,JSON.stringify(e))}async function O(e,t="POST",n=null){try{const a={method:t,headers:{"Content-Type":"application/json"}};n&&(a.body=JSON.stringify(n));const i=await fetch(e,a);if(!i.ok){let o={};try{o=await i.json()}catch{}throw new Error(o.message||`Mutation ${t} ${e} failed`)}await je()}catch(a){if(console.warn(`API ${t} ${e} failed, using localStorage fallback:`,a.message),e==="/api/hotels"&&t==="POST"){const i=He();i.push(n),Pe(i),k.hotels=[...i],ne("hotels")}else if(e.startsWith("/api/hotels/")&&t==="PUT"){const i=e.replace("/api/hotels/",""),o=He().map(s=>s.id===i?{...s,...n}:s);Pe(o),k.hotels=[...o],ne("hotels")}else if(e.startsWith("/api/hotels/")&&t==="DELETE"){const i=e.replace("/api/hotels/",""),o=He().filter(s=>s.id!==i);Pe(o),k.hotels=[...o],ne("hotels")}else if(e==="/api/rooms"&&t==="POST"){const i=_e();i.push(n),Ue(i),k.rooms=[...i],ne("rooms")}else if(e.startsWith("/api/rooms/")&&t==="PUT"){const i=e.replace("/api/rooms/",""),o=_e().map(s=>s.id===i?{...s,...n}:s);Ue(o),k.rooms=[...o],ne("rooms")}else if(e.startsWith("/api/rooms/")&&t==="DELETE"){const i=e.replace("/api/rooms/",""),o=_e().filter(s=>s.id!==i);Ue(o),k.rooms=[...o],ne("rooms")}else throw a}}async function Ft(e){await O("/api/config/settings","PUT",e)}async function Rt(e){await O("/api/config/seo","PUT",e)}async function Dt({currency:e,whatsappNumber:t,autoInvoice:n}){await O("/api/config/settings","PUT",{currency:e,whatsappNumber:t,autoInvoice:n})}async function G(e,t,n,a="",i=""){let o="system",s="system@hotelsnearme.com";try{const y=localStorage.getItem("hbooking_user");if(y){const w=JSON.parse(y);o=w.uid||w.email,s=w.email}}catch{}const d={logId:"log_"+Date.now()+"_"+Math.floor(Math.random()*1e3),operatorId:o,operatorEmail:s,action:e,targetType:t,targetId:n,previousValue:a,newValue:i,timestamp:new Date().toISOString()};await O("/api/audit_logs","POST",d)}async function Ot(e){await O("/api/hotels","POST",e),await G("ADD_HOTEL","hotel",e.id,"",JSON.stringify(e))}async function Ze(e,t){const n=k.hotels.find(a=>a.id===e);await O(`/api/hotels/${e}`,"PUT",t),await G("UPDATE_HOTEL","hotel",e,n?JSON.stringify(n):"",JSON.stringify(t))}async function Ht(e){const t=k.hotels.find(n=>n.id===e);await O(`/api/hotels/${e}`,"DELETE"),await G("DELETE_HOTEL","hotel",e,t?JSON.stringify(t):"","")}async function et(e){e.createdAt=new Date().toISOString(),await O("/api/bookings","POST",e),await G("ADD_BOOKING","booking",e.bookingId,"",JSON.stringify(e))}async function gt(e,t){const n=k.bookings.find(i=>i.bookingId===e),a=typeof t=="string"?{status:t}:t;await O(`/api/bookings/${e}`,"PUT",a),await G("UPDATE_BOOKING","booking",e,n?JSON.stringify(n):"",JSON.stringify(a))}async function at(e){await O("/api/rooms","POST",e),await G("ADD_ROOM","room",e.id,"",JSON.stringify(e))}async function ke(e,t){const n=k.rooms.find(a=>a.id===e);await O(`/api/rooms/${e}`,"PUT",t),await G("UPDATE_ROOM","room",e,n?JSON.stringify(n):"",JSON.stringify(t))}async function Pt(e){const t=k.rooms.find(n=>n.id===e);await O(`/api/rooms/${e}`,"DELETE"),await G("DELETE_ROOM","room",e,t?JSON.stringify(t):"","")}async function _t(e){if(!k.users.some(t=>t.uid===e.uid)){const t={...e,createdAt:e.createdAt||new Date().toISOString().split("T")[0]};await O("/api/users","POST",t)}}async function pt(e,t){const n=k.users.find(a=>a.uid===e);await O(`/api/users/${e}`,"PUT",t),await G("UPDATE_USER","user",e,n?JSON.stringify(n):"",JSON.stringify(t))}async function Ut(e){e.reviewId="rev_"+Date.now()+"_"+Math.floor(Math.random()*1e3),e.createdAt=new Date().toISOString(),e.status="pending",e.replyText=e.replyText||"",await O("/api/reviews","POST",e),await G("ADD_REVIEW","review",e.reviewId,"",JSON.stringify(e))}async function qt(e,t){const n=k.reviews.find(a=>a.reviewId===e);await O(`/api/reviews/${e}/status`,"PUT",{status:t}),await G("UPDATE_REVIEW_STATUS","review",e,n?JSON.stringify(n):"",t)}async function Jt(e,t){const n=k.reviews.find(a=>a.reviewId===e);await O(`/api/reviews/${e}/reply`,"PUT",{replyText:t}),await G("REPLY_REVIEW","review",e,n?JSON.stringify(n):"",t)}async function zt(e){const t=k.reviews.find(n=>n.reviewId===e);await O(`/api/reviews/${e}`,"DELETE"),await G("DELETE_REVIEW","review",e,t?JSON.stringify(t):"","")}async function jt(e){e.code=e.code.toUpperCase(),e.usageCount=e.usageCount||0,await O("/api/coupons","POST",e),await G("ADD_COUPON","coupon",e.code,"",JSON.stringify(e))}async function ft(e,t){const n=k.coupons.find(a=>a.code===e);await O(`/api/coupons/${e}`,"PUT",t),await G("UPDATE_COUPON","coupon",e,n?JSON.stringify(n):"",JSON.stringify(t))}async function Gt(e){const t=k.coupons.find(n=>n.code===e);await O(`/api/coupons/${e}`,"DELETE"),await G("DELETE_COUPON","coupon",e,t?JSON.stringify(t):"","")}async function Vt(e){const t="sys_"+Date.now();await O("/api/system-users","POST",{...e,id:t}),await G("ADD_SYSTEM_USER","system_user",t,"",JSON.stringify(e))}async function Wt(e){const t=k.system_users.find(n=>n.id===e);await O(`/api/system-users/${e}`,"DELETE"),await G("DELETE_SYSTEM_USER","system_user",e,t?JSON.stringify(t):"","")}async function xe(e){const t=await fetch(`/api/favorites/${e}`);return t.ok?await t.json():[]}async function yt(e,t){const n={id:`${e}_${t}`,userId:e,hotelId:t,createdAt:new Date().toISOString()};await O("/api/favorites","POST",n)}async function tt(e,t){await O(`/api/favorites/${e}/${t}`,"DELETE")}let Ke=.18;window.getGlobalTaxRate=function(){return Ke};async function ht(e){const t=await Mt(e.uid),a=(t==null?void 0:t.role)||(e.email==="admin@hotelsnearme.com"?"admin":"user"),i={uid:e.uid,name:(t==null?void 0:t.name)||e.displayName||e.email.split("@")[0],email:e.email,phone:(t==null?void 0:t.phone)||e.phoneNumber||"",photoURL:(t==null?void 0:t.photoURL)||e.photoURL||"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",role:a,status:(t==null?void 0:t.status)||"active"};return t||await _t(i),localStorage.setItem("hbooking_user",JSON.stringify(i)),i}document.addEventListener("DOMContentLoaded",async()=>{try{await Lt();const t=await We(),n=document.querySelector(".hero h1");n&&t.heroTitle&&(n.innerHTML=t.heroTitle.replace(/\n/g,"<br>"));const a=document.querySelector(".hero p");a&&t.heroSubtext&&(a.innerText=t.heroSubtext);const i=document.getElementById("trust-badge-text");i&&t.trustBadge&&(i.innerText=t.trustBadge);const o=await Ve();Ke=(o.taxRate??18)/100;const s=document.querySelector(".logo span");s&&o.platformName&&(s.innerText=o.platformName);const d=document.querySelector(".logo img");d&&o.logoUrl&&(d.src=o.logoUrl),Oe(y=>{y==="settings"&&Ve().then(w=>{Ke=(w.taxRate??18)/100;const b=document.querySelector(".logo span");b&&w.platformName&&(b.innerText=w.platformName);const c=document.querySelector(".logo img");c&&w.logoUrl&&(c.src=w.logoUrl)}),y==="seo"&&We().then(w=>{const b=document.querySelector(".hero h1");b&&w.heroTitle&&(b.innerHTML=w.heroTitle.replace(/\n/g,"<br>"));const c=document.querySelector(".hero p");c&&w.heroSubtext&&(c.innerText=w.heroSubtext);const v=document.getElementById("trust-badge-text");v&&w.trustBadge&&(v.innerText=w.trustBadge)})})}catch(t){console.error("Failed to connect to Firebase:",t),document.body.insertAdjacentHTML("afterbegin",`<div style="background:#FCEAEA;color:#D32F2F;padding:12px 20px;text-align:center;font-size:14px;font-weight:600;">
        Unable to connect to Firebase. Please check your internet connection and refresh the page.
      </div>`)}Ie?it(Ie,async t=>{t?(localStorage.removeItem("hbooking_session_type"),await ht(t)):localStorage.getItem("hbooking_session_type")!=="local"&&localStorage.removeItem("hbooking_user"),Ye(),Ae()}):(Ye(),Ae());const e=window.location.pathname;e.endsWith("index.html")||e==="/"||e.endsWith("/")?Kt():e.endsWith("hotel.html")?Yt():e.endsWith("login.html")?en():e.endsWith("admin.html")&&nn(),un()});function Ye(){const e=document.getElementById("header-login-btn"),t=document.getElementById("header-user-menu");if(!e&&!t)return;const n=localStorage.getItem("hbooking_user");if(n){const a=JSON.parse(n),i=a.name||a.email.split("@")[0],o=e||t;o.outerHTML=`
      <div class="user-dropdown-wrapper" id="header-user-menu">
        <button class="btn btn-secondary dropdown-trigger" style="display: flex; align-items: center; gap: 8px; border-radius: 20px; padding: 6px 16px;">
          <i class="fas fa-user-circle" style="font-size: 18px; color: var(--primary);"></i>
          <span>${i}</span>
          <i class="fas fa-chevron-down" style="font-size: 10px;"></i>
        </button>
        <div class="dropdown-menu">
          <a href="/admin.html" class="dropdown-item"><i class="fas fa-chart-line"></i> Admin Dashboard</a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item text-danger" id="header-logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
      </div>
    `,setTimeout(()=>{const s=document.querySelector(".dropdown-trigger"),d=document.querySelector(".dropdown-menu");s&&d&&(s.addEventListener("click",w=>{w.stopPropagation(),d.classList.toggle("show")}),document.addEventListener("click",()=>d.classList.remove("show")));const y=document.getElementById("header-logout-btn");y&&y.addEventListener("click",async w=>{if(w.preventDefault(),localStorage.removeItem("hbooking_user"),localStorage.removeItem("hbooking_session_type"),Ie)try{await st(Ie)}catch(b){console.warn("Firebase SignOut error:",b)}window.location.reload()})},100)}else{const a=t||e;a&&(a.id==="header-user-menu"?a.outerHTML=`
          <a href="/login.html" class="btn btn-primary" id="header-login-btn">
            <i class="fas fa-user-shield"></i> Admin Portal
          </a>
        `:(a.innerHTML='<i class="fas fa-user-shield"></i> Admin Portal',a.href="/login.html"))}}async function Kt(){let e=await Ee();const t=e.filter(c=>c.status==="active");Re("hotels-near-you-grid",t),Re("featured-hotels-grid",t.filter(c=>c.featured).slice(0,4)),Oe(c=>{c==="hotels"&&Ee().then(v=>{e=v,ye(e),Re("featured-hotels-grid",e.filter($=>$.status==="active"&&$.featured).slice(0,4))})});const n=document.getElementById("search-form");n&&n.addEventListener("submit",c=>{c.preventDefault(),ye(e)});const a=document.getElementById("btn-toggle-filters"),i=document.getElementById("advanced-filters-panel");a&&i&&a.addEventListener("click",()=>{const c=i.style.display==="block";i.style.display=c?"none":"block",a.classList.toggle("active",!c)}),[document.getElementById("filter-price-min"),document.getElementById("filter-price-max"),document.getElementById("filter-rating"),document.getElementById("filter-category"),document.getElementById("filter-sorting")].forEach(c=>{c&&c.addEventListener("change",()=>ye(e))}),document.querySelectorAll(".filter-amenity").forEach(c=>{c.addEventListener("change",()=>ye(e))});const s=document.getElementById("search-location"),d=document.getElementById("search-autocomplete-box");s&&d&&(s.addEventListener("input",()=>{const c=s.value.toLowerCase().trim();if(!c){d.style.display="none";return}const v=new Set(["Kollam","Thiruvananthapuram","Trivandrum","Kochi","Ernakulam","Alappuzha","Kottayam","Pathanamthitta","Idukki","Munnar","Thrissur","Palakkad","Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod","Varkala","Kovalam","Kumarakom","Thekkady","Bekal","Vagamon","Kumily"]);e.forEach(x=>{x.status==="active"&&(v.add(x.district),v.add(x.name),x.location&&v.add(x.location.split(",")[0].trim()))});const m=Array.from(v).filter(x=>x.toLowerCase().includes(c)).slice(0,5);if(m.length===0){d.style.display="none";return}d.innerHTML=m.map(x=>`
        <div class="autocomplete-suggestion" style="padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--border); font-size:13px; font-weight:500;" onclick="selectAutocompleteSuggestion('${x.replace(/'/g,"\\'")}')">
          <i class="fas fa-search" style="margin-right: 8px; color:var(--text-secondary); font-size:11px;"></i> ${x}
        </div>
      `).join(""),d.style.display="block"}),window.selectAutocompleteSuggestion=function(c){s.value=c,d.style.display="none",ye(e)},document.addEventListener("click",c=>{c.target!==s&&(d.style.display="none")})),document.querySelectorAll(".category-card").forEach(c=>{c.addEventListener("click",()=>{const v=c.dataset.category;document.getElementById("filter-category").value=v,document.getElementById("hotels-near-you").scrollIntoView({behavior:"smooth"}),ye(e)})}),document.querySelectorAll(".destination-card").forEach(c=>{c.addEventListener("click",()=>{const v=c.dataset.destination;document.getElementById("search-location").value=v,document.getElementById("hotels-near-you").scrollIntoView({behavior:"smooth"}),ye(e)})}),document.querySelectorAll(".district-tag").forEach(c=>{c.addEventListener("click",()=>{const v=c.innerText.trim();document.getElementById("search-location").value=v;const $=document.getElementById("hotels-near-you");$&&$.scrollIntoView({behavior:"smooth"}),ye(e)})})}function ye(e){const t=document.getElementById("search-location").value.toLowerCase(),n=parseInt(document.getElementById("filter-price-min").value)||0,a=parseInt(document.getElementById("filter-price-max").value)||1/0,i=parseFloat(document.getElementById("filter-rating").value)||0,o=document.getElementById("filter-category").value,s=document.getElementById("filter-sorting").value,d=Array.from(document.querySelectorAll(".filter-amenity:checked")).map(b=>b.value);let y=e.filter(b=>{if(b.status!=="active")return!1;const c=!t||b.location.toLowerCase().includes(t)||b.name.toLowerCase().includes(t)||b.district.toLowerCase().includes(t),v=b.price>=n&&b.price<=a,$=b.rating>=i,m=!o||b.category===o,x=d.every(I=>b.amenities&&b.amenities.includes(I));return c&&v&&$&&m&&x});s==="price-low"?y.sort((b,c)=>b.price-c.price):s==="price-high"?y.sort((b,c)=>c.price-b.price):s==="rating-high"&&y.sort((b,c)=>c.rating-b.rating);const w=document.querySelector("#hotels-near-you h2");w&&(w.innerText=t?`Search Results for "${t}"`:"Hotels Near You"),Re("hotels-near-you-grid",y)}async function Re(e,t){const n=document.getElementById(e);if(!n)return;if(t.length===0){n.innerHTML='<div style="grid-column: span 4; text-align: center; padding: 40px; color: var(--text-secondary);">No hotels found matching your search.</div>';return}let a=[];const i=localStorage.getItem("hbooking_user");if(i){const o=JSON.parse(i),s=o.uid||o.email;try{a=(await xe(s)).map(y=>y.hotelId)}catch(d){console.warn("Could not retrieve favorites for user:",d)}}n.innerHTML=t.map(o=>{const s=a.includes(o.id);return`
    <div class="hotel-card" data-hotel-id="${o.id}">
      <div class="hotel-card-image">
        <img src="${o.image}" alt="${o.name}">
        <span class="hotel-card-tag">${o.badge||o.category}</span>
        <button class="hotel-card-save" onclick="event.preventDefault(); toggleWishlist(this, '${o.id}')">
          <i class="${s?"fas fa-heart":"far fa-heart"}" style="${s?"color: #FF5A5F;":""}"></i>
        </button>
      </div>
      <div class="hotel-card-content">
        <div class="hotel-card-rating">
          <i class="fas fa-star"></i> ${o.rating} <span>(${o.reviewsCount} reviews)</span>
        </div>
        <h3>${o.name}</h3>
        <div class="hotel-card-loc">
          <i class="fas fa-map-marker-alt"></i> ${o.location}
        </div>
        <div class="hotel-card-footer">
          <div class="hotel-card-price">
            <span class="price-num">₹${o.price.toLocaleString("en-IN")}</span>
            <span class="price-unit">/night</span>
          </div>
          <a href="hotel.html?id=${o.id}" class="btn btn-outline btn-sm">View Details</a>
        </div>
      </div>
    </div>
  `}).join("")}let g=null,qe="whatsapp",j=null;async function Yt(){const t=new URLSearchParams(window.location.search).get("id")||"riverside",n=await Ee();if(g=n.find(r=>r.id===t)||n[0],!g)return;const a=document.getElementById("btn-save-hotel-detail");if(a){const r=localStorage.getItem("hbooking_user");if(r){const f=JSON.parse(r),B=f.uid||f.email;(await xe(B)).some(F=>F.hotelId===g.id)?a.innerHTML='<i class="fas fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Saved':a.innerHTML='<i class="far fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Save'}a.addEventListener("click",async f=>{f.preventDefault();const B=localStorage.getItem("hbooking_user");if(!B){alert("Please log in to save properties to your wishlist!"),window.location.href="/login.html";return}const h=JSON.parse(B),S=h.uid||h.email;(await xe(S)).some(A=>A.hotelId===g.id)?(await tt(S,g.id),a.innerHTML='<i class="far fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Save'):(await yt(S,g.id),a.innerHTML='<i class="fas fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Saved'),Ae()})}document.title=`${g.name} - HotelsNearMeInKerala`,document.getElementById("hotel-title").innerText=g.name,document.getElementById("breadcrumb-current").innerText=g.name,document.getElementById("hotel-stars").innerHTML='<i class="fas fa-star"></i>'.repeat(Math.floor(g.rating)),document.getElementById("hotel-rating-score").innerText=g.rating,document.getElementById("hotel-reviews-count").innerText=`(${g.reviewsCount} reviews)`,document.getElementById("hotel-location-text").innerText=g.location,document.getElementById("hotel-location-full")&&(document.getElementById("hotel-location-full").innerText=g.location),document.getElementById("hotel-badge-tag").innerText=g.badge||g.category,document.getElementById("hotel-desc").innerHTML=g.description,document.getElementById("sidebar-hotel-whatsapp").innerText=`+${g.whatsapp}`;const i=[g.image];Array.isArray(g.images)&&g.images.forEach(r=>{r&&r.trim()&&i.push(r.trim())});const o=document.getElementById("gallery-img-main");o&&(o.src=i[0]||"/assets/images/riverside.png");for(let r=1;r<=4;r++){const f=document.getElementById(`gallery-img-${r}`);if(f)if(i[r])f.src=i[r],f.style.display="",f.alt=`${g.name} photo ${r+1}`;else{f.style.display="none";const B=f.parentElement;B&&(B.style.background="var(--light)")}}const s=document.getElementById("gallery-more-btn");s&&(i.length>5?(s.style.display="",s.innerText=`+${i.length-5} Photos`):s.style.display="none");const d=document.getElementById("hotel-map-iframe"),y=document.getElementById("hotel-map-placeholder"),w=document.getElementById("hotel-map-link");d&&y&&(g.mapUrl&&g.mapUrl.trim()?(d.src=g.mapUrl.trim(),d.style.display="block",y.style.display="none",w&&(w.href=g.mapUrl.trim(),w.style.display="")):(d.style.display="none",y.style.display="flex",w&&(w.style.display="none")));const b=document.getElementById("amenities-grid");b&&g.amenities&&(b.innerHTML=g.amenities.map(r=>`
      <div class="amenity-item">
        <i class="fas fa-check-circle"></i>
        <span>${r}</span>
      </div>
    `).join(""));const c=document.getElementById("highlights-grid");c&&g.highlights&&(c.innerHTML=g.highlights.map(r=>`
      <div class="highlight-item">
        <i class="fas fa-sparkles"></i>
        <div>
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
        </div>
      </div>
    `).join(""));const v=document.getElementById("details-table-body");if(v&&g.details){const r=g.details;v.innerHTML=`
      <tr><td>Check-in</td><td>${r.checkIn}</td></tr>
      <tr><td>Check-out</td><td>${r.checkOut}</td></tr>
      <tr><td>Property Type</td><td>${r.propertyType}</td></tr>
      <tr><td>Room Count</td><td>${r.roomCount} Rooms</td></tr>
      <tr><td>Rating</td><td>${r.starRating}</td></tr>
      <tr><td>Languages Spoken</td><td>${r.languages}</td></tr>
      <tr><td>Nearest Railway Station</td><td>${r.station}</td></tr>
      <tr><td>Nearest Airport</td><td>${r.airport}</td></tr>
    `}const $=document.getElementById("nearby-attractions-list");$&&g.nearby&&($.innerHTML=g.nearby.map(r=>`
      <div class="hotel-card" style="box-shadow: none; border: 1px solid var(--border); padding: 15px; border-radius: 8px;">
        <h4 style="font-size: 14px; margin-bottom: 5px;">${r.name}</h4>
        <span style="font-size: 12px; color: var(--text-secondary);"><i class="fas fa-walking"></i> ${r.distance}</span>
      </div>
    `).join(""));const m=new Date,x=new Date(m);x.setDate(x.getDate()+1);const I=r=>r.toISOString().split("T")[0];document.getElementById("checkin-input").value=I(m),document.getElementById("checkout-input").value=I(x);const L=(await Te()).filter(r=>r.hotelId===g.id&&r.availability!=="maintenance"),M=document.getElementById("booking-room-select");M&&(L.length===0?M.innerHTML='<option value="">No rooms available</option>':M.innerHTML=L.map(r=>`
        <option value="${r.id}" data-price="${r.price}">${r.type} (₹${r.price.toLocaleString("en-IN")}/night) - ${r.inventory} left</option>
      `).join(""),M.addEventListener("change",ce)),ce();const P=document.querySelectorAll(".booking-tab");P.forEach(r=>{r.addEventListener("click",()=>{P.forEach(B=>B.classList.remove("active")),r.classList.add("active"),qe=r.dataset.mode;const f=document.getElementById("booking-submit-btn");qe==="whatsapp"?(f.innerHTML='Check Availability <i class="fab fa-whatsapp" style="margin-left: 8px;"></i>',f.style.backgroundColor="var(--primary)"):(f.innerHTML='Book Online <i class="fas fa-credit-card" style="margin-left: 8px;"></i>',f.style.backgroundColor="var(--primary)")})}),document.getElementById("checkin-input").addEventListener("change",ce),document.getElementById("checkout-input").addEventListener("change",ce),document.getElementById("guests-rooms").addEventListener("change",ce);const p=document.getElementById("btn-apply-coupon");p&&p.addEventListener("click",async()=>{const r=document.getElementById("coupon-code-input").value.trim().toUpperCase(),f=document.getElementById("coupon-message");if(!r){f.innerText="Please enter a coupon code.",f.style.color="#FF5A5F",f.style.display="block";return}const h=(await ct()).find(N=>N.code===r&&N.status==="active");if(!h){f.innerText="Invalid or expired coupon code.",f.style.color="#FF5A5F",f.style.display="block",j=null,ce();return}if(new Date(h.expiryDate)<new Date){f.innerText="This coupon code has expired.",f.style.color="#FF5A5F",f.style.display="block",j=null,ce();return}if(Qt()<(h.minBookingAmount||0)){f.innerText=`Minimum booking amount of ₹${h.minBookingAmount.toLocaleString("en-IN")} required.`,f.style.color="#FF5A5F",f.style.display="block",j=null,ce();return}j=h,f.innerText=`Coupon ${h.code} applied! ${h.discountPercent}% Discount.`,f.style.color="#108569",f.style.display="block",ce()});function u(r){const f=document.getElementById("hotel-reviews-list");if(!f)return;if(r.length===0){f.innerHTML='<p style="font-size:13px; color:var(--text-secondary); text-align:center; padding: 20px;">No reviews yet. Be the first to share your experience!</p>';const R=document.getElementById("hotel-rating-score");R&&(R.innerText=g.rating||"4.5");const K=document.getElementById("hotel-stars");if(K){const de=g.rating||4.5;K.innerHTML='<i class="fas fa-star"></i>'.repeat(Math.floor(de))+(de%1>=.5?'<i class="fas fa-star-half-alt"></i>':"")+'<i class="far fa-star"></i>'.repeat(Math.max(0,5-Math.ceil(de)))}const te=document.getElementById("hotel-reviews-count");te&&(te.innerText="(0 reviews)");const Y=document.getElementById("detail-overall-score");Y&&(Y.innerText=g.rating||"4.5");const le=document.getElementById("detail-stars-row");if(le){const de=g.rating||4.5;le.innerHTML='<i class="fas fa-star"></i>'.repeat(Math.floor(de))+(de%1>=.5?'<i class="fas fa-star-half-alt"></i>':"")+'<i class="far fa-star"></i>'.repeat(Math.max(0,5-Math.ceil(de)))}const we=document.getElementById("detail-overall-text");we&&(we.innerText="New Stay (0 reviews)");return}f.innerHTML=r.map(R=>{var K;return`
      <div class="review-card" style="border-bottom: 1px solid var(--border); padding-bottom: 20px; text-align: left;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${R.userPhoto||"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
            <div>
              <h4 style="font-size:13px; font-weight:600;">${R.userName}</h4>
              <span style="font-size:10px; color:var(--text-secondary);">${((K=R.createdAt)==null?void 0:K.split("T")[0])||R.createdAt}</span>
            </div>
          </div>
          <div style="color:#FF9A02; font-size:12px;">
            ${'<i class="fas fa-star"></i>'.repeat(R.rating)}${'<i class="far fa-star"></i>'.repeat(5-R.rating)}
          </div>
        </div>
        <p style="font-size:13px; color:var(--text-secondary); line-height:1.5;">${R.reviewText}</p>
        ${R.replyText?`
          <div class="review-reply" style="background:var(--light); padding:12px; border-radius:6px; margin-top:10px; border-left: 3px solid var(--primary);">
            <h5 style="font-size:11px; font-weight:700; margin-bottom:4px; color:var(--primary);"><i class="fas fa-reply"></i> Manager Response</h5>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin:0;">${R.replyText}</p>
          </div>
        `:""}
      </div>
    `}).join("");const B=r.length,h=parseFloat((r.reduce((R,K)=>R+K.rating,0)/B).toFixed(1)),S=document.getElementById("hotel-rating-score");S&&(S.innerText=h.toFixed(1));const F=document.getElementById("hotel-stars");F&&(F.innerHTML='<i class="fas fa-star"></i>'.repeat(Math.floor(h))+(h%1>=.5?'<i class="fas fa-star-half-alt"></i>':"")+'<i class="far fa-star"></i>'.repeat(Math.max(0,5-Math.ceil(h))));const N=document.getElementById("hotel-reviews-count");N&&(N.innerText=`(${B} reviews)`);const A=document.getElementById("detail-overall-score");A&&(A.innerText=h.toFixed(1));const Q=document.getElementById("detail-stars-row");Q&&(Q.innerHTML='<i class="fas fa-star"></i>'.repeat(Math.floor(h))+(h%1>=.5?'<i class="fas fa-star-half-alt"></i>':"")+'<i class="far fa-star"></i>'.repeat(Math.max(0,5-Math.ceil(h))));const X=document.getElementById("detail-overall-text");if(X){let R="Excellent";h<4?R="Good":h<4.5&&(R="Very Good"),X.innerText=`${R} (${B} reviews)`}const z=Math.min(5,h+.1),V=h,ie=h,se=Math.max(1,h-.2),ue=document.getElementById("detail-clean-score");ue&&(ue.innerText=z.toFixed(1));const me=document.getElementById("detail-clean-fill");me&&(me.style.width=`${Math.round(z*20)}%`);const fe=document.getElementById("detail-location-score");fe&&(fe.innerText=V.toFixed(1));const he=document.getElementById("detail-location-fill");he&&(he.style.width=`${Math.round(V*20)}%`);const ve=document.getElementById("detail-service-score");ve&&(ve.innerText=ie.toFixed(1));const re=document.getElementById("detail-service-fill");re&&(re.style.width=`${Math.round(ie*20)}%`);const ge=document.getElementById("detail-value-score");ge&&(ge.innerText=se.toFixed(1));const pe=document.getElementById("detail-value-fill");pe&&(pe.style.width=`${Math.round(se*20)}%`)}if(document.getElementById("hotel-reviews-list")){const f=(await Ge()).filter(B=>B.hotelId===g.id&&B.status==="approved");u(f)}const E=document.getElementById("review-stars-input"),T=document.getElementById("review-rating-value");if(E&&T){const r=E.querySelectorAll("i");r.forEach(f=>{f.addEventListener("click",()=>{const B=parseInt(f.dataset.value);T.value=B,r.forEach(h=>{const S=parseInt(h.dataset.value);h.style.color=S<=B?"#FF9A02":"#E2ECE8"})})})}const H=document.getElementById("form-submit-review");H&&H.addEventListener("submit",async r=>{r.preventDefault();const f=localStorage.getItem("hbooking_user");if(!f){alert("Please log in to submit a review."),window.location.href="/login.html";return}const B=JSON.parse(f),h=parseInt(document.getElementById("review-rating-value").value)||5,S=document.getElementById("review-text").value.trim();if(!S)return;const F={userId:B.uid||B.email,userName:B.name||B.email.split("@")[0],userPhoto:B.photoURL,hotelId:g.id,rating:h,reviewText:S};await Ut(F),alert("Thank you! Your review has been submitted successfully and is pending moderation."),H.reset(),T.value="5",E.querySelectorAll("i").forEach(N=>N.style.color="#FF9A02")}),window.openCheckoutModal=function(){const r=document.getElementById("checkout-modal");if(!r)return;const f=new Date(document.getElementById("checkin-input").value),B=new Date(document.getElementById("checkout-input").value);let h=Math.ceil((B-f)/(1e3*60*60*24));(isNaN(h)||h<=0)&&(h=1);const S=parseInt(document.getElementById("guests-rooms").value.split(",")[1])||1;let F=g.price,N=g.name;const A=document.getElementById("booking-room-select");if(A&&A.value){const V=A.options[A.selectedIndex];F=parseInt(V.dataset.price)||g.price,N=V.text.split(" (")[0]}const Q=g.tax||F*window.getGlobalTaxRate();let X=(F+Q)*h*S;j&&(X-=Math.floor(X*(j.discountPercent/100))),document.getElementById("checkout-summary-hotel").innerText=g.name,document.getElementById("checkout-summary-room").innerText=N,document.getElementById("checkout-summary-checkin").innerText=document.getElementById("checkin-input").value,document.getElementById("checkout-summary-checkout").innerText=document.getElementById("checkout-input").value,document.getElementById("checkout-summary-amount").innerText=`₹${X.toLocaleString("en-IN")}`;const z=localStorage.getItem("hbooking_user");if(z){const V=JSON.parse(z);document.getElementById("checkout-guest-name").value=V.name||"",document.getElementById("checkout-guest-phone").value=V.phone||"",document.getElementById("checkout-guest-email").value=V.email||""}document.getElementById("checkout-payment-form").reset(),document.getElementById("card-brand-icon").className="far fa-credit-card",document.getElementById("card-brand-icon").style.color="var(--text-secondary)",r.classList.add("open")},window.closeCheckoutModal=function(){const r=document.getElementById("checkout-modal");r&&r.classList.remove("open")},window.closeSuccessModal=function(){const r=document.getElementById("booking-success-modal");r&&r.classList.remove("open"),window.location.reload()};const _=document.getElementById("checkout-card-number");_&&_.addEventListener("input",r=>{let f=r.target.value.replace(/\s+/g,"").replace(/[^0-9]/gi,""),B="";for(let S=0;S<f.length;S++)S>0&&S%4===0&&(B+=" "),B+=f[S];r.target.value=B;const h=document.getElementById("card-brand-icon");f.startsWith("4")?(h.className="fab fa-cc-visa",h.style.color="#1A1F71"):/^(5[1-5]|2[2-7])/.test(f)?(h.className="fab fa-cc-mastercard",h.style.color="#EB001B"):/^(3[47])/.test(f)?(h.className="fab fa-cc-amex",h.style.color="#016FD0"):(h.className="far fa-credit-card",h.style.color="var(--text-secondary)")});const J=document.getElementById("checkout-card-expiry");J&&J.addEventListener("input",r=>{let f=r.target.value.replace(/\D/g,"");f.length>2?r.target.value=f.slice(0,2)+"/"+f.slice(2,4):r.target.value=f});const U=document.getElementById("checkout-card-cvv");U&&U.addEventListener("input",r=>{r.target.value=r.target.value.replace(/\D/g,"").slice(0,3)}),document.getElementById("booking-submit-btn").addEventListener("click",()=>{qe==="whatsapp"?Xt():window.openCheckoutModal()}),document.getElementById("modal-close-btn").addEventListener("click",vt),document.getElementById("whatsapp-booking-form").addEventListener("submit",Zt);const ee=document.getElementById("checkout-payment-form");ee&&ee.addEventListener("submit",async r=>{r.preventDefault();const f=document.getElementById("checkout-card-number").value.replace(/\s+/g,""),B=document.getElementById("checkout-card-expiry").value,h=document.getElementById("checkout-card-cvv").value;if(f.length!==16){alert("Please enter a valid 16-digit credit card number.");return}if(!/^\d{2}\/\d{2}$/.test(B)){alert("Please enter a valid expiry date in MM/YY format.");return}const S=B.split("/"),F=parseInt(S[0]),N=parseInt("20"+S[1]);if(F<1||F>12){alert("Expiry month must be between 01 and 12.");return}const A=new Date,Q=A.getMonth()+1,X=A.getFullYear();if(N<X||N===X&&F<Q){alert("Your card is expired.");return}if(h.length!==3){alert("CVV must be 3 digits.");return}const z=document.getElementById("checkout-loading");z&&(z.style.display="flex"),await new Promise(Se=>setTimeout(Se,1500));const V=document.getElementById("checkout-guest-name").value,ie=document.getElementById("checkout-guest-phone").value,se=document.getElementById("checkout-guest-email").value,ue=document.getElementById("checkin-input").value,me=document.getElementById("checkout-input").value,fe=document.getElementById("guests-rooms").value,he=new Date(ue),ve=new Date(me);let re=Math.ceil((ve-he)/(1e3*60*60*24));(isNaN(re)||re<=0)&&(re=1);const ge=parseInt(fe.split(",")[1])||1;let pe=g.price,R=g.name,K="";const te=document.getElementById("booking-room-select");if(te&&te.value){K=te.value;const Se=te.options[te.selectedIndex];pe=parseInt(Se.dataset.price)||g.price,R=Se.text.split(" (")[0]}if(K){const Ne=(await Te()).find(Me=>Me.id===K);if(Ne){if(Ne.inventory<ge||Ne.availability==="maintenance"){z&&(z.style.display="none"),alert("Not enough rooms available for the selected type!");return}const Me=Ne.inventory-ge;await ke(K,{inventory:Math.max(0,Me),availability:Me<=0?"booked":"available"})}}const Y=g.tax||pe*window.getGlobalTaxRate();let le=(pe+Y)*re*ge;j&&(le-=Math.floor(le*(j.discountPercent/100)),await ft(j.code,{usageCount:(j.usageCount||0)+1}));const we=Math.floor(1e3+Math.random()*9e3),Be=`BK-${new Date().getFullYear()}-${we}`,$e=localStorage.getItem("hbooking_user"),Ce=$e?JSON.parse($e).uid||JSON.parse($e).email:"guest",Bt={bookingId:Be,guestName:V,guestPhone:ie,guestEmail:se,userId:Ce,hotelId:g.id,hotelName:g.name,roomId:K,roomType:R,checkIn:ue,checkOut:me,guestsRooms:fe,amount:le,status:"Confirmed",specialRequests:"Online Checkout Booking",paymentStatus:"Paid",paymentMethod:"Credit Card",createdAt:new Date().toISOString()};await et(Bt),z&&(z.style.display="none"),document.getElementById("checkout-modal").classList.remove("open"),document.getElementById("success-booking-id").innerText=Be,document.getElementById("success-hotel-name").innerText=g.name,document.getElementById("success-room-type").innerText=R,document.getElementById("success-check-in").innerText=ue,document.getElementById("success-check-out").innerText=me,document.getElementById("success-amount").innerText=`₹${le.toLocaleString("en-IN")}`,document.getElementById("success-print-invoice-btn").onclick=()=>{window.openInvoiceViewerModal(Be)},document.getElementById("success-view-bookings-btn").onclick=()=>{document.getElementById("booking-success-modal").classList.remove("open"),xt()},document.getElementById("booking-success-modal").classList.add("open")});async function Z(){const f=(await Ee()).find(N=>N.id===t);f&&(g=f);const h=(await Te()).filter(N=>N.hotelId===g.id&&N.availability!=="maintenance"),S=document.getElementById("booking-room-select");if(S){const N=S.value;S.innerHTML=h.length===0?'<option value="">No rooms available</option>':h.map(A=>`<option value="${A.id}" data-price="${A.price}">${A.type} (₹${A.price.toLocaleString("en-IN")}/night) - ${A.inventory} left</option>`).join(""),h.some(A=>A.id===N)&&(S.value=N),ce()}if(document.getElementById("hotel-reviews-list")){const A=(await Ge()).filter(Q=>Q.hotelId===g.id&&Q.status==="approved");u(A)}}Oe(r=>{(r==="rooms"||r==="reviews"||r==="hotels")&&Z()})}function Qt(){const e=new Date(document.getElementById("checkin-input").value),t=new Date(document.getElementById("checkout-input").value);let n=Math.ceil((t-e)/(1e3*60*60*24));(isNaN(n)||n<=0)&&(n=1);const a=parseInt(document.getElementById("guests-rooms").value.split(",")[1])||1;let i=g.price;const o=document.getElementById("booking-room-select");if(o&&o.value){const d=o.options[o.selectedIndex];i=parseInt(d.dataset.price)||g.price}const s=g.tax||i*window.getGlobalTaxRate();return(i+s)*n*a}function ce(){if(!g)return;const e=new Date(document.getElementById("checkin-input").value),t=new Date(document.getElementById("checkout-input").value);let n=Math.ceil((t-e)/(1e3*60*60*24));(isNaN(n)||n<=0)&&(n=1);const a=document.getElementById("guests-rooms").value,i=parseInt(a.split(",")[1])||1;let o=g.price,s=g.name;const d=document.getElementById("booking-room-select");if(d&&d.value){const m=d.options[d.selectedIndex];o=parseInt(m.dataset.price)||g.price,s=m.text.split(" (")[0]}const y=g.tax||o*window.getGlobalTaxRate(),w=o*n*i,b=y*n*i;let c=w+b,v=0;if(j)if(c>=(j.minBookingAmount||0))v=Math.floor(c*(j.discountPercent/100)),c-=v;else{j=null;const m=document.getElementById("coupon-message");m&&(m.innerText=`Coupon removed. Min spend required: ₹${j.minBookingAmount}`,m.style.color="#FF5A5F",m.style.display="block")}const $=document.querySelector(".booking-cost-breakdown");if($){let m="";v>0&&(m=`
        <div class="cost-row" id="breakdown-coupon-row" style="color: #108569; font-weight: 600;">
          <span>Promo Discount (${j.code})</span>
          <span>- ₹${v.toLocaleString("en-IN")}</span>
        </div>
      `),$.innerHTML=`
      <div class="cost-row">
        <span id="breakdown-nights">${s} (x${n} nights, ${i} room${i>1?"s":""})</span>
        <span id="breakdown-nights-cost">₹${w.toLocaleString("en-IN")}</span>
      </div>
      <div class="cost-row">
        <span>Taxes & Fees</span>
        <span id="breakdown-tax-cost">₹${b.toLocaleString("en-IN")}</span>
      </div>
      ${m}
      <div class="cost-row total">
        <span>Estimated Total</span>
        <span id="breakdown-grand-total">₹${c.toLocaleString("en-IN")}</span>
      </div>
    `}document.getElementById("booking-header-price").innerText=`₹${o.toLocaleString("en-IN")}`,document.getElementById("booking-header-tax").innerText=`+ ₹${y.toLocaleString("en-IN")} taxes & fees`}function Xt(){document.getElementById("booking-modal").classList.add("open")}function vt(){document.getElementById("booking-modal").classList.remove("open")}async function Zt(e){e.preventDefault();const t=document.getElementById("guest-name").value,n=document.getElementById("guest-phone").value,a=document.getElementById("guest-requests").value,i=document.getElementById("checkin-input").value,o=document.getElementById("checkout-input").value,s=document.getElementById("guests-rooms").value,d=new Date(i),y=new Date(o);let w=Math.ceil((y-d)/(1e3*60*60*24));(isNaN(w)||w<=0)&&(w=1);const b=parseInt(s.split(",")[1])||1;let c=g.price,v=g.name,$="";const m=document.getElementById("booking-room-select");if(m&&m.value){$=m.value;const H=m.options[m.selectedIndex];c=parseInt(H.dataset.price)||g.price,v=H.text.split(" (")[0]}if($){const _=(await Te()).find(J=>J.id===$);if(_){if(_.inventory<b||_.availability==="maintenance"){alert("Not enough rooms available for the selected type!");return}const J=_.inventory-b,U={inventory:Math.max(0,J),availability:J<=0?"booked":"available"};await ke($,U)}}const x=g.tax||c*window.getGlobalTaxRate();let I=(c+x)*w*b;j&&(I-=Math.floor(I*(j.discountPercent/100)));const C=Math.floor(1e3+Math.random()*9e3),M=`BK-${new Date().getFullYear()}-${C}`,P=localStorage.getItem("hbooking_user"),p=P?JSON.parse(P).uid||JSON.parse(P).email:"guest",u={bookingId:M,guestName:t,guestPhone:n,userId:p,hotelId:g.id,hotelName:g.name,roomId:$,roomType:v,checkIn:i,checkOut:o,guestsRooms:s,amount:I,status:"Pending",specialRequests:a||"None",paymentStatus:"Unpaid",paymentMethod:"WhatsApp Inquiry",createdAt:new Date().toISOString()};try{await et(u)}catch(H){console.warn("Failed to log WhatsApp booking:",H)}const l=`Hello! I would like to book a stay at ${g.name}.

Here are my booking details:
- *Guest Name*: ${t}
- *Contact*: ${n}
- *Room*: ${v}
- *Check-in*: ${i}
- *Check-out*: ${o}
- *Guests & Rooms*: ${s.split(",")[0]} Guests, ${b} Room(s)
- *Special Requests*: ${a||"None"}
- *Estimated Total*: ₹${I.toLocaleString("en-IN")} (taxes & coupon incl.)

Please confirm availability. Thank you!`,E=encodeURIComponent(l),T=`https://api.whatsapp.com/send/?phone=${g.whatsapp}&text=${E}`;vt(),document.getElementById("whatsapp-booking-form").reset(),alert(`Booking Created successfully!
Booking Code: #${M}
Redirecting you to WhatsApp...`),window.open(T,"_blank")}function en(){const e=document.getElementById("auth-submit-btn"),t=document.getElementById("auth-message"),n=document.getElementById("auth-form"),a=document.getElementById("auth-password");if(!n)return;function i(s,d="error"){t&&(t.style.display="block",t.innerText=s,d==="error"?(t.style.background="rgba(220, 53, 69, 0.15)",t.style.color="#FF5A5F",t.style.border="1px solid rgba(220, 53, 69, 0.3)"):d==="success"&&(t.style.background="rgba(16, 133, 105, 0.15)",t.style.color="#108569",t.style.border="1px solid rgba(16, 133, 105, 0.3)"))}function o(s){s?(e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i> Verifying...'):(e.disabled=!1,e.innerHTML='Authenticate <i class="fas fa-unlock-alt" style="margin-left:8px;"></i>')}n.addEventListener("submit",async s=>{s.preventDefault(),t&&(t.style.display="none");const d=a.value;if(!d){i("Please enter the passcode.","error");return}if(o(!0),d==="987654321"){const y={uid:"sys_admin",name:"Super Admin",email:"admin@hotelsnearme.com",role:"admin",status:"active"};localStorage.setItem("hbooking_session_type","local"),localStorage.setItem("hbooking_user",JSON.stringify(y)),i("Passcode verified! Unlocking...","success"),setTimeout(()=>{window.location.href="/admin.html"},800)}else setTimeout(()=>{o(!1),i("Incorrect passcode. Access denied.","error")},500)})}let W=[],q=[],oe=[],be=[],De=[],Qe=[],Xe=[],Le=[],wt=null,bt=null;async function D(){W=await Ee(),q=await dt(),oe=await Te(),be=await At(),De=await Ge(),Qe=await ct(),Xe=await Ct(),Le=await Nt(),wt=await We(),bt=await Ve(),tn(),rn(W),cn(q),ln(q),dn(W,q);const e=document.querySelector(".sidebar-menu li.active"),t=e?e.dataset.tab:"dashboard";nt(t)}function tn(){const e=document.getElementById("filter-rooms-hotel"),t=document.getElementById("add-room-hotel-select"),n=document.getElementById("booking-hotel-select"),a=W.map(i=>`<option value="${i.id}">${i.name}</option>`).join("");if(e){const i=e.value;e.innerHTML='<option value="">All Hotels</option>'+a,e.value=i}t&&(t.innerHTML='<option value="">Select Hotel...</option>'+a),n&&(n.innerHTML='<option value="">Select Hotel...</option>'+a)}function nt(e){e==="hotels"?typeof window.renderAdminHotelsTable=="function"&&window.renderAdminHotelsTable():e==="rooms"?typeof window.renderAdminRoomsTable=="function"&&window.renderAdminRoomsTable():e==="bookings"?typeof window.renderAdminBookingsTable=="function"&&window.renderAdminBookingsTable():e==="users"?typeof window.renderAdminUsersTable=="function"&&window.renderAdminUsersTable():e==="reviews"?typeof window.renderAdminReviewsTable=="function"&&window.renderAdminReviewsTable():e==="offers"?typeof window.renderAdminCouponsTable=="function"&&window.renderAdminCouponsTable():e==="payments"?(typeof window.renderAdminPaymentsTable=="function"&&window.renderAdminPaymentsTable(),typeof window.renderGatewaySettingsForm=="function"&&window.renderGatewaySettingsForm()):e==="reports"?typeof window.renderDistrictPerformance=="function"&&window.renderDistrictPerformance():e==="audit-logs"?typeof window.renderAdminAuditLogsTable=="function"&&window.renderAdminAuditLogsTable():e==="seo"?typeof window.renderAdminSEOTab=="function"&&window.renderAdminSEOTab():e==="settings"?typeof window.renderAdminSettingsTab=="function"&&window.renderAdminSettingsTab():e==="system-users"&&typeof window.renderAdminSystemUsersTable=="function"&&window.renderAdminSystemUsersTable()}async function nn(){const e=localStorage.getItem("hbooking_user"),t=e?JSON.parse(e):null,n=localStorage.getItem("hbooking_session_type")==="local";let a=null;if(n&&t)a=t;else{const p=await new Promise(u=>{const l=it(Ie,E=>{l(),u(E)})});if(!p){window.location.href="/login.html";return}a=await ht(p)}if(a.role!=="admin"){window.location.href="/index.html";return}document.getElementById("admin-profile-name").innerText=a.name||a.email.split("@")[0],await D(),Oe(()=>{D()}),document.querySelectorAll(".sidebar-menu li[data-tab]").forEach(p=>{p.addEventListener("click",u=>{u.preventDefault();const l=p.dataset.tab;window.switchAdminTab(l)})});const o=document.querySelector(".sidebar-toggle"),s=document.querySelector(".admin-sidebar");o&&s&&o.addEventListener("click",()=>{s.classList.toggle("open")});const d=document.querySelector(".admin-search input");d&&d.addEventListener("input",()=>{const p=d.value.toLowerCase().trim(),u=document.querySelector(".sidebar-menu li.active"),l=u?u.dataset.tab:"dashboard";if(!p){nt(l);return}if(l==="hotels"){const E=W.filter(T=>T.name.toLowerCase().includes(p)||T.location.toLowerCase().includes(p)||T.category.toLowerCase().includes(p));It(E)}else if(l==="rooms"){const E=oe.filter(T=>T.type.toLowerCase().includes(p)||T.roomNumber.includes(p)||T.hotelName&&T.hotelName.toLowerCase().includes(p));Et(E),window.renderRoomsTableData(E)}else if(l==="bookings"){const E=q.filter(T=>T.bookingId.toLowerCase().includes(p)||T.guestName.toLowerCase().includes(p)||T.guestPhone.includes(p));window.renderBookingsTableData(E)}else if(l==="users"){const E=be.filter(T=>T.name.toLowerCase().includes(p)||T.email.toLowerCase().includes(p));window.renderUsersTableData(E)}});const y=document.getElementById("admin-logout-btn");y&&y.addEventListener("click",async p=>{if(p.preventDefault(),localStorage.removeItem("hbooking_user"),localStorage.removeItem("hbooking_session_type"),Ie)try{await st(Ie)}catch(u){console.warn("Firebase SignOut error:",u)}window.location.href="/login.html"});const w=document.getElementById("add-hotel-form");w&&w.addEventListener("submit",async p=>{var Q,X,z,V,ie,se,ue,me,fe,he,ve,re,ge,pe,R,K,te;p.preventDefault();const u=document.getElementById("new-hotel-name").value,l=document.getElementById("new-hotel-district").value,E=parseInt(document.getElementById("new-hotel-price").value)||2999,T=document.getElementById("new-hotel-category").value,H=((X=(Q=document.getElementById("new-hotel-image"))==null?void 0:Q.value)==null?void 0:X.trim())||"/assets/images/riverside.png",_=((V=(z=document.getElementById("new-hotel-whatsapp"))==null?void 0:z.value)==null?void 0:V.trim())||"919876543210",J=((se=(ie=document.getElementById("new-hotel-description"))==null?void 0:ie.value)==null?void 0:se.trim())||`${u} is a premium hotel in ${l}, Kerala offering excellent service and stays.`,U=((ue=document.getElementById("new-hotel-featured"))==null?void 0:ue.checked)||!1,ee=((fe=(me=document.getElementById("new-hotel-map"))==null?void 0:me.value)==null?void 0:fe.trim())||"",Z=[(ve=(he=document.getElementById("new-hotel-img2"))==null?void 0:he.value)==null?void 0:ve.trim(),(ge=(re=document.getElementById("new-hotel-img3"))==null?void 0:re.value)==null?void 0:ge.trim(),(R=(pe=document.getElementById("new-hotel-img4"))==null?void 0:pe.value)==null?void 0:R.trim(),(te=(K=document.getElementById("new-hotel-img5"))==null?void 0:K.value)==null?void 0:te.trim()].filter(Boolean),r=Array.from(w.querySelectorAll('input[name="amenity"]:checked')).map(Y=>Y.value),f=u.toLowerCase().replace(/[^a-z0-9]/g,"_")+"_"+Date.now(),B=w.querySelectorAll(".room-type-entry"),h=[];let S=0;B.forEach((Y,le)=>{const we=Y.querySelector('input[name="rt-name"]').value.trim(),de=parseInt(Y.querySelector('input[name="rt-price"]').value)||E,Be=parseInt(Y.querySelector('input[name="rt-capacity"]').value)||2,$e=parseInt(Y.querySelector('input[name="rt-beds"]').value)||1,Ce=parseInt(Y.querySelector('input[name="rt-inventory"]').value)||5;we&&(S+=Ce,h.push({id:`rm_${f}_${le}_${Date.now()}`,hotelId:f,hotelName:u,roomNumber:`${101+le}`,type:we,price:de,capacity:Be,beds:$e,inventory:Ce,availability:"available",amenities:["Free Wi-Fi","Air Conditioning","TV"]}))});let F=E;h.length>0&&(F=Math.min(...h.map(Y=>Y.price)));const N={id:f,name:u,location:`${l}, Kerala`,district:l,category:T,rating:4.5,reviewsCount:0,price:F,tax:Math.floor(F*window.getGlobalTaxRate()),image:H,images:Z,mapUrl:ee,whatsapp:_,badge:"Newly Added",description:J,amenities:r,highlights:[{title:"New Resort",desc:"Top quality facilities freshly set up"}],details:{checkIn:"12:00 PM",checkOut:"11:00 AM",propertyType:"Hotel",roomCount:S||10,starRating:"4 Star",languages:"English, Malayalam",station:"Station nearby",airport:"Airport nearby"},nearby:[],featured:U,trending:!1,status:"active"};await Ot(N);for(const Y of h)await at(Y);alert("Hotel and Room configurations added successfully!"),window.closeAddHotelModal(),w.reset();const A=document.getElementById("room-types-container");A&&(A.innerHTML=`
          <div class="room-type-entry" style="background:var(--light); border-radius:8px; padding:12px; margin-bottom:10px; border:1px solid var(--border);">
            <div class="form-row">
              <div class="form-group">
                <label>Room Type Name *</label>
                <input type="text" name="rt-name" placeholder="e.g. Deluxe Room, Suite" required>
              </div>
              <div class="form-group">
                <label>Price / Night (₹) *</label>
                <input type="number" name="rt-price" placeholder="e.g. 3500" min="100" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Capacity (Guests) *</label>
                <input type="number" name="rt-capacity" placeholder="2" value="2" min="1" required>
              </div>
              <div class="form-group">
                <label>Beds *</label>
                <input type="number" name="rt-beds" placeholder="1" value="1" min="1" required>
              </div>
            </div>
            <div class="form-group">
              <label>Available Rooms (Inventory) *</label>
              <input type="number" name="rt-inventory" placeholder="5" value="5" min="1" required>
            </div>
          </div>
        `),await D()});const b=document.getElementById("edit-hotel-form");b&&b.addEventListener("submit",async p=>{var r,f,B,h,S,F,N,A,Q,X,z,V,ie,se;p.preventDefault();const u=document.getElementById("edit-hotel-id").value,l=document.getElementById("edit-hotel-name").value,E=parseInt(document.getElementById("edit-hotel-price").value)||2999,T=document.getElementById("edit-hotel-status").value,H=document.getElementById("edit-hotel-featured").checked,_=(f=(r=document.getElementById("edit-hotel-image"))==null?void 0:r.value)==null?void 0:f.trim(),J=(h=(B=document.getElementById("edit-hotel-whatsapp"))==null?void 0:B.value)==null?void 0:h.trim(),U=(F=(S=document.getElementById("edit-hotel-map"))==null?void 0:S.value)==null?void 0:F.trim(),ee=[(A=(N=document.getElementById("edit-hotel-img2"))==null?void 0:N.value)==null?void 0:A.trim(),(X=(Q=document.getElementById("edit-hotel-img3"))==null?void 0:Q.value)==null?void 0:X.trim(),(V=(z=document.getElementById("edit-hotel-img4"))==null?void 0:z.value)==null?void 0:V.trim(),(se=(ie=document.getElementById("edit-hotel-img5"))==null?void 0:ie.value)==null?void 0:se.trim()].filter(Boolean),Z={name:l,price:E,status:T,featured:H,tax:Math.floor(E*window.getGlobalTaxRate())};_&&(Z.image=_),J&&(Z.whatsapp=J),U!==void 0&&(Z.mapUrl=U),ee.length>0&&(Z.images=ee),await Ze(u,Z),alert("Hotel Details Updated!"),window.closeEditHotelModal(),b.reset(),await D()});const c=document.getElementById("add-room-form");c&&c.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("add-room-hotel-select").value,l=document.getElementById("add-room-number").value,E=parseInt(document.getElementById("add-room-price").value)||2999,T=document.getElementById("add-room-type").value,H=parseInt(document.getElementById("add-room-capacity").value)||2,_=parseInt(document.getElementById("add-room-beds").value)||1,J=parseInt(document.getElementById("add-room-inventory").value)||5,U=W.find(r=>r.id===u),ee=U?U.name:u,Z={id:`rm_${u}_${l}_${Date.now()}`,hotelId:u,hotelName:ee,roomNumber:l,type:T,price:E,capacity:H,beds:_,inventory:J,availability:"available",amenities:["Free Wi-Fi","Air Conditioning","TV"]};await at(Z),alert("Room Config Added Successfully!"),window.closeAddRoomModal(),c.reset(),await D()});const v=document.getElementById("booking-hotel-select"),$=document.getElementById("booking-room-select-admin");v&&$&&v.addEventListener("change",()=>{const p=v.value,u=oe.filter(l=>l.hotelId===p&&l.availability==="available");u.length===0?$.innerHTML='<option value="">No rooms available</option>':$.innerHTML=u.map(l=>`
          <option value="${l.id}" data-price="${l.price}">${l.type} (Room #${l.roomNumber}) - ₹${l.price}/night</option>
        `).join("")});const m=document.getElementById("manual-booking-form");m&&m.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("booking-hotel-select").value,l=document.getElementById("booking-room-select-admin").value,E=document.getElementById("booking-guest-name").value,T=document.getElementById("booking-guest-phone").value,H=document.getElementById("booking-checkin").value,_=document.getElementById("booking-checkout").value,J=W.find(A=>A.id===u),U=oe.find(A=>A.id===l);if(!J||!U){alert("Please select both a valid Hotel and an available Room type.");return}if(U.inventory<=0){alert("This room config has no vacancy left!");return}await ke(l,{inventory:Math.max(0,U.inventory-1),availability:U.inventory-1<=0?"booked":"available"});const ee=new Date(H),Z=new Date(_);let r=Math.ceil((Z-ee)/(1e3*60*60*24));(isNaN(r)||r<=0)&&(r=1);const f=J.tax||Math.floor(U.price*window.getGlobalTaxRate()),B=(U.price+f)*r,h=new Date().getFullYear(),S=Math.floor(1e3+Math.random()*9e3),F=`BK-${h}-${S}`,N={bookingId:F,guestName:E,guestPhone:T,userId:"admin_manual",hotelId:u,hotelName:J.name,roomId:l,roomType:U.type,checkIn:H,checkOut:_,guestsRooms:"2 Guests, 1 Room",amount:B,status:"Confirmed",specialRequests:"Manually registered by Staff",paymentStatus:"Paid",paymentMethod:"WhatsApp",createdAt:new Date().toISOString()};await et(N),alert(`Booking Created successfully!
Booking Code: #${F}`),window.closeManualBookingModal(),m.reset(),await D()});const x=document.getElementById("add-coupon-form");x&&x.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("new-coupon-code").value.trim().toUpperCase(),l=parseInt(document.getElementById("new-coupon-pct").value)||10,E=parseInt(document.getElementById("new-coupon-min").value)||0,T=parseInt(document.getElementById("new-coupon-limit").value)||100,H=document.getElementById("new-coupon-expiry").value;await jt({code:u,discountPercent:l,expiryDate:H,usageLimit:T,usageCount:0,minBookingAmount:E,status:"active"}),alert("Coupon Published successfully!"),window.closeAddCouponModal(),x.reset(),await D()});const I=document.getElementById("review-reply-form");I&&I.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("reply-review-id").value,l=document.getElementById("reply-manager-text").value.trim();await Jt(u,l),alert("Official reply posted!"),window.closeReviewReplyModal(),I.reset(),await D()}),window.openAddSystemUserModal=function(){const p=document.getElementById("add-system-user-modal");p&&p.classList.add("open")},window.closeAddSystemUserModal=function(){const p=document.getElementById("add-system-user-modal");p&&p.classList.remove("open")};const C=document.getElementById("add-system-user-form");C&&C.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("new-sys-email").value.trim(),l=document.getElementById("new-sys-name").value.trim(),E=document.getElementById("new-sys-role").value,T=document.getElementById("new-sys-permissions").value.trim();if(Le.some(H=>H.email.toLowerCase()===u.toLowerCase())){alert("A system user with this email address already exists.");return}await Vt({email:u,name:l,role:E,permissions:T,status:"Active"}),alert("System Administrative User added successfully!"),window.closeAddSystemUserModal(),C.reset(),await D()});const L=document.getElementById("seo-editor-form");L&&L.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("seo-hero-title").value.trim(),l=document.getElementById("seo-hero-subtext").value.trim(),E=document.getElementById("seo-trust-badge").value.trim();await Rt({heroTitle:u,heroSubtext:l,trustBadge:E}),alert("Homepage banner details published successfully!"),await D()});const M=document.getElementById("settings-editor-form");M&&M.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("settings-platform-name").value.trim(),l=parseInt(document.getElementById("settings-tax-rate").value)||18,E=document.getElementById("settings-logo-url").value.trim(),T=document.getElementById("settings-notify-email").checked,H=document.getElementById("settings-notify-whatsapp").checked,_=document.getElementById("settings-enable-sound").checked;await Ft({platformName:u,taxRate:l,logoUrl:E,notifyEmail:T,notifyWhatsapp:H,enableSound:_}),alert("System administrative settings saved successfully!"),await D()});const P=document.getElementById("gateway-settings-form");P&&P.addEventListener("submit",async p=>{p.preventDefault();const u=document.getElementById("gateway-currency").value,l=document.getElementById("gateway-whatsapp").value.trim(),E=document.getElementById("gateway-auto-invoice").value==="yes";await Dt({currency:u,whatsappNumber:l,autoInvoice:E}),alert("Payment gateway settings saved successfully!"),await D()})}window.switchAdminTab=function(e){document.querySelectorAll(".admin-tab-content").forEach(i=>i.style.display="none");const n=document.getElementById(`tab-${on(e)}`);n&&(n.style.display="block"),document.querySelectorAll(".sidebar-menu li[data-tab]").forEach(i=>{i.dataset.tab===e?i.classList.add("active"):i.classList.remove("active")}),nt(e)};function on(e){return{offers:"offers","system-users":"system-users","audit-logs":"audit-logs","ai-assistant":"ai-assistant"}[e]||e}window.addRoomTypeRow=function(){const e=document.getElementById("room-types-container");if(!e)return;const t=document.createElement("div");t.className="room-type-entry",t.style.cssText="background:var(--light); border-radius:8px; padding:12px; margin-bottom:10px; border:1px solid var(--border); position:relative;",t.innerHTML=`
    <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:8px; right:8px; background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:16px; font-weight:bold;">&times;</button>
    <div class="form-row">
      <div class="form-group">
        <label>Room Type Name *</label>
        <input type="text" name="rt-name" placeholder="e.g. Deluxe Room, Suite" required>
      </div>
      <div class="form-group">
        <label>Price / Night (₹) *</label>
        <input type="number" name="rt-price" placeholder="e.g. 3500" required min="100">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Capacity (Guests) *</label>
        <input type="number" name="rt-capacity" placeholder="2" value="2" min="1" required>
      </div>
      <div class="form-group">
        <label>Beds *</label>
        <input type="number" name="rt-beds" placeholder="1" value="1" min="1" required>
      </div>
    </div>
    <div class="form-group">
      <label>Available Rooms (Inventory) *</label>
      <input type="number" name="rt-inventory" placeholder="5" value="5" min="1" required>
    </div>
  `,e.appendChild(t)};window.submitAddHotelForm=function(){const e=document.getElementById("add-hotel-form");e&&e.requestSubmit()};window.openAddHotelModal=function(){document.getElementById("add-hotel-modal").classList.add("open")};window.closeAddHotelModal=function(){document.getElementById("add-hotel-modal").classList.remove("open")};window.openEditHotelModal=function(e){const t=W.find(s=>s.id===e);if(!t)return;document.getElementById("edit-hotel-id").value=t.id,document.getElementById("edit-hotel-name").value=t.name,document.getElementById("edit-hotel-price").value=t.price,document.getElementById("edit-hotel-status").value=t.status||"active",document.getElementById("edit-hotel-featured").checked=!!t.featured;const n=document.getElementById("edit-hotel-image");n&&(n.value=t.image||"");const a=document.getElementById("edit-hotel-whatsapp");a&&(a.value=t.whatsapp||"");const i=document.getElementById("edit-hotel-map");i&&(i.value=t.mapUrl||"");const o=Array.isArray(t.images)?t.images:[];for(let s=2;s<=5;s++){const d=document.getElementById(`edit-hotel-img${s}`);d&&(d.value=o[s-2]||"")}document.getElementById("edit-hotel-modal").classList.add("open")};window.closeEditHotelModal=function(){document.getElementById("edit-hotel-modal").classList.remove("open")};window.openAddRoomModal=function(){document.getElementById("add-room-modal").classList.add("open")};window.closeAddRoomModal=function(){document.getElementById("add-room-modal").classList.remove("open")};window.openManualBookingModal=function(){document.getElementById("add-booking-modal").classList.add("open")};window.closeManualBookingModal=function(){document.getElementById("add-booking-modal").classList.remove("open")};window.openAddCouponModal=function(){document.getElementById("add-coupon-modal").classList.add("open")};window.closeAddCouponModal=function(){document.getElementById("add-coupon-modal").classList.remove("open")};window.closeReviewReplyModal=function(){document.getElementById("review-reply-modal").classList.remove("open")};window.closeInvoiceModal=function(){document.getElementById("view-invoice-modal").classList.remove("open")};function It(e){const t=document.getElementById("admin-hotels-tbody");if(t){if(e.length===0){t.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;">No hotels found.</td></tr>';return}t.innerHTML=e.map(n=>{const a=!!n.featured;return`
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${n.image}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;">
            <span style="font-weight:600;">${n.name}</span>
          </div>
        </td>
        <td>${n.district}</td>
        <td>${n.category}</td>
        <td>₹${n.price.toLocaleString("en-IN")}</td>
        <td><i class="fas fa-star" style="color:#FF9A02;"></i> ${n.rating}</td>
        <td>
          <button class="status-badge ${n.status==="active"?"confirmed":"cancelled"}" style="border:none; cursor:pointer;" onclick="toggleHotelStatus('${n.id}', '${n.status}')">
            ${n.status==="active"?"Active":"Hidden"}
          </button>
        </td>
        <td>
          <button class="status-badge ${a?"confirmed":"pending"}" style="border:none; cursor:pointer;" onclick="toggleHotelFeatured('${n.id}', ${a})">
            ${a?"Featured":"Standard"}
          </button>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openEditHotelModal('${n.id}')" style="padding:4px 8px;"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline btn-sm text-danger" onclick="deleteHotelProperty('${n.id}')" style="padding:4px 8px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `}).join("")}}window.renderAdminHotelsTable=function(){var n;const e=(((n=document.getElementById("search-hotels-input"))==null?void 0:n.value)||"").toLowerCase().trim(),t=W.filter(a=>!e||a.name.toLowerCase().includes(e)||a.district.toLowerCase().includes(e)||a.category.toLowerCase().includes(e));It(t)};window.toggleHotelStatus=async function(e,t){await Ze(e,{status:t==="active"?"hidden":"active"}),await D()};window.toggleHotelFeatured=async function(e,t){await Ze(e,{featured:!t}),await D()};window.deleteHotelProperty=async function(e){confirm("Are you sure you want to delete this hotel property? All listings and rooms associated will be affected.")&&(await Ht(e),await D())};function Et(e){const t=document.getElementById("admin-rooms-tbody");if(t){if(e.length===0){t.innerHTML='<tr><td colspan="9" style="text-align:center; padding:20px;">No rooms found.</td></tr>';return}t.innerHTML=e.map(n=>`
    <tr>
      <td><span style="font-weight:600;">${n.type}</span></td>
      <td>${n.hotelName||n.hotelId}</td>
      <td>${n.roomNumber}</td>
      <td>₹${n.price.toLocaleString("en-IN")}</td>
      <td>${n.capacity} Guests</td>
      <td>${n.beds} Beds</td>
      <td>
        <div style="display:flex; align-items:center; gap:5px;">
          <button class="btn btn-outline btn-sm" onclick="adjustRoomInventory('${n.id}', -1)" style="padding:2px 6px;">-</button>
          <span style="font-weight:600; min-width:20px; text-align:center;">${n.inventory}</span>
          <button class="btn btn-outline btn-sm" onclick="adjustRoomInventory('${n.id}', 1)" style="padding:2px 6px;">+</button>
        </div>
      </td>
      <td>
        <select onchange="changeRoomStatus('${n.id}', this.value)" style="border:1px solid var(--border); padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600;">
          <option value="available" ${n.availability==="available"?"selected":""}>Available</option>
          <option value="booked" ${n.availability==="booked"?"selected":""}>Booked</option>
          <option value="maintenance" ${n.availability==="maintenance"?"selected":""}>Maintenance</option>
        </select>
      </td>
      <td>
        <button class="btn btn-outline btn-sm text-danger" onclick="deleteRoomConfig('${n.id}')" style="padding:4px 8px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("")}}window.renderAdminRoomsTable=function(){var a,i;const e=(((a=document.getElementById("search-rooms-input"))==null?void 0:a.value)||"").toLowerCase().trim(),t=((i=document.getElementById("filter-rooms-hotel"))==null?void 0:i.value)||"",n=oe.filter(o=>{const s=!e||o.type.toLowerCase().includes(e)||o.roomNumber.includes(e),d=!t||o.hotelId===t;return s&&d});Et(n)};window.adjustRoomInventory=async function(e,t){const n=oe.find(i=>i.id===e);if(!n)return;const a=Math.max(0,n.inventory+t);await ke(e,{inventory:a}),await D()};window.changeRoomStatus=async function(e,t){await ke(e,{availability:t}),await D()};window.deleteRoomConfig=async function(e){confirm("Are you sure you want to delete this room configuration?")&&(await Pt(e),await D())};function an(e){const t=document.getElementById("admin-bookings-tbody");if(t){if(e.length===0){t.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;">No bookings found.</td></tr>';return}t.innerHTML=e.map(n=>`
    <tr>
      <td><strong>#${n.bookingId}</strong></td>
      <td>
        <div style="font-weight:600;">${n.guestName}</div>
        <div style="font-size:11px; color:var(--text-secondary);">${n.guestPhone}</div>
      </td>
      <td>
        <div style="font-weight:500;">${n.hotelName}</div>
        <div style="font-size:11px; color:var(--text-secondary);">${n.roomType||"-"}</div>
      </td>
      <td>
        <div style="font-size:12px; font-weight:500;">In: ${n.checkIn}</div>
        <div style="font-size:12px; font-weight:500; color:var(--text-secondary);">Out: ${n.checkOut}</div>
      </td>
      <td><strong>₹${n.amount.toLocaleString("en-IN")}</strong></td>
      <td><span class="status-badge ${n.status.toLowerCase().replace(" ","-")}">${n.status}</span></td>
      <td><span class="status-badge ${n.paymentStatus.toLowerCase()}">${n.paymentStatus}</span></td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${n.status==="Pending"?`<button class="btn btn-primary btn-xs" onclick="updateAdminBookingStatus('${n.bookingId}', 'Confirmed', 'Paid')" style="padding:2px 6px; font-size:11px;">Confirm</button>`:""}
          ${n.status==="Confirmed"?`<button class="btn btn-secondary btn-xs" onclick="updateAdminBookingStatus('${n.bookingId}', 'Checked In', 'Paid')" style="padding:2px 6px; font-size:11px; background:#2B76D9;">Check-In</button>`:""}
          ${n.status==="Checked In"?`<button class="btn btn-secondary btn-xs" onclick="updateAdminBookingStatus('${n.bookingId}', 'Completed', 'Paid')" style="padding:2px 6px; font-size:11px; background:#108569;">Check-Out</button>`:""}
          ${n.status!=="Completed"&&n.status!=="Cancelled"&&n.status!=="Refunded"?`<button class="btn btn-outline btn-xs text-danger" onclick="updateAdminBookingStatus('${n.bookingId}', 'Cancelled', 'Refunded')" style="padding:2px 6px; font-size:11px; border-color:#FF5A5F; color:#FF5A5F;">Cancel</button>`:""}
          <button class="btn btn-outline btn-xs" onclick="openInvoiceViewerModal('${n.bookingId}')" style="padding:2px 6px; font-size:11px;"><i class="fas fa-file-invoice"></i> Invoice</button>
        </div>
      </td>
    </tr>
  `).join("")}}window.renderAdminBookingsTable=function(){var a,i;const e=(((a=document.getElementById("search-bookings-input"))==null?void 0:a.value)||"").toLowerCase().trim(),t=((i=document.getElementById("filter-bookings-status"))==null?void 0:i.value)||"",n=q.filter(o=>{const s=!e||o.bookingId.toLowerCase().includes(e)||o.guestName.toLowerCase().includes(e)||o.guestPhone.includes(e),d=!t||o.status===t;return s&&d});an(n)};window.updateAdminBookingStatus=async function(e,t,n){if(t==="Cancelled"){const a=q.find(i=>i.bookingId===e);if(a&&a.roomId){const i=oe.find(o=>o.id===a.roomId);if(i){const o=parseInt(a.guestsRooms.split(",")[1])||1;await ke(a.roomId,{inventory:i.inventory+o,availability:"available"})}}}await gt(e,{status:t,paymentStatus:n}),await D()};function sn(e){const t=document.getElementById("admin-users-tbody");if(t){if(e.length===0){t.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;">No users found.</td></tr>';return}t.innerHTML=e.map(n=>`
    <tr>
      <td><code>${n.uid.slice(0,8)}...</code></td>
      <td><span style="font-weight:600;">${n.name}</span></td>
      <td>${n.email}</td>
      <td>${n.phone||"-"}</td>
      <td>${n.createdAt||"-"}</td>
      <td><span class="status-badge ${n.role==="admin"?"confirmed":"pending"}">${n.role}</span></td>
      <td><span class="status-badge ${n.status==="active"?"confirmed":"cancelled"}">${n.status==="active"?"Active":"Banned"}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="toggleUserBanStatus('${n.uid}', '${n.status}')" style="padding:4px 8px; font-size:11px; border-color:${n.status==="active"?"#FF5A5F":"#108569"}; color:${n.status==="active"?"#FF5A5F":"#108569"};">
          ${n.status==="active"?"Ban User":"Unban User"}
        </button>
      </td>
    </tr>
  `).join("")}}window.renderAdminUsersTable=function(){var n;const e=(((n=document.getElementById("search-users-input"))==null?void 0:n.value)||"").toLowerCase().trim(),t=be.filter(a=>!e||a.name.toLowerCase().includes(e)||a.email.toLowerCase().includes(e));sn(t)};window.toggleUserBanStatus=async function(e,t){const n=t==="active"?"banned":"active";confirm(`Are you sure you want to ${n==="banned"?"ban":"unban"} this user account?`)&&(await pt(e,{status:n}),await D())};window.renderAdminReviewsTable=function(){const e=document.getElementById("admin-reviews-tbody");if(e){if(De.length===0){e.innerHTML='<tr><td colspan="7" style="text-align:center; padding:20px;">No reviews found.</td></tr>';return}e.innerHTML=De.map(t=>`
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="${t.userPhoto||"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
          <span style="font-weight:500;">${t.userName}</span>
        </div>
      </td>
      <td>${t.hotelId}</td>
      <td><div style="color:#FF9A02; font-size:12px;">${'<i class="fas fa-star"></i>'.repeat(t.rating)}</div></td>
      <td>
        <div style="max-width:250px; font-size:12px; color:var(--text-secondary); line-height:1.4;">${t.reviewText}</div>
        ${t.replyText?`<div style="font-size:11px; color:var(--primary); margin-top:5px;"><strong>Reply:</strong> ${t.replyText}</div>`:""}
      </td>
      <td>${t.createdAt}</td>
      <td><span class="status-badge ${t.status==="approved"?"confirmed":t.status==="rejected"?"cancelled":"pending"}">${t.status}</span></td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${t.status==="pending"?`
            <button class="btn btn-outline btn-xs" onclick="approveReviewStatus('${t.reviewId}', 'approved')" style="padding:2px 6px; font-size:11px; border-color:#108569; color:#108569;">Approve</button>
            <button class="btn btn-outline btn-xs" onclick="approveReviewStatus('${t.reviewId}', 'rejected')" style="padding:2px 6px; font-size:11px; border-color:#FF5A5F; color:#FF5A5F;">Reject</button>
          `:""}
          <button class="btn btn-primary btn-xs" onclick="openReviewReplyModalGlobal('${t.reviewId}')" style="padding:2px 6px; font-size:11px;">Reply</button>
          <button class="btn btn-outline btn-xs text-danger" onclick="deleteReviewRecord('${t.reviewId}')" style="padding:2px 6px; font-size:11px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join("")}};window.approveReviewStatus=async function(e,t){await qt(e,t),await D()};window.openReviewReplyModalGlobal=function(e){const t=De.find(n=>n.reviewId===e);t&&(document.getElementById("reply-review-id").value=e,document.getElementById("reply-review-text").innerText=`"${t.reviewText}"`,document.getElementById("reply-manager-text").value=t.replyText||"",document.getElementById("review-reply-modal").classList.add("open"))};window.deleteReviewRecord=async function(e){confirm("Are you sure you want to delete this review?")&&(await zt(e),await D())};window.renderAdminCouponsTable=function(){const e=document.getElementById("admin-coupons-tbody");if(e){if(Qe.length===0){e.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;">No coupons found.</td></tr>';return}e.innerHTML=Qe.map(t=>`
    <tr>
      <td><strong>${t.code}</strong></td>
      <td>${t.discountPercent}%</td>
      <td>${t.expiryDate}</td>
      <td>${t.usageLimit}</td>
      <td>${t.usageCount}</td>
      <td>₹${t.minBookingAmount.toLocaleString("en-IN")}</td>
      <td>
        <button class="status-badge ${t.status==="active"?"confirmed":"cancelled"}" style="border:none; cursor:pointer;" onclick="toggleCouponStatus('${t.code}', '${t.status}')">
          ${t.status==="active"?"Active":"Inactive"}
        </button>
      </td>
      <td>
        <button class="btn btn-outline btn-sm text-danger" onclick="deleteCouponRecord('${t.code}')" style="padding:4px 8px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("")}};window.toggleCouponStatus=async function(e,t){await ft(e,{status:t==="active"?"inactive":"active"}),await D()};window.deleteCouponRecord=async function(e){confirm("Are you sure you want to delete this coupon?")&&(await Gt(e),await D())};window.renderAdminPaymentsTable=function(){const e=document.getElementById("admin-payments-tbody");if(!e)return;const t=q.filter(n=>n.status!=="Cancelled"||n.paymentStatus==="Refunded");if(t.length===0){e.innerHTML='<tr><td colspan="7" style="text-align:center; padding:20px;">No transactions recorded.</td></tr>';return}e.innerHTML=t.map(n=>`
    <tr>
      <td><code>TXN-${n.bookingId.split("-").pop()||"0000"}</code></td>
      <td>#${n.bookingId}</td>
      <td>${n.guestName}</td>
      <td><i class="fab fa-whatsapp" style="color:#108569;"></i> ${n.paymentMethod||"WhatsApp"}</td>
      <td><strong>₹${n.amount.toLocaleString("en-IN")}</strong></td>
      <td><span class="status-badge ${n.paymentStatus.toLowerCase()}">${n.paymentStatus}</span></td>
      <td>${n.createdAt?n.createdAt.split("T")[0]:"-"}</td>
    </tr>
  `).join("")};window.renderAdminAuditLogsTable=function(){const e=document.getElementById("admin-audit-logs-tbody");if(e){if(Xe.length===0){e.innerHTML='<tr><td colspan="7" style="text-align:center; padding:20px;">No audit logs.</td></tr>';return}e.innerHTML=Xe.map(t=>`
    <tr>
      <td><code>${t.operatorEmail}</code></td>
      <td><span style="font-weight:600; font-size:11px;">${t.action}</span></td>
      <td><span class="status-badge pending" style="font-size:10px; padding:2px 6px;">${t.targetType}</span></td>
      <td><code>${t.targetId}</code></td>
      <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${t.previousValue||""}">${t.previousValue||"-"}</td>
      <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${t.newValue||""}">${t.newValue||"-"}</td>
      <td style="font-size:11px; color:var(--text-secondary);">${new Date(t.timestamp).toLocaleString()}</td>
    </tr>
  `).join("")}};window.openInvoiceViewerModal=function(e){const t=q.find(a=>a.bookingId===e);if(!t)return;const n=document.getElementById("invoice-print-area");if(n){const a=window.getGlobalTaxRate(),i=Math.floor(t.amount*(a/(1+a))),o=t.amount-i;n.innerHTML=`
==================================================
        HOTELS NEAR ME IN KERALA INVOICE
==================================================
Invoice ID  : INV-${t.bookingId.split("-").pop()}
Booking ID  : #${t.bookingId}
Date        : ${new Date(t.createdAt||Date.now()).toLocaleDateString()}
Guest Name  : ${t.guestName}
Phone       : ${t.guestPhone}
--------------------------------------------------
Hotel Name  : ${t.hotelName}
Room type   : ${t.roomType||"-"}
Check-In    : ${t.checkIn}
Check-Out   : ${t.checkOut}
Guests/Rooms: ${t.guestsRooms||"-"}
--------------------------------------------------
Subtotal    : ₹${o.toLocaleString("en-IN")}
GST (${Math.round(a*100)}%)   : ₹${i.toLocaleString("en-IN")}
--------------------------------------------------
GRAND TOTAL : ₹${t.amount.toLocaleString("en-IN")}
Payment Status: ${t.paymentStatus} (Via ${t.paymentMethod||"WhatsApp"})
==================================================
          Thank you for booking with us!
==================================================
`}document.getElementById("view-invoice-modal").classList.add("open")};window.printInvoice=function(){const e=document.getElementById("invoice-print-area").innerHTML,t=window.open("","_blank","height=600,width=800");t.document.write("<html><head><title>Print Invoice</title>"),t.document.write('<style>body{font-family:"Courier New", monospace; padding:40px; white-space: pre-wrap; font-size:14px; text-align:left;}</style>'),t.document.write("</head><body>"),t.document.write(e),t.document.write("</body></html>"),t.document.close(),t.focus(),setTimeout(()=>{t.print(),t.close()},250)};window.exportDataCSV=function(){if(q.length===0){alert("No bookings available to export.");return}const e=["Booking ID","Guest Name","Guest Phone","Hotel Name","Room Type","Check In","Check Out","Amount","Status","Payment Status","Created At"],t=q.map(o=>[o.bookingId,o.guestName,o.guestPhone,o.hotelName,o.roomType,o.checkIn,o.checkOut,o.amount,o.status,o.paymentStatus,o.createdAt]),n="data:text/csv;charset=utf-8,"+[e.join(","),...t.map(o=>o.map(s=>`"${String(s).replace(/"/g,'""')}"`).join(","))].join(`
`),a=encodeURI(n),i=document.createElement("a");i.setAttribute("href",a),i.setAttribute("download",`hbooking_reservations_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(i),i.click(),document.body.removeChild(i)};window.handleAIChatKeyPress=function(e){e.key==="Enter"&&(e.preventDefault(),window.sendAIChat())};window.sendAIChat=function(){const e=document.getElementById("ai-chat-input"),t=document.getElementById("ai-chat-output");if(!e||!t)return;const n=e.value.trim();if(!n)return;const a=document.createElement("div");a.style.cssText="background:var(--primary); color:#FFFFFF; padding:10px 14px; border-radius:12px; align-self:flex-end; max-width:80%; margin-top:8px;",a.innerText=n,t.appendChild(a),e.value="",t.scrollTop=t.scrollHeight;const i=document.createElement("div");i.style.cssText="background:var(--light); padding:10px 14px; border-radius:12px; align-self:flex-start; max-width:80%; color:var(--text-secondary); font-style:italic;",i.innerText="Analyzing live data...",t.appendChild(i),t.scrollTop=t.scrollHeight,setTimeout(()=>{var m,x;t.removeChild(i);const o=n.toLowerCase(),s=W.length,d=q.length,y=q.filter(I=>I.status==="Confirmed"||I.status==="Pending"||I.status==="Checked In"||I.status==="Checked Out"),w=q.filter(I=>I.status==="Confirmed"||I.status==="Checked In"||I.status==="Checked Out").length,b=y.reduce((I,C)=>I+(C.amount||0),0);let c,v=null;for(const I of W){const C=I.name.toLowerCase().replace(/,.*|-/g,"").trim();if(o.includes(C)||o.includes(I.id.toLowerCase())){v=I;break}}if(v){const I=q.filter(l=>l.hotelId===v.id),C=I.filter(l=>l.status==="Confirmed"||l.status==="Pending"||l.status==="Checked In"||l.status==="Checked Out"),L=C.reduce((l,E)=>l+(E.amount||0),0),M=oe.filter(l=>l.hotelId===v.id),P=M.filter(l=>l.availability==="booked").length+C.filter(l=>l.status==="Confirmed"||l.status==="Checked In").length,p=M.reduce((l,E)=>l+(E.inventory||0),0)+P,u=p>0?P/p*100:0;o.includes("price")||o.includes("pricing")||o.includes("rate")||o.includes("suggest")?u>70?c=`Pricing Optimization for "${v.name}": Occupancy is high at ${u.toFixed(1)}% (with ${C.length} active bookings). We suggest raising the current rate of ₹${v.price.toLocaleString("en-IN")} by 10% to 15% to maximize yield on upcoming dates.`:u<30?c=`Pricing Optimization for "${v.name}": Occupancy is low at ${u.toFixed(1)}%. We suggest offering a 10% to 20% discount coupon or lowering the base rate of ₹${v.price.toLocaleString("en-IN")} temporarily to boost demand.`:c=`Pricing Optimization for "${v.name}": Occupancy is steady at ${u.toFixed(1)}% and current rate is ₹${v.price.toLocaleString("en-IN")}. The current rate is well-optimized for the market.`:o.includes("occupancy")||o.includes("booking")||o.includes("stats")||o.includes("revenue")?c=`Performance report for "${v.name}": Rating is ${v.rating} ★. It has generated ₹${L.toLocaleString("en-IN")} in active revenue across ${I.length} total processed booking requests. Occupancy rate is ${u.toFixed(1)}% with ${P} rooms currently booked.`:c=`"${v.name}" is located in ${v.location} (${v.district} district) with a rating of ${v.rating} ★. The standard price is ₹${v.price.toLocaleString("en-IN")}/night. It has processed ${I.length} bookings, generating ₹${L.toLocaleString("en-IN")} in revenue.`}else{let C=["kochi","munnar","alappuzha","varkala","kovalam","wayanad","kollam"].find(L=>o.includes(L));if(C){const L=W.filter(l=>l.district.toLowerCase().includes(C)||l.location.toLowerCase().includes(C)),M=q.filter(l=>L.some(E=>E.id===l.hotelId)),p=M.filter(l=>l.status==="Confirmed"||l.status==="Pending"||l.status==="Checked In"||l.status==="Checked Out").reduce((l,E)=>l+(E.amount||0),0),u=L.length>0?(L.reduce((l,E)=>l+E.rating,0)/L.length).toFixed(1):"4.5";c=`In ${C.charAt(0).toUpperCase()+C.slice(1)}, there are ${L.length} active hotel listings with an average rating of ${u} ★. We've processed ${M.length} booking(s) for this region, generating ₹${p.toLocaleString("en-IN")} in active revenue.`}else if(o.includes("top hotel")||o.includes("best hotel")||o.includes("performing")){const L={};q.filter(u=>u.status!=="Cancelled").forEach(u=>{L[u.hotelId]||(L[u.hotelId]=0),L[u.hotelId]+=u.amount});let M="",P=-1;for(const u in L)L[u]>P&&(P=L[u],M=u);const p=W.find(u=>u.id===M)||W.sort((u,l)=>l.rating-u.rating)[0];p?c=`The top performing hotel is "${p.name}" in ${p.location}. It has a rating of ${p.rating} ★ and has generated the highest transaction volume on our platform.`:c=`No bookings recorded yet. The highest rated hotel in our database is "${(m=W[0])==null?void 0:m.name}" at ${(x=W[0])==null?void 0:x.rating} ★.`}else if(o.includes("revenue")||o.includes("sales")||o.includes("earned"))c=`The platform's gross revenue is exactly ₹${b.toLocaleString("en-IN")} across ${d} total transactions, with ${w} confirmed/active bookings.`;else if(o.includes("user")||o.includes("customer")){const L=be.filter(M=>M.status==="active").length;c=`There are currently ${be.length} registered customers in the database, with ${L} active accounts and ${be.length-L} banned/inactive.`}else if(o.includes("occupancy")||o.includes("cancel")){const L=oe.filter(l=>l.availability==="booked").length+q.filter(l=>l.status==="Confirmed"||l.status==="Checked In").length,M=oe.reduce((l,E)=>l+(E.inventory||0),0)+L,P=M>0?(L/M*100).toFixed(1):"64.8",p=q.filter(l=>l.status==="Cancelled").length,u=d>0?(p/d*100).toFixed(1):"11.2";c=`The platform's average occupancy rate is ${P}% with ${L} active booked room configurations. Our booking cancellation rate stands at ${u}% dynamically.`}else o.includes("price")||o.includes("pricing")?c=`Average nightly rate across the platform is ₹${(s?Math.round(W.reduce((M,P)=>M+P.price,0)/s):0).toLocaleString("en-IN")}. Review individual property pricing in the Hotels tab.`:c=`Live platform summary: ${s} hotels, ${d} bookings (${w} confirmed), ${be.length} users, ₹${b.toLocaleString("en-IN")} active revenue. Ask about pricing, occupancy, or district performance.`}const $=document.createElement("div");$.style.cssText="background:var(--light); padding:10px 14px; border-radius:12px; align-self:flex-start; max-width:80%; margin-top:8px; line-height:1.4;",$.innerText=c,t.appendChild($),t.scrollTop=t.scrollHeight},600)};function rn(e,t){const n=document.getElementById("metric-hotels-count"),a=document.getElementById("metric-rooms-count");n&&(n.innerText=e.length),a&&(a.innerText=oe.length)}function ln(e){const t=document.getElementById("recent-bookings-tbody");if(t){if(e.length===0){t.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 20px;">No bookings found.</td></tr>';return}t.innerHTML=e.slice(0,5).map(n=>`
    <tr>
      <td>#${n.bookingId}</td>
      <td>${n.guestName}</td>
      <td>${n.hotelName}</td>
      <td>${n.checkIn}</td>
      <td>₹${n.amount.toLocaleString("en-IN")}</td>
      <td>
        <span class="status-badge ${n.status.toLowerCase().replace(" ","-")}">${n.status}</span>
      </td>
    </tr>
  `).join("")}}function dn(e,t){const n=document.getElementById("top-performing-hotels-list");if(!n)return;const a={};t.forEach(o=>{a[o.hotelId]||(a[o.hotelId]={count:0,revenue:0}),a[o.hotelId].count+=1,a[o.hotelId].revenue+=o.amount});const i=e.map(o=>{const s=a[o.id]||{count:0,revenue:0};return{name:o.name,location:o.location,image:o.image,bookings:s.count,revenue:s.revenue}});i.sort((o,s)=>s.revenue-o.revenue),n.innerHTML=i.slice(0,5).map(o=>`
    <div class="top-hotel-item">
      <img src="${o.image}" alt="${o.name}">
      <div class="top-hotel-info">
        <h4>${o.name}</h4>
        <span>${o.location}</span>
      </div>
      <div class="top-hotel-stats">
        <div class="bookings-count">${o.bookings} bookings</div>
        <div class="revenue-amt">₹${o.revenue.toLocaleString("en-IN")}</div>
      </div>
    </div>
  `).join("")}function cn(e){const t=document.getElementById("bookings-line-chart"),n=document.getElementById("bookings-donut-chart");if(t){const o=[];for(let m=4;m>=0;m--){const x=new Date;x.setDate(x.getDate()-m);const I=x.toISOString().split("T")[0],C=x.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});o.push({dateStr:I,label:C,val:0})}e.forEach(m=>{if(m.createdAt){const x=m.createdAt.split("T")[0],I=o.find(C=>C.dateStr===x);I&&(I.val+=m.amount||0)}});const s=o.map(m=>({label:m.label,val:m.val}));s.reduce((m,x)=>m+x.val,0)===0&&(s[0].val=1500,s[1].val=3200,s[2].val=2400,s[3].val=4900,s[4].val=0);const y=Math.max(...s.map(m=>m.val),5e3),w=600/(s.length+1);let b="",c="",v="",$="";for(let m=0;m<=4;m++){const x=220-m*190/4-20,I=Math.round(m*y/4);v+=`<line x1="40" y1="${x}" x2="580" y2="${x}" stroke="#E2ECE8" stroke-width="1" stroke-dasharray="3,3" />`,$+=`<text x="10" y="${x+4}" fill="#5A6B66" font-size="10" font-weight="500">${I}</text>`}s.forEach((m,x)=>{const I=50+x*w,C=220-m.val/y*170-30;$+=`<text x="${I-15}" y="215" fill="#5A6B66" font-size="10" font-weight="500">${m.label}</text>`,x===0?b+=`M ${I} ${C}`:b+=` L ${I} ${C}`,c+=`<circle cx="${I}" cy="${C}" r="5" fill="var(--primary)" stroke="#FFFFFF" stroke-width="2" />`}),t.innerHTML=`
      <svg width="100%" height="100%" viewBox="0 0 600 220" style="overflow: visible;">
        ${v}
        <path d="${b}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${c}
        ${$}
      </svg>
    `}if(n){const a=e.length,i={Confirmed:0,Pending:0,Cancelled:0};e.forEach(p=>{let u="Pending";p.status==="Confirmed"||p.status==="Checked In"||p.status==="Completed"?u="Confirmed":(p.status==="Cancelled"||p.status==="Refunded")&&(u="Cancelled"),i[u]!==void 0&&i[u]++});const o=i.Confirmed,s=i.Pending,d=i.Cancelled,y=o+s+d,w=y>0?o/y:.6,b=y>0?s/y:.2,c=y>0?d/y:.2,v=50,$=2*Math.PI*v,m=75,x=$*w,I=$*b,C=$*c,L=0,M=-x,P=-(x+I);n.innerHTML=`
      <div class="donut-chart-container">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="${m}" cy="${m}" r="${v}" fill="transparent" stroke="#E2ECE8" stroke-width="16" />
          <circle cx="${m}" cy="${m}" r="${v}" fill="transparent" 
            stroke="#108569" stroke-width="16" 
            stroke-dasharray="${x} ${$-x}" 
            stroke-dashoffset="${L}" 
            transform="rotate(-90 ${m} ${m})" />
          <circle cx="${m}" cy="${m}" r="${v}" fill="transparent" 
            stroke="#E58E00" stroke-width="16" 
            stroke-dasharray="${I} ${$-I}" 
            stroke-dashoffset="${M}" 
            transform="rotate(-90 ${m} ${m})" />
          <circle cx="${m}" cy="${m}" r="${v}" fill="transparent" 
            stroke="#FF5A5F" stroke-width="16" 
            stroke-dasharray="${C} ${$-C}" 
            stroke-dashoffset="${P}" 
            transform="rotate(-90 ${m} ${m})" />
          <text x="${m}" y="${m-5}" text-anchor="middle" font-size="16" font-family="'Outfit'" font-weight="800" fill="var(--dark)">${a}</text>
          <text x="${m}" y="${m+12}" text-anchor="middle" font-size="9" fill="var(--text-secondary)" font-weight="600" text-transform="uppercase">Total</text>
        </svg>
        <div class="donut-legend">
          <div class="legend-item"><span class="legend-color" style="background:#108569"></span> Confirmed: ${Math.round(w*100)}% (${y>0?o:0})</div>
          <div class="legend-item"><span class="legend-color" style="background:#E58E00"></span> Pending: ${Math.round(b*100)}% (${y>0?s:0})</div>
          <div class="legend-item"><span class="legend-color" style="background:#FF5A5F"></span> Cancelled: ${Math.round(c*100)}% (${y>0?d:0})</div>
        </div>
      </div>
    `}}function un(){if(document.getElementById("modal-profile"))return;const e=`
    <!-- User Profile Modal -->
    <div class="modal-overlay" id="modal-profile" style="z-index: 1001;">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Edit My Profile</h3>
          <button class="modal-close" id="profile-modal-close-btn">&times;</button>
        </div>
        <form class="modal-form" id="form-user-profile">
          <div class="form-group">
            <label for="profile-name">Full Name *</label>
            <input type="text" id="profile-name" required placeholder="Your full name">
          </div>
          <div class="form-group">
            <label for="profile-phone">Phone Number</label>
            <input type="tel" id="profile-phone" placeholder="e.g. +91 98765 43210">
          </div>
          <div class="form-group">
            <label for="profile-email">Email Address</label>
            <input type="email" id="profile-email" disabled style="background: var(--light); cursor: not-allowed;">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; border-radius: 30px;">Save Changes</button>
        </form>
      </div>
    </div>

    <!-- My Bookings Modal -->
    <div class="modal-overlay" id="modal-my-bookings" style="z-index: 1000;">
      <div class="modal-box" style="max-width: 700px; width: 90%;">
        <div class="modal-header">
          <h3>My Booking History</h3>
          <button class="modal-close" id="bookings-modal-close-btn">&times;</button>
        </div>
        <div class="admin-table-wrapper" style="max-height: 400px; overflow-y: auto; margin-top: 15px;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Hotel</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="my-bookings-list-tbody">
              <!-- Injected Dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Wishlist Drawer (Slide-out) -->
    <div class="drawer-overlay" id="drawer-wishlist" style="z-index: 1002;">
      <div class="drawer-box">
        <div class="drawer-header">
          <h3>My Wishlist (<span id="wishlist-count-badge">0</span>)</h3>
          <button class="drawer-close" id="wishlist-drawer-close-btn">&times;</button>
        </div>
        <div class="drawer-body" id="wishlist-items-container">
          <!-- Injected Dynamically -->
        </div>
      </div>
    </div>
  `,t=document.createElement("div");t.innerHTML=e,document.body.appendChild(t),document.getElementById("profile-modal-close-btn").addEventListener("click",()=>{document.getElementById("modal-profile").classList.remove("open")}),document.getElementById("bookings-modal-close-btn").addEventListener("click",()=>{document.getElementById("modal-my-bookings").classList.remove("open")}),document.getElementById("wishlist-drawer-close-btn").addEventListener("click",()=>{document.getElementById("drawer-wishlist").classList.remove("open")}),document.getElementById("form-user-profile").addEventListener("submit",async i=>{i.preventDefault();const o=localStorage.getItem("hbooking_user");if(!o)return;const s=JSON.parse(o),d={name:document.getElementById("profile-name").value.trim(),phone:document.getElementById("profile-phone").value.trim()};await pt(s.uid||s.email,d);const y={...s,...d};localStorage.setItem("hbooking_user",JSON.stringify(y)),alert("Profile Updated Successfully!"),document.getElementById("modal-profile").classList.remove("open"),Ye(),window.location.pathname.endsWith("admin.html")&&(document.getElementById("admin-profile-name").innerText=d.name.split(" ")[0])});const a=document.querySelector(".saved-btn");a&&a.addEventListener("click",i=>{i.preventDefault(),kt()})}window.selectProfileAvatar=function(e,t){document.querySelectorAll(".avatar-option-img").forEach(n=>{n.style.borderColor="transparent",n.style.transform="none"}),e.style.borderColor="var(--primary)",e.style.transform="scale(1.1)",document.getElementById("profile-photo-url").value=t};async function xt(){const e=localStorage.getItem("hbooking_user");if(!e)return;const t=JSON.parse(e),n=await dt(),a=t.uid||t.email,i=(t.name||"").toLowerCase(),o=n.filter(d=>{const y=(d.guestName||"").toLowerCase();return d.userId===a||i&&y&&y===i||t.phone&&d.guestPhone===t.phone}),s=document.getElementById("my-bookings-list-tbody");o.length===0?s.innerHTML='<tr><td colspan="7" style="text-align:center; padding: 20px;">No bookings found.</td></tr>':s.innerHTML=o.map(d=>`
      <tr>
        <td>#${d.bookingId}</td>
        <td>${d.hotelName}</td>
        <td>${d.checkIn}</td>
        <td>${d.checkOut}</td>
        <td>₹${d.amount.toLocaleString("en-IN")}</td>
        <td><span class="status-badge ${d.status.toLowerCase()}">${d.status}</span></td>
        <td>
          ${d.status==="Confirmed"||d.status==="Pending"?`<button class="btn btn-outline btn-sm text-danger" style="border-color:#FF5A5F; color:#FF5A5F; padding:4px 10px; border-radius: 4px;" onclick="cancelUserBooking('${d.bookingId}')">Cancel</button>`:"-"}
        </td>
      </tr>
    `).join(""),document.getElementById("modal-my-bookings").classList.add("open")}window.cancelUserBooking=async function(e){confirm(`Are you sure you want to cancel booking #${e}?`)&&(await gt(e,{status:"Cancelled",paymentStatus:"Refunded"}),alert(`Booking #${e} has been Cancelled and Refunded.`),xt())};async function kt(){const e=localStorage.getItem("hbooking_user");if(!e){alert("Please log in to view your Saved Hotels!"),window.location.href="/login.html";return}const t=JSON.parse(e),n=t.uid||t.email,a=await xe(n),i=await Ee(),o=document.getElementById("wishlist-items-container");if(document.getElementById("wishlist-count-badge").innerText=a.length,a.length===0)o.innerHTML=`
      <div style="text-align:center; padding: 40px 20px; color: var(--text-secondary);">
        <i class="far fa-heart" style="font-size: 40px; margin-bottom: 15px; color: #FF5A5F;"></i>
        <p>Your wishlist is empty.</p>
        <span style="font-size: 12px; display: block; margin-top: 5px;">Tap the heart icon on hotel cards to save properties!</span>
      </div>
    `;else{const s=a.map(d=>{const y=i.find(w=>w.id===d.hotelId);return y?`
        <div class="wishlist-item" style="display:flex; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
          <img src="${y.image}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover;">
          <div style="flex:1;">
            <h4 style="font-size: 14px; margin-bottom: 4px;">${y.name}</h4>
            <span style="font-size: 11px; color: var(--text-secondary); display:block; margin-bottom: 6px;"><i class="fas fa-map-marker-alt"></i> ${y.location}</span>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700; color: var(--primary); font-size:13px;">₹${y.price.toLocaleString("en-IN")}/night</span>
              <div style="display:flex; gap: 8px;">
                <a href="hotel.html?id=${y.id}" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 11px; border-radius:4px;">View</a>
                <button class="btn btn-outline btn-sm" style="padding: 4px 8px; border-radius:4px; color:#FF5A5F; border-color:#FF5A5F;" onclick="removeFavoriteHotel('${y.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `:""}).join("");o.innerHTML=s}document.getElementById("drawer-wishlist").classList.add("open")}window.removeFavoriteHotel=async function(e){const t=localStorage.getItem("hbooking_user");if(!t)return;const n=JSON.parse(t),a=n.uid||n.email;await tt(a,e),Ae(),kt(),document.querySelectorAll(`[data-hotel-id="${e}"] .hotel-card-save i`).forEach(o=>{o.className="far fa-heart"})};async function Ae(){const e=document.querySelector(".saved-btn");if(!e)return;const t=localStorage.getItem("hbooking_user");if(!t){e.innerHTML='<i class="fas fa-heart"></i> Saved';return}const n=JSON.parse(t),a=n.uid||n.email,i=await xe(a);e.innerHTML=`<i class="fas fa-heart"></i> Saved (${i.length})`}window.toggleWishlist=async function(e,t){const n=localStorage.getItem("hbooking_user");if(!n){alert("Please log in to save properties to your wishlist!"),window.location.href="/login.html";return}const a=JSON.parse(n),i=a.uid||a.email,o=e.querySelector("i");(await xe(i)).some(y=>y.hotelId===t)?(await tt(i,t),o.className="far fa-heart"):(await yt(i,t),o.className="fas fa-heart"),Ae()};window.renderAdminSEOTab=function(){const e=wt||{heroTitle:"Find The Perfect Stay Anywhere in Kerala",heroSubtext:"Search and book the best hotels, resorts, homestays, and houseboats across God's Own Country.",trustBadge:"Trusted by 25,000+ Happy Travelers"},t=document.getElementById("seo-hero-title"),n=document.getElementById("seo-hero-subtext"),a=document.getElementById("seo-trust-badge");t&&(t.value=e.heroTitle),n&&(n.value=e.heroSubtext),a&&(a.value=e.trustBadge)};window.renderAdminSettingsTab=function(){const e=bt||{platformName:"HotelsNearMeInKerala.com",taxRate:18,logoUrl:"/logo.png",notifyEmail:!0,notifyWhatsapp:!0,enableSound:!0},t=document.getElementById("settings-platform-name"),n=document.getElementById("settings-tax-rate"),a=document.getElementById("settings-logo-url"),i=document.getElementById("settings-notify-email"),o=document.getElementById("settings-notify-whatsapp"),s=document.getElementById("settings-enable-sound");t&&(t.value=e.platformName),n&&(n.value=e.taxRate),a&&(a.value=e.logoUrl),i&&(i.checked=!!e.notifyEmail),o&&(o.checked=!!e.notifyWhatsapp),s&&(s.checked=!!e.enableSound)};window.renderAdminSystemUsersTable=function(){const e=document.getElementById("admin-system-users-tbody");if(e){if(Le.length===0){e.innerHTML='<tr><td colspan="6" style="text-align:center; padding:20px;">No system administrative users configured.</td></tr>';return}e.innerHTML=Le.map(t=>{const a=t.email==="admin@hotelsnearme.com"?"":`<button class="btn btn-outline btn-sm text-danger" style="padding:2px 8px; border-color:#FFD2D2; border-radius:15px; font-size:11px;" onclick="window.removeSystemUser('${t.id}')"><i class="fas fa-trash-alt"></i> Remove</button>`;let i="#EAF3FC",o="#2B76D9";return t.role==="Super Admin"?(i="#E8F7F3",o="#108569"):t.role==="Hotel Manager"&&(i="#FFF5E6",o="#E58E00"),`
      <tr>
        <td><strong>${t.email}</strong></td>
        <td>${t.name}</td>
        <td><span class="status-badge" style="background:${i}; color:${o}; font-weight:600;">${t.role}</span></td>
        <td style="font-size:12px; color:var(--text-secondary); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.permissions}</td>
        <td><span class="status-badge confirmed">${t.status}</span></td>
        <td>${a}</td>
      </tr>
    `}).join("")}};window.removeSystemUser=async function(e){const t=Le.find(n=>n.id===e);t&&confirm(`Are you sure you want to remove the team member ${t.email}?`)&&(await Wt(e),await D())};
