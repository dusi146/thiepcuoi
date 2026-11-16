/**
 * wedding-db.js — Hệ thống quản trị dữ liệu thời gian thực (Realtime DB & Google Sheets Sync)
 * Hỗ trợ 2 chiều đọc / ghi:
 * 1. Google Sheets Web App (Đọc danh sách lời chúc & khách mời về mọi trình duyệt / Ghi danh khi gửi)
 * 2. Firebase Realtime Database (Tùy chọn kết nối thêm nếu cần sub-second WebSocket)
 * 3. LocalStorage Cache (Nạp tức thì 0ms, không phụ thuộc mạng, tự cập nhật khi có dữ liệu mới)
 */

const STORAGE_KEYS = {
  RSVPS: 'wedding_rsvps_tien_chau_v2',
  WISHES: 'wedding_guestbook_tien_chau_v2',
  CONFIG: 'wedding_system_config_v2',
  ADMIN_AUTH: 'wedding_admin_authenticated'
};

// Cấu hình mặc định liên kết trực tiếp với Google Apps Script của Văn Tiến & Bảo Châu
const DEFAULT_CONFIG = {
  firebaseUrl: '',
  sheetUrl: 'https://script.google.com/macros/s/AKfycby7AiQwSnKqV4-F-vf0Y3qP--mbv67iGsMwnleex4CJPaMViwgk5aajYejxTg7cP6Os/exec',
  adminPin: '2511' // Ngày cưới chính lễ 25.11
};

// Lời chúc dự phòng ban đầu nếu chưa tải được từ Google Sheet
const INITIAL_DEFAULT_WISHES = [
  {
    id: 'wish_init_1',
    name: 'Bác Thành & Gia đình',
    time: '2 ngày trước',
    timestamp: Date.now() - 172800000,
    wish: 'Chúc hai cháu Văn Tiến & Bảo Châu trăm năm tình viên mãn, bạc đầu nghĩa phu thê! Luôn yêu thương và cùng nhau xây đắp mái ấm thật hạnh phúc nhé.'
  },
  {
    id: 'wish_init_2',
    name: 'Hội Bạn Thân Đại Học',
    time: '1 ngày trước',
    timestamp: Date.now() - 86400000,
    wish: 'Chúc mừng người anh em Văn Tiến đã chính thức rước nàng về dinh! Chúc đôi bạn trẻ sớm có tin vui, công việc thuận lợi, mãi mặn nồng như ngày đầu.'
  },
  {
    id: 'wish_init_3',
    name: 'Phương Thảo & Minh Quân',
    time: 'Hôm qua',
    timestamp: Date.now() - 43200000,
    wish: 'Chúc cô dâu Bảo Châu luôn rạng rỡ xinh đẹp, chú rể Văn Tiến luôn là điểm tựa vững chãi. Hẹn gặp hai bạn ở Nghệ An ngày 25.11 nhé!'
  }
];

