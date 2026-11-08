/**
 * WEDDING LIVE SYNC ENGINE
 * Đồng bộ hai chiều theo thời gian thực (Zero-latency Realtime Sync)
 * giữa trang Nhập Liệu (nhap-lieu.html) và Thiệp Cưới Chính (index.html).
 * 
 * Cơ chế:
 * 1. BroadcastChannel ('wedding_live_sync') cho tab song song (cực nhạy, <10ms).
 * 2. LocalStorage Event ('storage') cho các trình duyệt hoặc tab mở lại.
 * 3. Hỗ trợ VietQR thật động tạo từ STK ngân hàng.
 */

(function () {
  if (typeof window === 'undefined') return;
  if (window.__WEDDING_SYNC_INITIALIZED__) return;
  window.__WEDDING_SYNC_INITIALIZED__ = true;

  const STORAGE_KEY = 'wedding_custom_data';
  const CHANNEL_NAME = 'wedding_live_sync';

  // Khởi tạo BroadcastChannel nếu trình duyệt hỗ trợ
  let syncChannel = null;
  try {
    if ('BroadcastChannel' in window) {
      syncChannel = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch (err) {
    console.warn('[LiveSync] BroadcastChannel not supported:', err);
  }

  /**
   * Lấy dữ liệu tổng hợp từ URL params hoặc LocalStorage
   */
  function getStoredData() {
    let data = {};

    // 1. Ưu tiên đọc dữ liệu truyền qua link chia sẻ URL (?d=... hoặc ?data=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get('d') || urlParams.get('data');
      if (encoded) {
        const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
          data = parsed;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          Object.entries(data).forEach(([k, v]) => {
            if (v) localStorage.setItem('wedding_form_' + k, v);
          });
          return data;
        }
      }
    } catch (e) {
      console.warn('[LiveSync] Failed to parse URL param data:', e);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw);
    } catch {}

    // Fallback: gom từ các key lẻ wedding_form_*
    const fields = [
      'groomFullName', 'groomShortName', 'groomOrder',
      'brideFullName', 'brideShortName', 'brideOrder',
      'groomFather', 'groomMother', 'groomAddress',
      'brideFather', 'brideMother', 'brideAddress',
      'vuQuyTime', 'vuQuyDate', 'vuQuyLunar', 'vuQuyAddress', 'vuQuyMap',
      'thanhHonTime', 'thanhHonDate', 'thanhHonAddress', 'thanhHonMap',
      'tiecDonKhach', 'tiecKhaiTiec', 'tiecVenue', 'tiecHall', 'tiecAddress', 'tiecMap',
      'letterContent',
      'm1Year', 'm1Title', 'm1Story',
      'm2Year', 'm2Title', 'm2Story',
      'm3Year', 'm3Title', 'm3Story',
      'm4Year', 'm4Title', 'm4Story',
      'm5Year', 'm5Title', 'm5Story',
      'groomBank', 'groomAccNumber', 'groomAccName',
      'brideBank', 'brideAccNumber', 'brideAccName',
      'driveLink', 'musicChoice', 'rsvpDeadline'
    ];

    
    // Dữ liệu gốc chuẩn theo thiệp mời
    const CARD_DEFAULTS = {
      groomFullName: 'Nguyễn Văn Tiến',
      groomShortName: 'Văn Tiến',
      groomOrder: 'Thứ nam',
      brideFullName: 'Phạm Thị Bảo Châu',
      brideShortName: 'Bảo Châu',
      brideOrder: 'Trưởng nữ',
      groomFather: 'Ông Nguyễn Văn Minh',
      groomMother: 'Bà Điền Thị Bình',
      groomAddress: 'Thôn Đồng Văn 1, Xã Đại Đồng, Tỉnh Nghệ An',
      brideFather: 'Ông Phạm Văn Ba',
      brideMother: 'Bà Nguyễn Thị Chung',
      brideAddress: 'Thôn Dùng 1, Xã Đại Đồng, Tỉnh Nghệ An',
      vuQuyTime: '11:30 Trưa',
      vuQuyDate: 'Thứ Ba, 24.11.2026',
      vuQuyLunar: '16 tháng 10 năm Bính Ngọ',
      vuQuyAddress: 'Tư gia Nhà Gái — Thôn Dùng 1, Xã Đại Đồng, Tỉnh Nghệ An',
      vuQuyMap: 'https://maps.google.com/?q=Dai+Dong+Thanh+Chuong+Nghe+An',
      thanhHonTime: '10:30 Trưa',
      thanhHonDate: 'Thứ Tư, 25.11.2026',
      thanhHonAddress: 'Tư gia Nhà Trai — Thôn Dùng 2, Xã Đại Đồng, Tỉnh Nghệ An',
      thanhHonMap: 'https://maps.google.com/?q=Dai+Dong+Thanh+Chuong+Nghe+An',
      tiecDonKhach: '11:00',
      tiecKhaiTiec: '11:30',
      tiecVenue: 'Tư Gia Hai Họ',
      tiecHall: 'Hôn Trường Gia Đình',
      tiecAddress: 'Xã Đại Đồng, Huyện Thanh Chương, Tỉnh Nghệ An',
      tiecMap: 'https://maps.google.com/?q=Dai+Dong+Thanh+Chuong+Nghe+An',
      groomBank: 'Vietcombank',
      groomAccNumber: '1018899999',
      groomAccName: 'NGUYEN VAN TIEN',
      brideBank: 'MB Bank',
      brideAccNumber: '0905181227',
      brideAccName: 'PHAM THI BAO CHAU',
      musicChoice: 'Gói Con Tim Làm Quà - Nguyễn Hùng',
      rsvpDeadline: 'Trước ngày 20.11.2026'
    };

    // Kiểm tra và dọn dẹp các giá trị demo cũ còn đọng trong localStorage
    const savedVuQuy = localStorage.getItem('wedding_form_vuQuyDate');
    const savedBride = localStorage.getItem('wedding_form_brideFullName');
    if (savedVuQuy && savedVuQuy.includes('18.12.2027') || (savedBride && savedBride.includes('Lê Thị Bảo Châu'))) {
      localStorage.clear();
      data = {};
    }

    fields.forEach((k) => {
      if (!data[k]) {
        const val = localStorage.getItem('wedding_form_' + k);
        if (val) data[k] = val;
        else if (CARD_DEFAULTS[k]) data[k] = CARD_DEFAULTS[k];
      }
    });

    return data;
  }

  /**
   * Hiển thị thông báo nhỏ khi có dữ liệu đồng bộ
   */
  function showSyncBadge(text) {
    let badge = document.getElementById('syncLiveBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'syncLiveBadge';
      badge.style.cssText = `
        position: fixed;
        bottom: 74px;
        left: 50%;
        transform: translateX(-50%) translateY(30px);
        background: rgba(38, 24, 18, 0.92);
        color: #FDF9EE;
        border: 1px solid rgba(200, 157, 102, 0.5);
        padding: 6px 14px;
        border-radius: 999px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        z-index: 99999;
        pointer-events: none;
        opacity: 0;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        gap: 6px;
      `;
      document.body.appendChild(badge);
    }
    badge.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#4ADE80;box-shadow:0 0 6px #4ADE80;"></span> ${text || 'Đã đồng bộ trực tiếp'}`;
    badge.style.opacity = '1';
    badge.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(badge._timer);
    badge._timer = setTimeout(() => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2200);
  }

  /**
   * Cập nhật toàn bộ DOM của trang thiệp cưới (index.html)
   */
  function applyDataToDOM(d, isLive = false) {
    if (!d || Object.keys(d).length === 0) return;

    const gShort = (d.groomShortName || '').trim();
    const bShort = (d.brideShortName || '').trim();
    const gFull = (d.groomFullName || '').trim();
    const bFull = (d.brideFullName || '').trim();
    const gOrder = (d.groomOrder || '').trim();
    const bOrder = (d.brideOrder || '').trim();

    // 1. Tiêu đề trang & Meta
    if (gShort && bShort) {
      document.title = `${gShort} & ${bShort} — Thước Phim Ngày Chung Đôi · 24.11 - 25.11.2026`;
    }

    // 2. Tên chú rể thân mật
    if (gShort) {
      document.querySelectorAll('.env-name.groom, .title-word.groom-word').forEach((el) => {
        el.textContent = gShort;
      });
      const tabGroom = document.getElementById('tabGroomBtn');
      if (tabGroom) tabGroom.textContent = 'MỪNG CHÚ RỂ';
      const badgeGroom = document.querySelector('#panelGroom .silk-badge-text');
      if (badgeGroom) badgeGroom.textContent = 'MỪNG CƯỚI CHÚ RỂ';

      // Cập nhật tên chú rể trên màn Cinematic Intro mới
      const introGroom = document.querySelector('.intro-groom');
      if (introGroom) {
        introGroom.setAttribute('data-raw', gShort);
        if (typeof window.__splitChars === 'function') {
          window.__splitChars(introGroom);
        } else {
          introGroom.textContent = gShort;
        }
      }
    }

    // 3. Tên cô dâu thân mật
    if (bShort) {
      document.querySelectorAll('.env-name.bride, .title-word.bride-word').forEach((el) => {
        el.textContent = bShort;
      });
      const tabBride = document.getElementById('tabBrideBtn');
      if (tabBride) tabBride.textContent = 'MỪNG CÔ DÂU';
      const badgeBride = document.querySelector('#panelBride .silk-badge-text');
      if (badgeBride) badgeBride.textContent = 'MỪNG CƯỚI CÔ DÂU';

      // Cập nhật tên cô dâu trên màn Cinematic Intro mới
      const introBride = document.querySelector('.intro-bride');
      if (introBride) {
        introBride.setAttribute('data-raw', bShort);
        if (typeof window.__splitChars === 'function') {
          window.__splitChars(introBride);
        } else {
          introBride.textContent = bShort;
        }
      }
    }

    // 4. Tên ghép Cô Dâu & Chú Rể
    if (gShort && bShort) {
      const coupleStr = `${gShort} & ${bShort}`;
      document.querySelectorAll('.sign-handwritten').forEach((el) => {
        el.textContent = coupleStr;
      });
      const addrFrom = document.querySelector('.addr-line-from span');
      if (addrFrom) addrFrom.textContent = `Từ: ${coupleStr} · Nghệ An`;
      const introFrom = document.querySelector('.intro-from');
      if (introFrom) introFrom.textContent = `Từ: ${coupleStr}`;
      const finaleNames = document.querySelector('.finale-names-tag');
      if (finaleNames) {
        finaleNames.innerHTML = `${gShort.toUpperCase()} <span>✳</span> ${bShort.toUpperCase()}`;
      }
      const footerSig = document.querySelector('.film-closing-footer span:last-child');
      if (footerSig) {
        footerSig.textContent = `${gShort.toUpperCase()} ✳ ${bShort.toUpperCase()} © 2026`;
      }
    }

    // 5. Tên đầy đủ & thứ bậc
    if (gFull) {
      const el = document.querySelector('#groomFamilyBlock .child-formal-name');
      if (el) el.textContent = gFull;
    }
    if (gOrder) {
      const el = document.querySelector('#groomFamilyBlock .role-italic');
      if (el) el.textContent = gOrder;
    }
    if (bFull) {
      const el = document.querySelector('#brideFamilyBlock .child-formal-name');
      if (el) el.textContent = bFull;
    }
    if (bOrder) {
      const el = document.querySelector('#brideFamilyBlock .role-italic');
      if (el) el.textContent = bOrder;
    }

    // 6. Gia đình hai họ - Nhà Trai
    if (d.groomFather) {
      const el = document.querySelector('#groomFamilyBlock .parents-names-group .parent-line:nth-child(1)');
      if (el) el.innerHTML = `<strong>Ông:</strong> ${d.groomFather.replace(/^Ông:?\s*/i, '')}`;
    }
    if (d.groomMother) {
      const el = document.querySelector('#groomFamilyBlock .parents-names-group .parent-line:nth-child(2)');
      if (el) el.innerHTML = `<strong>Bà:</strong> ${d.groomMother.replace(/^Bà:?\s*/i, '')}`;
    }
    if (d.groomAddress) {
      const el = document.querySelector('#groomFamilyBlock .family-native-place');
      if (el) el.textContent = d.groomAddress;
    }

    // 7. Gia đình hai họ - Nhà Gái
    if (d.brideFather) {
      const el = document.querySelector('#brideFamilyBlock .parents-names-group .parent-line:nth-child(1)');
      if (el) el.innerHTML = `<strong>Ông:</strong> ${d.brideFather.replace(/^Ông:?\s*/i, '')}`;
    }
    if (d.brideMother) {
      const el = document.querySelector('#brideFamilyBlock .parents-names-group .parent-line:nth-child(2)');
      if (el) el.innerHTML = `<strong>Bà:</strong> ${d.brideMother.replace(/^Bà:?\s*/i, '')}`;
    }
    if (d.brideAddress) {
      const el = document.querySelector('#brideFamilyBlock .family-native-place');
      if (el) el.textContent = d.brideAddress;
    }

    // 8. Ngày cưới chung
    const mainDate = d.vuQuyDate || d.thanhHonDate;
    if (mainDate) {
      // Ngày ngắn (ví dụ 18.12.2027 -> 18.12)
      const dateMatch = mainDate.match(/\d{1,2}[\.\/]\d{1,2}([\.\/]\d{4})?/);
      if (dateMatch) {
        const parts = dateMatch[0].split(/[\.\/]/);
        if (parts.length >= 2) {
          const shortDate = `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}`;
          document.querySelectorAll('.stamp-num, .seal-year, .intro-date-short, .intro-stamp').forEach((el) => {
            el.textContent = shortDate;
          });
          document.querySelectorAll('.intro-pm').forEach((el) => {
            el.textContent = `${parts[0].padStart(2, '0')} · ${parts[1].padStart(2, '0')}`;
          });
        }
      }
      document.querySelectorAll('.env-card-date-tag').forEach((el) => {
        el.textContent = mainDate;
      });
      const introDateLong = document.querySelector('.intro-date-long');
      if (introDateLong) introDateLong.textContent = mainDate;
      const ticketDate = document.querySelector('#heroAdmissionTicket .date-string');
      if (ticketDate) ticketDate.textContent = mainDate.toUpperCase();
      const envSolar = document.querySelector('.env-card-solar-date span');
      if (envSolar) envSolar.textContent = mainDate.toUpperCase();
    }
    if (d.vuQuyLunar) {
      const lunarEl = document.querySelector('#heroAdmissionTicket .lunar-date-item span');
      if (lunarEl) lunarEl.textContent = `Nhằm ngày ${d.vuQuyLunar.replace(/^Nhằm ngày\s*/i, '')}`;
    }

    // 9. Lịch trình hôn lễ
    const tiles = document.querySelectorAll('.itinerary-grid .event-tile');

    // Sự kiện 1: Vu Quy (Nhà Gái)
    if (tiles[0]) {
      if (d.vuQuyTime || d.vuQuyDate) {
        const dt = tiles[0].querySelector('.event-datetime');
        if (dt) dt.innerHTML = `<strong>${(d.vuQuyTime || '08:30 SÁNG').toUpperCase()}</strong> · ${d.vuQuyDate || mainDate || ''}`;
      }
      if (d.vuQuyAddress) {
        const addr = tiles[0].querySelector('.loc-address');
        if (addr) addr.textContent = d.vuQuyAddress;
      }
      if (d.vuQuyMap) {
        const mapBtn = tiles[0].querySelector('.event-map-btn');
        if (mapBtn) mapBtn.href = d.vuQuyMap;
      }
    }

    // Sự kiện 2: Thành Hôn (Nhà Trai)
    if (tiles[1]) {
      if (d.thanhHonTime || d.thanhHonDate) {
        const dt = tiles[1].querySelector('.event-datetime');
        if (dt) dt.innerHTML = `<strong>${(d.thanhHonTime || '10:30 TRƯA').toUpperCase()}</strong> · ${d.thanhHonDate || mainDate || ''}`;
      }
      if (d.thanhHonAddress) {
        const addr = tiles[1].querySelector('.loc-address');
        if (addr) addr.textContent = d.thanhHonAddress;
      }
      if (d.thanhHonMap) {
        const mapBtn = tiles[1].querySelector('.event-map-btn');
        if (mapBtn) mapBtn.href = d.thanhHonMap;
      }
    }

    // Sự kiện 3: Tiệc Cưới
    if (tiles[2]) {
      if (d.tiecDonKhach || d.tiecKhaiTiec) {
        const dt = tiles[2].querySelector('.event-datetime');
        if (dt) {
          const tKhach = d.tiecDonKhach ? `ĐÓN KHÁCH ${d.tiecDonKhach}` : '';
          const tKhai = d.tiecKhaiTiec ? `KHAI TIỆC ${d.tiecKhaiTiec}` : '';
          const timeStr = [tKhach, tKhai].filter(Boolean).join(' · ');
          dt.innerHTML = `<strong>${timeStr}</strong><br />${mainDate || 'Thứ Ba 24.11 &amp; Thứ Tư 25.11.2026'}`;
        }
      }
      if (d.tiecVenue) {
        const v = tiles[2].querySelector('.loc-name');
        if (v) v.textContent = d.tiecVenue;
      }
      if (d.tiecAddress) {
        const addr = tiles[2].querySelector('.loc-address');
        if (addr) {
          addr.textContent = d.tiecHall ? `${d.tiecHall} · ${d.tiecAddress}` : d.tiecAddress;
        }
      }
      if (d.tiecMap) {
        const mapBtn = tiles[2].querySelector('.event-map-btn');
        if (mapBtn) mapBtn.href = d.tiecMap;
      }
    }

    // 10. Thư ngỏ
    if (d.letterContent && d.letterContent.trim()) {
      const copy = document.querySelector('#letter .letter-body-copy');
      if (copy) {
        const paragraphs = d.letterContent
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);

        if (paragraphs.length > 0) {
          const salutation = copy.querySelector('.letter-salutation');
          const signBlock = copy.querySelector('.letter-sign-block');
          // Xóa các paragraph cũ giữa salutation và signBlock
          Array.from(copy.querySelectorAll('p:not(.letter-salutation):not(.sign-handwritten)')).forEach((p) => p.remove());

          paragraphs.forEach((pText) => {
            const pEl = document.createElement('p');
            pEl.textContent = pText;
            if (signBlock) {
              copy.insertBefore(pEl, signBlock);
            } else {
              copy.appendChild(pEl);
            }
          });
        }
      }
    }

    // 11. 5 Mốc Kỷ Niệm (Polaroid Deck)
    const cards = document.querySelectorAll('#polaroidDeckContainer .polaroid-scrapbook-card');
    for (let i = 1; i <= 5; i++) {
      const card = cards[i - 1];
      if (!card) continue;
      const yr = d[`m${i}Year`];
      const title = d[`m${i}Title`];
      const story = d[`m${i}Story`];

      if (yr) {
        const yp = card.querySelector('.polaroid-year-pill');
        if (yp) yp.textContent = yr;
        const sc = card.querySelector('.chin-scene');
        if (sc) sc.textContent = `CẢNH 0${i} · ${yr}`;
      }
      if (title) {
        const t = card.querySelector('.chin-title');
        if (t) t.textContent = title;
      }
      if (story) {
        const s = card.querySelector('.chin-story');
        if (s) s.textContent = story;
      }
    }

    // 12. Tài khoản Ngân Hàng & VietQR Chú Rể
    if (d.groomBank) {
      const bLabel = document.querySelector('#panelGroom .bank-name-label');
      if (bLabel) bLabel.textContent = `NGÂN HÀNG ${d.groomBank.toUpperCase()}`;
    }
    if (d.groomAccName) {
      const rows = document.querySelectorAll('#panelGroom .info-row');
      if (rows[0]) {
        const val = rows[0].querySelector('.row-value');
        if (val) val.textContent = d.groomAccName.toUpperCase();
      }
    }
    if (d.groomAccNumber) {
      const acc = document.getElementById('groomAcc');
      if (acc) acc.textContent = d.groomAccNumber;
      const copyBtn = document.querySelector('#panelGroom .copy-account-btn');
      if (copyBtn) copyBtn.setAttribute('data-account', d.groomAccNumber);

      // Cập nhật mã VietQR động trực quan
      if (d.groomBank) {
        updateVietQrFrame('#panelGroom .qr-vintage-frame', d.groomBank, d.groomAccNumber, d.groomAccName);
      }
    }

    // 13. Tài khoản Ngân Hàng & VietQR Cô Dâu
    if (d.brideBank) {
      const bLabel = document.querySelector('#panelBride .bank-name-label');
      if (bLabel) bLabel.textContent = `NGÂN HÀNG ${d.brideBank.toUpperCase()}`;
    }
    if (d.brideAccName) {
      const rows = document.querySelectorAll('#panelBride .info-row');
      if (rows[0]) {
        const val = rows[0].querySelector('.row-value');
        if (val) val.textContent = d.brideAccName.toUpperCase();
      }
    }
    if (d.brideAccNumber) {
      const acc = document.getElementById('brideAcc');
      if (acc) acc.textContent = d.brideAccNumber;
      const copyBtn = document.querySelector('#panelBride .copy-account-btn');
      if (copyBtn) copyBtn.setAttribute('data-account', d.brideAccNumber);

      if (d.brideBank) {
        updateVietQrFrame('#panelBride .qr-vintage-frame', d.brideBank, d.brideAccNumber, d.brideAccName);
      }
    }

    // 14. Bài hát nền trên đĩa than hoài niệm
    if (d.musicChoice) {
      document.querySelectorAll('.music-track-title').forEach((el) => {
        el.textContent = d.musicChoice;
      });
      const mToggle = document.getElementById('musicToggleBtn');
      if (mToggle) mToggle.title = `Bật/Tắt nhạc: ${d.musicChoice}`;
    }

    if (isLive) {
      showSyncBadge('✨ Đã cập nhật từ trang nhập liệu');
    }
  }

  /**
   * Tạo / Cập nhật ảnh VietQR thật
   */
  function updateVietQrFrame(selector, bank, acc, name) {
    const frame = document.querySelector(selector);
    if (!frame) return;

    // Chuẩn hóa tên bank (loại bỏ ký tự thừa)
    const cleanBank = bank.trim().replace(/\s+/g, '').toUpperCase();
    const cleanAcc = acc.trim();
    const cleanName = encodeURIComponent((name || '').trim().toUpperCase());
    const qrUrl = `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact.png?accountName=${cleanName}`;

    let img = frame.querySelector('img.dynamic-vietqr');
    if (!img) {
      img = document.createElement('img');
      img.className = 'dynamic-vietqr';
      img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 6px; display: block;';
      img.alt = `Mã VietQR ${cleanBank} ${cleanAcc}`;
      const svg = frame.querySelector('svg');
      if (svg) svg.style.display = 'none';
      frame.appendChild(img);
    }
    img.src = qrUrl;
  }

  // Chạy ngay khi DOM sẵn sàng
  function init() {
    const data = getStoredData();
    applyDataToDOM(data, false);

    // Lắng nghe BroadcastChannel (cực nhanh khi mở 2 tab song song)
    if (syncChannel) {
      syncChannel.onmessage = (evt) => {
        if (evt.data && evt.data.type === 'UPDATE_FORM') {
          applyDataToDOM(evt.data.payload, true);
        }
      };
    }

    // Lắng nghe Storage event (khi tab khác cập nhật localStorage)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY || (e.key && e.key.startsWith('wedding_form_'))) {
        const fresh = getStoredData();
        applyDataToDOM(fresh, true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Xuất API toàn cục để có thể gọi thủ công khi cần
  window.WeddingLiveSync = {
    applyData: applyDataToDOM,
    getData: getStoredData,
  };
})();

