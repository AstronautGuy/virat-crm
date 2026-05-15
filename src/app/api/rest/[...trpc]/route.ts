import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { type NextRequest } from "next/server";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = async (req: NextRequest) => {
  return createOpenApiFetchHandler({
    endpoint: "/api/rest",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
