import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { useReducedMotion } from "motion/react";
import { dateToValue, formatBirthDate, minimumBirthYear, valueToDate } from "../data/profile.js";
import "react-day-picker/style.css";


export function BirthDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = valueToDate(value);
  const [month, setMonth] = useState(selected);
  const reduced = useReducedMotion();
  const today = new Date();
  return <div className="checkout-field">
    <label className="checkout-label" htmlFor="profile-birthday">Date of birth</label>
    <Popover.Root open={open} onOpenChange={(next) => { if (next) setMonth(selected); setOpen(next); }}>
      <Popover.Trigger asChild>
        <button type="button" id="profile-birthday" className="checkout-input birthday-trigger">
          <span>{formatBirthDate(value)}</span><span className="birthday-chevron" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="birthday-popover" sideOffset={8} align="start" collisionPadding={16} aria-label="Choose date of birth" onOpenAutoFocus={(event) => event.preventDefault()}>
          <DayPicker mode="single" required autoFocus selected={selected} month={month} onMonthChange={setMonth}
            onSelect={(date) => { if (date) { onChange(dateToValue(date)); setOpen(false); } }}
            startMonth={new Date(minimumBirthYear, 0)} endMonth={today} disabled={[{ before: new Date(minimumBirthYear, 0, 1) }, { after: today }]}
            captionLayout="dropdown" reverseYears navLayout="after" weekStartsOn={1} showOutsideDays fixedWeeks animate={!reduced} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </div>;
}
