import { useEffect, useState } from "react";
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
  Hand,
} from "lucide-react";
import styles from "./layout.module.css";
import { NavLink, Outlet } from "react-router-dom";
import { useContextDispatch, useContextState } from "../../../context/hooks";
import { Axios } from "@config/axios";
import type { IResponse } from "app-types/quiz-types";
import type { IUser } from "context/types";

export const Layout = () => {
  const { user } = useContextState();
  const dispatch = useContextDispatch()
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
  const loadUser = async () => {
    try {
      const res = await Axios.get<IResponse<IUser>>("/user/profile");
      dispatch({ type: "SET_USER", payload: res.data.payload });
    } catch (err) {
      console.log("User not authenticated");
    }
  };

  if (!user) loadUser();
}, [user]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [studentMenuOpen, setStudentMenuOpen] = useState(true);
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(true);

  const studentLinks = [
    { id: "home", label: "Home", icon: Home, to: "/layout" },
    { id: "browse", label: "Browse Quizzes", icon: BookOpen, to: "/layout/quizzes" },
    { id: "favorites", label: "Favorites", icon: Heart, to: "/layout/favorites" },
    { id: "analytics", label: "Analytics", icon: BarChart3, to: "/layout/analytics" },
  ];

  const teacherLinks = [
    { id: "create", label: "Create Quiz", icon: PlusCircle, to: "/layout/quizzes/create" },
    { id: "my-quizzes", label: "My Quizzes", icon: FileText, to: "/layout/quizzes/published" },
    { id: "my-drafts", label: "My Draft", icon: Users, to: "/layout/quizzes/unpublished" },
  ];

  const bottomLinks = [
    { id: "settings", label: "Settings", icon: Settings, to: "/layout/settings" },
    { id: "logout", label: "Logout", icon: LogOut, to: "/layout/logout" },
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <div className={styles.sidebarContent}>
          {/* Logo & Toggle */}
          <div className={styles.sidebarHeader}>
            {sidebarOpen && (
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <Zap size={24} />
                </div>
                <span className={styles.logoText}>Quizopolis</span>
              </div>
            )}

            <button
              className={styles.toggleBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X size={20} style={{ color: "#503c50" }} />
              ) : (
                <Menu size={20} />
              )}
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
                    className={`${styles.chevron} ${
                      studentMenuOpen ? styles.chevronOpen : ""
                    }`}
                  />
                </button>
              )}
              <div
                className={`${styles.navLinks} ${
                  studentMenuOpen ? styles.navLinksOpen : styles.navLinksClosed
                }`}
              >
                {studentLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      to={link.to!}
                      end
                      style={{ textDecoration: "none" }}
                      key={link.id}
                      className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                      }
                      title={!sidebarOpen ? link.label : ""}
                    >
                       {({ isActive }) => (
                        <>
                          <Icon size={20} />
                          {sidebarOpen && <span>{link.label}</span>}
                          {isActive && sidebarOpen && <div className={styles.activeIndicator} />}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Teacher Section */}
            {user && user.role === "teacher" && (
              <div className={styles.navSection}>
                {sidebarOpen && (
                  <button
                    className={styles.sectionHeader}
                    onClick={() => setTeacherMenuOpen(!teacherMenuOpen)}
                  >
                    <span>Teacher</span>
                    <ChevronDown
                      size={16}
                      className={`${styles.chevron} ${
                        teacherMenuOpen ? styles.chevronOpen : ""
                      }`}
                    />
                  </button>
                )}
                <div
                  className={`${styles.navLinks} ${
                    teacherMenuOpen
                      ? styles.navLinksOpen
                      : styles.navLinksClosed
                  }`}
                >
                  {teacherLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        to={link.to!}
                        end
                        style={{ textDecoration: "none" }}
                        key={link.id}
                        className={({ isActive }) =>
                          `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                        }
                        title={!sidebarOpen ? link.label : ""}
                      >
                        {({ isActive }) => (
                        <>
                          <Icon size={20} />
                          {sidebarOpen && <span>{link.label}</span>}
                          {isActive && sidebarOpen && <div className={styles.activeIndicator} />}
                        </>
                      )}
                      </NavLink>
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
                <NavLink
                  to={link.to!}
                  end
                  style={{ textDecoration: "none" }}
                  key={link.id}
                   className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ""} ${
                      link.id === "logout" ? styles.logoutLink : ""
                    }`
                  }
                  title={!sidebarOpen ? link.label : ""}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{link.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <img 
                src={user?.avatar?.trim() ? `${API_URL}/uploads/${user.avatar}` : "/default_avatar.png"} 
                alt="User" 
                  onError={(e) => {
                    e.currentTarget.src = "/default_avatar.png"; 
                  }}  
              />
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.username}</p>
              <p className={styles.userRole}>
                {user?.role === "teacher" ? "Teacher" : "Student"}
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
