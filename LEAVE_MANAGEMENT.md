# Leave Management Implementation

## Overview
Implemented a complete Leave Management system with balance tracking, integrated with Attendance and Payroll.

## Database Models (Prisma Schema)

### Leave Model
```prisma
model Leave {
  uuid         Int         @id @default(autoincrement())
  type         LeaveType
  startDate    DateTime
  endDate      DateTime
  reason       String?     @db.VarChar(255)
  status       LeaveStatus @default(PENDING)
  approvedBy   String?
  rejectReason String?     @db.VarChar(255)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [uuid])
}
```

### LeaveBalance Model (NEW)
```prisma
model LeaveBalance {
  uuid          Int      @id @default(autoincrement())
  year          Int
  totalDays     Int      @default(21)
  usedDays      Int      @default(0)
  remainingDays Int      @default(21)

  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [uuid])

  @@unique([employeeId, year])
}
```

## API Endpoints

### Leave Management
- `POST /leaves` - Request leave (authenticated user)
  - Validates leave balance before creating request
  - Calculates requested days and checks against remaining balance
- `GET /leaves` - List all leaves (admin only)
- `GET /leaves/:id` - Get single leave request
- `PATCH /leaves/:id/approve` - Approve leave request (admin only)
  - Automatically deducts from leave balance
- `PATCH /leaves/:id/reject` - Reject leave request (admin only)
- `PATCH /leaves/:id/cancel` - Cancel own pending leave request
- `PATCH /leaves/:id/cancel-approved` - Cancel approved leave (refunds balance)

### Employee Leave Information
- `GET /employees/:id/leaves` - Get all leave requests for an employee
- `GET /employees/:id/leaves/balance` - Get leave balance (used/remaining days)
  - Auto-creates balance record if doesn't exist
- `PATCH /employees/:id/leaves/balance/:year` - Update employee leave quota (admin only)

## Integration with Attendance

### 1. Check-In Blocking
When an employee tries to check in, the system now:
- Checks if the employee is on approved leave for that day
- Blocks check-in with error: "You are on approved leave today, check-in not required"

Location: `src/attendance/attendance.service.ts`

### 2. Auto-Mark Leave Days (Cron Job)
A daily cron job runs at 1:00 AM to automatically mark attendance as `ON_LEAVE`:

```typescript
@Cron('0 1 * * *') // 1am daily
async markLeaveDays() {
  // Finds all approved leaves for today
  // Creates or updates attendance records with status ON_LEAVE
}
```

Location: `src/leaves/leave-cron.service.ts`

## Integration with Payroll

### Leave Impact on Salary Calculation

When generating payroll, the system now:

1. Fetches all approved leaves for the payroll period
2. Calculates leave days by type:
   - **Paid Leave** (ANNUAL, SICK, MATERNITY, PATERNITY, OTHER): NO deduction
   - **Unpaid Leave**: Deducted from salary like absent days

```typescript
// Deduct only absent days + unpaid leave days
const deductions = (summary.absentDays + unpaidLeaveDays) * DAILY_RATE;
const netSalary = contract.baseSalary + overtimePay - deductions;
```

Location: `src/payrolls/payrolls.service.ts`

### Leave Type Impact Table

| Leave Type | Payroll Impact |
|------------|----------------|
| ANNUAL | Paid, no deduction |
| SICK | Paid, no deduction |
| MATERNITY | Paid, no deduction |
| PATERNITY | Paid, no deduction |
| OTHER | Paid, no deduction |
| UNPAID | Deducted like absence |

## Leave Balance Tracking

### How It Works

1. **Auto-initialization**: When an employee requests leave or checks balance, a `LeaveBalance` record is automatically created if it doesn't exist for the current year.

2. **Balance Validation**: Before creating a leave request:
   ```typescript
   checkLeaveBalance(employeeId, requestedDays) {
     // Check if remainingDays >= requestedDays
     // Throw error if insufficient balance
   }
   ```

3. **On Approval**: Leave days are deducted from balance:
   ```typescript
   usedDays += leaveDays
   remainingDays -= leaveDays
   ```

4. **On Cancellation**: If an approved leave is cancelled, days are refunded:
   ```typescript
   usedDays -= leaveDays
   remainingDays += leaveDays
   ```

### Default Configuration
- Default quota: **21 days per year**
- Configurable per employee via admin endpoint
- Unique constraint: `[employeeId, year]`

### Admin Controls
- View any employee's balance: `GET /employees/:id/leaves/balance`
- Adjust quota: `PATCH /employees/:id/leaves/balance/:year`
  - Example: Adjust employee quota from 21 to 25 days
  - Automatically recalculates remaining days

## Files Created

```
src/leaves/
├── dto/
│   ├── request-leave.dto.ts
│   ├── reject-leave.dto.ts
│   ├── update-balance-quota.dto.ts
│   └── index.ts
├── leaves.controller.ts
├── leaves.service.ts
├── leave-cron.service.ts
└── leaves.module.ts
```

## Key Features

### ✅ Balance Validation
- Employees cannot request more days than available
- Real-time balance check during leave request
- Clear error message: "Insufficient leave balance. Remaining: X days"

### ✅ Automatic Tracking
- Balance auto-created on first request/check
- Deducted on approval
- Refunded on cancellation of approved leave

### ✅ Year-based Quotas
- Each employee can have different quotas per year
- Admin can adjust individual quotas
- Perfect for contracts with different leave entitlements

## Module Integration

- Added `LeavesModule` to `AppModule`
- Imported `LeavesModule` into `EmployeesModule` for employee leave endpoints
- Leave service is exported and can be used by other modules

## Security

- User must be authenticated (JWT) to request/cancel leaves
- Only admins can approve/reject leaves
- Employees can only cancel their own pending requests
- Leave balance is publicly viewable per employee

## Next Steps (Optional Enhancements)

1. Add email notifications on leave approval/rejection
2. Implement leave quota per employee based on contract
3. Add holiday calendar to exclude public holidays from leave days
4. Implement half-day leave support
5. Add manager approval workflow (if employee has direct manager)
