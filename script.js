import {
  saveUserData,
  loadUserData
} from './firebase.js';
/* ============================================================
   script.js — TCS NQT Prep Dashboard Logic
   All state managed via localStorage
   ============================================================ */

// ── DOM refs ──────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const sidebarItems   = document.querySelectorAll('.sidebar-item');
const questionList   = document.getElementById('questionList');
const mainPanel      = document.getElementById('mainPanel');
const revisionPanel  = document.getElementById('revisionPanel');
const sectionTitle   = document.getElementById('sectionTitle');
const sectionCount   = document.getElementById('sectionCount');
const searchInput    = document.getElementById('searchInput');
const toastContainer = document.getElementById('toastContainer');

// Stats
const statTotal      = document.getElementById('statTotal');
const statDone       = document.getElementById('statDone');
const statPending    = document.getElementById('statPending');
const statRevision   = document.getElementById('statRevision');
const progressFill   = document.getElementById('progressFill');
const progressPct    = document.getElementById('progressPct');

// Filters
let activeTopicFilter    = 'All';
let activeDiffFilter     = 'All';
let activeStatusFilter   = 'All';

// ── LocalStorage Helpers ───────────────────────────────────
const LS_KEY = 'tcs_nqt_v2';

// User keys
const USERS_KEY = 'tcs_nqt_users';
const CURRENT_USER_KEY = 'tcs_nqt_user';

function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY) || null;
}
function setCurrentUser(u) {
  if (u) localStorage.setItem(CURRENT_USER_KEY, u);
  else localStorage.removeItem(CURRENT_USER_KEY);
}

function getStorageKey() {
  const user = getCurrentUser();
  return user ? `${LS_KEY}_user_${user}` : `${LS_KEY}_guest`;
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(getStorageKey())) || {}; }
  catch(e) { return {}; }
}

async function syncFromFirebase() {
  const user = getCurrentUser();
  if (!user) return;

  const firebaseData = await loadUserData(user);

  // FIX 2: Only overwrite localStorage if Firebase has actual data
  if (firebaseData && Object.keys(firebaseData).length > 0) {
    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(firebaseData)
    );
    console.log("Firebase Sync Success");
  }
}

async function saveState(state) {
  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(state)
  );

  const user = getCurrentUser();
  if (user) {
    await saveUserData(user, state);
  }
}

function getQ(id) {
  const s = loadState();
  return s[id] || { practiced: false, completed: false, revision: false, starred: false, notes: '', approach: '', code: '', trick: '', images: [], updatedAt: null };
}

// FIX 3: saveState is async — catch errors silently
function setQ(id, updates) {
  const s = loadState();
  s[id] = { ...getQ(id), ...updates };
  saveState(s).catch(console.error);
}

// ── Auth helpers ─────────────────────────────────────────
function openAuthModal() {
  document.getElementById('authModal').style.display = 'block';
  document.getElementById('authMsg').textContent = '';
}
function closeAuthModal() { document.getElementById('authModal').style.display = 'none'; }

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
  catch(e) { return {}; }
}
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

function signupUser(username, password) {
  if (!username || !password) { return 'Enter username & password'; }
  const users = getUsers();
  if (users[username]) return 'User already exists';
  users[username] = { password };
  saveUsers(users);
  setCurrentUser(username);
  return null;
}

function signinUser(username, password) {
  const users = getUsers();
  if (!users[username]) return 'User not found';
  if (users[username].password !== password) return 'Incorrect password';
  setCurrentUser(username);
  return null;
}

async function signoutUser() {

  setCurrentUser(null);

  await init();

  showToast('Signed out');
}

// Render username in header
function updateUserUI() {
  const u = getCurrentUser();
  const disp = document.getElementById('usernameDisplay');
  const authBtn = document.getElementById('authBtn');
  if (u) {
    disp.textContent = u;
    authBtn.title = 'Sign out';
    authBtn.textContent = '👤';
  } else {
    disp.textContent = '';
    authBtn.title = 'Sign in / Sign up';
    authBtn.textContent = '👤';
  }
}

