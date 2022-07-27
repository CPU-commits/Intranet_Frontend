<div class="Container">
	<section class="Form">
		<slot />
	</section>
	<aside class="Questions">
		<slot name="questions" />
	</aside>
</div>

<style>
	.Container {
		display: grid;
		grid-template-columns: 5fr 1fr;
		margin: 20px;
		gap: 15px;
		height: fit-content;
	}

	.Form {
		background-color: white;
		padding: 15px;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
	}
</style>
