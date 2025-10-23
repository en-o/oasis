package cn.tannn.oasis;

import cn.tannn.oasis.controller.DataBackupController;
import cn.tannn.oasis.controller.LoginController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import static cn.tannn.jdevelops.knife4j.core.constant.PublicConstant.COLON;
import static cn.tannn.jdevelops.knife4j.core.constant.PublicConstant.SPIRIT;
import static cn.tannn.jdevelops.knife4j.core.util.SwaggerUtil.getRealIp;

@Slf4j
@SpringBootApplication
public class ApiApplication  implements ApplicationRunner {

    @Value("${server.port:8080}")
    private int serverPort;

    @Value("${server.servlet.context-path:/}")
    private String serverName;

    @Autowired
    private DataBackupController dataBackupController;

    @Autowired
    private LoginController loginController;

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 启动检查定时备份任务
        log.info("启动检查定时备份任务");
        dataBackupController.init();

        log.info("初始化数据");
        loginController.initSysConfig();


        if (SPIRIT.equals(serverName)) {
            serverName = "";
        }

        log.info(""" 
                
                =====================================================================
                ========web地址：(http://%s =============================
                =====================================================================
                """.formatted(getRealIp() + COLON + serverPort + serverName ));
    }
}
