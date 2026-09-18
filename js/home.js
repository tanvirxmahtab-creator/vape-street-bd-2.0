import { DEMO_PRODUCTS, TESTIMONIALS, SITE_CONFIG, formatPrice, orderLink } from "./config.js?v=20261002";
import { loadProducts, loadOffers, productVisual, escapeHtml, optimizeImageUrl } from "./app.js?v=20261002";
function card(product) { const spec=product.shortSpec || product.variants?.[0] || "Selected edition"; return `<article class="product-card tilt-card"><a class="product-card__visual" href="product.html?id=${encodeURIComponent(product.id)}">${productVisual(product)}</a><div class="product-card__body"><div class="product-card__topline"><span>${escapeHtml(product.category)}</span><span class="stock--${product.stock === "Low Stock" ? "low" : product.stock === "Out of Stock" ? "out" : ""}">${escapeHtml(product.stock || "In Stock")}</span></div><h3>${escapeHtml(product.name)}</h3><p class="product-card__spec">${escapeHtml(spec)}</p><div class="product-card__bottom"><span class="price">${formatPrice(product.price)}</span><div class="card-actions"><a href="product.html?id=${encodeURIComponent(product.id)}">View</a><a href="${orderLink(product.name)}" target="_blank" rel="noopener">Order</a></div></div></div></article>`; }

