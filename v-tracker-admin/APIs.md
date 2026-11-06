# Integrated APIs

Total APIs Integrated: 12

1. http://localhost:5000/v1/auth/login (POST - Admin Login) 
Integrated in `src/pages/Login.jsx`
2. http://localhost:5000/v1/auth/logout (POST - Admin Logout)
Integrated in `src/components/layout/Sidebar.jsx`
3. http://localhost:5000/v1/me (GET - Admin Profile)
Integrated in `src/pages/AdminProfile.jsx` & `src/components/layout/Header.jsx`
4. http://localhost:5000/v1/admin/users (GET - Get All Users List [ADM-04])
Integrated in `src/pages/Users.jsx`
5. http://localhost:5000/v1/admin/users/:id (GET - Get Particular User Details [ADM-05])
Integrated in `src/components/users/UserDrawer.jsx`
6. http://localhost:5000/v1/admin/users/:id (PATCH - Update User Profile [ADM-06])
Integrated in `src/components/users/UserDrawer.jsx`
7. http://localhost:5000/v1/admin/users/:id/status (PATCH - Block / Reactivate User [ADM-07])
Integrated in `src/components/users/UserDrawer.jsx`
8. http://localhost:5000/v1/admin/users/:id/role (PATCH - Change User Role [ADM-08])
Integrated in `src/components/users/UserDrawer.jsx`
9. http://localhost:5000/v1/admin/users/:id/logout (POST - Force Revoke User Sessions [ADM-09])
Integrated in `src/components/users/UserDrawer.jsx`
10. http://localhost:5000/v1/admin/orders (GET - Get All Orders [ADM-12])
Integrated in `src/pages/Orders.jsx`
11. http://localhost:5000/v1/admin/orders/:id/status (PATCH - Update Order Status / Dispatch [ADM-14])
Integrated in `src/pages/Orders.jsx` & `src/components/orders/OrderDispatchDrawer.jsx`
12. http://localhost:5000/v1/admin/orders/:id (GET - Get Single Order Detail & Invoice [ADM-13])
Integrated in `src/pages/OrderInvoicePage.jsx`
