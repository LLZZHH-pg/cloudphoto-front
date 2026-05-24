import request from '../utils/request'

// 获取回收站列表
export function getTrashList() {
  return request({
    url: '/media/trash/list',
    method: 'get'
  })
}

// 从回收站恢复
export function restoreTrash(photoIds) {
  return request({
    url: '/media/trash/restore',
    method: 'post',
    data: photoIds
  })
}

// 彻底删除
export function cleanTrash(photoIds) {
  return request({
    url: '/media/trash/clean',
    method: 'delete',
    data: photoIds
  })
}