import express from 'express';
import { getLokiEndpoints, queryLokiLogs } from '../services/loki.js';

const router = express.Router();

// 获取所有 Loki 环境配置
router.get('/endpoints', async (req, res) => {
  try {
    const endpoints = getLokiEndpoints();
    res.json(endpoints);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 查询日志
router.post('/query', async (req, res) => {
  try {
    const { endpoint, query, limit } = req.body;
    const logs = await queryLokiLogs(endpoint, query, limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
