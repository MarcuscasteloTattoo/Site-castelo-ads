/* =========================================================
   Castelo Ads — scripts do site (JavaScript puro, sem bibliotecas)
   Os textos de cada idioma ficam em js/i18n.js
   ========================================================= */

/* ---------- CONFIGURAÇÕES: edite aqui ---------- */
const CONFIG = {
  // Número do WhatsApp com código do país, só dígitos (ex.: "5511999999999").
  // Vazio = abre o WhatsApp sem destinatário, como no site atual.
  whatsappNumber: "",
  // Link do Instagram para o rodapé. Vazio = não mostra o link.
  instagramUrl: "",
  // Webhook do Make que recebe os cadastros do formulário.
  webhookUrl: "https://hook.eu2.make.com/jfopy8cccgr4emp1x6usedxgdetixdco",
  // Como os vídeos aparecem:
  // "embed" = o vídeo toca dentro da página (use na sua hospedagem).
  // "link"  = card que abre o vídeo no Vimeo em outra aba (para ambientes que bloqueiam o player).
  videoMode: "embed",
  // Idioma principal do site: "pt", "en" ou "es".
  defaultLang: "pt",
};

/* Países do letreiro animado (bandeiras em flags/<código>-160.png; nomes em js/i18n.js) */
const COUNTRIES = ["br", "us", "ie", "es", "pt", "gb-eng", "it", "de", "fr", "ch", "be", "au", "nl", "ca", "ar"];

/* Depoimentos em vídeo (Vimeo) — o nome do país vem de js/i18n.js pelo countryCode */
const VIDEOS = [
  { vimeoId: "1233716415", name: "Fabrícia", countryCode: "us" },
  { vimeoId: "1233716386", name: "Rafael Luzart", countryCode: "br", city: "Florianópolis" },
  { vimeoId: "1186994993", name: "Minas Tattoo", countryCode: "br", city: "Belo Horizonte" },
  { vimeoId: "1233716136", name: "Letícia", countryCode: "pt", city: "Lisboa" },
  { vimeoId: "1233716043", name: "Fernanda Miranda", countryCode: "br", city: "Brasília" },
  { vimeoId: "1186995184", name: "Júlia Cocentino", countryCode: "es" },
  { vimeoId: "1186995089", name: "Babi Selez", countryCode: "fr", city: "Paris" },
  { vimeoId: "1233739358", name: "Pedro Cardoso", countryCode: "br", city: "Florianópolis" },
];

/* Prints de resultados: [arquivo em img/, nome exibido, bandeira] — descrições em js/i18n.js (lista "prints") */
const PRINTS = [
  ["depoimento-01", "Fernanda Miranda", "br"], ["depoimento-02", "Emerson Bastos", "br"],
  ["depoimento-03", "Imad Tattoo", "br"], ["depoimento-04", "Imad Tattoo", "br"],
  ["depoimento-05", "Fabrícia", "us"], ["depoimento-06", "Fabrícia", "us"],
  ["depoimento-07", "Thiago Valsechi", "br"], ["depoimento-08", "Tatiana", "br"],
  ["depoimento-09", "Gabriel Moreira", "br"], ["depoimento-10", "Letícia", "pt"],
  ["depoimento-11", "Letícia", "pt"], ["depoimento-12", "Júlia Brígida", "br"],
  ["depoimento-13", "Letícia", "pt"], ["depoimento-14", "Fernanda Miranda", "br"],
  ["depoimento-15", "Thiago Valsechi", "br"], ["depoimento-16", "Gabriel Moreira", "br"],
];

/* Códigos de telefone: [bandeira, DDI, máscara] — "9" = dígito */
const PHONE_COUNTRIES = [
  ["br", "+55", "(99) 99999-9999"], ["pt", "+351", "999 999 999"], ["es", "+34", "999 99 99 99"],
  ["ie", "+353", "99 999 9999"], ["gb", "+44", "9999 999999"], ["us", "+1", "(999) 999-9999"],
  ["it", "+39", "999 999 9999"], ["de", "+49", "9999 9999999"], ["fr", "+33", "9 99 99 99 99"],
  ["ch", "+41", "99 999 99 99"], ["be", "+32", "999 99 99 99"], ["au", "+61", "999 999 999"],
  ["nl", "+31", "9 99999999"], ["se", "+46", "99 999 99 99"], ["ca", "+1", "(999) 999-9999"],
  ["ar", "+54", "99 9999-9999"],
];

