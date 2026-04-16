// ════════════════════════════════════════════════════════
// Lokaler Datenspeicher
// Speichert Blog-Beiträge, Ticker-Meldungen und
// Anzeigen im LocalStorage des Browsers.
//
// ⚠️ Wichtig: Daten sind PRO BROWSER und PRO GERÄT.
//     Was Nutzer A sieht, sieht Nutzer B nicht.
//     Für synchronisierte Inhalte wäre ein Backend
//     wie Firebase/Firestore nötig.
// ════════════════════════════════════════════════════════

(function () {
  // ── Storage-Keys ─────────────────────────────
  const STORAGE = {
    blog:   'drv_blog_posts',
    ticker: 'drv_news_ticker',
    board:  'drv_schwarzes_brett',
  };
  const SEED_FLAG = 'drv_seeded_v1';

  // ── Demo-Seed (einmalig beim ersten Laden) ──
  const DEMO_BLOG = [
    {
      id: 'seed_b1',
      title: 'Neue Regelungen zur Flexi-Rente ab 2026',
      excerpt: 'Die wichtigsten Änderungen im Überblick: Was sich für Versicherte und Arbeitgeber ändert und welche Fristen zu beachten sind.',
      author: 'Dr. Martina Schreiber',
      readTime: '4 Min.',
      category: 'Gesetzgebung',
      createdAt: '2026-04-12T08:00:00.000Z',
    },
    {
      id: 'seed_b2',
      title: 'IT-Modernisierung: Rollout Phase 3 gestartet',
      excerpt: 'Der dritte Abschnitt der digitalen Transformation unserer Fachanwendungen beginnt planmäßig. Alle Teams erhalten bis Ende Mai Zugang.',
      author: 'Thomas Krüger',
      readTime: '3 Min.',
      category: 'IT & Digital',
      createdAt: '2026-04-08T08:00:00.000Z',
    },
    {
      id: 'seed_b3',
      title: 'Ergebnisse der Mitarbeiterbefragung 2025',
      excerpt: 'Die Auswertung liegt vor: Hohe Zufriedenheit bei der Zusammenarbeit, Verbesserungsbedarf beim Wissensmanagement.',
      author: 'Sandra Hoffmann',
      readTime: '6 Min.',
      category: 'Personal',
      createdAt: '2026-04-02T08:00:00.000Z',
    },
    {
      id: 'seed_b4',
      title: 'Schulungsangebot Q2: Jetzt anmelden',
      excerpt: 'Von agilen Methoden bis Zeitmanagement – das neue Quartalsprogramm der internen Weiterbildung steht bereit.',
      author: 'Personalentwicklung',
      readTime: '2 Min.',
      category: 'Weiterbildung',
      createdAt: '2026-03-28T08:00:00.000Z',
    },
  ];

  const DEMO_TICKER = [
    { id: 'seed_t1', text: '📌 Betriebsversammlung am 24. April um 14:00 Uhr im Großen Saal', createdAt: '2026-04-15T08:00:00.000Z' },
    { id: 'seed_t2', text: '🔧 Wartungsarbeiten am Intranet: Sa 19. April, 06:00–10:00 Uhr',     createdAt: '2026-04-14T08:00:00.000Z' },
    { id: 'seed_t3', text: '🎉 Herzlichen Glückwunsch an Team B3 zum erfolgreichen Projektabschluss!', createdAt: '2026-04-13T08:00:00.000Z' },
    { id: 'seed_t4', text: '📋 Erinnerung: Reisekostenabrechnungen Q1 bis 30. April einreichen',   createdAt: '2026-04-10T08:00:00.000Z' },
    { id: 'seed_t5', text: '🏃 Firmenlauf Berlin 2026 – Anmeldung bis 15. Mai',                    createdAt: '2026-04-05T08:00:00.000Z' },
  ];

  const DEMO_ADS = [
    { id: 'seed_a1', title: 'Schreibtischlampe zu verschenken', text: 'Funktioniert einwandfrei, brauche sie nur nicht mehr. Abholung Haus 1, Zimmer 214.', author: 'M. Weber', category: 'Verschenken', createdAt: '2026-04-14T08:00:00.000Z' },
    { id: 'seed_a2', title: 'Mitfahrgelegenheit Potsdam ↔ Berlin', text: 'Suche Mitfahrer*in ab Potsdam Hbf, Mo–Do, Abfahrt 7:15. Kostenbeteiligung nach Absprache.', author: 'K. Neumann', category: 'Mitfahren', createdAt: '2026-04-11T08:00:00.000Z' },
    { id: 'seed_a3', title: 'Laufgruppe mittwochs', text: 'Wir joggen jeden Mittwoch um 17:30 ab Haupteingang, ca. 5 km. Alle Levels willkommen!', author: 'S. Park', category: 'Sport & Freizeit', createdAt: '2026-04-09T08:00:00.000Z' },
  ];

  // ── Pub/Sub-Listener ────────────────────────
  const listeners = { blog: [], ticker: [], board: [] };

  // ── Read/Write ──────────────────────────────
  function getAll(key) {
    try {
      const raw = localStorage.getItem(STORAGE[key]);
      const items = raw ? JSON.parse(raw) : [];
      // Neueste zuerst
      return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (e) {
      console.warn('[DRV] LocalStorage Lesefehler:', e);
      return [];
    }
  }

  function saveAll(key, items) {
    try {
      localStorage.setItem(STORAGE[key], JSON.stringify(items));
    } catch (e) {
      console.error('[DRV] LocalStorage Schreibfehler:', e);
      alert('Speichern fehlgeschlagen. Möglicherweise ist der Speicher voll.');
    }
  }

  function add(key, item) {
    const items = getAll(key);
    const newItem = {
      id: 'i_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      ...item,
    };
    items.unshift(newItem);
    saveAll(key, items);
    notify(key);
    return newItem;
  }

  function remove(key, id) {
    const items = getAll(key).filter(i => i.id !== id);
    saveAll(key, items);
    notify(key);
  }

  function clear(key) {
    localStorage.removeItem(STORAGE[key]);
    notify(key);
  }

  function resetToDemo() {
    saveAll('blog', DEMO_BLOG);
    saveAll('ticker', DEMO_TICKER);
    saveAll('board', DEMO_ADS);
    notify('blog');
    notify('ticker');
    notify('board');
  }

  // ── Subscribe ───────────────────────────────
  function subscribe(key, callback) {
    listeners[key].push(callback);
    callback(getAll(key));
    return () => {
      listeners[key] = listeners[key].filter(cb => cb !== callback);
    };
  }

  function notify(key) {
    const data = getAll(key);
    listeners[key].forEach(cb => {
      try { cb(data); } catch (e) { console.error(e); }
    });
  }

  // Cross-Tab-Sync: andere Tabs melden Änderungen
  window.addEventListener('storage', (e) => {
    for (const [coll, sKey] of Object.entries(STORAGE)) {
      if (e.key === sKey) notify(coll);
    }
  });

  // ── Erstinitialisierung mit Demo-Daten ─────
  function seedIfEmpty() {
    if (localStorage.getItem(SEED_FLAG)) return;
    saveAll('blog', DEMO_BLOG);
    saveAll('ticker', DEMO_TICKER);
    saveAll('board', DEMO_ADS);
    localStorage.setItem(SEED_FLAG, '1');
    console.info('[DRV] Demo-Daten initialisiert.');
  }

  seedIfEmpty();

  // ── Hilfsfunktionen ─────────────────────────
  function formatDate(input) {
    if (!input) return 'Gerade eben';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('de-DE', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  // ── Öffentliche API ─────────────────────────
  window.DRV = {
    getAll,
    add,
    remove,
    clear,
    resetToDemo,
    subscribe,
    formatDate,
    escapeHtml,
    AD_CATEGORIES: [
      'Biete', 'Suche', 'Verschenken',
      'Mitfahren', 'Sport & Freizeit', 'Sonstiges'
    ],
    BLOG_CATEGORIES: [
      'Gesetzgebung', 'IT & Digital', 'Personal',
      'Weiterbildung', 'Allgemein', 'Veranstaltung'
    ],
  };
})();
