/**
 * CINEMATIC RETRO WEDDING INTRO SCRIPT
 * Màn mở phong bì thư 3D tương tác chân thực — 60FPS GPU Compositor
 */

(function () {
  if (typeof window === 'undefined') return;

  /* P1-B: Cá nhân hoá tên khách mời từ ?to=Tên (chống XSS bằng textContent) */
  function applyGuestPersonalization() {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawGuest = (params.get('to') || params.get('khach') || params.get('guest') || '').trim();
      if (!rawGuest) return;
      const safeGuest = rawGuest.slice(0, 60);

      const envHand = document.querySelector('#intro .addr .hand');
      if (envHand) {
        envHand.textContent = '';
        const prefix = document.createElement('span');
        prefix.style.cssText = 'display:block;font-size:0.78em;opacity:0.82;';
        prefix.textContent = 'Kính gửi:';
        const nameNode = document.createElement('span');
        nameNode.textContent = safeGuest;
        envHand.append(prefix, nameNode);
      }

      const letterSalutation = document.querySelector('.letter-salutation');
      if (letterSalutation) {
        letterSalutation.textContent = `${safeGuest} thân mến,`;
      }

      const rsvpNameInput = document.getElementById('guestName');
      if (rsvpNameInput && !rsvpNameInput.value) {
        rsvpNameInput.value = safeGuest;
      }
    } catch (_) {}
  }

  /* P0-1: Preloader cuộn phim 35mm (Film Leader Countdown 3-2-1 nhanh gọn) */
  function initFilmLeader() {
    const leader = document.getElementById('filmLeader');
    if (!leader) return;
    const num = document.getElementById('leaderCountdownNum');
    let count = 3;

    function dismissLeader() {
      clearInterval(timer);
      if (!leader.classList.contains('leave-leader')) {
        leader.classList.add('leave-leader');
        setTimeout(() => {
          try { leader.remove(); } catch (_) {}
        }, 420);
      }
    }

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        if (num) num.textContent = count;
      } else {
        dismissLeader();
      }
    }, 260);

    Promise.race([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((r) => setTimeout(r, 750)),
    ]).then(() => {
      setTimeout(dismissLeader, 550);
    });
  }

  initFilmLeader();

  function initIntro() {
    applyGuestPersonalization();

    const st = document.getElementById('intro');
    if (!st) return;

    const root = document.documentElement;
    const rig = st.querySelector('.rig');
    const R = Math.random;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const buzz = (n) => {
      try {
        if (navigator.vibrate) navigator.vibrate(n);
      } catch (_) {}
    };
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    root.classList.add('lock');

    /* Giữ nguyên chữ tiếng Việt liền mạch để dấu thanh hiển thị chuẩn xác và mượt 60fps */
    function syncSplitText(h) {
      if (!h) return;
      const t = h.getAttribute('data-raw') || h.textContent.trim();
      h.setAttribute('data-raw', t);
      h.textContent = t;
    }

    st.querySelectorAll('[data-split]').forEach(syncSplitText);
    window.__splitChars = syncSplitText;

    /* Canvas hạt: Bụi vàng, tia lửa, mảnh vỡ con dấu sáp, pháo hoa giấy confetti (<= 36 hạt) */
    const cv = document.getElementById('fx');
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;

    const P = [];
    const C = ['#b3261e', '#d9a441', '#f0e3c7', '#8e1a14', '#ffe2a0'];
    let W, H, D, amb = 0;

    const fit = () => {
      D = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2);
      W = cv.width = window.innerWidth * D;
      H = cv.height = window.innerHeight * D;
    };
    fit();
    window.addEventListener('resize', fit, { passive: true });

    const spr = document.createElement('canvas');
    spr.width = spr.height = 32;
    {
      const s = spr.getContext('2d');
      if (s) {
        const r = s.createRadialGradient(16, 16, 0, 16, 16, 16);
        r.addColorStop(0, '#fff4cf');
        r.addColorStop(0.25, 'rgba(255,214,120,.8)');
        r.addColorStop(1, 'rgba(217,164,65,0)');
        s.fillStyle = r;
        s.fillRect(0, 0, 32, 32);
      }
    }

    const add = (o) =>
      P.push({
        x: W / 2,
        y: H / 2,
        vx: 0,
        vy: 0,
        g: 0,
        d: 0.99,
        r: 2,
        life: 90,
        age: 0,
        rot: 0,
        vr: 0,
        fl: 0,
        vf: 0,
        tw: 0,
        type: 'dot',
        ...o,
      });

    const sparks = (x, y, n) => {
      for (let i = 0; i < n; i++) {
        const a = R() * 6.28;
        const s = (1.2 + R() * 5.2) * D;
        add({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          g: 0.04 * D,
          d: 0.96,
          r: (1 + R() * 2.2) * D,
          life: 48 + R() * 32,
        });
      }
    };

    const confetti = (x, y, n) => {
      const count = Math.min(n, 36);
      for (let i = 0; i < count; i++) {
        const a = -1.57 + (R() - 0.5) * 2.4;
        const s = (4.5 + R() * 9.5) * D;
        add({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          g: 0.16 * D,
          d: 0.965,
          type: 'rect',
          w: (4.5 + R() * 6) * D,
          h: (7 + R() * 8) * D,
          c: C[i % 5],
          life: 140 + R() * 80,
          vr: (R() - 0.5) * 0.28,
          vf: 0.08 + R() * 0.14,
          fl: R() * 6,
        });
      }
    };

    let tx = 0, ty = 0, cx = 0, cy = 0;
    if (!isTouch) {
      window.addEventListener(
        'pointermove',
        (e) => {
          tx = (e.clientX / window.innerWidth - 0.5) * 1.4;
          ty = (e.clientY / window.innerHeight - 0.5) * 1.4;
        },
        { passive: true }
      );
    }

    let last = performance.now();
    let isIntroActive = true;
    const maxAmb = isTouch ? 8 : 18;

    function loop(t) {
      if (!isIntroActive || !st.isConnected) return;
      const dt = Math.min((t - last) / 16.7, 2.0);
      last = t;

      if (!isTouch) {
        cx += (tx - cx) * 0.06 * dt;
        cy += (ty - cy) * 0.06 * dt;
        if (rig && (Math.abs(cx) > 0.01 || Math.abs(cy) > 0.01)) {
          rig.style.transform = `perspective(1100px) rotateX(${(-cy * 3.5).toFixed(2)}deg) rotateY(${(cx * 4.5).toFixed(2)}deg)`;
        }
      }

      if (!calm && amb < maxAmb && R() < (isTouch ? 0.04 : 0.08) * dt) {
        amb++;
        add({
          x: R() * W,
          y: H + 10,
          vx: (R() - 0.5) * 0.28 * D,
          vy: -(0.3 + R() * 0.55) * D,
          d: 1,
          r: (0.8 + R() * 1.6) * D,
          life: 320 + R() * 280,
          tw: R() * 6,
          amb: 1,
        });
      }

      g.clearRect(0, 0, W, H);
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.age += dt;
        if (p.age > p.life) {
          if (p.amb) amb--;
          P.splice(i, 1);
          continue;
        }
        p.vx *= p.d;
        p.vy = p.vy * p.d + p.g * dt;
        p.x += p.vx * dt + (p.type === 'rect' ? Math.sin(p.age * 0.08 + p.fl) * 0.5 * D : 0);
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.fl += p.vf * dt;
        const a = Math.min(1, p.age / 16, (p.life - p.age) / 24);
        if (p.type === 'dot') {
          g.globalCompositeOperation = 'lighter';
          g.globalAlpha = a * (0.55 + 0.45 * Math.sin(p.age * 0.1 + p.tw));
          const s = p.r * 7;
          g.drawImage(spr, p.x - s / 2, p.y - s / 2, s, s);
        } else {
          g.globalCompositeOperation = 'source-over';
          g.globalAlpha = a;
          g.save();
          g.translate(p.x, p.y);
          g.rotate(p.rot);
          g.scale(1, Math.cos(p.fl));
          g.fillStyle = p.c;
          g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          g.restore();
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    /* Đạo diễn mở phong bì mượt mà, phản hồi tức thì */
    let busy = 0;
    let autoEnterTimer = null;

    async function openEnvelope(e) {
      if (e) e.stopPropagation();
      if (busy) return;
      busy = 1;
      buzz([15, 35, 20]);

      // Khởi chạy âm thanh ngay trong sự kiện chạm đầu tiên để iOS/Android mở khóa Audio 100%
      if (typeof window.__playChime === 'function') window.__playChime();
      if (typeof window.__playMusic === 'function') window.__playMusic();

      const seal = st.querySelector('.seal');
      const r = seal ? seal.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      const x = (r.left + r.width / 2) * D;
      const y = (r.top + r.height / 2) * D;

      st.classList.add('crack');
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }

      if (!calm) {
        sparks(x, y, 22);
        for (let i = 0; i < 12; i++) {
          const a = R() * 6.28;
          const s = (2 + R() * 4.5) * D;
          add({
            x,
            y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s - 1.8 * D,
            g: 0.26 * D,
            d: 0.985,
            type: 'rect',
            w: (4 + R() * 5) * D,
            h: (3 + R() * 4) * D,
            c: i % 2 ? '#8e1a14' : '#b3261e',
            life: 70,
            vr: (R() - 0.5) * 0.35,
            vf: 0.18,
            fl: R() * 6,
          });
        }
      }

      await wait(220);
      st.classList.add('open');

      await wait(320);
      st.classList.add('rise');

      await wait(420);
      st.classList.add('reveal', 'ready');
      buzz(12);
      if (!calm) confetti(W / 2, H * 0.5, 34);

      // Tự động chuyển mượt vào thiệp chính sau 1.45s (hoặc khách chạm vào thiệp bất kỳ lúc nào)
      autoEnterTimer = setTimeout(() => {
        enterInvitation();
      }, 1450);
    }

    async function enterInvitation(e) {
      if (e) e.stopPropagation();
      if (!st.classList.contains('reveal') || st.classList.contains('leave')) return;
      if (autoEnterTimer) {
        clearTimeout(autoEnterTimer);
        autoEnterTimer = null;
      }

      buzz(10);
      st.classList.add('leave');

      // Hiệu ứng Film-Wipe Light Leak ấm áp khi chuyển sang Hero
      const lightLeak = document.getElementById('filmLightLeak');
      if (lightLeak && !calm) {
        lightLeak.classList.add('is-flashing');
        setTimeout(() => lightLeak.classList.remove('is-flashing'), 480);
      }

      // Mở khóa trang ngay khi bắt đầu dissolve để Hero Entrance chạy mượt phía dưới
      root.classList.remove('lock');
      document.body.classList.remove('invite-closed');
      document.body.classList.add('invite-open');

      if (window.__lenis) {
        window.__lenis.start();
      }
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }

      document.dispatchEvent(new CustomEvent('intro:done'));

      await wait(650);
      isIntroActive = false;
      try { st.remove(); } catch (_) {}
    }

    const env = st.querySelector('.env');
    const openBtn = document.getElementById('open');
    if (env) env.addEventListener('click', openEnvelope);
    if (openBtn) openBtn.addEventListener('click', openEnvelope);

    const card = st.querySelector('.card');
    const enterBtn = document.getElementById('enter');
    if (card) card.addEventListener('click', enterInvitation);
    if (enterBtn) enterBtn.addEventListener('click', enterInvitation);

    Promise.race([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      wait(800),
    ])
      .then(() => wait(60))
      .then(() => st.classList.add('go'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
