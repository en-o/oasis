import request from '@/utils/request'
import qs from 'qs'

// 临时用户登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo(token) {
  return request({
    url: '/parseToken',
    method: 'get',
    params: { token }
  })
}

// 临时用户注册
export function register(data) {
  return request({
    url: '/user/manage/register',
    method: 'post',
    data
  })
}

// 示例：传递formData
export function formDataDemo(data) {
  return request({
    url: '/demo/demo/demo',
    method: 'post',
    data: qs.stringify(data),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 用户分页列表
 */
export function userPageList(data) {
  return request({
    url: '/user/manage/page',
    method: 'post',
    data
  })
}

/**
 * 编辑用户
 */
export function editUser(data) {
  return request({
    url: '/user/manage/editUser',
    method: 'post',
    data
  })
}
