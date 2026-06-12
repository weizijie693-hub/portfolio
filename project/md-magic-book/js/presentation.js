/* ═══════════════════════════════════════════════════════════
   Presentation — Slide-split engine with transitions
   ═══════════════════════════════════════════════════════════ */

class Presentation {
  constructor(slideEl, counterEl) {
    this.slideEl = slideEl
    this.counterEl = counterEl
    this.slides = []
    this.current = 0
  }

  /* ─── Split markdown into slides (no blanks) ─── */
  split(markdown) {
    const lines = markdown.split('\n')
    const slides = []
    let currentSlide = { title: '', content: [], level: 0 }

    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ')) {
        const level = line.startsWith('# ') ? 1 : 2
        // Push previous slide only if it has real content
        if (this._hasContent(currentSlide)) {
          slides.push({ ...currentSlide })
        }
        currentSlide = {
          title: line.replace(/^#+ /, ''),
          content: [],
          level,
        }
      } else if (line.trim() === '---') {
        // Push previous slide only if it has real content
        if (this._hasContent(currentSlide)) {
          slides.push({ ...currentSlide })
        }
        currentSlide = { title: '', content: [], level: 0 }
      } else if (line.trim().length > 0) {
        // Only add non-empty lines to content
        currentSlide.content.push(line)
      }
      // Skip pure whitespace lines — they don't become content
    }

    // Last slide
    if (this._hasContent(currentSlide)) {
      slides.push({ ...currentSlide })
    }

    // Fallback: if nothing was split, make everything one slide
    if (slides.length === 0) {
      slides.push({ title: '', content: lines.filter(l => l.trim().length > 0), level: 0 })
    }

    this.slides = slides
    return slides
  }

  /**
   * Check if a slide has meaningful content
   * (filters out slides with only empty/whitespace lines)
   */
  _hasContent(slide) {
    if (slide.title) return true
    // Content must have at least one non-empty printable line
    return slide.content.some(line => line.trim().length > 0)
  }

  /* ─── Render a slide with transition ─── */
  render(index, direction = 'next') {
    if (index < 0 || index >= this.slides.length) return
    this.current = index
    const slide = this.slides[index]
    const total = this.slides.length

    const md = slide.title
      ? `${'#'.repeat(slide.level) + ' ' + slide.title}\n${slide.content.join('\n')}`
      : slide.content.join('\n')

    const html = marked.parse(md, { breaks: true, gfm: true })

    this.slideEl.classList.remove('transition-in', 'transition-in-right', 'transition-in-left')
    this.slideEl.innerHTML = html

    this.slideEl.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block)
    })

    const animClass = direction === 'prev' ? 'transition-in-left'
                     : direction === 'next' ? 'transition-in-right'
                     : 'transition-in'
    this.slideEl.classList.add(animClass)

    clearTimeout(this._animTimer)
    this._animTimer = setTimeout(() => {
      this.slideEl.classList.remove(animClass)
    }, 450)

    this.counterEl.textContent = `${index + 1} / ${total}`
  }

  next() {
    if (this.current < this.slides.length - 1) {
      this.render(this.current + 1, 'next')
    }
  }

  prev() {
    if (this.current > 0) {
      this.render(this.current - 1, 'prev')
    }
  }

  /* ─── Handle keyboard ─── */
  handleKey(e) {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': e.preventDefault(); this.next(); break
      case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); this.prev(); break
    }
  }
}
