INSERT INTO `nav_category` (`ID`, `CATEGORY_NAME`, `SORT`) VALUES (1, '开发环境', 0);
INSERT INTO `nav_category` (`ID`, `CATEGORY_NAME`, `SORT`) VALUES (2, '测试环境', 0);
INSERT INTO `nav_category` (`ID`, `CATEGORY_NAME`, `SORT`) VALUES (3, '线上环境', 0);
INSERT INTO `nav_category` (`ID`, `CATEGORY_NAME`, `SORT`) VALUES (4, '好用工具', 0);
INSERT INTO `nav_category` (`ID`, `CATEGORY_NAME`, `SORT`) VALUES (5, '文章推荐', 0);


INSERT INTO `backup_config` (`ID`, `BACKUP_COUNT`, `DESCRIPTION`, `DRIVER_CLASS_NAME`, `ENABLED`, `LAST_BACKUP_TIME`, `PASSWORD`, `SCHEDULE`, `URL`, `USERNAME`) VALUES (1, 0, '测试', 'com.mysql.cj.jdbc.Driver', 1, NULL, 'root', '0 0 2 * * ?', 'jdbc:mysql://localhost:3306/test', 'root');


INSERT INTO `system_config` (`ID`, `CONFIG_KEY`, `DEFAULT_OPEN_MODE`, `HIDE_ADMIN_ENTRY`, `PASSWORD`, `SITE_LOGO`, `SITE_TITLE`, `USERNAME`) VALUES (1, 'MAIN', 1, 0, '123', NULL, 'Oasis', 'tan');
