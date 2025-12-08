import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { checkSellerStaffRole, checkWarehouseStaffRole } from '../utils/jwt';
import { STORAGE_KEYS, ROUTES } from '../utils/constants';

/**
 * Protected Route cho Staff (Seller và Warehouse)
 * Chỉ cho phép truy cập nếu:
 * 1. Có staffToken trong localStorage (staff dùng staffToken riêng)
 * 2. Token có scope SELLER_STAFF hoặc WAREHOUSE_STAFF
 * 3. Token còn hợp lệ (chưa hết hạn)
 * 
 * Nếu không đáp ứng → redirect về /staff/login
 */
const ProtectedStaffRoute = ({ children }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuthorization = () => {
            // Kiểm tra staffToken (staff dùng staffToken riêng)
            const staffToken = localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);
            
            if (!staffToken) {
                console.log('❌ No staffToken found, redirecting to staff login');
                setIsAuthorized(false);
                setIsChecking(false);
                return;
            }
            
            // Kiểm tra role SELLER_STAFF hoặc WAREHOUSE_STAFF từ staffToken
            const isSellerStaff = checkSellerStaffRole(true); // useStaffToken = true
            const isWarehouseStaff = checkWarehouseStaffRole(true); // useStaffToken = true
            
            if (!isSellerStaff && !isWarehouseStaff) {
                console.log('❌ Not staff role, redirecting to staff login');
                localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                setIsAuthorized(false);
                setIsChecking(false);
                return;
            }
            
            // Kiểm tra token có hợp lệ không (chưa hết hạn)
            try {
                const tokenParts = staffToken.split('.');
                if (tokenParts.length !== 3) {
                    console.log('❌ Invalid token format');
                    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                    setIsAuthorized(false);
                    setIsChecking(false);
                    return;
                }
                
                const payload = JSON.parse(atob(tokenParts[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                
                if (payload.exp && payload.exp < currentTime) {
                    console.log('❌ Token expired');
                    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                    setIsAuthorized(false);
                    setIsChecking(false);
                    return;
                }
            } catch (error) {
                console.error('❌ Error validating token:', error);
                localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                setIsAuthorized(false);
                setIsChecking(false);
                return;
            }
            
            // Tất cả kiểm tra đều pass
            setIsAuthorized(true);
            setIsChecking(false);
        };

        checkAuthorization();
        
        // Kiểm tra lại mỗi khi staffToken thay đổi
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEYS.STAFF_TOKEN || e.key === null) {
                checkAuthorization();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [location.pathname]);

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
                <div style={{ marginTop: 16, color: '#666' }}>Đang kiểm tra quyền truy cập nhân viên...</div>
            </div>
        );
    }

    // Nếu không được phép → redirect về staff login
    if (!isAuthorized) {
        return <Navigate to={ROUTES.STAFF_LOGIN} state={{ from: location }} replace />;
    }

    // Được phép → render children
    return children;
};

export default ProtectedStaffRoute;

