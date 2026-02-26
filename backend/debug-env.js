import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables:');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'SET' : 'NOT SET');
console.log('GITHUB_REPO:', process.env.GITHUB_REPO);
console.log('PORT:', process.env.PORT);
