<script lang="ts">
	import { onMount } from 'svelte';

	interface TreeMarker {
		id: string;
		name: string;
		species: string;
		lat: number;
		lng: number;
		adopted?: boolean;
		photoUrl?: string | null;
	}

	interface Props {
		trees: TreeMarker[];
		height?: string;
		zoom?: number;
		center?: [number, number];
		class?: string;
	}

	let { trees, height = '400px', zoom = 14, center, class: className = '' }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: L.Map | null = null;

	// Default center: Charlton Kings
	const defaultCenter: [number, number] = [51.884, -2.047];

	onMount(() => {
		let mapInstance: L.Map | null = null;

		(async () => {
		const L = await import('leaflet');

		// Compute center from props or tree positions
		let mapCenter = center ?? defaultCenter;
		if (!center && trees.length > 0) {
			const avgLat = trees.reduce((s, t) => s + t.lat, 0) / trees.length;
			const avgLng = trees.reduce((s, t) => s + t.lng, 0) / trees.length;
			mapCenter = [avgLat, avgLng];
		}

		mapInstance = L.map(mapContainer, {
			center: mapCenter,
			zoom,
			zoomControl: false,
			attributionControl: false
		});

		map = mapInstance;

		// Zoom control bottom-right
		L.control.zoom({ position: 'bottomright' }).addTo(map);

		// Attribution bottom-left
		L.control.attribution({ position: 'bottomleft', prefix: false })
			.addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>')
			.addTo(map);

		// Clean, muted tile layer
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			maxZoom: 19,
			subdomains: 'abcd'
		}).addTo(map);

		// Custom tree marker icon
		const treeIcon = L.divIcon({
			className: 'treetag-marker',
			html: `<div class="treetag-marker-pin"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14l3-3.5L15 6l-3-3-3 3-5 4.5L7 14h10z"/><path d="M12 14v8"/><path d="M8 22h8"/></svg></div>`,
			iconSize: [32, 40],
			iconAnchor: [16, 40],
			popupAnchor: [0, -42]
		});

		const adoptedIcon = L.divIcon({
			className: 'treetag-marker',
			html: `<div class="treetag-marker-pin adopted"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14l3-3.5L15 6l-3-3-3 3-5 4.5L7 14h10z"/><path d="M12 14v8"/><path d="M8 22h8"/></svg></div>`,
			iconSize: [32, 40],
			iconAnchor: [16, 40],
			popupAnchor: [0, -42]
		});

		// Add markers
		for (const tree of trees) {
			const icon = tree.adopted ? adoptedIcon : treeIcon;
			const marker = L.marker([tree.lat, tree.lng], { icon }).addTo(map);

			const photoHtml = tree.photoUrl
				? `<img src="${tree.photoUrl}" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:6px 6px 0 0;margin:-12px -12px 8px;width:calc(100% + 24px);" />`
				: '';

			const adoptedBadge = tree.adopted
				? `<span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:10px;font-weight:600;padding:1px 6px;border-radius:99px;margin-left:4px;">Adopted</span>`
				: '';

			marker.bindPopup(`
				<div style="min-width:160px;font-family:'DM Sans',sans-serif;">
					${photoHtml}
					<div style="font-weight:700;font-size:13px;color:#1c1917;">${tree.name}${adoptedBadge}</div>
					<div style="font-size:11px;color:#78716c;margin-top:2px;">${tree.species}</div>
					<a href="/trees/${tree.id}" style="display:inline-block;margin-top:8px;font-size:11px;font-weight:600;color:#16a34a;text-decoration:none;">View tree →</a>
				</div>
			`, { className: 'treetag-popup', maxWidth: 220 });
		}

		// Fit bounds if multiple trees
		if (trees.length > 1) {
			const bounds = L.latLngBounds(trees.map((t) => [t.lat, t.lng] as [number, number]));
			map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
		}

		})();

		return () => {
			mapInstance?.remove();
			map = null;
		};
	});
</script>

<div class="tree-map-wrapper {className}" style="height: {height};">
	<div bind:this={mapContainer} class="h-full w-full rounded-2xl"></div>
</div>

<style>
	.tree-map-wrapper {
		position: relative;
		overflow: hidden;
		border-radius: 16px;
		border: 1px solid #e7e5e4;
	}

	/* Marker styles */
	:global(.treetag-marker) {
		background: none !important;
		border: none !important;
	}

	:global(.treetag-marker-pin) {
		width: 32px;
		height: 32px;
		border-radius: 50% 50% 50% 0;
		background: linear-gradient(135deg, #16a34a, #10b981);
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-45deg);
		box-shadow: 0 2px 8px rgba(22, 163, 74, 0.35);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	:global(.treetag-marker-pin:hover) {
		transform: rotate(-45deg) scale(1.1);
		box-shadow: 0 4px 12px rgba(22, 163, 74, 0.45);
	}

	:global(.treetag-marker-pin svg) {
		transform: rotate(45deg);
	}

	:global(.treetag-marker-pin.adopted) {
		background: linear-gradient(135deg, #7c3aed, #a78bfa);
		box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
	}

	:global(.treetag-marker-pin.adopted:hover) {
		box-shadow: 0 4px 12px rgba(124, 58, 237, 0.45);
	}

	/* Popup styles */
	:global(.treetag-popup .leaflet-popup-content-wrapper) {
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
		border: 1px solid #e7e5e4;
		padding: 0;
	}

	:global(.treetag-popup .leaflet-popup-content) {
		margin: 12px;
		line-height: 1.4;
	}

	:global(.treetag-popup .leaflet-popup-tip) {
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	:global(.treetag-popup .leaflet-popup-close-button) {
		color: #a8a29e !important;
		font-size: 18px !important;
		top: 6px !important;
		right: 8px !important;
	}
</style>
