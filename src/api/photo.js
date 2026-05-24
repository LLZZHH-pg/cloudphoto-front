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