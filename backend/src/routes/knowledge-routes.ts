import { Router } from "express";
import { KnowledgeController } from "@/controllers/KnowledgeController";

const router = Router();

router.get("/", KnowledgeController.list);
router.post("/", KnowledgeController.upsert);
router.delete("/:id", KnowledgeController.delete);

export default router;