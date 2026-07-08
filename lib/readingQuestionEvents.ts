import { getAuthHeaders } from './apiHeaders';

export type ReadingFunnelFlag =
  | 'result_viewed'
  | 'signup_after_result'
  | 'paywall_shown'
  | 'subscribe_clicked';

export async function trackReadingFunnelEvent(flag: ReadingFunnelFlag): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    await fetch('/api/reading-question-events', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ flag }),
      keepalive: true,
    });
  } catch (error) {
    console.warn('[readingQuestionEvents] tracking failed', error);
  }
}

