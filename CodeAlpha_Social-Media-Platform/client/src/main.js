import './style.css';

// ═══════════════════════════════════════════════
//  API Client
// ═══════════════════════════════════════════════
const API = import.meta.env.VITE_API_URL || '/api';

function getToken() { return localStorage.getItem('ss_token'); }
function setToken(t) { localStorage.setItem('ss_token', t); }
function removeToken() { localStorage.removeItem('ss_token'); }
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('ss_user') || 'null'); } catch { return null; }
}
function setCurrentUser(u) { localStorage.setItem('ss_user', JSON.stringify(u)); }
function removeCurrentUser() { localStorage.removeItem('ss_user'); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ═══════════════════════════════════════════════
//  Toast Notification System
// ═══════════════════════════════════════════════
function initToasts() {
  if (!document.getElementById('toast-container')) {
    const c = document.createElement('div');
    c.className = 'toast-container';
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
}

function toast(msg, type = 'info', duration = 3500) {
  initToasts();
  const icons = { success: '✅', error: '❌', info: '💡' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  const container = document.getElementById('toast-container');
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('fade-out');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ═══════════════════════════════════════════════
//  Router
// ═══════════════════════════════════════════════
const routes = {
  '#login': renderLogin,
  '#register': renderRegister,
  '#feed': renderFeed,
  '#profile': renderProfile,
  '#search': renderSearch,
  '#notifications': renderNotifications,
  '#settings': renderSettings,
};

function navigate(hash) {
  window.location.hash = hash;
}

function getRoute() {
  const hash = window.location.hash || '#feed';
  if (hash.startsWith('#profile/')) return { fn: renderProfile, param: hash.split('#profile/')[1] };
  if (hash.startsWith('#post/')) return { fn: renderPostDetail, param: hash.split('#post/')[1] };
  return { fn: routes[hash] || renderFeed, param: null };
}

window.addEventListener('hashchange', () => router());

function router() {
  const user = getCurrentUser();
  const hash = window.location.hash || '#feed';
  const isAuthPage = hash === '#login' || hash === '#register';

  if (!user && !isAuthPage) { navigate('#login'); return; }
  if (user && isAuthPage) { navigate('#feed'); return; }

  const { fn, param } = getRoute();
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'page-enter';
  fn(app, param);
}

// ═══════════════════════════════════════════════
//  Helper: Time Formatting
// ═══════════════════════════════════════════════
function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ═══════════════════════════════════════════════
//  SVG Icons
// ═══════════════════════════════════════════════
const Icons = {
  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  search: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  user: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  logout: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  heart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFilled: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  comment: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  plus: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  image: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>`,
  globe: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  eye: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  bell: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  settings: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
};

// ═══════════════════════════════════════════════
//  Skeleton Loaders
// ═══════════════════════════════════════════════
function createPostSkeleton() {
  return `
    <div class="post-card skeleton-card">
      <div class="post-header">
        <div class="skeleton skeleton-avatar"></div>
        <div class="post-author" style="flex:1;">
          <div class="skeleton skeleton-text" style="width:120px;height:14px;margin-bottom:6px;"></div>
          <div class="skeleton skeleton-text" style="width:80px;height:12px;"></div>
        </div>
      </div>
      <div class="skeleton skeleton-text" style="width:100%;height:14px;margin-bottom:8px;"></div>
      <div class="skeleton skeleton-text" style="width:80%;height:14px;margin-bottom:8px;"></div>
      <div class="skeleton skeleton-text" style="width:50%;height:14px;"></div>
      <div class="post-actions" style="margin-top:16px;padding-top:12px;">
        <div class="skeleton skeleton-text" style="width:50px;height:14px;"></div>
        <div class="skeleton skeleton-text" style="width:50px;height:14px;"></div>
      </div>
    </div>`;
}

function createProfileSkeleton() {
  return `
    <div class="profile-cover skeleton-cover">
      <div class="profile-avatar-wrap"><div class="skeleton skeleton-avatar-xl"></div></div>
    </div>
    <div class="profile-header" style="margin-top:8px;">
      <div>
        <div class="skeleton skeleton-text" style="width:180px;height:20px;margin-bottom:8px;"></div>
        <div class="skeleton skeleton-text" style="width:100px;height:14px;"></div>
      </div>
    </div>
    <div class="profile-stats" style="margin-top:20px;">
      <div class="stat-item"><div class="skeleton skeleton-text" style="width:30px;height:20px;margin:0 auto 4px;"></div><div class="skeleton skeleton-text" style="width:40px;height:12px;margin:0 auto;"></div></div>
      <div class="stat-item"><div class="skeleton skeleton-text" style="width:30px;height:20px;margin:0 auto 4px;"></div><div class="skeleton skeleton-text" style="width:50px;height:12px;margin:0 auto;"></div></div>
      <div class="stat-item"><div class="skeleton skeleton-text" style="width:30px;height:20px;margin:0 auto 4px;"></div><div class="skeleton skeleton-text" style="width:50px;height:12px;margin:0 auto;"></div></div>
    </div>`;
}

// ═══════════════════════════════════════════════
//  Layout Builder
// ═══════════════════════════════════════════════
function buildLayout(app, activePage) {
  const user = getCurrentUser();

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">🌐</div>
          <div class="logo-text">SocialSphere</div>
        </div>
        <button class="nav-link ${activePage === 'feed' ? 'active' : ''}" id="nav-feed">
          ${Icons.home} <span>Home</span>
        </button>
        <button class="nav-link ${activePage === 'search' ? 'active' : ''}" id="nav-search">
          ${Icons.search} <span>Explore</span>
        </button>
        <button class="nav-link ${activePage === 'notifications' ? 'active' : ''}" id="nav-notifications">
          <span class="nav-bell-wrap">${Icons.bell}<span class="notif-badge hidden" id="sidebar-notif-badge">0</span></span> <span>Notifications</span>
        </button>
        <button class="nav-link ${activePage === 'profile' ? 'active' : ''}" id="nav-profile">
          ${Icons.user} <span>Profile</span>
        </button>
        <button class="nav-link ${activePage === 'settings' ? 'active' : ''}" id="nav-settings">
          ${Icons.settings} <span>Settings</span>
        </button>
        ${user ? `
        <div class="sidebar-user" id="sidebar-user-card">
          <img src="${user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}" alt="" class="avatar avatar-sm" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${user.username}'"/>
          <div class="user-info">
            <div class="user-name">${user.fullName || user.username}</div>
            <div class="user-handle">@${user.username}</div>
          </div>
          <button id="logout-btn" title="Logout" class="sidebar-logout-btn">${Icons.logout}</button>
        </div>` : ''}
      </aside>

      <!-- Main -->
      <main class="main-content" id="page-content"></main>

      <!-- Right Panel -->
      <aside class="right-panel" id="right-panel"></aside>
    </div>

    <!-- FAB -->
    <button class="fab" id="fab-compose" title="New Post">${Icons.plus}</button>

    <!-- Compose Modal -->
    <div class="modal-overlay hidden" id="compose-modal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Create Post</h2>
          <button class="modal-close" id="close-compose">✕</button>
        </div>
        <div class="compose-modal-body">
          <img src="${user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}" class="avatar avatar-md" alt="" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}'"/>
          <div class="compose-modal-fields">
            <textarea class="compose-input" id="modal-post-content" placeholder="What's on your mind?" maxlength="500"></textarea>
            <div class="compose-image-row">
              ${Icons.image}
              <input type="url" class="compose-image-input" id="modal-image-url" placeholder="Image URL (optional)"/>
            </div>
            <div class="compose-image-preview hidden" id="modal-image-preview">
              <img src="" alt="Preview" id="modal-preview-img"/>
              <button class="compose-preview-remove" id="modal-remove-preview">✕</button>
            </div>
          </div>
        </div>
        <div class="compose-modal-footer">
          <span class="char-count" id="modal-char-count">0/500</span>
          <button class="btn btn-primary" id="modal-submit-post">Post</button>
        </div>
      </div>
    </div>
  `;

  // Navigation bindings
  const nav = (hash) => () => navigate(hash);
  document.getElementById('nav-feed')?.addEventListener('click', nav('#feed'));
  document.getElementById('nav-search')?.addEventListener('click', nav('#search'));
  document.getElementById('nav-notifications')?.addEventListener('click', nav('#notifications'));
  document.getElementById('nav-settings')?.addEventListener('click', nav('#settings'));
  document.getElementById('nav-profile')?.addEventListener('click', () => {
    if (user) navigate(`#profile/${user.username}`);
  });

  // Poll notification count
  updateNotifBadge();
  document.getElementById('sidebar-user-card')?.addEventListener('click', (e) => {
    if (!e.target.closest('#logout-btn') && user) navigate(`#profile/${user.username}`);
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    removeToken(); removeCurrentUser();
    navigate('#login');
    toast('Logged out successfully', 'info');
  });

  // Compose Modal
  const fab = document.getElementById('fab-compose');
  const modal = document.getElementById('compose-modal');
  const closeModal = () => modal.classList.add('hidden');
  fab?.addEventListener('click', () => modal.classList.remove('hidden'));
  document.getElementById('close-compose')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  const textarea = document.getElementById('modal-post-content');
  const charCount = document.getElementById('modal-char-count');
  textarea?.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len}/500`;
    charCount.className = 'char-count' + (len > 450 ? (len >= 500 ? ' over' : ' warning') : '');
  });

  // Image URL preview in modal
  const modalImgInput = document.getElementById('modal-image-url');
  const modalPreview = document.getElementById('modal-image-preview');
  const modalPreviewImg = document.getElementById('modal-preview-img');
  modalImgInput?.addEventListener('input', () => {
    const url = modalImgInput.value.trim();
    if (url) {
      modalPreviewImg.src = url;
      modalPreviewImg.onload = () => modalPreview.classList.remove('hidden');
      modalPreviewImg.onerror = () => modalPreview.classList.add('hidden');
    } else {
      modalPreview.classList.add('hidden');
    }
  });
  document.getElementById('modal-remove-preview')?.addEventListener('click', () => {
    modalImgInput.value = '';
    modalPreview.classList.add('hidden');
  });

  document.getElementById('modal-submit-post')?.addEventListener('click', async () => {
    const content = textarea.value.trim();
    const imageUrl = document.getElementById('modal-image-url').value.trim();
    if (!content) { toast('Write something first!', 'error'); return; }
    const btn = document.getElementById('modal-submit-post');
    btn.classList.add('btn-loading');
    btn.disabled = true;
    try {
      await apiFetch('/posts', { method: 'POST', body: JSON.stringify({ content, imageUrl }) });
      toast('Post published! 🚀', 'success');
      closeModal();
      textarea.value = '';
      document.getElementById('modal-image-url').value = '';
      modalPreview.classList.add('hidden');
      charCount.textContent = '0/500';
      // Refresh feed if active
      if (window.location.hash === '#feed' || !window.location.hash) {
        navigate('#feed');
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  });

  return {
    content: document.getElementById('page-content'),
    panel: document.getElementById('right-panel'),
  };
}

// ═══════════════════════════════════════════════
//  Post Card Component
// ═══════════════════════════════════════════════
function createPostCard(post, currentUser, index = 0) {
  const isOwner = currentUser && post.author?.id === currentUser.id;
  const card = document.createElement('article');
  card.className = 'post-card stagger-in';
  card.style.animationDelay = `${index * 60}ms`;
  card.dataset.postId = post.id;

  card.innerHTML = `
    <div class="post-header">
      <img src="${post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`}"
           class="avatar avatar-md" alt="${post.author?.username}"
           onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.username}'"/>
      <div class="post-author">
        <div class="post-author-name" data-username="${post.author?.username}">${post.author?.fullName || post.author?.username}</div>
        <div class="post-author-handle">@${post.author?.username} · <span>${timeAgo(post.createdAt)}</span></div>
      </div>
    </div>
    <p class="post-content post-content-clickable" data-post-id="${post.id}">${escapeHtml(post.content)}</p>
    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post image" onerror="this.remove()"/>` : ''}
    <div class="post-actions">
      <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" data-post-id="${post.id}">
        ${post.isLiked ? Icons.heartFilled : Icons.heart}
        <span class="like-count">${post.likesCount || 0}</span>
      </button>
      <button class="action-btn comment-toggle-btn" data-post-id="${post.id}">
        ${Icons.comment}
        <span class="comment-count">${post.commentsCount || 0}</span>
      </button>
      ${isOwner ? `<button class="action-btn action-btn-delete delete-post-btn" data-post-id="${post.id}" title="Delete post">${Icons.trash}</button>` : ''}
    </div>
    <div class="comments-section" id="comments-${post.id}">
      <div class="comments-list" id="comments-list-${post.id}">
        <div class="spinner"></div>
      </div>
      ${currentUser ? `
      <div class="comment-form">
        <img src="${currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}"
             class="avatar avatar-xs" alt="" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.username}'"/>
        <input class="comment-input" placeholder="Write a comment…" data-post-id="${post.id}"/>
        <button class="btn btn-primary btn-sm comment-submit-btn" data-post-id="${post.id}">${Icons.send}</button>
      </div>` : ''}
    </div>
  `;

  // Author name click → profile
  card.querySelector('.post-author-name').addEventListener('click', () => {
    navigate(`#profile/${post.author?.username}`);
  });

  // Post content click → post detail
  card.querySelector('.post-content-clickable')?.addEventListener('click', () => {
    navigate(`#post/${post.id}`);
  });

  // Like button
  card.querySelector('.like-btn').addEventListener('click', async function() {
    if (!currentUser) { toast('Login to like posts', 'error'); return; }
    const btn = this;
    const isLiked = btn.classList.contains('liked');
    // Optimistic update
    btn.classList.toggle('liked');
    const currentCount = parseInt(btn.querySelector('.like-count')?.textContent || 0);
    btn.innerHTML = (isLiked ? Icons.heart : Icons.heartFilled) + `<span class="like-count">${currentCount + (isLiked ? -1 : 1)}</span>`;
    try {
      const data = await apiFetch(`/posts/${post.id}/like`, { method: 'POST' });
      btn.innerHTML = (data.liked ? Icons.heartFilled : Icons.heart) + `<span class="like-count">${data.likesCount}</span>`;
      btn.classList.toggle('liked', data.liked);
    } catch {
      btn.classList.toggle('liked', isLiked);
      btn.innerHTML = (isLiked ? Icons.heartFilled : Icons.heart) + `<span class="like-count">${currentCount}</span>`;
    }
  });

  // Comment toggle
  card.querySelector('.comment-toggle-btn').addEventListener('click', async function() {
    const section = document.getElementById(`comments-${post.id}`);
    const isOpen = section.classList.contains('open');
    section.classList.toggle('open', !isOpen);
    if (!isOpen) {
      await loadComments(post.id, currentUser);
    }
  });

  // Delete post
  card.querySelector('.delete-post-btn')?.addEventListener('click', async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await apiFetch(`/posts/${post.id}`, { method: 'DELETE' });
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => card.remove(), 300);
      toast('Post deleted', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  // Comment submit
  card.querySelector('.comment-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') card.querySelector('.comment-submit-btn')?.click();
  });
  card.querySelector('.comment-submit-btn')?.addEventListener('click', async () => {
    const input = card.querySelector('.comment-input');
    const content = input.value.trim();
    if (!content) return;
    try {
      const comment = await apiFetch('/comments', { method: 'POST', body: JSON.stringify({ postId: post.id, content }) });
      input.value = '';
      const list = document.getElementById(`comments-list-${post.id}`);
      prependComment(list, comment, currentUser, post.id);
      // update count
      const countEl = card.querySelector('.comment-count');
      if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  return card;
}

async function loadComments(postId, currentUser) {
  const list = document.getElementById(`comments-list-${postId}`);
  if (!list) return;
  try {
    const data = await apiFetch(`/posts/${postId}`);
    const comments = data.comments || [];
    list.innerHTML = '';
    if (comments.length === 0) {
      list.innerHTML = `<p class="comments-empty">No comments yet. Be the first!</p>`;
      return;
    }
    comments.forEach(c => prependComment(list, c, currentUser, postId, false));
  } catch {
    list.innerHTML = `<p style="font-size:13px;color:var(--danger);">Failed to load comments.</p>`;
  }
}

function prependComment(list, comment, currentUser, postId, prepend = true) {
  const isOwner = currentUser && comment.author?.id === currentUser.id;
  const el = document.createElement('div');
  el.className = 'comment-item';
  el.dataset.commentId = comment.id;
  el.innerHTML = `
    <img src="${comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.username}`}"
         class="avatar avatar-xs" alt="" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.username}'"/>
    <div class="comment-body">
      <div class="comment-author" data-username="${comment.author?.username}">${comment.author?.fullName || comment.author?.username}</div>
      <div class="comment-text">${escapeHtml(comment.content)}</div>
    </div>
    ${isOwner ? `<button class="delete-comment-btn" data-comment-id="${comment.id}" title="Delete">${Icons.trash}</button>` : ''}
  `;
  el.querySelector('.comment-author')?.addEventListener('click', () => navigate(`#profile/${comment.author?.username}`));
  el.querySelector('.delete-comment-btn')?.addEventListener('click', async () => {
    try {
      await apiFetch(`/comments/${comment.id}`, { method: 'DELETE' });
      el.remove();
      // update count
      const card = document.querySelector(`[data-post-id="${postId}"]`);
      const countEl = card?.querySelector('.comment-count');
      if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
    } catch (err) {
      toast(err.message, 'error');
    }
  });
  // Remove "no comments" message if present
  const emptyMsg = list.querySelector('.comments-empty');
  if (emptyMsg) emptyMsg.remove();
  
  if (prepend && list.firstChild) {
    list.insertBefore(el, list.firstChild);
  } else {
    list.appendChild(el);
  }
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

// ═══════════════════════════════════════════════
//  Right Panel: Suggested Users & Trending
// ═══════════════════════════════════════════════
const trendingTags = [
  { tag: '#WebDev', category: 'Technology' },
  { tag: '#OpenSource', category: 'Development' },
  { tag: '#JavaScript', category: 'Programming' },
  { tag: '#Design', category: 'Creative' },
  { tag: '#TechNews', category: 'Trending' },
];

async function renderRightPanel(panel) {
  panel.innerHTML = `
    <div class="panel-card" id="suggested-panel">
      <div class="panel-title">Suggested People</div>
      <div class="spinner"></div>
    </div>
    <div class="panel-card">
      <div class="panel-title">Trending Topics</div>
      ${trendingTags.map((t, i) => `
        <div class="trending-tag" data-tag="${t.tag}">
          <div>
            <div class="trending-label">Trending in ${t.category}</div>
            <div class="trending-title">${t.tag}</div>
            <div class="trending-count">${(Math.random() * 10 + 1).toFixed(1)}K posts</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Trending tags click → search
  panel.querySelectorAll('.trending-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      navigate('#search');
      setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) {
          input.value = tag.dataset.tag;
          input.dispatchEvent(new Event('input'));
        }
      }, 150);
    });
  });

  try {
    const { users } = await apiFetch('/users?q=');
    const currentUser = getCurrentUser();
    const filtered = users.filter(u => u.username !== currentUser?.username).slice(0, 4);
    const panel_el = document.getElementById('suggested-panel');
    if (!panel_el) return;
    panel_el.innerHTML = `<div class="panel-title">Suggested People</div>`;
    if (filtered.length === 0) {
      panel_el.innerHTML += `<p style="font-size:13px;color:var(--text-muted);">No suggestions right now.</p>`;
      return;
    }
    filtered.forEach(u => {
      const item = document.createElement('div');
      item.className = 'suggest-item';
      item.innerHTML = `
        <img src="${u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}"
             class="avatar avatar-sm" alt="" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${u.username}'"/>
        <div class="suggest-info">
          <div class="suggest-name">${u.fullName || u.username}</div>
          <div class="suggest-handle">@${u.username}</div>
        </div>
        <button class="suggest-follow-btn" data-username="${u.username}">Follow</button>
      `;
      item.querySelector('.suggest-name').addEventListener('click', () => navigate(`#profile/${u.username}`));
      item.querySelector('.suggest-follow-btn').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        try {
          const data = await apiFetch(`/users/${u.username}/follow`, { method: 'POST' });
          btn.textContent = data.following ? 'Following' : 'Follow';
          btn.classList.toggle('following', data.following);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
      panel_el.appendChild(item);
    });
  } catch { /* silently fail */ }
}

