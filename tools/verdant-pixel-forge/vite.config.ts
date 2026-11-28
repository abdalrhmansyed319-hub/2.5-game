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
  format: 'source_json' | 'vpf_json' | 'png' | 'jpg';
  dimensions: string;
}

const CURATED_REPO_ASSETS: RepoAssetEntry[] = [
  {
    id: 'ast001_final_vpf',
    label: '★ FINAL AST-001: Dr. Mara Lin Production Sheet (96x384 · 64 Frames · 8 Layers)',
    category: 'character',
    relPath: 'game/assets/_vpf_sources/ast001_char_mara_lin_sheet.vpf.json',
    format: 'vpf_json',
    dimensions: '96x384 (16x24 cells)',
  },
  {
    id: 'ast002_final_vpf',
    label: '★ FINAL AST-002: Amber Coast Ground Tileset (192x128 · 5 Layers)',
    category: 'reference',
    relPath: 'game/assets/_vpf_sources/ast002_env_amber_coast_ground_tileset.vpf.json',
    format: 'vpf_json',
    dimensions: '192x128 (16x16 tiles)',
  },
  {
    id: 'ast003_final_vpf',
    label: '★ FINAL AST-003: Singing Canopy Ground Tileset (192x96 · 5 Layers)',
    category: 'reference',
    relPath: 'game/assets/_vpf_sources/ast003_env_singing_canopy_ground_tileset.vpf.json',
    format: 'vpf_json',
    dimensions: '192x96 (16x16 tiles)',
  },
  {
    id: 'ast004_final_vpf',
    label: '★ FINAL AST-004: Singing Reedwood Tree Split-Canopy (96x160 · 5 Layers)',
    category: 'reference',
    relPath: 'game/assets/_vpf_sources/ast004_prop_singing_reedwood_tree_sheet.vpf.json',
    format: 'vpf_json',
    dimensions: '96x160 (48x80 cells)',
  },
  {
    id: 'ast005_final_vpf',
    label: '★ FINAL AST-005: Rimlands Starter Flora Sheet (64x128 · 3 Layers)',
    category: 'reference',
    relPath: 'game/assets/_vpf_sources/ast005_prop_rimlands_flora_sheet.vpf.json',
    format: 'vpf_json',
    dimensions: '64x128 (16x32 cells)',
  },
  {
    id: 'ast006_final_vpf',
    label: '★ FINAL AST-006: Crashed Drop-Pod & Camp Landmark Atlas (96x64 · 4 Layers)',
    category: 'reference',
    relPath: 'game/assets/_vpf_sources/ast006_prop_drop_pod_landmark_sheet.vpf.json',
    format: 'vpf_json',
    dimensions: '96x64 atlas',
  },
  {
    id: 'ast007_final_vpf',
    label: '★ FINAL AST-007: Contact Shadows, Water Ripples & Lens VFX (128x96 · 3 Layers)',
    category: 'reference',
    relPath: 'game/assets/_vpf_sources/ast007_fx_shadows_ripples_lens_sheet.vpf.json',
    format: 'vpf_json',
    dimensions: '128x96 (32x32 cells)',
  },
  {
    id: 'ast001_proto_48x64',
    label: 'AST-001 Feasibility Study: Dr. Mara Lin 48x64 (13 Layers · Recommended)',
    category: 'character',
    relPath: 'game/assets/characters/player/feasibility_study/mara_lin_proto_48x64.vpf.json',
    format: 'vpf_json',
    dimensions: '48x64',
  },
  {
    id: 'ast001_proto_32x48',
    label: 'AST-001 Feasibility Study: Dr. Mara Lin 32x48 (13 Layers)',
    category: 'character',
    relPath: 'game/assets/characters/player/feasibility_study/mara_lin_proto_32x48.vpf.json',
    format: 'vpf_json',
    dimensions: '32x48',
  },
  {
    id: 'ast001_proto_64x80',
    label: 'AST-001 Feasibility Study: Dr. Mara Lin 64x80 (13 Layers)',
    category: 'character',
    relPath: 'game/assets/characters/player/feasibility_study/mara_lin_proto_64x80.vpf.json',
    format: 'vpf_json',
    dimensions: '64x80',
  },
  {
    id: 'ast001_mara_vpf',
    label: 'AST-001: Dr. Mara Lin 16x24 (Rejected Reference · 64 Frames · 8 Layers)',
    category: 'character',
    relPath: 'game/assets/characters/player/candidates/ast001_char_mara_lin_candidate.vpf.json',
    format: 'vpf_json',
    dimensions: '16x24 (96x384 sheet)',
  },
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
    id: 'ref_feasibility_comparison_png',
    label: 'AST-001 Resolution Comparison (16x24 vs 32x48 vs 48x64 vs 64x80)',
    category: 'reference',
    relPath: 'game/assets/characters/player/feasibility_study/previews/ast001_resolution_comparison_1x_and_4x.png',
    format: 'png',
    dimensions: '844x560',
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
          match.format === 'source_json' || match.format === 'vpf_json'
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
