/**
 * CINEMATIC RETRO WEDDING INTRO SCRIPT
 * Màn mở phong bì thư 3D tương tác chân thực
 */

(function () {
  if (typeof window === 'undefined') return;

  function initIntro() {
    const st = document.getElementById('intro');
    if (!st) return;

    const root = document.documentElement;
    const rig = st.querySelector('.rig');
    const R = Math.random;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const buzz = (n) => navigator.vibrate && navigator.vibrate(n);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('lock');

    /* Tách chữ để hiện từng ký tự với hiệu ứng blur bay lên */
    function splitText(h) {
      if (!h) return;
      const t = h.getAttribute('data-raw') || h.textContent.trim();
      h.setAttribute('data-raw', t);
      h.textContent = '';
      h.setAttribute('aria-label', t);
      [...t].forEach((c, i) => {
        const s = document.createElement('span');
        s.textContent = c === ' ' ? '\u00a0' : c;
        s.style.setProperty('--i', i);
        s.setAttribute('aria-hidden', 'true');
        h.append(s);
      });
    }

    st.querySelectorAll('[data-split]').forEach(splitText);
    window.__splitChars = splitText;

    /* Canvas hạt: Bụi vàng, tia lửa, mảnh vỡ con dấu sáp, pháo hoa giấy confetti */
    const cv = document.getElementById('fx');
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;

    const P = [];
    const C = ['#b3261e', '#d9a441', '#f0e3c7', '#8e1a14', '#ffe2a0'];
    let W, H, D, amb = 0;

    const fit = () => {
      D = Math.min(window.devicePixelRatio || 1, 2);
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
        life: 100,
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
        const s = (1 + R() * 6) * D;
        add({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          g: 0.04 * D,
          d: 0.96,
          r: (1 + R() * 2.5) * D,
          life: 60 + R() * 40,
        });
      }
    };

    const confetti = (x, y, n) => {
      for (let i = 0; i < n; i++) {
        const a = -1.57 + (R() - 0.5) * 2.6;
        const s = (5 + R() * 11) * D;
        add({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          g: 0.17 * D,
          d: 0.965,
          type: 'rect',
          w: (5 + R() * 7) * D,
          h: (8 + R() * 10) * D,
          c: C[i % 5],
          life: 210 + R() * 120,
          vr: (R() - 0.5) * 0.3,
          vf: 0.08 + R() * 0.15,
          fl: R() * 6,
        });
      }
    };

    /* Nghiêng 3D chân thực theo cử chỉ ngón tay / chuột / con quay hồi chuyển */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const cl = (v) => Math.max(-1, Math.min(1, v));

    window.addEventListener(
      'pointermove',
      (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    window.addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma != null) {
          tx = cl(e.gamma / 28);
          ty = cl(((e.beta || 45) - 45) / 28);
        }
      },
      { passive: true }
    );

    let last = performance.now();
    function loop(t) {
      if (!st.isConnected) return;
      const dt = Math.min((t - last) / 16.7, 2.5);
      last = t;
      cx += (tx - cx) * 0.07 * dt;
      cy += (ty - cy) * 0.07 * dt;
      if (rig) {
        rig.style.transform = `perspective(1100px) rotateX(${(-cy * 5).toFixed(2)}deg) rotateY(${(cx * 7).toFixed(2)}deg)`;
      }
      st.style.setProperty('--sxp', (cx * -26).toFixed(1) + '%');

      if (!calm && amb < 34 && R() < 0.12 * dt) {
        amb++;
        add({
          x: R() * W,
          y: H + 10,
          vx: (R() - 0.5) * 0.3 * D,
          vy: -(0.3 + R() * 0.6) * D,
          d: 1,
          r: (0.8 + R() * 1.8) * D,
          life: 380 + R() * 360,
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
        p.x += p.vx * dt + (p.type === 'rect' ? Math.sin(p.age * 0.08 + p.fl) * 0.6 * D : 0);
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.fl += p.vf * dt;
        const a = Math.min(1, p.age / 20, (p.life - p.age) / 30);
        if (p.type === 'dot') {
          g.globalCompositeOperation = 'lighter';
          g.globalAlpha = a * (0.55 + 0.45 * Math.sin(p.age * 0.1 + p.tw));
          const s = p.r * 8;
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

    /* Đạo diễn: Các pha chuyển động xếp lớp mượt mà */
    let busy = 0;
    async function openEnvelope() {
      if (busy) return;
      busy = 1;
      buzz([16, 50, 26]);

      const seal = st.querySelector('.seal');
      const r = seal ? seal.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      const x = (r.left + r.width / 2) * D;
      const y = (r.top + r.height / 2) * D;

      st.classList.add('crack');
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }

      if (!calm) {
        sparks(x, y, 34);
        for (let i = 0; i < 16; i++) {
          const a = R() * 6.28;
          const s = (2 + R() * 5) * D;
          add({
            x,
            y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s - 2 * D,
            g: 0.28 * D,
            d: 0.985,
            type: 'rect',
            w: (4 + R() * 6) * D,
            h: (3 + R() * 5) * D,
            c: i % 2 ? '#8e1a14' : '#b3261e',
            life: 90,
            vr: (R() - 0.5) * 0.4,
            vf: 0.2,
            fl: R() * 6,
          });
        }
      }

      await wait(300);
      st.classList.add('open');

      await wait(800);
      st.classList.add('rise');

      await wait(1000);
      st.classList.add('reveal');
      buzz(20);
      if (!calm) confetti(W / 2, H * 0.52, 80);

      await wait(1900);
      st.classList.add('ready');
    }

    async function enterInvitation() {
      if (!st.classList.contains('ready') || st.classList.contains('leave')) return;
      buzz(12);
      st.classList.add('leave');
      if (!calm) confetti(W / 2, H * 0.5, 50);

      await wait(1600);
      st.remove();
      root.classList.remove('lock');
      document.body.classList.remove('invite-closed');
      document.body.classList.add('invite-open');

      // Kích hoạt Lenis smooth scroll
      if (window.__lenis) {
        window.__lenis.start();
      }
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }

      // Tự động phát nhạc nền hoài niệm nếu audio có sẵn
      const audio = document.getElementById('weddingAudio');
      const musicBtn = document.getElementById('musicToggleBtn');
      if (audio && audio.paused) {
        audio.play().then(() => {
          if (musicBtn) {
            musicBtn.setAttribute('aria-pressed', 'true');
            musicBtn.classList.add('is-playing');
          }
        }).catch(() => {});
      }

      document.dispatchEvent(new CustomEvent('intro:done'));
    }

    const env = st.querySelector('.env');
    const openBtn = document.getElementById('open');
    if (env) env.addEventListener('click', openEnvelope);
    if (openBtn) openBtn.addEventListener('click', openEnvelope);

    const card = st.querySelector('.card');
    const enterBtn = document.getElementById('enter');
    if (card) card.addEventListener('click', enterInvitation);
    if (enterBtn) enterBtn.addEventListener('click', enterInvitation);

    Promise.race([document.fonts.ready, wait(1600)])
      .then(() => wait(120))
      .then(() => st.classList.add('go'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
