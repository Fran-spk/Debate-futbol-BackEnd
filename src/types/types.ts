export interface JwtPayload{
    userId: string;
    _id: string;
    email: string;
    permissions: string[];
}