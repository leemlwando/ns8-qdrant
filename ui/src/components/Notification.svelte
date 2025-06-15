<script>
  import { InlineNotification } from 'carbon-components-svelte';
  import { notification } from '../lib/stores.js';
</script>

{#if $notification}
  <InlineNotification
    kind={$notification.kind}
    title={$notification.title}
    subtitle={$notification.subtitle}
    on:close={() => notification.set(null)}
  />
{/if}