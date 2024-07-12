import fs from 'fs';
import path from 'path';

// next.js export
// ts-unused-exports:disable-next-line
export default async function handler(req, res) {
  const hostname = req.headers['original-hostname'] || req.hostname;
  if (hostname !== 'qpayee.com') {
    res.setHeader('Content-Type', 'text/plain');
    res.send('User-agent: *\nDisallow: /');
  } else {
    const filePath = path.join(process.cwd(), 'public/robots-production.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  }
}
