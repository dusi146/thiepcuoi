/**
 * wedding-db.js — Hệ thống quản trị dữ liệu thời gian thực (Realtime DB & Sheets Sync)
 * Hỗ trợ 3 tầng lưu trữ:
 * 1. Firebase Realtime Database (WebSocket / SSE - Miễn phí 100%, đồng bộ tức thì)
 * 2. Google Sheets Webhook (Tự động lưu vào Google Trang tính để quản lý trên điện thoại)
 * 3. LocalStorage Fallback (Đảm bảo hoạt động ngoại tuyến, không bao giờ mất dữ liệu)
 */

const STORAGE_KEYS = {
  RSVPS: 'wedding_rsvps_tien_chau_v2',
  WISHES: 'wedding_guestbook_tien_chau_v2',
  CONFIG: 'wedding_system_config_v2',
  ADMIN_AUTH: 'wedding_admin_authenticated'
};

// Cấu hình mặc định
const DEFAULT_CONFIG = {
  // Chú rể / Cô dâu có thể dán link Firebase hoặc Google Sheet vào trang quan-ly.html
  firebaseUrl: 'https://thiepcuoi-tienchau-default-rtdb.asia-southeast1.firebasedatabase.app',
  sheetUrl: 'https://script.google.com/macros/s/AKfyby7AiQwSnKqV4-F-vf0Y3qP--mbv67iGsMwnleex4CJPaMViwgk5aajYejxTg7cP6Os/exec',
  adminPin: '2511' // Ngày cưới chính lễ 25.11
};

