// 测试 GitHub API 连接
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_API = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPO;

const headers = {
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github.v3+json',
};

async function testGitHubAPI() {
  console.log('Testing GitHub API...');
  console.log('Repo:', repo);
  console.log('Token:', token ? `${token.substring(0, 10)}...` : 'NOT SET');
  
  try {
    // 测试 1: 获取仓库信息
    console.log('\n1. Testing repository access...');
    const repoResponse = await axios.get(`${GITHUB_API}/repos/${repo}`, { headers });
    console.log('✓ Repository accessible:', repoResponse.data.full_name);
    console.log('  Open issues:', repoResponse.data.open_issues_count);
    
    // 测试 2: 获取所有 open issues
    console.log('\n2. Testing issues endpoint (all open issues)...');
    const allIssuesResponse = await axios.get(
      `${GITHUB_API}/repos/${repo}/issues`,
      {
        headers,
        params: {
          state: 'open',
          per_page: 10,
        },
      }
    );
    console.log(`✓ Found ${allIssuesResponse.data.length} open issues (showing first 10)`);
    
    // 测试 3: 获取带 bug 标签的 issues
    console.log('\n3. Testing issues with "bug" label...');
    const bugIssuesResponse = await axios.get(
      `${GITHUB_API}/repos/${repo}/issues`,
      {
        headers,
        params: {
          state: 'open',
          labels: 'bug',
          per_page: 10,
        },
      }
    );
    console.log(`✓ Found ${bugIssuesResponse.data.length} issues with "bug" label`);
    
    // 显示前几个 issue 的标签
    if (allIssuesResponse.data.length > 0) {
      console.log('\n4. Sample issue labels:');
      allIssuesResponse.data.slice(0, 3).forEach((issue) => {
        const labels = issue.labels.map((l) => l.name).join(', ');
        console.log(`  #${issue.number}: ${labels || '(no labels)'}`);
      });
    }
    
    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    }
  }
}

testGitHubAPI();
