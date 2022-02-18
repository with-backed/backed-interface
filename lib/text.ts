import { Event } from 'types/Event';

type EventName = Pick<Event, 'typename'>['typename'];
export function renderEventName(name: EventName) {
  const result = name.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}
