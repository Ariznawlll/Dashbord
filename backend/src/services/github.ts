import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5分钟缓存

const GITHUB_API = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPO || 'matrixorigin/matrixone'; // 添加默认值

console.log('GitHub service initialized with repo:', repo);
console.log('Token from env:', token ? `${token.substring(0, 10)}...` : 'NOT SET');
console.log('All env vars:', Object.keys(process.env).filter(k => k.startsWith('GITHUB')));

// 动态获取 headers 的函数，确保每次都使用最新的 token
function getHeaders() {
  const currentToken = process.env.GITHUB_TOKEN;
  const headers: any = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (currentToken && currentToken !== 'your_github_token_here') {
    headers.Authorization = `token ${currentToken}`;
  }

  return headers;
}

export async function getIssues(): Promise<any[]> {
  const cacheKey = 'github_issues';
  const cached = cache.get(cacheKey);
  if (cached) return cached as any[];

  console.log(`Fetching issues from: ${GITHUB_API}/repos/${repo}/issues`);
  console.log('Repo value:', repo);

  try {
    let allIssues: any[] = [];
    let page = 1;
    let hasMore = true;

    // 循环获取所有页的数据
    while (hasMore) {
      const response = await axios.get(
        `${GITHUB_API}/repos/${repo}/issues`,
        {
          headers: getHeaders(),
          params: {
            state: 'open',
            labels: 'kind/bug',
            per_page: 100,
            page: page,
          },
        }
      );

      const pageIssues = response.data.filter((issue: any) => !issue.pull_request);
      allIssues = allIssues.concat(pageIssues);

      console.log(`  Page ${page}: fetched ${pageIssues.length} issues`);

      // 如果这一页少于100条，说明没有更多数据了
      if (response.data.length < 100) {
        hasMore = false;
      } else {
        page++;
      }

      // 安全限制：最多获取10页（1000条）
      if (page > 10) {
        console.log('⚠️  Reached maximum page limit (10 pages)');
        hasMore = false;
      }
    }

    const issues = allIssues.map((issue: any) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      assignee: issue.assignee?.login || 'unassigned',
      labels: issue.labels.map((l: any) => l.name),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
      state: issue.state,
    }));

    console.log(`✓ Successfully fetched ${issues.length} total issues with kind/bug label from ${repo}`);

    cache.set(cacheKey, issues);
    return issues;
  } catch (error: any) {
    console.error('Error fetching GitHub issues:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

export async function getIssuesByAssignee() {
  const issues = await getIssues();
  
  const stats = issues.reduce((acc: any, issue: any) => {
    const assignee = issue.assignee;
    if (!acc[assignee]) {
      acc[assignee] = { assignee, count: 0, issues: [] };
    }
    acc[assignee].count++;
    acc[assignee].issues.push(issue);
    return acc;
  }, {});

  return Object.values(stats);
}

export async function getRegressionIssues() {
  const issues = await getIssues();
  
  // 识别回归 bug：
  // 1. 包含 regression 相关标签
  // 2. 或者标题中包含 regression/回归 关键词
  return issues.filter((issue: any) => {
    const hasRegressionLabel = issue.labels.some((label: string) => 
      label.toLowerCase().includes('regression') || 
      label.includes('回归')
    );
    
    const hasRegressionInTitle = 
      issue.title.toLowerCase().includes('regression') ||
      issue.title.includes('回归');
    
    return hasRegressionLabel || hasRegressionInTitle;
  });
}

export async function getRecentlyClosedIssues(days: number = 1): Promise<any[]> {
  const cacheKey = `github_closed_issues_${days}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as any[];

  console.log(`Fetching recently closed issues (last ${days} days) from: ${GITHUB_API}/repos/${repo}/issues`);

  try {
    // 计算指定天数前的时间
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    const since = daysAgo.toISOString();

    let allClosedIssues: any[] = [];
    let page = 1;
    let hasMore = true;

    // 获取最近关闭的 issues
    while (hasMore && page <= 3) { // 最多3页，避免请求太多
      const response = await axios.get(
        `${GITHUB_API}/repos/${repo}/issues`,
        {
          headers: getHeaders(),
          params: {
            state: 'closed',
            labels: 'kind/bug',
            since: since, // 只获取指定时间之后更新的
            per_page: 100,
            page: page,
            sort: 'updated',
            direction: 'desc',
          },
        }
      );

      const pageIssues = response.data.filter((issue: any) => !issue.pull_request);
      allClosedIssues = allClosedIssues.concat(pageIssues);

      if (response.data.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // 过滤出真正在指定天数内关闭的 issues
    const recentlyClosed = allClosedIssues
      .filter((issue: any) => {
        const closedAt = new Date(issue.closed_at);
        return closedAt >= daysAgo;
      })
      .map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        assignee: issue.assignee?.login || 'unassigned',
        closedBy: issue.closed_by?.login || 'unknown',
        labels: issue.labels.map((l: any) => l.name),
        closedAt: issue.closed_at,
        url: issue.html_url,
      }));

    console.log(`✓ Found ${recentlyClosed.length} issues closed in the last ${days} day(s)`);

    cache.set(cacheKey, recentlyClosed);
    return recentlyClosed;
  } catch (error: any) {
    console.error('Error fetching closed issues:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}
