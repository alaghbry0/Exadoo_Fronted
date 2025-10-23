/**
 * Logger Utility - يستبدل جميع console.log في المشروع
 * يعمل فقط في development mode
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug'

interface LogConfig {
  enabled: boolean
  levels: LogLevel[]
  prefix?: string
}

class AppLogger {
  private config: LogConfig

  constructor(config?: Partial<LogConfig>) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      levels: ['info', 'warn', 'error', 'success', 'debug'],
      prefix: '[Exaado]',
      ...config,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && this.config.levels.includes(level)
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toLocaleTimeString('ar-SA')
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
      debug: '🔍',
    }[level]

    return `${emoji} ${this.config.prefix} [${timestamp}] ${message}`
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }

  success(message: string, ...args: unknown[]): void {
    if (this.shouldLog('success')) {
      console.log(this.formatMessage('success', message), ...args)
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }

  /**
   * تسجيل بيانات API
   */
  api(method: string, url: string, status?: number, data?: unknown): void {
    if (!this.shouldLog('debug')) return

    const statusEmoji = status
      ? status >= 200 && status < 300
        ? '✅'
        : status >= 400
        ? '❌'
        : '⚠️'
      : '🔄'

    const message = `${statusEmoji} API ${method.toUpperCase()} ${url}${status ? ` - ${status}` : ''}`
    console.log(this.formatMessage('debug', message), data || '')
  }

  /**
   * تسجيل أداء العمليات
   */
  performance(label: string, startTime: number): void {
    if (!this.shouldLog('debug')) return

    const duration = Date.now() - startTime
    const emoji = duration < 100 ? '⚡' : duration < 500 ? '🟡' : '🔴'
    console.log(
      this.formatMessage('debug', `${emoji} Performance: ${label} - ${duration}ms`)
    )
  }

  /**
   * تجميع logs في مجموعة قابلة للطي
   */
  group(label: string, callback: () => void): void {
    if (!this.config.enabled) {
      callback()
      return
    }

    console.group(this.formatMessage('info', label))
    callback()
    console.groupEnd()
  }

  /**
   * تسجيل حالة التطبيق
   */
  state(componentName: string, state: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return

    console.log(
      this.formatMessage('debug', `State Update: ${componentName}`),
      state
    )
  }
}

// Singleton instance
const logger = new AppLogger()

export { AppLogger, logger }
export default logger
