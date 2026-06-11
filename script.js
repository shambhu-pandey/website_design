/* ============================================================
   script.js — TCS NQT Prep Dashboard
   Classic script + dynamic import() for firebase.js
   Event delegation throughout — zero inline handlers
   ============================================================ */

// ── Firebase bridge ───────────────────────────────────────
let saveUserData = async () => {};
let loadUserData = async () => null;

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

const statTotal   = document.getElementById('statTotal');
const statDone    = document.getElementById('statDone');
const statPending = document.getElementById('statPending');
const statRevision= document.getElementById('statRevision');
const progressFill= document.getElementById('progressFill');
const progressPct = document.getElementById('progressPct');

let activeTopicFilter  = 'All';
let activeDiffFilter   = 'All';
let activeStatusFilter = 'All';

// ── LocalStorage ──────────────────────────────────────────
const LS_KEY           = 'tcs_nqt_v2';
const USERS_KEY        = 'tcs_nqt_users';
const CURRENT_USER_KEY = 'tcs_nqt_user';

function getCurrentUser() { return localStorage.getItem(CURRENT_USER_KEY) || null; }
function setCurrentUser(u) {
  if (u) localStorage.setItem(CURRENT_USER_KEY, u);
  else   localStorage.removeItem(CURRENT_USER_KEY);
}
function getStorageKey() {
  const u = getCurrentUser();
  return u ? `${LS_KEY}_user_${u}` : `${LS_KEY}_guest`;
}
function loadState() {
  try { return JSON.parse(localStorage.getItem(getStorageKey())) || {}; }
  catch(e) { return {}; }
}
async function syncFromFirebase() {
  const user = getCurrentUser();
  if (!user) return;
  const d = await loadUserData(user);
  if (d && Object.keys(d).length > 0) {
    localStorage.setItem(getStorageKey(), JSON.stringify(d));
    console.log('Firebase Sync ✅');
  }
}
async function saveState(state) {
  localStorage.setItem(getStorageKey(), JSON.stringify(state));
  const u = getCurrentUser();
  if (u) await saveUserData(u, state);
}
function getQ(id) {
  const s = loadState();
  return s[id] || { practiced:false, completed:false, revision:false, starred:false,
                    notes:'', approach:'', code:'', trick:'', images:[], updatedAt:null };
}
function setQ(id, updates) {
  const s = loadState();
  s[id] = { ...getQ(id), ...updates };
  saveState(s).catch(console.error);
}

// ── Auth ──────────────────────────────────────────────────
function openAuthModal()  { document.getElementById('authModal').style.display='block'; document.getElementById('authMsg').textContent=''; }
function closeAuthModal() { document.getElementById('authModal').style.display='none'; }
function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY))||{}; } catch(e){ return {}; } }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function signupUser(u,p) {
  if(!u||!p) return 'Enter username & password';
  const users=getUsers(); if(users[u]) return 'User already exists';
  users[u]={password:p}; saveUsers(users); setCurrentUser(u); return null;
}
function signinUser(u,p) {
  const users=getUsers();
  if(!users[u]) return 'User not found';
  if(users[u].password!==p) return 'Incorrect password';
  setCurrentUser(u); return null;
}
async function signoutUser() { setCurrentUser(null); await init(); showToast('Signed out'); }
function updateUserUI() {
  const u=getCurrentUser();
  document.getElementById('usernameDisplay').textContent = u||'';
  const btn=document.getElementById('authBtn');
  btn.title = u?'Sign out':'Sign in / Sign up';
}

// ── Utilities ─────────────────────────────────────────────
function escapeHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function formatSavedTime(ts) {
  if(!ts) return 'Saved content';
  try { return `Saved ${new Date(ts).toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}`; }
  catch(e){ return 'Saved content'; }
}
function renderSavedPreview(text) {
  const v=(text||'').trim();
  if(!v) return '<span class="saved-note-empty">Nothing saved yet. Type below to store your note.</span>';
  return escapeHtml(v).replace(/\n/g,'<br>');
}

