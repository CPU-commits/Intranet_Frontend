<script lang="ts">
	import { timeAgo } from '$utils/format'

	import type { NotificationType } from '$models/notifications/notification.type'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'

	export let notification: NotificationType
	export let toogleMenu: any
	export let token: string
	// Notification
	let element: HTMLElement

	async function deleteNotification() {
		try {
			element.parentNode.removeChild(element)
			await API.fetchDeleteData(
				`${variables.API_NOTIFICATIONS}/api/notifications/delete_notification/${notification._id}`,
				false,
				token,
			)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function getClassroomIcon() {
		if (notification.notification.type === 'global') return ''
		if (notification.notification.type_classroom === 'publication')
			return '<i class="fa-solid fa-comment-dots"></i>'
		if (notification.notification.type_classroom === 'work')
			return '<i class="fa-solid fa-laptop-file"></i>'
		if (notification.notification.type_classroom === 'grade')
			return '<i class="fa-solid fa-pencil"></i>'
	}
</script>

<article bind:this={element} class="Notification">
	<a on:click={toogleMenu} href={notification.notification.url}>
		{#if notification.notification?.img}
			<img src={notification.notification.img} alt={notification.notification.title} />
		{/if}
		<div class="Notification__text">
			<h3>{notification.notification.title} {@html getClassroomIcon()}</h3>
			{#if notification.notification.type === 'classroom'}
				<span>Materia: {notification.notification.subject.subject}</span>
			{/if}
			<small>{timeAgo(notification.date)}</small>
		</div>
	</a>
	<button on:click={deleteNotification} class="Notification__delete">
		<i class="fa-solid fa-x" />
	</button>
</article>

<style>
	a {
		text-decoration: none;
		display: flex;
		gap: 15px;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	.Notification {
		width: 100%;
		cursor: pointer;

		position: relative;
		padding: 10px;
		box-sizing: border-box;
		border-bottom: 1px solid var(--color-light);
	}

	img {
		width: 80px;
		height: 60px;
		object-fit: cover;
	}

	h3 {
		font-family: 'Karla', sans-serif;
		font-size: 0.9rem;
		transition: all 0.4s;
	}

	small {
		position: absolute;
		white-space: nowrap;
		font-size: 0.6rem;
		bottom: 5px;
		right: 0;
	}

	.Notification__delete {
		position: absolute;
		top: 5px;
		right: 5px;
	}

	button {
		background-color: transparent;
		border: none;
		font-size: 10px;
	}
</style>
