import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminApi, AdminSearchUser } from "../api";

export function useAdminUsers() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<AdminSearchUser[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<AdminSearchUser[]>([]);

  const [searching, setSearching] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedSearch = useMemo(() => search.trim(), [search]);

  const loadInvitedUsers = useCallback(async () => {
    try {
      setLoadingInvites(true);
      const users = await AdminApi.getInvitedUsers();
      setInvitedUsers(users);
      return users;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load invited users";
      setError(message);
      setInvitedUsers([]);
      return [];
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  const runSearch = useCallback(async (term: string) => {
    const q = term.trim();

    if (q.length < 2) {
      setSearchResults([]);
      return [];
    }

    try {
      setSearching(true);
      const users = await AdminApi.searchUsers(q);
      setSearchResults(users);
      return users;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to search users";
      setError(message);
      setSearchResults([]);
      return [];
    } finally {
      setSearching(false);
    }
  }, []);

  const searchNow = useCallback(async () => {
    return runSearch(trimmedSearch);
  }, [runSearch, trimmedSearch]);

  const invite = useCallback(
    async (userId: string) => {
      try {
        await AdminApi.invite(userId);

        setSearchResults((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, invited: true } : u))
        );

        await loadInvitedUsers();
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to send invite";
        setError(message);
        throw err;
      }
    },
    [loadInvitedUsers]
  );

  const removeInvite = useCallback(async (userId: string) => {
    try {
      await AdminApi.removeInvite(userId);

      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, invited: false } : u))
      );

      setInvitedUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to remove invite";
      setError(message);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadInvitedUsers();
    if (trimmedSearch.length >= 2) {
      await runSearch(trimmedSearch);
    }
  }, [loadInvitedUsers, runSearch, trimmedSearch]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  useEffect(() => {
    loadInvitedUsers();
  }, [loadInvitedUsers]);

  return {
    search,
    setSearch,
    searchResults,
    invitedUsers,
    searching,
    loadingInvites,
    error,
    clearError,
    invite,
    removeInvite,
    refresh,
    searchNow,
    clearSearchResults,
  };
}