<script lang="ts">
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();
</script>

<p>Sup! {params.id}</p>
