import { PAGINATION } from "@/configs/constants";
import { Difficulty } from "@/generated/prisma/enums";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  parseAsStringLiteral,
} from "nuqs/server";

export const problemsParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  difficulty: parseAsStringEnum<Difficulty>(Object.values(Difficulty)),
  category: parseAsStringLiteral([
    "Algorithms",
    "Graph Theory",
    "Data Structures",
    "Concurrency",
    "Database",
  ]).withOptions({ clearOnDefault: true }),
};
