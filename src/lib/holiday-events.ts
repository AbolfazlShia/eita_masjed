export type HolidayEventPayload = {
  description: string;
  additional_description?: string;
  is_holiday?: boolean;
  is_religious?: boolean;
};

export type HolidayApiResponse = {
  is_holiday?: boolean;
  events?: HolidayEventPayload[];
};

export async function fetchHolidayEventsByJalali(
  year: number,
  month: number,
  day: number
): Promise<string[]> {
  const paddedMonth = month.toString().padStart(2, '0');
  const paddedDay = day.toString().padStart(2, '0');
  const url = `https://holidayapi.ir/jalali/${year}/${paddedMonth}/${paddedDay}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Holiday API error: ${response.status}`);
    }
    const payload = (await response.json()) as HolidayApiResponse;
    const events = payload.events ?? [];
    return events.map((event) =>
      event.additional_description
        ? `${event.description} (${event.additional_description})`
        : event.description
    );
  } catch (error) {
    console.warn('Failed to fetch holiday events from holidayapi.ir', error);
    return [];
  }
}
