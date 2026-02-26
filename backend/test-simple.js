import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const repo = process.env.GITHUB_REPO || 'matrixorigin/matrixone';
const url = `https://api.github.com/repos/${repo}/issues?state=open&per_page=10`;

console.log('Testing URL:', url);
console.log('Repo:', repo);

axios.get(url, {
  headers: {
    'Accept': 'application/vnd.github.v3+json',
  }
})
.then(response => {
  console.log(`✓ Success! Found ${response.data.length} issues`);
  if (response.data.length > 0) {
    console.log('\nFirst issue:');
    console.log(`  #${response.data[0].number}: ${response.data[0].title}`);
    console.log(`  Labels: ${response.data[0].labels.map(l => l.name).join(', ')}`);
  }
})
.catch(error => {
  console.error('✗ Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  }
});
