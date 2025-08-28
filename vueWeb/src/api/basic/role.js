import request from '@/utils/request'

// 新增角色
export function addRole(data) {
  return request({
    url: '/role/addRole',
    method: 'post',
    data
  })
}

// 条件分页数据
export function selectRole(data) {
  return request({
    url: '/role/selectRole',
    method: 'post',
    data
  })
}

// 不分页查询
export function getRoleListByQuery(params) {
  return request({
    url: 'role/grtListByQuery',
    method: 'get',
    params
  })
}

// 角色uid查询
export function getRoleByUuid(id) {
  return request({
    url: 'role/uuid',
    method: 'get',
    params: {
      uuid: id
    }
  })
}

// 根据角色id获取已保存的授权菜单
export function getRoleModule(params) {
  return request({
    url: '/role/getRoleModule',
    method: 'get',
    params
  })
}

// 角色删除
export function deleteRole(data) {
  return request({
    url: '/role/delete',
    method: 'post',
    data
  })
}

// 编辑角色
export function alterRole(data) {
  return request({
    url: '/role/alterRole',
    method: 'post',
    data
  })
}

// 角色授权
export function setRoleModule(data) {
  return request({
    url: '/role/setRoleModule',
    method: 'post',
    data
  })
}

// 批量禁用角色
export function disableRoles(data) {
  return request({
    url: '/role/disable',
    method: 'post',
    data
  })
}

// 批量启用角色
export function enabledRoles(data) {
  return request({
    url: '/role/enabled',
    method: 'post',
    data
  })
}

/**
 * 根据角色查询关联的用户
 * @param {*} params roleId
 */
export function getRoleUser(params) {
  return request({
    url: '/role/getRoleUser',
    method: 'get',
    params
  })
}

/**
 * 设置角色的用户
 * @param {*} data {  "roleId": 0, "userNos": [] }
 */
export function setRoleUser(data) {
  return request({
    url: '/role/setRoleUser',
    method: 'post',
    data
  })
}

/**
 * 获取角色的菜单权限
 */
export function getPowerMenu() {
  return request({
    url: '/role/getPower',
    method: 'get'
  })
}
