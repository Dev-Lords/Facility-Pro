export default function TermsOfUsePage() {
  const terms = [
    {
      number: 1,
      title: "Introduction",
      bullets: [
        "Use the platform only for lawful and authorized purposes.",
        "Respect all users, staff, and property.",
        "Follow all community and facility guidelines.",
        "We reserve the right to update these terms at any time.",
      ],
    },
    {
      number: 2,
      title: "Booking Facilities",
      bullets: [
        "You can book up to 3 hours per day per team.",
        "Full-day events require prior approval from facility management.",
        "Access up to 4 different sports facilities per user account.",
        "Always adhere to the facility's usage policies.",
      ],
    },
    {
      number: 3,
      title: "Community Guidelines",
      bullets: [
        "Treat all users, staff, and facilities with respect and courtesy.",
        "Avoid offensive behavior, vandalism, or misuse of resources.",
        "Report any issues or misconduct via the app.",
        "Violations may lead to suspension of your account.",
      ],
    },
    {
      number: 4,
      title: "Data Usage & Privacy",
      bullets: [
        "We collect booking data, facility feedback, and issue reports.",
        "Your data is never sold or shared without consent.",
        "Data is securely stored and used only to improve the platform.",
        "You may request deletion of your account or data at any time.",
      ],
    },
    {
      number: 5,
      title: "Changes to Terms",
      bullets: [
        "You’ll be notified of important changes via email or app alerts.",
        "Continued use means you accept the new terms.",
        "We recommend reviewing the terms regularly.",
      ],
    },
    {
      number: 6,
      title: "Contact Us",
      bullets: [
        "Email us at support@faciltypro.app for any questions or concerns.",
        "We aim to respond within 48 hours on weekdays.",
      ],
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
      <header>
        <h1 className="text-4xl font-bold mb-4">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Last updated: May 25, 2025</p>
      </header>

      {terms.map(({ number, title, bullets }) => (
        <section key={number}>
          <h2 className="text-2xl font-semibold mb-2">
            {number}. {title}
          </h2>
          <ul className="list-disc list-inside ml-6 space-y-1 text-base leading-relaxed">
            {bullets.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

