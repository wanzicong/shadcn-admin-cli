import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { apiConfig } from './config'
import { requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors'
import type { RequestConfig, ResponseData } from './types'

/**
 * 创建 axios 实例
 */
function createAxiosInstance(): AxiosInstance {
     const instance = axios.create({
          baseURL: apiConfig.baseURL + apiConfig.prefix,
          timeout: apiConfig.timeout,
          headers: {
               'Content-Type': 'application/json;charset=UTF-8',
          },
     })

     // 请求拦截器
     instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

     // 响应拦截器
     instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor)

     return instance
}

/**
 * 默认 axios 实例
 */
const request = createAxiosInstance()

/**
 * GET 请求
 */
export function get<T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<T> {
     return request.get<ResponseData<T>, T>(url, { ...config, params }).then((res) => res.data)
}

/**
 * POST 请求
 */
export function post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
     return request.post<ResponseData<T>, T>(url, data, config).then((res) => res.data)
}

/**
 * PUT 请求
 */
export function put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
     return request.put<ResponseData<T>, T>(url, data, config).then((res) => res.data)
}

/**
 * PATCH 请求
 */
export function patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
     return request.patch<ResponseData<T>, T>(url, data, config).then((res) => res.data)
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(url: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<T> {
     return request.delete<ResponseData<T>, T>(url, { ...config, params }).then((res) => res.data)
}

/**
 * 文件上传
 */
export function upload<T = unknown>(
     url: string,
     file: File | FormData,
     config?: RequestConfig & {
          onUploadProgress?: (progressEvent: { loaded: number; total: number }) => void
     }
): Promise<T> {
     const formData =
          file instanceof FormData
               ? file
               : (() => {
                      const fd = new FormData()
                      fd.append('file', file)
                      return fd
                 })()

     return request
          .post<ResponseData<T>, T>(url, formData, {
               ...config,
               headers: {
                    'Content-Type': 'multipart/form-data',
                    ...config?.headers,
               },
          })
          .then((res) => res.data)
}

/**
 * 文件下载
 */
export function download(url: string, params?: Record<string, unknown>, filename?: string, config?: RequestConfig): Promise<void> {
     return request
          .get<Blob>(url, {
               ...config,
               params,
               responseType: 'blob',
          })
          .then((blob) => {
               const link = document.createElement('a')
               link.href = URL.createObjectURL(blob)
               link.download = filename || `download-${Date.now()}`
               document.body.appendChild(link)
               link.click()
               document.body.removeChild(link)
               URL.revokeObjectURL(link.href)
          })
}

/**
 * 导出 axios 实例（用于特殊需求）
 */
export { request }

/**
 * 导出类型
 */
export type { RequestConfig, ResponseData, RequestError } from './types'
