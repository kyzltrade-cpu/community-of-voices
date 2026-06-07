const fs = require('fs');
const path = require('path');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_NAME = 'goask-ngo';

const dir = '/home/kyzl/goask-ngo-web';
const fileNames = ['index.html', 'robots.txt', 'sitemap.xml', 'vercel.json', 'analytics-dashboard.html', 'analytics-dashboard.png', 'google-analytics.html', 'google-analytics.png'];

async function deploy() {
  try {
    console.log('Reading files from', dir);
    const files = fileNames.map((fileName) => {
      const filePath = path.join(dir, fileName);
      const content = fs.readFileSync(filePath);
      return {
        file: fileName,
        data: content.toString('base64'),
        encoding: 'base64'
      };
    });

    console.log('Sending deployment request to Vercel API...');
    const body = {
      name: PROJECT_NAME,
      target: 'preview',
      files: files,
      projectSettings: {
        framework: null
      }
    };

    const resp = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Deployment failed:', data);
      process.exit(1);
    }

    console.log('=== Deployment Initiated Successfully ===');
    console.log('ID:', data.id);
    console.log('URL:', `https://${data.url}`);
    console.log('Inspection URL:', `https://vercel.com/deployments/${data.id}`);
    console.log('State:', data.readyState || data.status);
    
    if (data.alias && data.alias.length) {
      console.log('Aliases:', data.alias.map(a => `https://${a}`).join(', '));
    }
  } catch (err) {
    console.error('Error running deployment:', err);
    process.exit(1);
  }
}

deploy();