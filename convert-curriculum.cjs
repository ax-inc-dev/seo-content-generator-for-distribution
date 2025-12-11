const fs = require('fs');
const yaml = require('js-yaml');

// YAMLファイルを読み込み、インデント問題を修正してJSONに変換
try {
  // YAMLを文字列として読み込み
  let yamlContent = fs.readFileSync('ax-camp-curriculum-optimized.yaml', 'utf8');
  
  // インデント問題を修正
  // subsections内のインデントを修正
  yamlContent = yamlContent.replace(/^(\s+)subsections:\n(\s+)- title:/gm, 
    (match, indent1, indent2) => {
      return `${indent1}subsections:\n${indent1}  - title:`;
    });
  
  // points:のインデントも修正
  yamlContent = yamlContent.replace(/^(\s+)- title: (.+)\n(\s+)points:/gm,
    (match, indent1, title, indent2) => {
      return `${indent1}- title: ${title}\n${indent1}  points:`;
    });

  // YAMLをパース
  const data = yaml.load(yamlContent);
  
  // JSONとして保存
  fs.writeFileSync('data/ax-camp-curriculum.json', JSON.stringify(data, null, 2));
  
  console.log('✅ YAMLをJSONに変換完了: data/ax-camp-curriculum.json');
  console.log('ファイルサイズ:', (fs.statSync('data/ax-camp-curriculum.json').size / 1024).toFixed(2), 'KB');
  
} catch (error) {
  console.error('エラー:', error.message);
  console.error('詳細:', error);
}
