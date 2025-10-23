import axios from 'axios'
import qs from 'qs' // ✅ 新增
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: params => qs.stringify(params, { indices: false }) // ✅ 关键配置
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    if (response.data.code !== 200) {
      ElMessage.error(response.data.msg || '接口错误')
      return Promise.reject(response)
    }
    return response.data
  },
  error => {
    const status = error.response?.status
    if (status === 401) {
      ElMessage.warning('登录失效，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('请求失败，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request
