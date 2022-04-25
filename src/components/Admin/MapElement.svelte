<script lang="ts">
	import type { Section } from '$models/admin/courses.model'

	export let course: string
	export let grade: number
	export let sections: Section[]
</script>

<article>
	<span
		>{course} ({grade}°) [{#each sections as section, i}{section.section}{#if i !== sections.length - 1},{/if}{/each}]</span
	>
</article>

<style lang="scss">
	article {
		width: 300px;
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--color-main);
		padding: 10px;
		border-radius: 20px;
		span {
			color: white;
		}
	}
</style>
