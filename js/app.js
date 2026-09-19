import { AGE_GATE_COPY, OFFER_CAMPAIGN_COPY, SITE_CONFIG, DEMO_PRODUCTS, DEFAULT_OFFERS } from "./config.js?v=20260999";
import { isFirebaseConfigured, db, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "./firebase-init.js";

export async function loadProducts() {
  const localRaw = localStorage.getItem("vsbd_products");
  let localProducts = null;
  try {
    if (localRaw) localProducts = JSON.parse(localRaw);
  } catch (e) { localProducts = null; }

  if (!isFirebaseConfigured) {
    return (localProducts && Array.isArray(localProducts) && localProducts.length) ? localProducts : DEMO_PRODUCTS;
  }

  try {
    const snapshot = await getDocs(collection(db, "products"));
    if (!snapshot.empty) {
      const products = snapshot.docs.map(item => ({id:item.id,...item.data()}));
      localStorage.setItem("vsbd_products", JSON.stringify(products));
      return products;
    }
    return (localProducts && Array.isArray(localProducts) && localProducts.length) ? localProducts : DEMO_PRODUCTS;
  } catch (err) {
    console.warn("Could not load products from Firestore, falling back to local storage:", err);
    return (localProducts && Array.isArray(localProducts) && localProducts.length) ? localProducts : DEMO_PRODUCTS;
  }
}
export async function loadProduct(id) {
  const localRaw = localStorage.getItem("vsbd_products");
  let localProducts = DEMO_PRODUCTS;
  try {
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed) && parsed.length) localProducts = parsed;
    }
  } catch (e) {}

  if (!isFirebaseConfigured) return localProducts.find(product => product.id === id) || null;

  try {
    const snapshot = await getDoc(doc(db, "products", id));
    return snapshot.exists() ? {id:snapshot.id,...snapshot.data()} : (localProducts.find(product => product.id === id) || null);
  } catch (err) {
    console.warn("Could not load product from Firestore, falling back to local storage:", err);
    return localProducts.find(product => product.id === id) || null;
  }
}

export async function loadOffers() {
  const localRaw = localStorage.getItem("vsbd_offers");
  let localOffers = null;
  try {
    if (localRaw) localOffers = JSON.parse(localRaw);
  } catch (e) { localOffers = null; }

  if (!isFirebaseConfigured) {
    if (!localOffers || !Array.isArray(localOffers)) {
      localStorage.setItem("vsbd_offers", JSON.stringify(DEFAULT_OFFERS));
      return DEFAULT_OFFERS;
    }
    return localOffers;
  }

  try {
    const snapshot = await getDocs(collection(db, "offers"));
    if (!snapshot.empty) {
      const offers = snapshot.docs.map(item => ({id:item.id, ...item.data()}));
      localStorage.setItem("vsbd_offers", JSON.stringify(offers));
      return offers;
    }
    // Seed Firestore with default offers if empty
    if (localOffers && localOffers.length) return localOffers;
    localStorage.setItem("vsbd_offers", JSON.stringify(DEFAULT_OFFERS));
    return DEFAULT_OFFERS;
  } catch (err) {
    console.warn("Could not load offers from Firestore, falling back to local storage:", err);
    return localOffers && localOffers.length ? localOffers : DEFAULT_OFFERS;
  }
}
export function checkDeviceCapabilities() {
  let isLowEnd = false;
  let userPref = null;
  try {
    userPref = localStorage.getItem("vsbd_power_mode");
  } catch (e) {}

  if (userPref === "low") {
    isLowEnd = true;
  } else if (userPref === "high") {
    isLowEnd = false;
  } else {
    try {
      const cores = navigator.hardwareConcurrency || 4;
      const memory = navigator.deviceMemory || 4;
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const saveData = conn ? conn.saveData : false;
      const effectiveType = conn ? conn.effectiveType : '4g';
      const reducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

      if (cores <= 4 || memory <= 4 || saveData || effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g' || reducedMotion) {
        isLowEnd = true;
      }
    } catch (e) { isLowEnd = false; }
  }

  window.IS_LOW_END_DEVICE = isLowEnd;
  if (document.documentElement) {
    document.documentElement.classList.toggle("low-power-mode", isLowEnd);
  }
  updatePerfToggleUI();
  return isLowEnd;
}

