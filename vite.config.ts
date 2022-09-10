import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path'
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
    server: {
        watch: {
            usePolling: true,
        },
    },

    resolve: {
        alias: {
            $components: resolve('./src/components'),
            $lib: resolve('./src/lib'),
            $utils: resolve('./src/utils'),
            $stores: resolve('./src/stores'),
            $models: resolve('./src/models'),
        },
    },
};

export default config;
