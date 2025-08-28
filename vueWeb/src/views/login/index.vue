<template>
  <div id="login">
    <div class="login">
      <div class="login-platform">
        <div class="title" @click="getHome">我的项目</div>
        <div class="sub-title">Platform-side templates </div>
        <div class="line"></div>
      </div>
      <div class="login-content">
        <div class="login-form">
          <div class="title">欢迎登录</div>
          <div class="line"></div>
          <div class="form-item">
            <div class="form-item-content">
              <i class="el-icon-user" />
              <input
                v-model="loginForm.username"
                type="text"
                placeholder="请输入用户名"
                :disabled="isLoading"
                :style="{cursor:isLoading?'no-drop':''}"
                @keyup.enter="login"
              >
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-content">
              <i class="el-icon-lock" />
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :disabled="isLoading"
                :style="{cursor:isLoading?'no-drop':''}"
                @keyup.enter="handleLogin"
              >
            </div>
          </div>
          <div class="lcf-click" :class="[isLoading?'is-disabled':'login-btn']" @click="handleLogin">
            <i v-if="isLoading" class="el-icon-loading" />
            <span>立即登录</span>
          </div>
          <div class="cas">
            <p>还未注册，<span class="register" @click="handleToRegister">立即注册</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      isLoading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      if (this.loginForm.username && this.loginForm.username !== '' && this.loginForm.password && this.loginForm.password !== '') {
        this.isLoading = true
        this.$store.dispatch('user/login', this.loginForm).then(() => {
          this.loginForm.password = ''
          this.$store.state.user.treaty = true
          // 登录后默认跳转首页/dashboard  记录路径this.redirect
          this.$router.push({ path: '/dashboard' || '/' })
          this.isLoading = false
        }).catch(() => {
          this.isLoading = false
        })
      } else {
        this.$notify.error({
          title: '警告',
          message: `请输入${!this.loginForm.username ? `用户名` : !this.loginForm.password ? `密码` : `登录信息`}`,
          type: 'warning'
        })
      }
    },
    // 调整驾驶舱
    getHome() {
      this.$router.push(`/dashboard`)
    },
    // 注册
    handleToRegister() {
      // this.$router.push(`/register?redirect=${this.redirect}`)
      this.$router.push(`/register`)
    }
  }
}
</script>
<style lang="scss">
  html, body {
    width: 100%;
    height: 100%;
  }
</style>
<style lang="scss" scoped>
  #login {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 1200px;
    display: flex;
    flex-direction: column;
    .login {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      background-image: url('~@/assets/bj.png');
      background-repeat: no-repeat;
      background-size: cover;
      .login-platform{
        margin-left: 120px;
        .title{
          font-size: 70px;
          font-family: Microsoft YaHei;
          font-weight: bold;
          color: #FFFFFF;
          cursor: pointer;
        }
        .sub-title{
          font-size: 20px;
          font-family: Microsoft YaHei;
          font-weight: 400;
          color: #FFFFFF;
          margin: 42px 0 20px 0;
        }
        .line{
          width: 168px;
          height: 5px;
          background: #FFFFFF;
        }
      }
      .login-content {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.1);
        .login-form {
          position: relative;
          width: 560px;
          height: 532px;
          padding: 10px 55px;
          .title {
            font-size: 20px;
            font-family: Microsoft YaHei;
            font-weight: 400;
            color: #FFFFFF;
            line-height: 24px;
            letter-spacing: 1px;
            margin-bottom: 13px;
          }
          .line{
            width: 105px;
            height: 4px;
            background: linear-gradient(81deg, #5CB4F2 0%, #5DDDF4 100%);
            margin-bottom: 30px;
          }
          .form-item {
            padding: 20px 0;
            .form-item-content {
              border-bottom: 2px solid #fff;
              border-image: linear-gradient(to right, rgba(98,171,235, 0.8),rgba(98,171,235, 0.8) 20%, rgba(109,224,245, 0.8) 80%,rgba(109,224,245, 0.8)) 1;
              line-height: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              i {
                font-size: 20px;
                color: #fff;
                font-weight: 400;
              }
              input {
                outline: none;
                border: 0px;
                flex-grow: 1;
                font-size: 16px;
                font-weight: 400;
                line-height: 40px;
                background: none;
                letter-spacing: 1px;
                text-indent: 0.7em;
                color: #fff;
              }
              input::-webkit-input-placeholder {
                font-size: 12px;
                color: #fff;
                line-height: 40px;
                text-indent: 0.7em;
                letter-spacing: 1px;
              }
            }
          }
          .login-btn {
            margin:40px 0 20px 0;
            line-height: 40px;
            background: linear-gradient(90deg, #10AEFC 0%, #0378FF 100%);
            color: #FFF;
            text-align: center;
            cursor: pointer;
            font-size: 16px;
            font-family: Microsoft YaHei;
            font-weight: 400;
            i {
              padding: 0 5px;
              font-size: 16px;
              line-height: 40px;
            }
          }
          .is-disabled {
             margin:40px 0 20px 0;
            line-height: 40px;
            background: linear-gradient(90deg, #10AEFC 0%, #0378FF 100%);
            color: #FFF;
            text-align: center;
            cursor: no-drop;
            border-radius: 2px;
            font-size: 16px;
            font-family: Microsoft YaHei;
            font-weight: 400;
            opacity: 0.7;
            i {
              padding: 0 5px;
              font-size: 16px;
              line-height: 40px;
            }
          }
          .cas {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            align-content: center;
            justify-content: space-around;
            align-items: center;
            color: #FFFFFF;
            font-size: 16px;
            font-family: Microsoft YaHei;
            font-weight: 400;
            .register{
              color: #E5FF08;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
</style>
