Goal Creation

````md
# Progressive Time Disclosure — Implementation Brief

## Feature Goal

Build a single-page creation flow where users can create one of four accountability item types:

- Goal
- Habit
- Task
- Commitment

The form must feel personalized. When the user selects a type, the page should reveal only the next meaningful parameter for that type. The experience should feel like a conversation, not a long static form.

The core UX principle is:

> The item’s time structure comes first. Reminder settings are revealed only after there is something meaningful to attach the reminder to.

---

# Core Concept: Progressive Time Disclosure

The page anatomy should remain consistent across all item types:

1. Type selector
2. Title field
3. Dynamic time spine
4. Reminder block
5. Live summary sentence
6. Create button

The title field should always be visible.

All blocks below the title should grow downward inline as the user gives answers.

The Create button should always be visible but disabled until the minimum required fields for the selected type are complete.

---

# Item Types and Time Logic

## 1. Goal

A Goal is outcome-based.

A Goal has a deadline.

A Goal does not necessarily have a frequency.

The user may choose how often they want to be reminded.

### Reveal Order

After selecting `Goal`, show:

```text
By when?
````

Options:

* This month
* This quarter
* This year
* Custom date

After the deadline is selected, reveal the reminder block.

The reminder block should be pre-filled using an automatic cadence based on how far away the deadline is.

Suggested default rule:

```ts
if deadline is within 14 days:
  reminderCadence = "daily"

if deadline is between 15 and 90 days:
  reminderCadence = "weekly"

if deadline is more than 90 days away:
  reminderCadence = "monthly"
```

Reminder block fields:

* Reminder enabled toggle
* Cadence selector: Daily / Weekly / Monthly
* Time of day selector: Morning / Afternoon / Evening / Custom time
* “Don’t remind me” affordance

### Minimum Required to Create

```text
title + deadline
```

Reminder is enabled by default but optional.

### Summary Examples

With reminder:

```text
Hit Make ₦500M by Dec 31 — I'll check in weekly, mornings.
```

Without reminder:

```text
Hit Make ₦500M by Dec 31.
```

---

## 2. Habit

A Habit is rhythm-based.

A Habit does not have a deadline by default.

A Habit must have frequency.

Reminder inherits from the frequency but remains editable.

### Reveal Order

After selecting `Habit`, show:

```text
How often?
```

Options:

* Every day
* A few times a week
* Once a week
* Custom

Alternative internal values:

```ts
"daily"
"times_per_week"
"weekly"
"custom"
```

After frequency is selected, reveal reminder settings.

The reminder should inherit from the chosen frequency.

Examples:

If Daily:

* all days selected by default
* time of day required or defaulted

If Weekly:

* user selects one day
* time of day required or defaulted

If N times per week:

* user selects number of times
* optional preferred days
* reminder time

Reminder block fields:

* Reminder enabled toggle
* Days selector
* Time of day selector
* Custom time option

### Minimum Required to Create

```text
title + frequency
```

Reminder is inherited automatically.

### Summary Examples

```text
Meditate every morning, 7 days a week.
```

```text
Read 3× a week — reminder evenings.
```

---

## 3. Task

A Task is completion-based.

A Task has a due date.

A Task has a reminder tied to the due date.

A Task should not have frequency.

### Reveal Order

After selecting `Task`, show:

```text
When's it due?
```

Fields:

* Date
* Optional time

After due date is selected, reveal reminder settings.

Reminder should be relative to the due date.

Options:

* Morning of
* 1 hour before
* 1 day before
* Custom

Default:

```text
Morning of
```

### Minimum Required to Create

```text
title + due date
```

### Summary Examples

```text
Submit report due Fri — reminder Thursday morning.
```

```text
Pay school fees due Jun 10 — reminder morning of.
```

---

## 4. Commitment

A Commitment is a promise, obligation, or recurring responsibility.

A Commitment can be one-time or recurring.

Frequency is optional because the user must first choose whether it is one-time or recurring.

### Reveal Order

After selecting `Commitment`, show the fork first:

```text
One-time or recurring?
```

Options:

* One-time
* Recurring

### If One-time

Show:

```text
When?
```

Fields:

* Date
* Optional reminder

This behaves like a light Task.

### If Recurring

Show:

```text
How often?
```

Options:

* Daily
* Weekly
* Monthly
* Yearly

Then reveal reminder settings inherited from frequency.

Commitment is the only type that should support `Yearly`.

### Minimum Required to Create

For one-time:

```text
title + date
```

For recurring:

```text
title + frequency
```

### Summary Examples

```text
Call Mom every Sunday evening.
```

```text
Donate once on Jun 1.
```

```text
Renew license yearly — reminder 1 week before.
```

---

# Shared Data Model

Use a unified data structure that supports all types.

```ts
type ItemType = "goal" | "habit" | "task" | "commitment";

