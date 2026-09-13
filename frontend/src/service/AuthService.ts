import api from "../http";

export default class AuthService {    
    static getProfile() {
        return api.get('/auth/me');
    }

    static checkingAuthDonAlerts() {
        return api.get('/auth/checkAuthDonAlerts');
    }

    static logoutDonationAlerts() {
        return api.post('/auth/donationAlerts/logout');
    }
}