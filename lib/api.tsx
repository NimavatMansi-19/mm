export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://minutes-of-meeting-lv83.onrender.com";

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Invalid username or password");
  }

  return res.json();
};