let fpsMonitorActive = false;
export function initFPSMonitor() {
  if (fpsMonitorActive || typeof requestAnimationFrame === "undefined") return;
  let userPref = null;
  try { userPref = localStorage.getItem("vsbd_power_mode"); } catch (e) {}
  if (userPref === "high") return; // User explicitly forced high performance

  fpsMonitorActive = true;
  let frameCount = 0;
  let startTime = performance.now();
  let jankCount = 0;

  function measureFPS(now) {
    frameCount++;
    const elapsed = now - startTime;
    if (elapsed >= 2000) {
      const fps = (frameCount * 1000) / elapsed;
      if (fps < 35) {
        jankCount++;
        if (jankCount >= 2 && !window.IS_LOW_END_DEVICE) {
          console.warn("[Vape Street BD] Low FPS detected (<35 FPS). Automatically activating Compressed Speed Mode.");
          window.IS_LOW_END_DEVICE = true;
          document.documentElement.classList.add("low-power-mode");
          updatePerfToggleUI();
        }
      } else {
        jankCount = Math.max(0, jankCount - 1);
      }
      frameCount = 0;
      startTime = now;
    }
    if (!window.IS_LOW_END_DEVICE || userPref === "auto") {
      requestAnimationFrame(measureFPS);
    }
  }
  requestAnimationFrame(measureFPS);
}

export function updatePerfToggleUI() {
  const btn = document.querySelector("#perf-toggle-btn");
  const statusEl = document.querySelector("#perf-toggle-status");
  if (!btn || !statusEl) return;
  let userPref = null;
  try { userPref = localStorage.getItem("vsbd_power_mode"); } catch (e) {}

  if (userPref === "low") {
    statusEl.textContent = "Speed (Forced)";
    btn.setAttribute("title", "Compressed speed mode forced ON. Click to toggle.");
  } else if (userPref === "high") {
    statusEl.textContent = "Full Visuals";
    btn.setAttribute("title", "Full visual mode forced ON. Click to toggle.");
  } else {
    statusEl.textContent = window.IS_LOW_END_DEVICE ? "Speed (Auto)" : "Full (Auto)";
    btn.setAttribute("title", "Auto performance mode. Click to toggle.");
  }
}

export function setupPerformanceToggle() {
  const container = document.querySelector(".site-footer .footer-bottom") || document.body;
  if (!container || document.querySelector("#perf-toggle-btn")) return;

  const btn = document.createElement("button");
  btn.id = "perf-toggle-btn";
  btn.className = "perf-toggle-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Toggle Performance Mode");
  btn.innerHTML = `⚡ <span id="perf-toggle-status">Auto</span>`;

  btn.addEventListener("click", () => {
    let current = null;
    try { current = localStorage.getItem("vsbd_power_mode"); } catch (e) {}
    let nextMode = "auto";
    if (!current || current === "auto") {
      nextMode = "low";
      showToast("⚡ Speed Mode activated (compressed images & maximum performance)");
    } else if (current === "low") {
      nextMode = "high";
      showToast("✨ Full Visuals Mode activated");
    } else {
      nextMode = "auto";
      showToast("🔄 Performance set to Auto");
    }
    try { localStorage.setItem("vsbd_power_mode", nextMode); } catch (e) {}
    checkDeviceCapabilities();
  });

  if (container.classList.contains("footer-bottom")) {
    container.appendChild(btn);
  } else {
    document.body.appendChild(btn);
  }
  updatePerfToggleUI();
}

checkDeviceCapabilities();
initFPSMonitor();

export function optimizeImageUrl(url = "", targetWidth = 600) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const isLowEnd = window.IS_LOW_END_DEVICE || (document.documentElement && document.documentElement.classList.contains("low-power-mode"));
    const widthParam = isLowEnd ? Math.min(targetWidth, 360) : targetWidth;
    const qualityParam = isLowEnd ? "q_auto:eco,f_auto,fl_lossy" : "q_auto,f_auto";
    if (!url.includes("c_scale") && !url.includes("w_")) {
      return url.replace("/upload/", `/upload/c_scale,w_${widthParam},${qualityParam}/`);
    }
  }
  return url;
}

