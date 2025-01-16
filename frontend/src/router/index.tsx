import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Documents from '@/pages/Documents';
import SharedDocument from '@/pages/SharedDocument';
import SharedFiles from '@/pages/SharedFiles';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/documents" replace />,
      },
      {
        path: '/documents',
        element: <Documents />,
      },
      {
        path: '/shared',
        element: <SharedFiles />,
      },
    ],
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