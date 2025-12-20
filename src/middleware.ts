export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/boards/:path*',
    '/api/boards/:path*',
    '/api/columns/:path*',
    '/api/tasks/:path*',
    '/api/labels/:path*',
    '/api/activity/:path*',
  ],
}
