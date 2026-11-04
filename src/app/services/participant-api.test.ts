import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getParticipantProfile,
  ParticipantAccessError,
} from "./participant-api";
import type { ParticipantBrowserSession } from "../utils/participant-session";

vi.mock("../config/api", () => ({
  buildApiUrl: (path: string) => `https://api.example.test${path}`,
}));

const session: ParticipantBrowserSession = {
  accessToken: "test-token-not-real",
  expiresAt: Date.now() + 600000,
  subscriberId: 10,
  organizationId: 1,
  scopes: ["participant:profile:read"],
};

const profile = {
  subscriber_id: 10,
  organization_id: 1,
  full_name: "Test Participant",
  status: "ACTIVE",
  is_verified: true,
  language: "en",
  timezone: "America/Chicago",
};

describe("Participant profile authentication", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepts a valid participant profile", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify(profile), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ));

    const result = await getParticipantProfile(
      session,
      new AbortController().signal,
    );

    expect(result.subscriber_id).toBe(10);
    expect(result.organization_id).toBe(1);
  });

  it("classifies HTTP 401 as an invalid session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 401 }),
    ));

    await expect(
      getParticipantProfile(session, new AbortController().signal),
    ).rejects.toMatchObject({
      expired: true,
    });
  });

  it("does not classify HTTP 403 as token expiration", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 403 }),
    ));

    await expect(
      getParticipantProfile(session, new AbortController().signal),
    ).rejects.toMatchObject({
      expired: false,
    });
  });

  it("does not invalidate a session on HTTP 503", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 503 }),
    ));

    await expect(
      getParticipantProfile(session, new AbortController().signal),
    ).rejects.toMatchObject({
      expired: false,
    });
  });

  it("rejects a profile belonging to another participant", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ ...profile, subscriber_id: 99 }),
        { status: 200 },
      ),
    ));

    await expect(
      getParticipantProfile(session, new AbortController().signal),
    ).rejects.toBeInstanceOf(ParticipantAccessError);
  });
});