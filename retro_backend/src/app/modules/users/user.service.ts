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
      customers: {
        select: {
          name: true,
          email: true,
          profilePhoto: true,
          phone: true,
          gender: true,
          address: true,
          userId: true,
        },
      },
      admins: {
        select: {
          name: true,
          email: true,
          profilePhoto: true,
          phone: true,
          gender: true,
          address: true,
          userId: true,
        },
      },
      sellers: {
        select: {
          name: true,
          email: true,
          profilePhoto: true,
          phone: true,
          gender: true,
          address: true,
          userId: true,
        },
      },
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

  const whereSearch: Prisma.UserWhereInput = {
    isDeleted: false,
    id: { not: user.userId },
  };

  if (query.name && typeof query.name === "string") {
    whereSearch.name = query.name;
    delete query.name;
  }

  if (query.email && typeof query.email === "string") {
    whereSearch.email = query.email;
    delete query.email;
  }

  const result = await queryBuilders
    .search()
    .filter()
    .where(whereSearch)
    .sort()
    .include({
      customers: {
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
  return result;
};

export const userService = {
  getMyProfileService,
  getAllUsersService,
};
