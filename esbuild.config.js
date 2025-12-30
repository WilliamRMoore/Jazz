const esbuild = require('esbuild');
const fs = require('fs');

// ESBuild configuration
const buildOptions = {
  entryPoints: ['game/index.ts'],
  bundle: true,
  outfile: 'public/index.js',
  sourcemap: true,
};

async function build() {
  try {
    // Run esbuild
    await esbuild.build(buildOptions);
    console.log('esbuild build successful');

    // Copy index.html to public directory
    fs.copyFileSync('index.html', 'public/index.html');
    console.log('Copied index.html to public/index.html');

    console.log('Build finished');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
