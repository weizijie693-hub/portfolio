/* ═══════════════════════════════════════════════════════════
   Main — Entry
   ═══════════════════════════════════════════════════════════ */

;(function () {
  'use strict'

  const ui = new UI()

  // ─── Shortcut for dynamic i18n ───
  function _(key) { return window._i18n ? window._i18n.t(key) : key }

  // ─── Uploader ───
  const uploader = new Uploader({
    onImage(img) { process(img) },
  })

  // ─── Process ───
  function process(img) {
    ui.clear()
    ui.showLoader()

    // Use rAF to let the loader paint, then process
    requestAnimationFrame(() => {
      setTimeout(() => {
        const pixels = PixelSampler.sample(img, 8000)

        if (pixels.length < 3) {
          ui.hideLoader()
          ui.showToast(_('toastErrFewColors'))
          return
        }

        const dominant = KMeans.cluster(pixels, 5)
        const schemes  = PaletteGenerator.generate(dominant)

        ui.renderDominant(dominant)
        ui.renderSchemes(schemes)
        ui.showResults()

        ui.hideLoader()
      }, 400) // small delay so loader is visible for smoothness
    })
  }

  // ─── Actions ───
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-copy]')
    if (!btn) return
    const type = btn.dataset.copy
    const colors = ui.getColors()
    if (type === 'hex') ui.copy(Exporter.allHexes(colors), _('toastCopy'))
    if (type === 'css') ui.copy(Exporter.toCSSVariables(colors), _('toastCopy'))
  })

  document.getElementById('btnExportPalette')?.addEventListener('click', () => {
    Exporter.exportPaletteImage(ui.getColors(), _)
  })

  // Re-upload — open file picker, or cycle demo if no image loaded
  document.getElementById('btnReUpload')?.addEventListener('click', () => {
    if (!ui.getColors().length) {
      // No image loaded yet — cycle to next demo
      demoIdx++
      loadDemo()
    } else {
      ui.clear()
      uploader.reset()
      document.getElementById('fileInput').click()
    }
  })

  // Preview close — just close preview, don't open file picker
  document.getElementById('btnClosePreview')?.addEventListener('click', () => {
    uploader.reset()
    ui.clear()
    // Reload a fresh demo
    setTimeout(loadDemo, 400)
  })

  // ─── Cycle demo on re-upload when no colors loaded yet ───
  // (handled inline above via demoIdx++)

  // ─── Lang toggle ───
  document.getElementById('btnLangToggle')?.addEventListener('click', () => {
    if (!window._i18n) return
    window._i18n.toggle()
    // Re-render dynamic content (schemes have translated names)
    const dominant = ui.getColors()
    const schemes = ui.getSchemes()
    if (dominant.length) {
      ui.renderDominant(dominant)
    }
    if (schemes.length) {
      ui.renderSchemes(schemes)
    }
  })

  // ─── Demo images ─── (delayed to let intro block finish)
  const DEMOS = [
    function warm() {
      const c = document.createElement('canvas'); c.width = 520; c.height = 340; const ctx = c.getContext('2d')
      const grad = ctx.createLinearGradient(0, 0, 520, 340)
      grad.addColorStop(0,'#E85D3A'); grad.addColorStop(0.25,'#F4A261'); grad.addColorStop(0.5,'#2A9D8F'); grad.addColorStop(0.75,'#264653'); grad.addColorStop(1,'#E9C46A')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 520, 340)
      ctx.fillStyle = '#E76F51'; ctx.beginPath(); ctx.arc(400, 70, 50, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#F4D03F'; ctx.beginPath(); ctx.arc(90, 260, 40, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#7C5CFC'; ctx.fillRect(330, 200, 70, 70)
      ctx.fillStyle = '#2ECC71'; ctx.beginPath(); ctx.arc(220, 100, 32, 0, Math.PI*2); ctx.fill()
      return c.toDataURL()
    },
    function cool() {
      const c = document.createElement('canvas'); c.width = 520; c.height = 340; const ctx = c.getContext('2d')
      const grad = ctx.createLinearGradient(0, 0, 0, 340)
      grad.addColorStop(0,'#1a1a2e'); grad.addColorStop(0.5,'#16213e'); grad.addColorStop(1,'#0f3460')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 520, 340)
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `hsl(${200+Math.random()*40}, 70%, ${50+Math.random()*30}%)`
        ctx.beginPath(); ctx.arc(Math.random()*520, Math.random()*340, 2+Math.random()*8, 0, Math.PI*2); ctx.fill()
      }
      ctx.fillStyle = '#e94560'; ctx.beginPath(); ctx.arc(400, 100, 45, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#00d2ff'; ctx.fillRect(50, 200, 120, 80)
      return c.toDataURL()
    },
    function forest() {
      const c = document.createElement('canvas'); c.width = 520; c.height = 340; const ctx = c.getContext('2d')
      const grad = ctx.createLinearGradient(0, 0, 520, 0)
      grad.addColorStop(0,'#1b4332'); grad.addColorStop(0.5,'#40916c'); grad.addColorStop(1,'#95d5b2')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 520, 340)
      ctx.fillStyle = '#d4a373'; ctx.fillRect(200, 50, 30, 290)
      ctx.fillStyle = '#2d6a4f'; ctx.beginPath(); ctx.arc(215, 60, 80, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#52b788'; ctx.beginPath(); ctx.arc(160, 100, 65, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#fefae0'; ctx.beginPath(); ctx.arc(380, 240, 35, 0, Math.PI*2); ctx.fill()
      return c.toDataURL()
    }
  ]

  let demoIdx = 0
  function loadDemo() {
    const dataUrl = DEMOS[demoIdx % DEMOS.length]()
    const img = new Image()
    img.onload = () => {
      uploader.showPreview(img)
      process(img)
    }
    img.src = dataUrl
  }

  // Cycle through demos on re-upload click when no image is loaded
  const origReUpload = document.getElementById('btnReUpload')?.onclick
  document.getElementById('btnReUpload')?.addEventListener('click', function() {
    if (!ui.getColors().length) {
      demoIdx++
      setTimeout(loadDemo, 300)
    }
  })

  // Delay demo to let intro block finish
  setTimeout(loadDemo, 1500)
})()
