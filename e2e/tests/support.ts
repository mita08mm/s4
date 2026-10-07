import { type APIRequestContext, test as base, expect } from "@playwright/test";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/** Unique suffix so parallel tests and repeated runs never collide. */
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

type Created = { kind: "students" | "classes"; id: string };

/** Creates data through the API and deletes it after each test. */
class Api {
  private created: Created[] = [];

  constructor(private readonly request: APIRequestContext) {}

  async student(overrides: Partial<{ code: string; first_name: string; last_name: string }> = {}) {
    const code = overrides.code ?? `E2E-${uid()}`;
    const body = {
      code,
      first_name: overrides.first_name ?? "Prueba",
      last_name: overrides.last_name ?? code,
      email: `${code.toLowerCase()}@e2e.s4.edu`,
    };
    return this.create("students", body);
  }

  async schoolClass(title: string) {
    return this.create("classes", { code: `E2E-${uid()}`, title, description: "Clase de prueba E2E" });
  }

  async findStudentByCode(code: string): Promise<{ id: string } | undefined> {
    const response = await this.request.get(`${API_URL}/api/v1/students?q=${code}`);
    return (await response.json()).items[0];
  }

  /** Registers something the UI created, so it is cleaned up too. */
  track(kind: Created["kind"], id: string) {
    this.created.push({ kind, id });
  }

  async cleanup() {
    for (const { kind, id } of this.created.reverse()) {
      await this.request.delete(`${API_URL}/api/v1/${kind}/${id}`);
    }
  }

  private async create(kind: Created["kind"], body: object) {
    const response = await this.request.post(`${API_URL}/api/v1/${kind}`, { data: body });
    expect(response.status(), await response.text()).toBe(201);
    const created = await response.json();
    this.track(kind, created.id);
    return created;
  }
}

export const test = base.extend<{ api: Api }>({
  api: async ({ request }, use) => {
    const api = new Api(request);
    await use(api);
    await api.cleanup();
  },
});

export { expect };
