const TG = {
  token: '',
  chat: '',
  proxyUrl: 'send-order.php'
};

const PER_KG = 1500;
const TIERS = [
  { count: 1, price: 2000, min: 1.5, max: 4, sizes: [1.8], hint: 'для небольшой компании' },
  { count: 2, price: 4500, min: 3, max: 7, sizes: [1.9, 1.25], hint: 'до 25 гостей' },
  { count: 3, price: 8000, min: 5, max: 10, sizes: [2.0, 1.45, 0.92], hint: 'для большого праздника' }
];
const SHAPES = [
  { id: 'round', name: 'Круглый', price: 0, icon: '<circle cx="20" cy="20" r="14"/>' },
  { id: 'square', name: 'Квадратный', price: 0, icon: '<rect x="7" y="7" width="26" height="26" rx="6"/>' },
  { id: 'heart', name: 'Сердце', price: 700, icon: '<path d="M20 34 C6 24 4 14 11 10 C16 7 20 11 20 14 C20 11 24 7 29 10 C36 14 34 24 20 34Z"/>' }
];
const FILLINGS = [
  { id: 'strawberry', name: 'Клубничный конфи', text: 'Ванильный бисквит, сливочный крем, конфи из клубники', band: 0xe0446b, alt: 0xfbe4c8 },
  { id: 'chocolate', name: 'Шоколадный трюфель', text: 'Шоколадный корж и ганаш на бельгийском шоколаде', band: 0x3a1d14, alt: 0x7a4a35 },
  { id: 'mango', name: 'Манго-маракуйя', text: 'Крем-чиз и яркий курд из манго и маракуйи', band: 0xf6a51a, alt: 0xfbeaa8 },
  { id: 'velvet', name: 'Красный бархат', text: 'Красные коржи и крем на сливочном сыре', band: 0xa3122e, alt: 0xfff3ea },
  { id: 'pistachio', name: 'Фисташка и малина', text: 'Фисташковый мусс с малиновым кремю', band: 0x8fbf6a, alt: 0xe9457a },
  { id: 'caramel', name: 'Солёная карамель', text: 'Карамельный крем и хрустящий пекан', band: 0xc27a2c, alt: 0xf3d9a4 }
];
const COLORS = [
  { id: 'white', name: 'Белый', hex: 0xfbf7f4 },
  { id: 'pink', name: 'Розовый', hex: 0xf3aec1 },
  { id: 'blue', name: 'Голубой', hex: 0xa9d2ee },
  { id: 'lavender', name: 'Лаванда', hex: 0xc9b6ea },
  { id: 'pistachio', name: 'Фисташковый', hex: 0xb8d8a0 },
  { id: 'chocolate', name: 'Шоколадный', hex: 0x6b3f2a }
];
const DECOR = [
  { id: 'berry', name: 'Свежие ягоды', price: 500 },
  { id: 'gold', name: 'Золотая поталь', price: 300 },
  { id: 'drip', name: 'Шоколадные подтёки', price: 400 }
];

const state = { tiers: 2, shape: 'round', weight: 3, filling: 'strawberry', color: 'pink', decor: new Set(['berry']), text: '' };
const $ = id => document.getElementById(id);
const rub = n => n.toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₽';
const kg = n => String(n).replace('.', ',');
const css = n => '#' + n.toString(16).padStart(6, '0');
const tierOf = () => TIERS[state.tiers - 1];
const fillOf = () => FILLINGS.find(f => f.id === state.filling);
const colorOf = () => COLORS.find(c => c.id === state.color);
const shapeOf = () => SHAPES.find(s => s.id === state.shape);

const H = 0.9;
const BASE = 0.2;

const stage = $('stage');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 4.8, 11.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.4;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 17;
controls.maxPolarAngle = Math.PI / 2.05;
let resumeTimer;
controls.addEventListener('start', () => { clearTimeout(resumeTimer); controls.autoRotate = false; });
controls.addEventListener('end', () => { resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 2500); });

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.HemisphereLight(0xffeef4, 0x3a2247, 0.45));
const sun = new THREE.DirectionalLight(0xfff4ea, 1.0);
sun.position.set(6, 10, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 9, bottom: -5 });
sun.shadow.bias = -0.0006;
scene.add(sun);
const rim = new THREE.DirectionalLight(0xff8fb8, 0.9);
rim.position.set(-6, 5, -7);
scene.add(rim);
const cool = new THREE.DirectionalLight(0x9fb8ff, 0.35);
cool.position.set(-7, 3, 5);
scene.add(cool);