/* ---------- Utilitários ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const el = (tag, attrs = {}, html = "") => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (html) node.innerHTML = html;
  return node;
};
const icon = (name, cls = "icon") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/* ---------- Idiomas ---------- */
const LANGS = { pt: "pt-BR", en: "en", es: "es" };
let lang = CONFIG.defaultLang;
const dict = () => I18N[lang] || I18N.pt;
const t = (key, vars = {}) => {
  let s = dict()[key] ?? I18N.pt[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
};
const countryName = (code) => dict().countries[code] || I18N.pt.countries[code] || code;
const cityName = (city) => (city && dict().cities[city]) || city;
const onLangChange = [];

function setLang(next, save = true) {
  if (!I18N[next]) next = CONFIG.defaultLang;
  lang = next;
  document.documentElement.lang = LANGS[lang];
  document.title = t("meta.title");
  $('meta[name="description"]')?.setAttribute("content", t("meta.description"));

  $$("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
  $$("[data-i18n-html]").forEach((n) => { n.innerHTML = t(n.dataset.i18nHtml); });
  $$("[data-i18n-attr]").forEach((n) => {
    n.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      n.setAttribute(attr.trim(), t(key.trim()));
    });
  });
  $$(".lang-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  onLangChange.forEach((fn) => fn());

  if (save) { try { localStorage.setItem("castelo_lang", lang); } catch {} }
}

function initialLang() {
  // 1) ?lang=en ou #en / #es / #pt no endereço  2) escolha salva  3) idioma principal
  const q = new URLSearchParams(location.search).get("lang");
  const h = location.hash.replace("#", "");
  if (I18N[q]) return q;
  if (I18N[h]) return h;
  try { const saved = localStorage.getItem("castelo_lang"); if (I18N[saved]) return saved; } catch {}
  return CONFIG.defaultLang;
}

$$(".lang-btn").forEach((b) => b.addEventListener("click", () => {
  setLang(b.dataset.lang);
  window.dataLayer?.push({ event: "language_change", language: b.dataset.lang });
}));

/* Rastreamento (Google Tag Manager / Meta Pixel, se instalados) */
function track(event, source) {
  window.dataLayer?.push({ event, source });
  if (event === "cta_form") window.fbq?.("trackCustom", "CTAtoForm", { source });
}

/* ---------- Hero: partículas douradas ---------- */
(function heroParticles() {
  const layers = $(".hero-layers");
  if (!layers) return;
  for (let i = 0; i < 18; i++) {
    const s = el("span", { class: "hero-particle" });
    const size = 2 + (i % 3) + "px";
    Object.assign(s.style, {
      left: ((i * 53) % 100) + "%",
      animationDelay: ((i * 1.7) % 12) + "s",
      animationDuration: 12 + ((i * 7) % 10) + "s",
      width: size, height: size,
    });
    layers.appendChild(s);
  }
})();

/* ---------- Globo: pausa quando sai da tela ---------- */
(function globe() {
  const g = $("#globe");
  if (!g || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(([e]) => g.classList.toggle("paused", !e.isIntersecting)).observe(g);
})();

/* ---------- Letreiro de países ---------- */
(function marquee() {
  const m = $("#marquee");
  if (!m) return;
  [...COUNTRIES, ...COUNTRIES].forEach((code, i) => {
    const dup = i >= COUNTRIES.length;
    const item = el("div", { class: "country" });
    item.innerHTML = `<img src="flags/${code}-160.png" alt="" width="64" height="64" ${dup ? 'aria-hidden="true"' : ""} loading="lazy"><span data-code="${code}"></span>`;
    if (dup) item.setAttribute("aria-hidden", "true");
    m.appendChild(item);
  });
  const render = () => $$(".country", m).forEach((item) => {
    const label = $("span", item), code = label.dataset.code, name = countryName(code);
    label.innerHTML = name.split(" ").map((w) => `<span>${w}</span>`).join("");
    if (!item.hasAttribute("aria-hidden")) $("img", item).alt = t("flagOf", { name });
  });
  onLangChange.push(render);
})();

/* ---------- Carrossel genérico (rolagem com snap) ---------- */
function makeCarousel(root, { loop = false, autoplay = 0, onSelect } = {}) {
  const viewport = $(".carousel-viewport", root);
  const slides = () => [...$(".carousel-track", root).children];
  const prev = $(".carousel-btn--prev", root);
  const next = $(".carousel-btn--next", root);

  const current = () => {
    const x = viewport.scrollLeft;
    let best = 0, dist = Infinity;
    slides().forEach((s, i) => {
      const d = Math.abs(s.offsetLeft - slides()[0].offsetLeft - x);
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  };
  const atEnd = () => viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;
  const goTo = (i) => {
    const list = slides();
    i = Math.max(0, Math.min(list.length - 1, i));
    viewport.scrollTo({ left: list[i].offsetLeft - list[0].offsetLeft, behavior: "smooth" });
  };
  const go = (dir) => {
    if (dir > 0 && atEnd()) return loop && goTo(0);
    if (dir < 0 && viewport.scrollLeft <= 4) return loop && goTo(slides().length - 1);
    goTo(current() + dir);
  };
  const update = () => {
    if (!loop) {
      prev.disabled = viewport.scrollLeft <= 4;
      next.disabled = atEnd();
    }
    onSelect?.(current());
  };

  prev.addEventListener("click", () => { go(-1); restart(); });
  next.addEventListener("click", () => { go(1); restart(); });
  let raf;
  viewport.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener("resize", update);

  // Reprodução automática (pausa com o mouse em cima ou com a aba oculta)
  let timer, hover = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function restart() {
    clearInterval(timer);
    if (!autoplay || reduce) return;
    timer = setInterval(() => { if (!hover && !document.hidden) go(1); }, autoplay);
  }
  root.addEventListener("mouseenter", () => (hover = true));
  root.addEventListener("mouseleave", () => (hover = false));
  viewport.addEventListener("pointerdown", restart);

  restart();
  // Primeira medição só depois que a página carregou (evita "reflow forçado" no carregamento)
  if (document.readyState === "complete") requestAnimationFrame(update);
  else window.addEventListener("load", () => requestAnimationFrame(update), { once: true });
  return { goTo: (i) => { goTo(i); restart(); } };
}

/* ---------- Depoimentos em vídeo ---------- */
(function videos() {
  const track = $("#videos-track");
  if (!track) return;
  const params = "dnt=1&title=0&byline=0&portrait=0&playsinline=1&autoplay=1&muted=1&loop=1&controls=0&autopause=0";
  const linkMode = CONFIG.videoMode === "link";

  VIDEOS.forEach((v, i) => {
    const initials = v.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
    const slide = el("div", { class: "carousel-slide video-slide" });
    const media = linkMode
      ? `<a class="video-box video-link" href="https://vimeo.com/${v.vimeoId}" target="_blank" rel="noopener noreferrer">
          <span class="video-poster" aria-hidden="true">${initials}</span>
          <span class="video-overlay"><span class="sound-badge">${icon("play")}<strong data-t="video.watch"></strong><small data-t="video.vimeo"></small></span></span>
        </a>`
      : `<div class="video-box" data-vimeo="${v.vimeoId}" data-title="${v.name}">
          <button type="button" class="video-overlay">
            <span class="sound-badge">${icon("volume")}<strong data-t="video.watch"></strong><small data-t="video.sound"></small></span>
          </button>
        </div>`;
    slide.innerHTML = `
      <figure class="card-figure" data-video="${i}">
        ${media}
        <figcaption class="video-caption">
          <img class="flag-sm" src="flags/${v.countryCode}-80.png" alt="" width="36" height="24" loading="lazy">
          <span class="place"></span>
          <span class="name">${v.name}</span>
        </figcaption>
      </figure>`;
    track.appendChild(slide);
  });

  const render = () => $$("[data-video]", track).forEach((fig) => {
    const v = VIDEOS[fig.dataset.video], country = countryName(v.countryCode);
    $(".place", fig).textContent = v.city ? `${country} / ${cityName(v.city)}` : country;
    $(".flag-sm", fig).alt = `${t("flag")}: ${country}`;
    $$("[data-t]", fig).forEach((n) => { n.textContent = t(n.dataset.t); });
    if (linkMode) $(".video-link", fig).setAttribute("aria-label", t("video.watchAria", { name: v.name }));
    const btn = $("button.video-overlay", fig);
    if (btn?.dataset.state) btn.setAttribute("aria-label", t(btn.dataset.state === "playing" ? "video.pause" : "video.resume"));
  });
  onLangChange.push(render);

  makeCarousel($("#videos-carousel"));
  if (linkMode) return;

  // Envia comandos ao player do Vimeo (API postMessage, sem script externo)
  const send = (iframe, method, value) =>
    iframe?.contentWindow?.postMessage(JSON.stringify(value === undefined ? { method } : { method, value }), "https://player.vimeo.com");

  const load = (box) => {
    if (box.querySelector("iframe")) return;
    box.prepend(el("iframe", {
      src: `https://player.vimeo.com/video/${box.dataset.vimeo}?${params}`,
      title: box.dataset.title,
      allow: "autoplay; encrypted-media; fullscreen",
      loading: "lazy",
    }));
  };

  const boxes = $$(".video-box", track);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "200px" });
    boxes.forEach((b) => io.observe(b));
  } else boxes.forEach(load);

  boxes.forEach((box) => {
    const btn = box.querySelector(".video-overlay");
    let started = false, playing = true;
    btn.addEventListener("click", () => {
      load(box);
      const f = box.querySelector("iframe");
      if (!started) {
        // Primeiro clique: reinicia do começo, com som e sem repetir
        started = true; playing = true;
        send(f, "setLoop", false);
        send(f, "setCurrentTime", 0);
        send(f, "setMuted", false);
        send(f, "setVolume", 1);
        send(f, "play");
      } else {
        playing = !playing;
        send(f, playing ? "play" : "pause");
      }
      btn.classList.add("is-playing");
      btn.dataset.state = playing ? "playing" : "paused";
      btn.setAttribute("aria-label", t(playing ? "video.pause" : "video.resume"));
      btn.innerHTML = playing
        ? `<span class="pause-badge">${icon("pause")}</span>`
        : `<span class="play-badge">${icon("play")}</span>`;
    });
  });
})();

/* ---------- Prints de resultados ---------- */
(function prints() {
  const track = $("#prints-track");
  const dots = $("#prints-dots");
  if (!track) return;

  PRINTS.forEach(([file, label, code], i) => {
    const slide = el("div", { class: "carousel-slide print-slide" });
    slide.innerHTML = `
      <figure class="card-figure" data-print="${i}">
        <div class="print-img"><img src="img/${file}-720.webp" srcset="img/${file}-720.webp 720w, img/${file}.webp 1100w" sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, calc(100vw - 2.5rem)" alt="" width="720" height="1056" loading="lazy" decoding="async"></div>
        <figcaption class="print-caption">
          <img class="flag-sm" src="flags/${code}-40.png" alt="" width="36" height="24" loading="lazy">
          <span>${label}</span>
        </figcaption>
      </figure>`;
    track.appendChild(slide);
  });

  const buttons = PRINTS.map(() => {
    const b = el("button", { type: "button" }, "<span></span>");
    dots.appendChild(b);
    return b;
  });
  const render = () => {
    $$("[data-print]", track).forEach((fig) => {
      const i = +fig.dataset.print, code = PRINTS[i][2];
      $(".print-img img", fig).alt = (dict().prints || I18N.pt.prints)[i];
      $(".flag-sm", fig).alt = `${t("flag")}: ${countryName(code)}`;
    });
    buttons.forEach((b, i) => b.setAttribute("aria-label", t("print.goto", { n: i + 1 })));
  };
  onLangChange.push(render);

  const carousel = makeCarousel($("#prints-carousel"), {
    loop: true,
    autoplay: 3500,
    onSelect: (i) => buttons.forEach((b, j) => b.setAttribute("aria-current", String(i === j))),
  });
  buttons.forEach((b, i) => b.addEventListener("click", () => carousel.goTo(i)));
})();

/* ---------- Botões "Solicitar avaliação" ---------- */
$$("[data-cta]").forEach((a) => a.addEventListener("click", () => track("cta_form", a.dataset.cta)));

/* ---------- Formulário ---------- */
(function leadForm() {
  const form = $("#lead-form");
  if (!form) return;

  const ddiBtn = $("#ddi-btn"), ddiList = $("#ddi-list"), ddiInput = $("#f-ddi");
  const ddiFlag = $("#ddi-flag"), ddiCode = $("#ddi-code"), phone = $("#f-telefone");
  let country = PHONE_COUNTRIES[0];

  // Máscara: preenche os "9" da máscara com os dígitos digitados
  const mask = (value, pattern) => {
    const digits = value.replace(/\D/g, "");
    let out = "", i = 0;
    for (const ch of pattern) {
      if (i >= digits.length) break;
      out += ch === "9" ? digits[i++] : ch;
    }
    return out;
  };
  phone.addEventListener("input", () => { phone.value = mask(phone.value, country[2]); });

  // Lista de países
  PHONE_COUNTRIES.forEach((c) => {
    const li = el("li");
    const b = el("button", { type: "button", role: "option", "data-code": c[0] }, `<img src="flags/${c[0]}-40.png" alt="" width="24" height="16" loading="lazy">${c[1]}`);
    b.addEventListener("mousedown", (e) => { e.preventDefault(); choose(c); });
    b.addEventListener("click", () => choose(c)); // teclado
    li.appendChild(b);
    ddiList.appendChild(li);
  });
  const setOpen = (open) => { ddiList.hidden = !open; ddiBtn.setAttribute("aria-expanded", String(open)); };
  const ddiLabel = () => ddiBtn.setAttribute("aria-label", `${country[1]} — ${t("f.ddi")}`);
  function choose(c, focus = true) {
    country = c;
    ddiInput.value = c[1];
    ddiFlag.src = `flags/${c[0]}-40.png`;
    ddiCode.textContent = c[1];
    ddiLabel();
    phone.placeholder = c[2];
    phone.value = "";
    $$("button", ddiList).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.code === c[0])));
    setOpen(false);
    if (focus) ddiBtn.focus();
  }
  choose(PHONE_COUNTRIES[0], false);
  ddiBtn.addEventListener("click", () => setOpen(ddiList.hidden));
  ddiBtn.addEventListener("blur", () => setTimeout(() => {
    if (!ddiList.contains(document.activeElement)) setOpen(false);
  }, 150));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // Início do preenchimento (uma vez)
  let started = false;
  form.addEventListener("focusin", () => {
    if (started) return;
    started = true;
    window.dataLayer?.push({ event: "form_start" });
  });

  // Validação (as mensagens vêm de js/i18n.js)
  const rules = {
    nome: (v) => (v.length < 2 ? "err.name" : ""),
    telefone: (v) => (v.length < 8 ? "err.phone" : ""),
    localizacao: (v) => (v.length < 2 ? "err.location" : ""),
    instagram: (v) => (v.length < 2 ? "err.instagram" : ""),
    faturamento: (v) => (!v ? "err.revenue" : ""),
  };
  const showErrors = (errors, focus = true) => {
    $$(".field-error", form).forEach((n) => n.remove());
    for (const [name, key] of Object.entries(errors)) {
      const field = form.querySelector(`[data-field="${name}"]`);
      field?.appendChild(el("span", { class: "field-error", "data-key": key }, t(key)));
    }
    const first = Object.keys(errors)[0];
    if (first && focus) form.querySelector(`[name="${first}"]`)?.focus();
  };
  onLangChange.push(() => {
    ddiLabel();
    $$(".field-error", form).forEach((n) => { n.textContent = t(n.dataset.key); });
  });

  // Origem da visita (UTMs guardadas na sessão)
  function visitInfo() {
    const q = new URLSearchParams(location.search);
    const keep = (key, val) => {
      try {
        if (val) { sessionStorage.setItem(key, val); return val; }
        return sessionStorage.getItem(key) ?? "";
      } catch { return val || ""; }
    };
    const ua = navigator.userAgent;
    return {
      landingPage: keep("cl_landing_page", location.href),
      referrer: keep("cl_referrer", document.referrer),
      utmSource: keep("cl_utm_source", q.get("utm_source") ?? ""),
      utmMedium: keep("cl_utm_medium", q.get("utm_medium") ?? ""),
      utmCampaign: keep("cl_utm_campaign", q.get("utm_campaign") ?? ""),
      utmContent: keep("cl_utm_content", q.get("utm_content") ?? ""),
      utmTerm: keep("cl_utm_term", q.get("utm_term") ?? ""),
      device: /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || innerWidth < 768 ? (/iPad|Tablet/i.test(ua) ? "Tablet" : "Celular") : "Computador",
      browser: /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Outro",
      os: /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Outro",
    };
  }
  visitInfo(); // registra a página de entrada assim que o site abre

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    for (const k in data) data[k] = String(data[k]).trim();
    data.faturamento = data.faturamento || "";

    const errors = {};
    for (const [name, check] of Object.entries(rules)) {
      const key = check(data[name] || "");
      if (key) errors[name] = key;
    }
    showErrors(errors);
    if (Object.keys(errors).length) return;

    const instagram = data.instagram.startsWith("@") ? data.instagram : "@" + data.instagram;
    const fullPhone = data.ddi + data.telefone.replace(/\D/g, "");
    const revenueLabel = $("#f-faturamento").selectedOptions[0]?.textContent || data.faturamento;
    const v = visitInfo();
    const now = new Date();

    // 1) Envia o cadastro para o Make (faturamento sempre em português; "idioma" diz qual versão a pessoa usou)
    const body = new URLSearchParams({
      nome: data.nome, ddi: data.ddi, telefone: fullPhone, whatsapp: fullPhone,
      localizacao: data.localizacao, faturamento: data.faturamento, instagram,
      problema: data.problema || "", origem: "formulario-site", page: location.href, idioma: lang,
      data_hora: now.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      data_hora_iso: now.toISOString(),
      utm_source: v.utmSource, utm_medium: v.utmMedium, utm_campaign: v.utmCampaign,
      utm_content: v.utmContent, utm_term: v.utmTerm, landing_page: v.landingPage,
      referrer: v.referrer, dispositivo: v.device, navegador: v.browser, sistema: v.os,
    });
    fetch(CONFIG.webhookUrl, {
      method: "POST", mode: "no-cors", keepalive: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString(),
    }).catch(() => {});

    // 2) Abre o WhatsApp com a mensagem pronta, no idioma escolhido
    let msg = `${t("wa.hello")}\n\n${t("wa.name")}: ${data.nome}\n${t("wa.phone")}: ${data.ddi} ${data.telefone}\n${t("wa.location")}: ${data.localizacao}\n${t("wa.revenue")}: ${revenueLabel}\nInstagram: ${instagram}`;
    if (data.problema) msg += `\n\n${t("wa.challenge")}: ${data.problema}`;
    window.dataLayer?.push({ event: "form_continue_whatsapp" });
    const base = CONFIG.whatsappNumber ? `https://wa.me/${CONFIG.whatsappNumber}` : "https://wa.me/";
    window.open(`${base}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });
})();

/* ---------- Rodapé ---------- */
$("#year").textContent = new Date().getFullYear();
if (CONFIG.instagramUrl) {
  const ig = $("#footer-instagram");
  ig.href = CONFIG.instagramUrl;
  ig.hidden = false;
  ig.addEventListener("click", () => window.dataLayer?.push({ event: "instagram_click", source: "footer" }));
}

/* ---------- Aplica o idioma inicial ---------- */
setLang(initialLang(), false);
