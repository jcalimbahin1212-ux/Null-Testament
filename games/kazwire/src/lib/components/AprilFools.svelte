<script lang="ts">
	import { neverShowAprilFools } from '$lib/stores';

	function neverShowAgain() {
		localStorage.setItem('neverShowAprilFools', 'true');
		neverShowAprilFools.set(true);
	}

	let url: string = `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1`;
</script>

<div
	class="flex w-full items-center justify-center rounded-3xl bg-tertiary p-8 text-black dark:bg-tertiaryDark dark:text-white"
>
	<!-- iframe all i want for christmas is you -->
	<iframe
		class="pr-4"
		width="560"
		height="315"
		src={url}
		title="YouTube video player"
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	/>
	<div class="items-left justify-left flex flex-col">
		<h1 class="text-left text-4xl font-bold">April Fools!</h1>
		<div class="flex flex-col">
			<a href="/discord" target="_blank">
				<button class="btn mt-4 w-full bg-blue-500"> Join the celebration </button>
			</a>
			<button class="btn mt-4 w-full bg-primary" on:click={neverShowAgain}>
				Never show again
			</button>
		</div>
	</div>
</div>