// ── My Notes modal ────────────────────────────────────────
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSavedTime(ts) {
  if (!ts) return 'Saved content';
  try {
    return `Saved ${new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`;
  } catch (e) {
    return 'Saved content';
  }
}

function renderSavedPreview(text) {
  const value = (text || '').trim();
  if (!value) return '<span class="saved-note-empty">Nothing saved yet. Type below to store your note.</span>';
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function openNotesModal() {
  const modal = document.getElementById('notesModal');
  const list = document.getElementById('notesList');
  list.innerHTML = '';
  const notes = [];
  QUESTIONS.forEach(q => {
    const d = getQ(q.id);
    if ((d.notes && d.notes.trim()) || (d.approach && d.approach.trim()) || (d.code && d.code.trim()) || (d.trick && d.trick.trim()) || (d.images && d.images.length)) {
      notes.push({ q, d });
    }
  });
  if (!notes.length) {
    list.innerHTML = '<div class="empty-state">No notes yet. Open a question and add your notes.</div>';
  } else {
    notes.forEach(item => {
      const div = document.createElement('div');
      const previewParts = [];
      if (item.d.notes && item.d.notes.trim()) previewParts.push(item.d.notes.trim());
      if (item.d.approach && item.d.approach.trim()) previewParts.push(`Approach: ${item.d.approach.trim()}`);
      if (item.d.code && item.d.code.trim()) previewParts.push(`Code: ${item.d.code.trim()}`);
      if (item.d.trick && item.d.trick.trim()) previewParts.push(`Trick: ${item.d.trick.trim()}`);

      const previewText = previewParts.join('\n\n');
      const preview = previewText.length > 320 ? `${previewText.slice(0, 320).trim()}...` : previewText;

      div.className = 'note-card';
      div.innerHTML = `
        <div class="note-card-head">
          <div class="note-card-meta">
            <span class="rev-topic">${escapeHtml(item.q.topic)}</span>
            <span class="note-card-id">#${String(item.q.id).padStart(3, '0')}</span>
          </div>
          <div class="note-card-title">${escapeHtml(item.q.title)}</div>
        </div>
        <div class="note-card-preview">${escapeHtml(preview || 'Saved note available.').replace(/\n/g, '<br>')}</div>
        <div class="note-card-footer">
          <span class="note-card-stats">${item.d.images && item.d.images.length ? `${item.d.images.length} image${item.d.images.length > 1 ? 's' : ''}` : 'Text note'}</span>
          <div class="note-card-actions">
            <button class="link-btn note-view-btn">View</button>
            <button class="link-btn note-edit-btn">Edit</button>
          </div>
        </div>
      `;
      div.querySelector('.note-view-btn').addEventListener('click', () => {
        closeNotesModal();
        jumpToQuestion(item.q.id);
      });
      div.querySelector('.note-edit-btn').addEventListener('click', () => {
        closeNotesModal();
        openNoteEditor(item.q.id);
      });
      list.appendChild(div);
    });
  }
  modal.style.display = 'block';
}

function closeNotesModal() { document.getElementById('notesModal').style.display = 'none'; }

// ── Stats Calculation ──────────────────────────────────────
function calcStats() {
  const total     = QUESTIONS.length;
  let completed   = 0;
  let revisionCnt = 0;

  QUESTIONS.forEach(q => {
    const d = getQ(q.id);
    if (d.completed)  completed++;
    if (d.revision)   revisionCnt++;
  });

  const pending = total - completed;
  const pct     = total ? Math.round((completed / total) * 100) : 0;

  statTotal.textContent    = total;
  statDone.textContent     = completed;
  statPending.textContent  = pending;
  statRevision.textContent = revisionCnt;
  progressFill.style.width = pct + '%';
  progressPct.textContent  = pct + '%';
}

// ── Render Questions ───────────────────────────────────────
function renderQuestions(questions) {
  questionList.innerHTML = '';

  if (!questions.length) {
    questionList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No questions found. Try changing filters.</p>
      </div>`;
    sectionCount.textContent = '0';
    return;
  }

  sectionCount.textContent = questions.length;

  questions.forEach((q, idx) => {
    const d = getQ(q.id);
    const card = document.createElement('div');
    card.className = 'q-card' + (d.completed ? ' completed-row' : '');
    card.style.animationDelay = (idx * 0.03) + 's';
    card.dataset.id = q.id;

    card.innerHTML = `
      <div class="q-header" onclick="toggleExpand(${q.id})">
        <span class="q-num">#${String(q.id).padStart(3,'0')}</span>
        <span class="q-title">${q.title}</span>
        <span class="q-badge ${q.difficulty}">${q.difficulty}</span>
        <div class="q-actions" onclick="event.stopPropagation()">
          <div class="q-check-group">
            <label class="q-check-label" title="Practiced">
              <input type="checkbox" ${d.practiced ? 'checked' : ''}
                onchange="handleCheck(${q.id},'practiced',this.checked)">
              <span class="check-dot">${d.practiced?'✓':''}</span>
              P
            </label>
            <label class="q-check-label" title="Completed">
              <input type="checkbox" ${d.completed ? 'checked' : ''}
                onchange="handleCheck(${q.id},'completed',this.checked)">
              <span class="check-dot">${d.completed?'✓':''}</span>
              ✅
            </label>
            <label class="q-check-label revision-label" title="Add to Revision">
              <input type="checkbox" ${d.revision ? 'checked' : ''}
                onchange="handleCheck(${q.id},'revision',this.checked)">
              <span class="check-dot">${d.revision?'✓':''}</span>
              🔁
            </label>
          </div>
          <button class="star-btn ${d.starred ? 'starred' : ''}"
            onclick="handleStar(${q.id})" title="Star">★</button>
          <button class="notes-btn" onclick="openNotes(${q.id})" title="Open Notes">📝</button>
          <a href="${q.link}" target="_blank" class="link-btn">Practice →</a>
          <button class="expand-btn" id="expandBtn${q.id}">▼</button>
        </div>
      </div>

      <div class="q-expand" id="expand${q.id}">
        <div class="q-expand-inner">
          <div class="expand-tabs">
            <button class="expand-tab active" onclick="switchTab(${q.id},'notes',this)">📝 Notes</button>
            <button class="expand-tab" onclick="switchTab(${q.id},'approach',this)">🧠 Approach</button>
            <button class="expand-tab" onclick="switchTab(${q.id},'code',this)">💻 Code</button>
            <button class="expand-tab" onclick="switchTab(${q.id},'trick',this)">⚡ Trick</button>
          </div>

          <div class="expand-panel active" id="panel_notes_${q.id}">
            <div class="area-label">My Notes</div>
            <textarea class="notes-area" placeholder="Write your notes here... (e.g., what the problem is about, approach summary)"
              oninput="autoSave(${q.id},'notes',this.value)" onpaste="handlePaste(event,${q.id})">${d.notes || ''}</textarea>
            <div class="save-indicator" id="si_notes_${q.id}">✓ Saved</div>
            <div class="saved-note-box">
              <div class="saved-note-head">
                <span class="saved-note-label">Saved Note Preview</span>
                <span class="saved-note-time" id="saved_notes_time_${q.id}">${formatSavedTime(d.updatedAt)}</span>
              </div>
              <div class="saved-note-content" id="saved_notes_${q.id}">${renderSavedPreview(d.notes)}</div>
            </div>

            <div style="margin-top:10px">
              <label style="font-size:0.85rem;color:var(--text-muted);font-weight:700;margin-bottom:6px;display:block">Attach images (screens, diagrams):</label>
              <input type="file" accept="image/*" onchange="handleImageUpload(${q.id},this)" />
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:8px">You can also drag & drop images here or paste into the notes field.</div>
            <div class="img-gallery" id="imgGallery_${q.id}" ondragover="event.preventDefault()" ondrop="handleDrop(event,${q.id})">
              ${ (d.images || []).map((img, i) => `
                <div class="img-thumb" data-idx="${i}">
                  <img src="${img.src}" alt="${img.name || 'img'}">
                  <button class="img-remove" onclick="removeImage(${q.id},${i})" title="Remove">✕</button>
                </div>
              `).join('') }
            </div>
          </div>

          <div class="expand-panel" id="panel_approach_${q.id}">
            <div class="area-label">Approach / Algorithm</div>
            <textarea class="notes-area" placeholder="Step-by-step algorithm, time & space complexity, edge cases..."
              oninput="autoSave(${q.id},'approach',this.value)" onpaste="handlePaste(event,${q.id})">${d.approach || ''}</textarea>
            <div class="save-indicator" id="si_approach_${q.id}">✓ Saved</div>
          </div>

          <div class="expand-panel" id="panel_code_${q.id}">
            <div class="area-label">Code Snippet (Java / Python / C++)</div>
            <textarea class="code-area" placeholder="// Paste or write your code solution here..."
              oninput="autoSave(${q.id},'code',this.value)" onpaste="handlePaste(event,${q.id})">${d.code || ''}</textarea>
            <div class="save-indicator" id="si_code_${q.id}">✓ Saved</div>
          </div>

          <div class="expand-panel" id="panel_trick_${q.id}">
            <div class="area-label">Quick Trick / Last-Minute Revision</div>
            <textarea class="notes-area" placeholder="One-liner trick, pattern to remember, interview tip..."
              oninput="autoSave(${q.id},'trick',this.value)" onpaste="handlePaste(event,${q.id})">${d.trick || ''}</textarea>
            <div class="save-indicator" id="si_trick_${q.id}">✓ Saved</div>
          </div>
        </div>
      </div>
    `;
    questionList.appendChild(card);
  });
}

// ── Toggle Expand ──────────────────────────────────────────
function toggleExpand(id) {
  const el  = document.getElementById('expand' + id);
  const btn = document.getElementById('expandBtn' + id);
  const isOpen = el.classList.contains('open');
  el.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
}

// ── Tab Switch ────────────────────────────────────────────
function switchTab(id, tab, btnEl) {
  const panels = ['notes','approach','code','trick'];
  panels.forEach(p => {
    const panel = document.getElementById(`panel_${p}_${id}`);
    if (panel) panel.classList.toggle('active', p === tab);
  });
  // Update tab buttons
  const tabContainer = btnEl.closest('.expand-tabs');
  tabContainer.querySelectorAll('.expand-tab').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
}

// ── Auto-save with debounce ───────────────────────────────
const saveTimers = {};
function autoSave(id, field, value) {
  setQ(id, { [field]: value, updatedAt: Date.now() });
  const siKey = `si_${field}_${id}`;
  const ind = document.getElementById(siKey);
  if (!ind) return;
  ind.classList.add('show');
  clearTimeout(saveTimers[siKey]);
  saveTimers[siKey] = setTimeout(() => ind.classList.remove('show'), 1500);

  const previewEl = document.getElementById(`saved_${field}_${id}`);
  if (previewEl) previewEl.innerHTML = renderSavedPreview(value);
  const timeEl = document.getElementById(`saved_${field}_time_${id}`);
  if (timeEl) timeEl.textContent = formatSavedTime(Date.now());
}

// ── Check Handlers ────────────────────────────────────────
function handleCheck(id, field, value) {
  setQ(id, { [field]: value });
  // Update card style for completed
  if (field === 'completed') {
    const card = document.querySelector(`.q-card[data-id="${id}"]`);
    if (card) card.classList.toggle('completed-row', value);
  }
  calcStats();
  if (field === 'revision' && value) showToast('Added to revision list! 🔁');
  if (field === 'completed' && value) showToast('Question marked complete! ✅');
}

// ── Star ──────────────────────────────────────────────────
function handleStar(id) {
  const d = getQ(id);
  const newVal = !d.starred;
  setQ(id, { starred: newVal });
  const btn = document.querySelector(`.q-card[data-id="${id}"] .star-btn`);
  if (btn) btn.classList.toggle('starred', newVal);
  showToast(newVal ? 'Starred! ⭐' : 'Unstarred');
}

// ── Sidebar Navigation ────────────────────────────────────
function setActiveTopic(topic, clickedEl) {
  activeTopicFilter = topic;
  // Update sidebar active
  sidebarItems.forEach(el => el.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');

  if (topic === 'Revision') {
    showRevisionMode();
    return;
  }

  mainPanel.classList.add('visible');
  mainPanel.style.display = 'block';
  revisionPanel.classList.remove('visible');
  revisionPanel.style.display = 'none';

  sectionTitle.textContent = topic === 'All' ? 'All Questions' : topic;
  applyFilters();
}

// ── Filter Bar ────────────────────────────────────────────
document.querySelectorAll('.diff-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.diff-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeDiffFilter = chip.dataset.diff;
    applyFilters();
  });
});

document.querySelectorAll('.status-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.status-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeStatusFilter = chip.dataset.status;
    applyFilters();
  });
});

function applyFilters() {
  let filtered = [...QUESTIONS];

  // Topic filter
  if (activeTopicFilter !== 'All') {
    filtered = filtered.filter(q => q.topic === activeTopicFilter);
  }

  // Difficulty filter
  if (activeDiffFilter !== 'All') {
    filtered = filtered.filter(q => q.difficulty === activeDiffFilter);
  }

  // Status filter
  if (activeStatusFilter === 'Completed') {
    filtered = filtered.filter(q => getQ(q.id).completed);
  } else if (activeStatusFilter === 'Pending') {
    filtered = filtered.filter(q => !getQ(q.id).completed);
  } else if (activeStatusFilter === 'Starred') {
    filtered = filtered.filter(q => getQ(q.id).starred);
  }

  // Search filter
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(q =>
      q.title.toLowerCase().includes(query) ||
      q.topic.toLowerCase().includes(query) ||
      q.difficulty.toLowerCase().includes(query)
    );
  }

  renderQuestions(filtered);
}

// ── Search ────────────────────────────────────────────────
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilters, 250);
});

// ── Revision Mode ─────────────────────────────────────────
function showRevisionMode() {
  mainPanel.classList.remove('visible');
  mainPanel.style.display = 'none';
  revisionPanel.classList.add('visible');
  revisionPanel.style.display = 'flex';
  renderRevisionMode();
}

function renderRevisionMode() {
  // Starred
  const starredList  = QUESTIONS.filter(q => getQ(q.id).starred);
  const revList      = QUESTIONS.filter(q => getQ(q.id).revision);
  const weakList     = QUESTIONS.filter(q => !getQ(q.id).completed && getQ(q.id).practiced);
  const importantQ   = QUESTIONS.filter(q => q.starred); // from data
  const freqAsked    = QUESTIONS.filter(q => ['Medium','Hard'].includes(q.difficulty));

  renderRevSection('revStarred',   starredList,  'No starred questions yet. Click ★ on any question!');
  renderRevSection('revRevision',  revList,      'No questions added to revision yet. Check the 🔁 box!');
  renderRevSection('revWeak',      weakList,     'No pending practiced questions. Keep going!');
  renderRevSection('revImportant', importantQ.slice(0,15), 'No pre-marked important questions found.');
  renderRevSection('revFrequent',  freqAsked.slice(0,20), '');
}

function renderRevSection(containerId, questions, emptyMsg) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!questions.length) {
    el.innerHTML = `<div class="rev-empty">${emptyMsg}</div>`;
    return;
  }
  el.innerHTML = questions.map(q => `
    <div class="rev-item" onclick="jumpToQuestion(${q.id})">
      <span class="rev-topic">${q.topic}</span>
      <span style="flex:1;font-size:0.85rem">${q.title}</span>
      <span class="q-badge ${q.difficulty}" style="font-size:0.65rem">${q.difficulty}</span>
    </div>
  `).join('');
}

function jumpToQuestion(id) {
  const q = QUESTIONS.find(x => x.id === id);
  if (!q) return;
  // Switch to topic
  const sideItem = document.querySelector(`.sidebar-item[data-topic="${q.topic}"]`);
  setActiveTopic(q.topic, sideItem);
  setTimeout(() => {
    const card = document.querySelector(`.q-card[data-id="${id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.transition = 'box-shadow 0.3s';
      card.style.boxShadow = '0 0 0 2px var(--accent)';
      setTimeout(() => { card.style.boxShadow = ''; }, 1500);
    }
  }, 200);
}

