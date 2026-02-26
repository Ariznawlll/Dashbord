import express from 'express';
import { getPerformanceMonitors } from '../services/monitoring.js';

const router = express.Router();

// 获取性能监控链接列表
router.get('/monitors', async (req, res) => {
  try {
    const monitors = getPerformanceMonitors();
    res.json(monitors);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
