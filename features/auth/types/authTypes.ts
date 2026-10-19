export interface AuthContextType {
  user: ProfileData | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

//firebase user collection (users data contract in Notion)
export interface ProfileData {
    uid: string;
    displayName: string | null;
    email: string | null;
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    role: UserRoles;
}
//firebase auth user
export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
}

export enum UserRoles {
    ADMIN = "admin",
    COACH = "coach",
    CLIENT = "client", 
}