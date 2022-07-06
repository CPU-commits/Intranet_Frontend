<script lang="ts">
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'

	type Link = {
		title: string
		link: string
	}

	type DeleteMe = (index: number) => void

	export let link: Link
	export let edit: boolean = false
	export let deleteMe: DeleteMe = null
</script>

<article class="File">
	<a href={link.link} target="_blank" rel="noopener noreferrer">
		<header>
			<i class="fa-solid fa-link" />
		</header>
		<div class="File__content">
			<h3>{link.title}</h3>
			<small>{link.link}</small>
		</div>
	</a>
	{#if edit}
		<aside>
			<ButtonIcon clickFunction={deleteMe} classItem={'fa-solid fa-xmark'} />
		</aside>
	{/if}
</article>

<style>
	a {
		text-decoration: none;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.File {
		cursor: pointer;
		width: 100%;
		max-width: 500px;
		border: 2px solid var(--color-light);
		border-radius: 5px;
		position: relative;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	header {
		padding: 14px;
		border-right: 2px solid var(--color-light);
	}

	h3 {
		transition: all 0.4s ease;
	}

	i {
		color: var(--color-main);
		font-size: 1.2rem;
	}

	.File__content {
		display: flex;
		flex-direction: column;
		padding: 10px;
		width: 100%;
	}

	aside {
		position: absolute;
		right: 10px;
		top: 20px;
	}
</style>
