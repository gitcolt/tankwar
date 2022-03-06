export interface SessionData {
  sessionID: string;
  userID: string;
  username: string;
}

interface SessionStore {
  findSession(id: string): SessionData;
  saveSession(id: string, session: SessionData): void;
  findAllSessions(): SessionData[];
}

export class InMemorySessionStore implements SessionStore {
  sessions: Map<string, SessionData>;

  constructor() {
    this.sessions = new Map<string, SessionData>();
  }

  findSession(id: string): SessionData {
    return this.sessions.get(id);
  }

  saveSession(id: string, session: SessionData) {
    this.sessions.set(id, session);
  }

  findAllSessions(): SessionData[] {
    return [...this.sessions.values()];
  }
}
