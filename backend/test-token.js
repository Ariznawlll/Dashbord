import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env 文件
dotenv.config({ path: resolve(__dirname, '.env') });

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPO;

console.log('Testing GitHub API authentication...\n');
console.log('Token:', token ? `${token.substring(0, 10)}...` : 'NOT SET');
console.log('Repo:', repo);
console.log('');

async function testToken() {
  try {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('');

    // 测试 API 调用
    const response = await axios.get('https://api.github.com/rate_limit', {
      headers,
    });

    console.log('✓ Authentication successful!\n');
    console.log('Rate Limit Info:');
    console.log('  Core API:');
    console.log('    Limit:', response.data.resources.core.limit);
    console.log('    Remaining:', response.data.resources.core.remaining);
    console.log('    Reset:', new Date(response.data.resources.core.reset * 1000).toLocaleString());
    console.log('');

    // 测试获取仓库信息
    const repoResponse = await axios.get(`https://api.github.com/repos/${repo}`, {
      headers,
    });

    console.log('✓ Repository access successful!');
    console.log('  Name:', repoResponse.data.full_name);
    console.log('  Stars:', repoResponse.data.stargazers_count);
    console.log('  Open Issues:', repoResponse.data.open_issues_count);

  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
  }
}

testToken();