const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.2, 80), new THREE.MeshStandardMaterial({ color: 0x35213f, roughness: 0.3, metalness: 0.35 }));
pedestal.position.y = 0.1;
pedestal.receiveShadow = true;
scene.add(pedestal);
const ring = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.045, 12, 96), new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.25, metalness: 1 }));
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.2;
scene.add(ring);
const foot = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 4, 0.1, 80), new THREE.MeshStandardMaterial({ color: 0x1a1022, roughness: 0.6 }));
foot.position.y = -0.05;
foot.receiveShadow = true;
scene.add(foot);

const DUST = 150;
const dustPos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 7;
  dustPos.set([Math.cos(a) * r, Math.random() * 8, Math.sin(a) * r], i * 3);
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffd9a8, size: 0.07, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })));

const cream = new THREE.MeshStandardMaterial({ color: colorOf().hex, roughness: 0.55 });
const band = new THREE.MeshStandardMaterial({ color: fillOf().band, roughness: 0.35 });
const glaze = new THREE.MeshStandardMaterial({ color: 0x4a2a1e, roughness: 0.18, metalness: 0.1 });
const berryMat = new THREE.MeshStandardMaterial({ color: 0xd1193f, roughness: 0.3 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x4f9a3a, roughness: 0.7 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.2, metalness: 1, emissive: 0x7a5200, emissiveIntensity: 0.5 });
const colorGoal = new THREE.Color(colorOf().hex);
const bandGoal = new THREE.Color(fillOf().band);
const glazeGoal = new THREE.Color(0x4a2a1e);

const beadGeo = new THREE.SphereGeometry(0.075, 12, 10);
const berryGeo = new THREE.SphereGeometry(0.17, 20, 16);
const leafGeo = new THREE.ConeGeometry(0.1, 0.09, 6);
const flakeGeo = new THREE.SphereGeometry(1, 10, 8);
const dripGeo = new THREE.CylinderGeometry(0.065, 0.065, 1, 10);
const dripTip = new THREE.SphereGeometry(0.085, 12, 10);

const inkCanvas = document.createElement('canvas');
inkCanvas.width = 1024;
inkCanvas.height = 512;
const inkTexture = new THREE.CanvasTexture(inkCanvas);
inkTexture.anisotropy = 8;
const inkMat = new THREE.MeshBasicMaterial({ map: inkTexture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });

const cake = new THREE.Group();
scene.add(cake);
let tierGroups = [];
let sparkles = [];
let inkMesh = null;
let dropStart = -10;
let scaleGoal = 1;

function makeShape(kind, r) {
  const s = new THREE.Shape();
  if (kind === 'round') {
    s.absarc(0, 0, r, 0, Math.PI * 2, false);
  } else if (kind === 'square') {
    const h = r * 0.86, c = Math.min(0.32, h * 0.3);
    s.moveTo(-h + c, -h);
    s.lineTo(h - c, -h); s.quadraticCurveTo(h, -h, h, -h + c);
    s.lineTo(h, h - c); s.quadraticCurveTo(h, h, h - c, h);
    s.lineTo(-h + c, h); s.quadraticCurveTo(-h, h, -h, h - c);
    s.lineTo(-h, -h + c); s.quadraticCurveTo(-h, -h, -h + c, -h);
  } else {
    const k = r / 10.5, p = (x, y) => [(x - 5) * k, (9.5 - y) * k];
    const m = (a, b) => s.moveTo(...p(a, b));
    const c = (a, b, c1, d, e, f) => s.bezierCurveTo(...p(a, b), ...p(c1, d), ...p(e, f));
    m(5, 5);
    c(5, 5, 4, 0, 0, 0);
    c(-6, 0, -6, 7, -6, 7);
    c(-6, 11, -3, 15.4, 5, 19);
    c(12, 15.4, 16, 11, 16, 7);
    c(16, 7, 16, 0, 10, 0);
    c(7, 0, 5, 5, 5, 5);
  }
  return s;
}

