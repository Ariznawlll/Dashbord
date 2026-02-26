import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

// 读取性能监控链接配置
export function getPerformanceMonitors() {
  try {
    const monitorsEnv = process.env.PERFORMANCE_MONITORS;
    if (!monitorsEnv) {
      console.log('No PERFORMANCE_MONITORS configured');
      return [];
    }
    
    const monitors = JSON.parse(monitorsEnv);
    console.log('Loaded performance monitors:', monitors.length, 'categories');
    return monitors;
  } catch (error) {
    console.error('Error parsing PERFORMANCE_MONITORS:', error);
    return [];
  }
}
