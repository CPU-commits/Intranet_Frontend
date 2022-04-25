<script lang="ts">
	export let onClose

	import { onDestroy, onMount } from 'svelte/internal'

	let scroll = 0
	let content: HTMLElement

	onMount(() => {
		document.body.classList.add('Modal__open')
		var B = document.body
		var D = document.documentElement
		D = D.clientHeight ? D : B
		scroll = D.scrollTop
	})

	onDestroy(() => {
		document.body.classList.remove('Modal__open')
	})

	const closeModal = (e) => {
		if (!content.contains(e.target) && onClose) onClose()
	}
</script>

<aside on:click={(e) => closeModal(e)} class="Modal" style="top: {scroll}px">
	<div bind:this={content} class="Modal__container">
		<section>
			<header class="Modal__header">
				<slot name="title" />
				<i on:click={onClose} class="fa-solid fa-xmark" />
			</header>
			<section class="Modal__content">
				<slot />
			</section>
		</section>
	</div>
</aside>

<style>
	.Modal {
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		justify-content: center;
		left: 0;
		align-items: center;
	}

	.Modal__container {
		background-color: white;
		max-height: 80%;
		position: absolute;
		top: 30px;
		overflow-y: auto;
		overflow-x: hidden;
		width: 60%;
		border-radius: 4px;
		animation: modal 0.4s;
	}

	.Modal__header {
		padding: 20px;
		display: flex;
		justify-content: center;
	}

	.Modal__header i {
		position: absolute;
		right: 20px;
		top: 20px;
		font-size: 1.1rem;
		cursor: pointer;
	}

	.Modal__content {
		display: flex;
		width: 100%;
		flex-direction: column;
		padding: 30px;
		box-sizing: border-box;
	}

	@keyframes modal {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@media (max-width: 500px) {
		.Modal__container {
			width: 90%;
		}
	}

	@media (min-width: 500px) and (max-width: 575.98px) {
		.Modal__container {
			width: 80%;
		}
	}

	@media (min-width: 575.98px) and (max-width: 750px) {
		.Modal__container {
			width: 80%;
		}
	}
</style>
