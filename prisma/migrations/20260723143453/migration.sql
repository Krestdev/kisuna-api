-- CreateIndex
CREATE INDEX "Attendance_employeeId_checkIn_idx" ON "Attendance"("employeeId", "checkIn");

-- CreateIndex
CREATE INDEX "Attendance_payrollUuid_idx" ON "Attendance"("payrollUuid");
