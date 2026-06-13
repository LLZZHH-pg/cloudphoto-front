import request from '../utils/request'

// 影集列表
export function getAlbumList() {
  return request({
    url: '/album/list',
    method: 'get'
  })
}

// 创建影集
export function createAlbum({ name, description, coverUrl }) {
  return request({
    url: '/album/create',
    method: 'post',
    data: { name, description, coverUrl }
  })
}

// 编辑影集
export function updateAlbum(id, { name, description, coverUrl }) {
  return request({
    url: `/album/${id}`,
    method: 'put',
    data: { name, description, coverUrl }
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
export function addPhotosToAlbum({ sourceAlbumId, albumId, photoIds }) {
  return request({
    url: '/album/photos/add',
    method: 'post',
    data: { sourceAlbumId, albumId, photoIds }
  })
}

// 从影集移除照片
export function removePhotosFromAlbum({ sourceAlbumId, albumId, photoIds }) {
  return request({
    url: `/album/photos/remove`,
    method: 'post',
    data: { sourceAlbumId, albumId, photoIds }
  })
}

// 移动照片到其他影集
export function movePhotosToAlbum({ sourceAlbumId, albumId, photoIds }) {
  return request({
    url: '/album/photos/move',
    method: 'post',
    data: { sourceAlbumId, targetAlbumId: albumId, photoIds }
  })
}

// 复制照片到其他影集
export function copyPhotosToAlbum({ sourceAlbumId, albumId, photoIds }) {
  return request({
    url: '/album/photos/copy',
    method: 'post',
    data: { sourceAlbumId, targetAlbumIds: [albumId], photoIds }
  })
}

// 获取分类分组（智能影集列表，每个分类返回第一张照片作为封面）
export function getCategoryGroups() {
  return request({
    url: '/album/photos/category/first',
    method: 'get'
  })
}

// 获取所有分类的全部照片（智能影集详情用，前端按分类过滤）
export function getCategoryAllGroups() {
  return request({
    url: '/album/photos/category/all',
    method: 'get'
  })
}
