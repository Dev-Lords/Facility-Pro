import { useState, useEffect } from 'react';
import { HelpCircle, Search, Clock, MapPin, Users, Shield, Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const faqData = [
    {
      category: 'booking',
      icon: Clock,
      question: "How do I book a facility?",
      answer: "Simply browse our available facilities including Basketball Courts, Swimming Pools, Tennis Courts, Soccer Fields, and Gyms. Select your preferred time slot, choose the duration (up to 3 hours per day), and confirm your booking. You'll receive instant confirmation with all the details."
    },
    {
      category: 'booking',
      icon: Clock,
      question: "What are the booking limits?",
      answer: "Each team can book up to 3 hours per day across our facilities. You can access up to 4 different sports facilities per user account. This ensures fair access for all community members while giving you flexibility to enjoy multiple sports."
    },
    {
      category: 'booking',
      icon: Clock,
      question: "Can I book facilities for full-day events?",
      answer: "Yes! Full-day events like tournaments or competitions require prior approval from facility management. Contact our support team at support@facilitypro.app with your event details, and we'll work with you to accommodate your needs."
    },
    {
      category: 'facilities',
      icon: MapPin,
      question: "What types of facilities are available?",
      answer: "We offer premium facilities including: Basketball Courts with professional lighting, Olympic-sized Swimming Pools for all skill levels, Tennis Courts (hard and clay) with night lighting, full-size Soccer Fields with quality turf, and multi-purpose Gyms for various sports activities."
    },
    {
      category: 'facilities',
      icon: Star,
      question: "Are the facilities professionally maintained?",
      answer: "Absolutely! All our facilities are professional-grade with top-notch amenities and equipment. We maintain high standards through regular inspections, community ratings, and feedback systems to ensure you always have access to premium sports experiences."
    },
    {
      category: 'facilities',
      icon: MapPin,
      question: "Do facilities have night lighting?",
      answer: "Yes! Our Basketball Courts feature professional lighting systems, and Tennis Courts are equipped with night lighting for extended play hours. This allows you to enjoy your favorite sports even after sunset."
    },
    {
      category: 'community',
      icon: Users,
      question: "Can I participate in tournaments and competitions?",
      answer: "Definitely! Our platform facilitates community management where you can participate in tournaments, competitions, and build long-lasting sports communities. Connect with other players, join leagues, and enhance your sports experience."
    },
    {
      category: 'community',
      icon: Users,
      question: "How do I connect with other players?",
      answer: "Through our community features, you can connect with other sports enthusiasts, join existing groups, or create your own teams. Our platform helps build lasting relationships within the sports community."
    },
    {
      category: 'support',
      icon: Shield,
      question: "What if I encounter issues during my booking?",
      answer: "Our support team is available to help! Report any issues or concerns via the app or email us at support@facilitypro.app. We aim to respond within 48 hours on weekdays and will work quickly to resolve any problems."
    },
    {
      category: 'support',
      icon: Shield,
      question: "How do you ensure facility quality?",
      answer: "All facilities are verified and rated by our community of users. We have a comprehensive quality assurance system that includes regular inspections, user feedback, and continuous monitoring to maintain the highest standards."
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'booking', name: 'Booking & Scheduling', icon: Clock },
    { id: 'facilities', name: 'Facilities & Equipment', icon: MapPin },
    { id: 'community', name: 'Community & Events', icon: Users },
    { id: 'support', name: 'Support & Help', icon: Shield }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const styles = {
    main: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    container: {
      position: 'relative',
      maxWidth: '80rem',
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
      background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      borderRadius: '1rem',
      marginBottom: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
      transform: 'scale(1)',
      transition: 'transform 0.3s ease'
    },
    title: {
      fontSize: '4rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1e293b, #334155, #475569)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      lineHeight: '1.1'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1.25rem',
      maxWidth: '32rem',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    searchSection: {
      marginBottom: '3rem'
    },
    searchContainer: {
      position: 'relative',
      maxWidth: '32rem',
      margin: '0 auto'
    },
    searchInput: {
      width: '100%',
      padding: '1rem 1rem 1rem 3rem',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '1rem',
      color: '#1e293b',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b'
    },
    categoriesSection: {
      marginBottom: '3rem'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      maxWidth: '64rem',
      margin: '0 auto'
    },
    categoryButton: {
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(59, 130, 246, 0.15)',
      borderRadius: '0.75rem',
      color: '#334155',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
    },
    activeCategoryButton: {
      background: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      color: '#1e40af',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25)'
    },
    faqSection: {
      maxWidth: '56rem',
      margin: '0 auto'
    },
    faqGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    faqItem: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(59, 130, 246, 0.15)',
      borderRadius: '1rem',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    faqButton: {
      width: '100%',
      padding: '1.5rem',
      background: 'none',
      border: 'none',
      color: '#1e293b',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    questionLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flex: 1
    },
    questionIcon: {
      width: '2.5rem',
      height: '2.5rem',
      background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    questionText: {
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.5'
    },
    chevron: {
      color: '#64748b',
      transition: 'transform 0.3s ease'
    },
    answer: {
      overflow: 'hidden',
      transition: 'all 0.5s ease-in-out'
    },
    answerContent: {
      padding: '0 1.5rem 1.5rem 1.5rem'
    },
    answerText: {
      color: '#475569',
      lineHeight: '1.7',
      fontSize: '1rem',
      paddingLeft: '3.5rem'
    },
    stats: {
      marginTop: '4rem',
      textAlign: 'center'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      maxWidth: '48rem',
      margin: '2rem auto 0'
    },
    statItem: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(59, 130, 246, 0.15)',
      borderRadius: '1rem',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.875rem'
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
            <HelpCircle size={40} color="white" />
          </figure>
          <h1 style={styles.title}>Frequently Asked Questions</h1>
          <p style={styles.subtitle}>
            Find answers to common questions about Facility Pro, our booking system, and premium sports facilities.
          </p>
        </header>

        <section style={styles.searchSection}>
          <section style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            />
          </section>
        </section>

        <section style={styles.categoriesSection}>
          <section style={styles.categoriesGrid}>
            {categories.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                style={{
                  ...styles.categoryButton,
                  ...(activeCategory === id ? styles.activeCategoryButton : {})
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== id) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== id) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <Icon size={18} />
                {name}
              </button>
            ))}
          </section>
        </section>

        <section style={styles.faqSection}>
          <section style={styles.faqGrid}>
            {filteredFAQs.map((faq, index) => {
              const IconComponent = faq.icon;
              const isActive = activeQuestion === index;
              
              return (
                <article
                  key={index}
                  style={{
                    ...styles.faqItem,
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    borderColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
                    boxShadow: isActive ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    style={styles.faqButton}
                    onFocus={(e) => e.target.style.outline = '2px solid rgba(59, 130, 246, 0.5)'}
                    onBlur={(e) => e.target.style.outline = 'none'}
                  >
                    <section style={styles.questionLeft}>
                      <figure style={styles.questionIcon}>
                        <IconComponent size={20} color="white" />
                      </figure>
                      <h3 style={styles.questionText}>{faq.question}</h3>
                    </section>
                    <figure style={{
                      ...styles.chevron,
                      transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      <ChevronDown size={20} />
                    </figure>
                  </button>

                  <section style={{
                    ...styles.answer,
                    maxHeight: isActive ? '20rem' : '0',
                    opacity: isActive ? 1 : 0
                  }}>
                    <section style={styles.answerContent}>
                      <p style={styles.answerText}>{faq.answer}</p>
                    </section>
                  </section>
                </article>
              );
            })}
          </section>
        </section>

      </section>
    </main>
  );
}