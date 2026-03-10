import mongoose from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}

const legalDocumentSchema = new mongoose.Schema(
	{
		slug: { type: String, required: true, unique: true },
		title: { type: String, required: true },
		subtitle: { type: String, required: true },
		description: { type: String, required: true },
		icon: { type: String, required: true },
		content: { type: String, required: true },
		lastUpdated: { type: Date, required: true }
	},
	{ timestamps: true }
);

const LegalDocumentModel =
	mongoose.models['LegalDocument'] || mongoose.model('LegalDocument', legalDocumentSchema);

const documents = [
	{
		slug: 'tos',
		title: 'Terms of Service',
		subtitle: 'The rules and guidelines that govern your use of the Treetag platform.',
		description: 'The rules and guidelines for using the Treetag platform and community.',
		icon: 'Scale',
		lastUpdated: new Date('2026-03-10'),
		content: `<section>
<h2>1. Acceptance of Terms</h2>
<p>By accessing or using Treetag ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. Treetag is a community platform for discovering, tagging, and caring for trees in Charlton Kings and the surrounding area.</p>
</section>

<section>
<h2>2. User Accounts</h2>
<p>To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account credentials secure. You are responsible for all activity that occurs under your account.</p>
<p>You must be at least 13 years old to create an account. By registering, you confirm that you meet this requirement. We do not require email verification at this time, but we reserve the right to verify your identity or email address at any point.</p>
</section>

<section>
<h2>3. User-Generated Content</h2>
<p>Treetag allows users to submit observations, photographs, tree data, and other content ("User Content"). By submitting User Content, you grant Treetag a non-exclusive, royalty-free, worldwide licence to use, display, reproduce, and distribute that content in connection with the Service, including on public tree profile pages and the interactive map.</p>
<p>You retain ownership of your User Content. You are solely responsible for ensuring your content does not infringe any third-party rights, is accurate, and complies with applicable law. Photographs you upload may be publicly visible on tree profiles.</p>
</section>

<section>
<h2>4. Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
<li>Post content that is harmful, offensive, misleading, or deliberately inaccurate</li>
<li>Attempt to gain unauthorised access to the Service or other users' accounts</li>
<li>Submit false or fabricated tree observations or health reports</li>
<li>Use the Service for any commercial purpose without prior written consent</li>
<li>Scrape, crawl, or harvest data from the Service in an automated manner</li>
<li>Manipulate the points or leaderboard system through fraudulent activity</li>
<li>Interfere with or disrupt the Service or its infrastructure</li>
</ul>
<p>For full details on expected behaviour, prohibited content, and enforcement, please see our <a href="/legal/aup">Acceptable Use Policy</a>.</p>
</section>

<section>
<h2>5. Tree Adoption &amp; Guardianship</h2>
<p>The "adopt a tree" and guardianship features are symbolic and do not confer any legal ownership, property rights, or responsibilities over any physical tree. Users who adopt a tree voluntarily commit to monitoring and reporting on that tree's condition through the Service.</p>
<p>Treetag is not responsible for the physical condition of any tree. Do not attempt to perform tree surgery, treatment, or removal based on observations made on the platform. Contact your local council for tree-related concerns.</p>
</section>

<section>
<h2>6. Points &amp; Gamification</h2>
<p>The Service awards points for activities such as submitting observations, tagging trees, and contributing photos. Points are used for community leaderboards and have no monetary value. They cannot be exchanged, transferred, or redeemed outside the platform. We reserve the right to adjust point values or reset points if abuse is detected.</p>
</section>

<section>
<h2>7. QR Codes</h2>
<p>Trees on the platform may be assigned physical QR codes that link to their digital profile. Tampering with, removing, or vandalising QR codes placed on or near trees is prohibited. QR codes remain the property of the Treetag project.</p>
</section>

<section>
<h2>8. Third-Party Data</h2>
<p>The Service may incorporate data from third-party sources such as iNaturalist for biodiversity records. Such data is provided under its original licence terms and Treetag makes no claims of ownership over it. Attribution will be provided where required.</p>
</section>

<section>
<h2>9. Limitation of Liability</h2>
<p>Treetag is provided "as is" without warranties of any kind, express or implied. We do not guarantee the accuracy of tree data, species identification, health assessments, or user observations. To the fullest extent permitted by law, Treetag and its contributors shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
</section>

<section>
<h2>10. Termination</h2>
<p>We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any behaviour that harms the community. You may delete your account at any time through your account settings. Upon deletion, your personal data will be removed in accordance with our <a href="/legal/privacy">Privacy Policy</a>.</p>
</section>

<section>
<h2>11. Changes to Terms</h2>
<p>We may update these Terms from time to time. Continued use of the Service after changes are published constitutes acceptance of the new Terms. We will notify users of significant changes via the platform.</p>
</section>

<section>
<h2>12. Governing Law</h2>
<p>These Terms are governed by the laws of England and Wales. Any disputes arising from or relating to the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
</section>

<section>
<h2>13. Contact</h2>
<p>If you have any questions about these Terms, please email us at <strong>hello@treetag.app</strong>.</p>
</section>`
	},
	{
		slug: 'privacy',
		title: 'Privacy Policy',
		subtitle: 'How we collect, use, and protect your personal data when you use Treetag.',
		description: 'How we collect, use, and protect your personal data.',
		icon: 'ShieldCheck',
		lastUpdated: new Date('2026-03-10'),
		content: `<section>
<h2>1. Introduction</h2>
<p>Treetag ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and safeguard information when you use our Service. By using Treetag, you agree to the collection and use of information in accordance with this policy.</p>
</section>

<section>
<h2>2. Information We Collect</h2>
<p>We collect the following categories of information:</p>
<ul>
<li><strong>Account information</strong> — your name, username, and email address when you register</li>
<li><strong>User Content</strong> — tree observations, photographs, health reports, wildlife sightings, and notes you submit</li>
<li><strong>Location data</strong> — coordinates associated with trees you add or observe (entered manually or via map selection)</li>
<li><strong>Photo metadata</strong> — uploaded images may contain embedded EXIF data, including GPS coordinates, camera model, and timestamps</li>
<li><strong>Usage data</strong> — pages visited, features used, and interaction timestamps, collected to improve the Service</li>
<li><strong>Device information</strong> — browser type, operating system, and IP address for security and diagnostics</li>
</ul>
</section>

<section>
<h2>3. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide, operate, and improve the Service</li>
<li>Authenticate your identity and secure your account</li>
<li>Display your contributions (observations, photos, adoptions) on public tree profiles and the map</li>
<li>Calculate and display points on the community leaderboard</li>
<li>Send important service-related notifications</li>
<li>Analyse usage trends to improve features and performance</li>
</ul>
<p>We do not sell your personal data to third parties.</p>
</section>

<section>
<h2>4. Public Information</h2>
<p>The following information may be publicly visible to other Treetag users: your username, profile image, adopted trees, observations, uploaded photos, and your position on the community leaderboard. Your email address is never displayed publicly.</p>
</section>

<section>
<h2>5. Photos &amp; Location Data</h2>
<p>When you upload photographs, they may contain embedded EXIF metadata including GPS coordinates. We may use this data to associate observations with map locations. You can strip location metadata from photos before uploading using your device's privacy settings or a third-party tool.</p>
<p>Tree location coordinates are stored and displayed on the public map. These relate to tree positions, not your personal location.</p>
</section>

<section>
<h2>6. Data Storage &amp; Security</h2>
<p>Your account data is stored in a MongoDB database. Uploaded files, including photographs, are stored in Cloudflare R2 cloud object storage with access controls. Passwords are securely hashed and never stored in plain text.</p>
<p>We take reasonable measures to protect your data, but no method of electronic storage is completely secure. We cannot guarantee absolute security.</p>
</section>

<section>
<h2>7. Cookies</h2>
<p>Treetag uses essential session cookies to keep you authenticated while you use the Service. We do not use advertising, analytics, or third-party tracking cookies. You can disable cookies in your browser settings, but this may affect your ability to log in and use the Service.</p>
<p>For a full breakdown of the cookies we use and how to manage them, please see our <a href="/legal/cookies">Cookie Policy</a>.</p>
</section>

<section>
<h2>8. Third-Party Services</h2>
<p>The Service uses the following third-party integrations:</p>
<ul>
<li><strong>OpenStreetMap</strong> — map tiles are loaded from OSM tile servers. Your IP address may be visible to these servers when loading the map. See the <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">OSM privacy policy</a>.</li>
<li><strong>Cloudflare R2</strong> — used for photo storage. Data may be stored across Cloudflare's global network.</li>
<li><strong>iNaturalist</strong> — we may import publicly available biodiversity data. No personal data is shared with iNaturalist.</li>
</ul>
</section>

<section>
<h2>9. Your Rights</h2>
<p>Under UK data protection law (UK GDPR), you have the right to:</p>
<ul>
<li>Access the personal data we hold about you</li>
<li>Request correction of inaccurate data</li>
<li>Request deletion of your account and associated data</li>
<li>Object to or restrict certain types of processing</li>
<li>Data portability — receive your data in a machine-readable format</li>
</ul>
<p>To exercise any of these rights, please email us at <strong>hello@treetag.app</strong>.</p>
</section>

<section>
<h2>10. Data Retention</h2>
<p>We retain your personal data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days. Anonymised tree data and observations may be retained for the benefit of the community even after account deletion.</p>
</section>

<section>
<h2>11. Children's Privacy</h2>
<p>The Service is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.</p>
</section>

<section>
<h2>12. Changes to This Policy</h2>
<p>We may update this Privacy Policy periodically. We will notify users of material changes through the platform. Continued use of the Service constitutes acceptance of the updated policy.</p>
</section>

<section>
<h2>13. Contact</h2>
<p>If you have questions or concerns about this Privacy Policy or how we handle your data, please email us at <strong>hello@treetag.app</strong>.</p>
</section>`
	},
	{
		slug: 'cookies',
		title: 'Cookie Policy',
		subtitle: 'What cookies we use and how you can manage them.',
		description: 'Information about how Treetag uses cookies and similar technologies.',
		icon: 'Cookie',
		lastUpdated: new Date('2026-03-10'),
		content: `<section>
<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, provide a better user experience, and supply information to the site operators.</p>
</section>

<section>
<h2>2. How We Use Cookies</h2>
<p>Treetag uses a minimal number of cookies, strictly limited to what is necessary for the Service to function. We do not use cookies for advertising, analytics, or third-party tracking purposes.</p>
</section>

<section>
<h2>3. Cookies We Set</h2>
<p>The following cookies are used by Treetag:</p>
<ul>
<li><strong>Session cookie</strong> — an essential cookie that keeps you signed in while you use the Service. This cookie is created when you log in and is removed when you close your browser or your session expires. Without this cookie, you would need to log in again on every page.</li>
</ul>
<p>We do not set any optional, non-essential, or third-party cookies.</p>
</section>

<section>
<h2>4. Third-Party Cookies</h2>
<p>When you use the interactive map, map tiles are loaded from OpenStreetMap tile servers. These servers may set their own cookies or log your IP address. Treetag has no control over these cookies. For more information, see the <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">OpenStreetMap privacy policy</a>.</p>
<p>No other third-party services used by Treetag set cookies in your browser.</p>
</section>

<section>
<h2>5. Managing Cookies</h2>
<p>You can control and delete cookies through your browser settings. Most browsers allow you to:</p>
<ul>
<li>View what cookies are stored and delete them individually</li>
<li>Block cookies from specific or all websites</li>
<li>Set your browser to notify you when a cookie is set</li>
<li>Delete all cookies when you close your browser</li>
</ul>
<p>Please note that blocking or deleting the session cookie will prevent you from staying signed in to Treetag. You will need to log in again each time you visit.</p>
</section>

<section>
<h2>6. Your Consent</h2>
<p>Under the UK Privacy and Electronic Communications Regulations (PECR), strictly necessary cookies do not require consent. Since Treetag only uses a session cookie that is essential for the Service to function, we do not display a cookie consent banner.</p>
<p>If we ever introduce non-essential cookies in the future, we will update this policy and obtain your consent before setting them.</p>
</section>

<section>
<h2>7. Changes to This Policy</h2>
<p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the Service after changes constitutes acceptance of the revised policy.</p>
</section>

<section>
<h2>8. Contact</h2>
<p>If you have any questions about our use of cookies, please email us at <strong>hello@treetag.app</strong>. For broader information about how we handle your data, see our <a href="/legal/privacy">Privacy Policy</a>.</p>
</section>`
	},
	{
		slug: 'aup',
		title: 'Acceptable Use Policy',
		subtitle: 'Standards of behaviour expected from all members of the Treetag community.',
		description: 'Community standards and rules for using the Treetag platform responsibly.',
		icon: 'ShieldAlert',
		lastUpdated: new Date('2026-03-10'),
		content: `<section>
<h2>1. Purpose</h2>
<p>This Acceptable Use Policy sets out the standards of behaviour expected from everyone who uses Treetag. Our goal is to maintain a welcoming, safe, and trustworthy community for tree enthusiasts of all ages in Charlton Kings and beyond. This policy supplements our <a href="/legal/tos">Terms of Service</a>.</p>
</section>

<section>
<h2>2. Expected Behaviour</h2>
<p>We ask all users to:</p>
<ul>
<li>Be respectful and considerate towards other members of the community</li>
<li>Submit honest and accurate tree observations, health reports, and species identifications</li>
<li>Only upload photographs that you have taken yourself or have permission to use</li>
<li>Report genuine concerns about tree health, disease, or damage</li>
<li>Respect the physical environment — do not damage trees, wildlife habitats, or QR code tags</li>
<li>Keep your account credentials private and secure</li>
</ul>
</section>

<section>
<h2>3. Prohibited Content</h2>
<p>You must not upload, post, or share content that:</p>
<ul>
<li>Is abusive, threatening, harassing, or discriminatory towards any person or group</li>
<li>Contains sexually explicit material or graphic violence</li>
<li>Is deliberately false, misleading, or intended to deceive other users</li>
<li>Infringes the intellectual property rights of others (including photographs you do not own)</li>
<li>Contains malware, viruses, or links to malicious websites</li>
<li>Promotes illegal activities or encourages harm to people, animals, or the environment</li>
<li>Contains personal information about other individuals without their consent</li>
</ul>
</section>

<section>
<h2>4. Prohibited Activities</h2>
<p>You must not:</p>
<ul>
<li>Create multiple accounts to manipulate the points system or leaderboard</li>
<li>Submit fabricated observations or spam the platform with low-quality content</li>
<li>Attempt to access another user's account or personal data</li>
<li>Use automated tools to scrape, crawl, or extract data from the Service</li>
<li>Interfere with the Service's infrastructure, performance, or availability</li>
<li>Use the platform for advertising, commercial promotion, or solicitation</li>
<li>Tamper with, remove, or deface physical QR codes placed on or near trees</li>
<li>Impersonate another person, organisation, or Treetag staff member</li>
</ul>
</section>

<section>
<h2>5. Tree &amp; Environmental Responsibility</h2>
<p>Treetag is a platform for observing and caring for trees, not for intervening directly. You must not:</p>
<ul>
<li>Attempt tree surgery, pruning, treatment, or removal based on platform observations</li>
<li>Damage trees, bark, branches, or root systems while tagging or photographing</li>
<li>Disturb wildlife nesting sites, habitats, or protected species</li>
<li>Trespass on private land to access or photograph trees</li>
</ul>
<p>If you are concerned about a tree's health or safety, contact Cheltenham Borough Council or Gloucestershire County Council rather than attempting to act yourself.</p>
</section>

<section>
<h2>6. Reporting Violations</h2>
<p>If you encounter content or behaviour that violates this policy, please report it to us at <strong>hello@treetag.app</strong>. Include as much detail as possible, such as the username involved, the tree profile or observation in question, and a description of the issue. All reports will be reviewed promptly.</p>
</section>

<section>
<h2>7. Enforcement</h2>
<p>We reserve the right to take action against users who violate this policy. Depending on the severity and frequency of the violation, action may include:</p>
<ul>
<li>A warning or request to remove offending content</li>
<li>Temporary suspension of your account</li>
<li>Permanent removal of your account and associated data</li>
<li>Removal of content, observations, or photographs</li>
<li>Resetting or adjusting points earned through abuse</li>
</ul>
<p>Serious violations — including harassment, illegal activity, or deliberate sabotage — may result in immediate account termination without prior warning.</p>
</section>

<section>
<h2>8. Changes to This Policy</h2>
<p>We may update this Acceptable Use Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the Service after changes constitutes acceptance of the revised policy.</p>
</section>

<section>
<h2>9. Contact</h2>
<p>If you have any questions about this policy, please email us at <strong>hello@treetag.app</strong>.</p>
</section>`
	},
	{
		slug: 'accessibility',
		title: 'Accessibility Statement',
		subtitle: 'Our commitment to making Treetag accessible to everyone.',
		description: 'How we work to ensure Treetag is usable and inclusive for all.',
		icon: 'Accessibility',
		lastUpdated: new Date('2026-03-10'),
		content: `<section>
<h2>1. Our Commitment</h2>
<p>Treetag is committed to making our platform accessible to as many people as possible, regardless of ability or disability. We want everyone in the Charlton Kings community — and beyond — to be able to discover, tag, and care for local trees using our Service.</p>
</section>

<section>
<h2>2. Standards</h2>
<p>We aim to meet the <strong>Web Content Accessibility Guidelines (WCAG) 2.1</strong> at Level AA. These guidelines explain how to make web content more accessible to people with disabilities, including those with visual, auditory, motor, and cognitive impairments.</p>
</section>

<section>
<h2>3. What We Do</h2>
<p>To support accessibility, Treetag includes the following features:</p>
<ul>
<li><strong>Semantic HTML</strong> — we use meaningful headings, landmarks, and page structure to support screen readers and assistive technologies</li>
<li><strong>Keyboard navigation</strong> — all interactive elements can be accessed and operated using a keyboard alone</li>
<li><strong>Colour contrast</strong> — text and interface elements meet the minimum contrast ratios recommended by WCAG 2.1 AA</li>
<li><strong>Responsive design</strong> — the Service is designed for use on mobile devices, tablets, and desktops of all sizes</li>
<li><strong>Alt text</strong> — images include descriptive alternative text where possible</li>
<li><strong>Form labels</strong> — all form inputs are associated with visible labels for clarity</li>
<li><strong>Focus indicators</strong> — visible focus outlines are provided for keyboard users navigating the interface</li>
</ul>
</section>

<section>
<h2>4. Known Limitations</h2>
<p>We are aware of the following areas where accessibility may be limited:</p>
<ul>
<li><strong>Interactive map</strong> — the map used for browsing tree locations relies on a third-party component (OpenStreetMap/Leaflet) which may not be fully accessible to screen reader users. We provide alternative text-based tree listings where possible.</li>
<li><strong>User-uploaded photos</strong> — photographs uploaded by community members may not always include descriptive alt text. We encourage users to add descriptions when uploading.</li>
<li><strong>PDF documents</strong> — if any linked documents are provided in PDF format, they may not be fully accessible. Contact us if you need content in an alternative format.</li>
</ul>
<p>We are actively working to improve these areas.</p>
</section>

<section>
<h2>5. Feedback</h2>
<p>We welcome feedback on the accessibility of Treetag. If you experience any difficulty using the Service, or have suggestions for improvement, please contact us:</p>
<ul>
<li><strong>Email:</strong> hello@treetag.app</li>
</ul>
<p>We will do our best to respond within 5 working days and to address any issues raised.</p>
</section>

<section>
<h2>6. Enforcement</h2>
<p>If you are not satisfied with our response to your accessibility concern, you can contact the <a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noopener noreferrer">Equality Advisory and Support Service (EASS)</a>, which provides advice and assistance on discrimination and equality issues in England, Scotland, and Wales.</p>
</section>

<section>
<h2>7. Changes to This Statement</h2>
<p>This statement was prepared on 10 March 2026. We will review and update it regularly as we continue to improve the accessibility of the Service.</p>
</section>`
	}
];

async function seed() {
	await mongoose.connect(DATABASE_URL!, { dbName: 'treetag' });
	console.log('Connected to MongoDB');

	for (const doc of documents) {
		await LegalDocumentModel.findOneAndUpdate({ slug: doc.slug }, doc, { upsert: true });
		console.log(`Upserted: ${doc.title}`);
	}

	console.log('Seeding complete');
	await mongoose.disconnect();
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
