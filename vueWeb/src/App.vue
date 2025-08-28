<template>
  <div id="app">
    <!-- :key="Date.parse(new Date())" 多个同一页面点击需要再刷新页面时加上key -->
    <router-view />
    <loading></loading>
  </div>
</template>

<script>
import loading from '@/components/Loading'

export default {
  name: 'App',
  components: { loading }
}
</script>