function slab(kind, r, h, y, mat) {
  const geo = new THREE.ExtrudeGeometry(makeShape(kind, r), { depth: h - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 44 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y + 0.03, 0);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function outline(kind, r, count) {
  return makeShape(kind, r).getSpacedPoints(count).slice(0, count);
}

function perimeterCount(kind, r, step) {
  return Math.max(8, Math.round(makeShape(kind, r).getLength() / step));
}

function addBeads(g, kind, r, base, top) {
  const upper = outline(kind, r - 0.04, perimeterCount(kind, r - 0.04, 0.2));
  const lower = outline(kind, r + 0.03, perimeterCount(kind, r + 0.03, 0.24));
  const mesh = new THREE.InstancedMesh(beadGeo, cream, upper.length + lower.length);
  const m = new THREE.Matrix4();
  let n = 0;
  upper.forEach(p => { m.compose(new THREE.Vector3(p.x, top + 0.02, -p.y), new THREE.Quaternion(), new THREE.Vector3(1, 0.8, 1)); mesh.setMatrixAt(n++, m); });
  lower.forEach(p => { m.compose(new THREE.Vector3(p.x, base + 0.07, -p.y), new THREE.Quaternion(), new THREE.Vector3(1.3, 1.1, 1.3)); mesh.setMatrixAt(n++, m); });
  mesh.castShadow = true;
  g.add(mesh);
}

function addDrips(g, kind, r, top) {
  outline(kind, r + 0.035, perimeterCount(kind, r, 0.3)).forEach(p => {
    if (Math.random() > 0.78) return;
    const len = 0.18 + Math.random() * 0.5;
    const shaft = new THREE.Mesh(dripGeo, glaze);
    shaft.scale.y = len;
    shaft.position.set(p.x, top + 0.03 - len / 2, -p.y);
    const tip = new THREE.Mesh(dripTip, glaze);
    tip.position.set(p.x, top + 0.03 - len, -p.y);
    g.add(shaft, tip);
  });
}

function addBerries(g, kind, ringR, y) {
  const pts = outline(kind, ringR, perimeterCount(kind, ringR, 0.46));
  pts.forEach(p => {
    const b = new THREE.Group();
    const fruit = new THREE.Mesh(berryGeo, berryMat);
    fruit.scale.set(1, 1.2, 1);
    fruit.castShadow = true;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = 0.2;
    b.add(fruit, leaf);
    b.position.set(p.x, y, -p.y);
    b.rotation.y = Math.random() * 3;
    g.add(b);
  });
}

function addGold(g, kind, r, next, base, top) {
  const edge = outline(kind, r + 0.04, 160);
  const count = Math.round(r * 30);
  for (let k = 0; k < count; k++) {
    const flake = new THREE.Mesh(flakeGeo, goldMat);
    const size = 0.025 + Math.random() * 0.035;
    flake.scale.setScalar(size);
    const p = edge[Math.floor(Math.random() * edge.length)];
    if (Math.random() < 0.4 && r - next > 0.35) {
      const f = (next + 0.15) / r + Math.random() * (1 - (next + 0.3) / r);
      flake.position.set(p.x * f, top + 0.08, -p.y * f);
    } else {
      flake.position.set(p.x, base + 0.15 + Math.random() * (H - 0.3), -p.y);
    }
    flake.userData = { phase: Math.random() * 6.28, size };
    sparkles.push(flake);
    g.add(flake);
  }
}

function addInscription(g, r, y) {
  const w = Math.min(2.9, r * 1.75);
  inkMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), inkMat);
  inkMesh.rotation.x = -Math.PI / 2;
  inkMesh.position.set(0, y + 0.01, r * 0.12);
  inkMesh.visible = state.text.trim().length > 0;
  g.add(inkMesh);
}

