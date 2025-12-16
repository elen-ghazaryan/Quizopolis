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
    path: "/user",
    element: <VerifyEmail />
  },
  {
    path: "/layout",
    element: <Layout />,
    children: [
      {path: "", element: <Profile />},
      {path: "quizzes", element: <Quizzes />},
      {path: "quizzes/create", element: <CreateQuiz />},
      {path: "quizzes/published", element: <Published/>},
      {path: "quizzes/unpublished", element: <Unpublished />},
      {path: "logout", element: <Logout />},
      {path: "favorites", element: <Favorites />},
      {path: "analytics", element: <Analytics />},
    ]
  }
]);