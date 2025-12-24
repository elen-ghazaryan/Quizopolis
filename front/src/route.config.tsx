import { createBrowserRouter } from "react-router-dom";
import { Intro } from "./pages/general/intro/Intro"; // named export
import { Signup } from "./pages/general/signup/Signup";
import { VerifyEmail } from "./pages/general/verify-email/VerifyEmail";
import { Login } from "./pages/general/login/Login";
import { Layout } from "./pages/auth-user/layout/Layout"
import { Profile } from "./pages/auth-user/profile/Profile";
import { CreateQuiz } from "./pages/auth-teacher/create-quiz/CreateQuiz";
import { Published } from "./pages/auth-teacher/my-quizzes/published/Published";
import { Unpublished } from "./pages/auth-teacher/my-quizzes/unpublished/Unpublished";
import { Quizzes } from "@pages/auth-user/quizzes/Quizzes";
import { Logout } from "@pages/auth-user/logout/LogoutModal";
import { Favorites } from "@pages/auth-user/favorites/Favorites";
import { Analytics } from "@pages/auth-user/analytics/Analytics";
import { Settings } from "@pages/auth-user/settings/Settings";
import { ResetPassword } from "@pages/general/reset-password/ResetPassword";
import { QuizDetails } from "@pages/auth-user/quizDetails/QuizDetails";
import { StartQuiz } from "@pages/auth-user/startQuiz/StartQuiz";
import { QuizAnswers } from "@pages/auth-user/quizAnswers/QuizAnswers";
import { TeacherQuizDetails } from "@pages/auth-teacher/standardQuizDetail/StandardQuizDetail";
import { EditQuiz } from "@pages/auth-teacher/editQuiz/EditQuiz";
import { LiveSessionPage } from "@pages/live-quiz/liveSession/LiveSession";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Intro />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/verify",
    element: <VerifyEmail />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/layout",
    element: <Layout />,
    children: [
      {path: "", element: <Profile />},
      {path: "quizzes", element: <Quizzes />},
      {path: "quizzes/:id", element: <QuizDetails />},
      {path: "quizzes/create", element: <CreateQuiz />},
      {path: "quizzes/:id/start", element: <StartQuiz />},
      {path: "quizzes/attempt/:attemptId/answers", element: <QuizAnswers />},
      {path: "quizzes/published", element: <Published/>},
      {path: "quizzes/unpublished", element: <Unpublished />},
      {path: "quizzes/:quizId/admin", element: <TeacherQuizDetails />},
      {path: "quizzes/:quizId/edit", element: <EditQuiz />},
      {path: "quizzes/:quizId/admin/live", element: <LiveSessionPage />},
      {path: "logout", element: <Logout />},
      {path: "favorites", element: <Favorites />},
      {path: "analytics", element: <Analytics />},
      {path: "settings", element: <Settings />},
    ]
  }
]);