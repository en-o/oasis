import { asyncRoutes, constantRoutes } from '@/router'
// import { getPowerMenu } from '@/api/basic/role'
import Layout from '@/layout'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}
/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function setasyncRoutes(oldermenu) {
  const data = {
    name: oldermenu.componentName,
    path: oldermenu.router,
    component: oldermenu.component === 'Layout' ? Layout : (resolve) => require([`@/views${oldermenu.component}`], resolve),
    // redirect: '',
    alwaysShow: oldermenu.parentId === '0',
    meta: { title: oldermenu.name, icon: oldermenu.icon, roles: 'admin' },
    parentId: oldermenu.parentId,
    id: oldermenu.id
  }
  if (oldermenu.parentId === '0') {
    data.children = oldermenu.children
  }
  return data
}
/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutesFromRouterJS(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutesFromRouterJS(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = setasyncRoutes(route)
    res.push(tmp)
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      // let accessedRoutes
      // getPowerMenu().then(res => {
      //   if (res.success) {
      //     accessedRoutes = filterAsyncRoutes(res.data, roles)
      //     accessedRoutes.push(asyncRoutes[0])
      //     commit('SET_ROUTES', accessedRoutes)
      //     resolve(accessedRoutes)
      //   }
      // })
      const asyncRoutesRes = filterAsyncRoutesFromRouterJS(asyncRoutes, roles)
      commit('SET_ROUTES', asyncRoutesRes)
      resolve(asyncRoutesRes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
