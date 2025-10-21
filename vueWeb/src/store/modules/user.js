import { login, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    loginName: '',
    avatar: '',
    roles: [],
    data: {},
    viewWay: 1,
    newTab: true
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_LOGIN_NAME: (state, loginName) => {
    state.loginName = loginName
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_DATA: (state, data) => {
    state.data = data
  },
  SET_VIEW_WAY: (state, viewWay) => {
    state.viewWay = viewWay
  },
  SET_NEW_TAB: (state, newTab) => {
    state.newTab = newTab
  }
}

const actions = {
  // 视图切换
  changeView({ commit }, key) {
    return new Promise(resolve => {
      commit('SET_VIEW_WAY', key)
      resolve()
    })
  },
  // 新标签页
  changeTab({ commit }, flag) {
    return new Promise(resolve => {
      commit('SET_NEW_TAB', flag)
      resolve()
    })
  },
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ loginName: username.trim(), loginPassword: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // set token
  setToken({ commit, state }, token) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', token)
      setToken(token)
      resolve()
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('验证失败，请重新登录')
        }

        const { nickName, loginName } = data
        // roles must be a non-empty array
        // if (!roles || roles.length <= 0) {
        //   reject('getInfo: roles must be a non-null array!')
        // }

        commit('SET_ROLES', ['admin'])
        commit('SET_NAME', nickName)
        commit('SET_LOGIN_NAME', loginName)
        commit('SET_DATA', data)
        commit('SET_AVATAR', require('@/assets/personal-black.png'))
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

