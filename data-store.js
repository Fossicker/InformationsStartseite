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
    blog:    'drv_blog_posts',
    ticker:  'drv_news_ticker',
    board:   'drv_schwarzes_brett',
    termine: 'drv_termine',
    fokus:   'drv_fokusthemen',
  };
  const SEED_FLAG = 'drv_seeded_v3';

  // ── Demo-Seed (einmalig beim ersten Laden) ──
  const DEMO_BLOG = [
    {
      id: 'seed_b1',
      title: 'Lorem ipsum dolor sit amet consectetur',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
      author: 'Lorem Ipsum',
      readTime: '4 Min.',
      category: 'Lorem',
      createdAt: '2026-04-12T08:00:00.000Z',
    },
    {
      id: 'seed_b2',
      title: 'Ut enim ad minim veniam quis nostrud',
      excerpt: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
      author: 'Dolor Amet',
      readTime: '3 Min.',
      category: 'Ipsum',
      createdAt: '2026-04-08T08:00:00.000Z',
    },
    {
      id: 'seed_b3',
      title: 'Excepteur sint occaecat cupidatat non proident',
      excerpt: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore.',
      author: 'Consectetur Sit',
      readTime: '6 Min.',
      category: 'Dolor',
      createdAt: '2026-04-02T08:00:00.000Z',
    },
    {
      id: 'seed_b4',
      title: 'Nemo enim ipsam voluptatem quia voluptas',
      excerpt: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.',
      author: 'Adipiscing Elit',
      readTime: '2 Min.',
      category: 'Amet',
      createdAt: '2026-03-28T08:00:00.000Z',
    },
  ];

  const DEMO_TICKER = [
    { id: 'seed_t1', text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod', createdAt: '2026-04-15T08:00:00.000Z' },
    { id: 'seed_t2', text: 'Tempor incididunt ut labore et dolore magna aliqua ut enim ad minim', createdAt: '2026-04-14T08:00:00.000Z' },
    { id: 'seed_t3', text: 'Veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo', createdAt: '2026-04-13T08:00:00.000Z' },
    { id: 'seed_t4', text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore', createdAt: '2026-04-10T08:00:00.000Z' },
    { id: 'seed_t5', text: 'Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia', createdAt: '2026-04-05T08:00:00.000Z' },
  ];

  const DEMO_ADS = [
    { id: 'seed_a1', title: 'Lorem ipsum dolor sit amet', text: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', author: 'L. Ipsum', category: 'Verschenken', createdAt: '2026-04-14T08:00:00.000Z' },
    { id: 'seed_a2', title: 'Ut enim ad minim veniam', text: 'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.', author: 'D. Amet', category: 'Mitfahren', createdAt: '2026-04-11T08:00:00.000Z' },
    { id: 'seed_a3', title: 'Duis aute irure dolor', text: 'In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur sunt in culpa.', author: 'C. Sit', category: 'Sport & Freizeit', createdAt: '2026-04-09T08:00:00.000Z' },
  ];

  const DEMO_TERMINE = [
    { id: 'seed_tr1', title: 'Lorem ipsum dolor', date: '2026-04-24', time: '14:00 Uhr', location: 'Sit amet', createdAt: '2026-04-10T08:00:00.000Z' },
    { id: 'seed_tr2', title: 'Consectetur adipiscing', date: '2026-05-06', time: '10:00 Uhr', location: 'Elit sed', createdAt: '2026-04-09T08:00:00.000Z' },
    { id: 'seed_tr3', title: 'Eiusmod tempor incididunt', date: '2026-05-15', time: '17:30 Uhr', location: 'Ut labore', createdAt: '2026-04-05T08:00:00.000Z' },
  ];

  const DEMO_FOKUS = [
    { id: 'seed_f1', title: 'Lorem ipsum dolor',    url: '#', description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', createdAt: '2026-04-10T08:00:00.000Z' },
    { id: 'seed_f2', title: 'Consectetur adipiscing', url: '#', description: 'Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.', createdAt: '2026-04-08T08:00:00.000Z' },
    { id: 'seed_f3', title: 'Duis aute irure',       url: '#', description: 'Dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.', createdAt: '2026-04-01T08:00:00.000Z' },
  ];

  // ── Pub/Sub-Listener ────────────────────────
  const listeners = { blog: [], ticker: [], board: [], termine: [], fokus: [] };

  // ── Read/Write ──────────────────────────────
  function getAll(key) {
    try {
      const raw = localStorage.getItem(STORAGE[key]);
      const items = raw ? JSON.parse(raw) : [];
      // Termine & Fokus: gespeicherte Reihenfolge beibehalten (Drag & Drop)
      if (key === 'termine' || key === 'fokus') return items;
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
    // Termine & Fokus: neue Einträge ans Ende (manuelle Reihenfolge)
    if (key === 'termine' || key === 'fokus') {
      items.push(newItem);
    } else {
      items.unshift(newItem);
    }
    saveAll(key, items);
    notify(key);
    return newItem;
  }

  function remove(key, id) {
    const items = getAll(key).filter(i => i.id !== id);
    saveAll(key, items);
    notify(key);
  }

  /**
   * Speichert eine neue Reihenfolge (Array von Items) direkt.
   * Wird vom Drag & Drop im Admin aufgerufen.
   */
  function reorder(key, orderedItems) {
    saveAll(key, orderedItems);
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
    saveAll('termine', DEMO_TERMINE);
    saveAll('fokus', DEMO_FOKUS);
    notify('blog');
    notify('ticker');
    notify('board');
    notify('termine');
    notify('fokus');
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
    // Ältere Seed-Flags entfernen
    localStorage.removeItem('drv_seeded_v1');
    localStorage.removeItem('drv_seeded_v2');
    saveAll('blog', DEMO_BLOG);
    saveAll('ticker', DEMO_TICKER);
    saveAll('board', DEMO_ADS);
    saveAll('termine', DEMO_TERMINE);
    saveAll('fokus', DEMO_FOKUS);
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
    reorder,
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