type ReminderCadence = "daily" | "weekly" | "monthly" | "yearly" | "custom";

type TimeOfDay = "morning" | "afternoon" | "evening" | "custom";

type CommitmentMode = "one_time" | "recurring";

type Reminder = {
  enabled: boolean;
  cadence?: ReminderCadence;
  timeOfDay?: TimeOfDay;
  customTime?: string;
  relativeToDeadline?: "morning_of" | "one_hour_before" | "one_day_before" | "custom";
  customReminderDateTime?: string;
};

type AccountabilityItemForm = {
  type: ItemType | null;
  title: string;

  goal?: {
    deadline?: string;
  };

  habit?: {
    frequency?: "daily" | "times_per_week" | "weekly" | "custom";
    timesPerWeek?: number;
    days?: string[];
  };

  task?: {
    dueDate?: string;
    dueTime?: string;
  };

  commitment?: {
    mode?: CommitmentMode;
    date?: string;
    frequency?: "daily" | "weekly" | "monthly" | "yearly";
    days?: string[];
  };

  reminder?: Reminder;
};
```

---

# Validation Rules

## Goal

Can create if:

```ts
title.length > 0 && goal.deadline exists
```

## Habit

Can create if:

```ts
title.length > 0 && habit.frequency exists
```

## Task

Can create if:

```ts
title.length > 0 && task.dueDate exists
```

## Commitment

Can create if one-time:

```ts
title.length > 0 && commitment.mode === "one_time" && commitment.date exists
```

Can create if recurring:

```ts
title.length > 0 && commitment.mode === "recurring" && commitment.frequency exists
```

---

# Type Switching Behavior

If the user changes the selected type:

Persist:

```text
title
```

Reset:

```text
time spine
reminder settings
type-specific fields
```

The reset should not feel harsh.

Use a soft fade or slide transition when replacing blocks.

Do not wipe the whole page.

---

# Create Button Behavior

The Create button should always be visible.

Before validation is satisfied:

```text
disabled / greyed
```

After validation is satisfied:

```text
enabled
```

Button label should change based on type:

```text
Create Goal
Create Habit
Create Task
Create Commitment
```

If no type is selected:

```text
Create
```

---

# Live Summary Sentence

The summary sentence should be pinned near the bottom, above the Create button.

It should update live as the user fills the form.

It should feel like the app confirming:

```text
Here is what I think you mean.
```

The summary should be human-readable, not technical.

Avoid words like:

* cadence
* recurrence
* configuration
* parameter

Use plain language.

Examples:

```text
Hit Make ₦500M by Dec 31 — I'll check in weekly, mornings.
```

```text
Read 3× a week — reminder evenings.
```

```text
Submit report due Friday — reminder Thursday morning.
```

```text
Call Mom every Sunday evening.
```

---

# UX Copy

## Type Selector Label

```text
Held accountable for?
```

## Goal

```text
By when?
```

## Habit

```text
How often?
```

## Task

```text
When's it due?
```

## Commitment

```text
One-time or recurring?
```

## Reminder Block

For Goal:

```text
How closely should we keep you on track?
```

Options:

* Daily
* Weekly
* Monthly

For Habit:

```text
When should we remind you?
```

For Task:

```text
Remind me
```

For Commitment:

```text
Reminder
```

Reminder off copy:

```text
Don't remind me
```

---

# UI Behavior

Use progressive inline reveal.

Each new block should animate in gently.

Recommended animation:

```text
opacity: 0 → 1
translateY: 8px → 0
duration: 180ms–240ms
```

Avoid large page jumps.

On mobile, keep spacing tight.

The page should feel like one evolving card, not multiple disconnected sections.

---

# Recommended Component Structure

```text
CreateItemPage
 ├── TypeSelector
 ├── TitleInput
 ├── TimeSpine
 │    ├── GoalSpine
 │    ├── HabitSpine
 │    ├── TaskSpine
 │    └── CommitmentSpine
 ├── ReminderBlock
 ├── LiveSummary
 └── CreateButton
