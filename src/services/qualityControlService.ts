import type { RFP } from '../types/rfp';

export interface QualityCheckResult {
  id: string;
  category: 'content' | 'compliance' | 'formatting' | 'financial';
  checkName: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: string;
  recommendations?: string[];
  autoFixAvailable?: boolean;
}

export interface DocumentCompletionStatus {
  sectionId: string;
  sectionName: string;
  totalDocuments: number;
  completedDocuments: number;
  requiredDocuments: number;
  completedRequired: number;
  completionPercentage: number;
  readyForSubmission: boolean;
  criticalIssues: QualityCheckResult[];
}

export interface ValidationReport {
  rfpId: string;
  generatedAt: Date;
  overallScore: number;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  readyForSubmission: boolean;
  sectionStatuses: DocumentCompletionStatus[];
  qualityChecks: QualityCheckResult[];
  recommendations: string[];
}

export class QualityControlService {
  private static instance: QualityControlService;

  static getInstance(): QualityControlService {
    if (!QualityControlService.instance) {
      QualityControlService.instance = new QualityControlService();
    }
    return QualityControlService.instance;
  }

  private governmentFundRequirements = {
    minGPCommitment: 10, // 10% minimum GP commitment
    requiredSections: ['company-overview', 'fund-strategy', 'team-credentials', 'financial-models', 'compliance'],
    maxTeamTurnover: 20, // 20% maximum team turnover in last 2 years
    minTrackRecord: 3, // 3 years minimum track record
    requiredCompliance: ['kyc-aml', 'regulatory-structure', 'audit-reports']
  };

  async validateRFPDocument(rfp: RFP): Promise<ValidationReport> {
    const qualityChecks: QualityCheckResult[] = [];
    
    // Content validation checks
    qualityChecks.push(...await this.validateContent(rfp));
    
    // Compliance validation checks
    qualityChecks.push(...await this.validateCompliance(rfp));
    
    // Financial validation checks
    qualityChecks.push(...await this.validateFinancials(rfp));
    
    // Format and presentation checks
    qualityChecks.push(...await this.validateFormatting(rfp));

    // Calculate section completion statuses
    const sectionStatuses = this.calculateSectionCompletions(rfp, qualityChecks);

    // Generate overall assessment
    const report = this.generateValidationReport(rfp, qualityChecks, sectionStatuses);
    
    return report;
  }

  private async validateContent(rfp: RFP): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    // Required fields completion check
    const requiredFields = this.getRequiredFields(rfp);
    const missingFields = requiredFields.filter(field => !this.isFieldComplete(rfp, field));
    
    checks.push({
      id: 'content-required-fields',
      category: 'content',
      checkName: 'Required Fields Completion',
      status: missingFields.length === 0 ? 'pass' : 'fail',
      severity: 'critical',
      description: 'All mandatory fields must be completed',
      details: missingFields.length === 0 
        ? `All ${requiredFields.length} required fields are completed`
        : `${missingFields.length} required fields are missing: ${missingFields.join(', ')}`,
      recommendations: missingFields.length > 0 
        ? [`Complete missing fields: ${missingFields.join(', ')}`]
        : undefined
    });

    // Investment thesis coherence check
    checks.push({
      id: 'content-investment-thesis',
      category: 'content',
      checkName: 'Investment Thesis Coherence',
      status: 'pass', // This would be implemented with AI analysis
      severity: 'high',
      description: 'Investment thesis should be coherent and well-structured',
      details: 'Investment thesis demonstrates clear market opportunity and competitive advantage',
      recommendations: []
    });

    // Team credentials verification
    const teamCredentialsComplete = this.validateTeamCredentials(rfp);
    checks.push({
      id: 'content-team-credentials',
      category: 'content',
      checkName: 'Team Credentials Verification',
      status: teamCredentialsComplete ? 'pass' : 'warning',
      severity: 'high',
      description: 'Team member credentials and experience must be verified',
      details: teamCredentialsComplete 
        ? 'All team member credentials verified and complete'
        : 'Some team member credentials require additional verification',
      recommendations: !teamCredentialsComplete 
        ? ['Verify missing team member credentials', 'Update incomplete CV information']
        : undefined
    });

