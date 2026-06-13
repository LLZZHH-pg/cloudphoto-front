import request from '../utils/request'

// 上传照片
export function uploadPhotos(files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  return request({
    url: '/media/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取时间线（分页）
export function getTimeline(current = 1, size = 20) {
  return request({
    url: '/media/timeline',
    method: 'get',
    params: { current, size }
  })
}

// 获取照片详情
export function getPhotoDetail(id) {
  return request({
    url: `/media/detail/${id}`,
    method: 'get'
  })
}

// 软删除照片
export function softDeletePhotos(photoIds) {
  return request({
    url: '/media/delete',
    method: 'post',
    data: photoIds
  })
}

// 批量获取下载地址
export function batchDownloadUrl(photoIds) {
  return request({
    url: '/media/download/batch',
    method: 'post',
    data: photoIds
  })
}

// 获取所有分类
export function getCategories() {
  return request({
    url: '/media/categories',
    method: 'get'
  })
}

// 批量更新照片分类
export function updateCategory(ids, category) {
  return request({
    url: '/media/category/update',
    method: 'post',
    data: { ids, category }
  })
}
