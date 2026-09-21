// Membership settings.
//
// Fill in publicKey and priceId after creating the Memberstack account.
// Until both are filled in, the site shows "Memberships are opening soon".
//
// The public key is designed to be visible in website code. Never paste a
// secret key (anything starting with sk_) into this file.
export const membership = {
  publicKey: '', // Memberstack public key: pk_sb_... (test mode) or pk_... (live)
  priceId: '', // Price ID of the $20/month plan: prc_...
  planId: '', // Optional: Plan ID (pln_...). If set, only this plan counts as a member.
  priceLabel: '$20',
  intervalLabel: 'month',
}

// What members see on the members-only page. Edit freely.
// Member events themselves are added in events.config.js.
export const memberContent = {
  welcome: 'Welcome to the members lounge!',
  announcement: 'Thanks for being a member. Member-only events show full details in the calendar.',
}
