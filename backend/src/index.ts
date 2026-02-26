import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import githubRoutes from './routes/github.js';
import lokiRoutes from './routes/loki.js';
import monitoringRoutes from './routes/monitoring.js';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env 文件（从项目根目录）
dotenv.config({ path: join(__dirname, '..', '.env') });

// 调试：打印环境变量
console.log('Environment loaded:');
console.log('- GITHUB_REPO:', process.env.GITHUB_REPO);
console.log('- PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/github', githubRoutes);
app.use('/api/loki', lokiRoutes);
app.use('/api/monitoring', monitoringRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
