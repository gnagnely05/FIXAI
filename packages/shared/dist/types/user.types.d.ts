export declare enum UserRole {
    CLIENT = "CLIENT",
    ARTISAN = "ARTISAN",
    AGENCE_HOTE = "AGENCE_HOTE",
    ENTREPRISE_BTP = "ENTREPRISE_BTP",
    BOUTIQUE = "BOUTIQUE",
    QUINCAILLERIE = "QUINCAILLERIE",
    ADMIN = "ADMIN"
}
export interface User {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isVerified: boolean;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}
//# sourceMappingURL=user.types.d.ts.map