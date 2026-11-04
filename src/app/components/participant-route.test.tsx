import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ParticipantRoute } from "./participant-route";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  clearSession: vi.fn(),
  getProfile: vi.fn(),
}));

vi.mock("@/app/utils/participant-session", () => ({
  getParticipantSession: mocks.getSession,
  clearParticipantSession: mocks.clearSession,
}));

vi.mock("@/app/services/participant-api", () => ({
  getParticipantProfile: mocks.getProfile,
  ParticipantAccessError: class extends Error {
    constructor(public expired: boolean) {
      super("Participant access error");
    }
  },
}));

vi.mock("@/app/i18n/language", () => ({
  Localize: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/i18n/account-language", () => ({
  AccountLanguageProvider: ({ children }: { children: React.ReactNode }) =>
    <>{children}</>,
}));

const session = {
  accessToken: "dummy-test-token",
  subscriberId: 10,
  organizationId: 1,
  scopes: ["participant:profile:read"],
  expiresAt: Date.now() + 600000,
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

function mountRoute() {
  return render(
    <MemoryRouter>
      <ParticipantRoute>
        <div>Dashboard loaded</div>
      </ParticipantRoute>
    </MemoryRouter>,
  );
}

describe("ParticipantRoute authentication lifecycle", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getSession.mockReturnValue(session);
    mocks.getProfile.mockResolvedValue(profile);
  });

  afterEach(() => {
    cleanup();
  });

  it("opens the dashboard with a valid session", async () => {
    mountRoute();

    expect(await screen.findByText("Dashboard loaded")).toBeTruthy();
    expect(mocks.clearSession).not.toHaveBeenCalled();
  });

  it("does not overlap focus-triggered requests", async () => {
    let finish!: (value: typeof profile) => void;

    const pending = new Promise<typeof profile>((resolve) => {
      finish = resolve;
    });

    mocks.getProfile.mockReturnValue(pending);

    mountRoute();

    await waitFor(() => expect(mocks.getProfile).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("focus"));
    });

    expect(mocks.getProfile).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish(profile);
      await pending;
    });

    expect(await screen.findByText("Dashboard loaded")).toBeTruthy();
  });

  it("does not clear a session after a temporary server failure", async () => {
    mocks.getProfile.mockRejectedValueOnce(new Error("Network unavailable"));

    mountRoute();

    expect(await screen.findByText("Connection unavailable")).toBeTruthy();
    expect(mocks.clearSession).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Dashboard loaded")).toBeTruthy();
    expect(mocks.clearSession).not.toHaveBeenCalled();
  });

  it("blocks access without clearing the token after a 403", async () => {
    const { ParticipantAccessError } =
      await import("@/app/services/participant-api");

    mocks.getProfile.mockRejectedValue(new ParticipantAccessError(false));

    mountRoute();

    expect(await screen.findByText("Connection unavailable")).toBeTruthy();
    expect(screen.queryByText("Dashboard loaded")).toBeNull();
    expect(mocks.clearSession).not.toHaveBeenCalled();
  });

  it("clears a conclusively invalid session after a 401", async () => {
    const { ParticipantAccessError } =
      await import("@/app/services/participant-api");

    mocks.getProfile.mockRejectedValue(new ParticipantAccessError(true));

    mountRoute();

    await waitFor(() => {
      expect(mocks.clearSession).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Session ended")).toBeTruthy();
    expect(screen.queryByText("Dashboard loaded")).toBeNull();
  });
});