// BNI 121 — Shared sidebar + unified theme + Lucide icon system.
// Usage: just include <script src="bni-sidebar.js"></script> on any BNI page.
//   - Injects light-themed sidebar with auto-active link
//   - Removes legacy dark <aside> and orphan "Log Out" buttons
//   - Loads Lucide icons from CDN (window.lucide) and exposes window.bniRenderIcons()
//   - Applies shared theme CSS (top bar, cards, tables, stat cards, buttons)

(function () {
  // ─── Load Lucide icons from CDN ────────────────────────────────────────────
  if (!window.__lucideLoading) {
    window.__lucideLoading = true;
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.js';
    s.onload = () => { if (window.lucide) window.lucide.createIcons(); };
    document.head.appendChild(s);
  }
  window.bniRenderIcons = function () {
    if (window.lucide) { window.lucide.createIcons(); return; }
    const check = () => { if (window.lucide) window.lucide.createIcons(); else setTimeout(check, 40); };
    check();
  };

  // ─── Navigation config ─────────────────────────────────────────────────────
  const LINKS = [
    { href: '/bni/dashboard.html',      icon: 'sunrise',        label: 'Today',           desc: 'Daily to-do list and follow-up queue — your morning starting point' },
    { href: '/bni/pipeline.html',       icon: 'trello',         label: 'Pipeline',         desc: 'Visual kanban board — drag contacts across stages from Identified to Converted' },
    { href: '/bni/tracker.html',        icon: 'clipboard-list', label: 'Contact Tracker',  desc: 'Full contact list — add, search, filter by status or city, manage leads' },
    { href: '/bni/zoom-completed.html', icon: 'video',          label: 'Zoom Meetings',    desc: 'Log of completed 121 Zoom calls — record outcomes and set follow-ups' },
    { href: '/bni/followup.html',       icon: 'repeat',         label: 'Follow-ups',       desc: 'All scheduled appointments — see who needs a nudge and log meeting results' },
    { href: '/bni/templates.html',      icon: 'mail',           label: 'Templates',        desc: 'Ready-to-send WhatsApp & email messages — personalise once, copy for any contact' },
    { href: '/bni/proposals.html',     icon: 'file-check',     label: 'Proposals',        desc: 'Pending proposal approvals — assignees upload, Dr. Murali reviews and approves' },
    { href: '/bni/members.html',        icon: 'users',          label: 'All Members',      desc: 'BNI chapter member directory — browse and search all chapter members' },
    { href: '/bni/settings.html',       icon: 'settings',       label: 'Settings',         desc: 'Configure WhatsApp API, AI, and other integrations for this CRM' },
  ];

  // ─── Shared theme CSS ──────────────────────────────────────────────────────
  const THEME_CSS = `
    :root {
      --bni-bg:#f8fafc; --bni-surface:#ffffff; --bni-border:#e2e8f0;
      --bni-text:#0f172a; --bni-muted:#64748b; --bni-subtle:#94a3b8;
      --bni-primary:#2563eb; --bni-primary-2:#1d4ed8; --bni-primary-soft:#eff6ff;
      --bni-shadow-xs:0 1px 2px rgba(15,23,42,0.04);
      --bni-shadow-sm:0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
      --bni-shadow-md:0 4px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04);
      --bni-radius-sm:8px; --bni-radius:12px; --bni-radius-lg:16px;
    }
    body.bni-sidebar-applied {
      font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif !important;
      background:var(--bni-bg) !important;
      color:var(--bni-text);
      margin-left:240px;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
    }
    body.bni-sidebar-applied .md\\:ml-60,body.bni-sidebar-applied .ml-60,
    body.bni-sidebar-applied .md\\:ml-56,body.bni-sidebar-applied .ml-56 { margin-left:0 !important; }

    /* Icons (Lucide) baseline */
    body.bni-sidebar-applied [data-lucide] { width:16px; height:16px; stroke-width:2; vertical-align:-2px; }
    body.bni-sidebar-applied .icon-sm [data-lucide] { width:14px; height:14px; }
    body.bni-sidebar-applied .icon-lg [data-lucide] { width:20px; height:20px; }
    body.bni-sidebar-applied .icon-xl [data-lucide] { width:28px; height:28px; }

    /* Top bar */
    body.bni-sidebar-applied nav.bg-white.border-b,
    body.bni-sidebar-applied nav.sticky {
      background:rgba(255,255,255,0.85) !important;
      border-bottom:1px solid var(--bni-border) !important;
      box-shadow:none !important;
      padding:16px 28px !important;
      backdrop-filter:saturate(1.3) blur(12px);
      -webkit-backdrop-filter:saturate(1.3) blur(12px);
    }

    body.bni-sidebar-applied .max-w-6xl,
    body.bni-sidebar-applied .max-w-7xl { max-width:1280px; }

    /* Cards */
    body.bni-sidebar-applied .bg-white.rounded-xl,
    body.bni-sidebar-applied .bg-white.rounded-2xl,
    body.bni-sidebar-applied .glass {
      background:var(--bni-surface) !important;
      border:1px solid var(--bni-border) !important;
      box-shadow:var(--bni-shadow-sm) !important;
      border-radius:var(--bni-radius-lg) !important;
    }
    body.bni-sidebar-applied .member-card:hover {
      box-shadow:var(--bni-shadow-md) !important;
      transform:translateY(-1px);
      border-color:#cbd5e1 !important;
    }

    /* Stat cards */
    body.bni-sidebar-applied #stats-row > div,
    body.bni-sidebar-applied #statsBar > div {
      background:var(--bni-surface);
      border:1px solid var(--bni-border);
      border-radius:var(--bni-radius);
      padding:16px 18px;
      box-shadow:var(--bni-shadow-xs);
      transition:all 0.15s ease;
    }
    body.bni-sidebar-applied #stats-row > div:hover { box-shadow:var(--bni-shadow-sm); transform:translateY(-1px); }
    body.bni-sidebar-applied #stats-row > div p:first-child,
    body.bni-sidebar-applied #stats-row > div p.text-2xl { font-weight:800; letter-spacing:-0.02em; }
    body.bni-sidebar-applied #stats-row > div p:last-child {
      color:var(--bni-muted);
      font-size:11px;
      letter-spacing:0.06em;
      text-transform:uppercase;
      font-weight:700;
      margin-top:2px;
    }

    /* Tables */
    body.bni-sidebar-applied table thead,
    body.bni-sidebar-applied table thead tr { background:#f8fafc !important; }
    body.bni-sidebar-applied table thead th {
      font-size:11px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:0.06em;
      color:var(--bni-muted) !important;
      padding:12px 16px !important;
    }
    body.bni-sidebar-applied table tbody tr { transition:background 0.12s ease; }
    body.bni-sidebar-applied table tbody tr:hover { background:#f8fafc !important; }
    body.bni-sidebar-applied table tbody td { padding:14px 16px !important; }

    /* Inputs */
    body.bni-sidebar-applied input,
    body.bni-sidebar-applied select,
    body.bni-sidebar-applied textarea {
      border-radius:var(--bni-radius-sm) !important;
      border:1px solid var(--bni-border) !important;
    }
    body.bni-sidebar-applied input:focus,
    body.bni-sidebar-applied select:focus,
    body.bni-sidebar-applied textarea:focus {
      border-color:var(--bni-primary) !important;
      box-shadow:0 0 0 3px rgba(37,99,235,0.12) !important;
      outline:none;
    }

    /* Buttons */
    body.bni-sidebar-applied button.bg-blue-600,
    body.bni-sidebar-applied a.bg-blue-600 {
      background:var(--bni-primary) !important;
      box-shadow:0 1px 2px rgba(37,99,235,0.25);
      font-weight:600;
      letter-spacing:-0.01em;
    }
    body.bni-sidebar-applied button.bg-blue-600:hover,
    body.bni-sidebar-applied a.bg-blue-600:hover {
      background:var(--bni-primary-2) !important;
      box-shadow:0 4px 12px rgba(37,99,235,0.25);
    }

    /* Badges */
    body.bni-sidebar-applied .badge {
      display:inline-flex !important;
      align-items:center;
      gap:4px;
      padding:3px 9px !important;
      border-radius:999px !important;
      font-size:11px !important;
      font-weight:700 !important;
      letter-spacing:0.04em !important;
      text-transform:uppercase !important;
    }

    /* Quick filter buttons */
    body.bni-sidebar-applied .qf-btn {
      display:inline-flex;
      align-items:center;
      gap:5px;
      font-weight:600;
      letter-spacing:-0.01em;
    }

    /* Typography */
    body.bni-sidebar-applied h1 { letter-spacing:-0.02em; }
    body.bni-sidebar-applied h2 { letter-spacing:-0.015em; }

    @media (max-width: 768px) {
      body.bni-sidebar-applied { margin-left:0 !important; }
    }
  `;

  const SIDEBAR_CSS = `
    #bni-sidebar-root {
      position:fixed; top:0; left:0; bottom:0; width:240px;
      background:#ffffff; border-right:1px solid var(--bni-border);
      display:flex; flex-direction:column;
      font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
      z-index:50;
      box-shadow:var(--bni-shadow-xs);
    }
    #bni-sidebar-root .bs-header {
      padding:18px 20px 16px;
      border-bottom:1px solid #f1f5f9;
      display:flex; align-items:center; gap:12px;
    }
    #bni-sidebar-root .bs-logo {
      width:40px; height:40px; flex-shrink:0;
      border-radius:11px;
      background:linear-gradient(135deg,#2563eb 0%,#4f46e5 55%,#7c3aed 100%);
      display:flex; align-items:center; justify-content:center;
      color:#ffffff; font-weight:800; font-size:15px;
      letter-spacing:0.01em;
      box-shadow:0 4px 12px rgba(37,99,235,0.25);
    }
    #bni-sidebar-root .bs-title { font-weight:700; color:#0f172a; font-size:14px; line-height:1.15; letter-spacing:-0.01em; }
    #bni-sidebar-root .bs-subtitle { font-size:11px; color:#64748b; margin-top:3px; letter-spacing:0.02em; font-weight:500; }
    #bni-sidebar-root nav { flex:1; padding:14px 10px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
    #bni-sidebar-root .bs-link {
      display:flex; align-items:center; gap:11px;
      padding:9px 12px; border-radius:9px;
      color:#475569; font-size:13.5px; font-weight:500;
      text-decoration:none;
      transition:background 0.12s ease, color 0.12s ease;
      letter-spacing:-0.005em;
    }
    #bni-sidebar-root .bs-link:hover { background:#f1f5f9; color:#0f172a; }
    #bni-sidebar-root .bs-link.active {
      background:linear-gradient(90deg,#eff6ff 0%,#f5f7ff 100%);
      color:#1d4ed8; font-weight:600;
    }
    #bni-sidebar-root .bs-link.active [data-lucide] { color:#1d4ed8; }
    #bni-sidebar-root .bs-link [data-lucide] { width:17px; height:17px; stroke-width:2; flex-shrink:0; color:#64748b; }
    #bni-sidebar-root .bs-link:hover [data-lucide] { color:#0f172a; }
    #bni-sidebar-root .bs-footer {
      padding:14px 20px;
      border-top:1px solid #f1f5f9;
      font-size:11px; color:#94a3b8;
      display:flex; align-items:center; justify-content:space-between;
      font-weight:500;
    }
    #bni-sidebar-root .bs-footer-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.18); }
    @media (max-width: 768px) {
      #bni-sidebar-root {
        position:relative; width:100%; height:auto;
        border-right:0; border-bottom:1px solid var(--bni-border);
      }
      #bni-sidebar-root nav { flex-direction:row; flex-wrap:nowrap; overflow-x:auto; padding:8px; gap:4px; }
      #bni-sidebar-root .bs-link { white-space:nowrap; padding:6px 10px; font-size:12.5px; }
      #bni-sidebar-root .bs-footer { display:none; }
    }
  `;

  function renderHTML() {
    const current = (location.pathname || '').toLowerCase();
    const items = LINKS.map(l => {
      const active = current.endsWith(l.href.toLowerCase()) ? 'active' : '';
      return `<a class="bs-link ${active}" href="${l.href}" title="${l.desc}"><i data-lucide="${l.icon}"></i>${l.label}</a>`;
    }).join('');
    return `
      <aside id="bni-sidebar-root">
        <div class="bs-header">
          <div class="bs-logo">BK</div>
          <div>
            <div class="bs-title">Dr. BK Murali</div>
            <div class="bs-subtitle">BNI 121 · AI Tools</div>
          </div>
        </div>
        <nav>${items}</nav>
        <div class="bs-footer">
          <span>v2 · Supabase</span>
          <span class="bs-footer-dot" title="Connected"></span>
        </div>
      </aside>
    `;
  }

  function removeLegacySidebars() {
    document.querySelectorAll('aside').forEach(a => {
      if (a.id === 'bni-sidebar-root') return;
      const cls = (a.className || '').toString();
      if (/bg-slate-9\d\d|bg-gray-9\d\d|w-60|w-56/.test(cls)) a.remove();
    });
  }

  function removeLegacyLogoutButtons() {
    document.querySelectorAll('button, a').forEach(el => {
      const onclick = (el.getAttribute('onclick') || '').toLowerCase();
      const text = (el.textContent || '').trim().toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      const isLogout =
        onclick.includes('dologout') ||
        (onclick.includes('logout') && !onclick.includes('autologout')) ||
        href.includes('/auth/login') ||
        text === 'log out' ||
        text === 'logout' ||
        text === 'sign out';
      if (isLogout) {
        const parent = el.parentElement;
        el.remove();
        if (parent && parent.children.length === 0 && !parent.textContent.trim()) parent.remove();
      }
    });
  }

  function apply() {
    // Public-facing scheduler page should NOT get the admin sidebar injected.
    // (bni-sidebar.js is loaded on every BNI page but scheduler is customer-facing.)
    if (location.pathname.endsWith('/bni/scheduler.html') || location.pathname === '/bni/scheduler') {
      // Public booking page — no admin sidebar, no ml-56 offset
      if (!document.querySelector('link[rel="icon"]')) {
        const fav = document.createElement('link');
        fav.rel = 'icon';
        fav.type = 'image/svg+xml';
        fav.href = '/bni/favicon.svg';
        document.head.appendChild(fav);
      }
      const s = document.createElement('style');
      s.textContent = `
        body { font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif !important; background:#f8fafc !important; }
        body .md\\:ml-60, body .md\\:ml-56, body .ml-60, body .ml-56 { margin-left:0 !important; }
        body nav.bg-white.border-b, body nav.sticky { background:rgba(255,255,255,0.92) !important; border-bottom:1px solid #e2e8f0 !important; box-shadow:none !important; backdrop-filter:saturate(1.2) blur(8px); }
      `;
      document.head.appendChild(s);
      removeLegacySidebars();
      return;
    }
    // Inject favicon on every BNI page (if not already set)
    if (!document.querySelector('link[rel="icon"]')) {
      const fav = document.createElement('link');
      fav.rel = 'icon';
      fav.type = 'image/svg+xml';
      fav.href = '/bni/favicon.svg';
      document.head.appendChild(fav);
    }
    const style = document.createElement('style');
    style.textContent = SIDEBAR_CSS + '\n' + THEME_CSS;
    document.head.appendChild(style);
    removeLegacySidebars();
    const mount = document.getElementById('bni-sidebar-mount');
    const html = renderHTML();
    if (mount) mount.outerHTML = html;
    else document.body.insertAdjacentHTML('afterbegin', html);
    document.body.classList.add('bni-sidebar-applied');
    removeLegacyLogoutButtons();
    window.bniRenderIcons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
