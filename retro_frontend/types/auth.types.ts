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

export interface IRegisterRespone {
  toke: string | null;
  user: {
    name: string;
    email: string;
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
