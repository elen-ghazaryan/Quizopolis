import { Palette, Microscope, Atom, Globe, Calculator, BookOpen, Landmark, Heart, BarChart3, Users, Zap, MessageSquare, Filter, Star, PenTool, Frown, Smile } from 'lucide-react';
import styles from './intro.module.css';
import Button from '../../../UI/Button';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { Link } from 'react-router-dom';


export const Intro: React.FC = () => {
  const { ref: leftRef, inView: leftInView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { ref: rightRef, inView: rightInView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { ref: toptRef, inView: topInView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const handleAnswer = (answer: string) => {
    setQuizAnswer(answer);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.overlay}></div>

        <div className={styles.wrapper}>
        <div className={styles.grid}>
          {/* Left Section */}
          <div 
            className={`${styles.leftSection} slide-in-left ${leftInView ? 'active' : ''}`}
            ref={leftRef}
          >
            <h1 className={styles.heading}>Quizopolis</h1>
            <h3 className={styles.description}>
              From arts to science, math to history, Quizopolis has quizzes for every brain — play, learn, and show off your skills!
            </h3>
             <Link to={"/signup"}>
              <Button text="Explore now" style={{ width: '100%', fontFamily: "Elms Sans", fontWeight: 700}} />
             </Link>
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>

            {/* Categories Grid */}
            <div className={styles.categoriesGrid}>
              <div className={styles.categoryCard}>
                <Palette className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Art</p>
              </div>

              <div className={styles.categoryCard}>
                <Microscope className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Science</p>
              </div>

              <div className={styles.categoryCard}>
                <Globe className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Weather</p>
              </div>

              <div className={styles.categoryCard}>
                <Atom className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Physics</p>
              </div>

              <div className={styles.categoryCard}>
                <Globe className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Geography</p>
              </div>

              <div className={styles.categoryCard}>
                <Calculator className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Math</p>
              </div>

              <div className={styles.categoryCard}>
                <BookOpen className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Language</p>
              </div>

              <div className={styles.categoryCard}>
                <Landmark className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Astronomy</p>
              </div>

              <div className={styles.categoryCard}>
                <Heart className={styles.icon} strokeWidth={1.5} />
                <p className={styles.categoryName}>Health</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Second Section - Features */}
    
      <div className={styles.bigSection}>
      <div className={styles.featuresSection}>
        <div className={styles.featuresWrapper}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>Powerful Features for Everyone</h2>
            <p className={styles.featuresSubtitle}>Everything you need to create, share, and master quizzes</p>
          </div>

          <div className={styles.featuresContent}>
            {/* Left side - Main feature showcase */}
            <div className={styles.mainFeature}>
              <div className={styles.mainFeatureCard}>
                <div className={styles.mainFeatureIcon}>
                  <PenTool size={48} strokeWidth={1.5} />
                </div>
                <h3 className={styles.mainFeatureTitle}>Create & Publish Quizzes</h3>
                <p className={styles.mainFeatureText}>
                  Design custom quizzes with our intuitive builder. Save as drafts to refine later, 
                  or publish instantly to share with the world. Your creativity, your rules.
                </p>
                <div className={styles.mainFeatureBadges}>
                  <span className={styles.badge}>Draft Mode</span>
                  <span className={styles.badge}>Instant Publish</span>
                  <span className={styles.badge}>Easy Editor</span>
                </div>
              </div>
            </div>

            {/* Right side - Feature grid */}
            <div 
              className={`${styles.featuresGrid} slide-in-right ${rightInView ? 'active' : ''}`}
              ref={rightRef}  
            >
              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <Users className={styles.featureIcon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>Student Participation</h3>
                <p className={styles.featureCardText}>Students can easily take quizzes and track their progress</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <Star className={styles.featureIcon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>Save Favorites</h3>
                <p className={styles.featureCardText}>Bookmark your favorite quizzes for quick access anytime</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <Zap className={styles.featureIcon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>Live Quizzes</h3>
                <p className={styles.featureCardText}>Host real-time quiz sessions with live scoreboards</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <BarChart3 className={styles.featureIcon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>Personal Dashboard</h3>
                <p className={styles.featureCardText}>Analyze your performance with detailed statistics</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <MessageSquare className={styles.featureIcon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>Quiz Comments</h3>
                <p className={styles.featureCardText}>Share feedback and engage with quiz creators</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <Filter className={styles.featureIcon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.featureCardTitle}>Smart Filters</h3>
                <p className={styles.featureCardText}>Find quizzes by category, difficulty, and topic</p>
              </div>
            </div>
          </div>

          {/* Floating elements for decoration */}
          <div className={styles.floatingElement1}></div>
          <div className={styles.floatingElement2}></div>
          <div className={styles.floatingElement3}></div>
        </div>
      </div>

      <div className={styles.line}></div>

      {/* Third Section - Stats */}
      <div 
        className={`${styles.statsSection} slide-in-top ${topInView ? 'active' : ''}`}
        ref={toptRef}  
      >
        <div className={styles.statsWrapper}>
          <h2 className={styles.statsTitle}>Join Our Growing Community</h2>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10k+</div>
              <div className={styles.statLabel}>Active Users</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>1K+</div>
              <div className={styles.statLabel}>Quizzes Available</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Topics Covered</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Satisfaction Rate</div>
            </div>
          </div>

          {/* Mini Quiz Demo */}
        <div className={`${styles.quizDemo} slide-in-left active`}>
          <h3 className={styles.quizTitle}>Try a Mini Quiz!</h3>
          <p className={styles.quizQuestion}>What is the capital of France?</p>
          <div className={styles.quizOptions}>
            {['Paris', 'London', 'Rome', 'Berlin'].map(option => (
              <button
                key={option}
                className={`${styles.quizOption} ${quizAnswer === option ? styles.selected : ''}`}
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
          
          {quizAnswer && (
            <p className={styles.quizFeedback}>
              {quizAnswer === 'Paris' ? (
                <>
                  <Smile color="green" size={20} style={{ marginRight: '5px' }} />
                  Correct!
                </>
              ) : (
                <>
                  <Frown color="red" size={20} style={{ marginRight: '5px' }} />
                  Try Again!
                </>
              )}
            </p>
          )}
        </div>

          <div className={styles.ctaSection}>
            <h3 className={styles.ctaTitle}>Ready to Test Your Knowledge?</h3>
            <p className={styles.ctaText}>Start your learning journey today and discover how fun education can be!</p>
            <Link to={"/signup"}>
              <Button text="Get Started" style={{ width: 'auto', padding: '16px 48px', fontFamily: "Elms Sans", fontWeight: 700, fontSize: '18px' }} />
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};