// ═══════════════════════════════════════════════
//  PAGE: Feed
// ═══════════════════════════════════════════════
async function renderFeed(app) {
  const { content, panel } = buildLayout(app, 'feed');
  const currentUser = getCurrentUser();

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Home</h1>
    </div>
    <!-- Desktop Compose -->
    <div class="compose-card" id="desktop-compose">
      <div class="compose-row">
        <img src="${currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}"
             class="avatar avatar-md" alt="" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username}'"/>
        <div style="flex:1;">
          <textarea class="compose-input" id="compose-text" placeholder="What's on your mind, ${currentUser?.fullName?.split(' ')[0] || currentUser?.username}?" maxlength="500"></textarea>
          <div class="compose-image-row">
            ${Icons.image}
            <input type="url" class="compose-image-input" id="compose-image-url" placeholder="Image URL (optional)"/>
          </div>
          <div class="compose-image-preview hidden" id="compose-image-preview">
            <img src="" alt="Preview" id="compose-preview-img"/>
            <button class="compose-preview-remove" id="compose-remove-preview">✕</button>
          </div>
        </div>
      </div>
      <div class="compose-footer">
        <span class="char-count" id="compose-char-count">0/500</span>
        <button class="btn btn-primary" id="compose-submit">Post</button>
      </div>
    </div>
    <div id="posts-container">${createPostSkeleton().repeat(3)}</div>
  `;

  // Compose char counter
  const composeTxt = document.getElementById('compose-text');
  const composeCount = document.getElementById('compose-char-count');
  composeTxt?.addEventListener('input', () => {
    const len = composeTxt.value.length;
    composeCount.textContent = `${len}/500`;
    composeCount.className = 'char-count' + (len > 450 ? (len >= 500 ? ' over' : ' warning') : '');
  });

  // Image URL preview in desktop compose
  const composeImgInput = document.getElementById('compose-image-url');
  const composePreview = document.getElementById('compose-image-preview');
  const composePreviewImg = document.getElementById('compose-preview-img');
  composeImgInput?.addEventListener('input', () => {
    const url = composeImgInput.value.trim();
    if (url) {
      composePreviewImg.src = url;
      composePreviewImg.onload = () => composePreview.classList.remove('hidden');
      composePreviewImg.onerror = () => composePreview.classList.add('hidden');
    } else {
      composePreview.classList.add('hidden');
    }
  });
  document.getElementById('compose-remove-preview')?.addEventListener('click', () => {
    composeImgInput.value = '';
    composePreview.classList.add('hidden');
  });

  // Desktop compose submit
  document.getElementById('compose-submit')?.addEventListener('click', async () => {
    const content_val = composeTxt.value.trim();
    const imageUrl = document.getElementById('compose-image-url').value.trim();
    if (!content_val) return;
    const btn = document.getElementById('compose-submit');
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const post = await apiFetch('/posts', { method: 'POST', body: JSON.stringify({ content: content_val, imageUrl }) });
      composeTxt.value = '';
      document.getElementById('compose-image-url').value = '';
      composePreview.classList.add('hidden');
      composeCount.textContent = '0/500';
      const container = document.getElementById('posts-container');
      const emptyState = container.querySelector('.empty-state');
      if (emptyState) emptyState.remove();
      container.insertBefore(createPostCard(post, currentUser, 0), container.firstChild);
      toast('Post published! 🚀', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });

  // Load posts with infinite scroll
  let page = 1;
  let loading = false;
  let allLoaded = false;

  async function loadPosts() {
    if (loading || allLoaded) return;
    loading = true;
    try {
      const data = await apiFetch(`/posts?page=${page}&limit=10`);
      const container = document.getElementById('posts-container');
      if (!container) return;

      if (page === 1) container.innerHTML = '';

      if (data.posts.length === 0 && page === 1) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">✨</div>
            <h3>No posts yet</h3>
            <p>Be the first to post something!</p>
          </div>`;
        return;
      }

      const startIndex = (page - 1) * 10;
      data.posts.forEach((post, i) => container.appendChild(createPostCard(post, currentUser, startIndex + i)));

      if (page >= data.totalPages) {
        allLoaded = true;
        if (data.posts.length > 0 && page > 1) {
          const end = document.createElement('p');
          end.className = 'feed-end-msg';
          end.textContent = "You're all caught up! 🎉";
          container.appendChild(end);
        }
      }
    } catch (err) {
      const container = document.getElementById('posts-container');
      if (container && page === 1) container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load posts</h3><p>${err.message}</p></div>`;
    } finally {
      loading = false;
    }
  }

  // Infinite scroll
  const mainContent = document.querySelector('.main-content');
  function handleScroll() {
    if (!mainContent || allLoaded || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = mainContent;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      page++;
      loadPosts();
    }
  }
  mainContent?.addEventListener('scroll', handleScroll);
  // Also detect window scroll for mobile
  window.__feedScrollHandler = () => {
    if (allLoaded || loading) return;
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 300) {
      page++;
      loadPosts();
    }
  };
  window.addEventListener('scroll', window.__feedScrollHandler);

  await loadPosts();
  renderRightPanel(panel);
}

// ═══════════════════════════════════════════════
//  PAGE: Post Detail (Thread View)
// ═══════════════════════════════════════════════
async function renderPostDetail(app, postId) {
  const { content } = buildLayout(app, '');
  const currentUser = getCurrentUser();

  content.innerHTML = `
    <div class="page-header">
      <button class="back-btn" id="back-btn">${Icons.back}</button>
      <h1 class="page-title">Post</h1>
    </div>
    <div id="post-detail-container">${createPostSkeleton()}</div>
  `;

  document.getElementById('back-btn')?.addEventListener('click', () => {
    window.history.back();
  });

  try {
    const post = await apiFetch(`/posts/${postId}`);
    const container = document.getElementById('post-detail-container');
    if (!container) return;
    container.innerHTML = '';

    // Create the post card with comments auto-open
    const card = createPostCard({
      ...post,
      likesCount: post.likesCount,
      commentsCount: post.comments?.length || 0,
    }, currentUser, 0);
    container.appendChild(card);

    // Auto-open comments
    const section = document.getElementById(`comments-${post.id}`);
    if (section) {
      section.classList.add('open');
      const list = document.getElementById(`comments-list-${post.id}`);
      if (list && post.comments) {
        list.innerHTML = '';
        if (post.comments.length === 0) {
          list.innerHTML = `<p class="comments-empty">No comments yet. Be the first!</p>`;
        } else {
          post.comments.forEach(c => prependComment(list, c, currentUser, post.id, false));
        }
      }
    }
  } catch (err) {
    const container = document.getElementById('post-detail-container');
    if (container) container.innerHTML = `<div class="empty-state"><div class="empty-icon">😕</div><h3>Post not found</h3><p>${err.message}</p></div>`;
  }
}

// ═══════════════════════════════════════════════
//  PAGE: Profile
// ═══════════════════════════════════════════════
async function renderProfile(app, username) {
  const { content } = buildLayout(app, 'profile');
  const currentUser = getCurrentUser();
  const targetUsername = username || currentUser?.username;

  content.innerHTML = createProfileSkeleton();

  try {
    const user = await apiFetch(`/users/${targetUsername}`);
    const postsData = await apiFetch(`/users/${targetUsername}/posts`);
    const isOwner = currentUser && user.id === currentUser.id;

    content.innerHTML = `
      <div class="profile-cover">
        <div class="profile-avatar-wrap">
          <img src="${user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}"
               class="avatar avatar-xl" alt="${user.username}"
               onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${user.username}'"/>
        </div>
      </div>
      <div class="profile-header">
        <div>
          <div class="profile-name">${user.fullName || user.username}</div>
          <div class="profile-handle">@${user.username}</div>
          ${user.bio ? `<div class="profile-bio">${escapeHtml(user.bio)}</div>` : ''}
          <div class="profile-joined">📅 Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0;">
          ${isOwner
            ? `<button class="btn btn-ghost btn-sm" id="edit-profile-btn">${Icons.edit} Edit Profile</button>`
            : (currentUser ? `<button class="btn ${user.isFollowing ? 'btn-outline' : 'btn-primary'} btn-sm" id="follow-btn" data-username="${user.username}">${user.isFollowing ? 'Following' : 'Follow'}</button>` : '')
          }
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat-item"><div class="stat-value">${user.postsCount}</div><div class="stat-label">Posts</div></div>
        <div class="stat-item"><div class="stat-value" id="profile-followers-count">${user.followersCount}</div><div class="stat-label">Followers</div></div>
        <div class="stat-item"><div class="stat-value">${user.followingCount}</div><div class="stat-label">Following</div></div>
      </div>
      <div class="section-title">Posts</div>
      <div class="user-posts-grid" id="user-posts"></div>
    `;

    // Follow button
    document.getElementById('follow-btn')?.addEventListener('click', async function() {
      try {
        const data = await apiFetch(`/users/${user.username}/follow`, { method: 'POST' });
        this.textContent = data.following ? 'Following' : 'Follow';
        this.className = `btn ${data.following ? 'btn-outline' : 'btn-primary'} btn-sm`;
        document.getElementById('profile-followers-count').textContent = data.followersCount;
        toast(data.following ? `Following @${user.username}` : `Unfollowed @${user.username}`, 'success');
      } catch (err) { toast(err.message, 'error'); }
    });

    // Edit Profile Modal
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      showEditProfileModal(currentUser, async (updated) => {
        setCurrentUser({ ...currentUser, ...updated });
        navigate(`#profile/${updated.username || currentUser.username}`);
      });
    });

    // Posts grid
    const postsGrid = document.getElementById('user-posts');
    if (!postsGrid) return;
    postsGrid.innerHTML = ''; // Prevent race condition duplicates
    if (postsData.posts.length === 0) {
      postsGrid.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>No posts yet</h3><p>${isOwner ? 'Share your first post!' : `${user.fullName || user.username} hasn't posted yet.`}</p></div>`;
    } else {
      postsData.posts.forEach((post, i) => postsGrid.appendChild(createPostCard(post, currentUser, i)));
    }
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">😕</div><h3>User not found</h3><p>${err.message}</p></div>`;
  }
}

