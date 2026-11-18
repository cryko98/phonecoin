/* =========================================================
   PHONECOIN — interactions & motion
   Edit CONFIG when the contract address / socials are live.
   ========================================================= */
const CONFIG = {
  ca: "J3L6zfraT8wbzcgZv8eXTsgvcLZBys6Z63HpHTpmpump",   // leave empty to show "Coming soon"
  x: "https://x.com/phonecoin_",
  telegram: ""     // e.g. "https://t.me/phonecoin"
};

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);
  const ogShot = new URLSearchParams(location.search).has("og"); // ?og = static hero for the link-preview screenshot
  if (ogShot) document.documentElement.classList.add("og-shot");

  // 12-hour clock (AM/PM)
  const clock12 = (d) => ({ hm: (d.getHours() % 12 || 12) + ":" + String(d.getMinutes()).padStart(2, "0"), ap: d.getHours() < 12 ? "AM" : "PM" });
  const setClock = (el, d, big) => { const c = clock12(d); if (big) el.innerHTML = c.hm + "<span class=\"ampm\">" + c.ap + "</span>"; else el.textContent = c.hm + " " + c.ap; };

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------- toast ---------------- */
  const toastEl = $("#toastCa");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  }

  /* ---------------- CA + socials ---------------- */
  const caShort = CONFIG.ca ? CONFIG.ca.slice(0, 6) + "…" + CONFIG.ca.slice(-6) : "";
  $$("[data-ca]").forEach((btn) => {
    // the wide token card shows the full address; compact pills show a short form
    if (CONFIG.ca) $(".ca__value", btn).textContent = btn.classList.contains("ca--wide") ? CONFIG.ca : caShort;
    if (CONFIG.ca) btn.setAttribute("aria-label", "Copy contract address " + CONFIG.ca);
    btn.addEventListener("click", async () => {
      if (!CONFIG.ca) return toast("CA drops soon. Keep your notifications on.");
      try { await navigator.clipboard.writeText(CONFIG.ca); toast("Contract address copied."); }
      catch (e) { toast(CONFIG.ca); }
    });
  });
  // buy / chart links: straight to the live token once the CA is set
  const buyUrl = CONFIG.ca ? "https://pump.fun/coin/" + encodeURIComponent(CONFIG.ca) : "";
  const chartUrl = CONFIG.ca ? "https://dexscreener.com/solana/" + encodeURIComponent(CONFIG.ca) : "";
  $$("[data-buy]").forEach((a) => {
    const url = a.dataset.buy === "dex" ? chartUrl : buyUrl;
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    else if (a.dataset.buy === "dex") a.hidden = true;
  });
  $$("[data-social]").forEach((a) => {
    const url = a.dataset.social === "x" ? CONFIG.x : CONFIG.telegram;
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    else a.addEventListener("click", (e) => { e.preventDefault(); toast("Socials go live with the launch."); });
  });

  /* ---------------- sticky phone + drawer with a working mini phone ---------------- */
  const drawer = $("#drawer");
  const drawerTab = $("#drawerTab");
  const os = $("#os");
  const pumpUrl = CONFIG.ca ? "https://pump.fun/coin/" + encodeURIComponent(CONFIG.ca) : "https://pump.fun";
  $("#pumpLink").href = pumpUrl;
  if (CONFIG.ca) {
    $("#pumpState").textContent = "CA: " + caShort;
    $("#osWidgetSub").textContent = "Live · tap for 1m chart";
  }

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    drawerTab.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    if (lenis) lenis.stop();
    if (window.gsap && !reduce) {
      window.gsap.fromTo("#drawerDevice", { rotationY: -38, rotationX: 8, y: 80, opacity: 0 }, { rotationY: 0, rotationX: 0, y: 0, opacity: 1, duration: 1.4, delay: 0.15, ease: "expo.out" });
      window.gsap.fromTo(".pdrawer__head > *, .pdrawer__note", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, delay: 0.25, ease: "expo.out" });
      window.gsap.fromTo(".os__home .app, .os__widget", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.03, delay: 0.45, ease: "back.out(1.8)" });
    }
    setTimeout(() => $(".pdrawer__close").focus(), 50);
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    drawerTab.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    if (lenis) lenis.start();
    drawerTab.focus();
  }
  drawerTab.addEventListener("click", openDrawer);
  $$("[data-close]", drawer).forEach((el) => el.addEventListener("click", closeDrawer));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer(); });

  // phone tilts with the pointer
  if (window.gsap && finePointer && !reduce) {
    const dev = $("#drawerDevice");
    const tx = window.gsap.quickTo(dev, "rotationY", { duration: 0.8, ease: "power3.out" });
    const ty = window.gsap.quickTo(dev, "rotationX", { duration: 0.8, ease: "power3.out" });
    const stage = $(".pdrawer__stage");
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      tx(((e.clientX - r.left) / r.width - 0.5) * 16);
      ty(((e.clientY - r.top) / r.height - 0.5) * -10);
    });
    stage.addEventListener("pointerleave", () => { tx(0); ty(0); });
  }

  // --- OS navigation ---
  const screens = $$(".os__screen", os);
  const home = $(".os__home", os);
  function openApp(name) {
    const target = screens.find((s) => s.dataset.screen === name);
    if (!target) return;
    screens.forEach((s) => s.classList.toggle("is-active", s === target));
    home.classList.toggle("is-behind", name !== "home");
    os.classList.toggle("in-app", name !== "home");
    os.classList.toggle("is-dark", target.classList.contains("os__app--dark"));
    if (name === "chart") loadChart();
    if (name === "msgs") setTimeout(() => { const l = $("#chatLog"); l.scrollTop = l.scrollHeight; }, 50);
  }
  $$("[data-open]", os).forEach((b) => b.addEventListener("click", () => openApp(b.dataset.open)));
  $$("[data-home]", os).forEach((b) => b.addEventListener("click", () => { openApp("home"); $("#calling").hidden = true; $("#osPhotoView").hidden = true; }));
  $$("[data-link]", os).forEach((b) => b.addEventListener("click", () => {
    const url = b.dataset.link === "x" ? CONFIG.x : CONFIG.telegram;
    if (url) window.open(url, "_blank", "noopener");
    else toast("Socials go live with the launch.");
  }));

  // --- chart app: DexScreener embed with 1-minute candles (pump.fun blocks iframes) ---
  let chartLoaded = false;
  function loadChart() {
    if (!CONFIG.ca || chartLoaded) return;
    chartLoaded = true;
    $("#pdFrame").src = "https://dexscreener.com/solana/" + encodeURIComponent(CONFIG.ca) +
      "?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=1";
    $("#pdFrameWrap").hidden = false;
    $("#pdSoon").hidden = true;
  }

  // --- photos app ---
  const photos = $("#osPhotos");
  const viewer = $("#osPhotoView");
  ["assets/img/logo-phone.jpg", "assets/img/cooper-dynatac.jpg", "assets/img/obama-biden-iphone.jpg"]
    .concat((window.PHONE_GALLERY || []).map((p) => "assets/people/" + encodeURI(p.file)))
    .forEach((src) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = `<img src="${src}" alt="" loading="lazy" />`;
      $("img", b).addEventListener("error", () => b.remove());
      b.addEventListener("click", () => { $("img", viewer).src = src; viewer.hidden = false; });
      photos.appendChild(b);
    });
  viewer.addEventListener("click", () => (viewer.hidden = true));

  // --- calculator app (no eval) ---
  const out = $("#calcOut");
  let cur = "0", acc = null, op = null, fresh = false;
  const fmt = (n) => { if (!isFinite(n)) return "Error"; const s = String(+n.toPrecision(10)); return s.length > 11 ? n.toExponential(4) : s; };
  const apply = (a, b, o) => o === "+" ? a + b : o === "-" ? a - b : o === "*" ? a * b : o === "/" ? a / b : b;
  $("#calcKeys").addEventListener("click", (e) => {
    const k = e.target.closest("button")?.dataset.k;
    if (!k) return;
    $$(".k--op", $("#calcKeys")).forEach((b) => b.classList.remove("is-on"));
    if (/[0-9]/.test(k)) { cur = fresh || cur === "0" ? k : (cur.length < 11 ? cur + k : cur); fresh = false; }
    else if (k === ".") { if (fresh) { cur = "0"; fresh = false; } if (!cur.includes(".")) cur += "."; }
    else if (k === "C") { cur = "0"; acc = null; op = null; }
    else if (k === "±") { cur = fmt(-parseFloat(cur)); }
    else if (k === "%") { cur = fmt(parseFloat(cur) / 100); }
    else if (k === "=") { if (op !== null && acc !== null) { cur = fmt(apply(acc, parseFloat(cur), op)); acc = null; op = null; fresh = true; } }
    else { // operator
      if (op !== null && acc !== null && !fresh) cur = fmt(apply(acc, parseFloat(cur), op));
      acc = parseFloat(cur); op = k; fresh = true;
      e.target.closest("button").classList.add("is-on");
    }
    out.textContent = cur;
  });

  // --- settings app ---
  const notify = $("#pdNotify");
  try { if (localStorage.getItem("phone-notify") === "1") notify.setAttribute("aria-pressed", "true"); } catch (e) {}
  let wallIdx = 0;
  $$("[data-toggle]", os).forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.toggle;
    if (t === "wallpaper") { wallIdx = (wallIdx + 1) % 3; os.dataset.wall = wallIdx; return; }
    const on = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(on));
    if (t === "notify") {
      try { localStorage.setItem("phone-notify", on ? "1" : "0"); } catch (e) {}
      toast(on ? "Noted. Keep your phone close." : "Notifications off. Brave.");
    }
    if (t === "airplane" && on) setTimeout(() => { b.setAttribute("aria-pressed", "false"); toast("Airplane mode lasted 0.8 seconds. Classic."); }, 800);
  }));

  // --- messages app ---
  const chatLog = $("#chatLog");
  const replies = [
    "based", "ser this is the way", "phone in one hand, $PHONE in the other",
    "just checked the chart. in the shower. again.", "wen CA? asking for my thumb",
    "my screen time report called me a degen", "battery at 3%. still here.",
    "i'd sell my car before my phone", "gm from the toilet", "notifications on. sleep off."
  ];
  const addMsg = (text, cls) => {
    const d = document.createElement("div");
    d.className = "msg " + cls;
    if (cls.includes("typing")) d.innerHTML = "<i></i><i></i><i></i>"; else d.textContent = text;
    chatLog.appendChild(d);
    chatLog.scrollTop = chatLog.scrollHeight;
    return d;
  };
  $("#chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chatInput");
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, "msg--out");
    input.value = "";
    const typing = setTimeout(() => {
      const t = addMsg("", "msg--in msg--typing");
      setTimeout(() => { t.remove(); addMsg(replies[Math.floor(Math.random() * replies.length)], "msg--in"); }, 1100);
    }, 400);
    void typing;
  });

  // --- phone app ---
  let callTimer = null;
  $$("[data-call]", os).forEach((b) => b.addEventListener("click", () => {
    $("#callAv").textContent = b.dataset.call[0] === "Y" ? "B" : b.dataset.call.replace("The ", "")[0];
    $("#callName").textContent = b.dataset.call;
    $("#callState").textContent = "calling…";
    $("#calling").hidden = false;
    clearTimeout(callTimer);
    callTimer = setTimeout(() => { $("#callState").textContent = b.dataset.line; }, 2200);
  }));
  $("#callEnd").addEventListener("click", () => { clearTimeout(callTimer); $("#calling").hidden = true; });

  // clocks + date on the mini phone
  const syncClocks = () => {
    const d = new Date();
    $$(".js-clock").forEach((c) => setClock(c, d, c.classList.contains("os__time")));
    $$(".js-date").forEach((c) => (c.textContent = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })));
  };
  syncClocks(); setInterval(syncClocks, 15000);

  /* ---------------- Hall of Fame + credits ---------------- */
  const commons = (f) => "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(f.replace(/ /g, "_"));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wall = $("#wall");
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  (window.PHONE_GALLERY || []).forEach((p, i) => {
    const heading = p.name || p.title || "";
    const fig = document.createElement("figure");
    fig.className = "star is-empty";
    fig.innerHTML =
      `<div class="star__img">
         ${p.tag ? `<span class="star__tag">${esc(p.tag)}</span>` : ""}
         <div class="star__ph" aria-hidden="true">
           <div class="star__ph-phone"><span>${esc(initials(heading) || "$P")}</span></div>
           <small>assets/people/${esc(p.file)}</small>
         </div>
       </div>
       <figcaption><b>${esc(heading)}</b><span>${esc(p.text || "")}</span></figcaption>`;
    fig.style.setProperty("--hue", (i * 37) % 360);
    wall.appendChild(fig);
    const img = new Image();
    img.alt = (p.name ? p.name + " " : "Someone ") + "holding a phone";
    img.decoding = "async";
    img.onload = () => {
      fig.classList.remove("is-empty");
      $(".star__ph", fig).remove();
      $(".star__img", fig).appendChild(img);
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };
    img.src = "assets/people/" + encodeURI(p.file);
  });

  const credits = $("#credits");
  (window.PHONE_CREDITS || []).forEach((c) => {
    const li = document.createElement("li");
    const lic = c.licenseUrl ? `<a href="${c.licenseUrl}" target="_blank" rel="noopener">${esc(c.license)}</a>` : esc(c.license);
    li.innerHTML = `${esc(c.what)} — <a href="${commons(c.file)}" target="_blank" rel="noopener">${esc(c.file)}</a> by ${esc(c.author)}, ${lic}. Cropped and resized for the web.`;
    credits.appendChild(li);
  });

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis && !reduce && !ogShot) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    if (G && ST) {
      lenis.on("scroll", ST.update);
      G.ticker.add((t) => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.6 });
      else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------------- lock screen ---------------- */
  const lock = $("#lock");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function tickClock() {
    const d = new Date();
    setClock($("#lockTime"), d, true);
    $("#lockDate").textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    const tc = $("#tradeClock"); if (tc) setClock(tc, d, false);
  }
  tickClock(); setInterval(tickClock, 15000);

  let unlocked = false;
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    store.set("phone-unlocked", "1");
    document.body.classList.remove("is-loading");
    if (lenis) lenis.start();
    if (G && !reduce) {
      G.timeline()
        .to(".lock__notes .note", { y: -30, opacity: 0, stagger: 0.05, duration: 0.35, ease: "power2.in" })
        .to(lock, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.1")
        .add(heroIntro, "-=0.55")
        .set(lock, { display: "none" });
    } else {
      lock.style.display = "none";
      heroIntro();
    }
  }
  if (store.get("phone-unlocked") || reduce || ogShot) {
    lock.style.display = "none";
    document.body.classList.remove("is-loading");
    unlocked = true;
    requestAnimationFrame(() => heroIntro());
  } else {
    if (lenis) lenis.stop();
    if (G) {
      G.from(".lock__top", { y: 30, opacity: 0, duration: 1, ease: "power3.out" });
      G.from(".lock__notes .note", { y: 40, opacity: 0, scale: 0.94, stagger: 0.18, delay: 0.35, duration: 0.8, ease: "back.out(1.6)" });
      G.from(".lock__unlock", { y: 20, opacity: 0, delay: 0.9, duration: 0.8, ease: "power3.out" });
    }
    $("#unlock").addEventListener("click", unlock);
    lock.addEventListener("wheel", unlock, { passive: true });
    let ty = null;
    lock.addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; }, { passive: true });
    lock.addEventListener("touchmove", (e) => { if (ty !== null && ty - e.touches[0].clientY > 30) unlock(); }, { passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    setTimeout(unlock, 3600);
  }

  /* ---------------- split helpers ---------------- */
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
            else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$(".w", el);
  }

  /* ---------------- hero intro ---------------- */
  let heroDone = false;
  function heroIntro() {
    if (heroDone) return; heroDone = true;
    if (!G || reduce || ogShot) return;
    const tl = G.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".hero__word", { yPercent: 35, scale: 0.92, opacity: 0, filter: "blur(24px)", duration: 1.8, stagger: 0.14 }, 0)
            .from("#heroPhone", { y: 120, scale: 0.82, rotate: -8, opacity: 0, duration: 1.8 }, 0.1)
      .from(".float", { scale: 0.6, opacity: 0, duration: 1.1, stagger: 0.09, ease: "back.out(1.8)" }, 0.6)
      .from(".reveal-up", { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.5)
      .from(".nav", { opacity: 0, duration: 1 }, 0.4);
  }

  /* ---------------- hero pointer parallax ---------------- */
  const phone = $("#heroPhone");
  const floats = $$(".float");
  if (G && finePointer && !reduce) {
    const rx = G.quickTo(phone, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = G.quickTo(phone, "rotationY", { duration: 0.8, ease: "power3.out" });
    const fq = floats.map((f) => ({
      d: parseFloat(f.dataset.depth || 1),
      x: G.quickTo(f, "x", { duration: 1, ease: "power3.out" }),
      y: G.quickTo(f, "y", { duration: 1, ease: "power3.out" })
    }));
    G.set(phone, { transformPerspective: 1100 });
    $("#hero").addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      rx(-ny * 16); ry(nx * 20);
      phone.style.setProperty("--gx", 50 + nx * 80 + "%");
      phone.style.setProperty("--gy", 30 + ny * 80 + "%");
      fq.forEach((q) => { q.x(nx * 30 * q.d); q.y(ny * 24 * q.d); });
    });
  }

  if (!G || !ST) {
    // graceful fallback: no GSAP — show everything statically
    $$(".lore__text").forEach((el) => splitWords(el).forEach((w) => (w.style.opacity = 1)));
    $$("[data-count]").forEach((el) => (el.textContent = format(el)));
    startStaticDay();
    startCharts();
    startToasts();
    startTimer();
    return;
  }

  /* ---------------- hero scroll-out ---------------- */
  if (!reduce) {
    G.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } })
      .to(".hero__word--back", { xPercent: -18, opacity: 0.25, ease: "none" }, 0)
      .to(".hero__word--front", { xPercent: 18, opacity: 0.25, ease: "none" }, 0)
      .to(".hero__stage", { yPercent: 18, scale: 1.12, ease: "none" }, 0)
      .to(".hero__bottom", { yPercent: 40, opacity: 0, ease: "none" }, 0);
  }

  /* ---------------- nav behaviour ---------------- */
  const nav = $("#nav");
  let lastY = 0;
  ST.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-hidden", y > 300 && y > lastY && self.direction === 1);
      lastY = y;
    }
  });
  ST.create({ trigger: "#trade", start: "top 60px", end: "bottom 60px", toggleClass: { targets: nav, className: "is-dark" } });

  /* ---------------- lore words ---------------- */
  $$("[data-words]").forEach((el) => {
    const words = splitWords(el);
    if (reduce) { words.forEach((w) => (w.style.opacity = 1)); return; }
    G.to(words, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 }
    });
  });

  /* ---------------- counters ---------------- */
  function format(el, v) {
    const target = parseFloat(el.dataset.count);
    const val = v === undefined ? target : v;
    const n = Math.round(val);
    const txt = el.hasAttribute("data-sep") ? n.toLocaleString("en-US") : String(n);
    return txt + (el.dataset.suffix || "");
  }
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const from = target === 0 ? 100 : 0; // "0 people" counts *down* from 100
    const o = { v: from };
    el.textContent = format(el, from);
    ST.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => G.to(o, { v: target, duration: target === 0 ? 2.4 : 2, ease: "power3.out", onUpdate: () => (el.textContent = format(el, o.v)) })
    });
  });

  $$(".stat").forEach((s, i) => G.from(s, { y: 60, opacity: 0, duration: 1.1, delay: i * 0.1, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 90%" } }));

  /* ---------------- 24h pinned day ---------------- */
  const daySteps = $$(".day__step");
  const dayScreens = $$(".scr");
  const dayBar = $("#dayBar");
  const daySection = $("#day");
  let dayIdx = 0;
  function setDay(i) {
    if (i === dayIdx) return;
    dayIdx = i;
    daySteps.forEach((s, k) => s.classList.toggle("is-active", k === i));
    dayScreens.forEach((s, k) => s.classList.toggle("is-active", k === i));
    const night = i === daySteps.length - 1;
    daySection.classList.toggle("is-night", night);
    nav.classList.toggle("is-dark", night);
    const step = daySteps[i];
    G.fromTo(step.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "expo.out", overwrite: true });
  }
  ST.create({
    trigger: ".day__pin",
    start: "top top",
    end: () => "+=" + innerHeight * 4.2,
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const n = daySteps.length;
      setDay(Math.min(n - 1, Math.floor(self.progress * n * 0.999)));
      dayBar.style.width = (self.progress * 100).toFixed(1) + "%";
    },
    onLeave: () => nav.classList.remove("is-dark"),
    onLeaveBack: () => nav.classList.remove("is-dark")
  });
  if (!reduce) {
    G.fromTo("#dayDevice", { rotationY: -16, rotationX: 6, transformPerspective: 1400 }, {
      rotationY: 16, rotationX: -4, ease: "none",
      scrollTrigger: { trigger: ".day", start: "top top", end: () => "+=" + innerHeight * 4.2, scrub: 1 }
    });
  }

  /* ---------------- most held asset ---------------- */
  G.from(".held__title > *", { yPercent: 70, opacity: 0, rotate: 3, stagger: 0.1, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".held__title", start: "top 80%" } });
  G.from(".held__lead, .held__live, .held .kicker", { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".held__title", start: "top 75%" } });
  G.from(".board__row, .board__top", { x: -40, opacity: 0, stagger: 0.07, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".board", start: "top 80%" } });
  G.from(".places__title", { y: 50, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".places__title", start: "top 85%" } });
  const placeCards = $$(".place");
  G.set(placeCards, { y: 90, opacity: 0, rotate: () => G.utils.random(-5, 5) });
  ST.batch(placeCards, { start: "top 90%", onEnter: (b) => G.to(b, { y: 0, opacity: 1, rotate: 0, stagger: 0.1, duration: 1.2, ease: "back.out(1.4)", clearProps: "transform" }) });
  G.from(".meter__bar i", { scaleX: 0, stagger: 0.25, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: ".meter", start: "top 85%" } });
  G.from(".held__strip > *", { y: 30, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".held__strip", start: "top 90%" } });
  // live "holders" counter that never stops ticking up
  const heldEl = $("#heldCount");
  let holders = 5000000000;
  setInterval(() => { holders += Math.floor(Math.random() * 40) + 3; heldEl.textContent = holders.toLocaleString("en-US"); }, 160);

  /* ---------------- evolution horizontal ---------------- */
  const mm = G.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const track = $("#evoTrack");
    const dist = () => track.scrollWidth - innerWidth;
    const tween = G.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".evo__pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    $$(".era").forEach((card) => {
      const img = $(".era__media img", card);
      const dev = $(".dev, .mini-device", card);
      if (img) G.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      if (dev) G.fromTo(dev, { rotate: -10, y: 30 }, { rotate: 8, y: -20, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      G.from($(".era__year", card), { yPercent: 60, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 85%" } });
    });
  });
  G.from(".evo__head > *", { y: 40, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".evo", start: "top 70%" } });

  /* ---------------- section heads ---------------- */
  $$(".famous .section-head > *, .buy .section-head > *, .trade__copy > *").forEach((el) => {
    G.from(el, { y: 50, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* ---------------- hall of fame ---------------- */
  const stars = $$(".star");
  G.set(stars, { y: 80, opacity: 0, rotate: () => G.utils.random(-3, 3) });
  ST.batch(stars, {
    start: "top 92%",
    onEnter: (b) => G.to(b, { y: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" })
  });
  if (finePointer && !reduce) {
    stars.forEach((card) => {
      const rX = G.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      const rY = G.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      G.set(card, { transformPerspective: 900 });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        rX((0.5 - y) * 10); rY((x - 0.5) * 12);
        card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
      });
      card.addEventListener("pointerleave", () => { rX(0); rY(0); });
    });
  }

  /* ---------------- trade device ---------------- */
  G.from(".device--trade", { y: 120, rotationY: -25, rotationX: 10, transformPerspective: 1400, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".trade", start: "top 60%" } });
  $$(".feat").forEach((f, i) => G.from(f, { y: 40, opacity: 0, duration: 1, delay: i * 0.08, ease: "expo.out", scrollTrigger: { trigger: ".features", start: "top 85%" } }));

  /* ---------------- how to buy ---------------- */
  G.from(".step", { y: 80, opacity: 0, rotationX: 25, transformPerspective: 1000, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".steps", start: "top 80%" } });
  G.from(".token", { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".token", start: "top 88%" } });
  if (finePointer && !reduce) {
    $$(".tilt").forEach((card) => {
      const rX = G.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      const rY = G.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        rX(((e.clientY - r.top) / r.height - 0.5) * -12);
        rY(((e.clientX - r.left) / r.width - 0.5) * 14);
      });
      card.addEventListener("pointerleave", () => { rX(0); rY(0); });
    });
  }

  /* ---------------- final ---------------- */
  G.from(".final__title > *", { yPercent: 110, opacity: 0, rotate: 4, stagger: 0.1, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".final", start: "top 65%" } });
  G.from(".final__cta > *, .final__timer", { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".final", start: "top 55%" } });

  /* ---------------- magnetic buttons ---------------- */
  if (finePointer && !reduce) {
    $$(".magnetic").forEach((b) => {
      const mx = G.quickTo(b, "x", { duration: 0.5, ease: "power3.out" });
      const my = G.quickTo(b, "y", { duration: 0.5, ease: "power3.out" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.28);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
  }

  startCharts();
  startToasts();
  startTimer();
  window.addEventListener("load", () => ST.refresh());

  /* =========================================================
     helpers below (hoisted)
     ========================================================= */
  function startStaticDay() {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % daySteps.length;
      daySteps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      dayScreens.forEach((s, k) => s.classList.toggle("is-active", k === i));
    }, 3000);
  }

  function startTimer() {
    const el = $("#siteTime");
    const t0 = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      el.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    }, 1000);
  }

  function startToasts() {
    const box = $("#toasts");
    if (!box) return;
    const msgs = [
      ["f-ico--green", "trend", "$PHONE", "+12.4% in 5 minutes"],
      ["f-ico--violet", "swap", "Swap confirmed", "1 SOL for $PHONE · 0.4s"],
      ["f-ico--blue", "chat", "group chat", "ser the chart is going vertical"],
      ["f-ico--peach", "hourglass", "Screen Time", "You've been up for 21 hours"],
      ["f-ico--red", "battery", "Battery 4%", "plug in. do not miss this."],
      ["f-ico--green", "up", "New ATH", "$PHONE just printed a fresh high"]
    ];
    let i = 0, timer = null;
    const push = () => {
      const [cls, ico, t, s] = msgs[i++ % msgs.length];
      const el = document.createElement("div");
      el.className = "toast";
      el.innerHTML = `<span class="f-ico ${cls}"><svg class="i" aria-hidden="true"><use href="#i-${ico}"/></svg></span><div><b>${t}</b><small>${s}</small></div>`;
      box.prepend(el);
      if (G) G.from(el, { y: -20, opacity: 0, scale: 0.9, duration: 0.7, ease: "back.out(1.7)" });
      const kids = box.children;
      if (kids.length > 3) {
        const last = kids[kids.length - 1];
        if (G) G.to(last, { opacity: 0, duration: 0.3, onComplete: () => last.remove() }); else last.remove();
      }
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) { push(); timer = setInterval(push, 2200); }
      else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }).observe(box);
  }

  /* ---------------- candle charts ---------------- */
  function startCharts() {
    const priceEl = $("#ttPrice"), chEl = $("#ttChange"), recvEl = $("#ttReceive");
    makeChart($("#tradeChart"), { candles: 34, onTick: (p, open) => {
      priceEl.textContent = "$" + p.toFixed(6);
      const pct = ((p / open) - 1) * 100;
      chEl.innerHTML = `<svg class="i" aria-hidden="true"><use href="#i-${pct >= 0 ? "up" : "down"}"/></svg> ` + Math.abs(pct).toFixed(2) + "%";
      chEl.style.color = pct >= 0 ? "#7ef0b4" : "#ff6b7d";
      recvEl.textContent = Math.round(17.69 / p).toLocaleString("en-US") + " $PHONE";
    } });
    makeChart($("#dayChart"), { candles: 22 });
    $$(".evo-chart").forEach((c) => makeChart(c, { candles: 18, grid: false }));
  }

  function makeChart(canvas, opts) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const N = opts.candles || 30;
    let data = [];
    let p = 0.0021;
    const open0 = p;
    for (let i = 0; i < N; i++) data.push(candle());
    function candle() {
      const o = p;
      const drift = 1 + (Math.random() - 0.38) * 0.09;
      const c = o * drift;
      const h = Math.max(o, c) * (1 + Math.random() * 0.03);
      const l = Math.min(o, c) * (1 - Math.random() * 0.03);
      p = c;
      return { o, c, h, l };
    }
    let w = 0, h = 0, dpr = 1;
    function size() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }
    function draw() {
      if (!w && !size()) return;
      ctx.clearRect(0, 0, w, h);
      const pad = 10, top = 14, bottom = 14;
      let max = -Infinity, min = Infinity;
      data.forEach((d) => { max = Math.max(max, d.h); min = Math.min(min, d.l); });
      const y = (v) => top + (1 - (v - min) / (max - min || 1)) * (h - top - bottom);
      if (opts.grid !== false) {
        ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1;
        for (let g = 1; g < 5; g++) { const gy = (h / 5) * g; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      }
      const cw = (w - pad * 2) / N;
      // area glow under closes
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(126,240,180,.28)"); grad.addColorStop(1, "rgba(126,240,180,0)");
      ctx.beginPath();
      data.forEach((d, i) => { const x = pad + i * cw + cw / 2; i ? ctx.lineTo(x, y(d.c)) : ctx.moveTo(x, y(d.c)); });
      ctx.lineTo(pad + (N - 0.5) * cw, h); ctx.lineTo(pad + cw / 2, h); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      data.forEach((d, i) => {
        const x = pad + i * cw;
        const up = d.c >= d.o;
        const col = up ? "#7ef0b4" : "#ff6b7d";
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x + cw / 2, y(d.h)); ctx.lineTo(x + cw / 2, y(d.l)); ctx.stroke();
        const by = y(Math.max(d.o, d.c)), bh = Math.max(1.5, Math.abs(y(d.o) - y(d.c)));
        ctx.shadowColor = col; ctx.shadowBlur = i === N - 1 ? 14 : 0;
        roundRect(ctx, x + cw * 0.18, by, cw * 0.64, bh, Math.min(2, cw * 0.15));
        ctx.fill(); ctx.shadowBlur = 0;
      });
      const last = data[N - 1];
      const ly = y(last.c);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(156,210,255,.55)";
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke(); ctx.setLineDash([]);
    }
    function roundRect(c, x, y, w2, h2, r) {
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w2, y, x + w2, y + h2, r); c.arcTo(x + w2, y + h2, x, y + h2, r);
      c.arcTo(x, y + h2, x, y, r); c.arcTo(x, y, x + w2, y, r); c.closePath();
    }
    let ticks = 0, timer = null;
    function tick() {
      const last = data[N - 1];
      // jiggle the live candle, new candle every 5 ticks
      if (++ticks % 5 === 0) {
        data.shift(); data.push(candle());
        // keep it a memecoin: occasional pump, keep price in a sane band
        if (p > open0 * 6) p *= 0.85;
      } else {
        const c = last.c * (1 + (Math.random() - 0.42) * 0.02);
        last.c = c; last.h = Math.max(last.h, c); last.l = Math.min(last.l, c); p = c;
      }
      draw();
      if (opts.onTick) opts.onTick(data[N - 1].c, open0);
    }
    window.addEventListener("resize", () => { w = 0; draw(); });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!w) size(); draw(); if (!timer && !reduce) timer = setInterval(tick, 650); }
      else if (timer) { clearInterval(timer); timer = null; }
    }).observe(canvas);
  }
})();