```

---

# Suggested React State

```ts
const [form, setForm] = useState<AccountabilityItemForm>({
  type: null,
  title: "",
  reminder: {
    enabled: true,
  },
});
```

When type changes:

```ts
function handleTypeChange(type: ItemType) {
  setForm(prev => ({
    type,
    title: prev.title,
    reminder: {
      enabled: true,
    },
  }));
}
```

---

# Reminder Default Helpers

```ts
function getGoalReminderCadence(deadline: Date): ReminderCadence {
  const today = new Date();
  const diffInDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays <= 14) return "daily";
  if (diffInDays <= 90) return "weekly";
  return "monthly";
}
```

```ts
function getDefaultTimeOfDay(): TimeOfDay {
  return "morning";
}
```

---

# Summary Generator

Create a function that builds the live summary based on the form state.

```ts
function generateSummary(form: AccountabilityItemForm): string {
  if (!form.type) return "Choose what you want to create.";

  if (!form.title) return "Start by giving it a title.";

  switch (form.type) {
    case "goal":
      if (!form.goal?.deadline) return `Hit ${form.title}.`;
      if (form.reminder?.enabled) {
        return `Hit ${form.title} by ${formatDate(form.goal.deadline)} — I'll check in ${form.reminder.cadence}, ${form.reminder.timeOfDay}.`;
      }
      return `Hit ${form.title} by ${formatDate(form.goal.deadline)}.`;

    case "habit":
      if (!form.habit?.frequency) return `Build the habit: ${form.title}.`;
      if (form.reminder?.enabled) {
        return `${form.title} ${formatHabitFrequency(form.habit)} — reminder ${form.reminder.timeOfDay}.`;
      }
      return `${form.title} ${formatHabitFrequency(form.habit)}.`;

    case "task":
      if (!form.task?.dueDate) return `Complete ${form.title}.`;
      if (form.reminder?.enabled) {
        return `${form.title} due ${formatDate(form.task.dueDate)} — reminder ${formatRelativeReminder(form.reminder)}.`;
      }
      return `${form.title} due ${formatDate(form.task.dueDate)}.`;

    case "commitment":
      if (!form.commitment?.mode) return `Commit to ${form.title}.`;

      if (form.commitment.mode === "one_time") {
        if (!form.commitment.date) return `Commit to ${form.title} once.`;
        return `${form.title} once on ${formatDate(form.commitment.date)}.`;
      }

      if (!form.commitment.frequency) return `Commit to ${form.title} regularly.`;
      return `${form.title} ${formatCommitmentFrequency(form.commitment)}.`;

    default:
      return "";
  }
}
```

---

# Smart Defaults

Where possible, use sensible defaults so the fastest path is short.

Examples:

Goal:

```text
Deadline selected → reminder auto-filled
```

Habit:

```text
Frequency selected → reminder inherited
```

Task:

```text
Due date selected → reminder defaults to morning of
```

Commitment:

```text
Recurring frequency selected → reminder inherited
```

The user should be able to create quickly without manually configuring every field.

---

# Accessibility Requirements

* All chips must be keyboard accessible.
* Selected chips must have visible selected states.
* Disabled Create button must include clear visual treatment.
* Inputs must have proper labels.
* Do not rely on color alone to communicate state.
* Summary sentence should be readable by screen readers.
* Animations should respect reduced-motion preferences.

---

# Mobile Requirements

This feature must be designed mobile-first.

On mobile:

* Type selector may be horizontal chips.
* Summary should be sticky above the Create button.
* Create button should be full-width.
* Avoid dense calendar UI unless Custom date is selected.
* Use bottom sheets for custom date/time pickers if needed.

Suggested mobile layout:

```text
[Type chips]
[Title]
[Dynamic block]
[Reminder block]
[Sticky summary]
[Full-width Create button]
```

---

# Empty and Partial States

Before type selection:

```text
Choose what you want to create.
```

After type selection but before title:

```text
Start by giving it a title.
```

After title but before required time spine:

Goal:

```text
When should this goal be achieved?
```

Habit:

```text
How often will you do this?
```

Task:

```text
When should this be completed?
```

Commitment:

```text
Is this one-time or recurring?
```

---

# Final UX Principle

Do not build this like a normal form.

Build it like a guided intent system.

The user should never see a control until the previous answer makes that control meaningful.

The system should progressively ask:

```text
What is it?
What is its time shape?
Do you want help remembering it?
Here is what I understood.
```

That is the experience.

```
```
