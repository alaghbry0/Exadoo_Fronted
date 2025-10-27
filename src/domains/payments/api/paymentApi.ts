import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchBotWalletAddress() {
  try {
    const response = await fetch(`${BASE_URL}/api/public/wallet`);
    if (!response.ok) {
      console.error("❌ Failed to fetch wallet address");
      return null;
    }
    const payload = await response.json();
    return payload.wallet_address ?? null;
  } catch (error) {
    console.error("❌ Error fetching wallet address:", error);
    return null;
  }
}

type FetchUserPaymentsParams = {
  telegramId: number;
  page?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export async function fetchUserPayments(params: FetchUserPaymentsParams) {
  const response = await axios.get(`${BASE_URL}/api/user/payments`, { params });
  return {
    data: response.data.results,
    pagination: response.data.pagination,
  };
}
