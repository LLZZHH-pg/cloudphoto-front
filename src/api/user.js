import request from '../utils/request'

// 登录
export function login({ acc, pas }) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { acc, pas }
  })
}

// 注册
export function register({ nam, pas, tel, eml }) {
  return request({
    url: '/user/register',
    method: 'post',
    data: { nam, pas, tel, eml }
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: `/user/info`,
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo({ nam, pas, tel, eml }) {
  return request({
    url: '/user/info/update',
    method: 'post',
    data: { nam, pas, tel, eml }
  })
}