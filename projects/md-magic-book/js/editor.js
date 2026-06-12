/* ═══════════════════════════════════════════════════════════
   Editor — Markdown editor with live preview + auto-save
   ═══════════════════════════════════════════════════════════ */

class Editor {
  constructor(textarea, previewEl) {
    this.textarea = textarea
    this.preview  = previewEl
    this._timeout = null
    this._initPreviewClick()
  }

  /* ─── Compile markdown → HTML ─── */
  compile(md) {
    if (!md.trim()) return '<p style="color:var(--text-faint)">' + (typeof t === 'function' ? t('previewEmpty') : 'Start typing to see the preview…') + '</p>'
    return marked.parse(md, { breaks: true, gfm: true })
  }

  /* ─── Update preview ─── */
  update() {
    const html = this.compile(this.textarea.value)
    this.preview.innerHTML = html

    // Highlight code blocks
    this.preview.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block)
    })
  }

  /* ─── Debounced update ─── */
  scheduleUpdate() {
    clearTimeout(this._timeout)
    this._timeout = setTimeout(() => this.update(), 200)
  }

  /* ─── Auto-save ─── */
  save() {
    localStorage.setItem('md-magic-doc', this.textarea.value)
  }

  load() {
    return localStorage.getItem('md-magic-doc') || ''
  }

  /* ─── Click preview elements to insert template ─── */
  _initPreviewClick() {
    // Click on empty area to focus back to editor
    this.preview.addEventListener('click', (e) => {
      if (e.target === this.preview) this.textarea.focus()
    })
  }
}
