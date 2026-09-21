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
  token: string | null;
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

export interface IVerifyResponse {
  ok: true;
  statusCode: number;
  message: string;
  data: {
    status: boolean;
    token: string;
    user: {
      name: string;
      email: string;
      emailVerified: boolean;
      role: string;
      isDeleted: boolean;
    };
  };
}
