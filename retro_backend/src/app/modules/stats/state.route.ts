import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { statsController } from "./state.controller";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SELLER),
  statsController.getDashboardStatsData,
);

export const statsRouter = router;
