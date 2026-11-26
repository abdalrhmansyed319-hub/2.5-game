import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

interface RepoAssetEntry {
  id: string;
  label: string;
  category: 'character' | 'training' | 'reference';
  relPath: string;
  format: 'source_json' | 'png' | 'jpg';
  dimensions: string;
}

const CURATED_REPO_ASSETS: RepoAssetEntry[] = [
  {
    id: 'mara_v2_source',
    label: 'Dr. Mara Lin v2 (128x128 - 23 Layers)',
    category: 'character',
    relPath: 'game/assets/characters/player/mara_lin_concept_128x128_v2.source.json',
    format: 'source_json',
    dimensions: '128x128',
  },
  {
    id: 'mara_v1_source',
    label: 'Dr. Mara Lin v1 (128x128 - 22 Layers)',
    category: 'character',
    relPath: 'game/assets/characters/player/mara_lin_concept_128x128.source.json',
    format: 'source_json',
    dimensions: '128x128',
  },
  {
    id: 'practice_a',
    label: 'Practice A: Weathered Metal Canister (48x48)',
    category: 'training',
    relPath: 'game/assets/art_tests/pixel_art_training/practice_a_weathered_metal_canister.source.json',
    format: 'source_json',
    dimensions: '48x48',
  },
  {
    id: 'practice_b',
    label: 'Practice B: Orange Suit Fabric (48x48)',
    category: 'training',
    relPath: 'game/assets/art_tests/pixel_art_training/practice_b_orange_suit_fabric.source.json',
    format: 'source_json',
    dimensions: '48x48',
  },
  {
    id: 'practice_c',
    label: 'Practice C: Glass Helmet Visor (48x48)',
    category: 'training',
    relPath: 'game/assets/art_tests/pixel_art_training/practice_c_glass_helmet_visor.source.json',
    format: 'source_json',
    dimensions: '48x48',
  },
  {
    id: 'practice_d',
    label: 'Practice D: Organic Moss Relic (48x48)',
    category: 'training',
    relPath: 'game/assets/art_tests/pixel_art_training/practice_d_organic_moss_relic.source.json',
    format: 'source_json',
    dimensions: '48x48',
  },
  {
    id: 'practice_e',
    label: 'Practice E: Miniature Astronaut (64x64)',
    category: 'training',
    relPath: 'game/assets/art_tests/pixel_art_training/practice_e_miniature_astronaut_study.source.json',
    format: 'source_json',
    dimensions: '64x64',
  },
  {
    id: 'ref_mara_v2_png',
    label: 'Dr. Mara Lin v2 PNG (Reference)',
    category: 'reference',
    relPath: 'game/assets/characters/player/mara_lin_concept_128x128_v2.png',
    format: 'png',
    dimensions: '128x128',
  },
  {
    id: 'ref_comparison_png',
    label: 'Mara Lin v1 vs v2 Comparison Sheet',
    category: 'reference',
    relPath: 'docs/art-direction/mara_lin_v1_vs_v2_comparison.png',
    format: 'png',
    dimensions: '1072x1450',
  },
];

function verdantRepoBridgePlugin(): Plugin {
  return {
    name: 'verdant-repo-bridge',
    configureServer(server) {
      server.middlewares.use('/api/repo-assets', (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (url.pathname === '/' || url.pathname === '') {
          const available = CURATED_REPO_ASSETS.filter((item) =>
            fs.existsSync(path.join(REPO_ROOT, item.relPath))
          );
          // Also expose the primary environmental reference if present in tmp uploads
          const envRefPath = '/tmp/arena-coding-uploads/IMG_20261126_155715.jpg';
          const items = [...available];
          if (fs.existsSync(envRefPath)) {
            items.unshift({
              id: 'env_reference_oura',
              label: 'VERDANT SIGNAL Environmental Style Reference',
              category: 'reference',
              relPath: envRefPath,
              format: 'jpg',
              dimensions: '1080x833',
            });
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ assets: items }));
          return;
        }

        const assetId = decodeURIComponent(url.pathname.replace(/^\//, ''));
        if (assetId === 'env_reference_oura') {
          const envRefPath = '/tmp/arena-coding-uploads/IMG_20261126_155715.jpg';
          if (!fs.existsSync(envRefPath)) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }
          res.setHeader('Content-Type', 'image/jpeg');
          fs.createReadStream(envRefPath).pipe(res);
          return;
        }

        const match = CURATED_REPO_ASSETS.find((a) => a.id === assetId);
        if (!match) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Unknown asset id' }));
          return;
        }
        const fullPath = path.join(REPO_ROOT, match.relPath);
        if (!fs.existsSync(fullPath)) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Asset not found on disk' }));
          return;
        }
        const mime =
          match.format === 'source_json'
            ? 'application/json'
            : match.format === 'png'
              ? 'image/png'
              : 'image/jpeg';
        res.setHeader('Content-Type', mime);
        fs.createReadStream(fullPath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), verdantRepoBridgePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
});
