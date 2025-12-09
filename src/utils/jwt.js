/**
 * JWT Utilities - Decode và kiểm tra JWT token
 * Hỗ trợ jwtToken (customer), staffToken (staff), và adminToken (admin)
 */

export const decodeJWT = (token = null, useAdminToken = false, useStaffToken = false) => {
  try {
    let jwtToken = token;
    if (!jwtToken) {
      // Nếu useAdminToken = true, CHỈ lấy adminToken
      if (useAdminToken) {
        jwtToken = localStorage.getItem("adminToken");
      } else if (useStaffToken) {
        // Nếu useStaffToken = true, CHỈ lấy staffToken
        jwtToken = localStorage.getItem("staffToken");
      } else {
        // Nếu cả hai đều false, CHỈ lấy jwtToken (customer)
        jwtToken = localStorage.getItem("jwtToken");
      }
    }
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

export const checkAdminRole = (useAdminToken = false) => {
  const decoded = decodeJWT(null, useAdminToken);
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

export const checkSellerStaffRole = (useStaffToken = false) => {
  // Nếu useStaffToken = true, chỉ kiểm tra staffToken
  // Nếu useStaffToken = false, kiểm tra cả jwtToken và adminToken (admin có quyền cao nhất)
  let decoded = decodeJWT(null, false, useStaffToken);
  
  // Nếu không tìm thấy staffToken và useStaffToken = true, kiểm tra adminToken
  if (!decoded && useStaffToken) {
    decoded = decodeJWT(null, true, false); // Kiểm tra adminToken
  }
  
  if (!decoded || !decoded.scope) return false;
  
  // Xử lý scope có thể là string hoặc array
  const scopeString = typeof decoded.scope === 'string' 
    ? decoded.scope 
    : Array.isArray(decoded.scope) 
      ? decoded.scope.join(' ') 
      : '';
  
  const upperScope = scopeString.toUpperCase();
  
  // Admin có quyền cao nhất, có thể làm mọi thứ mà staff có thể làm
  // Kiểm tra case-insensitive
  return upperScope.includes("SELLER_STAFF") || upperScope.includes("ADMIN");
};

export const checkWarehouseStaffRole = (useStaffToken = false) => {
  // Nếu useStaffToken = true, chỉ kiểm tra staffToken
  // Nếu useStaffToken = false, kiểm tra cả jwtToken và adminToken (admin có quyền cao nhất)
  let decoded = decodeJWT(null, false, useStaffToken);
  
  // Nếu không tìm thấy staffToken và useStaffToken = true, kiểm tra adminToken
  if (!decoded && useStaffToken) {
    decoded = decodeJWT(null, true, false); // Kiểm tra adminToken
  }
  
  if (!decoded || !decoded.scope) return false;
  
  // Xử lý scope có thể là string hoặc array
  const scopeString = typeof decoded.scope === 'string' 
    ? decoded.scope 
    : Array.isArray(decoded.scope) 
      ? decoded.scope.join(' ') 
      : '';
  
  const upperScope = scopeString.toUpperCase();
  
  // Admin có quyền cao nhất, có thể làm mọi thứ mà staff có thể làm
  // Kiểm tra case-insensitive
  return upperScope.includes("WAREHOUSE_STAFF") || upperScope.includes("ADMIN");
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
  // CHỈ đọc từ jwtToken (useAdminToken = false), không đọc adminToken
  const decoded = decodeJWT(null, false);
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

