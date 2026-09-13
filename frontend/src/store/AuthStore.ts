import AuthService from "../service/AuthService";


export default class AuthStore {
    async getProfile() {
        const response = await AuthService.getProfile();
        return response.data;
    }

    async checkingAuthDonAlerts() {
        const response = await AuthService.checkingAuthDonAlerts();
        return response.data;
    }
}