function showEditProfileModal(user, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Edit Profile</h2>
        <button class="modal-close" id="close-edit-modal">✕</button>
      </div>
      <div class="auth-form">
        <div class="input-group">
          <label class="input-label">Display Name</label>
          <input class="input" id="edit-fullname" value="${user.fullName || ''}" placeholder="Your name"/>
        </div>
        <div class="input-group">
          <label class="input-label">Bio</label>
          <textarea class="input" id="edit-bio" placeholder="Tell us about yourself" style="min-height:80px;">${user.bio || ''}</textarea>
        </div>
        <div class="input-group">
          <label class="input-label">Avatar URL</label>
          <input class="input" id="edit-avatar" value="${user.avatar || ''}" placeholder="https://..."/>
        </div>
        <button class="btn btn-primary btn-block" id="save-profile-btn">Save Changes</button>
        <div class="error-msg" id="edit-error"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#close-edit-modal').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#save-profile-btn').addEventListener('click', async () => {
    const btn = overlay.querySelector('#save-profile-btn');
    const errEl = overlay.querySelector('#edit-error');
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const data = await apiFetch('/users/profile/update', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: overlay.querySelector('#edit-fullname').value.trim(),
          bio: overlay.querySelector('#edit-bio').value.trim(),
          avatar: overlay.querySelector('#edit-avatar').value.trim(),
        })
      });
      toast('Profile updated! ✨', 'success');
      overlay.remove();
      onSave(data.user);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.add('visible');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════
