import{W as a}from"./wedding-db.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const c of s)if(c.type==="childList")for(const r of c.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const c={};return s.integrity&&(c.integrity=s.integrity),s.referrerPolicy&&(c.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?c.credentials="include":s.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function o(s){if(s.ep)return;s.ep=!0;const c=n(s);fetch(s.href,c)}})();const G=document.getElementById("pinOverlay"),v=document.getElementById("pinInput"),re=document.getElementById("pinSubmitBtn"),ve=document.getElementById("lockDashboardBtn");function he(){a.loadConfig(),sessionStorage.getItem("wedding_admin_auth")==="true"?G.classList.remove("is-open"):(G.classList.add("is-open"),v.value="",setTimeout(()=>v.focus(),150))}re.addEventListener("click",()=>{const e=(a.loadConfig().adminPin||"2511").trim();v.value.trim()===e?(sessionStorage.setItem("wedding_admin_auth","true"),G.classList.remove("is-open"),d("🔓 Đã mở khóa bảng quản trị thành công!")):(alert("Mã PIN không đúng. Vui lòng nhập lại (Mặc định: 2511)!"),v.value="",v.focus())});v.addEventListener("keydown",t=>{t.key==="Enter"&&re.click()});ve.addEventListener("click",()=>{sessionStorage.removeItem("wedding_admin_auth"),he(),d("🔒 Đã khóa bảng điều khiển")});he();const O=document.querySelectorAll(".tab-btn"),Ce=document.querySelectorAll(".tab-pane");O.forEach(t=>{t.addEventListener("click",()=>{O.forEach(o=>o.classList.remove("is-active")),Ce.forEach(o=>o.classList.remove("is-active")),t.classList.add("is-active");const e=t.getAttribute("data-tab"),n=document.getElementById(e);n&&n.classList.add("is-active")})});const A=document.getElementById("toastMsg"),F=document.getElementById("toastText");let U=null;function d(t){!A||!F||(F.textContent=t,A.classList.add("show"),clearTimeout(U),U=setTimeout(()=>A.classList.remove("show"),2800))}const N=document.getElementById("btnViewCards"),M=document.getElementById("btnViewTable"),f=document.getElementById("guestsCardView"),K=document.getElementById("guestsTableView");let ue=window.innerWidth>=1024?"table":"cards";function W(t){ue=t,t==="cards"?(N.classList.add("is-active"),M.classList.remove("is-active"),f.style.display="grid",K.style.display="none"):(M.classList.add("is-active"),N.classList.remove("is-active"),K.style.display="block",f.style.display="none")}W(ue);N.addEventListener("click",()=>W("cards"));M.addEventListener("click",()=>W("table"));let u=[],B=[],b="all",p="all";const k=document.getElementById("guestSearchInput"),L=document.getElementById("searchClearBtn"),I=document.getElementById("noGuestsMsg"),R=document.getElementById("kpiTotalGuests"),z=document.getElementById("kpiTotalSeats"),j=document.getElementById("kpiCheckedInCount"),Y=document.getElementById("kpiCheckInPercent"),X=document.getElementById("kpiGroomSide"),Z=document.getElementById("kpiBrideSide"),J=document.getElementById("kpiBanquet"),Q=document.getElementById("kpiWishesCount"),ee=document.getElementById("kpiDeclinedSub"),te=document.getElementById("tabGuestCountBadge"),ne=document.getElementById("tabWishCountBadge"),ie=document.getElementById("chipCountAll"),se=document.getElementById("chipCountGroom"),oe=document.getElementById("chipCountBride"),ce=document.getElementById("chipCountBanquet"),ae=document.getElementById("chipCountChecked"),de=document.getElementById("chipCountNotYet"),le=document.getElementById("chipCountDeclined");function ge(){const t=u.filter(i=>i.attendance==="yes"),e=u.filter(i=>i.attendance==="no"),n=u.filter(i=>i.checkedIn),o=t.reduce((i,l)=>i+(parseInt(l.guestCount,10)||1),0),s=t.filter(i=>i.side==="groom"||i.eventChoice==="thanhhon").reduce((i,l)=>i+(parseInt(l.guestCount,10)||1),0),c=t.filter(i=>i.side==="bride"||i.eventChoice==="vuquy").reduce((i,l)=>i+(parseInt(l.guestCount,10)||1),0),r=t.filter(i=>i.eventChoice==="tiecruou"||i.eventChoice==="all").reduce((i,l)=>i+(parseInt(l.guestCount,10)||1),0),C=t.length>0?Math.round(n.length/t.length*100):0;R&&(R.textContent=t.length),z&&(z.textContent=`${o} người (gồm bạn & người đi kèm)`),j&&(j.textContent=n.length),Y&&(Y.textContent=`${C}% trên tổng số khách tham dự`),X&&(X.textContent=s),Z&&(Z.textContent=c),J&&(J.textContent=r),Q&&(Q.textContent=B.length),ee&&(ee.textContent=`${e.length} khách báo vắng lỡ hẹn`),te&&(te.textContent=u.length),ne&&(ne.textContent=B.length),ie&&(ie.textContent=u.length),se&&(se.textContent=u.filter(i=>i.side==="groom"||i.eventChoice==="thanhhon").length),oe&&(oe.textContent=u.filter(i=>i.side==="bride"||i.eventChoice==="vuquy").length),ce&&(ce.textContent=u.filter(i=>i.eventChoice==="tiecruou"||i.eventChoice==="all").length),ae&&(ae.textContent=n.length),de&&(de.textContent=t.filter(i=>!i.checkedIn).length),le&&(le.textContent=e.length)}function be(){const t=(k?.value||"").trim().toLowerCase();return u.filter(e=>{if(t){const n=(e.name||"").toLowerCase().includes(t),o=(e.phone||"").toLowerCase().includes(t),s=(e.wish||"").toLowerCase().includes(t);if(!n&&!o&&!s)return!1}if(b==="side"){if(p==="groom")return e.side==="groom"||e.eventChoice==="thanhhon";if(p==="bride")return e.side==="bride"||e.eventChoice==="vuquy"}if(b==="event"&&p==="tiecruou")return e.eventChoice==="tiecruou"||e.eventChoice==="all";if(b==="checkin"){if(p==="checked")return e.checkedIn;if(p==="not_yet")return!e.checkedIn&&e.attendance==="yes"}return b==="attendance"&&p==="no"?e.attendance==="no":!0})}function $(){const t=be();if(t.length===0){f&&(f.innerHTML=""),guestsTableBody&&(guestsTableBody.innerHTML=""),I&&(I.style.display="block");return}I&&(I.style.display="none"),f&&(f.innerHTML=t.map(e=>{const n=e.attendance==="yes",o=parseInt(e.guestCount,10)||1,s=(e.name||"K").trim().split(" ").pop().slice(0,2).toUpperCase(),c=e.side==="groom"?'<span class="badge-chip badge-groom">Nhà Trai</span>':e.side==="bride"?'<span class="badge-chip badge-bride">Nhà Gái</span>':'<span class="badge-chip badge-both">Khách Chung</span>',r=n?`<span class="badge-chip badge-yes">✓ Đi (${o>1?`+${o-1}`:"1 mình"})</span>`:'<span class="badge-chip badge-no">✕ Báo vắng</span>',C=e.checkedIn?"is-checked":"",i=e.checkedIn?`✓ ĐÃ ĐẾN TIỆC ${e.checkedInAt?`(${h(e.checkedInAt)})`:""}`:"○ ĐIỂM DANH: CHƯA ĐẾN",l=(e.phone||"").replace(/\D/g,""),ye=l.length>=9;return`
            <article class="guest-card ${e.checkedIn?"checked-in":""} ${n?"":"declined"}" data-id="${e.id}">
              <div class="guest-card-header">
                <div class="guest-avatar">${s}</div>
                <div class="guest-title-wrap">
                  <div class="guest-card-name">${h(e.name)}</div>
                  <div class="guest-badges-row">
                    ${r}
                    ${c}
                    <span class="badge-chip badge-event">${a.formatEventChoice(e.eventChoice)}</span>
                  </div>
                </div>
              </div>

              <!-- NÚT ĐIỂM DANH HERO BUTTON -->
              <div>
                <button type="button" class="checkin-hero-btn ${C}" data-action="toggle-checkin" data-id="${e.id}">
                  ${i}
                </button>
              </div>

              <!-- LIÊN HỆ GỌI ĐIỆN & ZALO -->
              ${ye?`
                <div class="contact-actions-row">
                  <a href="tel:${l}" class="btn-contact" title="Gọi điện cho khách">
                    📞 Gọi ${l}
                  </a>
                  <a href="https://zalo.me/${l}" target="_blank" rel="noopener noreferrer" class="btn-contact zalo" title="Mở chat Zalo">
                    💬 Zalo
                  </a>
                </div>
              `:`
                <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--ink-light); text-align: center;">
                  (Chưa để lại số điện thoại)
                </div>
              `}

              <!-- LỜI NHẮN HOẶC LỜI CHÚC KÈM -->
              ${e.wish?`
                <div class="guest-note-box">
                  💬 “${h(e.wish)}”
                </div>
              `:""}

              <!-- CARD FOOTER -->
              <div class="guest-card-footer">
                <span>🕒 ${h(e.createdAt||"Mới đây")}</span>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn-action-icon" data-action="delete-rsvp" data-id="${e.id}" title="Xóa khách này">
                    🗑️
                  </button>
                </div>
              </div>
            </article>
          `}).join("")),guestsTableBody&&(guestsTableBody.innerHTML=t.map(e=>{const n=e.side==="groom"?'<span class="badge-chip badge-groom">Nhà Trai</span>':e.side==="bride"?'<span class="badge-chip badge-bride">Nhà Gái</span>':'<span class="badge-chip badge-both">Khách Chung</span>',o=e.attendance==="yes"?`<span class="badge-chip badge-yes">Đi (${e.guestCount||1} người)</span>`:'<span class="badge-chip badge-no">Báo vắng</span>',s=(e.phone||"").replace(/\D/g,""),c=s.length>=9?`<a href="tel:${s}" style="color:var(--vermilion); text-decoration:none; font-family:var(--font-mono); font-weight:700;">${s}</a>
               <a href="https://zalo.me/${s}" target="_blank" rel="noopener noreferrer" style="margin-left:4px; font-size:0.75rem; text-decoration:none;">💬</a>`:'<span style="color:var(--ink-light);">-</span>',r=e.checkedIn?"is-checked":"",C=e.checkedIn?"✓ ĐÃ ĐẾN":"Chưa đến";return`
            <tr data-id="${e.id}" class="${e.checkedIn?"is-checked-row":""}">
              <td>
                <button type="button" class="checkin-hero-btn ${r}" style="height:34px; font-size:0.75rem;" data-action="toggle-checkin" data-id="${e.id}">
                  ${C}
                </button>
              </td>
              <td>
                <strong style="font-family:var(--font-ui); font-size:1.02rem; color:var(--ink-dark);">${h(e.name)}</strong>
                <div style="margin-top:2px;">${o}</div>
              </td>
              <td>${c}</td>
              <td>${n}</td>
              <td><small style="font-family:var(--font-mono); font-size:0.75rem;">${a.formatEventChoice(e.eventChoice)}</small></td>
              <td style="font-weight:700; text-align:center; font-family:var(--font-mono);">${e.guestCount||1}</td>
              <td><small style="color:var(--ink-light); font-family:var(--font-mono); font-size:0.72rem;">${h(e.createdAt||"Mới đây")}</small></td>
              <td style="max-width:240px; font-style:italic; font-size:0.88rem; color:var(--ink-muted);">
                ${h(e.wish||"")}
              </td>
              <td style="text-align: center;">
                <button type="button" class="btn-action-icon" data-action="delete-rsvp" data-id="${e.id}" title="Xóa khách này">
                  🗑️
                </button>
              </td>
            </tr>
          `}).join(""))}function me(t){const e=t.target.closest("[data-action]");if(!e)return;const n=e.getAttribute("data-action"),o=e.getAttribute("data-id");n==="toggle-checkin"?(a.toggleCheckIn(o),d("✓ Đã cập nhật trạng thái điểm danh!")):n==="delete-rsvp"&&confirm("Bạn có chắc chắn muốn xóa khách mời này khỏi danh sách?")&&(a.deleteRsvp(o),d("🗑️ Đã xóa thông tin khách!"))}f?.addEventListener("click",me);guestsTableBody?.addEventListener("click",me);k?.addEventListener("input",()=>{L&&(L.style.display=k.value.length>0?"inline-flex":"none"),$()});L?.addEventListener("click",()=>{k.value="",L.style.display="none",k.focus(),$()});const Be=document.getElementById("filterChipsBar");Be?.addEventListener("click",t=>{const e=t.target.closest(".chip-btn");e&&(document.querySelectorAll(".chip-btn").forEach(n=>n.classList.remove("is-active")),e.classList.add("is-active"),b=e.getAttribute("data-filter-type")||"all",p=e.getAttribute("data-filter-val")||"all",$())});const w=document.getElementById("wishesAdminContainer");function ke(){if(w){if(B.length===0){w.innerHTML=`
          <div class="empty-state" style="grid-column: 1/-1;">
            <div class="empty-state-icon">💌</div>
            <p style="font-weight: 600;">Chưa có lời chúc nào trong sổ lưu bút</p>
          </div>
        `;return}w.innerHTML=B.map(t=>`
        <article class="wish-admin-card ${t.pinned?"is-pinned":""}" data-id="${t.id}">
          <div class="wish-top-line">
            <div class="wish-sender-title">
              ${h(t.name)}
              ${t.pinned?'<span title="Đang ghim lên đầu" style="color:var(--gold-accent);">📌</span>':""}
            </div>
            <div class="wish-time-tag">${h(t.time||"Vừa xong")}</div>
          </div>
          
          <div class="wish-content-text">“${h(t.wish)}”</div>
          
          <div class="wish-card-footer">
            <span style="font-family:var(--font-mono); color:var(--ink-light); font-size:0.75rem;">
              ${t.phone?`SĐT: ${h(t.phone)}`:"Lời chúc thiệp cưới"}
            </span>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-nav" data-action="pin-wish" data-id="${t.id}" title="${t.pinned?"Bỏ ghim":"Ghim lên đầu"}">
                ${t.pinned?"📌 Bỏ ghim":"Ghim"}
              </button>
              <button type="button" class="btn-action-icon" data-action="delete-wish" data-id="${t.id}" title="Xóa lời chúc">
                🗑️
              </button>
            </div>
          </div>
        </article>
      `).join("")}}w?.addEventListener("click",t=>{const e=t.target.closest("[data-action]");if(!e)return;const n=e.getAttribute("data-action"),o=e.getAttribute("data-id");n==="pin-wish"?(a.togglePinWish(o),d("📌 Đã cập nhật trạng thái ghim lời chúc!")):n==="delete-wish"&&confirm("Bạn có chắc chắn muốn xóa lời chúc này?")&&(a.deleteWish(o),d("🗑️ Đã xóa lời chúc!"))});a.onRsvpsChange(t=>{u=t,ge(),$()});a.onWishesChange(t=>{B=t,ge(),ke()});const Ie=document.getElementById("syncNowBtn"),y=document.getElementById("syncStatusDot"),g=document.getElementById("connStatusText"),E=document.getElementById("syncSpinner");async function Ee(){E&&(E.style.display="inline-block"),g&&(g.textContent="Đang đồng bộ..."),y&&(y.style.background="#F39C12");try{const t=await a.syncFromGoogleSheet();if(t&&t.success){const n=new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});g&&(g.textContent=`Đồng bộ: ${n}`),y&&(y.style.background="#27AE60"),d(`✓ Đã đồng bộ thành công! (${t.rsvpsCount||0} khách, ${t.wishesCount||0} lời chúc)`)}else g&&(g.textContent="Đã lưu cục bộ"),y&&(y.style.background="#27AE60"),d("✓ Dữ liệu đã sẵn sàng!")}catch{g&&(g.textContent="Đã lưu cục bộ")}finally{E&&(E.style.display="none")}}Ie?.addEventListener("click",Ee);const H=document.getElementById("addGuestModal"),we=document.getElementById("openAddGuestModalBtn"),Le=document.getElementById("closeAddGuestModalBtn"),xe=document.getElementById("cancelAddGuestBtn"),pe=document.getElementById("addGuestForm"),Te=document.getElementById("stepperMinus"),$e=document.getElementById("stepperPlus"),x=document.getElementById("stepperDisplay");let m=1;function Ae(){m=1,x&&(x.textContent="1"),pe?.reset(),H?.classList.add("is-open"),setTimeout(()=>document.getElementById("newGuestName")?.focus(),150)}function q(){H?.classList.remove("is-open")}we?.addEventListener("click",Ae);Le?.addEventListener("click",q);xe?.addEventListener("click",q);Te?.addEventListener("click",()=>{m>1&&(m--,x.textContent=m)});$e?.addEventListener("click",()=>{m<20&&(m++,x.textContent=m)});pe?.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("newGuestName")?.value.trim();if(!e)return;const n=document.getElementById("newGuestPhone")?.value.trim(),o=document.querySelector('input[name="newGuestSide"]:checked'),s=o?o.value:"groom",c=document.getElementById("newGuestEvent")?.value||"tiecruou",r=document.getElementById("newGuestWish")?.value.trim();await a.submitRsvp({name:e,phone:n,side:s,attendance:"yes",guestCount:m,eventChoice:c,wish:r||"Đăng ký trực tiếp tại bàn đón tiếp"}),q(),d(`✓ Đã thêm khách ${e} thành công!`)});const V=document.getElementById("addWishModal"),Se=document.getElementById("openAddWishModalBtn"),Ge=document.getElementById("closeAddWishModalBtn"),Ne=document.getElementById("cancelAddWishBtn"),fe=document.getElementById("addWishForm");function Me(){fe?.reset(),V?.classList.add("is-open"),setTimeout(()=>document.getElementById("wishSenderName")?.focus(),150)}function _(){V?.classList.remove("is-open")}Se?.addEventListener("click",Me);Ge?.addEventListener("click",_);Ne?.addEventListener("click",_);fe?.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("wishSenderName")?.value.trim(),n=document.getElementById("wishSenderPhone")?.value.trim(),o=document.getElementById("wishContent")?.value.trim();!e||!o||(await a.addWish({name:e,phone:n,wish:o}),_(),d("💌 Đã gửi lời chúc mới vào sổ lưu bút thành công!"))});[H,V].forEach(t=>{t?.addEventListener("click",e=>{e.target===t&&t.classList.remove("is-open")})});document.getElementById("exportCsvBtn")?.addEventListener("click",()=>{a.exportRsvpsToCsv()});const D=document.getElementById("cfgFirebaseUrl"),T=document.getElementById("cfgSheetUrl"),P=document.getElementById("cfgAdminPin"),De=document.getElementById("saveSettingsBtn"),Pe=document.getElementById("seedDemoDataBtn"),We=document.getElementById("clearDataBtn"),S=document.getElementById("testSheetConnBtn"),He=document.getElementById("copyAppsScriptBtn");function qe(){const t=a.loadConfig();D&&(D.value=t.firebaseUrl||""),T&&(T.value=t.sheetUrl||"https://script.google.com/macros/s/AKfycby7AiQwSnKqV4-F-vf0Y3qP--mbv67iGsMwnleex4CJPaMViwgk5aajYejxTg7cP6Os/exec"),P&&(P.value=t.adminPin||"2511")}qe();De?.addEventListener("click",()=>{const t={firebaseUrl:D.value.trim(),sheetUrl:T.value.trim(),adminPin:P.value.trim()||"2511"};a.saveConfig(t),d("💾 Đã lưu cấu hình đồng bộ thành công!")});S?.addEventListener("click",async()=>{const t=T.value.trim();if(!t){alert("Vui lòng nhập Google Apps Script Web App URL trước khi kiểm tra!");return}S.textContent="⏳ Đang kiểm tra kết nối...";try{const n=await(await fetch(t,{cache:"no-store"})).json();n&&n.status==="success"?alert(`✓ KẾT NỐI THÀNH CÔNG!