// Lời chúc mẫu ban đầu (khi chưa có ai gửi)
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
    this.initDefaultData();
    this.setupRealtimeListeners();
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
    // Khởi động lại SSE nếu đổi URL
    this.setupRealtimeListeners();
  }

  // --- 2. KHỞI TẠO DỮ LIỆU BAN ĐẦU ---
  initDefaultData() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.WISHES)) {
        // Kiểm tra xem có dữ liệu từ version trước không
        const legacy = localStorage.getItem('wedding_guestbook_tien_chau');
        if (legacy) {
          localStorage.setItem(STORAGE_KEYS.WISHES, legacy);
        } else {
          localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(INITIAL_DEFAULT_WISHES));
        }
      }
      if (!localStorage.getItem(STORAGE_KEYS.RSVPS)) {
        localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify([]));
      }
    } catch (_) {}
  }

  // --- 3. ĐỒNG BỘ THỜI GIAN THỰC (REALTIME SSE / POLLING) ---
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
    if (!fbUrl || fbUrl.includes('placeholder')) {
      return;
    }

    // Kết nối Firebase SSE cho Lời Chúc (Wishes)
    try {
      const wishesSseUrl = `${fbUrl}/wishes.json`;
      this.wishesEventSource = new EventSource(wishesSseUrl);

      this.wishesEventSource.addEventListener('put', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && payload.data) {
            const remoteWishes = typeof payload.data === 'object' 
              ? Object.entries(payload.data).map(([key, val]) => ({ ...val, id: val.id || key }))
              : [];
            if (remoteWishes.length > 0) {
              this.mergeWishesFromRemote(remoteWishes);
            }
          }
        } catch (_) {}
      });

      this.wishesEventSource.onerror = () => {
        // Fallback im lặng sang chế độ offline nếu Firebase endpoint chưa mở quyền read
      };
    } catch (_) {}

    // Kết nối Firebase SSE cho RSVP (Xác nhận tham dự)
    try {
      const rsvpSseUrl = `${fbUrl}/rsvps.json`;
      this.rsvpsEventSource = new EventSource(rsvpSseUrl);

      this.rsvpsEventSource.addEventListener('put', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && payload.data) {
            const remoteRsvps = typeof payload.data === 'object'
              ? Object.entries(payload.data).map(([key, val]) => ({ ...val, id: val.id || key }))
              : [];
            if (remoteRsvps.length > 0) {
              this.mergeRsvpsFromRemote(remoteRsvps);
            }
          }
        } catch (_) {}
      });
    } catch (_) {}
  }

  mergeWishesFromRemote(remoteWishes) {
    const local = this.getWishes();
    const map = new Map();
    // Ưu tiên local trước
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

  mergeRsvpsFromRemote(remoteRsvps) {
    const local = this.getRsvps();
    const map = new Map();
    local.forEach(r => map.set(r.id || `${r.phone}_${r.name}`, r));
    remoteRsvps.forEach(r => {
      const key = r.id || `${r.phone}_${r.name}`;
      map.set(key, { ...map.get(key), ...r });
    });
    const merged = Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(merged));
    } catch (_) {}
    this.notifyRsvpsListeners(merged);
  }

  // --- 4. QUẢN LÝ LỜI CHÚC (WISHES / GUESTBOOK) ---
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

    // 1. Lưu LocalStorage ngay lập tức
    const list = this.getWishes();
    list.unshift(newEntry);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(list));
    } catch (_) {}
    this.notifyWishesListeners(list);

    // 2. Gửi bất đồng bộ lên Firebase Realtime Database
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
    let list = this.getWishes().filter(w => w.id !== wishId);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(list));
    } catch (_) {}
    this.notifyWishesListeners(list);

    const fbUrl = this.config.firebaseUrl?.trim().replace(/\/$/, '');
    if (fbUrl) {
      try {
        fetch(`${fbUrl}/wishes/${wishId}.json`, { method: 'DELETE' }).catch(() => {});
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

    const target = list.find(w => w.id === wishId);
    const fbUrl = this.config.firebaseUrl?.trim().replace(/\/$/, '');
    if (fbUrl && target) {
      try {
        fetch(`${fbUrl}/wishes/${wishId}/pinned.json`, {
          method: 'PUT',
          body: JSON.stringify(target.pinned)
        }).catch(() => {});
      } catch (_) {}
    }
  }

  // --- 5. QUẢN LÝ XÁC NHẬN THAM DỰ (RSVP) ---
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
      attendance: rsvpData.attendance || 'yes', // 'yes' hoặc 'no'
      guestCount: parseInt(rsvpData.guestCount || '1', 10),
      eventChoice: rsvpData.eventChoice || 'all', // 'all', 'thanhhon', 'vuquy', 'tiecruou'
      side: rsvpData.side || 'both', // 'groom', 'bride', 'both'
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

    // 2. Nếu có gửi kèm lời chúc, tự động lưu vào Sổ Lưu Bút
    if (newEntry.wish) {
      await this.addWish({
        name: newEntry.name,
        phone: newEntry.phone,
        wish: newEntry.wish
      });
    }

    // 3. Gửi lên Firebase Realtime Database
    const fbUrl = this.config.firebaseUrl?.trim().replace(/\/$/, '');
    if (fbUrl) {
      try {
        fetch(`${fbUrl}/rsvps/${newEntry.id}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry)
        }).catch(() => {});
      } catch (_) {}
    }

    // 4. Gửi đồng thời về Google Sheets (nếu đã cấu hình Webhook Apps Script)
    const sheetUrl = this.config.sheetUrl?.trim();
    if (sheetUrl) {
      try {
        const formData = new URLSearchParams();
        formData.append('id', newEntry.id);
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
      } catch (_) {}
    }

    return newEntry;
  }

  deleteRsvp(rsvpId) {
    let list = this.getRsvps().filter(r => r.id !== rsvpId);
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(list));
    } catch (_) {}
    this.notifyRsvpsListeners(list);

    const fbUrl = this.config.firebaseUrl?.trim().replace(/\/$/, '');
    if (fbUrl) {
      try {
        fetch(`${fbUrl}/rsvps/${rsvpId}.json`, { method: 'DELETE' }).catch(() => {});
      } catch (_) {}
    }
  }

  toggleCheckIn(rsvpId, status) {
    const list = this.getRsvps().map(r => {
      if (r.id === rsvpId) {
        return { 
          ...r, 
          checkedIn: status !== undefined ? status : !r.checkedIn,
          checkedInAt: (!r.checkedIn) ? new Date().toLocaleTimeString('vi-VN') : null
        };
      }
      return r;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(list));
    } catch (_) {}
    this.notifyRsvpsListeners(list);

    const target = list.find(r => r.id === rsvpId);
    const fbUrl = this.config.firebaseUrl?.trim().replace(/\/$/, '');
    if (fbUrl && target) {
      try {
        fetch(`${fbUrl}/rsvps/${rsvpId}/checkedIn.json`, {
          method: 'PUT',
          body: JSON.stringify(target.checkedIn)
        }).catch(() => {});
      } catch (_) {}
    }
  }

  // --- 6. EVENT SUBSCRIBERS ---
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

  // --- 7. XUẤT FILE EXCEL / CSV TIẾNG VIỆT CHUẨN ---
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

  // --- HELPERS FORMAT ---
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
