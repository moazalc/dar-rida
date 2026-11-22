import type { Endpoint, Where } from "payload";
import { adminLang } from "../admin/i18n";
import { exportFileName, exportWhere, orderExportRows, toCsv } from "@/lib/orders/export";

/**
 * GET /api/orders/export, admin only: the orders the list shows (same `where`,
 * `search` and `sort` query as the list's own URL) as a CSV, one row per piece,
 * headings in the admin's language.
 */
export const exportOrdersEndpoint: Endpoint = {
  path: "/export",
  method: "get",
  handler: async (req) => {
    if (!req.user || req.user.collection !== "users") return Response.json({ error: "Not allowed" }, { status: 401 });
    const query = (req.query ?? {}) as { where?: unknown; search?: unknown; sort?: unknown };
    const where: Where = exportWhere(query.where, query.search);
    const sort = typeof query.sort === "string" && /^-?[A-Za-z]+$/.test(query.sort) ? query.sort : "-createdAt";
    try {
      const { docs } = await req.payload.find({
        collection: "orders",
        where,
        sort,
        depth: 1,
        pagination: false,
        overrideAccess: false,
        user: req.user,
        req,
      });
      const csv = toCsv(orderExportRows(docs, adminLang(req.i18n)));
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${exportFileName()}"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      // A hand-edited URL with an unknown field or operator ends up here.
      req.payload.logger.warn({ err: error, msg: "Order export failed" });
      return Response.json({ error: "That filter can't be exported." }, { status: 400 });
    }
  },
};
