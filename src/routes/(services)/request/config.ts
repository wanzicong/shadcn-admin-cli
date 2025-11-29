/**
 * API 配置
 */
export const apiConfig = {
     /**
      * API 基础地址
      */
     baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
     /**
      * 请求超时时间（毫秒）
      */
     timeout: Number.parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
     /**
      * API 前缀
      */
     prefix: import.meta.env.VITE_API_PREFIX || '',
     /**
      * 是否开发环境
      */
     isDev: import.meta.env.DEV,
     /**
      * 是否生产环境
      */
     isProd: import.meta.env.PROD,
     /**
      * 应用环境
      */
     env: import.meta.env.VITE_APP_ENV || 'development',
} as const

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
     /**
      * 成功
      */
     OK: 200,
     /**
      * 已创建
      */
     CREATED: 201,
     /**
      * 无内容
      */
     NO_CONTENT: 204,
     /**
      * 错误请求
      */
     BAD_REQUEST: 400,
     /**
      * 未授权
      */
     UNAUTHORIZED: 401,
     /**
      * 禁止访问
      */
     FORBIDDEN: 403,
     /**
      * 未找到
      */
     NOT_FOUND: 404,
     /**
      * 请求超时
      */
     REQUEST_TIMEOUT: 408,
     /**
      * 服务器错误
      */
     INTERNAL_SERVER_ERROR: 500,
     /**
      * 服务不可用
      */
     SERVICE_UNAVAILABLE: 503,
} as const

/**
 * 响应码
 */
export const RESPONSE_CODE = {
     /**
      * 成功
      */
     SUCCESS: 200,
     /**
      * 未授权
      */
     UNAUTHORIZED: 401,
     /**
      * 禁止访问
      */
     FORBIDDEN: 403,
     /**
      * 未找到
      */
     NOT_FOUND: 404,
     /**
      * 服务器错误
      */
     SERVER_ERROR: 500,
} as const
