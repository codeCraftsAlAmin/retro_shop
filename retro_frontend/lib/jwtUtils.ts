       const { pathname } = request.nextUrl; // eg /dashboard, /admin/dashboard, /doctor/dashboard
       const accessToken = request.cookies.get("accessToken")?.value;
       const refreshToken = request.cookies.get("refreshToken")?.value;
