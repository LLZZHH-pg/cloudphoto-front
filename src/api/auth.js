import request from '../utils/request'

// 管理员登录
export function authLogin({ acc, pas }) {
  return request({
    url: '/user/auth/login',
    method: 'post',
    data: { acc, pas }
  })
}

// 获取管理员套餐列表
export function getAuthPlanList() {
  return request({
    url: '/user/auth/plans/list',
    method: 'get'
  })
}

// 保存/修改套餐
export function saveAuthPlan(data) {
  return request({
    url: '/user/auth/plans/save',
    method: 'post',
    data
  })
}

// 删除套餐
export function deleteAuthPlan(planid) {
  return request({
    url: '/user/auth/plans/delete',
    method: 'post',
    data: { planid }
  })
}

// 修改用户状态
export function updateUserStatus({ userId, status }) {
  return request({
    url: '/user/auth/user/status',
    method: 'post',
    data: { userId, status }
  })
}