function buildTier(i) {
  const cfg = tierOf(), r = cfg.sizes[i], next = cfg.sizes[i + 1], kind = state.shape;
  const isTop = next === undefined;
  const base = BASE + i * H, top = base + H;
  const g = new THREE.Group();
  g.add(slab(kind, r, H, base, cream), slab(kind, r + 0.035, 0.07, base + H * 0.3, band), slab(kind, r + 0.035, 0.07, base + H * 0.62, band));
  const dripping = state.decor.has('drip');
  if (dripping) {
    g.add(slab(kind, r - 0.02, 0.06, top - 0.02, glaze));
    addDrips(g, kind, r, top);
  }
  addBeads(g, kind, r, base, top);
  const y = top + (dripping ? 0.04 : 0);
  if (state.decor.has('berry')) addBerries(g, kind, isTop ? r - 0.3 : (r + next) / 2 + 0.05, y + 0.14);
  if (state.decor.has('gold')) addGold(g, kind, r, next || 0, base, top);
  if (isTop) addInscription(g, r, y);
  return g;
}

function clearCake() {
  cake.traverse(n => { if (n.geometry && n.geometry.type === 'ExtrudeGeometry') n.geometry.dispose(); });
  while (cake.children.length) cake.remove(cake.children[0]);
  tierGroups = [];
  sparkles = [];
  inkMesh = null;
}

function rebuild(animate) {
  clearCake();
  const cfg = tierOf();
  cfg.sizes.forEach((_, i) => {
    const g = buildTier(i);
    g.userData.delay = i * 0.2;
    tierGroups.push(g);
    cake.add(g);
  });
  controls.target.set(0, BASE + (cfg.count * H) / 2, 0);
  dropStart = animate ? clock.getElapsedTime() : -10;
}

