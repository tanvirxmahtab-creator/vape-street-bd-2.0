import { CATEGORIES, DEMO_PRODUCTS, DEFAULT_OFFERS, formatPrice, isOwnerConfigured, isOwner } from "./config.js?v=20260929";
import { isFirebaseConfigured, auth, db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp, onAuthStateChanged, signOut } from "./firebase-init.js";
import { escapeHtml, loadOffers } from "./app.js?v=20260932";

const list=document.querySelector("#product-list"),status=document.querySelector("#admin-status"),editor=document.querySelector("#product-editor"),form=document.querySelector("#product-form"),saveMessage=document.querySelector("#save-message");
let products=[];

const offerList=document.querySelector("#offer-list"),offerStatus=document.querySelector("#offer-status"),offerEditor=document.querySelector("#offer-editor"),offerForm=document.querySelector("#offer-form"),offerSaveMessage=document.querySelector("#offer-save-message");
let offers=[];

function message(text,error=false){status.textContent=text;status.classList.toggle("is-error",error)}
function offerMessage(text,error=false){if(offerStatus){offerStatus.textContent=text;offerStatus.classList.toggle("is-error",error)}}

async function publishStarterProducts(button){if(!auth.currentUser||!isOwner(auth.currentUser.email)){message("Sign in with the owner account before publishing starter products.",true);return}if(!confirm("Publish the five prepared starter products to the live catalog? Existing products with the same names will remain unchanged."))return;button.disabled=true;message("Publishing starter products...");try{await Promise.all(DEMO_PRODUCTS.map(({id,...product})=>setDoc(doc(db,"products",id),{...product,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true})));message("Starter products published. They are now editable from this dashboard.");load()}catch{message("The starter products could not be published. Check your Firebase rules and owner sign-in.",true)}finally{button.disabled=false}}
function addStarterButton(){const newProduct=document.querySelector("#new-product");if(!newProduct||document.querySelector("#publish-starter"))return;const actions=document.createElement("div");actions.className="admin-title__actions";const button=document.createElement("button");button.type="button";button.id="publish-starter";button.className="button button--outline";button.textContent="Publish starter catalog";button.addEventListener("click",()=>publishStarterProducts(button));newProduct.before(actions);actions.append(button,newProduct)}
if(isFirebaseConfigured&&isOwnerConfigured)addStarterButton()

function openEditor(product=null){form.reset();document.querySelector("#product-id").value=product?.id||"";document.querySelector("#editor-title").textContent=product?"Edit product":"Add product";if(product){document.querySelector("#name").value=product.name||"";document.querySelector("#category").value=product.category||CATEGORIES[1];document.querySelector("#price").value=product.price||"";document.querySelector("#stock").value=product.stock||"In Stock";document.querySelector("#short-spec").value=product.shortSpec||"";document.querySelector("#description").value=product.description||"";document.querySelector("#variants").value=(product.variants||[]).join(", ");document.querySelector("#featured").checked=Boolean(product.featured);document.querySelector("#image-url").value=product.images?.[0]||""}saveMessage.textContent="";editor.hidden=false;document.querySelector("#name").focus()}
function closeEditor(){editor.hidden=true}

function render(){if(!products.length){list.innerHTML='<div class="empty-state"><h2>No products yet.</h2><p>Add your first item to start the collection.</p></div>';return}list.innerHTML=products.map(product=>`<article class="admin-row"><div><div class="admin-row__name">${escapeHtml(product.name)}</div><div class="admin-row__meta">${escapeHtml(product.category)}</div></div><div>${formatPrice(product.price)}</div><div class="admin-row__meta">${escapeHtml(product.stock||"In Stock")}</div><div class="admin-row__actions"><button data-edit="${product.id}">Edit</button><button data-delete="${product.id}">Delete</button></div></article>`).join("");document.querySelectorAll("[data-edit]").forEach(button=>button.addEventListener("click",()=>openEditor(products.find(product=>product.id===button.dataset.edit))));document.querySelectorAll("[data-delete]").forEach(button=>button.addEventListener("click",async()=>{const product=products.find(item=>item.id===button.dataset.delete);if(!confirm(`Delete ${product.name}? This cannot be undone.`))return;try{if(isFirebaseConfigured)await deleteDoc(doc(db,"products",product.id));message("Product deleted.");load()}catch{message("The product could not be deleted. Please try again.",true)}}));}

async function load(){message("Loading products...");try{if(isFirebaseConfigured){const snapshot=await getDocs(collection(db,"products"));products=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>(a.name||"").localeCompare(b.name||""));}else{products=DEMO_PRODUCTS;}render();message(`${products.length} ${products.length===1?"product":"products"} in the catalog.`);loadOffersAdmin();}catch{message("The catalog could not load. Check your Firebase rules and connection.",true);loadOffersAdmin();}}

