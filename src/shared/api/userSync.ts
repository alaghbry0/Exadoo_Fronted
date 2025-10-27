type UserSyncData = {
  telegramId: string;
  telegramUsername: string | null;
  fullName: string | null;
};

export async function syncUserData(userData: UserSyncData): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const payload = await response.json();
      console.error("Failed to sync user data:", payload.error ?? response.statusText);
    } else {
      console.log("✅ User data synced successfully with the backend.");
    }
  } catch (error) {
    console.error("Network or other error during user sync:", error);
  }
}
