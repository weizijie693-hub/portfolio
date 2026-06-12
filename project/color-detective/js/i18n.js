/* ═══════════════════════════════════════════════════════════
   I18n — Full-page i18n with DICT system
   ═══════════════════════════════════════════════════════════ */

;(function () {
  'use strict'

  const DICT = {
    en: {
      pageTitle: 'Color Detective',
      brandName: 'Color Detective',
      navExtract: 'Extract',
      navReUpload: 'Re-upload',
      langToggle: '中文',
      heroTitleLine1: 'Extract',
      heroTitleAccent: 'Colors',
      heroDesc: 'Upload any image to auto-extract dominant colors and generate professional color schemes',
      uploadText: 'Drag & drop or click to browse',
      uploadHint: 'JPG · PNG · WebP',
      secDominant: 'Dominant Colors',
      secSchemes: 'Color Schemes',
      btnCopyHex: '⎘ Copy All Hex',
      btnExportCSS: '◈ Export CSS Variables',
      btnExportPalette: '⬇ Export Palette',
      footerText: 'Browser-side processing · Images never leave your device',
      loaderProcessing: 'Processing',
      previewClose: 'Close preview',
      toastCopy: 'Copied: ',
      toastErrFewColors: 'Image has too few colors — try a more vibrant picture',
      toastErrNotImage: 'Please upload an image file',
      schemeComplementary: 'Complementary',
      schemeComplementaryDesc: 'Opposite hues on the color wheel — strong contrast',
      schemeAnalogous: 'Analogous',
      schemeAnalogousDesc: 'Adjacent hues — harmonious and unified',
      schemeTriadic: 'Triadic',
      schemeTriadicDesc: 'Three evenly-spaced hues — rich and balanced',
      schemeSplitComp: 'Split-Comp',
      schemeSplitCompDesc: 'Adjacent colors of the complement — strong yet subtle',
      schemeMono: 'Mono',
      schemeMonoDesc: 'Single hue with varied lightness and saturation',
      dominantLabelPrimary: 'Primary',
      dominantLabelSecondary: 'Secondary',
      exportTitle: 'COLOR PALETTE',
    },

    zh: {
      pageTitle: '配色侦探',
      brandName: '配色侦探',
      navExtract: '提取',
      navReUpload: '重新上传',
      langToggle: 'EN',
      heroTitleLine1: '从图片中提取',
      heroTitleAccent: '色彩',
      heroDesc: '上传任意图片，自动提取主色调并生成专业配色方案',
      uploadText: '拖拽或点击选择图片',
      uploadHint: 'JPG · PNG · WebP',
      secDominant: '主色调',
      secSchemes: '配色方案',
      btnCopyHex: '⎘ 复制所有 Hex',
      btnExportCSS: '◈ 导出 CSS 变量',
      btnExportPalette: '⬇ 导出色卡',
      footerText: '纯浏览器处理 · 图片不上传服务器',
      loaderProcessing: '处理中',
      previewClose: '关闭预览',
      toastCopy: '已复制: ',
      toastErrFewColors: '图片颜色太少 — 请尝试更丰富的图片',
      toastErrNotImage: '请上传图片文件',
      schemeComplementary: '互补色',
      schemeComplementaryDesc: '色轮上相对的两种颜色 — 强烈对比',
      schemeAnalogous: '邻近色',
      schemeAnalogousDesc: '色轮上相邻的颜色 — 和谐统一',
      schemeTriadic: '三角色',
      schemeTriadicDesc: '三种等距颜色 — 丰富平衡',
      schemeSplitComp: '分裂互补',
      schemeSplitCompDesc: '互补色两侧的邻近色 — 强烈而柔和',
      schemeMono: '单色',
      schemeMonoDesc: '同一色相的不同明度和饱和度变化',
      dominantLabelPrimary: '主色',
      dominantLabelSecondary: '辅色',
      exportTitle: '配色色卡',
    },
  }

  const SCHEME_NAME_MAP = {
    'Complementary': 'schemeComplementary',
    'ComplementaryDesc': 'schemeComplementaryDesc',
    'Analogous': 'schemeAnalogous',
    'AnalogousDesc': 'schemeAnalogousDesc',
    'Triadic': 'schemeTriadic',
    'TriadicDesc': 'schemeTriadicDesc',
    'Split-Comp': 'schemeSplitComp',
    'Split-CompDesc': 'schemeSplitCompDesc',
    'Mono': 'schemeMono',
    'MonoDesc': 'schemeMonoDesc',
  }

  class I18n {
    constructor(opts) {
      this.lang = opts.lang || 'en'
      this._onReady = opts.onReady || null
      this._domApplied = false
      this._ready = false
      this._bound = {}

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._boot())
      } else {
        this._boot()
      }
    }

    _boot() {
      this._ready = true
      if (this._onReady) this._onReady.call(this)
    }

    /* ─── Translation lookup ─── */
    t(key) {
      const dict = DICT[this.lang] || DICT['en']
      const val = dict[key]
      if (val !== undefined) return val
      // Fallback to en
      if (this.lang !== 'en') {
        const enVal = DICT['en'][key]
        if (enVal !== undefined) return enVal
      }
      return key
    }

    /* ─── Normalize a scheme name to its dict key ─── */
    schemeKey(schemeName) {
      return SCHEME_NAME_MAP[schemeName] || schemeName
    }

    /* ─── Apply all data-i18n elements ─── */
    applyToDOM() {
      const lang = this.lang
      const dict = DICT[lang] || DICT['en']

      // data-i18n → textContent
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n')
        const text = dict[key]
        if (text !== undefined) {
          el.textContent = text
        }
      })

      // data-i18n-title → title attribute
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title')
        const text = dict[key]
        if (text !== undefined) {
          el.setAttribute('title', text)
        }
      })

      // Update document title and lang toggle text
      document.title = dict['pageTitle'] || 'Color Detective'
      const toggle = document.getElementById('btnLangToggle')
      if (toggle) {
        toggle.textContent = dict['langToggle'] || (lang === 'zh' ? 'EN' : '中文')
        toggle.setAttribute('title', lang === 'zh' ? 'Switch to English' : '切换到中文')
      }
    }

    /* ─── Toggle language ─── */
    toggle() {
      this.lang = this.lang === 'zh' ? 'en' : 'zh'
      localStorage.setItem('lang', this.lang)
      document.documentElement.lang = this.lang
      this.applyToDOM()
      return this.lang
    }

    /* ─── Set language explicitly ─── */
    setLang(lang) {
      if (lang !== 'en' && lang !== 'zh') return
      this.lang = lang
      localStorage.setItem('lang', lang)
      document.documentElement.lang = lang
      this.applyToDOM()
    }
  }

  window.I18n = I18n
  window.I18N_DICT = DICT
})()
