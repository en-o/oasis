<template>
  <div class="navbar page-content-width">
    <!-- <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" /> -->

    <!-- <breadcrumb class="breadcrumb-container" /> -->
    <sidebar class="sidebar-container" />

    <div class="right-menu">
      <div>新标签页：</div>
      <el-switch v-model="isNewTabPage" class="rm-switch" active-color="#13ce66" inactive-color="#ccc"></el-switch>
      <div>视图：</div>
      <div class="rm-view">
        <i :class="['el-icon-s-grid','rv-l-icon',{'rvLActIcon':checkView===1}]" @click="checkView=1"></i>
        <i :class="['el-icon-s-operation' ,'rv-r-icon',{'rvRActIcon':checkView===2}]" @click="checkView=2"></i>
      </div>
      <div class="rm-btn"><i class="el-icon-setting rb-icon"></i>管理后台</div>
    </div>
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
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name'
    ])
  },
  data() {
    return {
      isNewTabPage: false,
      checkView: 1
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
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