//  PAGE: Search / Explore
// ═══════════════════════════════════════════════
async function renderSearch(app) {
  const { content, panel } = buildLayout(app, 'search');
  const currentUser = getCurrentUser();

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Explore</h1>
    </div>
    <div class="search-box">
      ${Icons.search}
      <input class="input" id="search-input" placeholder="Search people…" autocomplete="off"/>
    </div>
    <div id="search-results">
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Find people</h3>
        <p>Search by name or username</p>
      </div>
    </div>
  `;

  let debounceTimer;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const q = e.target.value.trim();
    debounceTimer = setTimeout(async () => {
      const results = document.getElementById('search-results');
      if (!results) return;
      if (!q) {
        results.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>Find people</h3><p>Search by name or username</p></div>`;
        return;
      }
      results.innerHTML = '<div class="spinner"></div>';
      try {
        const data = await apiFetch(`/users?q=${encodeURIComponent(q)}`);
        results.innerHTML = '';
        if (data.users.length === 0) {
          results.innerHTML = `<div class="empty-state"><div class="empty-icon">😕</div><h3>No users found</h3><p>Try a different search</p></div>`;
          return;
        }
        data.users.forEach((u, i) => {
          const card = document.createElement('div');
          card.className = 'user-card stagger-in';
          card.style.animationDelay = `${i * 60}ms`;
          card.innerHTML = `
            <img src="${u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}"
                 class="avatar avatar-md" alt="" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${u.username}'"/>
            <div class="user-card-info">
              <div class="user-card-name">${u.fullName || u.username}</div>
              <div class="user-card-handle">@${u.username}</div>
              ${u.bio ? `<div class="user-card-bio">${escapeHtml(u.bio)}</div>` : ''}
            </div>
            <div class="user-card-meta">
              <div class="user-card-followers">${u._count?.followers || 0} followers</div>
              ${currentUser && currentUser.username !== u.username
                ? `<button class="suggest-follow-btn" data-username="${u.username}">Follow</button>`
                : ''}
            </div>
          `;
          card.addEventListener('click', (e) => {
            if (!e.target.closest('.suggest-follow-btn')) navigate(`#profile/${u.username}`);
          });
          card.querySelector('.suggest-follow-btn')?.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            try {
              const res = await apiFetch(`/users/${u.username}/follow`, { method: 'POST' });
              btn.textContent = res.following ? 'Following' : 'Follow';
              btn.classList.toggle('following', res.following);
              toast(res.following ? `Following @${u.username}` : `Unfollowed @${u.username}`, 'success');
            } catch (err) { toast(err.message, 'error'); }
          });
          results.appendChild(card);
        });
      } catch (err) {
        results.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Search failed</h3><p>${err.message}</p></div>`;
      }
    }, 350);
  });

  // Focus search on load
  setTimeout(() => document.getElementById('search-input')?.focus(), 100);
  renderRightPanel(panel);
}

// ═══════════════════════════════════════════════
//  PAGE: Login
// ═══════════════════════════════════════════════
function renderLogin(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">🌐</div>
          <h1>SocialSphere</h1>
          <p>Connect with the world</p>
        </div>
        <form class="auth-form" id="login-form" novalidate>
          <div class="input-group">
            <label class="input-label" for="login-email">Email</label>
            <input class="input" id="login-email" type="email" placeholder="you@example.com" autocomplete="email" required/>
          </div>
          <div class="input-group">
            <label class="input-label" for="login-password">Password</label>
            <div class="password-wrapper">
              <input class="input" id="login-password" type="password" placeholder="••••••••" autocomplete="current-password" required/>
              <button type="button" class="password-toggle" id="login-pw-toggle" tabindex="-1">${Icons.eye}</button>
            </div>
          </div>
          <div class="error-msg" id="login-error"></div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" id="login-btn">Sign In</button>
        </form>
        <div class="auth-divider">
          Don't have an account? <a id="go-register">Create one</a>
        </div>
        <div class="divider"></div>
        <div class="demo-accounts">
          <strong>Demo accounts:</strong><br>
          alice@demo.com / bob@demo.com / carol@demo.com<br>
          <span class="demo-password">Password: password123</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('go-register').addEventListener('click', () => navigate('#register'));

  // Password toggle
  setupPasswordToggle('login-pw-toggle', 'login-password');

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errEl.classList.remove('visible');
    btn.classList.add('btn-loading'); btn.disabled = true;

    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setToken(data.token);
      setCurrentUser(data.user);
      toast(`Welcome back, ${data.user.fullName || data.user.username}! 👋`, 'success');
      navigate('#feed');
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.add('visible');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════
//  PAGE: Register
// ═══════════════════════════════════════════════
function renderRegister(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">🌐</div>
          <h1>SocialSphere</h1>
          <p>Join the community today</p>
        </div>
        <form class="auth-form" id="register-form" novalidate>
          <div class="input-group">
            <label class="input-label" for="reg-fullname">Full Name</label>
            <input class="input" id="reg-fullname" type="text" placeholder="John Doe" autocomplete="name"/>
          </div>
          <div class="input-group">
            <label class="input-label" for="reg-username">Username</label>
            <input class="input" id="reg-username" type="text" placeholder="johndoe" autocomplete="username" required/>
          </div>
          <div class="input-group">
            <label class="input-label" for="reg-email">Email</label>
            <input class="input" id="reg-email" type="email" placeholder="you@example.com" autocomplete="email" required/>
          </div>
          <div class="input-group">
            <label class="input-label" for="reg-password">Password</label>
            <div class="password-wrapper">
              <input class="input" id="reg-password" type="password" placeholder="Min. 6 characters" autocomplete="new-password" required/>
              <button type="button" class="password-toggle" id="reg-pw-toggle" tabindex="-1">${Icons.eye}</button>
            </div>
          </div>
          <div class="error-msg" id="reg-error"></div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" id="reg-btn">Create Account</button>
        </form>
        <div class="auth-divider">
          Already have an account? <a id="go-login">Sign in</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('go-login').addEventListener('click', () => navigate('#login'));

  // Password toggle
  setupPasswordToggle('reg-pw-toggle', 'reg-password');

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl = document.getElementById('reg-error');
    const btn = document.getElementById('reg-btn');

    errEl.classList.remove('visible');

    if (!username || !email || !password) {
      errEl.textContent = 'Please fill in all required fields.';
      errEl.classList.add('visible');
      return;
    }
    if (password.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      errEl.classList.add('visible');
      return;
    }

    btn.classList.add('btn-loading'); btn.disabled = true;

    try {
      const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password, fullName }) });
      setToken(data.token);
      setCurrentUser(data.user);
      toast(`Welcome to SocialSphere, ${data.user.fullName || data.user.username}! 🎉`, 'success');
      navigate('#feed');
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.add('visible');
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════
//  Password Toggle Utility
// ═══════════════════════════════════════════════
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!toggle || !input) return;
  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.innerHTML = isPassword ? Icons.eyeOff : Icons.eye;
  });
}

// ═══════════════════════════════════════════════
//  Notification Badge Polling
// ═══════════════════════════════════════════════
async function updateNotifBadge() {
  if (!getToken()) return;
  try {
    const data = await apiFetch('/notifications');
    const count = data.unreadCount || 0;
    document.querySelectorAll('.notif-badge').forEach(el => {
      el.textContent = count > 9 ? '9+' : count;
      el.classList.toggle('hidden', count === 0);
    });
  } catch { /* silent */ }
}

// Poll every 30 seconds
setInterval(() => {
  if (getToken()) updateNotifBadge();
}, 30000);

// ═══════════════════════════════════════════════
//  PAGE: Notifications
// ═══════════════════════════════════════════════
async function renderNotifications(app) {
  const { content } = buildLayout(app, 'notifications');
  const currentUser = getCurrentUser();

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Notifications</h1>
      <button class="btn btn-ghost btn-sm" id="mark-read-btn">Mark all read</button>
    </div>
    <div id="notif-list"><div class="spinner"></div></div>
  `;

  document.getElementById('mark-read-btn')?.addEventListener('click', async () => {
    try {
      await apiFetch('/notifications/read', { method: 'PUT' });
      document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
      updateNotifBadge();
      toast('All caught up!', 'success');
    } catch (err) { toast(err.message, 'error'); }
  });

  try {
    const data = await apiFetch('/notifications');
    const container = document.getElementById('notif-list');
    if (!container) return;

    if (data.notifications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>When someone likes, comments, or follows you, you'll see it here.</p>
        </div>`;
      return;
    }

    container.innerHTML = '';
    data.notifications.forEach((n, i) => {
      const item = document.createElement('div');
      item.className = `notif-item stagger-in ${n.read ? '' : 'unread'}`;
      item.style.animationDelay = `${i * 40}ms`;

      const typeIcons = { LIKE: Icons.heartFilled, COMMENT: Icons.comment, FOLLOW: Icons.user };
      const typeColors = { LIKE: 'notif-like', COMMENT: 'notif-comment', FOLLOW: 'notif-follow' };
      const messages = {
        LIKE: `liked your post`,
        COMMENT: `commented on your post`,
        FOLLOW: `started following you`,
      };

      const postSnippet = n.post ? `<span class="notif-snippet">"${escapeHtml(n.post.content.substring(0, 50))}${n.post.content.length > 50 ? '…' : ''}"</span>` : '';

      item.innerHTML = `
        <div class="notif-icon ${typeColors[n.type]}">${typeIcons[n.type] || ''}</div>
        <img src="${n.actor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor?.username}`}"
             class="avatar avatar-sm" alt=""
             onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${n.actor?.username}'"/>
        <div class="notif-body">
          <div class="notif-text">
            <strong class="notif-actor" data-username="${n.actor?.username}">${n.actor?.fullName || n.actor?.username}</strong>
            ${messages[n.type] || 'interacted with you'}
          </div>
          ${postSnippet}
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
      `;

      // Click navigations
      item.querySelector('.notif-actor')?.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(`#profile/${n.actor?.username}`);
      });
      item.addEventListener('click', () => {
        if (n.type === 'FOLLOW') navigate(`#profile/${n.actor?.username}`);
        else if (n.post) navigate(`#post/${n.post.id}`);
      });

      container.appendChild(item);
    });

    // Mark as read on visit
    if (data.unreadCount > 0) {
      apiFetch('/notifications/read', { method: 'PUT' }).then(() => updateNotifBadge()).catch(() => {});
    }
  } catch (err) {
    const container = document.getElementById('notif-list');
    if (container) container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}