async function save(event){event.preventDefault();const button=form.querySelector("button[type=submit]");button.disabled=true;saveMessage.classList.remove("is-error");saveMessage.textContent="Saving product...";try{const id=document.querySelector("#product-id").value,existing=products.find(product=>product.id===id),imageUrl=document.querySelector("#image-url").value.trim(),removeImage=document.querySelector("#remove-image").checked;const images=removeImage?[]:imageUrl?[imageUrl]:existing?.images||[];const payload={name:document.querySelector("#name").value.trim(),category:document.querySelector("#category").value,price:Number(document.querySelector("#price").value),stock:document.querySelector("#stock").value,shortSpec:document.querySelector("#short-spec").value.trim(),description:document.querySelector("#description").value.trim(),variants:document.querySelector("#variants").value.split(",").map(value=>value.trim()).filter(Boolean),featured:document.querySelector("#featured").checked,images,updatedAt:serverTimestamp()};if(isFirebaseConfigured){if(id)await updateDoc(doc(db,"products",id),payload);else await addDoc(collection(db,"products"),{...payload,createdAt:serverTimestamp()});}saveMessage.textContent="Saved successfully.";closeEditor();load()}catch{saveMessage.textContent="The product could not be saved. Check the fields and your Firebase rules.";saveMessage.classList.add("is-error")}finally{button.disabled=false}}

/* OFFERS ADMIN MANAGEMENT */
function openOfferEditor(offer=null){
  if(!offerForm)return;
  offerForm.reset();
  document.querySelector("#offer-id").value=offer?.id||"";
  document.querySelector("#offer-editor-title").textContent=offer?"Edit offer":"Add offer";
  if(offer){
    document.querySelector("#offer-title-input").value=offer.title||"";
    document.querySelector("#offer-badge-input").value=offer.badge||"LIMITED TIME OFFER";
    document.querySelector("#offer-headline-input").value=offer.headline||"";
    document.querySelector("#offer-price-input").value=offer.price||"";
    document.querySelector("#offer-image-url-input").value=offer.imageUrl||"";
    document.querySelector("#offer-description-input").value=offer.description||"";
    document.querySelector("#offer-cta-text-input").value=offer.ctaText||"Claim Offer on WhatsApp";
    document.querySelector("#offer-cta-message-input").value=offer.ctaMessage||"";
    document.querySelector("#offer-active-input").checked=Boolean(offer.active);
  } else {
    document.querySelector("#offer-badge-input").value="LIMITED TIME OFFER";
    document.querySelector("#offer-cta-text-input").value="Claim Offer on WhatsApp";
    document.querySelector("#offer-image-url-input").value="https://res.cloudinary.com/dfv8fqivk/image/upload/v1789755367/Bar_juice_bottles_displayed_on_2K_20260919001412_oisekj.jpg";
    document.querySelector("#offer-active-input").checked=true;
  }
  if(offerSaveMessage) offerSaveMessage.textContent="";
  if(offerEditor) offerEditor.hidden=false;
  document.querySelector("#offer-title-input")?.focus();
}

function closeOfferEditor(){if(offerEditor)offerEditor.hidden=true}

