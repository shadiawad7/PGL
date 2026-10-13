type Interval = { startsAt: Date; endsAt: Date }
export type ConfirmedReservation = Interval & { timeSlotId: string; userId: string }
export type BookableSlot = Interval & { id: string; capacity: number }

// Half-open intervals: a session may start exactly when the previous one ends.
export function overlaps(first: Interval, second: Interval) {
  return first.startsAt < second.endsAt && second.startsAt < first.endsAt
}

export function remainingPlaces(slot: BookableSlot, reservations: ConfirmedReservation[], userId: string) {
  const overlapping = reservations.filter((reservation) => overlaps(slot, reservation))
  // One shared agenda: different start times/formats cannot occupy the same time.
  // Only participants in the exact same group session may share its capacity.
  if (overlapping.some((reservation) => reservation.timeSlotId !== slot.id || reservation.userId === userId)) return 0
  return Math.max(0, slot.capacity - overlapping.length)
}
