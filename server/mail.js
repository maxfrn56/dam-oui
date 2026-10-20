import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "Dam'Oui <beth.t@example.com>";
const NOTIFY =
  process.env.RESEND_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL ?? "ferdibakha@icloud.com";

function formatDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function shell(title, body) {
  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#efe8dc;font-family:Georgia,'Times New Roman',serif;color:#21201c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efe8dc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#f7f2ea;border-radius:16px;padding:36px 32px;">
            <tr>
              <td style="text-align:center;letter-spacing:0.28em;text-transform:uppercase;font-family:Arial,sans-serif;font-size:11px;color:#ff5a3c;">
                Dam'Oui · Saint-Pierre-Quiberon
              </td>
            </tr>
            <tr>
              <td style="padding:18px 0 8px;text-align:center;font-size:28px;line-height:1.2;">${title}</td>
            </tr>
            <tr>
              <td style="font-family:Arial,sans-serif;font-size:15px;line-height:1.65;color:#4a463f;">${body}</td>
            </tr>
            <tr>
              <td style="padding-top:28px;font-family:Arial,sans-serif;font-size:12px;color:#8a8174;text-align:center;">
                15 avenue du Général de Gaulle, 56510 Saint-Pierre-Quiberon<br />
                07 66 70 50 09
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function details(reservation) {
  return `
    <table role="presentation" width="100%" style="margin:18px 0;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td style="padding:6px 0;color:#8a8174;">Date</td><td style="padding:6px 0;text-align:right;"><strong>${formatDate(reservation.date)}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#8a8174;">Heure</td><td style="padding:6px 0;text-align:right;"><strong>${reservation.time}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#8a8174;">Couverts</td><td style="padding:6px 0;text-align:right;"><strong>${reservation.covers}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#8a8174;">Nom</td><td style="padding:6px 0;text-align:right;"><strong>${reservation.firstName} ${reservation.lastName}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#8a8174;">Téléphone</td><td style="padding:6px 0;text-align:right;">${reservation.phone}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8174;">E-mail</td><td style="padding:6px 0;text-align:right;">${reservation.email}</td></tr>
    </table>`;
}

export async function sendBookingEmails(reservation) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[mail] RESEND_API_KEY absent — e-mails non envoyés (réservation enregistrée).");
    return { skipped: true };
  }

  const resend = new Resend(key);
  const when = `${formatDate(reservation.date)} à ${reservation.time}`;

  const client = await resend.emails.send({
    from: FROM,
    to: reservation.email,
    replyTo: NOTIFY,
    subject: `Votre table est réservée — Dam'Oui, ${when}`,
    html: shell(
      "C'est réservé.",
      `<p>Bonjour ${reservation.firstName},</p>
       <p>Votre table est confirmée chez Dam'Oui. Nous avons hâte de vous accueillir.</p>
       ${details(reservation)}
       <p>Pour modifier ou annuler, appelez-nous au 07 66 70 50 09.</p>
       <p>À très vite,<br />L'équipe Dam'Oui</p>`
    ),
  });

  const restaurant = await resend.emails.send({
    from: FROM,
    to: NOTIFY,
    replyTo: reservation.email,
    subject: `Nouvelle réservation — ${reservation.covers} couvert${reservation.covers > 1 ? "s" : ""} le ${when}`,
    html: shell(
      "Nouvelle réservation",
      `<p>Une table vient d'être réservée sur le site.</p>
       ${details(reservation)}
       <p>Retrouvez-la dans l'espace restaurateur.</p>`
    ),
  });

  if (client.error) console.error("[mail] client", client.error);
  if (restaurant.error) console.error("[mail] restaurant", restaurant.error);
  return { client, restaurant };
}