function drawInscription() {
  const ctx = inkCanvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 512);
  const text = state.text.trim();
  if (!text) return;
  const dark = new THREE.Color(colorOf().hex).getHSL({}).l < 0.3;
  let size = 130;
  ctx.font = `italic 600 ${size}px "Playfair Display", Georgia, serif`;
  while (ctx.measureText(text).width > 900 && size > 44) {
    size -= 4;
    ctx.font = `italic 600 ${size}px "Playfair Display", Georgia, serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = dark ? '#fff4ea' : '#7a2545';
  ctx.fillText(text, 512, 256);
  inkTexture.needsUpdate = true;
}

function fitWeight() {
  const t = tierOf();
  state.weight = Math.min(t.max, Math.max(t.min, state.weight));
  const s = $('weight');
  s.min = t.min;
  s.max = t.max;
  s.value = state.weight;
  $('wMin').textContent = kg(t.min) + ' кг';
  $('wMax').textContent = kg(t.max) + ' кг';
  $('wHint').textContent = t.hint;
}

function calc() {
  const t = tierOf();
  const extra = Math.round(Math.max(0, state.weight - t.min) * PER_KG);
  const shape = shapeOf().price;
  const decor = DECOR.filter(d => state.decor.has(d.id)).reduce((s, d) => s + d.price, 0);
  return { base: t.price, extra, shape, decor, total: t.price + extra + shape + decor };
}

function renderUI() {
  const p = calc(), t = tierOf();
  document.querySelectorAll('[data-tier]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.tier === state.tiers));
  document.querySelectorAll('[data-shape]').forEach(b => b.setAttribute('aria-pressed', b.dataset.shape === state.shape));
  document.querySelectorAll('[data-fill]').forEach(b => b.setAttribute('aria-pressed', b.dataset.fill === state.filling));
  document.querySelectorAll('[data-color]').forEach(b => b.setAttribute('aria-pressed', b.dataset.color === state.color));
  document.querySelectorAll('[data-decor]').forEach(i => { i.checked = state.decor.has(i.dataset.decor); i.parentElement.classList.toggle('on', i.checked); });
  $('weightVal').textContent = kg(state.weight);
  $('colorName').textContent = colorOf().name;
  $('counter').textContent = state.text.length + ' / 30';

  const rows = [
    [`${t.count} ${t.count === 1 ? 'ярус' : 'яруса'}, ${shapeOf().name.toLowerCase()}`, rub(p.base)],
    [`Вес ${kg(state.weight)} кг`, p.extra ? '+' + rub(p.extra) : 'в цене'],
    [`Начинка: ${fillOf().name}`, 'в цене'],
    [`Крем: ${colorOf().name.toLowerCase()}`, 'в цене']
  ];
  if (p.shape) rows.push(['Форма «сердце»', '+' + rub(p.shape)]);
  DECOR.filter(d => state.decor.has(d.id)).forEach(d => rows.push([d.name, '+' + rub(d.price)]));
  rows.push([state.text.trim() ? `Надпись: «${state.text.trim()}»` : 'Без надписи', '']);
  $('summary').innerHTML = rows.map(r => `<li><span></span><span class="sum-price">${r[1]}</span></li>`).join('');
  $('summary').querySelectorAll('li').forEach((li, i) => { li.firstChild.textContent = rows[i][0]; });
  $('total').textContent = rub(p.total);
  $('chip').textContent = rub(p.total);
  scaleGoal = 0.88 + ((state.weight - 1.5) / 8.5) * 0.3;
}

function updateGoals() {
  colorGoal.set(colorOf().hex);
  bandGoal.set(fillOf().band);
  glazeGoal.set(state.color === 'chocolate' ? 0xf0e2cf : 0x4a2a1e);
  drawInscription();
}

$('tiers').innerHTML = TIERS.map(t => `<button class="opt opt-tier" data-tier="${t.count}" aria-pressed="false"><span class="opt-title">${t.count} ${t.count === 1 ? 'ярус' : 'яруса'}</span><span class="opt-sub">от ${rub(t.price)}</span></button>`).join('');
$('shapes').innerHTML = SHAPES.map(s => `<button class="opt opt-shape" data-shape="${s.id}" aria-pressed="false"><svg class="shape-icon" viewBox="0 0 40 40" fill="currentColor">${s.icon}</svg><span class="opt-title">${s.name}</span><span class="opt-sub">${s.price ? '+' + rub(s.price) : 'в цене'}</span></button>`).join('');
$('fillings').innerHTML = FILLINGS.map(f => `<button class="opt opt-fill" data-fill="${f.id}" aria-pressed="false"><div class="fill-strip">${[f.alt, f.band, f.alt, f.band].map(c => `<i style="background:${css(c)}"></i>`).join('')}</div><span class="opt-title">${f.name}</span><span class="opt-sub">${f.text}</span></button>`).join('');
$('colors').innerHTML = COLORS.map(c => `<button class="swatch" data-color="${c.id}" style="background:${css(c.hex)}" aria-label="${c.name}" aria-pressed="false"></button>`).join('');
$('decor').innerHTML = DECOR.map(d => `<label class="opt opt-check"><input type="checkbox" data-decor="${d.id}"><span>${d.name} <b>+${rub(d.price)}</b></span></label>`).join('');

document.addEventListener('click', e => {
  const tier = e.target.closest('[data-tier]');
  const shape = e.target.closest('[data-shape]');
  const fill = e.target.closest('[data-fill]');
  const color = e.target.closest('[data-color]');
  if (!tier && !shape && !fill && !color) return;
  if (tier) { state.tiers = +tier.dataset.tier; fitWeight(); rebuild(true); }
  if (shape) { state.shape = shape.dataset.shape; rebuild(true); }
  if (fill) state.filling = fill.dataset.fill;
  if (color) state.color = color.dataset.color;
  if (fill || color) updateGoals();
  renderUI();
});
document.addEventListener('change', e => {
  const box = e.target.closest('[data-decor]');
  if (!box) return;
  box.checked ? state.decor.add(box.dataset.decor) : state.decor.delete(box.dataset.decor);
  rebuild(false);
  renderUI();
});
$('weight').addEventListener('input', e => { state.weight = +e.target.value; renderUI(); });
$('inscription').addEventListener('input', e => {
  state.text = e.target.value.slice(0, 30);
  if (inkMesh) inkMesh.visible = state.text.trim().length > 0;
  drawInscription();
  renderUI();
});

function spec() {
  const p = calc();
  return [
    'Новый заказ — Sweet Magic', '',
    `Ярусов: ${state.tiers}`,
    `Форма: ${shapeOf().name}`,
    `Вес: ${kg(state.weight)} кг`,
    `Начинка: ${fillOf().name}`,
    `Цвет крема: ${colorOf().name}`,
    `Декор: ${DECOR.filter(d => state.decor.has(d.id)).map(d => d.name).join(', ') || 'нет'}`,
    `Надпись: ${state.text.trim() || '—'}`, '',
    `Базовая цена: ${p.base} ₽`,
    `Доплата за вес: ${p.extra} ₽`,
    `Доплата за форму: ${p.shape} ₽`,
    `Декор: ${p.decor} ₽`,
    `Итого: ${p.total} ₽`, '',
    `Клиент: ${$('name').value.trim()}`,
    `Телефон: ${$('phone').value.trim()}`
  ].join('\n');
}

function showModal(title, text, specText, success) {
  $('mTitle').textContent = title;
  $('mText').textContent = text;
  $('mSpec').textContent = specText || '';
  $('mSpec').classList.toggle('hidden', !specText);
  $('mCopy').classList.toggle('hidden', !specText);
  $('mCopy').textContent = 'Скопировать';
  $('mIcon').classList.toggle('hidden', !success);
  $('modal').showModal();
}

function showError(msg) {
  $('error').textContent = msg;
  $('error').classList.remove('hidden');
}

$('send').addEventListener('click', async () => {
  $('error').classList.add('hidden');
  if ($('name').value.trim().length < 2) return showError('Укажите, как к вам обращаться');
  if ($('phone').value.replace(/\D/g, '').length < 10) return showError('Проверьте номер телефона — не хватает цифр');
  const text = spec();
  const configured = TG.proxyUrl || (TG.token && TG.chat);
  if (!configured) return showModal('Заказ собран', 'Telegram-бот не подключён, поэтому вот готовая спецификация. Скопируйте её и отправьте кондитеру.', text);

  const btn = $('send');
  btn.disabled = true;
  btn.textContent = 'Отправляем…';
  try {
    const url = TG.proxyUrl || `https://api.telegram.org/bot${TG.token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG.chat, text })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok !== true) throw new Error(data.description || `HTTP ${res.status}`);
    showModal('Заказ отправлен', 'Кондитер напишет или позвонит в течение часа.', null, true);
  } catch (err) {
    console.error('Telegram:', err.message);
    showModal('Не получилось отправить', 'Скопируйте заказ и пришлите кондитеру в Telegram.', text);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Отправить заказ кондитеру';
  }
});
$('mClose').addEventListener('click', () => $('modal').close());
$('mCopy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('mSpec').textContent); $('mCopy').textContent = 'Скопировано'; }
  catch (err) { $('mCopy').textContent = 'Выделите текст вручную'; }
});

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w / h < 0.9 ? 54 : 40;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);

const clock = new THREE.Clock();
const easeOutBack = p => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2);

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  cream.color.lerp(colorGoal, 0.1);
  band.color.lerp(bandGoal, 0.1);
  glaze.color.lerp(glazeGoal, 0.1);

  const s = cake.scale.x + (scaleGoal - cake.scale.x) * 0.12;
  cake.scale.set(s, 1, s);

  tierGroups.forEach(g => {
    const p = Math.min(1, Math.max(0, (t - dropStart - g.userData.delay) / 0.65));
    g.visible = p > 0;
    g.position.y = (1 - easeOutBack(p)) * 2.6;
  });

  sparkles.forEach(f => f.scale.setScalar(f.userData.size * (1 + Math.sin(t * 3.2 + f.userData.phase) * 0.45)));

  for (let i = 0; i < DUST; i++) {
    const y = dustPos[i * 3 + 1] + 0.004 + (i % 5) * 0.0008;
    dustPos[i * 3 + 1] = y > 8 ? 0 : y;
  }
  dustGeo.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
}

fitWeight();
updateGoals();
rebuild(true);
renderUI();
resize();
animate();
if (document.fonts) document.fonts.ready.then(drawInscription);
