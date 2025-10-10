import { os } from "@/config/orpc";

export const router = os.router({});

export default router;

export type Router = typeof router;
