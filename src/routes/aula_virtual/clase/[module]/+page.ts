export function load({ url }) {
    const section = url.searchParams.get('section') ? url.searchParams.get('section') : 0
    return {
        section,
    }
}
