from uuid import UUID
from datetime import date, timedelta

from app.repositories.habit_log_repository import HabitLogRepository
from app.repositories.habit_repository import HabitRepository
from app.schemas.habit import HabitCreate, HabitUpdate
from app.models import Habit


class HabitService:
    def __init__(self, habit_repo: HabitRepository, log_repo: HabitLogRepository):
        self.habit_repo = habit_repo
        self.log_repo = log_repo

    async def create_habit(self, data: HabitCreate, user_id: int) -> Habit:
        habit_data = data.model_dump()
        habit_data["user_id"] = user_id
        return await self.habit_repo.create(habit_data)

    async def get_habit(self, uid: UUID) -> Habit | None:
        return await self.habit_repo.get_by_uid(uid)

    async def update_habit(self, uid: UUID, data: HabitUpdate) -> Habit | None:
        habit_data = data.model_dump(exclude_unset=True)
        return await self.habit_repo.update(uid, habit_data)

    async def delete_habit(self, uid: UUID) -> Habit | None:
        return await self.habit_repo.delete(uid)

    async def get_all_habits(self, user_id: int) -> list[Habit]:
        return await self.habit_repo.get_all(user_id)

    async def _recalculate_streak(self, habit: Habit) -> int:
        """
        Calculate streak using required-day PERIODS instead of exact days.

        For each required day D, its "period" is the window from the day after
        the previous required day up to D (inclusive). Any log within the period
        counts as completing it. This way completing a Tuesday habit on Monday
        still counts for the Tuesday slot.

        days_mask: 7-char string, index 0=Sun (JS getDay() style).
        Python weekday 0=Mon → JS dow = (weekday+1) % 7.
        """
        logs = await self.log_repo.get_logs_by_habit_id(habit.id)
        if not logs:
            return 0
        log_dates = {log.completed_date for log in logs}
        days_mask = habit.days
        today = date.today()

        def find_required(start: date, direction: int) -> date | None:
            """Nearest required day from start in direction (+1=fwd, -1=bwd)."""
            check = start
            for _ in range(8):
                js_dow = (check.weekday() + 1) % 7
                if len(days_mask) > js_dow and days_mask[js_dow] == "1":
                    return check
                check += timedelta(days=direction)
            return None  # habit has no required days

        # Start from the next (or current) required day ≥ today
        curr_slot = find_required(today, 1)
        if curr_slot is None:
            return 0

        streak = 0
        for _ in range(200):
            prev_slot = find_required(curr_slot - timedelta(days=1), -1)
            period_start = prev_slot + timedelta(days=1) if prev_slot else date.min

            # Cap at today — can't count future log entries
            effective_end = min(curr_slot, today)
            has_log = any(period_start <= d <= effective_end for d in log_dates)

            if has_log:
                streak += 1
            elif curr_slot >= today:
                pass   # active period, not completed yet — OK, keep going back
            else:
                break  # past period missed → streak ends

            curr_slot = prev_slot
            if curr_slot is None:
                break

        return streak

    async def sync_streak(self, habit: Habit) -> Habit:
        """
        Recalculate streak from real logs and persist if it changed.
        Called on every GET /habits/ so missed days auto-reset on next open.
        """
        correct_streak = await self._recalculate_streak(habit)
        if correct_streak != habit.current_streak:
            new_best = max(habit.best_streak, correct_streak)
            await self.habit_repo.update_by_id(habit.id, {
                "current_streak": correct_streak,
                "best_streak": new_best,
            })
            await self.habit_repo.session.refresh(habit)
        return habit

    async def complete_habit(self, habit_id: int) -> tuple[Habit | None, bool]:
        """Mark today as done. Returns (habit, was_just_completed)."""
        habit = await self.habit_repo.get_by_id(habit_id)
        if habit is None:
            return None, False

        today = date.today()
        if await self.log_repo.get_log_by_date(habit.id, today) is not None:
            return habit, False  # already done today

        await self.log_repo.create({"habit_id": habit.id, "completed_date": today})

        # Recalculate from real logs — handles gaps correctly
        new_streak = await self._recalculate_streak(habit)
        new_best = max(habit.best_streak, new_streak)
        await self.habit_repo.update_by_id(habit.id, {
            "current_streak": new_streak,
            "best_streak": new_best,
        })
        await self.habit_repo.session.refresh(habit)
        return habit, True

    async def uncomplete_habit(self, habit_id: int) -> tuple[Habit | None, bool]:
        """Remove today's log. Returns (habit, was_removed)."""
        habit = await self.habit_repo.get_by_id(habit_id)
        if habit is None:
            return None, False

        today = date.today()
        existing_log = await self.log_repo.get_log_by_date(habit.id, today)
        if existing_log is None:
            return habit, False

        await self.log_repo.session.delete(existing_log)
        await self.log_repo.session.commit()

        # Recalculate without today's log
        new_streak = await self._recalculate_streak(habit)
        new_best = max(habit.best_streak, new_streak)
        await self.habit_repo.update_by_id(habit.id, {
            "current_streak": new_streak,
            "best_streak": new_best,
        })
        await self.habit_repo.session.refresh(habit)
        return habit, True

    async def is_completed_today(self, habit_id: int) -> bool:
        log = await self.log_repo.get_log_by_date(habit_id, date.today())
        return log is not None