function openNoteEditor(id) {
  jumpToQuestion(id);
  setTimeout(() => openNotes(id), 300);
}

// ── Sidebar Toggle ────────────────────────────────────────
document.getElementById('sidebarToggle').addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
  }
});

// Close sidebar on mobile overlay click
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 &&
      sidebar.classList.contains('mobile-open') &&
      !sidebar.contains(e.target) &&
      !e.target.closest('#sidebarToggle')) {
    sidebar.classList.remove('mobile-open');
  }
});

// ── Dark/Light Mode ───────────────────────────────────────
const themeBtn = document.getElementById('themeToggle');
function applyTheme(mode) {
  document.body.classList.toggle('light', mode === 'light');
  themeBtn.textContent = mode === 'light' ? '🌙' : '☀️';
  localStorage.setItem('tcs_theme', mode);
}
themeBtn.addEventListener('click', () => {
  const current = document.body.classList.contains('light') ? 'light' : 'dark';
  applyTheme(current === 'light' ? 'dark' : 'light');
});

// ── Sidebar item counts ───────────────────────────────────
function updateSidebarCounts() {
  TOPICS.forEach(topic => {
    const el = document.getElementById('count_' + topic.replace(/\s+/g,'_'));
    if (!el) return;
    if (topic === 'Revision') { el.textContent = '⭐'; return; }
    const total = QUESTIONS.filter(q => q.topic === topic).length;
    const done  = QUESTIONS.filter(q => q.topic === topic && getQ(q.id).completed).length;
    el.textContent = `${done}/${total}`;
  });
}

