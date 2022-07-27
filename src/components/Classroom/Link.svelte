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
	export let minimalist = false
</script>

{#if !minimalist}
	<article class="Link">
		<a class="LinkA" href={link.link} target="_blank" rel="noopener noreferrer">
			<header>
				<i class="fa-solid fa-link" />
			</header>
			<div class="Link__content">
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
{:else}
	<a href={link.link} target="_blank" rel="noopener noreferrer">
		<article class="LinkMin">
			<span>┈</span>
			<i class="fa-solid fa-link" />
			<h4>{link.title}</h4>
		</article>
	</a>
{/if}

<style>
	.LinkA {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	a {
		text-decoration: none;
		width: fit-content;
	}

	.Link {
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

	.Link__content {
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

	.LinkMin {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		width: fit-content;
	}

	.LinkMin i {
		font-size: 1rem;
	}

	.LinkMin:hover h4 {
		color: var(--color-main);
	}

	.LinkMin h4 {
		transition: all 0.4s;
	}
</style>
