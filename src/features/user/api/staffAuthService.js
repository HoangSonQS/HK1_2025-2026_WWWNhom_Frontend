import { STORAGE_KEYS } from '../../../utils/constants';

export const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
    // Dispatch event to notify StaffHeader or other components
    window.dispatchEvent(new CustomEvent('staffTokenChanged'));
};

