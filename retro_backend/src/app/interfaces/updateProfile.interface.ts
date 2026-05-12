import { Gender } from "../../generated/prisma/enums";

export interface IUpdateProfile {
  name?: string;
  phone?: string;
  gender?: Gender;
  profilePhoto?: string;
  address?: string;
}
