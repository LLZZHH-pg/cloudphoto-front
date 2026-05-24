import request from '../utils/request'

// 影集列表
export function getAlbumList() {
  return request({
    url: '/album/list',
    method: 'get'
  })
}

// 创建影集
export function createAlbum({ name, description }) {
  return request({
    url: '/album/create',
    method: 'post',
    data: { name, description }
  })
}

// 删除影集
export function deleteAlbum(id) {
  return request({
    url: `/album/${id}`,
    method: 'delete'
  })
}

// 影集详情（含照片列表）
export function getAlbumDetail(id) {
  return request({
    url: `/album/${id}`,
    method: 'get'
  })
}

// 添加照片到影集
export function addPhotosToAlbum(id, photoIds) {
  return request({
    url: `/album/${id}/photos/add`,
    method: 'post',
    data: { photoIds }
  })
}

// 从影集移除照片
export function removePhotosFromAlbum(id, photoIds) {
  return request({
    url: `/album/${id}/photos/remove`,
    method: 'post',
    data: { photoIds }
  })
}