// ── Markdown Renderer (lightweight, no external lib) ──────
function renderMarkdown(raw) {
  if (!raw || !raw.trim()) return '<p class="md-empty">No content written yet.</p>';
  let html = escapeHtml(raw);

  // Fenced code blocks (``` ... ```)
  html = html.replace(/```([a-zA-Z]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const langCls = lang ? ` class="lang-${lang.toLowerCase()}"` : '';
    return `<div class="md-code-block" data-lang="${lang||'text'}"><code${langCls}>${code.trim()}</code></div>`;
  });

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code class="md-inline-code" style="font-weight:600">$1</code>');

  // Headings
  html = html.replace(/^######\s(.+)$/gm, '<h6 class="md-h6">$1</h6>');
  html = html.replace(/^#####\s(.+)$/gm,  '<h5 class="md-h5">$1</h5>');
  html = html.replace(/^####\s(.+)$/gm,   '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^###\s(.+)$/gm,    '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^##\s(.+)$/gm,     '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^#\s(.+)$/gm,      '<h1 class="md-h1">$1</h1>');

  // Blockquote
  html = html.replace(/^&gt;\s(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr class="md-hr">');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g,     '<strong class="md-bold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g,         '<em class="md-italic">$1</em>');
  html = html.replace(/__(.+?)__/g,         '<strong class="md-bold">$1</strong>');
  html = html.replace(/_(.+?)_/g,           '<em class="md-italic">$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del class="md-del">$1</del>');

  // Highlight ==text==
  html = html.replace(/==(.+?)==/g, '<mark class="md-mark">$1</mark>');

  // Unordered lists (- or *)
  html = html.replace(/((?:^[-*]\s.+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^[-*]\s/,'').trim()}</li>`).join('');
    return `<ul class="md-ul">${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\.\s.+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^\d+\.\s/,'').trim()}</li>`).join('');
    return `<ol class="md-ol">${items}</ol>`;
  });

  // Checkboxes
  html = html.replace(/\[ \]\s(.+)/g, '<label class="md-task"><input type="checkbox" disabled> $1</label>');
  html = html.replace(/\[x\]\s(.+)/gi,'<label class="md-task done"><input type="checkbox" checked disabled> $1</label>');

  // Paragraphs: wrap non-tagged lines
  html = html.replace(/^(?!<[houbl]|<pre|<hr|<block)(.+)$/gm, '<p class="md-p">$1</p>');

  // Clean up multiple blank lines
  html = html.replace(/(<\/p>\s*){2,}/g, '</p>');

  return html;
}

// ── Note Viewer Modal ─────────────────────────────────────
function openNoteViewer(id) {
  const q  = QUESTIONS.find(x => x.id === id);
  const d  = getQ(id);
  if (!q) return;

  // Build or reuse modal
  let modal = document.getElementById('noteViewerModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'noteViewerModal';
    modal.className = 'note-viewer-modal';
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeNoteViewer();
    });
  }

  const hasNotes    = d.notes    && d.notes.trim();
  const hasApproach = d.approach && d.approach.trim();
  const hasCode     = d.code     && d.code.trim();
  const hasTrick    = d.trick    && d.trick.trim();
  const hasImages   = d.images   && d.images.length;

  if (!hasNotes && !hasApproach && !hasCode && !hasTrick && !hasImages) {
    showToast('No notes saved yet for this question 📝');
    return;
  }

  const tabs = [];
  if (hasNotes)    tabs.push({ key:'notes',    icon:'📝', label:'Notes'    });
  if (hasApproach) tabs.push({ key:'approach', icon:'🧠', label:'Approach' });
  if (hasCode)     tabs.push({ key:'code',     icon:'💻', label:'Code'     });
  if (hasTrick)    tabs.push({ key:'trick',    icon:'⚡', label:'Trick'    });
  if (hasImages)   tabs.push({ key:'images',   icon:'🖼️', label:'Images'   });

  const firstTab = tabs[0].key;

  function buildContent(key) {
    if (key === 'images') {
      return `<div class="nv-image-grid">
        ${(d.images||[]).map((img,i) => `
          <div class="nv-img-wrap">
            <img src="${img.src}" alt="${escapeHtml(img.name||'Image '+(i+1))}"
                 onclick="this.classList.toggle('nv-img-zoom')" title="Click to zoom">
            <div class="nv-img-name">${escapeHtml(img.name||'Image '+(i+1))}</div>
          </div>`).join('')}
      </div>`;
    }
    if (key === 'code') {
      const raw = d[key] || '';
      return `<div class="nv-code-wrap"><div class="md-code-block nv-code-full" data-lang="text"><code>${escapeHtml(raw)}</code></div></div>`;
    }
    return `<div class="nv-markdown-body">${renderMarkdown(d[key] || '')}</div>`;
  }

  modal.innerHTML = `
    <div class="note-viewer-inner">
      <div class="nv-header">
        <div class="nv-header-left">
          <span class="nv-q-num" id="nvQNum">#${String(q.id).padStart(3,'0')}</span>
          <span class="nv-topic-badge" id="nvTopicBadge">${escapeHtml(q.topic)}</span>
          <span class="nv-diff-badge ${q.difficulty.toLowerCase()}" id="nvDiffBadge">${q.difficulty}</span>
        </div>
        <h1 class="nv-title" id="nvTitle">${escapeHtml(q.title)}</h1>
        <button class="nv-close-btn" id="nvCloseBtn" title="Close">×</button>
      </div>

      <div class="nv-tabs" id="nvTabs">
        ${tabs.map((t,i) => `
          <button class="nv-tab ${i===0?'active':''}" data-nv-tab="${t.key}" id="tab_${t.key}">
            ${t.icon} ${t.label}
          </button>`).join('')}
      </div>

      <div class="nv-body" id="nvBody">
        ${buildContent(firstTab)}
      </div>

      <div class="nv-footer">
        <span class="nv-saved-time" id="nvSavedTime">${formatSavedTime(d.updatedAt)}</span>
        <div class="nv-footer-actions">
          <button class="link-btn" id="nvEditBtn">✏️ Edit Notes</button>
          <button class="link-btn" id="nvCloseBtn2">Close</button>
        </div>
      </div>
    </div>
  `;

  // Tab switching inside viewer
  modal.querySelector('#nvTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nv-tab]');
    if (!btn) return;
    modal.querySelectorAll('.nv-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    modal.querySelector('#nvBody').innerHTML = buildContent(btn.dataset.nvTab);
  });

  modal.querySelector('#nvCloseBtn').addEventListener('click', closeNoteViewer);
  modal.querySelector('#nvCloseBtn2').addEventListener('click', closeNoteViewer);
  modal.querySelector('#nvEditBtn').addEventListener('click', () => {
    closeNoteViewer();
    openNoteEditor(id);
  });

  modal.style.display = 'flex';
}

