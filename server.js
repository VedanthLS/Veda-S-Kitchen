import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use('/vendor/gmp', express.static(path.join(__dirname, 'node_modules/@googlemaps/js-api-loader/dist')));

app.get('/api/config', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });
});

app.use(express.static(__dirname, {
  extensions: ['html'],
}));

app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).end();
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
