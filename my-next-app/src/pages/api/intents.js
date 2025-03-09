import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'intent_mapping.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Convert keys to lowercase for case-insensitive lookup
  const lowerCaseData = {};
  Object.keys(data).forEach((key) => {
    lowerCaseData[key.toLowerCase()] = data[key];
  });

  res.status(200).json(lowerCaseData);
}