function closeNoteViewer() {
  const m = document.getElementById('noteViewerModal');
  if (m) m.style.display = 'none';
}

// ── My Notes Modal ────────────────────────────────────────
function openNotesModal() {
  const modal = document.getElementById('notesModal');
  const list  = document.getElementById('notesList');
  list.innerHTML = '';

  const notes = [];
  QUESTIONS.forEach(q => {
    const d = getQ(q.id);
    if ((d.notes&&d.notes.trim())||(d.approach&&d.approach.trim())||
        (d.code&&d.code.trim())||(d.trick&&d.trick.trim())||(d.images&&d.images.length)) {
      notes.push({ q, d });
    }
  });

  if (!notes.length) {
    list.innerHTML = '<div class="empty-state">No notes yet. Open a question and add your notes.</div>';
  } else {
    notes.forEach(item => {
      const div = document.createElement('div');
      const previewParts = [];
      if (item.d.notes    && item.d.notes.trim())    previewParts.push(item.d.notes.trim());
      if (item.d.approach && item.d.approach.trim()) previewParts.push('Approach: '+item.d.approach.trim());
      if (item.d.code     && item.d.code.trim())     previewParts.push('Code: '+item.d.code.trim());
      if (item.d.trick    && item.d.trick.trim())    previewParts.push('Trick: '+item.d.trick.trim());
      const previewText = previewParts.join('\n\n');
      const preview = previewText.length>320 ? previewText.slice(0,320).trim()+'...' : previewText;

      div.className = 'note-card';
      div.innerHTML = `
        <div class="note-card-head">
          <div class="note-card-meta">
            <span class="rev-topic">${escapeHtml(item.q.topic)}</span>
            <span class="note-card-id">#${String(item.q.id).padStart(3,'0')}</span>
          </div>
          <div class="note-card-title">${escapeHtml(item.q.title)}</div>
        </div>
        <div class="note-card-preview">${escapeHtml(preview||'Saved note available.').replace(/\n/g,'<br>')}</div>
        <div class="note-card-footer">
          <span class="note-card-stats">${item.d.images&&item.d.images.length?`${item.d.images.length} image${item.d.images.length>1?'s':''}`:'Text note'}</span>
          <div class="note-card-actions">
            <button class="link-btn note-view-btn" data-id="${item.q.id}">👁️ View</button>
            <button class="link-btn note-edit-btn" data-id="${item.q.id}">✏️ Edit</button>
          </div>
        </div>
      `;
      list.appendChild(div);
    });

    list.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.note-view-btn');
      const editBtn = e.target.closest('.note-edit-btn');
      if (viewBtn) { closeNotesModal(); openNoteViewer(Number(viewBtn.dataset.id)); }
      if (editBtn) { closeNotesModal(); openNoteEditor(Number(editBtn.dataset.id)); }
    });
  }

  modal.style.display = 'block';
}
function closeNotesModal() { document.getElementById('notesModal').style.display='none'; }

