import { useState, useEffect } from 'react';
import BugOverview from './components/BugOverview';
import LokiMonitor from './components/LokiMonitor';
import PerformanceMonitor from './components/PerformanceMonitor';

function App() {
  const [activeTab, setActiveTab] = useState('bugs');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">测试监控</h1>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('bugs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bugs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bug 监控
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              日志监控
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              性能监控
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'bugs' && <BugOverview />}
        {activeTab === 'logs' && <LokiMonitor />}
        {activeTab === 'performance' && <PerformanceMonitor />}
      </main>
    </div>
  );
}

export default App;