// ═══════════════════════════════════════════════
//  Cleanup on route change
// ═══════════════════════════════════════════════
const originalRouter = router;
function routerWithCleanup() {
  // Clean up scroll listeners from feed
  if (window.__feedScrollHandler) {
    window.removeEventListener('scroll', window.__feedScrollHandler);
    window.__feedScrollHandler = null;
  }
  originalRouter();
}
// Replace the hashchange listener
window.removeEventListener('hashchange', router);
window.addEventListener('hashchange', routerWithCleanup);

// ═══════════════════════════════════════════════
//  PAGE: Settings
// ═══════════════════════════════════════════════
async function renderSettings(app) {
  const { content } = buildLayout(app, 'settings');
  const user = getCurrentUser();

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
    </div>
    <div class="settings-container" style="max-width: 600px; padding: 0 16px;">
      <div class="settings-section stagger-in" style="animation-delay: 0ms">
        <h2 class="section-title">Preferences</h2>
        <div class="panel-card">
          <div class="settings-row" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="settings-info">
              <h3 style="font-size: 16px; margin-bottom: 4px;">Theme Option</h3>
              <p style="font-size: 13px; color: var(--text-muted);">Platform default is the Black & Orange theme.</p>
            </div>
            <button class="action-btn" disabled style="background: var(--bg-card-hover); color: var(--text-primary); cursor: not-allowed; border-radius: 8px;">Active</button>
          </div>
        </div>
      </div>

      <div class="settings-section stagger-in" style="animation-delay: 50ms; margin-top: 32px;">
        <h2 class="section-title">Account</h2>
        <div class="panel-card">
          <div class="settings-row" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="settings-info">
              <h3 style="font-size: 16px; margin-bottom: 4px;">Account Info</h3>
              <p style="font-size: 13px; color: var(--text-muted);">Manage your login details and active sessions.</p>
            </div>
            <button class="action-btn" onclick="alert('Demo feature!')" style="background: rgba(255, 115, 0, 0.1); color: var(--accent); border-radius: 8px;">Manage</button>
          </div>
          <div class="divider" style="margin: 20px 0;"></div>
          <div class="settings-row" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="settings-info">
              <h3 style="color: var(--danger); font-size: 16px; margin-bottom: 4px;">Delete Account</h3>
              <p style="font-size: 13px; color: var(--text-muted);">Permanently remove your account and all data.</p>
            </div>
            <button class="action-btn" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); border-radius: 8px;" onclick="alert('Cannot delete demo account')">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════
//  Init
// ═══════════════════════════════════════════════
router();

