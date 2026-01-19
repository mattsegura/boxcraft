/**
 * DirectoryAutocomplete - Autocomplete for directory paths
 *
 * Fetches suggestions from the server (known projects + filesystem)
 * and shows a dropdown with keyboard navigation.
 */

// Injected by Vite at build time
declare const __BOXCRAFT_DEFAULT_PORT__: number
const API_PORT = __BOXCRAFT_DEFAULT_PORT__
// In dev mode, use the Vite proxy; in production, use direct URL
const API_URL = import.meta.env.DEV ? '/api' : `http://localhost:${API_PORT}`

interface AutocompleteResult {
  path: string
  isKnown: boolean  // true if from known projects
}

/**
 * Setup directory autocomplete on an input element
 */
export function setupDirectoryAutocomplete(
  input: HTMLInputElement,
  onSelect?: (path: string) => void
): () => void {
  let dropdown: HTMLElement | null = null
  let selectedIndex = 0
  let results: string[] = []
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const createDropdown = () => {
    if (dropdown) return dropdown

    dropdown = document.createElement('div')
    dropdown.className = 'directory-autocomplete-dropdown'
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 250px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 0;
      margin-top: 4px;
      display: none;
      z-index: 1001;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
    `
    // Ensure parent has relative positioning
    const parent = input.parentElement
    if (parent) {
      parent.style.position = 'relative'
      parent.appendChild(dropdown)
    }
    return dropdown
  }

  const renderDropdown = (showEmpty = false) => {
    const dd = createDropdown()
    if (results.length === 0) {
      if (showEmpty && input.value.trim() === '') {
        // Show helpful message when no projects and input is empty
        dd.innerHTML = `
          <div class="dir-empty" style="
            padding: 16px;
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: 12px;
          ">
            <div style="margin-bottom: 8px; color: rgba(255, 255, 255, 0.7);">No recent projects</div>
            <div>Type a path like <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 0;">~/projects/myapp</code></div>
            <div style="margin-top: 4px;">or <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 0;">/Users/name/code</code></div>
          </div>
        `
        dd.style.display = 'block'
      } else {
        dd.style.display = 'none'
      }
      return
    }

    dd.innerHTML = results.map((path, i) => {
      // Extract display name (last component)
      const name = path.replace(/\/+$/, '').split('/').pop() || path
      // Shorten path for display
      const shortPath = path.startsWith('/home/')
        ? '~' + path.slice(path.indexOf('/', 6))
        : path

      return `
        <div class="dir-item${i === selectedIndex ? ' selected' : ''}" data-index="${i}">
          <span class="dir-name">${escapeHtml(name)}</span>
          <span class="dir-path">${escapeHtml(shortPath)}</span>
        </div>
      `
    }).join('')

    // Style items - ASCII theme
    dd.querySelectorAll('.dir-item').forEach((item) => {
      const el = item as HTMLElement
      el.style.cssText = `
        padding: 10px 14px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: background 0.1s;
      `
      if (el.classList.contains('selected')) {
        el.style.background = 'rgba(255, 255, 255, 0.15)'
        el.style.boxShadow = 'inset 0 0 10px rgba(255, 255, 255, 0.1)'
      }
    })

    dd.querySelectorAll('.dir-name').forEach((el) => {
      (el as HTMLElement).style.cssText = `
        color: #ffffff;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-weight: 600;
        font-size: 13px;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
      `
    })

    dd.querySelectorAll('.dir-path').forEach((el) => {
      (el as HTMLElement).style.cssText = `
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      `
    })

    dd.style.display = 'block'

    // Scroll selected into view
    const selectedEl = dd.querySelector('.selected')
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }

  const hideDropdown = () => {
    if (dropdown) {
      dropdown.style.display = 'none'
    }
    results = []
    selectedIndex = 0
  }

  const selectResult = (path: string) => {
    input.value = path
    input.focus()
    hideDropdown()
    // Trigger input event so name auto-fill works
    input.dispatchEvent(new Event('input', { bubbles: true }))
    onSelect?.(path)
  }

  const fetchResults = async (query: string) => {
    try {
      const response = await fetch(`${API_URL}/projects/autocomplete?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.ok && Array.isArray(data.results)) {
        results = data.results
        selectedIndex = 0
        renderDropdown(query === '')  // Show empty state hint when query is empty
      }
    } catch (e) {
      // Silently fail - autocomplete is a nice-to-have
      console.error('Autocomplete fetch error:', e)
      // Still show empty state on error if input is empty
      if (input.value.trim() === '') {
        results = []
        renderDropdown(true)
      }
    }
  }

  const handleInput = () => {
    const value = input.value

    // Debounce API calls
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (value.length === 0) {
      // Show all known projects when empty
      debounceTimer = setTimeout(() => fetchResults(''), 100)
    } else {
      debounceTimer = setTimeout(() => fetchResults(value), 150)
    }
  }

  const handleFocus = () => {
    // Show suggestions on focus if empty or has value
    handleInput()
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        selectedIndex = (selectedIndex + 1) % results.length
        renderDropdown()
        break

      case 'ArrowUp':
        e.preventDefault()
        selectedIndex = (selectedIndex - 1 + results.length) % results.length
        renderDropdown()
        break

      case 'Tab':
        if (results.length > 0) {
          e.preventDefault()
          selectResult(results[selectedIndex])
        }
        break

      case 'Enter':
        if (results.length > 0 && dropdown?.style.display !== 'none') {
          e.preventDefault()
          e.stopPropagation()
          selectResult(results[selectedIndex])
        }
        break

      case 'Escape':
        hideDropdown()
        break
    }
  }

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const item = target.closest('.dir-item') as HTMLElement
    if (item) {
      const index = parseInt(item.dataset.index || '0', 10)
      selectResult(results[index])
    }
  }

  const handleBlur = (e: FocusEvent) => {
    // Delay to allow click events to fire on dropdown
    setTimeout(() => {
      // Only hide if focus didn't go to the dropdown
      if (!dropdown?.contains(document.activeElement)) {
        hideDropdown()
      }
    }, 150)
  }

  // Attach listeners
  input.addEventListener('input', handleInput)
  input.addEventListener('focus', handleFocus)
  input.addEventListener('keydown', handleKeydown)
  input.addEventListener('blur', handleBlur)
  createDropdown().addEventListener('click', handleClick)

  // Return cleanup function
  return () => {
    input.removeEventListener('input', handleInput)
    input.removeEventListener('focus', handleFocus)
    input.removeEventListener('keydown', handleKeydown)
    input.removeEventListener('blur', handleBlur)
    if (debounceTimer) clearTimeout(debounceTimer)
    dropdown?.remove()
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
