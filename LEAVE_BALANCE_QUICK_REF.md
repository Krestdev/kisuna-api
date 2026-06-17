# Leave Balance System - Quick Reference

## Database Table: LeaveBalance

```sql
CREATE TABLE "LeaveBalance" (
  uuid          SERIAL PRIMARY KEY,
  year          INT NOT NULL,
  totalDays     INT DEFAULT 21,
  usedDays      INT DEFAULT 0,
  remainingDays INT DEFAULT 21,
  employeeId    TEXT NOT NULL,
  UNIQUE(employeeId, year)
);
```

## Flow

### 1. Request Leave
```
Employee requests 5 days
  ↓
Check balance: remainingDays >= 5?
  ↓ YES
Create Leave (status: PENDING)
```

### 2. Approve Leave
```
Admin approves leave
  ↓
Update LeaveBalance:
  usedDays += 5
  remainingDays -= 5
  ↓
Leave status: APPROVED
```

### 3. Cancel Approved Leave
```
Employee cancels approved leave
  ↓
Update LeaveBalance:
  usedDays -= 5
  remainingDays += 5
  ↓
Leave status: CANCELLED
```

## API Examples

### Request Leave (with balance check)
```bash
POST /leaves
{
  "type": "ANNUAL",
  "startDate": "2026-07-01",
  "endDate": "2026-07-05",
  "reason": "Family vacation"
}

# If insufficient balance:
# 400 Bad Request: "Insufficient leave balance. Remaining: 3 days"
```

### Check Balance
```bash
GET /employees/{id}/leaves/balance

Response:
{
  "year": 2026,
  "total": 21,
  "used": 8,
  "remaining": 13
}
```

### Update Employee Quota (Admin)
```bash
PATCH /employees/{id}/leaves/balance/2026
{
  "totalDays": 25
}

# If employee had 21 total and 8 used (13 remaining):
# New: 25 total, 8 used, 17 remaining (13 + 4)
```

## Important Notes

- Balance is **auto-created** on first request/check
- Default quota: **21 days/year**
- Quota is **per employee, per year**
- Only **approved** leaves deduct from balance
- **Pending** leaves don't affect balance until approved
- **Cancelled approved** leaves refund the balance
