import { download } from '@/utils'
export default {
  // mixin：下载文件
  methods: {
    // 下载文件
    handleDownloadFile(item) {
      download(
        this.$fileBaseUrl + item.fileUrl,
        'get',
        (item.chName || item.enName) + item.fileUrl.substring(item.fileUrl.lastIndexOf('.'))
      )
    }
  }
}
