import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { checkAdminRole } from '../utils/jwt';
import { STORAGE_KEYS, ROUTES } from '../utils/constants';

/**
 * Protected Route cho Admin
 * Chỉ cho phép truy cập nếu:
 * 1. Có adminToken trong localStorage
 * 2. Token có scope ADMIN
 * 3. Token còn hợp lệ (chưa hết hạn)
 * 
 * Nếu không đáp ứng → redirect về /admin/login
 * 
 * Component này kiểm tra real-time và đảm bảo không ai có thể bypass
 */
const ProtectedAdminRoute = ({ children }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuthorization = () => {
            // Kiểm tra adminToken
            const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
            
            if (!adminToken) {
                console.log('❌ No adminToken found, redirecting to admin login');
                setIsAuthorized(false);
                setIsChecking(false);
                return;
            }
            
            // Kiểm tra role ADMIN từ adminToken (useAdminToken = true)
            // CHỈ đọc từ adminToken, KHÔNG fallback sang jwtToken
            const isAdmin = checkAdminRole(true);
            
            if (!isAdmin) {
                console.log('❌ Not admin role, redirecting to admin login');
                // Xóa token không hợp lệ ngay lập tức
                localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                setIsAuthorized(false);
                setIsChecking(false);
                return;
            }
            
            // Kiểm tra token có hợp lệ không (chưa hết hạn)
            try {
                const tokenParts = adminToken.split('.');
                if (tokenParts.length !== 3) {
                    console.log('❌ Invalid token format');
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                    setIsAuthorized(false);
                    setIsChecking(false);
                    return;
                }
                
                const payload = JSON.parse(atob(tokenParts[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                
                if (payload.exp && payload.exp < currentTime) {
                    console.log('❌ Token expired');
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                    setIsAuthorized(false);
                    setIsChecking(false);
                    return;
                }
            } catch (error) {
                console.error('❌ Error validating token:', error);
                localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                setIsAuthorized(false);
                setIsChecking(false);
                return;
            }
            
            // Tất cả kiểm tra đều pass
            setIsAuthorized(true);
            setIsChecking(false);
        };

        checkAuthorization();
        
        // Kiểm tra lại mỗi khi adminToken thay đổi (từ tab khác hoặc logout)
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEYS.ADMIN_TOKEN || e.key === null) {
                checkAuthorization();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [location.pathname]); // Re-check khi route thay đổi

    // Hiển thị loading trong khi kiểm tra
    if (isChecking) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#666' }}>Đang kiểm tra quyền truy cập admin...</div>
            </div>
        );
    }

    // Nếu không được phép → redirect về admin login
    if (!isAuthorized) {
        return <Navigate to={ROUTES.ADMIN_LOGIN} state={{ from: location }} replace />;
    }

    // Được phép → render children
    return children;
};

export default ProtectedAdminRoute;

