<script lang="ts">
	import { UserTypes } from '$models/users/user_type.model'
	import AIcon from '../HTML/AIcon.svelte'

	export let url: string
	export let user_type: string
</script>

<section class="User">
	<section class="Menu">
		<ul>
			<li>
				<AIcon
					active={url === '/usuario'}
					href={'/usuario'}
					classItem={'fa-solid fa-address-card'}
				/>
			</li>
			{#if user_type !== UserTypes.STUDENT && user_type !== UserTypes.ATTORNEY}
				<li>
					<AIcon
						href={'/usuario/archivos'}
						classItem={'fa-solid fa-cloud'}
						active={url === '/usuario/archivos'}
					/>
				</li>
			{/if}
			{#if user_type === UserTypes.STUDENT || user_type === UserTypes.STUDENT_DIRECTIVE || user_type === UserTypes.ATTORNEY}
				<li>
					<AIcon
						href={'/usuario/calificaciones'}
						classItem={'fa-solid fa-ranking-star'}
						active={url === '/usuario/calificaciones'}
					/>
				</li>
			{/if}
		</ul>
	</section>
	<section class="Content">
		<slot name="title" />
		<br />
		<slot />
	</section>
</section>

<style>
	.User {
		display: flex;
		flex-direction: column;
		margin: 20px;
		box-sizing: border-box;
	}

	.Menu ul {
		display: flex;
		list-style: none;
		gap: 50px;
		width: 100%;
		justify-content: center;
		padding: 10px;
		box-sizing: border-box;
	}

	.Content {
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
	}
</style>
