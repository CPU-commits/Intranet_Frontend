<script lang="ts">
	import type { Work } from '$models/classroom/work.model'
	import { formatDate, timeAgo } from '$utils/format'

	export let work: Work
</script>

<a href="trabajos/{work._id}">
	<article class="Work">
		<header>
			<h3>
				{@html work.type === 'form'
					? '<i class="fa-solid fa-clipboard"></i>'
					: '<i class="fa-solid fa-file-arrow-up"></i>'}
				{work.title}
			</h3>
			{#if work.is_qualified}
				<div class="Grade">
					<small
						><i class="fa-solid fa-certificate" /> Calificado ({work.grade.number}° -
						{work.grade.percentage}%)
					</small>
					{#if work.grade.is_acumulative}
						<small>
							Calificación acumulativa {work.grade.acumulative[0].number}° -
							{work.grade.acumulative[0].percentage}%
						</small>
					{/if}
				</div>
			{/if}
		</header>
		<section class="Work__body">
			{#if work.is_revised}
				<small class="Revised"
					><i class="fa-solid fa-circle-check" /> Trabajo revisado</small
				>
			{/if}
			{#if new Date() < new Date(work.date_start)}
				<p>Fecha apertura trabajo: {formatDate(work.date_start)}</p>
			{/if}
			<span>Fecha cierre trabajo: {formatDate(work.date_limit)}</span>
		</section>
		<footer>
			<small>Publicado por <span>{work.author.name} {work.author.first_lastname}</span></small
			>
			<small
				>{timeAgo(work.date_upload)}
				{#if work.date_upload !== work.date_update}(editado){/if}</small
			>
		</footer>
	</article>
</a>

<style>
	a {
		text-decoration: none;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	.Work {
		padding: 15px;
		border-bottom: 1px solid var(--color-light);
	}

	header {
		display: flex;
		justify-content: space-between;
	}

	h3 {
		transition: all 0.4s;
	}

	.Grade {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.Work__body {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	i {
		color: var(--color-main);
	}

	footer {
		display: flex;
		margin-top: 15px;
		justify-content: space-between;
	}

	footer small span {
		color: var(--color-main);
	}

	.Revised {
		width: 100%;
		color: var(--color-main);
		font-weight: bold;
	}
</style>
