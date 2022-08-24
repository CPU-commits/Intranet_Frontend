<script lang="ts">
	import type { ClassroomModules } from '$models/classroom/modules'
	import { UserTypes } from '$models/users/user_type.model'
	import { formatMiniDate } from '$utils/format'

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
		<br />
		{#if moduleData.works && moduleData.works.length > 0}
			{#each moduleData.works as work}
				<a href="/aula_virtual/clase/{moduleData._id}/trabajos/{work._id}">
					<article class="Work">
						<h5>
							{@html work.type === 'form'
								? '<i class="fa-solid fa-clipboard"></i>'
								: '<i class="fa-solid fa-file-arrow-up"></i>'}
							{work.title}
						</h5>
						<small>
							{@html work.is_qualified
								? '<i title="Calificado" style="color:var(--color-main)" class="fa-solid fa-certificate"></i>'
								: ''}
							{formatMiniDate(work.date_limit)}
						</small>
					</article>
				</a>
			{/each}
		{:else}
			<small><i class="fa-solid fa-campground" /> Sin pr&oacute;ximas entregas...</small>
		{/if}
	</div>
	<footer>
		<!--<i class="fa-solid fa-chart-line" />-->
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

	.Work {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 5px;
		margin-top: 5px;
	}

	a:hover h5 {
		color: var(--color-main);
	}

	h5 {
		transition: all 0.4s;
	}

	.Work small {
		font-size: 0.75rem;
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
