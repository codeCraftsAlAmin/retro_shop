export interface ILoginResponse {
  token: string;
  user: {
    emailVerified: boolean;
    image: string | null;
    phone: string | null;
    gender: string;
    role: string;
    status: string;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
}
