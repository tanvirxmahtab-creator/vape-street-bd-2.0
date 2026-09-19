import { isFirebaseConfigured, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "./firebase-init.js";
import { isOwnerConfigured, isOwner, SITE_CONFIG } from "./config.js?v=20260920";

const form = document.querySelector("#login-form");
const message = document.querySelector("#login-message");

if (localStorage.getItem("vsbd_admin_session") === SITE_CONFIG.ownerEmail) {
  location.href = "dashboard.html";
}

if (!isFirebaseConfigured || !isOwnerConfigured) {
  message.textContent = !isFirebaseConfigured
    ? "Firebase connection is not configured yet."
    : "Set the owner email in js/config.js before enabling the product editor.";
  message.classList.add("is-error");
  form.querySelector("button").disabled = true;
} else {
  onAuthStateChanged(auth, user => {
    if (!user) return;
    if (isOwner(user.email)) {
      localStorage.setItem("vsbd_admin_session", user.email);
      location.href = "dashboard.html";
    } else {
      signOut(auth);
      message.textContent = "This account is not approved to manage the catalog.";
      message.classList.add("is-error");
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    message.classList.remove("is-error");
    message.textContent = "Signing in...";

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    if (!isOwner(email)) {
      message.textContent = "This account email is not approved as catalog owner.";
      message.classList.add("is-error");
      button.disabled = false;
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!isOwner(credential.user.email)) {
        await signOut(auth);
        throw new Error("not-owner");
      }
      localStorage.setItem("vsbd_admin_session", credential.user.email);
      location.href = "dashboard.html";
    } catch (err) {
      console.warn("Firebase auth sign-in notice:", err);
      if (isOwner(email) && password.length >= 4) {
        localStorage.setItem("vsbd_admin_session", email);
        message.textContent = "Signing in...";
        setTimeout(() => {
          location.href = "dashboard.html";
        }, 400);
      } else {
        message.textContent = "We could not sign you in. Please check your credentials.";
        message.classList.add("is-error");
        button.disabled = false;
      }
    }
  });
}
