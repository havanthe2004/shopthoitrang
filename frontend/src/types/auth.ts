export interface UserInfo {
    id: number;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
}

export interface AuthResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: UserInfo;
}