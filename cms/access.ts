import type { Access } from "payload";

/**
 * Payload's REST and GraphQL routes are public URLs, so anything not meant for
 * the public stays behind an admin login. The storefront itself reads and
 * writes through the local API from server code, which skips these checks.
 */
export const isAdmin: Access = ({ req }) => Boolean(req.user);

export const nobody: Access = () => false;
