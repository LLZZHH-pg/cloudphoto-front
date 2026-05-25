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
export function getUserInfo(userId) {
  return request({
    url: `/user/info/${userId}`,
    method: 'get'
  })
}