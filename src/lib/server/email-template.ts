import { APP_URL } from '$env/static/private';

interface EmailTemplateOptions {
	heading: string;
	preheader?: string;
	body: string;
	buttonText: string;
	buttonUrl: string;
	footnote?: string;
}

export function emailTemplate({
	heading,
	preheader,
	body,
	buttonText,
	buttonUrl,
	footnote
}: EmailTemplateOptions): string {
	const baseUrl = APP_URL ?? 'http://localhost:5173';

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${heading}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
* { font-family: 'DM Sans', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
a.btn-cta { background: linear-gradient(135deg,#16a34a,#15803d); transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
a.btn-cta:hover { transform: translateY(-1px); filter: brightness(1.08); }
a.btn-cta .btn-arrow { display: inline-block; transition: transform 0.25s cubic-bezier(0.16,1,0.3,1); }
a.btn-cta:hover .btn-arrow { transform: translateX(4px); }
</style>
<!--[if mso]>
<style>
* { font-family: 'Segoe UI', Arial, sans-serif !important; }
</style>
<![endif]-->
${preheader ? `<!--[if !mso]><!--><span style="display:none;max-height:0;overflow:hidden;">${preheader}</span><!--<![endif]-->` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:'DM Sans','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;">
<tr><td align="center" style="padding:40px 16px;">

<!-- Container -->
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#15803d 0%,#16a34a 40%,#22c55e 100%);padding:36px 40px;text-align:center;">
	<img src="https://cdn.treetag.joshbaker.gg/assets/logo-email.png" alt="Treetag" width="160" style="display:block;margin:0 auto;" />
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px 40px 32px;">
	<h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#1c1917;letter-spacing:-0.3px;line-height:1.3;">
		${heading}
	</h1>
	<p style="margin:0 0 28px;font-family:'DM Sans','Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:#57534e;">
		${body}
	</p>

	<!-- Button -->
	<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 0 0;">
	<tr>
		<td style="border-radius:10px;background:linear-gradient(135deg,#16a34a,#15803d);">
			<a class="btn-cta" href="${buttonUrl}" target="_blank" style="display:inline-block;padding:13px 32px;border-radius:10px;font-family:'DM Sans','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;mso-line-height-rule:exactly;">
				${buttonText} <span class="btn-arrow"><img src="https://cdn.treetag.joshbaker.gg/assets/arrow-right.png" alt="" width="14" height="14" style="vertical-align:middle;margin-left:6px;display:inline-block;" /></span>
			</a>
		</td>
	</tr>
	</table>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 40px;">
	<hr style="border:none;border-top:1px solid #e7e5e4;margin:0;" />
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 40px 32px;">
	<p style="margin:0 0 8px;font-family:'DM Sans','Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.6;color:#a8a29e;">
		${footnote ?? "If you didn't request this email, you can safely ignore it."}
	</p>
	<p style="margin:0;font-family:'DM Sans','Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.6;color:#a8a29e;">
		<a href="${baseUrl}" style="color:#16a34a;text-decoration:none;">Treetag</a> &mdash; Charlton Kings Tree Heritage
	</p>
</td>
</tr>

</table>
<!-- /Container -->

</td></tr>
</table>
</body>
</html>`;
}
