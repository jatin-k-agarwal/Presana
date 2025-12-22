// This file replaces all hardcoded localhost URLs with production URLs
// Run this script then delete it

import fs from 'fs';
import path from 'path';

const files = [
  'src/components/EditProfileModal.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/HistoryPage.jsx',
  'src/pages/SearchUsers.jsx'
];

const API_URL = 'https://presana-backend.onrender.com';
const SOCKET_URL = 'https://presana-backend.onrender.com';

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace localhost URLs
  content = content.replace(/http:\/\/localhost:5000/g, '${API_URL}');
  content = content.replace(/"http:\/\/localhost:5000"/g, '`${API_URL}`');
  
  // Add import if not exists
  if (!content.includes('from "../config"') && !content.includes('from "../../config"')) {
    const importLine = 'import { API_URL, SOCKET_URL } from "../config";\n';
    content = content.replace(/(import.*from.*\n)+/, match => match + importLine);
  }
  
  fs.writeFileSync(file Path, content);
  console.log(`Updated: ${file}`);
});

console.log('All files updated!');
