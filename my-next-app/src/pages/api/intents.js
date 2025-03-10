import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'intent_mapping.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Convert keys to patterns and prepare for matching
  const patternData = {};
  Object.keys(data).forEach((key) => {
    const pattern = key.toLowerCase().replace(/\{([^}]+)\}/g, '([\\w.]+)');
    patternData[pattern] = {
      template: data[key],
      params: (key.match(/\{([^}]+)\}/g) || []).map(p => p.slice(1, -1))
    };
  });

  res.status(200).json(patternData);
}
