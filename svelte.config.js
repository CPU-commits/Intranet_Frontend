import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import { resolve } from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess(),
	],

	kit: {
		adapter: adapter(),
		vite: {
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
		},
	},
}

export default config
