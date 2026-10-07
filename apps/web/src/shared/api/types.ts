/**
 * Short names for the API schemas. `schema.ts` is generated from the backend's
 * OpenAPI spec (`make web-types`): never edit it by hand. If the API changes,
 * regenerate it and TypeScript points at every place that must be updated.
 */
import type { components } from "@/shared/api/schema";

type Schemas = components["schemas"];

export type Student = Schemas["StudentResponse"];
export type SchoolClass = Schemas["ClassResponse"];
export type EnrolledClass = Schemas["EnrolledClassResponse"];
export type EnrolledStudent = Schemas["EnrolledStudentResponse"];
export type ProblemDetails = Schemas["ProblemDetails"];
