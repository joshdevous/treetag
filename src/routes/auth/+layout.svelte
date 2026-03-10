<script lang="ts">
	import { page } from '$app/stores';
	import {
		TreePine,
		TreeDeciduous,
		Leaf,
		Bird,
		Trees,
		Sprout,
		Heart,
		Tag,
		Shield,
		Eye,
		ChevronLeft
	} from 'lucide-svelte';

	let { children, data } = $props();

	const isLogin = $derived($page.url.pathname === '/auth/login');
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="auth-shell">
	<!-- Left decorative panel -->
	<div class="auth-panel-left">
		<!-- Floating nature icons -->
		<div class="floating-icon" style="top: 5%; left: 8%; animation-delay: 0s;">
			<TreeDeciduous size={52} strokeWidth={0.8} />
		</div>
		<div class="floating-icon" style="top: 12%; right: 12%; animation-delay: 1s; transform: rotate(25deg);">
			<Leaf size={36} strokeWidth={1} />
		</div>
		<div class="floating-icon" style="top: 28%; left: 6%; animation-delay: 0.5s;">
			<Bird size={30} strokeWidth={1} />
		</div>
		<div class="floating-icon" style="bottom: 18%; right: 6%; animation-delay: 2s;">
			<Trees size={60} strokeWidth={0.7} />
		</div>
		<div class="floating-icon" style="bottom: 38%; left: 12%; animation-delay: 1.5s;">
			<Sprout size={28} strokeWidth={1.2} />
		</div>
		<div class="floating-icon" style="top: 48%; right: 18%; animation-delay: 3s;">
			<Heart size={24} strokeWidth={1.2} />
		</div>
		<div class="floating-icon" style="bottom: 6%; left: 28%; animation-delay: 0.8s;">
			<TreePine size={40} strokeWidth={0.9} />
		</div>
		<div class="floating-icon" style="top: 20%; left: 32%; animation-delay: 2.5s;">
			<Tag size={22} strokeWidth={1.2} />
		</div>
		<!-- Extra icons for more coverage -->
		<div class="floating-icon" style="top: 3%; left: 45%; animation-delay: 3.5s;">
			<Leaf size={20} strokeWidth={1} />
		</div>
		<div class="floating-icon" style="top: 38%; left: 3%; animation-delay: 1.2s; transform: rotate(-15deg);">
			<TreePine size={44} strokeWidth={0.8} />
		</div>
		<div class="floating-icon" style="bottom: 10%; right: 25%; animation-delay: 0.3s;">
			<Bird size={22} strokeWidth={1.2} />
		</div>
		<div class="floating-icon" style="top: 65%; left: 20%; animation-delay: 4s;">
			<Shield size={20} strokeWidth={1.2} />
		</div>
		<div class="floating-icon" style="bottom: 28%; right: 30%; animation-delay: 2.8s; transform: rotate(10deg);">
			<Sprout size={32} strokeWidth={1} />
		</div>
		<div class="floating-icon" style="top: 10%; left: 60%; animation-delay: 1.8s;">
			<Trees size={34} strokeWidth={0.9} />
		</div>
		<div class="floating-icon" style="bottom: 3%; right: 45%; animation-delay: 3.2s;">
			<Heart size={18} strokeWidth={1.3} />
		</div>
		<div class="floating-icon" style="top: 55%; right: 5%; animation-delay: 0.7s; transform: rotate(-20deg);">
			<TreeDeciduous size={38} strokeWidth={0.9} />
		</div>
		<div class="floating-icon" style="top: 75%; left: 5%; animation-delay: 2.2s;">
			<Tag size={18} strokeWidth={1.3} />
		</div>
		<div class="floating-icon" style="bottom: 50%; right: 40%; animation-delay: 4.5s;">
			<Leaf size={26} strokeWidth={1} />
		</div>

		<!-- Radial overlay -->
		<div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%);"></div>

		<!-- Content -->
		<div class="panel-content">
			<!-- Logo -->
			<div class="flex items-center justify-center gap-2.5 mb-10">
				<div class="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/15">
					<TreePine size={22} color="#fff" strokeWidth={2.5} />
				</div>
				<div class="text-2xl tracking-tight text-white">
					<span class="font-bold">Tree</span><span class="font-normal opacity-85">tag</span>
				</div>
			</div>

			<h2 class="panel-heading">
				{isLogin ? 'Welcome back, Guardian' : 'Join the Guardians'}
			</h2>

			<p class="panel-subtext">
				{isLogin
					? 'Your trees missed you. Log in to check on your canopy and see what the community has been up to.'
					: 'Discover, tag, and care for the trees of Charlton Kings. Every tree has a story — help us tell it.'}
			</p>

			<!-- Stats -->
			<div class="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
				{#each [
					{ icon: Trees, value: data.stats.trees, label: 'Trees' },
					{ icon: Shield, value: data.stats.guardians, label: 'Guardians' },
					{ icon: Eye, value: data.stats.observations, label: 'Observations' },
					{ icon: Heart, value: data.stats.adopted, label: 'Adopted' }
				] as stat}
					{@const Icon = stat.icon}
					<div class="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 text-center">
						<div class="text-2xl font-bold text-white" style="font-family: 'Space Mono', monospace;">
							{stat.value}
						</div>
						<div class="mt-1 flex items-center justify-center gap-1.5 text-white/75">
							<span class="shrink-0"><Icon size={14} strokeWidth={2} /></span>
							<span class="text-[10px] font-semibold uppercase tracking-wider">{stat.label}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right form panel -->
	<div class="auth-panel-right">
		<!-- Top bar -->
		<div class="flex items-center justify-between px-8 py-4 shrink-0">
			<a
				href="/"
				class="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-500 text-xs hover:text-stone-800 transition-colors"
			>
				<ChevronLeft size={14} />
				Back to home
			</a>

			<div class="text-[13px] text-stone-400">
				{isLogin ? 'No account? ' : 'Already have an account? '}
				<a
					href={isLogin ? '/auth/register' : '/auth/login'}
					class="text-green-600 font-semibold hover:underline"
				>
					{isLogin ? 'Sign up' : 'Log in'}
				</a>
			</div>
		</div>

		<!-- Form content -->
		<div class="flex-1 flex flex-col justify-start px-12 py-10 pt-[8vh]">
			<div class="max-w-[380px]">
				{@render children()}
			</div>
		</div>

		<!-- Bottom link -->
		<div class="shrink-0 px-8 py-4 text-center text-xs text-stone-400">
			<a href="/legal" class="hover:underline hover:text-stone-600 transition-colors">Legal &amp; Privacy</a>
		</div>
	</div>
