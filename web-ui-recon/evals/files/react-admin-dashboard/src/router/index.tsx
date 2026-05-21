import { RouteObject } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard'
import LoginPage from '../pages/Login'
import UsersPage from '../pages/Users'
import FilesPage from '../pages/Files'
import SettingsPage from '../pages/Settings'
import ArticlesPage from '../pages/Articles'
import MainLayout from '../components/MainLayout'

export const routerConfig: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthGuard><MainLayout /></AuthGuard>,
    children: [
      {
        index: true,
        element: <ArticlesPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'users/:id',
        element: <UsersPage />,
      },
      {
        path: 'articles',
        element: <ArticlesPage />,
      },
      {
        path: 'articles/:id/edit',
        element: <ArticlesPage />,
      },
      {
        path: 'files',
        element: <FilesPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]
