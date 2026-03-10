<script lang="ts">
	import { ChevronLeft } from 'lucide-svelte';

	let { data } = $props();

	const formattedDate = $derived(
		new Date(data.document.lastUpdated).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);
</script>

<svelte:head>
	<title>{data.document.title} — Treetag</title>
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="legal-page">
	<div class="legal-content">
		<div class="legal-inner">
			<div class="legal-nav">
				<a href="/legal" class="back-link">
					<ChevronLeft size={14} />
					All Legal Documents
				</a>
			</div>

			<h1 class="legal-heading">{data.document.title}</h1>
			<p class="legal-subtitle">{data.document.subtitle}</p>
			<p class="legal-date">Last updated: {formattedDate}</p>

			<div class="prose-content">
				{@html data.document.content}
			</div>
		</div>
	</div>
</div>

<style>
	.legal-page {
		font-family: 'DM Sans', system-ui, sans-serif;
		min-height: 100vh;
		background: #ffffff;
	}

	.legal-content {
		max-width: 680px;
		margin: 0 auto;
		padding: 48px 32px 80px;
	}

	.legal-nav {
		margin-bottom: 32px;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: #f5f5f4;
		border: 1.5px solid #e7e5e4;
		border-radius: 10px;
		color: #78716c;
		font-size: 12px;
		transition: all 0.2s;
		text-decoration: none;
	}

	.back-link:hover {
		color: #1c1917;
		border-color: #d6d3d1;
	}

	.legal-inner {
		max-width: 600px;
	}

	.legal-heading {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.5px;
		margin-bottom: 8px;
		color: #1c1917;
	}

	.legal-subtitle {
		font-size: 14px;
		color: #57534e;
		line-height: 1.5;
		margin-bottom: 4px;
	}

	.legal-date {
		font-size: 12px;
		color: #a8a29e;
		margin-bottom: 32px;
	}

	.prose-content {
		color: #44403c;
		font-size: 14px;
		line-height: 1.75;
	}

	.prose-content :global(section) {
		margin-bottom: 2rem;
	}

	.prose-content :global(h2) {
		font-size: 14px;
		font-weight: 700;
		color: #1c1917;
		margin-bottom: 0.5rem;
		padding-bottom: 0.4rem;
		border-bottom: 1.5px solid #f5f5f4;
	}

	.prose-content :global(p) {
		margin-bottom: 0.6rem;
	}

	.prose-content :global(ul) {
		list-style: disc;
		padding-left: 1.5rem;
		margin-bottom: 0.6rem;
	}

	.prose-content :global(ul li) {
		margin-bottom: 0.25rem;
	}

	.prose-content :global(a) {
		color: #16a34a;
		font-weight: 600;
	}

	.prose-content :global(a:hover) {
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.legal-content {
			padding: 32px 16px 64px;
		}
	}
</style>
