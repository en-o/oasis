package cn.tannn.oasis;

import cn.tannn.oasis.controller.DataBackupController;
import cn.tannn.oasis.controller.LoginController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class ApiApplication  implements ApplicationRunner {

    @Autowired
    private DataBackupController dataBackupController;

    @Autowired
    private LoginController loginController;

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
        log.info(""" 
                
                =====================================================================
                ========web地址：http://192.168.1.71:1249=============================
                =====================================================================
                """);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 启动检查定时备份任务
        log.info("启动检查定时备份任务");
        dataBackupController.init();

        log.info("初始化数据");
        loginController.initSysConfig();
    }
}
