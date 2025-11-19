import { useState } from 'react';
import {
  Home,
  BookOpen,
  Trophy,
  Heart,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  FileText,
  BarChart3,
  Users,
  Zap,
  ChevronDown,
  Handshake,
  Hand
} from 'lucide-react';
import styles from './layout.module.css';
import { Outlet } from 'react-router-dom';
import { useContextState } from '../../../context/hooks';

export const Layout = () => {
  const { user } = useContextState()

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLink, setActiveLink] = useState('home');
  const [studentMenuOpen, setStudentMenuOpen] = useState(true);
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(true);

  const studentLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse Quizzes', icon: BookOpen },
    { id: 'history', label: 'My History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },

  ];

  const teacherLinks = [
    { id: 'create', label: 'Create Quiz', icon: PlusCircle },
    { id: 'my-quizzes', label: 'My Quizzes', icon: FileText },
    { id: 'my-drafts', label: 'My Draft', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },

  ];

  const bottomLinks = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarContent}>
          {/* Logo & Toggle */}
          <div className={styles.sidebarHeader}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <Zap size={24} />
              </div>
              {sidebarOpen && <span className={styles.logoText}>Quizopolis</span>}
            </div>
            <button
              className={styles.toggleBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} style={{color:"#503c50"}} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className={styles.navigation}>
            {/* Student Section */}
            <div className={styles.navSection}>
              {sidebarOpen && (
                <button
                  className={styles.sectionHeader}
                  onClick={() => setStudentMenuOpen(!studentMenuOpen)}
                >
                  <span>Student</span>
                  <ChevronDown
                    size={16}
                    className={`${styles.chevron} ${studentMenuOpen ? styles.chevronOpen : ''}`}
                  />
                </button>
              )}
              <div className={`${styles.navLinks} ${studentMenuOpen ? styles.navLinksOpen : styles.navLinksClosed}`}>
                {studentLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      className={`${styles.navLink} ${activeLink === link.id ? styles.navLinkActive : ''}`}
                      onClick={() => setActiveLink(link.id)}
                      title={!sidebarOpen ? link.label : ''}
                    >
                      <Icon size={20} />
                      {sidebarOpen && <span>{link.label}</span>}
                      {activeLink === link.id && <div className={styles.activeIndicator} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teacher Section */}
            {user && user.role === 'teacher' && (
              <div className={styles.navSection}>
                {sidebarOpen && (
                  <button
                    className={styles.sectionHeader}
                    onClick={() => setTeacherMenuOpen(!teacherMenuOpen)}
                  >
                    <span>Teacher</span>
                    <ChevronDown
                      size={16}
                      className={`${styles.chevron} ${teacherMenuOpen ? styles.chevronOpen : ''}`}
                    />
                  </button>
                )}
                <div className={`${styles.navLinks} ${teacherMenuOpen ? styles.navLinksOpen : styles.navLinksClosed}`}>
                  {teacherLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.id}
                        className={`${styles.navLink} ${activeLink === link.id ? styles.navLinkActive : ''}`}
                        onClick={() => setActiveLink(link.id)}
                        title={!sidebarOpen ? link.label : ''}
                      >
                        <Icon size={20} />
                        {sidebarOpen && <span>{link.label}</span>}
                        {activeLink === link.id && <div className={styles.activeIndicator} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Bottom Links */}
          <div className={styles.bottomLinks}>
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  className={`${styles.navLink} ${activeLink === link.id ? styles.navLinkActive : ''} ${
                    link.id === 'logout' ? styles.logoutLink : ''
                  }`}
                  onClick={() => setActiveLink(link.id)}
                  title={!sidebarOpen ? link.label : ''}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{link.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <img src={user?.avatar || "/default_avatar.png"} alt="User" />
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.username}</p>
              <p className={styles.userRole}>{user?.role === 'teacher' ? 'Teacher' : 'Student'}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1>Welcome Back! 👋 </h1>
          <p>Ready to continue your learning journey?</p>
        </div>

        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}