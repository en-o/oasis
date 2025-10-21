<template>
  <div class="navbar page-content-width">
    <!-- <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" /> -->

    <!-- <breadcrumb class="breadcrumb-container" /> -->
    <sidebar class="sidebar-container" />

    <div class="right-menu">
      <div>新标签页：</div>
      <el-switch v-model="isNewTabPage" class="rm-switch" active-color="#13ce66" inactive-color="#ccc" @change="handleTab"></el-switch>
      <div>视图：</div>
      <div class="rm-view">
        <i :class="['el-icon-s-grid','rv-l-icon',{'rvLActIcon':checkView===1}]" @click="handleView(1)"></i>
        <i :class="['el-icon-s-operation' ,'rv-r-icon',{'rvRActIcon':checkView===2}]" @click="handleView(2)"></i>
      </div>
      <div class="rm-btn" @click="handleMag()"><i class="el-icon-setting rb-icon"></i>管理后台</div>
    </div>
    <el-dialog
      title="管理员登录"
      :visible.sync="isSetDialog"
      form
      width="22%"
      destroy-on-close
      lock-scroll
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form ref="otherform" :rules="otherRules" :model="otherform" @submit.native.prevent>
        <el-form-item label="用户名" prop="loginName">
          <el-input v-model.trim="otherform.loginName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="otherform.password" placeholder="请输入密码" show-password autocomplete="new-password" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleSetCancel()">取 消</el-button>
        <el-button type="primary" @click="handleSet('otherform')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
// import Hamburger from '@/components/Hamburger'
import Sidebar from './Sidebar'

export default {
  components: {
    // Breadcrumb
    // Hamburger
    Sidebar
  },
  data() {
    return {
      isNewTabPage: true,
      checkView: 1,
      isSetDialog: false,
      otherform: {
        loginName: this.$store.state.user.loginName,
        password: ''
      },
      otherRules: {
        loginName: [{ required: true, message: '请输入用户名！', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码！', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    // 新标签页切换
    handleTab(e) {
      this.$store.dispatch('user/changeTab', e)
    },
    // 视图切换
    handleView(v) {
      this.checkView = v
      this.$store.dispatch('user/changeView', v)
    },
    // 管理后台--弹窗
    handleMag() {
      this.isSetDialog = true
    },
    // 取消弹窗
    handleSetCancel() {
      this.isSetDialog = false
      this.otherform = {
        loginName: '',
        password: ''
      }
    },
    // 确认弹窗
    handleSet(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return
        this.$message({ message: '登录成功', type: 'success' })
        this.handleSetCancel()
      })
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 72px;
  overflow: hidden;
  position: relative;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }
  .breadcrumb-container {
    float: left;
  }
  .right-menu {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    word-break: keep-all;
    .rm-switch{ margin-right: 20px; }
    .rm-view{
      display: flex;
      align-items: center;
      .rv-l-icon{
        padding: 6px;
        color: #4b5563;
        cursor:pointer;
        border: 1px solid #d1d5db;
        border-radius: 8px 0  0 8px;
      }
      .rvLActIcon{
        border-color: #3b82f6;
        background: #3b82f6;
        color: #fff;
      }
      .rv-r-icon{
        margin-left: -1px;
        padding: 6px;
        color: #4b5563;
        cursor:pointer;
        border: 1px solid #d1d5db;
        border-radius:0 8px 8px  0 ;
      }
      .rvRActIcon{
        border-color: #3b82f6;
        background: #3b82f6;
        color: #fff;
      }
    }
    .rm-btn{
      display: flex;
      align-items: center;
      margin-left: 20px;
      padding: 8px 16px;
      background: #f1f1f1;
      border-radius: 5px;
      color: #333;
      cursor: pointer;
      font-size: 16px;
      line-height: 22px;
      &:hover{
        background: rgb(219, 219, 219);
      }
      .rb-icon{
        margin-right: 5px;
      }
    }
  }
}
</style>
