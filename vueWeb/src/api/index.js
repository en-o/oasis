import request from '@/utils/request'

// 分页查询 - 首页轮播
export function bannerPage(data) {
  return request({
    url: '/banner/page',
    method: 'post',
    data
  })
}

