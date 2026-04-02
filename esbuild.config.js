const esbuild = require('esbuild');
const fs = require('fs');

const isWorker = process.argv.includes('--worker');

// ESBuild configuration
const buildOptions = {
  entryPoints: ['game/index.ts'],
  bundle: true,
  outfile: 'public/index.js',
  sourcemap: true,
  target: 'es2024'
};

const workerBuildOptions = {
  entryPoints: ['worker.ts'],
  bundle: true,
  outfile: 'public/worker.js',
  sourcemap: true,
  target: 'es2024'
};

async function build() {
  try {
    if (isWorker) {
      await esbuild.build(workerBuildOptions);
      console.log('esbuild worker build successful');

      fs.copyFileSync('workertest.html', 'public/workertest.html');
      console.log('Copied workertest.html to public/workertest.html');
    } else {
      // Run esbuild
      await esbuild.build(buildOptions);
      console.log('esbuild build successful');

      // Copy index.html to public directory
      fs.copyFileSync('index.html', 'public/index.html');
      console.log('Copied index.html to public/index.html');
    }

    console.log('Build finished');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