export function showToast(message, error = false) { const toast = document.createElement("div"); toast.className = `toast${error ? " toast--error" : ""}`; toast.setAttribute("role", "status"); toast.textContent = message; document.body.append(toast); setTimeout(() => toast.remove(), 4300); }
export function productVisual(product, extraClass = "") { const fallback = `<div class="product-visual ${extraClass}" aria-hidden="true"></div>`; if (product.images?.[0]) { const src = optimizeImageUrl(product.images[0], 600); return `<img src="${escapeHtml(src)}" alt="${escapeHtml(product.name)}" width="600" height="600" loading="lazy" decoding="async" fetchpriority="low" onerror="this.hidden=true;const fallback=this.nextElementSibling;if(fallback)fallback.hidden=false;">${fallback.replace(' aria-hidden', ' hidden aria-hidden')}`; } return fallback; }
export function escapeHtml(value = "") { return String(value).replace(/[&<>'\"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"})[character]); }

function brandMark() { return `<img class="brand__logo" src="assets/vape-street-bd-logo.png" alt="Vape Street BD">`; }
function brandLockup() { return `${brandMark()}<span class="brand__copy"><span class="brand__name">VAPE STREET <b>BD</b></span><span class="brand__tagline">Luxury vape shop</span></span>`; }
function header() { const page = document.body.dataset.page; const current = target => page === target ? ' aria-current="page"' : ""; const whatsappIcon = '<svg class="nav__whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.88 11.88 0 0 0 12.07 0C5.49 0 .13 5.35.13 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.94 11.94 0 0 0 5.78 1.48h.01c6.58 0 11.94-5.35 11.94-11.94 0-3.19-1.24-6.19-3.49-8.41ZM12.07 21.82h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.73.98 1-3.63-.24-.37a9.92 9.92 0 1 1 8.39 4.61Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>'; return `<header class="site-header"><nav class="nav container" aria-label="Primary navigation"><a class="brand" href="index.html">${brandLockup()}</a><button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">&#8801;</button><div class="nav-links" id="primary-nav"><a href="index.html"${current("home")}>Home</a><a href="shop.html"${current("shop")}>Collection</a><a href="about.html"${current("about")}>Our story</a><a href="contact.html"${current("contact")}>Contact</a></div><div class="nav-actions"><a data-phone class="nav__call" href="#">Call us</a><a data-whatsapp class="nav__order" href="#">${whatsappIcon}<span>Order on WhatsApp</span></a></div></nav></header>`; }
function footer() { return `<footer class="site-footer"><div class="container footer-top"><div><a class="brand" href="index.html">${brandLockup()}</a><p>Authentic adult vaping products, selected with intention.</p></div><div><p class="footer-title">Browse</p><div class="footer-links"><a href="shop.html">Collection</a><a href="about.html">Our story</a><a href="contact.html">Contact</a></div></div><div><p class="footer-title">Reach us</p><div class="footer-links"><a data-whatsapp href="#">WhatsApp</a><a data-phone href="#">${SITE_CONFIG.phoneNumber}</a><a href="admin/index.html">Admin</a></div></div></div><div class="container footer-bottom"><span>For adults 18+ only.</span><span>&copy; ${new Date().getFullYear()} Vape Street BD</span></div></footer>`; }
function overlays() { 
  let isConfirmed = false;
  try {
    isConfirmed = sessionStorage.getItem("vsbd-age-confirmed-session") === "true";
  } catch (e) {}
  const ageGateMarkup = isConfirmed ? "" : `<div class="age-gate" id="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-title" aria-describedby="age-message"><div class="age-gate__panel"><img class="age-gate__logo" src="assets/vape-street-bd-logo.png" alt="Vape Street BD"><p class="eyebrow">Age verification</p><h2 id="age-title">${AGE_GATE_COPY.title}</h2><p id="age-message">${AGE_GATE_COPY.message}</p><div class="age-gate__actions"><button class="button button--primary" id="age-enter">${AGE_GATE_COPY.enterLabel}</button><button class="button button--outline" id="age-exit">${AGE_GATE_COPY.exitLabel}</button></div></div></div>`;
  return `<div class="site-doodles" aria-hidden="true"><i class="vape-doodle vape-doodle--one"></i><i class="vape-doodle vape-doodle--two"></i><i class="vape-doodle vape-doodle--three"></i><i class="vape-doodle vape-doodle--four"></i><i class="vape-doodle vape-doodle--five"></i><i class="vape-doodle vape-doodle--six"></i></div><a class="whatsapp-float" href="tel:+8801721747998" aria-label="Call Vape Street BD at 01721-747998"><svg class="whatsapp-float__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.31.56 3.57.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.19 2.45.56 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2Z"/></svg><span class="whatsapp-float__label">01721-747998</span></a>${ageGateMarkup}`; 
}
function showOfferPopup() { return; }
function setupOfferPopup() { return; }
function setupAgeGate() { 
  const gate = document.querySelector("#age-gate"); 
  if (!gate) return; 
  try { 
    if (sessionStorage.getItem("vsbd-age-confirmed-session") === "true") {
      gate.remove();
      document.documentElement.classList.remove("age-gate-open");
      return;
    }
  } catch (e) {} 
  document.documentElement.classList.add("age-gate-open"); 
  const enter = document.querySelector("#age-enter"), exit = document.querySelector("#age-exit"); 
  const closeGate = () => { 
    try {
      sessionStorage.setItem("vsbd-age-confirmed-session", "true");
    } catch (e) {}
    gate.classList.add("is-leaving"); 
    document.documentElement.classList.remove("age-gate-open"); 
    setTimeout(() => { gate.remove(); }, 220); 
  }; 
  setTimeout(() => enter?.focus(), 50); 
  enter?.addEventListener("click", () => { closeGate(); }); 
  exit?.addEventListener("click", () => { window.location.replace("https://www.google.com"); }); 
  gate.addEventListener("keydown", event => { 
    if (event.key !== "Tab" || !enter || !exit) return; 
    const shouldWrap = event.shiftKey ? document.activeElement === enter : document.activeElement === exit; 
    if (shouldWrap) { 
      event.preventDefault(); 
      (event.shiftKey ? exit : enter).focus(); 
    } 
  }); 
}
function setupNavigation() { const toggle = document.querySelector(".nav-toggle"), links = document.querySelector(".nav-links"); if (!toggle || !links) return; const close = () => { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Open menu"); }; toggle.addEventListener("click", () => { const open = links.classList.toggle("is-open"); toggle.setAttribute("aria-expanded", String(open)); toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }); links.querySelectorAll("a").forEach(link => link.addEventListener("click", close)); document.addEventListener("keydown", event => { if (event.key === "Escape") close(); }); window.addEventListener("scroll", () => document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 6), {passive:true}); }
function setupMotion() { 
  const reveals = document.querySelectorAll(".reveal:not(.story__image--boutique)"); 
  const isLowPower = window.IS_LOW_END_DEVICE || (document.documentElement && document.documentElement.classList.contains("low-power-mode"));
  if (isLowPower || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { 
    reveals.forEach(node => {node.style.opacity=1;node.style.transform="none";}); 
    return; 
  } 
  if (window.gsap && window.ScrollTrigger) { 
    window.gsap.registerPlugin(window.ScrollTrigger); 
    window.gsap.utils.toArray(reveals).forEach(node => window.gsap.to(node,{opacity:1,y:0,duration:.65,ease:"power2.out",scrollTrigger:{trigger:node,start:"top 88%"}})); 
  } else reveals.forEach(node => {node.style.opacity=1;node.style.transform="none";}); 
  document.querySelectorAll(".magnetic").forEach(button => { 
    button.addEventListener("mousemove", event => { 
      if (window.IS_LOW_END_DEVICE) return;
      const box=button.getBoundingClientRect(); 
      button.style.transform=`translate(${(event.clientX-box.left-box.width/2)*.08}px, ${(event.clientY-box.top-box.height/2)*.08}px)`; 
    }); 
    button.addEventListener("mouseleave",()=>button.style.transform=""); 
  }); 
}
function setupBoutiqueReveal() { const image = document.querySelector(".story__image--boutique"); if (!image || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.IntersectionObserver) return; document.documentElement.classList.add("motion-ready"); const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) return; image.classList.add("is-visible"); observer.unobserve(image); }, { rootMargin: "0px 0px -40% 0px" }); observer.observe(image); }
function setupMarqueeControls() { document.querySelectorAll("[data-marquee-toggle]").forEach(button => { const track = button.closest(".facts-marquee")?.querySelector("[data-marquee-track]"); if (!track) return; button.addEventListener("click", () => { const paused = track.classList.toggle("is-paused"); button.setAttribute("aria-pressed", String(paused)); button.setAttribute("aria-label", paused ? "Play shop facts" : "Pause shop facts"); button.querySelector("span").textContent = paused ? "▶" : "Ⅱ"; }); }); }
function setupContactLinks() { document.querySelectorAll("[data-whatsapp]").forEach(link => { link.href = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to enquire about Vape Street BD products.")}`; link.target = "_blank"; link.rel = "noopener"; }); document.querySelectorAll("[data-phone]").forEach(link => { link.href = `tel:${SITE_CONFIG.phoneHref}`; }); document.querySelectorAll("[data-address]").forEach(node => { node.textContent = SITE_CONFIG.address; }); }
function setupLoader() { if (sessionStorage.getItem("vsbd-seen") || window.IS_LOW_END_DEVICE) return; const loader=document.createElement("div"); loader.className="loader"; loader.innerHTML='<div class="loader__wordmark">VAPE STREET <span>BD</span></div>'; document.body.append(loader); sessionStorage.setItem("vsbd-seen","true"); setTimeout(()=>{loader.classList.add("is-leaving");setTimeout(()=>loader.remove(),420)},500); }
const headerTarget = document.querySelector("#site-header"), footerTarget = document.querySelector("#site-footer"), overlayTarget = document.querySelector("#site-overlays");
if (headerTarget) headerTarget.innerHTML = header();
if (footerTarget) footerTarget.innerHTML = footer();
if (overlayTarget) overlayTarget.innerHTML = overlays();
setupAgeGate(); setupOfferPopup(); setupNavigation(); setupContactLinks(); setupMotion(); setupBoutiqueReveal(); setupMarqueeControls(); setupLoader(); setupPerformanceToggle();
