import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Prisma, User } from "../../../generated/prisma/client";
import {
  userFilterableFields,
  userIncludingConfig,
  userSearchedFields,
} from "./user.constant";

const getMyProfileService = async (user: IRequestUserInterface) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    select: {
      customers: true,
      admins: true,
      sellers: true,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  return userData;
};

const getAllUsersService = async (
  query: IQueryParams,
  user: IRequestUserInterface,
) => {
  const queryBuilders = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, query, {
    searchableFields: userSearchedFields,
    filterableFields: userFilterableFields,
  });

  const result = await queryBuilders
    .search()
    .filter()
    .where({ isDeleted: false, id: { not: user.userId } })
    .sort()
    // TODO: it will be changed later
    .include({
      customers: {
        select: {
          id: true,
          email: true,
          address: true,
        },
      },
      admins: {
        select: {
          id: true,
          email: true,
          address: true,
        },
      },
      sellers: {
        select: {
          id: true,
          email: true,
          address: true,
        },
      },
    })
    .dynamicInclude(userIncludingConfig)
    .fields()
    .pagination()
    .execute();

  // console.log("result ~ 🔑🕙", result);
  return result;
};

export const userService = {
  getMyProfileService,
  getAllUsersService,
};
