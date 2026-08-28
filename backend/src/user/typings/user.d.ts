export interface ISpotifyAuthUrl {
    url: string;
    state: string;
}

export interface IJwtUserRequest {
    user: {
        userId: string
    }
}

export interface IResponseUpdateAccessToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}