import { useState, useEffect } from 'react';
import { Shield, FileText, Users, Database, Bell, Mail, ChevronDown, ChevronUp } from 'lucide-react';

export default function TermsOfUsePage() {
  const [activeSection, setActiveSection] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const terms = [
    {
      number: 1,
      title: "Introduction",
      icon: FileText,
      color: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
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
      icon: Shield,
      color: "linear-gradient(135deg, #10b981, #0d9488)",
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
      icon: Users,
      color: "linear-gradient(135deg, #f97316, #dc2626)",
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
      icon: Database,
      color: "linear-gradient(135deg, #8b5cf6, #ec4899)",
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
      icon: Bell,
      color: "linear-gradient(135deg, #eab308, #f97316)",
      bullets: [
        "You'll be notified of important changes via email or app alerts.",
        "Continued use means you accept the new terms.",
        "We recommend reviewing the terms regularly.",
      ],
    },
    {
      number: 6,
      title: "Contact Us",
      icon: Mail,
      color: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      bullets: [
        "Email us at support@faciltypro.app for any questions or concerns.",
        "We aim to respond within 48 hours on weekdays.",
      ],
    },
  ];

  const toggleSection = (number) => {
    setActiveSection(activeSection === number ? null : number);
  };

  const styles = {
    main: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #dbeafe 50%, #fae8ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    container: {
      position: 'relative',
      maxWidth: '64rem',
      margin: '0 auto',
      padding: '4rem 1.5rem',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
      transition: 'all 1s ease-in-out'
    },
    header: {
      textAlign: 'center',
      marginBottom: '4rem'
    },
    iconContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '5rem',
      height: '5rem',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      borderRadius: '1rem',
      marginBottom: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      transform: 'scale(1)',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    },
    title: {
      fontSize: '3.75rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1e293b, #3b82f6, #8b5cf6)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      lineHeight: '1.1'
    },
    subtitle: {
      display: 'inline-block',
      padding: '0.5rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '9999px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      color: '#475569',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    sectionsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    article: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(2rem)',
      transition: 'all 0.5s ease-in-out'
    },
    section: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transform: 'scale(1)',
      transition: 'all 0.3s ease'
    },
    button: {
      width: '100%',
      padding: '1.5rem',
      textAlign: 'left',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '1rem',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    buttonHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    buttonLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    sectionIcon: {
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transform: 'scale(1)',
      transition: 'transform 0.3s ease'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    sectionSubtitle: {
      color: '#64748b',
      fontSize: '0.875rem'
    },
    chevron: {
      color: '#94a3b8',
      transition: 'color 0.3s ease'
    },
    expandedContent: {
      overflow: 'hidden',
      transition: 'all 0.5s ease-in-out'
    },
    contentInner: {
      padding: '0 1.5rem 1.5rem 1.5rem'
    },
    divider: {
      border: 'none',
      borderTop: '1px solid #e2e8f0',
      margin: '0 0 1.5rem 0'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    listItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      color: '#374151',
      lineHeight: '1.6',
      transition: 'all 0.3s ease'
    },
    bullet: {
      width: '0.5rem',
      height: '0.5rem',
      borderRadius: '50%',
      marginTop: '0.5rem',
      flexShrink: 0,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    footer: {
      marginTop: '4rem',
      textAlign: 'center'
    },
    footerSection: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    footerTitle: {
      color: 'white',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    footerText: {
      color: '#dbeafe',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    footerButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)'
    }
  };

  return (
    <main style={styles.main}>
      <section style={styles.container}>
        <header style={styles.header}>
          <figure 
            style={styles.iconContainer}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <FileText size={40} color="white" />
          </figure>
          <h1 style={styles.title}>Terms of Use</h1>
          <p style={styles.subtitle}>Last updated: May 25, 2025</p>
        </header>

        <section style={styles.sectionsContainer}>
          {terms.map(({ number, title, icon: Icon, color, bullets }, index) => (
            <article
              key={number}
              style={{
                ...styles.article,
                transitionDelay: `${index * 100}ms`
              }}
            >
              <section 
                style={styles.section}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
              >
                <button
                  onClick={() => toggleSection(number)}
                  style={styles.button}
                  onFocus={(e) => e.target.style.outline = '4px solid rgba(139, 92, 246, 0.3)'}
                  onBlur={(e) => e.target.style.outline = 'none'}
                >
                  <header style={styles.buttonHeader}>
                    <section style={styles.buttonLeft}>
                      <figure 
                        style={{
                          ...styles.sectionIcon,
                          background: color
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <Icon size={28} color="white" />
                      </figure>
                      <section>
                        <h2 style={styles.sectionTitle}>
                          {number}. {title}
                        </h2>
                        <p style={styles.sectionSubtitle}>
                          {bullets.length} {bullets.length === 1 ? 'guideline' : 'guidelines'}
                        </p>
                      </section>
                    </section>
                    <figure style={styles.chevron}>
                      {activeSection === number ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </figure>
                  </header>
                </button>

                <section style={{
                  ...styles.expandedContent,
                  maxHeight: activeSection === number ? '24rem' : '0',
                  opacity: activeSection === number ? 1 : 0
                }}>
                  <section style={styles.contentInner}>
                    <hr style={styles.divider} />
                    <ul style={styles.list}>
                      {bullets.map((item, bulletIndex) => (
                        <li
                          key={bulletIndex}
                          style={{
                            ...styles.listItem,
                            opacity: activeSection === number ? 1 : 0,
                            transform: activeSection === number ? 'translateX(0)' : 'translateX(1rem)',
                            transitionDelay: `${bulletIndex * 100}ms`
                          }}
                        >
                          <figure style={{
                            ...styles.bullet,
                            background: color
                          }}></figure>
                          <p style={{flex: 1}}>{item}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </section>
              </section>
            </article>
          ))}
        </section>

        <footer style={styles.footer}>
          <section style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Questions about these terms?</h3>
            <p style={styles.footerText}>Our support team is here to help</p>
            <button 
              style={styles.footerButton}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              Contact Support
            </button>
          </section>
        </footer>
      </section>
    </main>
  );
}