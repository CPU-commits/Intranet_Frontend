/** @type {import('./$types').PageLoad} */
export function load({ url }) {
	const redirect = url.searchParams.get('redirect')
	return {
		redirect: redirect ? redirect : null,
	}
}
