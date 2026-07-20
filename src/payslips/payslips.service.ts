import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RustfsService } from '../rustfs/rustfs.service';
import PDFDocument = require('pdfkit');
import { format } from 'date-fns';

@Injectable()
export class PayslipsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly rustfs: RustfsService,
  ) {}

  async generatePayslip(payrollId: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { uuid: payrollId },
      include: { employee: true, contract: true, payslip: true },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (payroll.status !== 'APPROVED') {
      throw new BadRequestException(
        'Payroll must be APPROVED before generating payslip',
      );
    }

    if (payroll.payslip) {
      throw new BadRequestException(
        'Payslip already generated for this payroll',
      );
    }

    // Generate PDF
    const pdfBuffer = await this.generatePdf(payroll);

    // Upload PDF to Rustfs
    const objectKey = `payslips/${payroll.employeeId}/${payrollId}.pdf`;
    const filePath = await this.rustfs.uploadBuffer(
      pdfBuffer,
      objectKey,
      'application/pdf',
    );

    // Save payslip record
    return this.prisma.payslip.create({
      data: {
        employeeId: payroll.employeeId,
        payrollId: payroll.uuid,
        totalAmount: payroll.netSalary,
        filePath,
      },
    });
  }

  async findOne(uuid: string) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { uuid },
      include: { employee: true, payroll: true },
    });

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return payslip;
  }

  async download(uuid: string) {
    const payslip = await this.findOne(uuid);

    if (!payslip.filePath) {
      throw new NotFoundException('Payslip document not generated or missing');
    }

    const url = await this.rustfs.getFileUrl(payslip.filePath);
    return { url };
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.payslip.findMany({
      where: { employeeId },
      orderBy: { issueDate: 'desc' },
      include: { payroll: true },
    });
  }

  private async generatePdf(payroll: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('PAYSLIP', { align: 'center' });
      doc.moveDown();

      // Employee info
      doc
        .fontSize(12)
        .text(
          `Employee: ${payroll.employee.firstName} ${payroll.employee.lastName}`,
        );
      doc.text(`Period: ${format(payroll.startDate, 'MMMM yyyy')}`);
      doc.moveDown();

      // Salary breakdown
      doc.text(`Base Salary:    ${payroll.baseSalary.toFixed(2)} XAF`);
      doc.text(`Overtime Pay:   ${payroll.overtimePay.toFixed(2)} XAF`);
      doc.text(`Bonus:          ${payroll.bonus.toFixed(2)} XAF`);
      doc.text(`Deductions:     -${payroll.deductions.toFixed(2)} XAF`);
      doc.moveDown();
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`NET SALARY: ${payroll.netSalary.toFixed(2)} XAF`);

      doc.end();
    });
  }
}
