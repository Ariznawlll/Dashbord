import { useState, useEffect } from 'react';
import { githubApi } from '../services/api';

export default function BugOverview() {
  const [stats, setStats] = useState<any[]>([]);
  const [allIssues, setAllIssues] = useState<any[]>([]);
  const [recentlyClosed, setRecentlyClosed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssignee, setExpandedAssignee] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [closedDays, setClosedDays] = useState<number>(1); // 默认1天

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [closedDays]); // 当 closedDays 改变时重新加载数据

  const loadData = async () => {
    try {
      const [statsRes, issuesRes, closedRes] = await Promise.all([
        githubApi.getIssuesByAssignee(),
        githubApi.getIssues(),
        githubApi.getRecentlyClosedIssues(closedDays),
      ]);
      setStats(statsRes.data);
      setAllIssues(issuesRes.data);
      setRecentlyClosed(closedRes.data);
    } catch (error) {
      console.error('Failed to load bug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (assignee: string) => {
    setExpandedAssignee(expandedAssignee === assignee ? null : assignee);
  };

  const filteredIssues = allIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.number.toString().includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  const totalBugs = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">总 Bug 数</h2>
          <div className="text-4xl font-bold text-blue-600">{totalBugs}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-700">已关闭</h2>
            <select
              value={closedDays}
              onChange={(e) => setClosedDays(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={1}>24小时</option>
              <option value={3}>3天</option>
              <option value={7}>7天</option>
              <option value={14}>14天</option>
              <option value={30}>30天</option>
            </select>
          </div>
          <div className="text-4xl font-bold text-green-600">{recentlyClosed.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">负责人数</h2>
          <div className="text-4xl font-bold text-purple-600">{stats.length}</div>
        </div>
      </div>

      {recentlyClosed.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            最近 {closedDays === 1 ? '24 小时' : `${closedDays} 天`}关闭的 Bug
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentlyClosed.map((bug) => (
              <a
                key={bug.id}
                href={bug.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-blue-50 rounded hover:bg-blue-100 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-blue-700">#{bug.number} {bug.title}</div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                      <span>关闭人: <span className="font-medium text-blue-600">{bug.closedBy}</span></span>
                      <span>负责人: {bug.assignee}</span>
                      <span>关闭时间: {new Date(bug.closedAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bug 列表</h2>
          <input
            type="text"
            placeholder="搜索 Bug (标题或编号)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredIssues.map((bug) => (
            <a
              key={bug.id}
              href={bug.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-blue-600">#{bug.number} {bug.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    负责人: {bug.assignee} | 标签: {bug.labels.join(', ') || '无'}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">统计</h2>
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.assignee} className="border rounded-lg">
              <button
                onClick={() => toggleExpand(stat.assignee)}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition"
              >
                <span className="font-medium">{stat.assignee}</span>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {stat.count}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedAssignee === stat.assignee ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedAssignee === stat.assignee && (
                <div className="border-t p-4 bg-gray-50 space-y-2">
                  {stat.issues.map((bug: any) => (
                    <a
                      key={bug.id}
                      href={bug.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded hover:shadow transition"
                    >
                      <div className="font-medium text-blue-600">#{bug.number} {bug.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        标签: {bug.labels.join(', ') || '无'}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
