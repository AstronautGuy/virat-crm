/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/consistent-generic-constructors */

import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { type NextRequest } from "next/server";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

import { ZodType } from "zod";

if (!(ZodType.prototype as any).meta) {
  (ZodType.prototype as any).meta = function (metadata?: any) {
    if (metadata === undefined) {
      return this._def.openapi;
    }
    this._def.openapi = metadata;
    return this;
  };
}

if (!(ZodType.prototype as any).openapi) {
  (ZodType.prototype as any).openapi = function (metadata?: any) {
    if (metadata === undefined) {
      return this._def.openapi;
    }
    this._def.openapi = metadata;
    return this;
  };
}

if (!(ZodType.prototype as any)._zod) {
  Object.defineProperty(ZodType.prototype, "_zod", {
    get() {
      const typeName = this._def.typeName;
      let type = typeName ? typeName.replace(/^Zod/, "").toLowerCase() : "any";
      
      if (typeName === "ZodEffects") {
        type = this._def.effect?.type === "transform" ? "transform" : "pipe";
      }

      let options = this._def.options;
      if (typeName === "ZodUnion" || typeName === "ZodDiscriminatedUnion") {
        options = this._def.options;
      }

      const def: any = {
        type,
        shape: this._def.shape,
        options,
        getter: this._def.getter,
        innerType: this._def.innerType,
        values: type === "literal" ? [this._def.value] : this._def.values,
        left: this._def.left,
        right: this._def.right,
        rest: this._def.rest,
        keyType: this._def.keyType,
        valueType: this._def.valueType,
        element: this._def.type,
        in: this._def.schema,
        out: this._def.schema,
        catchValue: this._def.catchValue,
        defaultValue: typeof this._def.defaultValue === "function" ? this._def.defaultValue() : this._def.defaultValue,
      };

      const bag: any = {};
      
      if (this._def.checks) {
        const patterns: Set<RegExp> = new Set();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            bag.minimum = check.value;
            if (check.inclusive === false) {
              bag.exclusiveMinimum = check.value;
            }
          } else if (check.kind === "max") {
            bag.maximum = check.value;
            if (check.inclusive === false) {
              bag.exclusiveMaximum = check.value;
            }
          } else if (check.kind === "multipleOf") {
            bag.multipleOf = check.value;
          } else if (check.kind === "int") {
            bag.format = "int32";
          } else if (check.kind === "regex") {
            patterns.add(check.regex);
          } else if (["uuid", "email", "url"].includes(check.kind)) {
            bag.format = check.kind === "uuid" ? "guid" : check.kind;
          }
        }
        if (patterns.size > 0) {
          bag.patterns = patterns;
        }
      }

      if (typeName === "ZodArray") {
        if (this._def.minLength) {
          bag.minimum = this._def.minLength.value;
        }
        if (this._def.maxLength) {
          bag.maximum = this._def.maxLength.value;
        }
      }

      const propValues: any = {};
      if (typeName === "ZodObject" && this._def.shape) {
        for (const [key, field] of Object.entries(this._def.shape) as any) {
          if (field._def.typeName === "ZodLiteral") {
            propValues[key] = new Set([field._def.value]);
          } else if (field._def.typeName === "ZodEnum") {
            propValues[key] = new Set(field._def.values);
          }
        }
      }

      return {
        def,
        bag,
        propValues,
        optin: this.isOptional?.() ? undefined : true,
        optout: this.isOptional?.() ? undefined : true,
        parent: undefined,
      };
    },
    configurable: true,
  });
}

import { generateOpenApiDocument } from "trpc-to-openapi";

const handler = async (req: NextRequest) => {
  if (req.nextUrl.pathname.endsWith("/openapi.json")) {
    try {
      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: "Virat CRM API",
        version: "1.0.0",
        baseUrl: `${req.nextUrl.protocol}//${req.nextUrl.host}/api/rest`,
      });
      return Response.json(openApiDocument);
    } catch (e: any) {
      return Response.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
  }

  return createOpenApiFetchHandler({
    endpoint: "/api/rest",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
