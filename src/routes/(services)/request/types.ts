import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * 请求配置接口
 */
export interface RequestConfig extends AxiosRequestConfig {
     /**
      * 是否显示加载提示
      */
     showLoading?: boolean
     /**
      * 是否显示错误提示
      */
     showError?: boolean
     /**
      * 是否携带 token
      */
     needToken?: boolean
     /**
      * 自定义错误处理
      */
     customErrorHandler?: (error: AxiosError) => void
}

/**
 * 响应数据结构
 */
export interface ResponseData<T = unknown> {
     /**
      * 响应码
      */
     code: number
     /**
      * 响应消息
      */
     message: string
     /**
      * 响应数据
      */
     data: T
     /**
      * 是否成功
      */
     success?: boolean
}

/**
 * 分页响应数据结构
 */
export interface PageResponseData<T = unknown> {
     /**
      * 数据列表
      */
     list: T[]
     /**
      * 总数
      */
     total: number
     /**
      * 当前页
      */
     page: number
     /**
      * 每页数量
      */
     pageSize: number
}

/**
 * 请求错误类型
 */
export interface RequestError extends AxiosError<ResponseData> {
     /**
      * 错误码
      */
     errorCode?: number | string
     /**
      * 错误消息
      */
     errorMessage?: string
}

/**
 * 请求拦截器配置
 */
export interface RequestInterceptorConfig {
     /**
      * 请求前处理
      */
     onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
     /**
      * 请求错误处理
      */
     onRejected?: (error: AxiosError) => Promise<AxiosError>
}

/**
 * 响应拦截器配置
 */
export interface ResponseInterceptorConfig {
     /**
      * 响应成功处理
      */
     onFulfilled?: (response: AxiosResponse<ResponseData>) => AxiosResponse<ResponseData> | Promise<AxiosResponse<ResponseData>>
     /**
      * 响应错误处理
      */
     onRejected?: (error: AxiosError<ResponseData>) => Promise<AxiosError<ResponseData>>
}
