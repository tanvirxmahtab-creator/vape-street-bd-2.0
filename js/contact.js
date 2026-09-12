const BRANCHES = {
  kallyanpur: { index: "01", name: "Vape Street BD", address: "Shop:101 1st Floor Desh Shomoy Super Market, Natun Bazar, Kallyanpur, Mirpur, Dhaka -1216, Mirpur, Bangladesh, 1216", embedUrl: "https://maps.google.com/maps?q=Vape+Street+BD,+Natun+Bazar,+Kallyanpur,+Mirpur,+Dhaka&t=&z=16&ie=UTF8&iwloc=&output=embed", googleUrl: "https://www.google.com/maps/place/Vape+Street+BD/@23.785207,90.3559856,17z/data=!3m1!4b1!4m6!3m5!1s0x3755c1c465215ced:0xbb1014d74dd537d4!8m2!3d23.785207!4d90.3585605!16s%2Fg%2F11vcfrbnmn?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D" },
  "south-bishil": { index: "02", name: "Vape Street BD 2.0", address: "49/10 South Bishil, Mirpur, Bangladesh, 1216", embedUrl: "https://maps.google.com/maps?q=Vape+Street+BD+2.0,+49/10+South+Bishil,+Mirpur,+Dhaka&t=&z=16&ie=UTF8&iwloc=&output=embed", googleUrl: "https://www.google.com/maps/place/Vape+Street+BD+2.0/@23.7943087,90.3500774,17z/data=!3m1!4b1!4m6!3m5!1s0x3755c10008aad1c3:0x492336a954688838!8m2!3d23.7943087!4d90.3526523!16s%2Fg%2F11mstyf09q?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D" }
};

function setupBranchFinder() {
  const choices = [...document.querySelectorAll(".branch-choice")];
  const panel = document.querySelector("#branch-map"), kicker = document.querySelector("#branch-kicker"), name = document.querySelector("#branch-name"), address = document.querySelector("#branch-address"), directions = document.querySelector("#branch-directions"), mapLabel = document.querySelector("#branch-map-label"), mapFrame = document.querySelector("#branch-map-frame"), mapViewBtn = document.querySelector("#branch-map-view-btn");
  if (!choices.length || !panel || !kicker || !name || !address || !directions || !mapLabel || !mapFrame) return;
  const selectBranch = id => {
    const branch = BRANCHES[id];
    if (!branch) return;
    choices.forEach(choice => { const selected = choice.dataset.branch === id; choice.classList.toggle("is-active", selected); choice.setAttribute("aria-selected", String(selected)); });
    kicker.textContent = `Branch ${branch.index} / ${branch.name}`;
    name.textContent = branch.name;
    address.textContent = branch.address;
    directions.href = branch.googleUrl;
    if (mapViewBtn) mapViewBtn.href = branch.googleUrl;
    mapLabel.textContent = branch.name;
    mapFrame.title = `Google Map for ${branch.name}`;
    mapFrame.src = branch.embedUrl;
    panel.dataset.branch = id;
    panel.setAttribute("aria-label", `Google Map for ${branch.name}`);
  };
  choices.forEach((choice, index) => {
    choice.addEventListener("click", () => selectBranch(choice.dataset.branch));
    choice.addEventListener("keydown", event => {
      if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
      const next = choices[(index + direction + choices.length) % choices.length];
      next.focus();
      next.click();
    });
  });
  selectBranch(choices.find(choice => choice.classList.contains("is-active"))?.dataset.branch);
}

async function setupVapeScene() {
  const canvas = document.querySelector("#contact-vape-canvas"), section = document.querySelector(".visit-hero");
  if (!canvas || !section || !window.WebGLRenderingContext) return;
  try {
    const THREE = await import("https://unpkg.com/three@0.168.0/build/three.module.js");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.2, 11);
    const device = new THREE.Group();
    const material = new THREE.MeshPhysicalMaterial({ color: 0x15110c, metalness: 0.86, roughness: 0.22 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.15, 4.8, 0.92), material);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.82, 3.75, 0.98), new THREE.MeshPhysicalMaterial({ color: 0xcda850, metalness: 0.72, roughness: 0.29 }));
    trim.position.z = 0.08;
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.16, 2.12, 1.04), new THREE.MeshPhysicalMaterial({ color: 0x090706, metalness: 0.48, roughness: 0.13 }));
    screen.position.set(0, -0.15, 0.1);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.58, 32), new THREE.MeshPhysicalMaterial({ color: 0xe8d8a8, transparent: true, opacity: 0.44, metalness: 0.18, roughness: 0.06 }));
    tank.position.y = 3.04;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.48, 32), new THREE.MeshPhysicalMaterial({ color: 0x080706, metalness: 0.86, roughness: 0.17 }));
    cap.position.y = 3.83;
    const mouthpiece = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.45, 0.68, 32), new THREE.MeshPhysicalMaterial({ color: 0x11100e, metalness: 0.75, roughness: 0.18 }));
    mouthpiece.position.y = 4.37;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.055, 10, 32), new THREE.MeshStandardMaterial({ color: 0xf3cd68, metalness: 0.8, roughness: 0.24 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.25;
    device.add(body, trim, screen, tank, cap, mouthpiece, ring);
    device.rotation.set(-0.18, -0.56, 0.12);
    device.position.set(2.65, -0.45, 0);
    scene.add(device);
    scene.add(new THREE.HemisphereLight(0xf6ebcc, 0x080604, 1.7));
    const keyLight = new THREE.DirectionalLight(0xf5cf70, 3.6); keyLight.position.set(-4, 5, 7); scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xc89537, 18, 18); rimLight.position.set(4, -1, 4); scene.add(rimLight);
    let pointerX = 0, pointerY = 0;
    const resize = () => { const { width, height } = section.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); device.position.x = width < 680 ? 1.4 : 2.65; device.scale.setScalar(width < 680 ? 0.72 : 1); };
    const pointerMove = event => { const bounds = section.getBoundingClientRect(); pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.45; pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.16; };
    const render = time => { if (!reducedMotion) { device.rotation.y += (pointerX - device.rotation.y + 0.56) * 0.025; device.rotation.x += (pointerY - device.rotation.x - 0.18) * 0.025; device.position.y = -0.45 + Math.sin(time * 0.00055) * 0.1; } renderer.render(scene, camera); if (!reducedMotion) requestAnimationFrame(render); };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    section.addEventListener("pointermove", pointerMove, { passive: true });
    render(0);
  } catch { canvas.hidden = true; }
}

setupBranchFinder();
setupVapeScene();
