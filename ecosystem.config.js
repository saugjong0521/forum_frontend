module.exports = {
  apps: [
    {
      name: "forum_frontend",      // PM2에서 보일 앱 이름
      script: "node_modules/next/dist/bin/next", // next 실행 파일
      args: "start -H 0.0.0.0 -p 3000",          // 실행 옵션
      cwd: "./",                  // 프로젝트 루트 경로
      instances: 1,                // 여러 코어 쓰려면 "max"
      exec_mode: "fork",           // "cluster" 가능 (SSR 앱이면 fork가 안전)
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