// ── Toast ────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  toastContainer.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

// ── Image Upload / Gallery Handlers ─────────────────────
function handleImageUpload(id, inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const src = e.target.result;
    const q = getQ(id);
    const images = q.images ? [...q.images] : [];
    images.push({ src, name: file.name, ts: Date.now() });
    setQ(id, { images });
    showToast('Image added');
    // re-render current view
    applyFilters();
  };
  reader.readAsDataURL(file);
  // clear input so same file can be uploaded again if needed
  inputEl.value = '';
}

function removeImage(id, idx) {
  const q = getQ(id);
  if (!q.images || idx < 0 || idx >= q.images.length) return;
  q.images.splice(idx, 1);
  setQ(id, { images: q.images });
  showToast('Image removed');
  applyFilters();
}

// Open notes tab and focus textarea
function openNotes(id) {
  const el  = document.getElementById('expand' + id);
  const btn = document.getElementById('expandBtn' + id);
  if (!el) return;
  // open if closed
  if (!el.classList.contains('open')) {
    el.classList.add('open');
    if (btn) btn.classList.add('open');
  }
  // switch to notes tab
  switchTab(id, 'notes', document.querySelector(`#expand${id} .expand-tab`));
  // focus textarea after a short delay to allow DOM
  setTimeout(() => {
    const ta = document.querySelector(`#panel_notes_${id} .notes-area`);
    if (ta) ta.focus();
  }, 200);
}