// ── Stats ─────────────────────────────────────────────────
function calcStats() {
  const total = QUESTIONS.length;
  let completed=0, revisionCnt=0;
  QUESTIONS.forEach(q => {
    const d=getQ(q.id);
    if(d.completed) completed++;
    if(d.revision)  revisionCnt++;
  });
  const pending = total-completed;
  const pct = total ? Math.round((completed/total)*100) : 0;
  statTotal.textContent    = total;
  statDone.textContent     = completed;
  statPending.textContent  = pending;
  statRevision.textContent = revisionCnt;
  progressFill.style.width = pct+'%';
  progressPct.textContent  = pct+'%';
}

// ── Render Questions ──────────────────────────────────────
function renderQuestions(questions) {
  questionList.innerHTML = '';
  if (!questions.length) {
    questionList.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No questions found. Try changing filters.</p></div>`;
    sectionCount.textContent = '0';
    return;
  }
  sectionCount.textContent = questions.length;

  questions.forEach((q, idx) => {
    const d    = getQ(q.id);
    const card = document.createElement('div');
    card.className = 'q-card' + (d.completed?' completed-row':'');
    card.style.animationDelay = (idx*0.03)+'s';
    card.dataset.id = q.id;

    // Has notes indicator
    const hasAnyNotes = (d.notes&&d.notes.trim())||(d.approach&&d.approach.trim())||
                        (d.code&&d.code.trim())||(d.trick&&d.trick.trim())||(d.images&&d.images.length);

    card.innerHTML = `
      <div class="q-header" data-action="expand" data-id="${q.id}">
        <span class="q-num">#${String(q.id).padStart(3,'0')}</span>
        <span class="q-title">${q.title}</span>
        <span class="q-badge ${q.difficulty}">${q.difficulty}</span>
        <div class="q-actions">
          <div class="q-check-group">
            <label class="q-check-label" title="Practiced">
              <input type="checkbox" data-action="check" data-id="${q.id}" data-field="practiced" ${d.practiced?'checked':''}>
              <span class="check-dot">${d.practiced?'✓':''}</span>P
            </label>
            <label class="q-check-label" title="Completed">
              <input type="checkbox" data-action="check" data-id="${q.id}" data-field="completed" ${d.completed?'checked':''}>
              <span class="check-dot">${d.completed?'✓':''}</span>✅
            </label>
            <label class="q-check-label revision-label" title="Add to Revision">
              <input type="checkbox" data-action="check" data-id="${q.id}" data-field="revision" ${d.revision?'checked':''}>
              <span class="check-dot">${d.revision?'✓':''}</span>🔁
            </label>
          </div>
          <button class="star-btn ${d.starred?'starred':''}" data-action="star" data-id="${q.id}" title="Star">★</button>
          <button class="notes-btn ${hasAnyNotes?'has-notes':''}" data-action="view-notes" data-id="${q.id}" title="${hasAnyNotes?'View Notes':'Open Notes'}">📝</button>
          <a href="${q.link}" target="_blank" class="link-btn">Practice →</a>
          <button class="expand-btn" id="expandBtn${q.id}" data-action="expand-only" data-id="${q.id}">▼</button>
        </div>
      </div>

      <div class="q-expand" id="expand${q.id}">
        <div class="q-expand-inner">
          <div class="expand-tabs">
            <button class="expand-tab active" data-action="tab" data-id="${q.id}" data-tab="notes">📝 Notes</button>
            <button class="expand-tab" data-action="tab" data-id="${q.id}" data-tab="approach">🧠 Approach</button>
            <button class="expand-tab" data-action="tab" data-id="${q.id}" data-tab="code">💻 Code</button>
            <button class="expand-tab" data-action="tab" data-id="${q.id}" data-tab="trick">⚡ Trick</button>
          </div>

          <div class="expand-panel active" id="panel_notes_${q.id}">
            <div class="panel-top-bar">
              <div class="area-label">My Notes</div>
              <button class="view-rendered-btn" data-action="view-notes" data-id="${q.id}" title="View rendered notes">👁️ View</button>
            </div>
            <textarea class="notes-area" data-action="autosave" data-id="${q.id}" data-field="notes"
              placeholder="Write your notes here... Supports **Markdown** syntax:&#10;# Heading&#10;**bold**, *italic*, \`code\`&#10;- list item&#10;\`\`\`java&#10;code block&#10;\`\`\`&#10;==highlight==, > blockquote">${d.notes||''}</textarea>
            <div class="save-indicator" id="si_notes_${q.id}">✓ Saved</div>
            <div class="saved-note-box">
              <div class="saved-note-head">
                <span class="saved-note-label">Saved Note Preview</span>
                <span class="saved-note-time" id="saved_notes_time_${q.id}">${formatSavedTime(d.updatedAt)}</span>
              </div>
              <div class="saved-note-content" id="saved_notes_${q.id}">${renderSavedPreview(d.notes)}</div>
            </div>
            <div style="margin-top:10px">
              <label style="font-size:0.85rem;color:var(--text-muted);font-weight:700;margin-bottom:6px;display:block">Attach images:</label>
              <input type="file" accept="image/*" data-action="imgupload" data-id="${q.id}" />
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:8px">Drag &amp; drop or paste images here.</div>
            <div class="img-gallery" id="imgGallery_${q.id}" data-action="imgdrop" data-id="${q.id}">
              ${(d.images||[]).map((img,i)=>`
                <div class="img-thumb" data-idx="${i}">
                  <img src="${img.src}" alt="${img.name||'img'}">
                  <button class="img-remove" data-action="imgremove" data-id="${q.id}" data-idx="${i}" title="Remove">✕</button>
                </div>`).join('')}
            </div>
          </div>

          <div class="expand-panel" id="panel_approach_${q.id}">
            <div class="panel-top-bar">
              <div class="area-label">Approach / Algorithm</div>
              <button class="view-rendered-btn" data-action="view-notes" data-id="${q.id}" title="View rendered">👁️ View</button>
            </div>
            <textarea class="notes-area" data-action="autosave" data-id="${q.id}" data-field="approach"
              placeholder="Step-by-step algorithm, time &amp; space complexity, edge cases...">${d.approach||''}</textarea>
            <div class="save-indicator" id="si_approach_${q.id}">✓ Saved</div>
          </div>

          <div class="expand-panel" id="panel_code_${q.id}">
            <div class="panel-top-bar">
              <div class="area-label">Code Snippet (Java / Python / C++)</div>
              <button class="view-rendered-btn" data-action="view-notes" data-id="${q.id}" title="View rendered">👁️ View</button>
            </div>
            <textarea class="code-area" data-action="autosave" data-id="${q.id}" data-field="code"
              placeholder="// Paste or write your code solution here...">${d.code||''}</textarea>
            <div class="save-indicator" id="si_code_${q.id}">✓ Saved</div>
          </div>

          <div class="expand-panel" id="panel_trick_${q.id}">
            <div class="panel-top-bar">
              <div class="area-label">Quick Trick / Last-Minute Revision</div>
              <button class="view-rendered-btn" data-action="view-notes" data-id="${q.id}" title="View rendered">👁️ View</button>
            </div>
            <textarea class="notes-area" data-action="autosave" data-id="${q.id}" data-field="trick"
              placeholder="One-liner trick, pattern to remember, interview tip...">${d.trick||''}</textarea>
            <div class="save-indicator" id="si_trick_${q.id}">✓ Saved</div>
          </div>
        </div>
      </div>
    `;
    questionList.appendChild(card);
  });
}

// ── Event Delegation ──────────────────────────────────────
const saveTimers = {};

questionList.addEventListener('click', (e) => {
  // ── Star ──
  const starBtn = e.target.closest('[data-action="star"]');
  if (starBtn) { handleStar(Number(starBtn.dataset.id)); return; }

  // ── Notes / View-notes button (📝 icon OR 👁️ View buttons inside panels) ──
  const viewNotesBtn = e.target.closest('[data-action="view-notes"]');
  if (viewNotesBtn) { openNoteViewer(Number(viewNotesBtn.dataset.id)); return; }

  // ── Tab switch ──
  const tabBtn = e.target.closest('[data-action="tab"]');
  if (tabBtn) { switchTab(Number(tabBtn.dataset.id), tabBtn.dataset.tab, tabBtn); return; }

  // ── Image remove ──
  const imgRemove = e.target.closest('[data-action="imgremove"]');
  if (imgRemove) { removeImage(Number(imgRemove.dataset.id), Number(imgRemove.dataset.idx)); return; }

  // ── Expand-only button (the ▼ chevron) ──
  const expandOnlyBtn = e.target.closest('[data-action="expand-only"]');
  if (expandOnlyBtn) { toggleExpand(Number(expandOnlyBtn.dataset.id)); return; }

  // ── Expand via header click (but NOT if clicking inside q-actions) ──
  const expandHeader = e.target.closest('[data-action="expand"]');
  if (expandHeader && !e.target.closest('.q-actions')) {
    toggleExpand(Number(expandHeader.dataset.id));
  }
});

questionList.addEventListener('change', (e) => {
  const cb = e.target.closest('[data-action="check"]');
  if (cb) { handleCheck(Number(cb.dataset.id), cb.dataset.field, cb.checked); return; }
  const imgInput = e.target.closest('[data-action="imgupload"]');
  if (imgInput) { handleImageUpload(Number(imgInput.dataset.id), imgInput); return; }
});

questionList.addEventListener('input', (e) => {
  const ta = e.target.closest('[data-action="autosave"]');
  if (ta) autoSave(Number(ta.dataset.id), ta.dataset.field, ta.value);
});

questionList.addEventListener('paste', (e) => {
  const ta = e.target.closest('[data-action="autosave"]');
  if (ta) handlePaste(e, Number(ta.dataset.id));
});

questionList.addEventListener('dragover', (e) => {
  if (e.target.closest('[data-action="imgdrop"]')) e.preventDefault();
});
questionList.addEventListener('drop', (e) => {
  const g = e.target.closest('[data-action="imgdrop"]');
  if (g) handleDrop(e, Number(g.dataset.id));
});

// ── Handler Functions ─────────────────────────────────────
function toggleExpand(id) {
  const el  = document.getElementById('expand'+id);
  const btn = document.getElementById('expandBtn'+id);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  el.classList.toggle('open', !isOpen);
  if (btn) btn.classList.toggle('open', !isOpen);
}

function switchTab(id, tab, btnEl) {
  ['notes','approach','code','trick'].forEach(p => {
    const panel = document.getElementById(`panel_${p}_${id}`);
    if (panel) panel.classList.toggle('active', p===tab);
  });
  const tc = btnEl.closest('.expand-tabs');
  if (tc) tc.querySelectorAll('.expand-tab').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
}

function autoSave(id, field, value) {
  setQ(id, { [field]: value, updatedAt: Date.now() });
  const siKey = `si_${field}_${id}`;
  const ind = document.getElementById(siKey);
  if (ind) {
    ind.classList.add('show');
    clearTimeout(saveTimers[siKey]);
    saveTimers[siKey] = setTimeout(() => ind.classList.remove('show'), 1500);
  }
  const prev = document.getElementById(`saved_${field}_${id}`);
  if (prev) prev.innerHTML = renderSavedPreview(value);
  const timeEl = document.getElementById(`saved_${field}_time_${id}`);
  if (timeEl) timeEl.textContent = formatSavedTime(Date.now());
}

function handleCheck(id, field, value) {
  setQ(id, { [field]: value });
  if (field === 'completed') {
    const card = document.querySelector(`.q-card[data-id="${id}"]`);
    if (card) card.classList.toggle('completed-row', value);
  }
  calcStats();
  updateSidebarCounts();
  if (field==='revision' && value) showToast('Added to revision list! 🔁');
  if (field==='completed' && value) showToast('Question marked complete! ✅');
}

function handleStar(id) {
  const d      = getQ(id);
  const newVal = !d.starred;
  setQ(id, { starred: newVal });
  const btn = document.querySelector(`.q-card[data-id="${id}"] .star-btn`);
  if (btn) btn.classList.toggle('starred', newVal);
  showToast(newVal ? 'Starred! ⭐' : 'Unstarred');
}

// ── Sidebar Navigation ────────────────────────────────────
function setActiveTopic(topic, clickedEl) {
  activeTopicFilter = topic;
  sidebarItems.forEach(el => el.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');
  if (topic === 'Revision') { showRevisionMode(); return; }
  mainPanel.classList.add('visible');
  mainPanel.style.display = 'block';
  revisionPanel.classList.remove('visible');
  revisionPanel.style.display = 'none';
  sectionTitle.textContent = topic==='All' ? 'All Questions' : topic;
  applyFilters();
}

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
  let f = [...QUESTIONS];
  if (activeTopicFilter !== 'All') f = f.filter(q => q.topic===activeTopicFilter);
  if (activeDiffFilter  !== 'All') f = f.filter(q => q.difficulty===activeDiffFilter);
  if (activeStatusFilter==='Completed') f = f.filter(q => getQ(q.id).completed);
  else if (activeStatusFilter==='Pending')  f = f.filter(q => !getQ(q.id).completed);
  else if (activeStatusFilter==='Starred')  f = f.filter(q => getQ(q.id).starred);
  const query = searchInput.value.trim().toLowerCase();
  if (query) f = f.filter(q =>
    q.title.toLowerCase().includes(query) ||
    q.topic.toLowerCase().includes(query) ||
    q.difficulty.toLowerCase().includes(query)
  );
  renderQuestions(f);
}

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilters, 250);
});

// ── Revision Mode ─────────────────────────────────────────
function showRevisionMode() {
  mainPanel.classList.remove('visible'); mainPanel.style.display = 'none';
  revisionPanel.classList.add('visible'); revisionPanel.style.display = 'flex';
  renderRevisionMode();
}
function renderRevisionMode() {
  renderRevSection('revStarred',   QUESTIONS.filter(q=>getQ(q.id).starred),                      'No starred questions yet. Click ★ on any question!');
  renderRevSection('revRevision',  QUESTIONS.filter(q=>getQ(q.id).revision),                     'No questions added to revision yet. Check the 🔁 box!');
  renderRevSection('revWeak',      QUESTIONS.filter(q=>!getQ(q.id).completed&&getQ(q.id).practiced), 'No pending practiced questions. Keep going!');
  renderRevSection('revImportant', QUESTIONS.filter(q=>q.starred).slice(0,15),                   'No pre-marked important questions found.');
  renderRevSection('revFrequent',  QUESTIONS.filter(q=>['Medium','Hard'].includes(q.difficulty)).slice(0,20), '');
}
function renderRevSection(containerId, questions, emptyMsg) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!questions.length) { el.innerHTML=`<div class="rev-empty">${emptyMsg}</div>`; return; }
  el.innerHTML = questions.map(q=>`
    <div class="rev-item" data-action="jump" data-id="${q.id}">
      <span class="rev-topic">${q.topic}</span>
      <span style="flex:1;font-size:0.85rem">${q.title}</span>
      <span class="q-badge ${q.difficulty}" style="font-size:0.65rem">${q.difficulty}</span>
    </div>`).join('');
}
revisionPanel.addEventListener('click', (e) => {
  const item = e.target.closest('[data-action="jump"]');
  if (item) jumpToQuestion(Number(item.dataset.id));
});

function jumpToQuestion(id) {
  const q = QUESTIONS.find(x=>x.id===id); if(!q) return;
  const sideItem = document.querySelector(`.sidebar-item[data-topic="${q.topic}"]`);
  setActiveTopic(q.topic, sideItem);
  setTimeout(() => {
    const card = document.querySelector(`.q-card[data-id="${id}"]`);
    if (card) {
      card.scrollIntoView({behavior:'smooth',block:'center'});
      card.style.transition = 'box-shadow 0.3s';
      card.style.boxShadow  = '0 0 0 2px var(--accent)';
      setTimeout(()=>{ card.style.boxShadow=''; }, 1500);
    }
  }, 200);
}
function openNoteEditor(id) { jumpToQuestion(id); setTimeout(()=>openNotes(id), 300); }

// ── Sidebar toggle ────────────────────────────────────────
document.getElementById('sidebarToggle').addEventListener('click', () => {
  if (window.innerWidth<=768) sidebar.classList.toggle('mobile-open');
  else sidebar.classList.toggle('collapsed');
});
document.addEventListener('click', (e) => {
  if (window.innerWidth<=768 && sidebar.classList.contains('mobile-open') &&
      !sidebar.contains(e.target) && !e.target.closest('#sidebarToggle'))
    sidebar.classList.remove('mobile-open');
});
document.getElementById('sidebar').addEventListener('click', (e) => {
  const item = e.target.closest('.sidebar-item[data-topic]');
  if (item) setActiveTopic(item.dataset.topic, item);
});

// ── Theme ─────────────────────────────────────────────────
const themeBtn = document.getElementById('themeToggle');
function applyTheme(mode) {
  document.body.classList.toggle('light', mode==='light');
  themeBtn.textContent = mode==='light'?'🌙':'☀️';
  localStorage.setItem('tcs_theme', mode);
}
themeBtn.addEventListener('click', () => {
  applyTheme(document.body.classList.contains('light')?'dark':'light');
});

// ── Sidebar counts ────────────────────────────────────────
function updateSidebarCounts() {
  TOPICS.forEach(topic => {
    const el = document.getElementById('count_'+topic.replace(/\s+/g,'_'));
    if (!el) return;
    if (topic==='Revision') { el.textContent='⭐'; return; }
    const total = QUESTIONS.filter(q=>q.topic===topic).length;
    const done  = QUESTIONS.filter(q=>q.topic===topic&&getQ(q.id).completed).length;
    el.textContent = `${done}/${total}`;
  });
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className='toast'; t.textContent=msg;
  toastContainer.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 2000);
}

// ── Image Handlers ────────────────────────────────────────
function handleImageUpload(id, inputEl) {
  const file = inputEl.files && inputEl.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const q=getQ(id); const images=q.images?[...q.images]:[];
    images.push({src:e.target.result,name:file.name,ts:Date.now()});
    setQ(id,{images}); showToast('Image added'); applyFilters();
  };
  reader.readAsDataURL(file); inputEl.value='';
}
function removeImage(id, idx) {
  const q=getQ(id); if(!q.images||idx<0||idx>=q.images.length) return;
  q.images.splice(idx,1); setQ(id,{images:q.images}); showToast('Image removed'); applyFilters();
}
function openNotes(id) {
  const el=document.getElementById('expand'+id);
  const btn=document.getElementById('expandBtn'+id);
  if(!el) return;
  if(!el.classList.contains('open')){ el.classList.add('open'); if(btn) btn.classList.add('open'); }
  const firstTab=document.querySelector(`#expand${id} .expand-tab`);
  if(firstTab) switchTab(id,'notes',firstTab);
  setTimeout(()=>{ const ta=document.querySelector(`#panel_notes_${id} .notes-area`); if(ta) ta.focus(); },200);
}
function handleDrop(event, id) {
  event.preventDefault();
  const files=event.dataTransfer&&event.dataTransfer.files; if(!files||!files.length) return;
  for(let i=0;i<files.length;i++){
    const f=files[i]; if(!f.type.startsWith('image/')) continue;
    const reader=new FileReader();
    reader.onload=(e)=>{
      const q=getQ(id); const images=q.images?[...q.images]:[];
      images.push({src:e.target.result,name:f.name,ts:Date.now()});
      setQ(id,{images}); applyFilters(); showToast('Image added');
    };
    reader.readAsDataURL(f);
  }
}
function handlePaste(e, id) {
  const items=(e.clipboardData&&e.clipboardData.items)||[];
  for(let i=0;i<items.length;i++){
    const it=items[i];
    if(it.kind==='file'&&it.type.startsWith('image/')){
      const f=it.getAsFile(); const reader=new FileReader();
      reader.onload=(ev)=>{
        const q=getQ(id); const images=q.images?[...q.images]:[];
        images.push({src:ev.target.result,name:f.name||'pasted.png',ts:Date.now()});
        setQ(id,{images}); applyFilters(); showToast('Pasted image added');
      };
      reader.readAsDataURL(f); e.preventDefault();
    }
  }
}

// ── Auth Listeners ────────────────────────────────────────
function registerListeners() {
  document.getElementById('authBtn').addEventListener('click', () => {
    const user=getCurrentUser();
    if(user){ if(confirm('Sign out?')) signoutUser(); return; }
    openAuthModal();
  });
  document.getElementById('signinBtn').addEventListener('click', async () => {
    const u=document.getElementById('authUser').value.trim();
    const p=document.getElementById('authPass').value;
    const err=signinUser(u,p);
    if(err){ document.getElementById('authMsg').textContent=err; return; }
    await syncFromFirebase(); calcStats(); updateSidebarCounts(); applyFilters();
    closeAuthModal(); updateUserUI(); showToast('Signed in ✅');
  });
  document.getElementById('signupBtn').addEventListener('click', async () => {
    const u=document.getElementById('authUser').value.trim();
    const p=document.getElementById('authPass').value;
    const err=signupUser(u,p);
    if(err){ document.getElementById('authMsg').textContent=err; return; }
    await saveUserData(u, loadState());
    calcStats(); updateSidebarCounts(); applyFilters();
    closeAuthModal(); updateUserUI(); showToast('Account created & synced 🚀');
  });
  document.getElementById('authCloseBtn').addEventListener('click', closeAuthModal);
  document.getElementById('myNotesBtn').addEventListener('click', openNotesModal);
  document.getElementById('notesCloseBtn').addEventListener('click', closeNotesModal);
}

// ── Init ──────────────────────────────────────────────────
async function init() {
  await syncFromFirebase();
  const savedTheme = localStorage.getItem('tcs_theme')||'dark';
  applyTheme(savedTheme);
  calcStats(); updateSidebarCounts();
  setActiveTopic('All', document.querySelector('.sidebar-item[data-topic="All"]'));
  updateUserUI();
}

// ── Bootstrap ─────────────────────────────────────────────
(async function bootstrap() {
  try {
    const fb = await import('./firebase.js');
    saveUserData = fb.saveUserData;
    loadUserData = fb.loadUserData;
    console.log('Firebase loaded ✅');
  } catch(err) {
    console.warn('Firebase unavailable — localStorage only mode.', err);
  }
  registerListeners();
  await init();
})();
