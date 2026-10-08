// Compiled inline; the full reviewed dataset is requested only on explicit use.
interface MapNode {
  id: string;
  parentId: string | null;
  label: string;
  kind: string;
  status: string;
  source: string;
  surface: string;
  livePath?: string;
  [key: string]: unknown;
}
const explorer = document.querySelector<HTMLElement>('[data-explorer]');
if (explorer) {
  const loadButton = explorer.querySelector<HTMLButtonElement>('[data-load]')!;
  const controls = explorer.querySelector<HTMLElement>('[data-controls]')!;
  const search = explorer.querySelector<HTMLInputElement>('input')!;
  const results = explorer.querySelector<HTMLElement>('[data-results]')!;
  const selected = explorer.querySelector<HTMLElement>('[data-selected]')!;
  const count = explorer.querySelector<HTMLElement>('[data-result-count]')!;
  const paging = explorer.querySelector<HTMLElement>('[data-paging]')!;
  const prev = explorer.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = explorer.querySelector<HTMLButtonElement>('[data-next]')!;
  const pageText = explorer.querySelector<HTMLElement>('[data-page]')!;
  const labels: Record<string, string> = {
    discovered: 'Keşfedildi, açılmadı',
    visited: 'İncelendi',
    plan_blocked: 'Plan nedeniyle kapalı',
    permission_blocked: 'Yetki nedeniyle kapalı',
    error: 'Açılırken hata',
    not_applicable: 'Uygulanamaz',
    live_ui: 'Canlı arayüzde görüldü',
    schema_ui: 'Şema üst verisi',
    official_source: 'Resmî kaynak',
    read: 'Okuma',
    write: 'Yazma',
    destructive: 'Yıkıcı',
    unknown: 'Belirsiz',
    not_run: 'Yapılmadı',
    passed: 'Geçti',
    failed: 'Başarısız',
    page: 'Sayfa',
    section: 'Bölüm',
    field: 'Alan',
    action: 'Eylem',
    tab: 'Sekme',
    menu: 'Menü',
    table: 'Tablo',
    dialog: 'İletişim kutusu',
    option: 'Seçenek',
  };
  let nodes: MapNode[] = [];
  let byId = new Map<string, MapNode>();
  let children = new Map<string, MapNode[]>();
  let indexed: { node: MapNode; text: string }[] = [];
  let pending: Promise<void> | undefined;
  let loaded = false;
  let pageIndex = 0;
  let childIndex = 0;
  let selectionGeneration = 0;
  const LIMIT = 30;
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase('tr-TR')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');
  const make = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text?: string,
  ) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const linkFor = (node: MapNode) => {
    const a = make('a', node.label);
    a.className = 'sitemap-link';
    a.href = '#node=' + encodeURIComponent(node.id);
    a.dataset.nodeLink = node.id;
    return a;
  };
  function validateBoundary(value: unknown): MapNode[] {
    if (!value || typeof value !== 'object') throw new Error('Geçersiz veri.');
    const data = value as {
      schemaVersion?: unknown;
      reviewedForPublic?: unknown;
      nodes?: unknown;
    };
    if (
      data.schemaVersion !== 1 ||
      data.reviewedForPublic !== true ||
      !Array.isArray(data.nodes)
    )
      throw new Error('Geçersiz yayın.');
    const ids = new Map<string, MapNode>();
    const enums: Record<string, string[]> = {
      surface: ['dashboard', 'desk'],
      kind: [
        'page',
        'tab',
        'section',
        'field',
        'table',
        'menu',
        'action',
        'dialog',
        'option',
      ],
      status: [
        'discovered',
        'visited',
        'plan_blocked',
        'permission_blocked',
        'error',
        'not_applicable',
      ],
      source: ['live_ui', 'schema_ui', 'official_source'],
      risk: ['read', 'write', 'destructive', 'unknown'],
      functionalTest: ['not_run', 'passed', 'failed'],
    };
    for (const item of data.nodes) {
      if (!item || typeof item !== 'object' || Array.isArray(item))
        throw new Error('Geçersiz kayıt.');
      const node = item as MapNode;
      if (
        typeof node.id !== 'string' ||
        !node.id ||
        ids.has(node.id) ||
        typeof node.label !== 'string' ||
        !node.label ||
        !(node.parentId === null || typeof node.parentId === 'string') ||
        node.executed !== false
      )
        throw new Error('Geçersiz kimlik.');
      for (const [key, allowed] of Object.entries(enums))
        if (!allowed.includes(String(node[key])))
          throw new Error('Geçersiz sınıflandırma.');
      for (const key of ['notes', 'options'])
        if (
          node[key] !== undefined &&
          (!Array.isArray(node[key]) ||
            !(node[key] as unknown[]).every((v) => typeof v === 'string'))
        )
          throw new Error('Geçersiz metin.');
      if (
        node.livePath !== undefined &&
        (typeof node.livePath !== 'string' ||
          !/^\/(?:dashboard|app)(?:\/[A-Za-z0-9._~%-]+)*\/?$/.test(
            node.livePath,
          ) ||
          decodeURIComponent(node.livePath)
            .split('/')
            .some(
              (part) => part === '.' || part === '..' || part.includes('\\'),
            ))
      )
        throw new Error('Geçersiz bağlantı.');
      for (const key of ['observedAt', 'observedDate'])
        if (node[key] !== undefined) {
          const value = node[key];
          if (
            typeof value !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}/.test(value) ||
            !Number.isFinite(Date.parse(value))
          )
            throw new Error('Geçersiz tarih.');
          const date = value.slice(0, 10);
          if (
            new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date ||
            (key === 'observedDate' && value !== date) ||
            (key === 'observedAt' &&
              !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
                value,
              ))
          )
            throw new Error('Geçersiz tarih.');
        }
      if (node.observedAt !== undefined && node.observedDate !== undefined)
        throw new Error('Çift tarih.');
      ids.set(node.id, node);
    }
    const complete = new Set<string>();
    for (const node of ids.values()) {
      let current: MapNode | undefined = node;
      const chain = new Set<string>();
      while (current && !complete.has(current.id)) {
        if (chain.has(current.id)) throw new Error('Döngü.');
        chain.add(current.id);
        if (current.parentId !== null && !ids.has(current.parentId))
          throw new Error('Üst öğe yok.');
        current = current.parentId ? ids.get(current.parentId) : undefined;
      }
      for (const id of chain) complete.add(id);
    }
    return data.nodes as MapNode[];
  }
  async function load() {
    if (loaded) return;
    if (!pending) {
      count.textContent = 'Kayıtlar yükleniyor…';
      pending = (async () => {
        const url = new URL(explorer!.dataset.url!, location.href);
        if (url.origin !== location.origin)
          throw new Error('Kaynak aynı kökenden olmalı.');
        const response = await fetch(url.href, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Kayıtlar yüklenemedi.');
        const data = await response.json();
        nodes = validateBoundary(data);
        byId = new Map(nodes.map((n) => [n.id, n]));
        children = new Map();
        for (const node of nodes)
          if (node.parentId) {
            const group = children.get(node.parentId) ?? [];
            group.push(node);
            children.set(node.parentId, group);
          }
        indexed = nodes.map((node) => ({
          node,
          text: normalize(
            JSON.stringify(node) +
              ' ' +
              Object.values(node)
                .filter((v) => typeof v === 'string')
                .map((v) => labels[v as string] ?? v)
                .join(' '),
          ),
        }));
        loaded = true;
        controls.hidden = false;
        renderResults();
      })().catch((error) => {
        count.textContent =
          'Yükleme başarısız. “Tüm öğeleri aç” ile yeniden deneyin; JSON bağlantısı kullanılabilir.';
        pending = undefined;
        throw error;
      });
    }
    return pending;
  }
  function renderResults() {
    const query = normalize(search.value.trim());
    const found = indexed.filter((item) => !query || item.text.includes(query));
    const pages = Math.max(1, Math.ceil(found.length / LIMIT));
    pageIndex = Math.min(pageIndex, pages - 1);
    results.replaceChildren();
    for (const { node } of found.slice(
      pageIndex * LIMIT,
      (pageIndex + 1) * LIMIT,
    )) {
      const li = make('li');
      li.dataset.resultId = node.id;
      li.append(
        linkFor(node),
        make(
          'span',
          ` — ${labels[node.kind] ?? node.kind}; ${labels[node.status]}; ${labels[node.source]}`,
        ),
      );
      results.append(li);
    }
    count.textContent = `${found.length} / ${nodes.length} öğe`;
    paging.hidden = found.length <= LIMIT;
    prev.disabled = pageIndex === 0;
    next.disabled = pageIndex === pages - 1;
    pageText.textContent = `${pageIndex + 1} / ${pages}`;
  }
  function renderSelection(id: string) {
    const node = byId.get(id);
    selected.replaceChildren();
    delete selected.dataset.nodeId;
    if (!node) {
      selected.append(make('p', 'Bu kimlik yayımlanan kayıtlarda yok.'));
      return;
    }
    selected.dataset.nodeId = id;
    selected.append(make('h3', node.label));
    const trail = make('nav');
    trail.setAttribute('aria-label', 'Öğe yolu');
    const chain: MapNode[] = [];
    let ancestor = node.parentId ? byId.get(node.parentId) : undefined;
    while (ancestor) {
      chain.unshift(ancestor);
      ancestor = ancestor.parentId ? byId.get(ancestor.parentId) : undefined;
    }
    for (const item of chain) {
      trail.append(linkFor(item), document.createTextNode(' / '));
    }
    selected.append(trail);
    const dl = make('dl');
    for (const [key, title] of [
      ['kind', 'Tür'],
      ['surface', 'Yüzey'],
      ['status', 'Durum'],
      ['source', 'Gözlem kaynağı'],
      ['risk', 'Risk'],
      ['functionalTest', 'İşlev testi'],
      ['executed', 'İşlem çalıştırıldı'],
    ]) {
      const value = String(node[key]);
      dl.append(
        make('dt', title),
        make(
          'dd',
          key === 'executed'
            ? 'Hayır (false)'
            : `${labels[value] ?? value} (${value})`,
        ),
      );
    }
    if (node.observedAt)
      dl.append(
        make('dt', 'Gözlem (UTC)'),
        make(
          'dd',
          new Date(String(node.observedAt))
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ') + ' UTC',
        ),
      );
    if (node.observedDate)
      dl.append(
        make('dt', 'Gözlem'),
        make('dd', String(node.observedDate) + ' — Saat kaydı yok'),
      );
    selected.append(dl);
    const nearest = [node, ...[...chain].reverse()].find((n) => n.livePath);
    if (nearest) {
      const a = make(
        'a',
        nearest.id === node.id
          ? 'Press’te aç (oturum gerekir)'
          : `Press’te üst sayfayı aç: ${nearest.label} (oturum gerekir)`,
      );
      a.className = 'sitemap-link';
      a.href = new URL(nearest.livePath!, 'https://press.metaframer.net').href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      selected.append(a);
    } else
      selected.append(
        make(
          'p',
          'Bu öğe veya üst yolu için gözlemlenmiş Press bağlantısı yok.',
        ),
      );
    const details = make('details');
    details.className = 'sitemap-coverage';
    details.append(
      make('summary', 'Eksiksiz kayıt (notlar, seçenekler ve yollar dahil)'),
    );
    details.append(make('pre', JSON.stringify(node, null, 2)));
    selected.append(details);
    const descendants = children.get(id) ?? [];
    if (descendants.length) {
      selected.append(make('h4', `Alt öğeler (${descendants.length})`));
      const list = make('ul');
      list.className = 'sitemap-tree';
      const pages = Math.ceil(descendants.length / LIMIT);
      childIndex = Math.min(childIndex, pages - 1);
      for (const child of descendants.slice(
        childIndex * LIMIT,
        (childIndex + 1) * LIMIT,
      )) {
        const li = make('li');
        li.append(linkFor(child));
        list.append(li);
      }
      selected.append(list);
      if (pages > 1) {
        const nav = make('nav');
        nav.className = 'sitemap-inline-paging';
        nav.setAttribute('aria-label', 'Alt öğe sayfaları');
        const before = make('button', 'Önceki alt öğeler');
        before.className = 'button secondary';
        before.disabled = childIndex === 0;
        const after = make('button', 'Sonraki alt öğeler');
        after.className = 'button secondary';
        after.disabled = childIndex === pages - 1;
        before.onclick = () => {
          childIndex--;
          renderSelection(id);
          selected
            .querySelector<HTMLButtonElement>('nav button:not(:disabled)')
            ?.focus();
        };
        after.onclick = () => {
          childIndex++;
          renderSelection(id);
          (
            selected.querySelector<HTMLButtonElement>(
              'nav button:last-child:not(:disabled)',
            ) ??
            selected.querySelector<HTMLButtonElement>(
              'nav button:first-child:not(:disabled)',
            )
          )?.focus();
        };
        nav.append(before, make('span', `${childIndex + 1} / ${pages}`), after);
        selected.append(nav);
      }
    }
  }
  async function selectHash() {
    const generation = ++selectionGeneration;
    if (!location.hash.startsWith('#node=')) {
      selected.replaceChildren();
      delete selected.dataset.nodeId;
      return;
    }
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(6));
    } catch {
      count.textContent = 'Geçersiz öğe bağlantısı.';
      return;
    }
    try {
      await load();
      if (generation !== selectionGeneration) return;
      childIndex = 0;
      renderSelection(id);
    } catch {
      /* Recoverable message comes from load. */
    }
  }
  loadButton.hidden = false;
  loadButton.onclick = () => {
    void load()
      .then(() => {
        renderResults();
        if (location.hash.startsWith('#node=')) return selectHash();
      })
      .catch(() => {});
  };
  search.addEventListener('input', () => {
    pageIndex = 0;
    renderResults();
  });
  prev.onclick = () => {
    pageIndex--;
    renderResults();
  };
  next.onclick = () => {
    pageIndex++;
    renderResults();
  };
  window.addEventListener('hashchange', () => {
    void selectHash();
  });
  // Retain the existing result link and search input when selection changes.
  document.addEventListener('click', (event) => {
    const a = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href*="#node="]',
    );
    if (
      a &&
      new URL(a.href).pathname === location.pathname &&
      new URL(a.href).hash === location.hash
    ) {
      event.preventDefault();
      void selectHash();
    }
  });
  if (location.hash.startsWith('#node=')) void selectHash();
}
