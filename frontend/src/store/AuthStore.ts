import AuthService from "../service/AuthService";


export default class AuthStore {
    async getProfile() {
        const response = await AuthService.getProfile();
        return response.data;
    }
}