- Đọc được: ${n.rsvps?n.rsvps.length:0} khách mời
- Đọc được: ${n.wishes?n.wishes.length:0} lời chúc
Hệ thống đồng bộ đang hoạt động hoàn hảo!`):alert(`⚠️ Đã kết nối nhưng Google Apps Script chưa trả về cấu trúc chuẩn.
Kiểm tra lại xem bạn đã dán hàm doGet() và Tạo Phiên Bản Mới (New Version) chưa!`)}catch(e){alert(`❌ Không thể kết nối đến Google Apps Script:
${e.message}

Nguyên nhân thường gặp:
1. Chưa chọn "Người có quyền truy cập: Bất kỳ ai" (Anyone)
2. Chưa bấm "Tạo phiên bản mới (New version)" khi Triển khai lại`)}finally{S.textContent="⚡ Kiểm Tra Kết Nối Google Sheets Ngay"}});He?.addEventListener("click",()=>{const t=document.getElementById("appsScriptCodeText")?.innerText;t&&navigator.clipboard.writeText(t).then(()=>{d("📋 Đã sao chép mã Google Apps Script vào bộ nhớ tạm!")}).catch(()=>{prompt("Nhấn Ctrl+C để sao chép mã:",t)})});Pe?.addEventListener("click",async()=>{if(!confirm("Nạp thêm 5 khách mẫu kiểm thử?"))return;const t=[{name:"Nguyễn Văn Hùng",phone:"0982123456",side:"groom",attendance:"yes",guestCount:2,eventChoice:"thanhhon",wish:"Chúc chú rể Văn Tiến hạnh phúc viên mãn!"},{name:"Trần Thị Thu Hà",phone:"0915987654",side:"bride",attendance:"yes",guestCount:1,eventChoice:"vuquy",wish:"Bảo Châu xinh đẹp nhất hôm nay! Mãi hạnh phúc nhé!"},{name:"Lê Hoàng Nam",phone:"0978333222",side:"groom",attendance:"yes",guestCount:2,eventChoice:"tiecruou",wish:"Anh em hẹn nhau tại thôn Dùng 2 nhé!"},{name:"Đặng Mai Phương",phone:"0904555888",side:"both",attendance:"no",guestCount:0,eventChoice:"all",wish:"Tiếc quá đợt này mình đi công tác, gửi quà mừng và chúc hai bạn trăm năm hạnh phúc!"},{name:"Vợ chồng bác Tuấn",phone:"0943111000",side:"both",attendance:"yes",guestCount:2,eventChoice:"all",wish:"Chúc hai cháu trăm năm đầu bạc răng long."}];for(const e of t)await a.submitRsvp(e);d("🎲 Đã nạp dữ liệu khách mẫu thành công!")});We?.addEventListener("click",()=>{confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ DỮ LIỆU ĐÃ LƯU TRÊN TRÌNH DUYỆT NÀY?")&&(localStorage.setItem("wedding_rsvps_tien_chau_v2","[]"),localStorage.setItem("wedding_guestbook_tien_chau_v2","[]"),location.reload())});function h(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"):""}
