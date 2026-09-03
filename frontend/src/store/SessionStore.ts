
import { makeAutoObservable } from "mobx";
import { SessionService } from "../service/SessionService";

export class SessionStore {

    sessionStatus = '';

    constructor() {
        makeAutoObservable(this);
    }

    setSessionStatus(status: string) {
        this.sessionStatus = status;
    }

    async getStatus() {
        const response = await SessionService.getStatus();
        this.setSessionStatus(response.data.status);
        return response.data;
    }

    async start() {
        const response = await SessionService.start();
        this.setSessionStatus(response.data.status);
        return response.data;
    }

    async end() {
        const response = await SessionService.end();
        this.setSessionStatus(response.data.status);
        return response.data;
    }
}