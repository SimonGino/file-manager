import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Documents from '@/pages/Documents';
import SharedDocument from '@/pages/SharedDocument';
import SharedFiles from '@/pages/SharedFiles';

// 检查是否已登录
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// 需要认证的路由守卫
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/shared" replace />;
};

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to={isAuthenticated() ? "/documents" : "/shared"} replace />,
      },
      {
        path: '/documents',
        element: (
          <AuthRoute>
            <Documents />
          </AuthRoute>
        ),
      },
      {
        path: '/shared',
        element: <SharedFiles />,
      },
    ],
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/shared/:shareUuid',
    element: <SharedDocument />,
  },
];

export const router = createBrowserRouter(routes);