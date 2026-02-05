// openapi.config.js
import { generateService } from '@umijs/openapi'

generateService({
  // 🌟 后端接口文档的 JSON 地址，请根据你的实际情况修改端口和路径
  schemaPath: 'http://localhost:8101/api/v2/api-docs',
  // 🌟 生成代码的存放路径
  serversPath: './src',
  // 🌟 项目名称，决定了生成在 src/api/ 目录下
  projectName: 'api',
})
