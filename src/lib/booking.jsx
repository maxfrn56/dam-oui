import { createContext, useContext, useMemo, useState } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      open,
      openBooking: () => setOpen(true),
      closeBooking: () => setOpen(false),
    }),
    [open]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
