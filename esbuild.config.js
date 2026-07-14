const esbuild = require('esbuild');
const fs = require('fs');

const isWorker = process.argv.includes('--worker');

// ESBuild configuration
const buildOptions = {
  entryPoints: [
    { in: 'game/index.ts', out: 'index' },
    { in: 'characterEditor/core/characterEditor.ts', out: 'characterEditor' }
  ],
  bundle: true,
  outdir: 'public',
  sourcemap: true,
  target: 'es2024',
  format: 'esm'
};

const workerBuildOptions = {
  entryPoints: [
    { in: 'game/workers/local-worker.ts', out: 'local-worker' }
  ],
  bundle: true,
  outdir: 'public',
  sourcemap: true,
  target: 'es2024',
  format: 'esm'
};

async function build() {
  try {
    if (isWorker) {
      await esbuild.build(workerBuildOptions);
      console.log('esbuild worker build successful');
    } else {
      // Run esbuild
      await esbuild.build(buildOptions);
      console.log('esbuild build successful');

      // Copy HTML files to public directory
      fs.copyFileSync('index.html', 'public/index.html');
      console.log('Copied index.html to public/index.html');
      if (fs.existsSync('characterEditor.html')) {
        fs.copyFileSync('characterEditor.html', 'public/characterEditor.html');
        console.log('Copied characterEditor.html to public/');
      }
      if (fs.existsSync('editor.css')) {
        fs.copyFileSync('editor.css', 'public/editor.css');
        console.log('Copied editor.css to public/');
      }
    }

    console.log('Build finished');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