</div>

<style>
	@keyframes floatSlow {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes fadeSlideUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.auth-shell {
		font-family: 'DM Sans', system-ui, sans-serif;
		display: flex;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.auth-panel-left {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: linear-gradient(135deg, #15803d 0%, #16a34a 40%, #22c55e 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px;
	}

	.floating-icon {
		position: absolute;
		color: rgba(255, 255, 255, 0.22);
		pointer-events: none;
		animation: floatSlow 6s ease-in-out infinite;
	}

	.panel-content {
		position: relative;
		text-align: center;
		max-width: 420px;
		animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
	}

	.panel-heading {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 32px;
		font-weight: 700;
		color: #fff;
		line-height: 1.2;
		margin-bottom: 16px;
		letter-spacing: -0.5px;
	}

	.panel-subtext {
		font-size: 15px;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.6;
		margin-bottom: 36px;
	}

	.stat-value {
		font-size: 20px;
		font-weight: 700;
		color: #fff;
		font-family: 'Space Mono', monospace;
	}

	.stat-label {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}

	.auth-panel-right {
		width: 520px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: #ffffff;
		overflow: auto;
	}

	/* Mobile: hide left panel */
	@media (max-width: 768px) {
		.auth-panel-left {
			display: none;
		}
		.auth-panel-right {
			width: 100%;
		}
	}
</style>
