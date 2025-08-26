package cn.tannn.oasis.utils;

import cn.tannn.jdevelops.utils.core.file.ImageBase64Compressed;

/**
 * 图片处理
 *
 * @author <a href="https://t.tannn.cn/">tan</a>
 * @version V1.0
 * @date 2025/8/26 15:04
 */
public class ImageUtils {

    /**
     * 检查字符串是 URL 还是 base64
     * <p> base64：一般以data:开头，或只包含字母、数字、+、/、=，长度较长。 </p>
     * <p> url：以 http:// 或 https:// 开头。</p>
     * @param str 输入字符串
     * @return "url"、"base64" 或 "unknown"
     */
    public static String checkType(String str) {
        if (str == null) {
            return "unknown";
        }
        // 判断是否为 URL
        if (str.startsWith("http://") || str.startsWith("https://")) {
            return "url";
        }
        // 判断是否为 base64（简单判断）
        String base64Pattern = "^[A-Za-z0-9+/=\\s]+$";
        if (str.matches(base64Pattern) && str.length() > 100) { // base64 通常较长
            return "base64";
        }
        // data:image/png;base64,xxxx
        if (str.startsWith("data:")) {
            return "base64";
        }
        return "unknown";
    }


    /**
     * 处理图片字符串
     * <p> 如果是 URL，直接返回；如果是 base64，进行压缩后返回。</p>
     * @param image 图片字符串
     * @return 处理后的图片字符串
     */
    public static String processImage(String image) {
        if(image == null || image.isEmpty()){
            return image;
        }
        String type = checkType(image);
        if ("url".equals(type)) {
            // 处理 URL 图片
            return image;
        } else if ("base64".equals(type)) {
            // 处理 base64 图片
            return ImageBase64Compressed.compressImageToBase64(image
                    , ImageBase64Compressed.DatabaseType.MYSQL_TEXT);
        } else {
            throw new IllegalArgumentException("Unsupported image format");
        }
    }

}
