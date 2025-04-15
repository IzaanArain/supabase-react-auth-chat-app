import { createBrowserRouter } from "react-router";
import App from "../App";
import Signin from "../pages/Signin";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import PrivateRoutes from "./PrivateRoutes";
import Chat from "../components/Chat";
import TodoList from "../components/TodoList";
export const router = createBrowserRouter([
    { path: "/signin", element: <Signin /> },
    { path: "/signup", element: <Signup /> },
    // { path: "/", element: <PrivateRoutes><App /></PrivateRoutes> },
    { path: "/chat", element: <PrivateRoutes><Dashboard children={<Chat/>}/></PrivateRoutes> },
    { path: "/dashboard", element: <PrivateRoutes><Dashboard children={<TodoList/>}/></PrivateRoutes> },
    {path:"*", element:  <PrivateRoutes><Dashboard children={<TodoList/>}/></PrivateRoutes>}
])