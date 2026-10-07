// Progressive search and filters for the current sitemap view (root
// navigation or one detail document). The view is complete without this
// module; it only toggles `hidden` and `open` and never fetches anything.
const normalize = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .toLowerCase();

const tree = document.querySelector<HTMLElement>('[data-sitemap]');
const controls = document.querySelector<HTMLElement>('[data-sitemap-controls]');
const search = controls?.querySelector<HTMLInputElement>('input');
const count = document.querySelector<HTMLElement>('[data-sitemap-count]');
const empty = document.querySelector<HTMLElement>('[data-sitemap-empty]');

if (tree && controls && search && count && empty) {
  const elements = [...tree.querySelectorAll<HTMLLIElement>('li[data-search]')];
  const items = elements.map((element) => {
    const details =
      element.querySelector<HTMLDetailsElement>(':scope > details');
    const body = details?.querySelector<HTMLElement>(':scope > .sitemap-body');
    // Own text only: non-visible paths, the own summary (label and badges)
    // and the body's own metadata containers. The child tree is never part
    // of this node.
    const own = [
      element.dataset.search ?? '',
      ...[
        details?.querySelector(':scope > summary'),
        ...(body?.querySelectorAll(':scope > [data-search-text]') ?? []),
      ].map((part) => part?.textContent ?? ''),
    ];
    return {
      element,
      details,
      message: body?.querySelector<HTMLElement>(
        ':scope > .sitemap-filtered-children',
      ),
      parent: element.parentElement?.closest<HTMLLIElement>('li[data-search]'),
      children: [] as HTMLLIElement[],
      text: normalize(own.join(' ')),
      source: element.dataset.source ?? '',
      surface: element.dataset.surface ?? '',
      status: element.dataset.status ?? '',
    };
  });
  const byElement = new Map(items.map((item) => [item.element, item]));
  for (const item of items)
    if (item.parent) byElement.get(item.parent)?.children.push(item.element);
  const filters = [
    ...controls.querySelectorAll<HTMLButtonElement>('button[data-filter]'),
  ];
  // Open state chosen by the reader, restored when every filter is cleared.
  let readerOpen: boolean[] | undefined;

  const pressed = (group: string) =>
    new Set(
      filters
        .filter(
          (button) =>
            button.dataset.filter === group &&
            button.getAttribute('aria-pressed') === 'true',
        )
        .map((button) => button.value),
    );

  const update = () => {
    const query = normalize(search.value.trim());
    const sources = pressed('source');
    const surfaces = pressed('surface');
    const statuses = pressed('status');
    const active =
      query !== '' || sources.size + surfaces.size + statuses.size > 0;
    if (!active) {
      items.forEach((item, index) => {
        item.element.hidden = false;
        item.element.removeAttribute('data-context');
        if (item.message) item.message.hidden = true;
        if (item.details && readerOpen) item.details.open = readerOpen[index];
      });
      readerOpen = undefined;
      empty.hidden = true;
      count.textContent = `Bu görünümde ${items.length} öğe.`;
      return;
    }
    readerOpen ??= items.map((item) => item.details?.open ?? false);
    const matches = new Set(
      items
        .filter(
          (item) =>
            item.text.includes(query) &&
            (sources.size === 0 || sources.has(item.source)) &&
            (surfaces.size === 0 || surfaces.has(item.surface)) &&
            (statuses.size === 0 || statuses.has(item.status)),
        )
        .map((item) => item.element),
    );
    const context = new Set<HTMLLIElement>();
    for (const item of items) {
      if (!matches.has(item.element)) continue;
      for (
        let parent = item.parent;
        parent && !context.has(parent);
        parent = byElement.get(parent)?.parent ?? undefined
      )
        context.add(parent);
    }
    for (const item of items) {
      const isContext = context.has(item.element);
      item.element.hidden = !isContext && !matches.has(item.element);
      item.element.toggleAttribute(
        'data-context',
        isContext && !matches.has(item.element),
      );
      if (isContext && item.details) item.details.open = true;
    }
    for (const item of items)
      if (item.message)
        item.message.hidden =
          item.element.hidden || !item.children.some((child) => child.hidden);
    empty.hidden = matches.size > 0;
    count.textContent = `${matches.size} eşleşen öğe, bu görünümde ${items.length} öğe.`;
  };

  for (const button of filters)
    button.addEventListener('click', () => {
      button.setAttribute(
        'aria-pressed',
        String(button.getAttribute('aria-pressed') !== 'true'),
      );
      update();
    });
  search.addEventListener('input', update);
  controls.hidden = false;
  update();
}
