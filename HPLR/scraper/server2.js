import { createServer } from 'http';
import { getSearchResults } from './search.js';
import fs from 'node:fs';

const server = createServer(async (req, res) => {
  if (req.url.startsWith('/search')) {
    const query = new URL(req.url, 'http://localhost').searchParams.get('query') || '';
    try {
      console.log({ query });
      const results = await getSearchResults(query);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ items: results }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Ошибка при получении данных' }));
    }
  } else {
    const stream = fs.createReadStream('index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    stream.pipe(res);
  }
});

server.listen(3300, () => {
  console.log('Server started at http://localhost:3300');
});