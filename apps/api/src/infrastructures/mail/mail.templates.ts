export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

function layout(paragraphs: string[], cta: { label: string; url: string }): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px">${escapeHtml(p)}</p>`).join('');
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1c1917;max-width:520px;margin:0 auto;padding:24px">
${body}<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="background:#4338ca;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">${escapeHtml(cta.label)}</a></p>
<p style="color:#78716c;font-size:13px">${escapeHtml(cta.url)}</p></body></html>`;
}

const fr = (locale: string) => locale !== 'en';

export function invitationEmail(m: {
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
}): EmailContent {
  const lines = [
    `${m.inviterName} vous invite à rejoindre « ${m.workspaceName} » sur OpenTask.`,
    `${m.inviterName} invited you to join “${m.workspaceName}” on OpenTask.`,
    'Ce lien expire dans 7 jours. / This link expires in 7 days.',
  ];
  return {
    subject: `Invitation : ${m.workspaceName} — OpenTask`,
    text: `${lines.join('\n\n')}\n\n${m.inviteUrl}\n`,
    html: layout(lines, { label: 'Rejoindre / Join', url: m.inviteUrl }),
  };
}

export function verificationEmail(m: { name: string; url: string; locale: string }): EmailContent {
  const lines = fr(m.locale)
    ? [`Bonjour ${m.name},`, 'Confirmez votre adresse e-mail pour activer votre compte OpenTask.']
    : [`Hi ${m.name},`, 'Please confirm your email address to activate your OpenTask account.'];
  const label = fr(m.locale) ? 'Confirmer mon adresse' : 'Confirm my email';
  return {
    subject: fr(m.locale)
      ? 'Confirmez votre adresse e-mail — OpenTask'
      : 'Confirm your email — OpenTask',
    text: `${lines.join('\n\n')}\n\n${m.url}\n`,
    html: layout(lines, { label, url: m.url }),
  };
}

export function passwordResetEmail(m: { name: string; url: string; locale: string }): EmailContent {
  const lines = fr(m.locale)
    ? [
        `Bonjour ${m.name},`,
        'Une réinitialisation de mot de passe a été demandée pour votre compte. Ce lien expire dans une heure.',
        'Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.',
      ]
    : [
        `Hi ${m.name},`,
        'A password reset was requested for your account. This link expires in one hour.',
        'If you did not request it, you can ignore this email.',
      ];
  const label = fr(m.locale) ? 'Choisir un nouveau mot de passe' : 'Choose a new password';
  return {
    subject: fr(m.locale)
      ? 'Réinitialisation du mot de passe — OpenTask'
      : 'Reset your password — OpenTask',
    text: `${lines.join('\n\n')}\n\n${m.url}\n`,
    html: layout(lines, { label, url: m.url }),
  };
}
