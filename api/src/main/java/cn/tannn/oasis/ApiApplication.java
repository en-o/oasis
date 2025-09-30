package cn.tannn.oasis;

import cn.tannn.oasis.controller.DataBackupController;
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

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 启动检查定时备份任务
        log.info("启动检查定时备份任务");
        dataBackupController.init();
    }
}
