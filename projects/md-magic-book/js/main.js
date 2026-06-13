/* ═══════════════════════════════════════════════════════════
   Main — Entry with all features
   ═══════════════════════════════════════════════════════════ */

;(function () {
  'use strict'

  const textarea   = document.getElementById('editorInput')
  const preview    = document.getElementById('editorPreview')
  const editorEl   = document.getElementById('editor')
  const presView   = document.getElementById('presentation')
  const presSlide  = document.getElementById('presSlide')
  const presCounter = document.getElementById('presCounter')
  const editor     = new Editor(textarea, preview)
  const pres       = new Presentation(presSlide, presCounter)

  let isPresenting = false
  let currentView = 'split'

  /* ─── Status ─── */
  const elLines = document.getElementById('statusLines')
  const elWords = document.getElementById('statusWords')
  const elChars = document.getElementById('statusChars')
  const elSave  = document.getElementById('statusSave')

  function updateStatus() {
    const text = textarea.value
    const lines = text.split('\n').length
    const words = text.replace(/\s/g, '').length
    const chars = text.length
    elLines.textContent = t('statusLines', { n: lines })
    elWords.textContent = t('statusWords', { n: words })
    elChars.textContent = t('statusChars', { n: chars })
  }

  /* exposed so the lang-toggle can re-render status counters */
  window.updateStatusI18n = updateStatus;

  function showSaved() {
    elSave.textContent = t('statusSaved')
    elSave.classList.add('saved')
    setTimeout(() => { elSave.classList.remove('saved'); elSave.textContent = '💾' }, 2000)
  }

  /* ─── Editor events ─── */
  textarea.addEventListener('input', () => {
    editor.scheduleUpdate()
    updateStatus()
    clearTimeout(textarea._saveTimer)
    textarea._saveTimer = setTimeout(() => { editor.save(); showSaved() }, 800)
  })

  /* ─── View mode toggle ─── */
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentView = btn.dataset.view

      editorEl.classList.remove('split', 'preview-only', 'edit-only')
      if (currentView === 'preview') editorEl.classList.add('preview-only')
      else if (currentView === 'edit') editorEl.classList.add('edit-only')
      else editorEl.classList.add('split')

      // Recompile preview in case it's needed
      editor.update()
      // Focus textarea in split/edit modes
      if (currentView !== 'preview') textarea.focus()
    })
  })

  /* ─── Template ─── */
  const TEMPLATES = {
    meeting: `# Meeting Notes

**Date**: 2026-06-12
**Attendees**: -

## Agenda

1.
2.
3.

## Discussion Points

-

## Next Steps

- [ ]
`,
    project: `# Project Docs

## Overview

One-line description of the project.

## Tech Stack

- Frontend:
- Backend:
- Database:

## Feature List

- [ ] Feature one
- [ ] Feature two
- [ ] Feature three

## Deployment

\`\`\`bash
# Deploy commands
\`\`\`
`,
    blog: `# Blog Title

> One-line summary

## Introduction

Write your content here…

\`\`\`javascript
// Code example
console.log('Hello')
\`\`\`

## Conclusion

---
`,
  }

  let templateIndex = 0
  document.getElementById('btnTemplate').addEventListener('click', () => {
    const keys = Object.keys(TEMPLATES)
    const key = keys[templateIndex % keys.length]
    templateIndex++
    textarea.value = TEMPLATES[key]
    editor.update()
    updateStatus()
    editor.save()
    showSaved()
  })

  /* ─── Export .md ─── */
  document.getElementById('btnExportMD').addEventListener('click', () => {
    const blob = new Blob([textarea.value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'document.md'; a.click()
    URL.revokeObjectURL(url)
  })

  /* ─── Export HTML ─── */
  document.getElementById('btnExportHTML').addEventListener('click', () => {
    const style = `
body { max-width: 720px; margin: 0 auto; padding: 40px 24px; font: 16px/1.7 -apple-system, sans-serif; color: #e8e8e8; background: #0a0a0a; }
h1,h2,h3 { font-weight: 400; color: #e8e8e8; }
pre { background: #0d0d0d; padding: 16px; overflow-x: auto; border: 1px solid #222; border-radius: 12px; }
code { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; color: #ff5500; }
img { max-width: 100%; }
blockquote { border-left: 3px solid #ff5500; padding-left: 1em; color: #888; background: rgba(255,85,0,0.06); padding: 12px 16px; border-radius: 0 12px 12px 0; }`
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Document</title><style>${style}</style></head><body>${editor.compile(textarea.value)}</body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'document.html'; a.click()
    URL.revokeObjectURL(url)
  })

  /* ─── Import .md ─── */
  document.getElementById('btnImport')?.addEventListener('click', () => {
    document.getElementById('fileInput').click()
  })

  document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      textarea.value = ev.target.result
      editor.update()
      updateStatus()
      editor.save()
      showSaved()
    }
    reader.readAsText(file)
    e.target.value = ''
  })

  /* ─── Presentation with transitions ─── */
  function enterPresentation() {
    const md = textarea.value
    pres.split(md)
    if (pres.slides.length === 0) return

    const mainView = document.getElementById('mainView')
    mainView.classList.remove('entered')
    mainView.classList.add('exiting')

    setTimeout(() => {
      isPresenting = true
      mainView.classList.remove('exiting')
      mainView.style.display = 'none'
      presView.classList.remove('page-exit')
      presView.classList.add('visible')
      presView.classList.add('page-enter')
      pres.render(0, 'init')
    }, 350)
  }

  function exitPresentation() {
    isPresenting = false
    const mainView = document.getElementById('mainView')
    presView.classList.remove('page-enter')
    presView.classList.add('page-exit')

    setTimeout(() => {
      presView.classList.remove('visible', 'page-exit')
      mainView.style.display = ''
      mainView.classList.remove('entered')
      mainView.classList.add('entering')
      requestAnimationFrame(() => {
        mainView.classList.remove('entering')
        mainView.classList.add('entered')
      })
    }, 350)
  }

  document.getElementById('btnPresent').addEventListener('click', enterPresentation)
  document.getElementById('presNext').addEventListener('click', () => pres.next())
  document.getElementById('presPrev').addEventListener('click', () => pres.prev())
  document.getElementById('presExit').addEventListener('click', exitPresentation)
  document.getElementById('presArrowLeft').addEventListener('click', () => pres.prev())
  document.getElementById('presArrowRight').addEventListener('click', () => pres.next())
  document.getElementById('presClickLeft').addEventListener('click', () => pres.prev())
  document.getElementById('presClickRight').addEventListener('click', () => pres.next())

  document.addEventListener('keydown', (e) => {
    if (isPresenting) pres.handleKey(e)
    if (e.key === 'Escape' && isPresenting) exitPresentation()
  })

  /* ─── Load default content ─── */
  function loadDefault() {
    const saved = editor.load()
    if (saved) {
      textarea.value = saved
      editor.update()
      updateStatus()
      return
    }

    textarea.value = `# Markdown Magic Book

> One tool = Editor + Presentation

## Why use it?

- Open and go, zero configuration
- Write Markdown, live preview
- One-click fullscreen presentation mode
- Auto-save, never lose your work

---

## Features

**Syntax Highlighting**

\`\`\`javascript
function hello() {
  console.log('Hello, Magic Book!')
}
\`\`\`

**Lists**

1. Write Markdown
2. Live preview
3. Present instantly

**Blockquotes**

> Design is constraint. Constraint is freedom.

---

## Presentation Mode

Click **"🎬 Present"** in the top bar

- Auto-split by headings (# / ##)
- \`---\` for manual page breaks
- Arrow keys to navigate
- Click "Exit" to return to editing

---

*Made for AdventureX 2026*
`
    editor.update()
    updateStatus()
    editor.save()
  }

  loadDefault()
  setTimeout(() => editor.update(), 100)

})()
