<script>
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'

    const dispatch = createEventDispatcher()

    export let type = 'error'
    export let dismissible = true
</script>

<style>
    article {
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.2rem;
        display: flex;
        align-items: center;
        margin: 0 auto 0.5rem auto;
        width: 20rem;
    }

    .error {
        background: var(--color-danger);
    }

    .success {
        background: var(--color-success);
    }

    .info {
        background: var(--color-info);
    }

    .text {
        margin-left: 1rem;
        color: white;
    }

    button {
        background: transparent;
        border: 0 none;
        padding: 0;
        margin: 0 0 0 auto;
        line-height: 1;
        cursor: pointer;
        font-size: 1rem;
    }

    i{
        color: white;
    }
</style>

<article class={type} role="alert" transition:fade>
    {#if type === 'success'}
        <i class="fa-solid fa-circle-check"></i>
    {:else if type === 'error'}
        <i class="fa-solid fa-circle-exclamation"></i>
    {:else}
        <i class="fa-solid fa-circle-info"></i>
    {/if}
    <div class="text">
        <slot />
    </div>
    {#if dismissible}
        <button class="close" on:click={() => dispatch('dismiss')}>
            <i class="fa-solid fa-xmark"></i>
        </button>
    {/if}
</article>
