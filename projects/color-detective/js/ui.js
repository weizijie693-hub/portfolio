/* ═══════════════════════════════════════════════════════════
   UI — Rendering Engine (Swiss Minimalist)
   ═══════════════════════════════════════════════════════════ */

class UI {
  constructor() {
    this.results         = document.getElementById('results')
    this.dominantSection = document.getElementById('dominantSection')
    this.dominantStrip   = document.getElementById('dominantStrip')
    this.dominantActions = document.getElementById('dominantActions')
    this.schemeSection   = document.getElementById('schemeSection')
    this.schemes         = document.getElementById('schemes')
    this.toast           = document.getElementById('toast')
    this.toastMsg        = this.toast?.querySelector('.toast-msg')
    this.loader          = document.getElementById('loaderScreen')
    this._colors = []
    this._schemes = []
  }

  /* ─── I18n shortcut ─── */
  _(key) { return window._i18n ? window._i18n.t(key) : key }

  showLoader() {
    const counter = document.getElementById('loaderCounter')
    if (counter) counter.textContent = this._('loaderProcessing')
    this.loader?.classList.remove('hidden')
  }

  hideLoader() {
    this.loader?.classList.add('hidden')
  }

  /* ─── Render dominant colors ─── */
  renderDominant(colors) {
    this._colors = colors
    this.dominantSection.classList.remove('hidden')
    const labels = [
      this._('dominantLabelPrimary'),
      this._('dominantLabelSecondary'),
      this._('dominantLabelSecondary'),
      this._('dominantLabelSecondary'),
      this._('dominantLabelSecondary'),
    ]

    this.dominantStrip.innerHTML = colors.map((c, i) => `
      <div class="color-block" style="background:${c.hex}"
           data-hex="${c.hex}">
        <span class="color-block-label">${labels[i]}</span>
        <div class="color-block-info">
          <div class="color-block-hex">${c.hex.toLowerCase()}</div>
          <div class="color-block-ratio">${(c.ratio * 100).toFixed(0)}%</div>
        </div>
      </div>
    `).join('')

    this.dominantStrip.querySelectorAll('.color-block').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.add('copied')
        setTimeout(() => el.classList.remove('copied'), 200)
        this.copy(el.dataset.hex)
      })
    })

    this.dominantActions.classList.remove('hidden')
  }

  /* ─── Render schemes ─── */
  renderSchemes(schemes) {
    this._schemes = schemes

    this.schemes.innerHTML = schemes.map((s, gi) => {
      const nameKey = (window._i18n && window._i18n.schemeKey) ? window._i18n.schemeKey(s.name) : s.name
      const descKey = nameKey + 'Desc'
      const name = this._(nameKey)
      const desc = this._(descKey)

      return `
      <div class="scheme-group" style="transition-delay:${gi * 0.06}s">
        <div class="scheme-head">
          <span class="scheme-name">${name}</span>
          <span class="scheme-desc">${desc}</span>
          <span class="scheme-head-line"></span>
        </div>
        <div class="scheme-strip">
          ${s.colors.map(c => `
            <div class="scheme-swatch"
                 style="background:${c.hex}"
                 data-hex="${c.hex}" data-hsl="${c.hsl}" data-rgb="${c.rgb}">
              <span class="scheme-swatch-hex">${c.hex.toLowerCase()}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `}).join('')

    // Single swatch click → copy hex
    this.schemes.querySelectorAll('.scheme-swatch').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation()
        el.classList.add('copied')
        setTimeout(() => el.classList.remove('copied'), 600)
        this.copy(el.dataset.hex)
      })
      el.addEventListener('contextmenu', e => {
        e.preventDefault()
        this.copy(el.dataset.hsl)
      })
    })

    // Strip click → copy all
    this.schemes.querySelectorAll('.scheme-strip').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('scheme-swatch')) return
        const hexes = Array.from(el.querySelectorAll('.scheme-swatch'))
          .map(h => h.dataset.hex)
          .join(', ')
        this.copy(hexes)
      })
    })

    this.schemeSection.classList.remove('hidden')

    // Staggered entrance
    requestAnimationFrame(() => {
      this.schemes.querySelectorAll('.scheme-group').forEach(el => {
        el.classList.add('visible')
      })
    })
  }

  /* ─── Helpers ─── */
  _rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255
    var max = Math.max(r, g, b), min = Math.min(r, g, b)
    var h = 0, s = 0, l = (max + min) / 2
    if (max !== min) {
      var d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      else if (max === g) h = ((b - r) / d + 2) / 6
      else h = ((r - g) / d + 4) / 6
    }
    return { h: h * 360, s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  _namedColors() {
    return { red:'#FF0000', orange:'#FFA500', yellow:'#FFFF00', green:'#008000', blue:'#0000FF', purple:'#800080', pink:'#FFC0CB', brown:'#A52A2A', gray:'#808080', black:'#000000', white:'#FFFFFF', teal:'#008080', navy:'#000080', maroon:'#800000', olive:'#808000', lime:'#00FF00', aqua:'#00FFFF', fuchsia:'#FF00FF', silver:'#C0C0C0', gold:'#FFD700', coral:'#FF7F50', crimson:'#DC143C', indigo:'#4B0082', violet:'#EE82EE', cyan:'#00FFFF', magenta:'#FF00FF', tan:'#D2B48C', salmon:'#FA8072', khaki:'#F0E68C', plum:'#DDA0DD', orchid:'#DA70D6', turquoise:'#40E0D0', chocolate:'#D2691E', tomato:'#FF6347', slate:'#708090' }
  }

  _closestName(hex) {
    var r1 = parseInt(hex.slice(1,3),16), g1 = parseInt(hex.slice(3,5),16), b1 = parseInt(hex.slice(5,7),16)
    var namedColors = this._namedColors()
    var best = '', bestDist = Infinity
    Object.keys(namedColors).forEach(function(name) {
      var h = namedColors[name]
      var r2 = parseInt(h.slice(1,3),16), g2 = parseInt(h.slice(3,5),16), b2 = parseInt(h.slice(5,7),16)
      var dist = Math.sqrt(2*(r1-r2)*(r1-r2) + 4*(g1-g2)*(g1-g2) + 3*(b1-b2)*(b1-b2))
      if (dist < bestDist) { bestDist = dist; best = name }
    })
    return best
  }

  /* ─── 03 Color Temperature ─── */
  renderTemperature(colors) {
    var section = document.getElementById('tempSection')
    var grid = document.getElementById('tempGrid')
    if (!section || !grid || !colors.length) return
    section.classList.remove('hidden')

    var self = this
    grid.innerHTML = colors.map(function(c) {
      var r = c.color.r, g = c.color.g, b = c.color.b
      var warmScore = Math.round(((r - b) / 255 * 0.5 + 0.5) * 100)
      var label = warmScore > 60 ? self._('tempWarm') : warmScore < 40 ? self._('tempCool') : self._('tempNeutral')
      var fillColor = warmScore > 60 ? '#ff5500' : warmScore < 40 ? '#4488cc' : '#888'
      return '<div class="temp-card">' +
        '<div class="temp-dot" style="background:' + c.hex + '"></div>' +
        '<div class="temp-info">' +
          '<div class="temp-name">' + label + '</div>' +
          '<div class="temp-hex">' + c.hex.toLowerCase() + ' &middot; ' + warmScore + '</div>' +
          '<div class="temp-bar-wrap"><div class="temp-bar-fill" style="width:' + warmScore + '%;background:' + fillColor + '"></div></div>' +
        '</div>' +
      '</div>'
    }).join('')
  }

  /* ─── 04 Average Color ─── */
  renderAverage(colors) {
    var section = document.getElementById('avgSection')
    if (!section || !colors.length) return
    section.classList.remove('hidden')

    var totalRatio = 0, avgR = 0, avgG = 0, avgB = 0
    colors.forEach(function(c) {
      avgR += c.color.r * c.ratio; avgG += c.color.g * c.ratio; avgB += c.color.b * c.ratio
      totalRatio += c.ratio
    })
    avgR = Math.round(avgR / totalRatio); avgG = Math.round(avgG / totalRatio); avgB = Math.round(avgB / totalRatio)
    var avgHex = '#' + [avgR, avgG, avgB].map(function(x) { return x.toString(16).padStart(2, '0') }).join('').toUpperCase()

    document.getElementById('avgSwatch').style.background = avgHex
    document.getElementById('avgHex').textContent = avgHex
  }

  /* ─── 05 Brightness Balance ─── */
  renderBrightness(colors) {
    var section = document.getElementById('briSection')
    if (!section || !colors.length) return
    section.classList.remove('hidden')

    var dark = 0, mid = 0, light = 0
    colors.forEach(function(c) {
      var lum = 0.299 * c.color.r + 0.587 * c.color.g + 0.114 * c.color.b
      if (lum < 85) dark += c.ratio
      else if (lum < 170) mid += c.ratio
      else light += c.ratio
    })
    var total = dark + mid + light || 1
    document.getElementById('briDarkFill').style.height = (dark / total * 100).toFixed(0) + '%'
    document.getElementById('briMidFill').style.height = (mid / total * 100).toFixed(0) + '%'
    document.getElementById('briLightFill').style.height = (light / total * 100).toFixed(0) + '%'
  }

  /* ─── 06 Color Details ─── */
  renderDetails(colors) {
    var section = document.getElementById('detailSection')
    var table = document.getElementById('detailTable')
    if (!section || !table || !colors.length) return
    section.classList.remove('hidden')

    var self = this
    table.innerHTML = colors.map(function(c) {
      var r = c.color.r, g = c.color.g, b = c.color.b
      var hsl = self._rgbToHsl(r, g, b)
      return '<div class="detail-row">' +
        '<span class="detail-swatch" style="background:' + c.hex + '"></span>' +
        '<span class="detail-hex">' + c.hex.toLowerCase() + '</span>' +
        '<span class="detail-hsl">hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)</span>' +
        '<span class="detail-rgb">rgb(' + r + ', ' + g + ', ' + b + ')</span>' +
        '<span class="detail-ratio">' + (c.ratio * 100).toFixed(1) + '%</span>' +
        '<span class="detail-name">' + self._closestName(c.hex) + '</span>' +
      '</div>'
    }).join('')
  }

  /* ─── Show results container ─── */
  showResults() {
    this.results.classList.remove('hidden')
    void this.results.offsetWidth
    this.results.classList.add('visible')
  }

  /* ─── Copy ─── */
  async copy(text, prefix) {
    try { await navigator.clipboard.writeText(text) }
    catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select(); document.execCommand('copy')
      document.body.removeChild(ta)
    }
    const short = text.length > 30 ? text.slice(0, 28) + '…' : text
    this.showToast((prefix || this._('toastCopy')) + short)
  }

  /* ─── Toast ─── */
  showToast(msg, duration) {
    if (!this.toastMsg) return
    this.toastMsg.textContent = msg
    this.toast.classList.add('show')
    clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => this.toast.classList.remove('show'), duration || 2000)
  }

  /* ─── Clear ─── */
  clear() {
    this.dominantSection.classList.add('hidden')
    this.dominantStrip.innerHTML = ''
    this.dominantActions.classList.add('hidden')
    this.schemeSection.classList.add('hidden')
    this.schemes.innerHTML = ''
    var secs = ['tempSection','avgSection','briSection','detailSection']
    secs.forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden') })
    this.results.classList.remove('visible')
    this.results.classList.add('hidden')
  }

  getColors() { return this._colors }
  getSchemes() { return this._schemes }
}
