<template>
  <div class="app-content">
    <div class="page-content-width">
      <div class="pcw-divi"></div>
      <div class="head-card">
        <el-input v-model="searchText" placeholder="搜索导航"></el-input>
        <div class="hc-row">
          <div v-for="(c,i) in classfiyList" :key="i" class="hcr-item">{{ c.name }}</div>
        </div>
      </div>
      <div class="pcw-divi"></div>
      <div class="pcw-nav">
        <div v-for="(n,i) in navList" :key="i" class="pn-item">
          <div class="pi-row">
            <img :src="n.logo" class="pir-img">
            <div class="pir-f-1">
              <div class="pir-title">{{ n.name }}</div>
              <div class="pir-desc overText">{{ n.desc }}</div>
              <div class="pir-type">{{ n.type }}</div>
            </div>
            <svg-icon icon-class="skip-icon" class="pir-svg" />
          </div>
          <div class="pi-info">查看账户信息</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      searchText: '',
      classfiyList: [
        { code: '1', name: '搜索引擎' },
        { code: '1', name: '开发工具' },
        { code: '1', name: '社交媒体' },
        { code: '1', name: '学习资料' }
      ],
      navList: [
        { logo: require('@/assets/logo.png'), code: '1', name: 'Google', desc: 'Google搜索引擎', type: '搜索引擎' },
        { logo: require('@/assets/logo.png'), code: '2', name: 'Google', desc: 'Google搜索引擎', type: '搜索引擎' }
      ]
    }
  },
  created() {
  },
  methods: {
  }
}

</script>

<style lang="scss" scoped>
.app-content{
  min-height: calc(100vh - 72px);
  background-image: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
  .pcw-divi{ height: 20px; }
  .head-card{
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    .hc-row{
      display: flex;
      align-items: center;
      flex-wrap: wrap;//自动换行
      margin-top: 20px;
      .hcr-item{
        color: #8a92a6;
        border:1px solid #8a92a6;
        border-radius: 10px;
        padding: 5px 16px;
        margin-right: 20px;
        cursor: pointer;
        font-size: 14px;
        &:hover{
          border-color: #969696;
          background: #969696;
          color: #fff;
        }
      }
    }
  }
  .pcw-nav{
    display: grid;
    grid-template-columns: repeat(4,1fr);
    grid-gap: 20px;
    .pn-item{
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      .pi-row{
        display: flex;
        align-items: center;
        .pir-img{
          width: 48px;
          height: 48px;
          margin-right: 20px;
        }
        .pir-f-1{ flex: 1; }
        .pir-title{
          font-weight: 600;
          color: #1f2937;
        }
        .pir-desc{
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        .pir-type{
          display: inline-block;
          background-color: #f3f4f6;
          font-size: 12px;
          color: #4b5563;
          padding: 4px 12px;
          border-radius: 999px;
          margin-top: 5px;
        }
        .pir-svg{
          cursor: pointer;
          font-size: 20px;
          color: #adabab;
        }
      }
      .pi-info{
        margin-top: 20px;
        font-size: 12px;
        color: #2563eb;
        text-decoration: underline;
      }
      &:hover{
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        .pi-row{
           .pir-title{
            color:#3b82f6;
           }
        }
      }
    }
  }
}
</style>
