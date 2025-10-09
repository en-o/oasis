# Oasis · 专属绿洲
在信息纷繁复杂的数字荒漠中，您需要一片宁静、高效且专属于自我的空间。


# H2
浏览器访问 http://localhost:1249/h2
JDBC URL：jdbc:h2:file:./api/db/db_oasis
用户名/密码：sa / sa


# web
> reactWeb  

admin: http://localhost:3000/admin
nva: http://localhost:3000


# build
```shell
cd api
mvn clean package
```
这会自动执行：
1. 安装 Node.js 和 npm
2. 执行 npm install
3. 执行 npm run build:merged（将前端构建到 api/src/main/resources/static）
4. 打包 jar 并将资源文件拷贝到 target/output/resources/static
```text
  📁 打包产物结构
  api/target/output/
  ├── api-0.0.1-SNAPSHOT.jar    # 主 jar 包（只包含 Java 类）
  ├── lib/                       # 所有依赖 jar
  └── resources/                 # 资源文件
      ├── static/                # React 前端静态文件（在这里！）
      │   ├── index.html
      │   ├── js/
      │   ├── css/
      │   └── assets/
      ├── application.yml
      └── ...其他配置文件
```

🚀 运行方式
cd api/target/output
java -jar api-0.0.1-SNAPSHOT.jar