class WeddingDatabaseService {
  constructor() {
    this.config = this.loadConfig();
    this.wishesListeners = new Set();
    this.rsvpsListeners = new Set();
    this.wishesEventSource = null;
    this.rsvpsEventSource = null;
    this.isSyncing = false;

    this.initDefaultData();
    this.setupRealtimeListeners();

    // 1. Đồng bộ ngay từ Google Sheet khi vừa mở web
    this.syncFromGoogleSheet();

    // 2. Định kỳ thăm dò cập nhật mới mỗi 12 giây trong nền
    setInterval(() => this.syncFromGoogleSheet(), 12000);

    // 3. Khi người dùng quay lại tab trình duyệt, tự động làm mới
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.syncFromGoogleSheet();
      });
      window.addEventListener('focus', () => this.syncFromGoogleSheet());
    }
  }

  // --- 1. CẤU HÌNH ---
  loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
    } catch (_) {
      return { ...DEFAULT_CONFIG };
    }
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    } catch (_) {}
    this.setupRealtimeListeners();
    this.syncFromGoogleSheet();
  }

  // --- 2. KHỞI TẠO DỮ LIỆU BAN ĐẦU ---
  initDefaultData() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.WISHES)) {
        localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(INITIAL_DEFAULT_WISHES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.RSVPS)) {
        localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify([]));
      }
    } catch (_) {}
  }

  // --- 3. ĐỒNG BỘ 2 CHIỀU TỪ GOOGLE SHEET VỀ TẤT CẢ TRÌNH DUYỆT ---
  async syncFromGoogleSheet() {
    const sheetUrl = this.config.sheetUrl?.trim();
    if (!sheetUrl) return { success: false, reason: 'no_url' };
    if (this.isSyncing) return { success: false, reason: 'busy' };

    this.isSyncing = true;
    try {
      // Dùng cache: 'no-store' để luôn lấy dữ liệu mới nhất
      const res = await fetch(sheetUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Sheet network error ' + res.status);

      const data = await res.json();
      if (data && data.status === 'success') {
        let wishesCount = 0;
        let rsvpsCount = 0;
        // Cập nhật Sổ lưu bút nếu có lời chúc thật từ Google Sheet
        if (Array.isArray(data.wishes)) {
          wishesCount = data.wishes.length;
          if (wishesCount > 0) {
            try {
              localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(data.wishes));
            } catch (_) {}
            this.notifyWishesListeners(data.wishes);
          }
        }

        // Cập nhật Danh sách khách mời nếu có
        if (Array.isArray(data.rsvps)) {
          rsvpsCount = data.rsvps.length;
          if (rsvpsCount > 0) {
            try {
              localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(data.rsvps));
            } catch (_) {}
            this.notifyRsvpsListeners(data.rsvps);
          }
        }
        this.lastSyncTime = new Date();
        return { success: true, wishesCount, rsvpsCount, timestamp: this.lastSyncTime };
      }
      return { success: false, reason: 'invalid_format' };
    } catch (err) {
      // Fallback êm ái sang LocalStorage nếu mạng offline
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  // --- 4. FIREBASE REALTIME SSE (NẾU CÓ CẤU HÌNH) ---
  setupRealtimeListeners() {
    if (this.wishesEventSource) {
      try { this.wishesEventSource.close(); } catch (_) {}
      this.wishesEventSource = null;
    }
    if (this.rsvpsEventSource) {
      try { this.rsvpsEventSource.close(); } catch (_) {}
      this.rsvpsEventSource = null;
    }

    const fbUrl = this.config.firebaseUrl?.trim().replace(/\/$/, '');
    if (!fbUrl || fbUrl.includes('placeholder')) return;

    try {
      this.wishesEventSource = new EventSource(`${fbUrl}/wishes.json`);
      this.wishesEventSource.addEventListener('put', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && payload.data) {
            const remoteWishes = typeof payload.data === 'object' 
              ? Object.entries(payload.data).map(([key, val]) => ({ ...val, id: val.id || key }))
              : [];
            if (remoteWishes.length > 0) this.mergeWishesFromRemote(remoteWishes);
          }
        } catch (_) {}
      });
      this.wishesEventSource.onerror = () => {};
    } catch (_) {}
  }

  mergeWishesFromRemote(remoteWishes) {
    const local = this.getWishes();
    const map = new Map();
    local.forEach(w => map.set(w.id || `${w.name}_${w.timestamp}`, w));
    remoteWishes.forEach(w => {
      const key = w.id || `${w.name}_${w.timestamp}`;
      map.set(key, { ...map.get(key), ...w });
    });
    const merged = Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(merged));
    } catch (_) {}
    this.notifyWishesListeners(merged);
  }

  // --- 5. QUẢN LÝ LỜI CHÚC (WISHES / GUESTBOOK) ---
  getWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WISHES);
      return raw ? JSON.parse(raw) : INITIAL_DEFAULT_WISHES;
    } catch (_) {
      return INITIAL_DEFAULT_WISHES;
    }
  }

  async addWish(wishData) {
    const newEntry = {
      id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: wishData.name.trim(),
      phone: (wishData.phone || '').trim(),
      wish: wishData.wish.trim(),
      time: 'Vừa xong',
      timestamp: Date.now(),
      pinned: false
    };

    // 1. Lưu LocalStorage ngay lập tức để người gửi thấy ngay
    const list = this.getWishes();
    list.unshift(newEntry);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(list));
    } catch (_) {}
    this.notifyWishesListeners(list);

    // 2. Gửi đồng thời về Google Sheet để mọi trình duyệt khác cũng thấy
    const sheetUrl = this.config.sheetUrl?.trim();
    if (sheetUrl) {
      try {
        const formData = new URLSearchParams();
        formData.append('createdAt', new Date().toLocaleString('vi-VN'));
        formData.append('name', newEntry.name);
        formData.append('phone', newEntry.phone);
        formData.append('attendance', 'Gửi lời chúc');
        formData.append('guestCount', '1');
        formData.append('eventChoice', 'Sổ lưu bút');
        formData.append('side', 'Khách quý');
        formData.append('wish', newEntry.wish);

        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        }).catch(() => {});

        setTimeout(() => this.syncFromGoogleSheet(), 1000);
      } catch (_) {}
    }

    // 3. Gửi Firebase nếu có
    const fbUrl = this.config.firebaseUrl?.trim().replace(/\/$/, '');
    if (fbUrl) {
      try {
        fetch(`${fbUrl}/wishes/${newEntry.id}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry)
        }).catch(() => {});
      } catch (_) {}
    }

    return newEntry;
  }

  deleteWish(wishId) {
    const target = this.getWishes().find(w => w.id === wishId);
    let list = this.getWishes().filter(w => w.id !== wishId);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(list));
    } catch (_) {}
    this.notifyWishesListeners(list);

    // Gửi xóa lên Google Sheet nếu có rowIndex
    const sheetUrl = this.config.sheetUrl?.trim();
    if (sheetUrl && target && target.rowIndex) {
      try {
        const formData = new URLSearchParams();
        formData.append('action', 'delete_row');
        formData.append('rowIndex', target.rowIndex);
        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        }).catch(() => {});
        setTimeout(() => this.syncFromGoogleSheet(), 1000);
      } catch (_) {}
    }
  }

  togglePinWish(wishId) {
    const list = this.getWishes().map(w => {
      if (w.id === wishId) return { ...w, pinned: !w.pinned };
      return w;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(list));
    } catch (_) {}
    this.notifyWishesListeners(list);
  }

  // --- 6. QUẢN LÝ XÁC NHẬN THAM DỰ (RSVP) ---
  getRsvps() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RSVPS);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  async submitRsvp(rsvpData) {
    const newEntry = {
      id: `rsvp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: rsvpData.name.trim(),
      phone: (rsvpData.phone || '').trim(),
      attendance: rsvpData.attendance || 'yes',
      guestCount: parseInt(rsvpData.guestCount || '1', 10),
      eventChoice: rsvpData.eventChoice || 'all',
      side: rsvpData.side || 'both',
      wish: (rsvpData.wish || '').trim(),
      checkedIn: false,
      timestamp: Date.now(),
      createdAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    };

    // 1. Lưu LocalStorage ngay lập tức
    const list = this.getRsvps();
    list.unshift(newEntry);
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(list));
    } catch (_) {}
    this.notifyRsvpsListeners(list);

    // 2. Nếu có lời chúc, tự động thêm vào Sổ lưu bút
    if (newEntry.wish) {
      const wishList = this.getWishes();
      wishList.unshift({
        id: `wish_${newEntry.id}`,
        name: newEntry.name,
        phone: newEntry.phone,
        wish: newEntry.wish,
        time: 'Vừa xong',
        timestamp: Date.now(),
        pinned: false
      });
      try {
        localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(wishList));
      } catch (_) {}
      this.notifyWishesListeners(wishList);
    }

    // 3. Gửi đồng thời về Google Sheet (để đổ về file Excel của bạn và hiển thị trên mọi trình duyệt)
    const sheetUrl = this.config.sheetUrl?.trim();
    if (sheetUrl) {
      try {
        const formData = new URLSearchParams();
        formData.append('createdAt', newEntry.createdAt);
        formData.append('name', newEntry.name);
        formData.append('phone', newEntry.phone);
        formData.append('attendance', newEntry.attendance === 'yes' ? 'Có tham dự' : 'Báo vắng');
        formData.append('guestCount', newEntry.guestCount);
        formData.append('eventChoice', this.formatEventChoice(newEntry.eventChoice));
        formData.append('side', this.formatSide(newEntry.side));
        formData.append('wish', newEntry.wish);

        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        }).catch(() => {});

        // Sau 1s tự động đồng bộ lại từ Google Sheet
        setTimeout(() => this.syncFromGoogleSheet(), 1000);
      } catch (_) {}
    }

    return newEntry;
  }

  deleteRsvp(rsvpId) {
    const target = this.getRsvps().find(r => r.id === rsvpId);
    let list = this.getRsvps().filter(r => r.id !== rsvpId);
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(list));
    } catch (_) {}
    this.notifyRsvpsListeners(list);

    const sheetUrl = this.config.sheetUrl?.trim();
    if (sheetUrl && target && target.rowIndex) {
      try {
        const formData = new URLSearchParams();
        formData.append('action', 'delete_row');
        formData.append('rowIndex', target.rowIndex);
        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        }).catch(() => {});
        setTimeout(() => this.syncFromGoogleSheet(), 1000);
      } catch (_) {}
    }
  }

  toggleCheckIn(rsvpId, status) {
    let target = null;
    const list = this.getRsvps().map(r => {
      if (r.id === rsvpId) {
        target = { 
          ...r, 
          checkedIn: status !== undefined ? status : !r.checkedIn,
          checkedInAt: (!r.checkedIn) ? new Date().toLocaleTimeString('vi-VN') : null
        };
        return target;
      }
      return r;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(list));
    } catch (_) {}
    this.notifyRsvpsListeners(list);

    const sheetUrl = this.config.sheetUrl?.trim();
    if (sheetUrl && target && target.rowIndex) {
      try {
        const formData = new URLSearchParams();
        formData.append('action', 'toggle_checkin');
        formData.append('rowIndex', target.rowIndex);
        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        }).catch(() => {});
        setTimeout(() => this.syncFromGoogleSheet(), 1000);
      } catch (_) {}
    }
  }

  // --- 7. EVENT SUBSCRIBERS ---
  onWishesChange(callback) {
    this.wishesListeners.add(callback);
    callback(this.getWishes());
    return () => this.wishesListeners.delete(callback);
  }

  onRsvpsChange(callback) {
    this.rsvpsListeners.add(callback);
    callback(this.getRsvps());
    return () => this.rsvpsListeners.delete(callback);
  }

  notifyWishesListeners(list) {
    this.wishesListeners.forEach(cb => {
      try { cb(list); } catch (_) {}
    });
  }

  notifyRsvpsListeners(list) {
    this.rsvpsListeners.forEach(cb => {
      try { cb(list); } catch (_) {}
    });
  }

  // --- 8. XUẤT FILE EXCEL / CSV TIẾNG VIỆT CHUẨN ---
  exportRsvpsToCsv() {
    const list = this.getRsvps();
    if (list.length === 0) {
      alert('Chưa có khách nào đăng ký tham dự để xuất file!');
      return;
    }

    const headers = [
      'STT',
      'Thời gian đăng ký',
      'Họ và tên khách',
      'Số điện thoại',
      'Trạng thái tham dự',
      'Số người đi cùng',
      'Phía quan hệ',
      'Sự kiện tham dự',
      'Điểm danh tại tiệc',
      'Lời chúc phúc'
    ];

    const rows = list.map((item, idx) => [
      idx + 1,
      `"${item.createdAt || ''}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${item.phone || ''}"`,
      `"${item.attendance === 'yes' ? 'Chắc chắn đến' : 'Báo vắng'}"`,
      item.guestCount || 1,
      `"${this.formatSide(item.side)}"`,
      `"${this.formatEventChoice(item.eventChoice)}"`,
      `"${item.checkedIn ? 'ĐÃ ĐẾN TIỆC' : 'Chưa đến'}"`,
      `"${(item.wish || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Khach_Cuoi_Tien_Chau_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  formatSide(side) {
    switch (side) {
      case 'groom': return 'Nhà Trai (Chú rể)';
      case 'bride': return 'Nhà Gái (Cô dâu)';
      default: return 'Khách chung hai họ';
    }
  }

  formatEventChoice(choice) {
    switch (choice) {
      case 'thanhhon': return 'Lễ Thành Hôn (25.11 · Nhà Trai)';
      case 'vuquy': return 'Lễ Vu Quy (24.11 · Nhà Gái)';
      case 'tiecruou': return 'Tiệc Rượu Thân Mật (25.11 · Nhà Văn Hóa Thôn Dùng II)';
      case 'all': return 'Trọn vẹn hai buổi lễ';
      default: return 'Tất cả các buổi tiệc';
    }
  }
}

// Khởi tạo Singleton Database
export const WeddingDB = new WeddingDatabaseService();
window.WeddingDB = WeddingDB;
