import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({   
    resolve: {
        alias: {
            '@common': path.resolve(__dirname, './src/shared/common'),
            '@hooks': path.resolve(__dirname, './src/shared/hooks'),
            '@lib': path.resolve(__dirname, './src/shared/lib'),
            '@nbn-hooks': path.resolve(__dirname, './src/shared/hooks/nbn-atlas-api'),
        },
    },
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, 'src/components/index.ts'),
            name: 'nbnReactComponents',
            formats: ['es', 'umd'],
            fileName: (format) => `nbnReactComponents.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }
});
