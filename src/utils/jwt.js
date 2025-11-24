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
  if (!decoded) {
    console.error('❌ Cannot decode JWT token');
    return false;
  }
  
  if (!decoded.scope) {
    console.error('❌ No scope found in JWT:', decoded);
    return false;
  }
  
  // Xử lý scope có thể là string hoặc array
  let scopeString = '';
  if (typeof decoded.scope === 'string') {
    scopeString = decoded.scope;
  } else if (Array.isArray(decoded.scope)) {
    scopeString = decoded.scope.join(' ');
  } else {
    console.error('❌ Invalid scope format:', decoded.scope, typeof decoded.scope);
    return false;
  }
  
  // Kiểm tra case-insensitive để xử lý cả "admin" và "ADMIN"
  const hasAdmin = scopeString.toUpperCase().includes("ADMIN");
  console.log('🔍 Check Admin Role - Scope:', scopeString, 'Has ADMIN:', hasAdmin);
  return hasAdmin;
};

export const checkSellerStaffRole = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  
  // Xử lý scope có thể là string hoặc array
  const scopeString = typeof decoded.scope === 'string' 
    ? decoded.scope 
    : Array.isArray(decoded.scope) 
      ? decoded.scope.join(' ') 
      : '';
  
  // Kiểm tra case-insensitive
  return scopeString.toUpperCase().includes("SELLER_STAFF");
};

export const checkWarehouseStaffRole = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  
  // Xử lý scope có thể là string hoặc array
  const scopeString = typeof decoded.scope === 'string' 
    ? decoded.scope 
    : Array.isArray(decoded.scope) 
      ? decoded.scope.join(' ') 
      : '';
  
  // Kiểm tra case-insensitive
  return scopeString.toUpperCase().includes("WAREHOUSE_STAFF");
};

export const checkCustomerRole = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  
  // Xử lý scope có thể là string hoặc array
  const scopeString = typeof decoded.scope === 'string' 
    ? decoded.scope 
    : Array.isArray(decoded.scope) 
      ? decoded.scope.join(' ') 
      : '';
  
  // Kiểm tra case-insensitive
  return scopeString.toUpperCase().includes("CUSTOMER");
};

export const decodeToken = (token) => {
  return decodeJWT(token);
};

export const isAdminOrStaff = () => {
  const decoded = decodeJWT();
  if (!decoded || !decoded.scope) return false;
  
  // Xử lý scope có thể là string hoặc array
  const scopeString = typeof decoded.scope === 'string' 
    ? decoded.scope 
    : Array.isArray(decoded.scope) 
      ? decoded.scope.join(' ') 
      : '';
  
  // Kiểm tra case-insensitive
  const upperScope = scopeString.toUpperCase();
  return upperScope.includes("ADMIN") || upperScope.includes("SELLER_STAFF");
};

