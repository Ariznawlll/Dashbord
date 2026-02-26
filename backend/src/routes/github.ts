import express from 'express';
import { getIssues, getIssuesByAssignee, getRegressionIssues, getRecentlyClosedIssues } from '../services/github.js';

const router = express.Router();

// 获取所有 bug
router.get('/issues', async (req, res) => {
  try {
    const issues = await getIssues();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 按负责人统计
router.get('/issues/by-assignee', async (req, res) => {
  try {
    const stats = await getIssuesByAssignee();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 回归 bug
router.get('/issues/regression', async (req, res) => {
  try {
    const issues = await getRegressionIssues();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 最近关闭的 bug
router.get('/issues/recently-closed', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 1;
    const issues = await getRecentlyClosedIssues(days);
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
