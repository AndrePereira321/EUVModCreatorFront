import type { APP_FILLS } from "../constants/styles/fill.ts";
import type { APP_RADII } from "../constants/styles/radius.ts";
import type { APP_SIZES } from "../constants/styles/size.ts";
import type { APP_VARIANTS } from "../constants/styles/variant.ts";

export type AppVariant = (typeof APP_VARIANTS)[number];
export type AppFill = (typeof APP_FILLS)[number];
export type AppSize = (typeof APP_SIZES)[number];
export type AppRadius = (typeof APP_RADII)[number];
