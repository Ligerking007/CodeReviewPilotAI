import { ReviewResponse } from '../types/review';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function githubLoginUrl() {
  return `${API_URL}/auth/github`;
}

export async function loginWithGithubToken(githubToken: string): Promise<{ appToken: string }> {
  const response = await fetch(`${API_URL}/auth/github-token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ token: githubToken })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API failed with ${response.status}`);
  }

  return (await response.json()) as { appToken: string };
}

export async function createReview(token: string, prUrl: string, language: 'en' | 'th'): Promise<ReviewResponse> {
  const response = await fetch(`${API_URL}/ai-review/reviews`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ prUrl, language })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API failed with ${response.status}`);
  }

  return (await response.json()) as ReviewResponse;
}

export async function getHistory(token: string): Promise<ReviewResponse[]> {
  const response = await fetch(`${API_URL}/history`, {
    headers: { authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`API failed with ${response.status}`);
  }

  const rows = (await response.json()) as Array<{
    id: string;
    prUrl: string;
    title: string;
    createdAt: string;
    result?: { result: ReviewResponse['result'] };
  }>;

  return rows
    .filter((row) => row.result)
    .map((row) => ({
      id: row.id,
      prUrl: row.prUrl,
      title: row.title,
      createdAt: row.createdAt,
      result: row.result!.result
    }));
}
