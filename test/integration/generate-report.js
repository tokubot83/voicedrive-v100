#!/usr/bin/env node

/**
 * テスト結果HTMLレポート生成スクリプト
 */

const fs = require('fs');
const path = require('path');

// 最新の結果ファイルを取得
function getLatestResultFile() {
  const resultsDir = path.join(process.cwd(), 'test', 'results');
  
  if (!fs.existsSync(resultsDir)) {
    return null;
  }
  
  const files = fs.readdirSync(resultsDir)
    .filter(f => f.startsWith('test-results-') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(resultsDir, f),
      mtime: fs.statSync(path.join(resultsDir, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  return files.length > 0 ? files[0].path : null;
}

// HTMLレポート生成
function generateHTMLReport(resultFile) {
  if (!resultFile || !fs.existsSync(resultFile)) {
    console.error('結果ファイルが見つかりません');
    return null;
  }
  
  const results = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
  const successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
  
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>異議申し立て機能 統合テスト結果</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f8f9fa;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .summary-card .number {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .summary-card .label {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .summary-card.passed .number { color: #28a745; }
    .summary-card.failed .number { color: #dc3545; }
    .summary-card.skipped .number { color: #ffc107; }
    .summary-card.total .number { color: #667eea; }
    
    .success-rate {
      padding: 30px;
      text-align: center;
      background: white;
    }
    
    .progress-ring {
      width: 200px;
      height: 200px;
      margin: 0 auto 20px;
    }
    
    .progress-ring circle {
      transition: stroke-dashoffset 0.35s;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }
    
    .test-results {
      padding: 30px;
    }
    
    .test-results h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .test-category {
      margin-bottom: 30px;
    }
    
    .test-category h3 {
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #667eea;
    }
    
    .test-item {
      background: white;
      border-left: 4px solid #e0e0e0;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .test-item:hover {
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }
    
    .test-item.passed {
      border-left-color: #28a745;
    }
    
    .test-item.failed {
      border-left-color: #dc3545;
      background: #fff5f5;
    }
    
    .test-item.skipped {
      border-left-color: #ffc107;
      background: #fffdf5;
    }
    
    .test-item .test-name {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .test-item .test-details {
      color: #666;
      font-size: 0.9em;
    }
    
    .test-item .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: bold;
      text-transform: uppercase;
      margin-left: 10px;
    }
    
    .status-badge.passed {
      background: #d4edda;
      color: #155724;
    }
    
    .status-badge.failed {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status-badge.skipped {
      background: #fff3cd;
      color: #856404;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
    
    .error-details {
      background: #f8f9fa;
      padding: 10px;
      margin-top: 10px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
      color: #dc3545;
    }
    
    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.8em;
      }
      
      .summary {
        grid-template-columns: 1fr 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 異議申し立て機能 統合テスト結果</h1>
      <div class="subtitle">実行日時: ${new Date(results.startTime).toLocaleString('ja-JP')}</div>
    </div>
    
    <div class="summary">
      <div class="summary-card total">
        <div class="number">${results.summary.total}</div>
        <div class="label">総テスト数</div>
      </div>
      <div class="summary-card passed">
        <div class="number">${results.summary.passed}</div>
        <div class="label">成功</div>
      </div>
      <div class="summary-card failed">
        <div class="number">${results.summary.failed}</div>
        <div class="label">失敗</div>
      </div>
      <div class="summary-card skipped">
        <div class="number">${results.summary.skipped}</div>
        <div class="label">スキップ</div>
      </div>
    </div>
    
    <div class="success-rate">
      <svg class="progress-ring" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#e0e0e0"
          stroke-width="20"
        />
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="${successRate >= 80 ? '#28a745' : successRate >= 60 ? '#ffc107' : '#dc3545'}"
          stroke-width="20"
          stroke-dasharray="${2 * Math.PI * 90}"
          stroke-dashoffset="${2 * Math.PI * 90 * (1 - successRate / 100)}"
        />
        <text x="100" y="90" text-anchor="middle" font-size="36" font-weight="bold" fill="#333">
          ${successRate}%
        </text>
        <text x="100" y="120" text-anchor="middle" font-size="16" fill="#666">
          成功率
        </text>
      </svg>
      <div style="font-size: 1.2em; color: #666;">
        実行時間: ${((results.duration || 0) / 1000).toFixed(2)}秒
      </div>
    </div>
    
    <div class="test-results">
      <h2>📊 テスト詳細</h2>
      ${generateTestDetails(results.tests)}
    </div>
    
    <div class="footer">
      <p>VoiceDrive × 医療職員管理システム 統合テスト</p>
      <p>レポート生成: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

// テスト詳細HTML生成
function generateTestDetails(tests) {
  const categories = {};
  
  // カテゴリ別に分類
  tests.forEach(test => {
    const category = test.category || 'その他';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(test);
  });
  
  let html = '';
  
  Object.keys(categories).forEach(category => {
    html += `<div class="test-category">`;
    html += `<h3>${category}</h3>`;
    
    categories[category].forEach(test => {
      html += `<div class="test-item ${test.status}">`;
      html += `<div class="test-name">`;
      html += test.name;
      html += `<span class="status-badge ${test.status}">${
        test.status === 'passed' ? '成功' :
        test.status === 'failed' ? '失敗' :
        test.status === 'skipped' ? 'スキップ' : test.status
      }</span>`;
      html += `</div>`;
      
      if (test.details) {
        html += `<div class="test-details">`;
        
        if (test.details.appealId) {
          html += `申し立てID: ${test.details.appealId}<br>`;
        }
        
        if (test.details.errorCode) {
          html += `エラーコード: ${test.details.errorCode}<br>`;
        }
        
        if (test.details.error) {
          html += `<div class="error-details">${test.details.error}</div>`;
        }
        
        html += `</div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  });
  
  return html;
}

// メイン処理
function main() {
  const resultFile = getLatestResultFile();
  
  if (!resultFile) {
    console.error('テスト結果ファイルが見つかりません');
    console.error('先にテストを実行してください: node test/integration/appeal-integration-test.js');
    process.exit(1);
  }
  
  const html = generateHTMLReport(resultFile);
  
  if (html) {
    console.log(html);
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}