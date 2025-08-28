<script>
import { getToken } from '@/utils/auth'
export default {
  async created() {
    const { query } = this.$route
    if (query.token) {
      await this.$store.dispatch('user/setToken', query.token)
      this.$router.replace({ path: '/' })
    } else if (getToken()) {
      this.$router.replace({ path: '/' })
    } else {
      location.href = `${process.env.VUE_APP_CAS_URL}`
    }
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>