function renderOffers(){
  if(!offerList)return;
  if(!offers.length){
    offerList.innerHTML='<div class="empty-state"><h2>No special offers created.</h2><p>Click "Add offer" to create your first promotion.</p></div>';
    return;
  }
  offerList.innerHTML=offers.map(offer=>`
    <article class="admin-row admin-row--offer">
      <div>
        <div class="admin-row__name">${escapeHtml(offer.title)}</div>
        <div class="admin-row__meta">${escapeHtml(offer.headline||offer.description||"")}</div>
      </div>
      <div>${offer.price ? formatPrice(offer.price) : "Special Deal"}</div>
      <div>
        <span class="status-pill status-pill--${offer.active ? "active" : "closed"}">${offer.active ? "Active" : "Closed"}</span>
      </div>
      <div class="admin-row__actions">
        <button data-toggle-offer="${offer.id}">${offer.active ? "Close offer" : "Activate"}</button>
        <button data-edit-offer="${offer.id}">Edit</button>
        <button data-delete-offer="${offer.id}">Delete</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-toggle-offer]").forEach(button=>button.addEventListener("click",async()=>{
    const id=button.dataset.toggleOffer;
    const item=offers.find(o=>o.id===id);
    if(!item)return;
    const newStatus=!item.active;
    button.disabled=true;
    try{
      item.active=newStatus;
      if(isFirebaseConfigured){
        await updateDoc(doc(db,"offers",id),{active:newStatus,updatedAt:serverTimestamp()});
      }
      localStorage.setItem("vsbd_offers",JSON.stringify(offers));
      offerMessage(`Offer "${item.title}" is now ${newStatus ? "ACTIVE" : "CLOSED"}.`);
      renderOffers();
    }catch(err){
      localStorage.setItem("vsbd_offers",JSON.stringify(offers));
      offerMessage(`Offer status updated locally to ${newStatus ? "ACTIVE" : "CLOSED"}.`);
      renderOffers();
    }finally{
      button.disabled=false;
    }
  }));

  document.querySelectorAll("[data-edit-offer]").forEach(button=>button.addEventListener("click",()=>openOfferEditor(offers.find(offer=>offer.id===button.dataset.editOffer))));
  document.querySelectorAll("[data-delete-offer]").forEach(button=>button.addEventListener("click",async()=>{
    const offer=offers.find(item=>item.id===button.dataset.deleteOffer);
    if(!confirm(`Delete offer "${offer.title}"? This will remove it completely.`))return;
    try{
      if(isFirebaseConfigured){
        await deleteDoc(doc(db,"offers",offer.id));
      }
      offers=offers.filter(item=>item.id!==offer.id);
      localStorage.setItem("vsbd_offers",JSON.stringify(offers));
      offerMessage("Offer deleted.");
      renderOffers();
    }catch{
      offers=offers.filter(item=>item.id!==offer.id);
      localStorage.setItem("vsbd_offers",JSON.stringify(offers));
      offerMessage("Offer deleted locally.");
      renderOffers();
    }
  }));
}

async function loadOffersAdmin(){
  offerMessage("Loading homepage offers...");
  try {
    offers = await loadOffers();
    renderOffers();
    offerMessage(`${offers.length} ${offers.length===1?"offer":"offers"} listed. (${offers.filter(o=>o.active).length} active)`);
  } catch (err) {
    offers = DEFAULT_OFFERS;
    renderOffers();
    offerMessage("Loaded default offers.");
  }
}

async function saveOffer(event){
  event.preventDefault();
  const button=offerForm.querySelector("button[type=submit]");
  button.disabled=true;
  if(offerSaveMessage){
    offerSaveMessage.classList.remove("is-error");
    offerSaveMessage.textContent="Saving offer...";
  }
  try{
    const id=document.querySelector("#offer-id").value;
    const payload={
      title:document.querySelector("#offer-title-input").value.trim(),
      badge:document.querySelector("#offer-badge-input").value.trim()||"LIMITED TIME OFFER",
      headline:document.querySelector("#offer-headline-input").value.trim(),
      price:Number(document.querySelector("#offer-price-input").value)||1400,
      imageUrl:document.querySelector("#offer-image-url-input").value.trim(),
      description:document.querySelector("#offer-description-input").value.trim(),
      ctaText:document.querySelector("#offer-cta-text-input").value.trim()||"Claim Offer on WhatsApp",
      ctaMessage:document.querySelector("#offer-cta-message-input").value.trim(),
      active:document.querySelector("#offer-active-input").checked,
      updatedAt:serverTimestamp()
    };

    if(id){
      const index=offers.findIndex(o=>o.id===id);
      if(index!==-1) offers[index]={...offers[index],...payload};
      if(isFirebaseConfigured){
        await updateDoc(doc(db,"offers",id),payload);
      }
    }else{
      const newId="offer-"+Date.now();
      const newOffer={id:newId,...payload};
      offers.push(newOffer);
      if(isFirebaseConfigured){
        await setDoc(doc(db,"offers",newId),{...payload,createdAt:serverTimestamp()});
      }
    }
    localStorage.setItem("vsbd_offers",JSON.stringify(offers));
    if(offerSaveMessage) offerSaveMessage.textContent="Offer saved successfully!";
    closeOfferEditor();
    renderOffers();
    offerMessage(`Saved offer "${payload.title}".`);
  }catch(err){
    console.error(err);
    if(offerSaveMessage) offerSaveMessage.textContent="The offer could not be saved to cloud database. Saved locally.";
    localStorage.setItem("vsbd_offers",JSON.stringify(offers));
    closeOfferEditor();
    renderOffers();
  }finally{
    button.disabled=false;
  }
}

if(!isFirebaseConfigured||!isOwnerConfigured){
  document.body.innerHTML='<main class="admin-login"><section><p class="eyebrow">Setup required</p><h1>Finish owner access.</h1><p>Add the approved owner email in <code>js/config.js</code>, then return to this page.</p><a class="button button--primary" href="index.html">Back to sign in</a></section></main>';
}else{
  onAuthStateChanged(auth,user=>{
    if(!user||!isOwner(user.email)){
      if(user)signOut(auth);
      location.href="index.html";
      return;
    }
    document.querySelector("#admin-email").textContent=user.email;
    load();
  });
  document.querySelector("#logout").addEventListener("click",()=>signOut(auth));
  document.querySelector("#new-product").addEventListener("click",()=>openEditor());
  document.querySelector("#close-editor").addEventListener("click",closeEditor);
  document.querySelector("#cancel-edit").addEventListener("click",closeEditor);
  form.addEventListener("submit",save);

  const newOfferBtn = document.querySelector("#new-offer");
  const closeOfferEditorBtn = document.querySelector("#close-offer-editor");
  const cancelOfferEditBtn = document.querySelector("#cancel-offer-edit");
  if(newOfferBtn) newOfferBtn.addEventListener("click",()=>openOfferEditor());
  if(closeOfferEditorBtn) closeOfferEditorBtn.addEventListener("click",closeOfferEditor);
  if(cancelOfferEditBtn) cancelOfferEditBtn.addEventListener("click",closeOfferEditor);
  if(offerForm) offerForm.addEventListener("submit",saveOffer);
}

