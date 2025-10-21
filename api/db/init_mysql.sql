

INSERT INTO NAV_CATEGORY(ID, CATEGORY_NAME, SORT) VALUES (1, '测试服', 1);
INSERT INTO NAV_CATEGORY(ID, CATEGORY_NAME, SORT) VALUES (2, '线上服', 2);
INSERT INTO NAV_CATEGORY(ID, CATEGORY_NAME, SORT) VALUES (3, '临时服', 3);
INSERT INTO NAV_CATEGORY(ID, CATEGORY_NAME, SORT) VALUES (4, '组件', 4);
INSERT INTO NAV_CATEGORY(ID, CATEGORY_NAME, SORT) VALUES (5, '工具', 5);


INSERT INTO `backup_config` (`ID`, `BACKUP_COUNT`, `DESCRIPTION`, `DRIVER_CLASS_NAME`, `ENABLED`, `LAST_BACKUP_TIME`, `PASSWORD`, `SCHEDULE`, `URL`, `USERNAME`) VALUES (1, 0, '测试', 'com.mysql.cj.jdbc.Driver', 0, NULL, 'root', '0 0 2 * * ?', 'jdbc:mysql://localhost:3306/oasis', 'root');


INSERT INTO `system_config` (`ID`, `CONFIG_KEY`, `DEFAULT_OPEN_MODE`, `HIDE_ADMIN_ENTRY`, `PASSWORD`, `SITE_LOGO`, `SITE_TITLE`, `USERNAME`) VALUES (1, 'MAIN', 1, 0, '123', NULL, 'Oasis', 'tan');



INSERT INTO `nav_item` (`ID`, `ACCOUNT`, `CATEGORY`, `ICON`, `LOOK_ACCOUNT`, `NAME`, `NVA_ACCESS_SECRET`, `PASSWORD`, `REMARK`, `SORT`, `STATUS`, `URL`) VALUES (1, 'tan', '工具', 'https://192.168.1.141:6412/admin/assets/favicon-5021e58a.svg', 0, '原来的导航', 'tan', '123456', '原来的导航网站，管理端在后面加上/admin进行访问', 1, 1, 'http://192.168.1.141:6412/');
INSERT INTO `nav_item` (`ID`, `ACCOUNT`, `CATEGORY`, `ICON`, `LOOK_ACCOUNT`, `NAME`, `NVA_ACCESS_SECRET`, `PASSWORD`, `REMARK`, `SORT`, `STATUS`, `URL`) VALUES (2, '', '工具', 'https://pairdrop.net/images/favicon-96x96.png', 1, '跨平台传输文件', 'tan', '', '实现跨平台文件传输。无需安装，无需注册。', 1, 1, 'https://pairdrop.net/');
