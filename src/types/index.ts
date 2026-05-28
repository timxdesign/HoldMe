export type { Database, Json } from "./database"

import type { Database } from "./database"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Space = Database["public"]["Tables"]["spaces"]["Row"]
export type SpaceMember = Database["public"]["Tables"]["space_members"]["Row"]
export type AccountabilityItem = Database["public"]["Tables"]["accountability_items"]["Row"]
export type ItemCheckin = Database["public"]["Tables"]["item_checkins"]["Row"]
export type Strength = Database["public"]["Tables"]["strengths"]["Row"]
export type Comment = Database["public"]["Tables"]["comments"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type Invite = Database["public"]["Tables"]["invites"]["Row"]
export type Report = Database["public"]["Tables"]["reports"]["Row"]
export type CircleGoal = Database["public"]["Tables"]["circle_goals"]["Row"]
export type CircleComment = Database["public"]["Tables"]["circle_comments"]["Row"]
export type CircleStrength = Database["public"]["Tables"]["circle_strengths"]["Row"]
