import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.jsx";
import Home from "./routes/Home.jsx";
import Login from "./routes/Login.jsx";
import Feed from "./routes/Feed.jsx";
import Groups from "./routes/Groups.jsx";
import Users from "./routes/Users.jsx";
import Profile from "./routes/Profile.jsx";
import Notices from "./routes/Notices.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Board from "./routes/Board.jsx"
import './index.css'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/relatos",
        element: (
          <PrivateRoute>
            <Feed />
          </PrivateRoute>
        ),
      },
      {
        path: "/grupos",
        element: (
          <PrivateRoute>
            <Groups />
          </PrivateRoute>
        ),
      },
      {
        path: "/usuarios",
        element: (
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        ),
      },
      {
        path: "/perfil/:id",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/avisos",
        element: (
          <PrivateRoute>
            <Notices />
          </PrivateRoute>
        ),
      },
      {
        path: "/board",
        element: (
          <PrivateRoute>
            <Board />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
