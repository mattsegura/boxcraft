/**
 * Performance monitoring utilities
 */

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(): void {
  if (!window.performance) return

  // Wait for page to fully load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (perfData) {
        console.group('📊 Performance Metrics')
        console.log('DNS Lookup:', Math.round(perfData.domainLookupEnd - perfData.domainLookupStart), 'ms')
        console.log('TCP Connection:', Math.round(perfData.connectEnd - perfData.connectStart), 'ms')
        console.log('Request Time:', Math.round(perfData.responseStart - perfData.requestStart), 'ms')
        console.log('Response Time:', Math.round(perfData.responseEnd - perfData.responseStart), 'ms')
        console.log('DOM Interactive:', Math.round(perfData.domInteractive - perfData.fetchStart), 'ms')
        console.log('DOM Complete:', Math.round(perfData.domComplete - perfData.fetchStart), 'ms')
        console.log('Total Load Time:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms')
        console.groupEnd()
      }

      // Log resource timing
      const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const scripts = resources.filter(r => r.name.includes('.js'))
      const styles = resources.filter(r => r.name.includes('.css'))
      
      console.group('📦 Resource Loading')
      console.log('Scripts:', scripts.length, 'files')
      console.log('Stylesheets:', styles.length, 'files')
      
      // Show largest scripts
      const largestScripts = scripts
        .sort((a, b) => b.transferSize - a.transferSize)
        .slice(0, 5)
      
      console.log('Largest scripts:')
      largestScripts.forEach(script => {
        const name = script.name.split('/').pop() || script.name
        const size = (script.transferSize / 1024).toFixed(2)
        const duration = Math.round(script.duration)
        console.log(`  ${name}: ${size} KB (${duration}ms)`)
      })
      console.groupEnd()
    }, 1000)
  })
}

/**
 * Monitor FPS and log warnings if it drops below threshold
 */
export function monitorFPS(threshold = 30): void {
  let lastTime = performance.now()
  let frames = 0
  let lowFPSCount = 0

  function checkFPS() {
    const now = performance.now()
    frames++

    if (now >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (now - lastTime))
      
      if (fps < threshold) {
        lowFPSCount++
        if (lowFPSCount > 3) {
          console.warn(`⚠️ Low FPS detected: ${fps} FPS (threshold: ${threshold})`)
        }
      } else {
        lowFPSCount = 0
      }

      frames = 0
      lastTime = now
    }

    requestAnimationFrame(checkFPS)
  }

  requestAnimationFrame(checkFPS)
}
