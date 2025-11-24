/**
 * JWT Utilities - Decode và kiểm tra JWT token
 */

export const decodeJWT = (token = null) => {
  try {
    const jwtToken = token || localStorage.getItem("jwtToken");
    if (!jwtToken) {
      return null;
    }
    const base64Url = jwtToken.split(".")[1]; // Lấy phần payload
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Chuyển từ base64url sang base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload); // Trả về payload dưới dạng JSON
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const checkAdminRole = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  return decoded.scope.includes("ADMIN");
};

export const checkSellerStaffRole = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  return decoded.scope.includes("SELLER_STAFF");
};

export const checkWarehouseStaffRole = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  return decoded.scope.includes("WAREHOUSE_STAFF");
};

export const checkCustomerRole = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  return decoded.scope.includes("CUSTOMER");
};

export const decodeToken = (token) => {
  return decodeJWT(token);
};

export const isAdminOrStaff = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  return decoded.scope.includes("ADMIN") || decoded.scope.includes("SELLER_STAFF");
};

