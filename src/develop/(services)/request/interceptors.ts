import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/develop/(stores)/auth-store'
import { toast } from 'sonner'
import { apiConfig, HTTP_STATUS, RESPONSE_CODE } from './config'
import type { RequestConfig, RequestError, ResponseData } from './types'

/**
 * 请求拦截器
 */
export function requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
     const requestConfig = config as InternalAxiosRequestConfig & RequestConfig
     const { needToken = true } = requestConfig

     // 添加 token
     if (needToken) {
          const token = useAuthStore.getState().auth.accessToken
          if (token) {
               config.headers.Authorization = `Bearer ${token}`
          }
     }

     // 添加时间戳防止缓存
     if (config.method?.toLowerCase() === 'get') {
          config.params = {
               ...config.params,
               _t: Date.now(),
          }
     }

     // 开发环境打印请求信息
     if (apiConfig.isDev) {
          // eslint-disable-next-line no-console
          console.log('🚀 Request:', {
               url: config.url,
               method: config.method,
               params: config.params,
               data: config.data,
          })
     }

     return config
}

/**
 * 请求错误拦截器
 */
export function requestErrorInterceptor(error: AxiosError): Promise<AxiosError> {
     if (apiConfig.isDev) {
          // eslint-disable-next-line no-console
          console.error('❌ Request Error:', error)
     }
     return Promise.reject(error)
}

/**
 * 响应拦截器
 */
export function responseInterceptor<T = unknown>(response: AxiosResponse<ResponseData<T>>): AxiosResponse<T> | Promise<never> {
     const { data, config } = response
     const requestConfig = config as AxiosRequestConfig & RequestConfig

     // 开发环境打印响应信息
     if (apiConfig.isDev) {
          // eslint-disable-next-line no-console
          console.log('✅ Response:', {
               url: config.url,
               data,
          })
     }

     // 处理业务错误
     if (data.code !== undefined && data.code !== RESPONSE_CODE.SUCCESS) {
          const error: RequestError = new Error(data.message || '请求失败') as RequestError
          error.response = response as AxiosResponse<ResponseData>
          error.config = config
          error.errorCode = data.code
          error.errorMessage = data.message

          // 自定义错误处理
          if (requestConfig.customErrorHandler) {
               requestConfig.customErrorHandler(error)
          } else if (requestConfig.showError !== false) {
               toast.error(data.message || '请求失败')
          }

          return Promise.reject(error)
     }

     // 如果响应数据有 data 字段，则提取 data，否则返回整个响应数据
     if (data.data !== undefined) {
          return {
               ...response,
               data: data.data,
          } as AxiosResponse<T>
     }

     return response as AxiosResponse<T>
}

/**
 * 响应错误拦截器
 */
export function responseErrorInterceptor(error: AxiosError<ResponseData>): Promise<AxiosError<ResponseData>> {
     const requestConfig = error.config as AxiosRequestConfig & RequestConfig

     if (apiConfig.isDev) {
          // eslint-disable-next-line no-console
          console.error('❌ Response Error:', error)
     }

     // 处理 HTTP 错误
     if (error.response) {
          const { status, data } = error.response
          const errorMessage = data?.message || error.message || '请求失败'

          switch (status) {
               case HTTP_STATUS.UNAUTHORIZED:
                    // 未授权，清除 token 并跳转登录
                    useAuthStore.getState().auth.reset()
                    if (requestConfig.showError !== false) {
                         toast.error('登录已过期，请重新登录')
                    }
                    // 可以在这里添加路由跳转到登录页
                    // router.navigate({ to: '/sign-in' })
                    break
               case HTTP_STATUS.FORBIDDEN:
                    if (requestConfig.showError !== false) {
                         toast.error('没有权限访问')
                    }
                    break
               case HTTP_STATUS.NOT_FOUND:
                    if (requestConfig.showError !== false) {
                         toast.error('请求的资源不存在')
                    }
                    break
               case HTTP_STATUS.REQUEST_TIMEOUT:
                    if (requestConfig.showError !== false) {
                         toast.error('请求超时，请稍后重试')
                    }
                    break
               case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                    if (requestConfig.showError !== false) {
                         toast.error('服务器错误，请稍后重试')
                    }
                    break
               case HTTP_STATUS.SERVICE_UNAVAILABLE:
                    if (requestConfig.showError !== false) {
                         toast.error('服务暂时不可用，请稍后重试')
                    }
                    break
               default:
                    if (requestConfig.showError !== false) {
                         toast.error(errorMessage)
                    }
          }

          const requestError: RequestError = error as RequestError
          requestError.errorCode = data?.code || status
          requestError.errorMessage = errorMessage

          // 自定义错误处理
          if (requestConfig.customErrorHandler) {
               requestConfig.customErrorHandler(requestError)
          }

          return Promise.reject(requestError)
     }

     // 网络错误
     if (error.request) {
          if (requestConfig.showError !== false) {
               toast.error('网络连接失败，请检查网络')
          }
     }

     return Promise.reject(error)
}
