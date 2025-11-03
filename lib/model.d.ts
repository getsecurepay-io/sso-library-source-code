export interface HttpResponse<T> {
    success: boolean;
    statusCode: string;
    message: string;
    data: T;
}
export interface LoginData {
    data: null;
    userId: string;
    token: string;
    refreshToken: string;
    description?: string;
}
export interface AppParams {
    clientId: string;
    accessToken: string;
    expiresIn: number;
    tokenType: string;
    client: {
        clientId: string;
        logoUri: string;
        clientClaimsPrefix: string;
        clientName: string;
        redirectUri: string;
    };
}
