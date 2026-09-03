import api from "../http";

export class SessionService {

    static getStatus() {
        return api.get('/session/status');
    }

    static start() {
        return api.post('/session/start');
    }
    
    static end() {
        return api.post('/session/end');
    }
}