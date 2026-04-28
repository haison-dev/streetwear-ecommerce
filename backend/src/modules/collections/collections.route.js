import { Router } from "express";
import {
  getCollectionBySlugController,
  listCollectionProductsController,
  listCollectionsController,
} from "./collections.controller.js";

const router = Router();

router.get("/", listCollectionsController);
router.get("/slug/:slug", getCollectionBySlugController);
router.get("/slug/:slug/products", listCollectionProductsController);

export default router;

