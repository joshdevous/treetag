<script lang="ts">
	import { TreePine } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Logo Variations — Treetag</title>
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page">
	<h1>Treetag Logo Variations</h1>
	<p class="subtitle">All logo treatments used across the app</p>

	<div class="grid">
		<!-- 1. Nav Header -->
		<div class="card">
			<span class="label">Nav Header</span>
			<div class="preview" style="background:#ffffff;">
				<a href="/" class="flex items-center gap-2.5" style="text-decoration:none;">
					<div
						class="flex items-center justify-center rounded-[9px] bg-gradient-to-br from-green-600 to-green-500"
						style="width:32px;height:32px;box-shadow:0 2px 8px rgba(22,163,74,0.2);"
					>
						<TreePine size={17} color="#fff" strokeWidth={2.5} />
					</div>
					<span style="font-size:17px;letter-spacing:-0.025em;">
						<span style="font-weight:700;color:#1c1917;">Tree</span><span style="font-weight:400;color:#16a34a;">tag</span>
					</span>
				</a>
			</div>
			<div class="specs">
				Icon: 17px white, strokeWidth 2.5<br />
				Box: 32×32px, green-600→green-500 gradient, rounded-[9px]<br />
				Text: 17px, "Tree" bold stone-900, "tag" normal green-600<br />
				Shadow: 0 2px 8px rgba(22,163,74,0.2)
			</div>
		</div>

		<!-- 2. Footer -->
		<div class="card">
			<span class="label">Footer</span>
			<div class="preview" style="background:#ffffff;">
				<div class="flex items-center gap-2">
					<div
						class="flex items-center justify-center rounded-[7px] bg-gradient-to-br from-green-600 to-green-500"
						style="width:24px;height:24px;"
					>
						<TreePine size={13} color="#fff" strokeWidth={2.5} />
					</div>
					<span style="font-size:13px;color:#a8a29e;">
						&copy; 2026 Treetag &mdash; Charlton Kings Tree Guardian Project
					</span>
				</div>
			</div>
			<div class="specs">
				Icon: 13px white, strokeWidth 2.5<br />
				Box: 24×24px, green-600→green-500 gradient, rounded-[7px]<br />
				Text: 13px, stone-400
			</div>
		</div>

		<!-- 3. Auth Sidebar (on green) -->
		<div class="card">
			<span class="label">Auth Sidebar</span>
			<div class="preview" style="background:linear-gradient(135deg,#15803d 0%,#16a34a 40%,#22c55e 100%);padding:40px;">
				<div class="flex items-center justify-center gap-2.5">
					<div
						class="flex items-center justify-center rounded-xl"
						style="width:44px;height:44px;background:rgba(255,255,255,0.2);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.15);"
					>
						<TreePine size={22} color="#fff" strokeWidth={2.5} />
					</div>
					<div style="font-size:24px;letter-spacing:-0.025em;color:#ffffff;">
						<span style="font-weight:700;">Tree</span><span style="font-weight:400;opacity:0.85;">tag</span>
					</div>
				</div>
			</div>
			<div class="specs">
				Icon: 22px white, strokeWidth 2.5<br />
				Box: 44×44px, white/20 bg, backdrop blur, white/15 border, rounded-xl<br />
				Text: 24px white, "Tree" bold, "tag" normal 85% opacity<br />
				Background: Green gradient (135deg: #15803d → #16a34a → #22c55e)
			</div>
		</div>

		<!-- 4. Nav Header — Large -->
		<div class="card">
			<span class="label">Nav Header (2× for email/marketing)</span>
			<div class="preview" style="background:#ffffff;padding:32px;">
				<div class="flex items-center gap-3">
					<div
						class="flex items-center justify-center rounded-[12px] bg-gradient-to-br from-green-600 to-green-500"
						style="width:48px;height:48px;box-shadow:0 3px 12px rgba(22,163,74,0.25);"
					>
						<TreePine size={26} color="#fff" strokeWidth={2.5} />
					</div>
					<span style="font-size:28px;letter-spacing:-0.03em;">
						<span style="font-weight:700;color:#1c1917;">Tree</span><span style="font-weight:400;color:#16a34a;">tag</span>
					</span>
				</div>
			</div>
			<div class="specs">
				Icon: 26px white, strokeWidth 2.5<br />
				Box: 48×48px, green gradient, rounded-[12px]<br />
				Text: 28px, "Tree" bold stone-900, "tag" normal green-600<br />
				Shadow: 0 3px 12px rgba(22,163,74,0.25)
			</div>
		</div>

		<!-- 5. Auth Sidebar — Large -->
		<div class="card">
			<span class="label">Auth Sidebar (2× for email header)</span>
			<div class="preview" style="background:linear-gradient(135deg,#15803d 0%,#16a34a 40%,#22c55e 100%);padding:48px;">
				<div class="flex items-center justify-center gap-3">
					<div
						class="flex items-center justify-center rounded-2xl"
						style="width:56px;height:56px;background:rgba(255,255,255,0.2);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.15);"
					>
						<TreePine size={30} color="#fff" strokeWidth={2.5} />
					</div>
					<div style="font-size:32px;letter-spacing:-0.03em;color:#ffffff;">
						<span style="font-weight:700;">Tree</span><span style="font-weight:400;opacity:0.85;">tag</span>
					</div>
				</div>
			</div>
			<div class="specs">
				Icon: 30px white, strokeWidth 2.5<br />
				Box: 56×56px, white/20 bg, backdrop blur, white/15 border, rounded-2xl<br />
				Text: 32px white, "Tree" bold, "tag" normal 85% opacity<br />
				Background: Green gradient
			</div>
		</div>

		<!-- 6. Icon Only -->
		<div class="card">
			<span class="label">Icon Only (favicon / app icon)</span>
			<div class="preview" style="background:#f5f5f4;padding:40px;">
				<div class="flex items-center justify-center gap-6">
					<div
						class="flex items-center justify-center rounded-[9px] bg-gradient-to-br from-green-600 to-green-500"
						style="width:32px;height:32px;box-shadow:0 2px 8px rgba(22,163,74,0.2);"
					>
						<TreePine size={17} color="#fff" strokeWidth={2.5} />
					</div>
					<div
						class="flex items-center justify-center rounded-[12px] bg-gradient-to-br from-green-600 to-green-500"
						style="width:48px;height:48px;box-shadow:0 3px 12px rgba(22,163,74,0.25);"
					>
						<TreePine size={26} color="#fff" strokeWidth={2.5} />
					</div>
					<div
						class="flex items-center justify-center rounded-[16px] bg-gradient-to-br from-green-600 to-green-500"
						style="width:64px;height:64px;box-shadow:0 4px 16px rgba(22,163,74,0.25);"
					>
						<TreePine size={34} color="#fff" strokeWidth={2.5} />
					</div>
				</div>
			</div>
			<div class="specs">
				32px / 48px / 64px boxes<br />
				Green gradient, proportional rounding and icon sizes
			</div>
		</div>

		<!-- 7. Wordmark Only -->
		<div class="card">
			<span class="label">Wordmark Only</span>
			<div class="preview" style="background:#ffffff;padding:32px;">
				<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;">
					<span style="font-size:17px;letter-spacing:-0.025em;">
						<span style="font-weight:700;color:#1c1917;">Tree</span><span style="font-weight:400;color:#16a34a;">tag</span>
					</span>
					<span style="font-size:28px;letter-spacing:-0.03em;">
						<span style="font-weight:700;color:#1c1917;">Tree</span><span style="font-weight:400;color:#16a34a;">tag</span>
					</span>
					<span style="font-size:40px;letter-spacing:-0.03em;">
						<span style="font-weight:700;color:#1c1917;">Tree</span><span style="font-weight:400;color:#16a34a;">tag</span>
					</span>
				</div>
			</div>
			<div class="specs">
				Dark variant: "Tree" bold stone-900, "tag" normal green-600<br />
				Sizes: 17px / 28px / 40px
			</div>
		</div>

		<!-- 8. Wordmark Only (white on green) -->
		<div class="card">
			<span class="label">Wordmark Only (on green)</span>
			<div class="preview" style="background:linear-gradient(135deg,#15803d 0%,#16a34a 40%,#22c55e 100%);padding:32px;">
				<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;">
					<span style="font-size:17px;letter-spacing:-0.025em;color:#fff;">
						<span style="font-weight:700;">Tree</span><span style="font-weight:400;opacity:0.85;">tag</span>
					</span>
					<span style="font-size:28px;letter-spacing:-0.03em;color:#fff;">
						<span style="font-weight:700;">Tree</span><span style="font-weight:400;opacity:0.85;">tag</span>
					</span>
					<span style="font-size:40px;letter-spacing:-0.03em;color:#fff;">
						<span style="font-weight:700;">Tree</span><span style="font-weight:400;opacity:0.85;">tag</span>
					</span>
				</div>
			</div>
			<div class="specs">
				White variant: "Tree" bold white, "tag" normal white 85% opacity<br />
				Sizes: 17px / 28px / 40px
			</div>
		</div>
	</div>
</div>

<style>
	.page {
		font-family: 'DM Sans', system-ui, sans-serif;
		max-width: 960px;
		margin: 0 auto;
		padding: 48px 24px 80px;
	}

	h1 {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 32px;
		font-weight: 700;
		color: #1c1917;
		margin: 0 0 4px;
	}

	.subtitle {
		font-size: 15px;
		color: #57534e;
		margin: 0 0 40px;
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.card {
		border: 1px solid #e7e5e4;
		border-radius: 14px;
		overflow: hidden;
		background: #fff;
	}

	.label {
		display: block;
		padding: 14px 20px;
		font-size: 13px;
		font-weight: 600;
		color: #57534e;
		border-bottom: 1px solid #e7e5e4;
		letter-spacing: 0.2px;
	}

	.preview {
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.specs {
		padding: 14px 20px;
		font-size: 12px;
		line-height: 1.6;
		color: #a8a29e;
		border-top: 1px solid #e7e5e4;
		background: #fafaf9;
	}
</style>
