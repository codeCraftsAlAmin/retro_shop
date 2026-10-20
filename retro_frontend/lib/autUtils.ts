export type UserRole = "ADMIN" | "CUSTOMER" | "SELLER";

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

export const isAuthRoute = (pathname: string) => {
  return authRoutes.some((router: string) => router === pathname);
};

export type RouteConfig = {
  exact: string[];
  pattern: RegExp[];
};

export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/change-password"],
  pattern: [],
};

export const customerProtectedRoutes: RouteConfig = {
  exact: ["/carts", "/orders"],
  pattern: [],
};

export const adminProtectedRoutes: RouteConfig = {
  exact: [],
  pattern: [/^\/admin\/dashboard/],
};

export const sellerProtectedRoutes: RouteConfig = {
  exact: [],
  pattern: [/^\/seller\/dashboard/],
};

export const routeMatches = (pathname: string, routes: RouteConfig) => {
  if (routes.exact.includes(pathname)) {
    return true;
  }

  return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string,
): "ADMIN" | "CUSTOMER" | "SELLER" | "COMMON" | null => {
  if (routeMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }
  if (routeMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (routeMatches(pathname, customerProtectedRoutes)) {
    return "CUSTOMER";
  }
  if (routeMatches(pathname, sellerProtectedRoutes)) {
    return "SELLER";
  }

  return null; // public route
};

export const getDefaultDashboardRoute = (role: UserRole) => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }
  if (role === "SELLER") {
    return "/seller/dashboard";
  }
  if (role === "CUSTOMER") {
    return "/customer/dashboard";
  }

  return "/";
};

export const validRedirectForRole = (redirectPath: string, role: UserRole) => {
  const unifyAdminRole = role === "ADMIN" ? "ADMIN" : role;

  role = unifyAdminRole;

  const routeOwner = getRouteOwner(redirectPath);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === role) {
    return true;
  }

  return false;
};
