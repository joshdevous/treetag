<script lang="ts">
	import { Scale, ShieldCheck, Cookie, ShieldAlert, Accessibility, ChevronRight } from 'lucide-svelte';

	let { data } = $props();

	const iconMap: Record<string, typeof Scale> = {
		Scale,
		ShieldCheck,
		Cookie,
		ShieldAlert,
		Accessibility
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Legal — Treetag</title>
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="legal-index">
	<div class="legal-index-inner">
		<h1 class="legal-index-heading">Legal</h1>
		<p class="legal-index-subtitle">Policies and agreements that govern your use of Treetag.</p>

		<div class="legal-cards">
			{#each data.documents as doc}
				<a href="/legal/{doc.slug}" class="legal-card">
					<div class="legal-card-icon">
						{#if iconMap[doc.icon]}
							{@const Icon = iconMap[doc.icon]}
							<Icon size={20} />
						{/if}
					</div>
					<div class="legal-card-body">
						<h2 class="legal-card-title">{doc.title}</h2>
						<p class="legal-card-desc">{doc.description}</p>
						<p class="legal-card-date">Last updated: {formatDate(doc.lastUpdated)}</p>
					</div>
					<ChevronRight size={16} class="legal-card-arrow" />
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.legal-index {
		font-family: 'DM Sans', system-ui, sans-serif;
		max-width: 680px;
		margin: 0 auto;
		padding: 48px 32px 80px;
	}

	.legal-index-heading {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.5px;
		margin-bottom: 8px;
		color: #1c1917;
	}

	.legal-index-subtitle {
		font-size: 14px;
		color: #57534e;
		line-height: 1.5;
		margin-bottom: 32px;
	}

	.legal-cards {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.legal-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: #fafaf9;
		border: 1.5px solid #e7e5e4;
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.legal-card:hover {
		border-color: #16a34a;
		box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.08);
	}

	.legal-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: #f0fdf4;
		color: #16a34a;
		flex-shrink: 0;
	}

	.legal-card-body {
		flex: 1;
		min-width: 0;
	}

	.legal-card-title {
		font-size: 14px;
		font-weight: 700;
		color: #1c1917;
		margin-bottom: 2px;
	}

	.legal-card-desc {
		font-size: 13px;
		color: #78716c;
		line-height: 1.4;
	}

	.legal-card-date {
		font-size: 11px;
		color: #a8a29e;
		margin-top: 4px;
	}

	:global(.legal-card-arrow) {
		color: #a8a29e;
		flex-shrink: 0;
		transition: color 0.2s;
	}

	.legal-card:hover :global(.legal-card-arrow) {
		color: #16a34a;
	}

	@media (max-width: 640px) {
		.legal-index {
			padding: 32px 16px 64px;
		}
	}
</style>