async function renderCurrentOffers() {
  const container = document.querySelector("#current-offers-section");
  if (!container) return;
  try {
    const offers = await loadOffers();
    const activeOffers = (offers || []).filter(o => o.active);
    if (!activeOffers.length) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }
    
    const content = activeOffers.map(offer => {
      const optimizedImgUrl = offer.imageUrl ? optimizeImageUrl(offer.imageUrl, 800) : "";
      const img = optimizedImgUrl ? `<div class="offer-banner__visual"><img src="${escapeHtml(optimizedImgUrl)}" alt="${escapeHtml(offer.title)}" width="800" height="600" loading="lazy" decoding="async"></div>` : "";
      const waMsg = offer.ctaMessage || `Hi Vape Street BD! I'd like to take advantage of the offer: ${offer.title}`;
      const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;
      const badge = offer.badge ? `<div class="offer-banner__badge"><span class="offer-banner__badge-dot"></span>${escapeHtml(offer.badge)}</div>` : "";
      const headline = offer.headline ? `<h3 class="offer-banner__headline">${escapeHtml(offer.headline)}</h3>` : "";
      const priceTag = offer.price ? `<div class="offer-banner__price"><span class="offer-banner__price-label">Offer Price</span><strong>${formatPrice(offer.price)}</strong></div>` : "";
      const ctaText = offer.ctaText || "Claim Offer on WhatsApp";

      return `
        <article class="offer-banner reveal">
          ${img}
          <div class="offer-banner__content">
            ${badge}
            <h3 class="offer-banner__title">${escapeHtml(offer.title)}</h3>
            ${headline}
            <p class="offer-banner__desc">${escapeHtml(offer.description || "")}</p>
            <div class="offer-banner__footer">
              ${priceTag}
              <a href="${waUrl}" target="_blank" rel="noopener" class="button button--primary offer-banner__cta">
                <svg class="nav__whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.88 11.88 0 0 0 12.07 0C5.49 0 .13 5.35.13 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.94 11.94 0 0 0 5.78 1.48h.01c6.58 0 11.94-5.35 11.94-11.94 0-3.19-1.24-6.19-3.49-8.41ZM12.07 21.82h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.73.98 1-3.63-.24-.37a9.92 9.92 0 1 1 8.39 4.61Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>
                <span>${escapeHtml(ctaText)}</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = `
      <div class="container">
        <div class="section-heading reveal">
          <div><p class="eyebrow">Present offer</p><h2>Current Special Offers</h2></div>
        </div>
        <div class="offers-grid">${content}</div>
      </div>
    `;
    container.hidden = false;
    setupTilt();
  } catch (e) {
    console.error("Error rendering current offers:", e);
    container.hidden = true;
  }
}

async function renderFeatured(){const target=document.querySelector("#featured-products");target.innerHTML="<div class=\"skeleton\"></div>".repeat(3);try{const products=await loadProducts();const catalog=products.length?products:DEMO_PRODUCTS;const selection=catalog.slice(0,6);target.innerHTML=selection.length?selection.map(card).join(""):'<div class="featured-empty"><p class="eyebrow">New stock soon</p><h3>The first edit is being prepared.</h3><p>Explore the categories or speak with the team for current availability.</p><a class="text-link" href="contact.html">Visit the branches <span aria-hidden="true">&#8594;</span></a></div>';setupTilt();}catch{const selection=DEMO_PRODUCTS.slice(0,6);target.innerHTML=selection.map(card).join("");setupTilt();}}
function setupTilt(){if(window.IS_LOW_END_DEVICE || document.documentElement?.classList.contains("low-power-mode") || window.matchMedia("(pointer:coarse),(prefers-reduced-motion:reduce)").matches)return;document.querySelectorAll(".tilt-card, .offer-banner, .category-card, .home-signal").forEach(card=>{if(!card.querySelector(".card-3d-glare")){const glare=document.createElement("div");glare.className="card-3d-glare";card.appendChild(glare)}card.addEventListener("mousemove",event=>{const box=card.getBoundingClientRect(),posX=event.clientX-box.left,posY=event.clientY-box.top,normX=posX/box.width-.5,normY=posY/box.height-.5,rotX=-normY*10,rotY=normX*10;card.style.transform=`perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px) translateY(-5px)`;const glare=card.querySelector(".card-3d-glare");if(glare){glare.style.background=`radial-gradient(circle at ${(posX/box.width)*100}% ${(posY/box.height)*100}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 65%)`}});card.addEventListener("mouseleave",()=>{card.style.transform="";const glare=card.querySelector(".card-3d-glare");if(glare)glare.style.background=""})})}
function vapor(){const canvas=document.querySelector("#vapor-canvas");if(!canvas||window.IS_LOW_END_DEVICE||document.documentElement?.classList.contains("low-power-mode")||innerWidth<480||matchMedia("(prefers-reduced-motion:reduce)").matches)return;const ctx=canvas.getContext("2d");let dots=[];const resize=()=>{canvas.width=innerWidth*devicePixelRatio;canvas.height=canvas.offsetHeight*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);dots=Array.from({length:navigator.hardwareConcurrency<5?12:24},()=>({x:Math.random()*innerWidth,y:Math.random()*canvas.offsetHeight,r:Math.random()*3+1,s:Math.random()*.24+.08}))};const draw=()=>{if(window.IS_LOW_END_DEVICE||document.documentElement?.classList.contains("low-power-mode"))return;ctx.clearRect(0,0,innerWidth,canvas.offsetHeight);dots.forEach(dot=>{dot.y-=dot.s;dot.x+=Math.sin(dot.y*.01)*.15;if(dot.y<-10){dot.y=canvas.offsetHeight+10;dot.x=Math.random()*innerWidth}const gradient=ctx.createRadialGradient(dot.x,dot.y,0,dot.x,dot.y,dot.r*5);gradient.addColorStop(0,"rgba(0,230,195,.22)");gradient.addColorStop(1,"rgba(0,230,195,0)");ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(dot.x,dot.y,dot.r*5,0,Math.PI*2);ctx.fill()});requestAnimationFrame(draw)};resize();addEventListener("resize",resize);draw()}
function heroVideo(){const video=document.querySelector(".hero__video");if(!video)return;if(matchMedia("(prefers-reduced-motion:reduce)").matches){video.pause();video.removeAttribute("autoplay");return;}const play=()=>video.play().catch(()=>{});video.muted=true;if(video.readyState>=3)play();video.addEventListener("canplay",play,{once:true});}
function testimonials(){let index=0;const target=document.querySelector("#testimonial-stage");if(!target)return;const paint=()=>{const item=TESTIMONIALS[index];target.innerHTML=`<p>“${item.quote}”</p><footer>${item.name}</footer>`;index=(index+1)%TESTIMONIALS.length};paint();if(!matchMedia("(prefers-reduced-motion:reduce)").matches&&!window.IS_LOW_END_DEVICE)setInterval(paint,6000)}
function hero3DParallax(){const hero=document.querySelector(".hero"),content=document.querySelector(".hero__content");if(!hero||!content||window.IS_LOW_END_DEVICE||document.documentElement?.classList.contains("low-power-mode")||matchMedia("(pointer:coarse),(prefers-reduced-motion:reduce)").matches)return;hero.style.perspective="1200px";content.style.transition="transform 0.25s cubic-bezier(0.165, 0.84, 0.44, 1)";hero.addEventListener("mousemove",event=>{const box=hero.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;content.style.transform=`rotateX(${-y*5}deg) rotateY(${x*5}deg) translateZ(15px)`});hero.addEventListener("mouseleave",()=>{content.style.transform=""})}

renderCurrentOffers();renderFeatured();vapor();heroVideo();testimonials();hero3DParallax();

