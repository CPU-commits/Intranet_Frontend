<script lang="ts">
	import type { ClassroomModules } from '$models/classroom/modules'
	import { UserTypes } from '$models/users/user_type.model'

	export let moduleData: ClassroomModules
	export let user_type: string
</script>

<article class="Module">
	<a href="/aula_virtual/clase/{moduleData._id}">
		<header>
			<img src={moduleData.section.file.url} alt={moduleData.section.section} />
			<h3>
				{moduleData.subject.subject}
				{#if user_type === UserTypes.TEACHER}
					- {moduleData.section.course.course}
					{moduleData.section.section}
				{/if}
			</h3>
		</header>
	</a>
	<div class="Module__work">
		<span>Pr&oacute;ximas entregas</span>
	</div>
	<footer>
		<i class="fa-solid fa-chart-line" />
	</footer>
</article>

<style lang="scss">
	.Module {
		box-shadow: var(--box-shadow);
		transition: all 0.4s;
		border-radius: 6px;
		border: 2px solid var(--color-light);
		position: relative;
	}

	.Module:hover {
		box-shadow: none;
	}

	header {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1rem;
		position: relative;
		img {
			width: 100%;
			border-top-left-radius: 5px;
			border-top-right-radius: 5px;
			height: 120px;
			object-fit: cover;
			filter: brightness(0.5);
		}
		h3 {
			position: absolute;
			color: white;
			text-align: center;
		}
	}

	.Module__work {
		padding: 10px;
		span {
			color: var(--color-main);
			font-size: 0.8rem;
		}
		height: 100px;
	}

	footer {
		position: absolute;
		right: 10px;
		bottom: 10px;
	}

	a {
		text-decoration: none;
	}
</style>
