/**
 * URL 查询参数编码/解码工具函数
 * 用于处理中文等特殊字符在URL中的编码问题
 */

/**
 * 对查询参数进行编码
 * @param params - 查询参数对象
 * @returns 编码后的查询参数对象
 */
export function encodeQueryParams(params: Record<string, unknown>): Record<string, unknown> {
     const encoded: Record<string, unknown> = {}

     for (const [key, value] of Object.entries(params)) {
          if (value === undefined || value === null) {
               continue
          }

          if (typeof value === 'string') {
               // 对字符串进行URL编码
               encoded[key] = encodeURIComponent(value)
          } else if (Array.isArray(value)) {
               // 对数组中的每个字符串元素进行编码
               encoded[key] = value.map((item) => (typeof item === 'string' ? encodeURIComponent(item) : item))
          } else if (typeof value === 'object') {
               // 递归处理嵌套对象
               encoded[key] = encodeQueryParams(value as Record<string, unknown>)
          } else {
               // 其他类型（number, boolean等）直接赋值
               encoded[key] = value
          }
     }

     return encoded
}

/**
 * 对查询参数进行解码
 * @param params - 编码的查询参数对象
 * @returns 解码后的查询参数对象
 */
export function decodeQueryParams(params: Record<string, unknown>): Record<string, unknown> {
     const decoded: Record<string, unknown> = {}

     for (const [key, value] of Object.entries(params)) {
          if (value === undefined || value === null) {
               continue
          }

          if (typeof value === 'string') {
               try {
                    // 对字符串进行URL解码
                    decoded[key] = decodeURIComponent(value)
               } catch {
                    // 如果解码失败，保持原值
                    decoded[key] = value
               }
          } else if (Array.isArray(value)) {
               // 对数组中的每个字符串元素进行解码
               decoded[key] = value.map((item) => {
                    if (typeof item === 'string') {
                         try {
                              return decodeURIComponent(item)
                         } catch {
                              return item
                         }
                    }
                    return item
               })
          } else if (typeof value === 'object') {
               // 递归处理嵌套对象
               decoded[key] = decodeQueryParams(value as Record<string, unknown>)
          } else {
               // 其他类型直接赋值
               decoded[key] = value
          }
     }

     return decoded
}

/**
 * 安全地解析URL查询参数
 * @param searchParams - URLSearchParams对象
 * @returns 解析后的查询参数对象
 */
export function parseSearchParams(searchParams: URLSearchParams): Record<string, unknown> {
     const params: Record<string, unknown> = {}

     for (const [key, value] of searchParams.entries()) {
          // 自动解码URL参数
          try {
               params[key] = decodeURIComponent(value)
          } catch {
               params[key] = value
          }
     }

     return params
}

/**
 * 将查询参数对象转换为URL查询字符串
 * @param params - 查询参数对象
 * @returns URL查询字符串
 */
export function stringifyQueryParams(params: Record<string, unknown>): string {
     const encoded = encodeQueryParams(params)
     const searchParams = new URLSearchParams()

     for (const [key, value] of Object.entries(encoded)) {
          if (value === undefined || value === null) {
               continue
          }

          if (Array.isArray(value)) {
               // 处理数组参数
               value.forEach((item) => {
                    if (item !== undefined && item !== null) {
                         searchParams.append(key, String(item))
                    }
               })
          } else {
               searchParams.set(key, String(value))
          }
     }

     return searchParams.toString()
}
