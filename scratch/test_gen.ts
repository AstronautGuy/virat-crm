import "dotenv/config";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "../src/server/api/root";

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

try {
  console.log("Generating OpenAPI document...");
  const openApiDocument = generateOpenApiDocument(appRouter, {
    title: "Virat CRM API",
    version: "1.0.0",
    baseUrl: "http://localhost:3000/api/rest",
  });
  console.log("Success! Generated OpenAPI document.");
  console.log(JSON.stringify(openApiDocument, null, 2).substring(0, 1000) + "...");
} catch (error: any) {
  console.error("ERROR generating OpenAPI document:");
  console.error(error);
}