// Handle files dropped onto gallery
function handleDrop(event, id) {
  event.preventDefault();
  const files = event.dataTransfer && event.dataTransfer.files;
  if (!files || !files.length) return;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!f.type.startsWith('image/')) continue;
    const reader = new FileReader();
    reader.onload = function(e) {
      const src = e.target.result;
      const q = getQ(id);
      const images = q.images ? [...q.images] : [];
      images.push({ src, name: f.name, ts: Date.now() });
      setQ(id, { images });
      applyFilters();
      showToast('Image added');
    };
    reader.readAsDataURL(f);
  }
}

// Handle paste (images from clipboard)
function handlePaste(e, id) {
  const items = (e.clipboardData && e.clipboardData.items) || [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.kind === 'file' && it.type.startsWith('image/')) {
      const f = it.getAsFile();
      const reader = new FileReader();
      reader.onload = function(ev) {
        const src = ev.target.result;
        const q = getQ(id);
        const images = q.images ? [...q.images] : [];
        images.push({ src, name: f.name || 'pasted.png', ts: Date.now() });
        setQ(id, { images });
        applyFilters();
        showToast('Pasted image added');
      };
      reader.readAsDataURL(f);
      // prevent the default paste behaviour for images
      e.preventDefault();
    }
  }
}

// ── Init ─────────────────────────────────────────────────
// FIX 1: Listeners are registered only ONCE here, never inside init()
// so re-calling init() (e.g. after signout) won't double-attach them.
function registerListeners() {
  document.getElementById('authBtn').addEventListener('click', () => {
    const user = getCurrentUser();
    if (user) {
      if (confirm('Sign out?')) { signoutUser(); }
      return;
    }
    openAuthModal();
  });

  // FIX 1: signin — no more init() call, just refresh data manually
  document.getElementById('signinBtn').addEventListener('click', async () => {
    const u = document.getElementById('authUser').value.trim();
    const p = document.getElementById('authPass').value;
    const err = signinUser(u, p);
    if (err) {
      document.getElementById('authMsg').textContent = err;
    } else {
      await syncFromFirebase();
      calcStats();
      updateSidebarCounts();
      applyFilters();
      closeAuthModal();
      updateUserUI();
      showToast('Signed in ✅');
    }
  });

  // FIX 1: signup — same, no more init() call
  document.getElementById('signupBtn').addEventListener('click', async () => {
    const u = document.getElementById('authUser').value.trim();
    const p = document.getElementById('authPass').value;
    const err = signupUser(u, p);
    if (err) {
      document.getElementById('authMsg').textContent = err;
    } else {
      await syncFromFirebase();
      calcStats();
      updateSidebarCounts();
      applyFilters();
      closeAuthModal();
      updateUserUI();
      showToast('Account created & signed in 🚀');
    }
  });

  document.getElementById('authCloseBtn').addEventListener('click', closeAuthModal);
  document.getElementById('myNotesBtn').addEventListener('click', openNotesModal);
  document.getElementById('notesCloseBtn').addEventListener('click', closeNotesModal);
}

async function init() {
  await syncFromFirebase();

  // Theme
  const savedTheme = localStorage.getItem('tcs_theme') || 'dark';
  applyTheme(savedTheme);

  // Stats
  calcStats();
  updateSidebarCounts();

  // Default view: All questions
  const allBtn = document.querySelector('.sidebar-item[data-topic="All"]');
  setActiveTopic('All', allBtn);

  updateUserUI();
}

// FIX 1: DOMContentLoaded fires init + registerListeners exactly ONCE
window.addEventListener('DOMContentLoaded', async () => {
  registerListeners();
  await init();
});F