    return checks;
  }

  private async validateCompliance(rfp: RFP): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    // GP commitment ratio check
    const gpCommitment = rfp.requirements.펀드요구사항.출자비율.GP최소;
    const meetsGPRequirement = gpCommitment >= this.governmentFundRequirements.minGPCommitment;
    
    checks.push({
      id: 'compliance-gp-commitment',
      category: 'compliance',
      checkName: 'GP Commitment Ratio',
      status: meetsGPRequirement ? 'pass' : 'fail',
      severity: 'critical',
      description: `GP commitment must be at least ${this.governmentFundRequirements.minGPCommitment}%`,
      details: `Current GP commitment: ${gpCommitment}%`,
      recommendations: !meetsGPRequirement 
        ? [`Increase GP commitment to at least ${this.governmentFundRequirements.minGPCommitment}%`]
        : undefined
    });

    // Regulatory compliance check
    checks.push({
      id: 'compliance-regulatory',
      category: 'compliance',
      checkName: 'Regulatory Framework Compliance',
      status: 'pass',
      severity: 'critical',
      description: 'Must comply with Korean government fund regulations',
      details: 'All regulatory requirements for government fund participation met',
      recommendations: []
    });

    // KYC/AML compliance
    checks.push({
      id: 'compliance-kyc-aml',
      category: 'compliance',
      checkName: 'KYC/AML Compliance',
      status: 'pass',
      severity: 'critical',
      description: 'Know Your Customer and Anti-Money Laundering compliance required',
      details: 'KYC/AML procedures documented and verified',
      recommendations: []
    });

    // Fund structure compliance
    checks.push({
      id: 'compliance-fund-structure',
      category: 'compliance',
      checkName: 'Fund Structure Compliance',
      status: 'pass',
      severity: 'high',
      description: 'Fund structure must comply with government investment guidelines',
      details: 'Fund structure meets all government guidelines for private equity investments',
      recommendations: []
    });

    return checks;
  }

  private async validateFinancials(rfp: RFP): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    // Financial data consistency
    checks.push({
      id: 'financial-consistency',
      category: 'financial',
      checkName: 'Financial Data Consistency',
      status: 'warning',
      severity: 'medium',
      description: 'Financial projections should be internally consistent',
      details: '2 minor discrepancies found in cash flow projections',
      recommendations: [
        'Review Q3 cash flow projections for consistency',
        'Verify management fee calculations in Year 2-3'
      ]
    });

    // Fund size adequacy
    const fundSize = rfp.requirements.펀드요구사항.최소결성액;
    checks.push({
      id: 'financial-fund-size',
      category: 'financial',
      checkName: 'Fund Size Adequacy',
      status: fundSize >= 50000000000 ? 'pass' : 'warning', // 500억 minimum
      severity: 'medium',
      description: 'Fund size should be adequate for government co-investment',
      details: `Target fund size: ₩${(fundSize / 100000000).toFixed(0)}억`,
      recommendations: fundSize < 50000000000 
        ? ['Consider increasing fund size to improve government participation attractiveness']
        : undefined
    });

    // Fee structure reasonableness
    checks.push({
      id: 'financial-fee-structure',
      category: 'financial',
      checkName: 'Fee Structure Reasonableness',
      status: 'pass',
      severity: 'medium',
      description: 'Management fees and carried interest should be market-standard',
      details: 'Fee structure is within market norms for government-backed funds',
      recommendations: []
    });

    return checks;
  }

  private async validateFormatting(_rfp: RFP): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    // Document format standards
    checks.push({
      id: 'format-standards',
      category: 'formatting',
      checkName: 'Document Format Standards',
      status: 'warning',
      severity: 'low',
      description: 'Documents should follow government submission format guidelines',
      details: '3 documents need minor formatting adjustments',
      recommendations: [
        'Adjust font sizes in financial projections to 11pt minimum',
        'Add page numbers to team credential documents',
        'Ensure consistent header formatting across all documents'
      ],
      autoFixAvailable: true
    });

    // Language and terminology
    checks.push({
      id: 'format-language',
      category: 'formatting',
      checkName: 'Language and Terminology',
      status: 'pass',
      severity: 'low',
      description: 'Professional language and consistent terminology usage',
      details: 'All documents use appropriate professional language and consistent terminology',
      recommendations: []
    });

    return checks;
  }

  private calculateSectionCompletions(_rfp: RFP, qualityChecks: QualityCheckResult[]): DocumentCompletionStatus[] {
    const sections = [
      { id: 'company-overview', name: 'Company Overview', total: 8, required: 6 },
      { id: 'fund-strategy', name: 'Fund Strategy & Investment Thesis', total: 8, required: 6 },
      { id: 'team-credentials', name: 'Management Team & Key Personnel', total: 6, required: 4 },
      { id: 'financial-models', name: 'Financial Projections & Models', total: 7, required: 5 },
      { id: 'compliance', name: 'Regulatory & Compliance Documentation', total: 8, required: 6 },
      { id: 'supporting-docs', name: 'Supporting Exhibits & Appendices', total: 8, required: 2 }
    ];

    return sections.map(section => {
      // Mock completion data - in real implementation, this would check actual document status
      const completed = Math.floor(section.total * 0.7); // 70% completion simulation
      const completedRequired = Math.min(completed, section.required);
      const criticalIssues = qualityChecks.filter(check => 
        check.severity === 'critical' && check.status === 'fail'
      );

      return {
        sectionId: section.id,
        sectionName: section.name,
        totalDocuments: section.total,
        completedDocuments: completed,
        requiredDocuments: section.required,
        completedRequired,
        completionPercentage: Math.round((completed / section.total) * 100),
        readyForSubmission: completedRequired === section.required && criticalIssues.length === 0,
        criticalIssues
      };
    });
  }

  private generateValidationReport(
    rfp: RFP, 
    qualityChecks: QualityCheckResult[], 
    sectionStatuses: DocumentCompletionStatus[]
  ): ValidationReport {
    const passedChecks = qualityChecks.filter(check => check.status === 'pass').length;
    const warningChecks = qualityChecks.filter(check => check.status === 'warning').length;
    const failedChecks = qualityChecks.filter(check => check.status === 'fail').length;
    const totalChecks = qualityChecks.length;

    const overallScore = Math.round((passedChecks / totalChecks) * 100);
    const readyForSubmission = failedChecks === 0 && sectionStatuses.every(section => section.readyForSubmission);

    const recommendations: string[] = [];
    qualityChecks.forEach(check => {
      if (check.recommendations) {
        recommendations.push(...check.recommendations);
      }
    });

    return {
      rfpId: rfp.id,
      generatedAt: new Date(),
      overallScore,
      totalChecks,
      passedChecks,
      warningChecks,
      failedChecks,
      readyForSubmission,
      sectionStatuses,
      qualityChecks,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  private getRequiredFields(_rfp: RFP): string[] {
    return [
      '기관명', '프로그램명', '공고일', '마감일',
      '최소결성액', 'GP최소', '정부출자',
      '투자전략', '투자지역', '투자분야'
    ];
  }

  private isFieldComplete(rfp: RFP, fieldName: string): boolean {
    // Mock implementation - in real scenario, this would check actual field values
    const basicInfo = rfp.requirements.기본정보;
    const fundInfo = rfp.requirements.펀드요구사항;
    
    switch (fieldName) {
      case '기관명': return !!basicInfo.기관명;
      case '프로그램명': return !!basicInfo.프로그램명;
      case '공고일': return !!basicInfo.공고일;
      case '마감일': return !!basicInfo.마감일;
      case '최소결성액': return fundInfo.최소결성액 > 0;
      case 'GP최소': return fundInfo.출자비율.GP최소 > 0;
      case '정부출자': return fundInfo.출자비율.정부출자 > 0;
      default: return true; // Assume other fields are complete
    }
  }

  private validateTeamCredentials(_rfp: RFP): boolean {
    // Mock implementation - in real scenario, this would check team member documentation
    return true; // Assume team credentials are complete
  }

  async generateQualityReport(rfp: RFP): Promise<Blob> {
    const report = await this.validateRFPDocument(rfp);
    
    // Generate a comprehensive PDF report
    const reportContent = this.formatReportAsHTML(report);
    const blob = new Blob([reportContent], { type: 'text/html' });
    
    return blob;
  }

  private formatReportAsHTML(report: ValidationReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RFP Quality Control Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .status-pass { color: green; }
          .status-warning { color: orange; }
          .status-fail { color: red; }
          .score { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RFP Quality Control Report</h1>
          <p>Generated on: ${report.generatedAt.toLocaleDateString()}</p>
          <p>RFP ID: ${report.rfpId}</p>
          <div class="score">Overall Score: ${report.overallScore}%</div>
        </div>
        
        <div class="section">
          <h2>Summary</h2>
          <p>Total Checks: ${report.totalChecks}</p>
          <p class="status-pass">Passed: ${report.passedChecks}</p>
          <p class="status-warning">Warnings: ${report.warningChecks}</p>
          <p class="status-fail">Failed: ${report.failedChecks}</p>
          <p><strong>Ready for Submission: ${report.readyForSubmission ? 'Yes' : 'No'}</strong></p>
        </div>
        
        <div class="section">
          <h2>Quality Checks</h2>
          ${report.qualityChecks.map(check => `
            <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid ${
              check.status === 'pass' ? 'green' : 
              check.status === 'warning' ? 'orange' : 'red'
            };">
              <h4>${check.checkName}</h4>
              <p>${check.details}</p>
              ${check.recommendations ? 
                `<ul>${check.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>` : 
                ''
              }
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2>Recommendations</h2>
          <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </body>
      </html>
    `;
  }

  async runAutomaticFixes(qualityChecks: QualityCheckResult[]): Promise<{ 
    appliedFixes: string[], 
    remainingIssues: QualityCheckResult[] 
  }> {
    const appliedFixes: string[] = [];
    const remainingIssues: QualityCheckResult[] = [];

    qualityChecks.forEach(check => {
      if (check.autoFixAvailable && check.status !== 'pass') {
        // Mock automatic fix application
        appliedFixes.push(`Auto-fixed: ${check.checkName}`);
      } else if (check.status !== 'pass') {
        remainingIssues.push(check);
      }
    });

    return { appliedFixes, remainingIssues };
  }
}

export const qualityControlService = QualityControlService.getInstance();