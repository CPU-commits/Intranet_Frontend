<script lang="ts">
	import { variables } from '$lib/variables'
	import type { NotificationType } from '$models/notifications/notification.type'
	import { UserTypes } from '$models/users/user_type.model'

	import notificationNumber from '$stores/notification'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'

	export let token: string
	export let url: string
	export let user_type: string

	import { io } from 'socket.io-client'
	import { onMount } from 'svelte'
	import Notification from './Notification.svelte'
	import SpinnerGet from './SpinnerGet.svelte'
	// Notifications
	let notificationEl: HTMLElement
	let notificationsOpen = false
	let notifications: NotificationType[]
	let notificationsRunning = false

	onMount(async () => {
		const socket = io(`ws://localhost:7000`, {
			extraHeaders: {
				Authorization: token,
			},
		}).connect()
		socket.on('notify/global', () => {
			notificationNumber.update((v) => v + 1)
		})
		/* Students socket */
		if (user_type === UserTypes.STUDENT || user_type === UserTypes.STUDENT_DIRECTIVE) {
			const socketStudents = io(`ws://localhost:7000/students`, {
				extraHeaders: {
					Authorization: token,
				},
			})
			socketStudents.on('notify/students', () => {
				notificationNumber.update((v) => v + 1)
			})
		}
		// Get nofications count
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_NOTIFICATIONS}/api/notifications/get_count_notifications`,
				false,
				token,
			)
			notificationNumber.set(dataFetch.body.count)
		} catch (err) {
			console.error(err)
		}
	})

	async function getNotifications(total = false, skip = 0) {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_NOTIFICATIONS}/api/notifications/get_notifications?skip=${skip}&total=${total}`,
				false,
				token,
			)
			notificationsRunning = false
			return dataFetch
		} catch (err) {
			notificationsRunning = false
			notifications = []
			addToast({
				message: err.message,
				type: 'error',
			})
			return null
		}
	}

	async function getMenu() {
		const data = await getNotifications(true)
		if (data) {
			notifications = []
			notifications = [...notifications, ...data.body.notifications]
			onscrollLoading(
				data.body.total,
				async (n: number) => {
					notificationsRunning = true
					const dataFetch = await getNotifications(false, n)
					notifications = [...notifications, ...dataFetch.body.notifications]
					return n + 10
				},
				10,
				notificationEl,
			)
		}
	}

	function toogleMenu() {
		notificationNumber.set(0)
		notificationsOpen = !notificationsOpen
		if (notificationsOpen) {
			getMenu()
		}
	}
</script>

<section class="Container">
	<button on:click={toogleMenu}>
		<i class:News={url.startsWith('/noticias')} class="fa-solid fa-bell" />
		{#if $notificationNumber}
			<span class="notifications">
				{#if $notificationNumber < 100}
					{$notificationNumber}
				{:else}
					99
				{/if}
			</span>
		{/if}
	</button>

	{#if notificationsOpen}
		<section bind:this={notificationEl} class="Notifications">
			<h4>Notificaciones</h4>
			<div class="Notifications__container">
				{#if notifications}
					{#each notifications as notification}
						<Notification {token} {toogleMenu} {notification} />
					{:else}
						<p>Sin notificaciones...</p>
					{/each}
				{:else}
					<SpinnerGet />
				{/if}
				{#if notificationsRunning}
					<SpinnerGet />
				{/if}
			</div>
		</section>
	{/if}
</section>

<style lang="scss">
	.Container {
		position: relative;
	}

	button {
		background-color: transparent;
		border: none;
		font-family: 'Karla', sans-serif;
		text-decoration: none;
		i {
			color: var(--color-main);
			font-size: 1rem;
		}
		position: relative;
	}

	span {
		background-color: var(--color-danger);
		color: white;
		position: absolute;
		border-radius: 100%;
		height: 14px;
		width: 14px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 0.7rem;
		bottom: -6px;
		right: -8px;
	}

	.Notifications {
		position: absolute;
		top: -3px;
		width: 400px;
		right: 20px;
		background-color: white;
		box-shadow: var(--box-shadow);
		box-sizing: border-box;
		border: 1px solid var(--color-light);
		max-height: 400px;
		overflow-y: auto;
		z-index: 4;
	}

	h4 {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border-bottom: 1px solid var(--color-light);
	}

	.News {
		color: white;
	}

	.Notifications__container {
		padding: 10px;
	}
</style>
