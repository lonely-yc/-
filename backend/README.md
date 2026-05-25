# 项目履历追踪台后端

这是项目履历追踪台的 Spring Boot 后端，提供人员管理、项目管理、项目成员、项目履历、文件上传和操作日志接口。

## 技术栈

- Java 17
- Spring Boot 3.2
- MyBatis
- MySQL

## 启动

1. 确认 MySQL 运行在 `localhost:13306`，账号密码为 `root / 1234`。
2. 执行 `sql/init.sql` 初始化数据库和演示数据。
3. 在 `backend` 目录运行：

```bash
mvn spring-boot:run
```

服务端口：`18081`。

## 文件上传

上传接口会把文件保存到后端项目目录下的 `uploads` 文件夹。

支持常规项目资料和配置文件后缀：

- `.txt`
- `.md`
- `.xls`
- `.xlsx`
- `.doc`
- `.docx`
- `.zip`
- `.pdf`
- `.csv`
- `.json`
- `.yml`
- `.yaml`
- `.conf`
- `.xml`
- `.properties`

## 接口

- `GET /api/users`
- `GET /api/users/{id}`
- `POST /api/users`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`
- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `GET /api/projects/{id}/members`
- `POST /api/projects/{id}/members`
- `PUT /api/projects/{id}/members`
- `GET /api/projects/{id}/insight`
- `PUT /api/projects/{id}/insight`
- `GET /api/operation-logs?limit=20`
- `POST /api/operation-logs`
- `POST /api/files/upload`
- `GET /api/files/download?path=...`
- `GET /api/files/preview?path=...`

## 前端联调

前端 Vite 已将 `/api` 代理到 `http://127.0.0.1:18081`。
