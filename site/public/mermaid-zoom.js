// Mermaid の図をクリック（または Enter / Space）すると、その場から画面いっぱいに広がる拡大ポップアップで表示する（Issue #1）。
// 動きは starlight-image-zoom（medium-zoom 方式）に合わせている。starlight-image-zoom は <img> と Markdown に書いた <svg> が対象で、
// astro-mermaid がブラウザー側で描く <pre class="mermaid"> の中の <svg> には効かないため、同じ動きをここで作る。
// 閉じ方: ポップアップのどこかをクリック、Esc、ホイールでのスクロール、ウィンドウの大きさの変更。
(() => {
  const ja = document.documentElement.lang.startsWith('ja');
  const label = ja ? { open: '図を拡大して表示', close: '拡大を閉じる' } : { open: 'Zoom the diagram', close: 'Close the zoomed diagram' };
  const MARGIN = 24; // 拡大した図と画面の端との間（px）
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current; // { dialog, source, clone, from, previousFocus, body }

  // 拡大後の位置と大きさを決め、元の図の位置に重ねるための transform を返す
  function place(clone, rect) {
    const w = rect.width;
    const h = rect.height;
    const scale = Math.min((innerWidth - MARGIN * 2) / w, (innerHeight - MARGIN * 2) / h);
    const width = w * scale;
    const height = h * scale;
    const left = (innerWidth - width) / 2;
    const top = (innerHeight - height) / 2;
    Object.assign(clone.style, {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: 'none',
      transformOrigin: '0 0',
    });
    // transform-origin が左上なので、「元の位置へ移す → 元の大きさへ縮める」の順に重ねる
    return `translate(${rect.left - left}px, ${rect.top - top}px) scale(${w / width})`;
  }

  let serial = 0;
  function cloneWithNewId(svg) {
    if (!svg.id) return svg.cloneNode(true);
    const id = `${svg.id}-zoom${++serial}`;
    const html = svg.outerHTML.split(svg.id).join(id);
    const t = document.createElement('template');
    t.innerHTML = html;
    return t.content.firstElementChild;
  }

  function open(pre) {
    const source = pre.querySelector('svg');
    if (!source || current) return;
    const rect = source.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'mermaid-zoom';
    dialog.setAttribute('aria-label', label.open);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'mermaid-zoom__close';
    close.setAttribute('aria-label', label.close);
    close.title = label.close;
    close.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M21.71 2.29a1 1 0 0 0-1.42 0l-5.79 5.8V6.5a1 1 0 0 0-2 0v4a1 1 0 0 0 .08.38 1 1 0 0 0 .54.54 1 1 0 0 0 .38.08h4a1 1 0 0 0 0-2h-1.59l5.8-5.79a1 1 0 0 0 0-1.42ZM10.88 12.58a1 1 0 0 0-.38-.08h-4a1 1 0 0 0 0 2h1.59l-5.8 5.79a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l5.79-5.8v1.59a1 1 0 0 0 2 0v-4a1 1 0 0 0-.08-.38 1 1 0 0 0-.54-.54Z"/></svg>';

    // Mermaid の図は、<style> のセレクターと矢印の先端（marker）の参照に svg の id を使う。
    // 同じ id のまま複製すると矢印の参照先が非表示にした元の図になり、先端が消えるので、複製では id を付け替える
    const clone = cloneWithNewId(source);
    clone.classList.add('mermaid-zoom__image');
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    const from = place(clone, rect);
    clone.style.transform = from;
    dialog.append(close, clone);

    // スクロールバーが消えて本文がずれないように、body の幅を固定する
    const body = { overflow: document.body.style.overflow, width: document.body.style.width };
    document.body.style.width = `${document.body.clientWidth}px`;
    document.body.style.overflow = 'hidden';

    document.body.append(dialog);
    dialog.addEventListener('click', () => hide());
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      hide();
    });
    document.addEventListener('wheel', onWheel, { once: true, passive: true });

    current = { dialog, source, clone, from, previousFocus: document.activeElement, body };
    source.classList.add('mermaid-zoom__source');
    dialog.showModal();
    clone.getBoundingClientRect(); // 元の位置に重ねた状態を確定してからアニメーションさせる
    clone.style.transform = '';
    document.body.classList.add('mermaid-zoom-opened');
  }

  function onWheel() {
    hide();
  }

  function hide(immediate = false) {
    if (!current || current.closing) return;
    current.closing = true;
    document.removeEventListener('wheel', onWheel);
    const { clone, from } = current;
    clone.style.transform = from;
    document.body.classList.remove('mermaid-zoom-opened');
    if (immediate || reduceMotion()) finish();
    else clone.addEventListener('transitionend', finish, { once: true });
  }

  function finish() {
    if (!current) return;
    const { dialog, source, previousFocus, body } = current;
    current = undefined;
    source.classList.remove('mermaid-zoom__source');
    dialog.close();
    dialog.remove();
    document.body.style.overflow = body.overflow;
    document.body.style.width = body.width;
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  }

  function mark(pre) {
    if (pre.hasAttribute('tabindex')) return;
    pre.setAttribute('tabindex', '0');
    pre.setAttribute('role', 'button');
    pre.setAttribute('aria-label', label.open);
    pre.classList.add('mermaid-zoomable');
  }

  const target = (e) => (e.target instanceof Element ? e.target.closest('pre.mermaid[data-processed]') : null);

  document.addEventListener('click', (e) => {
    const pre = target(e);
    if (pre && !e.target.closest('a')) open(pre);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const pre = target(e);
    if (!pre) return;
    e.preventDefault();
    open(pre);
  });
  addEventListener('resize', () => hide(true));

  // astro-mermaid はテーマの切り替えで図を描き直すので、描き終わった図に毎回印を付ける
  const markAll = () => document.querySelectorAll('pre.mermaid[data-processed]').forEach(mark);
  new MutationObserver(markAll).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-processed'],
  });
  markAll();
})();
