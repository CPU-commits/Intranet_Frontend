<script lang="ts">
	import { UserTypes } from '$models/users/user_type.model'

	export let url: string
	export let user_type: string
</script>

<menu class="AdminMenu">
	<ul>
		{#if user_type !== UserTypes.LIBRARIAN}
			{#if user_type === UserTypes.DIRECTOR}
				<a sveltekit:prefetch href="/admin/colegio">
					<li class:Selected={url === '/admin/colegio'}>
						<i class="fa-solid fa-building-columns" /> Colegio
					</li>
				</a>
			{/if}
			<a sveltekit:prefetch href="/admin/estudiantes">
				<li class:Selected={url.startsWith('/admin/estudiantes')}>
					<i class="fa-solid fa-graduation-cap" /> Estudiantes
				</li>
			</a>
			<a sveltekit:prefetch href="/admin/profesores">
				<li
					class:Selected={url === '/admin/profesores' ||
						url === '/admin/profesores/masivo'}
				>
					<i class="fa-solid fa-chalkboard-user" /> Profesores
				</li>
			</a>
			{#if user_type === UserTypes.DIRECTOR}
				<a sveltekit:prefetch href="/admin/directivos">
					<li
						class:Selected={url === '/admin/directivos' ||
							url === '/admin/directivos/masivo'}
					>
						<i class="fa-solid fa-user-tie" /> Directivos
					</li>
				</a>
			{/if}
			<a sveltekit:prefetch href="/admin/cursos">
				<li class:Selected={url === '/admin/cursos' || url.startsWith('/admin/secciones')}>
					<i class="fa-solid fa-layer-group" /> Cursos
				</li>
			</a>
			<a sveltekit:prefetch href="/admin/materias">
				<li class:Selected={url === '/admin/materias'}>
					<i class="fa-solid fa-book-bookmark" /> Materias
				</li>
			</a>
			<a sveltekit:prefetch href="/admin/semestres">
				<li class:Selected={url === '/admin/semestres'}>
					<i class="fa-solid fa-calendar-days" /> Semestres
				</li>
			</a>
			<a sveltekit:prefetch href="/admin/aula_virtual">
				<li class:Selected={url.startsWith('/admin/aula_virtual')}>
					<i class="fa-solid fa-chalkboard" /> Aula Virtual
				</li>
			</a>
		{/if}
		<a sveltekit:prefetch href="/admin/biblioteca">
			<li class:Selected={url.startsWith('/admin/biblioteca')}>
				<i class="fa-solid fa-book-bookmark" /> Biblioteca
			</li>
		</a>
		{#if user_type !== UserTypes.LIBRARIAN}
			<a sveltekit:prefetch href="/admin/">
				<li>
					<i class="fa-solid fa-bezier-curve" /> Mapa
				</li>
			</a>
			<a sveltekit:prefetch href="/admin/historico">
				<li class:Selected={url === '/admin/historico'}>
					<i class="fa-solid fa-clock-rotate-left" /> Historico
				</li>
			</a>
		{/if}
	</ul>
</menu>

<style>
	.AdminMenu {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.AdminMenu ul {
		list-style: none;
		width: max-content;
		padding: 0px 10px;
	}

	li {
		padding: 15px 20px;
		transition: all 0.4s ease;
		z-index: 9;
	}

	i {
		transition: all 0.4s ease;
	}

	li:hover,
	li:hover i {
		color: var(--color-main);
	}

	a {
		color: white;
		text-decoration: none;
	}

	.Selected,
	.Selected i {
		color: var(--color-main);
	}

	.Selected {
		border-left: 2px solid var(--color-main);
	}
</style>
