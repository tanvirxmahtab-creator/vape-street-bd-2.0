export const SITE_CONFIG = {
  whatsappNumber: "8801721747998",
  phoneNumber: "01721-747998",
  phoneHref: "+8801721747998",
  address: "Kallyanpur & South Bishil, Mirpur, Dhaka 1216",
  currency: "BDT",
  ownerEmail: "vapestreetbd@gmail.com"
};

export const isOwnerConfigured = Boolean(SITE_CONFIG.ownerEmail);
export function isOwner(email = "") { return isOwnerConfigured && email.toLowerCase() === SITE_CONFIG.ownerEmail.toLowerCase(); }

// Keep regulatory and age-gate copy here so it can be changed quickly without touching multiple pages.
export const AGE_GATE_COPY = {
  title: "Adults only.",
  message: "You must be 18 or older to enter. By continuing, you confirm that you are of legal age in your location.",
  enterLabel: "I am 18 or older",
  exitLabel: "Leave site"
};

export const OFFER_CAMPAIGN_COPY = {
  active: true,
  badge: "LIMITED TIME OFFER",
  title: "Bar Juices Special Offer!",
  headline: "Buy Any 2 Bar Juices for ৳1,400 Each!",
  message: "Upgrade your vape flavors today. Get any 2 Bar Juices for just ৳1,400 each for a limited time at Vape Street BD.",
  ctaText: "Order on WhatsApp",
  ctaLinkMessage: "Hi Vape Street BD! I want to take advantage of the Bar Juices offer (৳1,400 each when buying 2)."
};

export const CATEGORIES = ["All", "Disposables", "Pod Systems & Kits", "E-Liquids", "Mods & Tanks", "Coils & Accessories"];
export const DEMO_PRODUCTS = [
  {id:"kiligbar-6000",name:"Kiligbar 6000",category:"Disposables",price:1200,shortSpec:"Up to 6,000 puffs | Prefilled",description:"A compact Kiligbar prefilled device with a replaceable cartridge format, battery display, and draw-activated use. Availability and flavour selection change regularly.",variants:["Blackcurrant Lychee", "Mango Orange", "Blueberry Raspberry Lemon"],stock:"In Stock",featured:true,images:["https://vapeshopsky.com/storage/photos/1/Products/KILIGBAR%206K%20Puff%20Tobacco%20Disposal%20Kit.jpeg"]},
  {id:"flyto-switch-6000",name:"Flyto Switch 6000",category:"Disposables",price:1000,shortSpec:"Up to 6,000 puffs | 500mAh",description:"The Flyto Switch 6000 is a rechargeable, prefilled pod kit with a mesh coil and Type-C charging. Ask the shop which device and flavour combinations are currently available.",variants:["Blueberry Raspberry Lemon", "Mango Berry", "Mango Peach Guava", "Ice Menthol"],stock:"In Stock",featured:true,images:["https://kandyvape.com/wp-content/uploads/2025/01/flyto-disposable.png"]},
  {id:"flyto-switch-pro-10000",name:"Flyto Switch Pro 10000",category:"Disposables",price:1700,shortSpec:"Up to 10,000 puffs | Display",description:"A longer-running Flyto Switch Pro kit with a rechargeable battery, display, adjustable airflow, and dual-mode operation. Contact the shop to confirm current flavours.",variants:["Strawberry Kiwi", "Dual Flavour", "Ask for current flavours"],stock:"In Stock",featured:true,images:["https://coilkandy.com/wp-content/uploads/2025/12/Flyto-Switch-Pro-10000-Puffs-Disposable-Kit-430x430.webp"]},
{id:"keystone-cyber-case-30000",name:"Keystone Cyber Case 30000",category:"Pod Systems & Kits",price:2000,shortSpec:"Up to 30,000 puffs | 650mAh",description:"The Cyber Case is a refillable prefilled pod system with a visible e-liquid tank, mesh coil, adjustable airflow, and quick pod switching. Confirm flavour and full-kit availability before ordering.",variants:["Berry Family", "Kiwi Passion Fruit Guava", "Watermelon", "Strawberry Smoothie"],stock:"In Stock",featured:false,images:["https://keystonevape.com/wp-content/uploads/2024/10/CYBER-CASE-Menu.png"]},
  {id:"willwell-disposable-16k",name:"WillWell Disposable 16K",category:"Disposables",price:1600,shortSpec:"Up to 16,000 puffs | 500mAh",description:"A long-running WillWell disposable with a compact form and flavour-focused options. The exact puff count and flavour selection can vary by release, so please call the shop before visiting or ordering.",variants:["Watermelon Frenzy", "Watermelon Lychee", "Blueberry Cheesecake"],stock:"Low Stock",featured:false,images:["https://api.funonx.com/uploads/products/optimized-1782399954129-998112328.webp"]}
];

export const TESTIMONIALS = [
  {quote:"The collection feels carefully chosen, and the person helping me actually knew the difference between the devices.",name:"Rafi, Dhaka"},
  {quote:"No awkward back-and-forth. I asked about a flavor, got a straight answer, and the order was sorted.",name:"Samiha, Gulshan"},
  {quote:"I come back because the stock is real and the recommendations do not feel like a sales pitch.",name:"Arman, Dhanmondi"}
];

export function formatPrice(value) { return new Intl.NumberFormat("en-BD", {style:"currency",currency:SITE_CONFIG.currency,maximumFractionDigits:0}).format(Number(value)); }
export function orderLink(productName, variant = "") { const item = variant ? `${productName} - ${variant}` : productName; return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to order: ${item}. Is it in stock?`)}`; }
