<script lang="ts">
	export let url: string
</script>

<menu class="AdminMenu">
	<ul>
		<a href="/admin/estudiantes">
			<li class:Selected={url === '/admin/estudiantes'}>
				<i class="fa-solid fa-graduation-cap" /> Estudiantes
			</li>
		</a>
		<a href="/admin/profesores">
			<li class:Selected={url === '/admin/profesores'}>
				<i class="fa-solid fa-chalkboard-user" /> Profesores
			</li>
		</a>
		<a href="/admin/directivos">
			<li class:Selected={url === '/admin/directivos'}>
				<i class="fa-solid fa-user-tie" /> Directivos
			</li>
		</a>
		<a href="/admin/historico">
			<li class:Selected={url === '/admin/historico'}>
				<i class="fa-solid fa-clock-rotate-left" /> Historico
			</li>
		</a>
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
