import { createBrowserRouter } from "react-router-dom";
import { Intro } from "./pages/general/intro/Intro"; // named export
import { Signup } from "./pages/general/signup/Signup";
import { VerifyEmail } from "./pages/general/verify-email/VerifyEmail";
import { Login } from "./pages/general/login/Login";
import { Layout } from "./pages/auth/layout/Layout"
import { Profile } from "./pages/auth/profile/Profile";

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
      {path: "", element: <Profile />}
    ]
  }
]);