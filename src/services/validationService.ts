import { RFPRequirements, ValidationResult, ValidationItem, MasterData } from '../types/rfp';

export class ValidationService {
  validateRequirements(requirements: RFPRequirements, masterData: MasterData): ValidationResult {
    const result: ValidationResult = {
      기본정보: [],
      특수요구사항: [],
      경고: []
    };

    // 기본 정보 검증
    this.validateBasicInfo(requirements, masterData, result);
    
    // 펀드 요구사항 검증
    this.validateFundRequirements(requirements, masterData, result);
    
    // 핵심인력 검증
    this.validateKeyPersonnel(requirements, masterData, result);
    
    // 투자 실적 검증
    this.validateInvestmentHistory(requirements, masterData, result);
    
    // 재무 요구사항 검증
    this.validateFinancialRequirements(requirements, masterData, result);

    return result;
  }

  private validateBasicInfo(
    requirements: RFPRequirements,
    masterData: MasterData,
    result: ValidationResult
  ): void {
    // 회사명 검증
    if (!masterData.회사정보.회사명?.trim()) {
      result.기본정보.push({
        항목: '회사명',
        결과: false,
        메시지: '회사명이 입력되지 않았습니다.',
        severity: 'error'
      });
    }

    // 설립일 검증
    const companyAge = this.calculateCompanyAge(masterData.회사정보.설립일);
    if (companyAge < 1) {
      result.기본정보.push({
        항목: '설립일',
        결과: false,
        메시지: '회사 설립일이 1년 미만입니다. 일반적으로 1년 이상의 운영 경험이 필요합니다.',
        severity: 'warning'
      });
    }

    // AUM 검증
    if (!masterData.회사정보.AUM || masterData.회사정보.AUM <= 0) {
      result.기본정보.push({
        항목: 'AUM',
        결과: false,
        메시지: 'AUM (운용자산총액) 정보가 필요합니다.',
        severity: 'error'
      });
    } else if (masterData.회사정보.AUM < requirements.펀드요구사항.최소결성액 * 0.5) {
      result.기본정보.push({
        항목: 'AUM',
        결과: false,
        메시지: `현재 AUM이 신청 펀드 최소결성액의 50% 미만입니다. (현재: ${(masterData.회사정보.AUM / 100000000).toFixed(0)}억원, 필요: ${(requirements.펀드요구사항.최소결성액 * 0.5 / 100000000).toFixed(0)}억원 이상)`,
        severity: 'warning'
      });
    }

    // 사업자등록번호 형식 검증
    if (!this.isValidBusinessNumber(masterData.회사정보.사업자등록번호)) {
      result.기본정보.push({
        항목: '사업자등록번호',
        결과: false,
        메시지: '사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)',
        severity: 'error'
      });
    }
  }

  private validateFundRequirements(
    requirements: RFPRequirements,
    masterData: MasterData,
    result: ValidationResult
  ): void {
    // GP 출자비율 검증
    const gpOutlayRatio = this.calculateGPOutlayRatio(masterData, requirements);
    if (gpOutlayRatio < requirements.펀드요구사항.출자비율.GP최소) {
      result.특수요구사항.push({
        항목: 'GP 출자비율',
        결과: false,
        메시지: `GP 출자비율이 ${gpOutlayRatio.toFixed(1)}%로 최소 요구사항 ${requirements.펀드요구사항.출자비율.GP최소}%를 충족하지 않습니다.`,
        severity: 'error'
      });
    }

    // 펀드 규모 검증
    const proposedFundSize = requirements.펀드요구사항.최소결성액;
    if (proposedFundSize > masterData.회사정보.AUM * 2) {
      result.특수요구사항.push({
        항목: '펀드 규모',
        결과: false,
        메시지: `신청 펀드 규모가 현재 AUM의 2배를 초과합니다. 운용 경험을 고려하여 신중히 검토하세요.`,
        severity: 'warning'
      });
    }

    // 과거 펀드 실적 검증
    const activeFunds = masterData.펀드실적.filter(fund => fund.상태 === '운용중');
    const avgPerformance = this.calculateAveragePerformance(masterData.펀드실적);
    
    if (activeFunds.length === 0 && masterData.펀드실적.length === 0) {
      result.특수요구사항.push({
        항목: '펀드 운용 경험',
        결과: false,
        메시지: '펀드 운용 경험이 없습니다. 정부 출자사업 참여를 위해서는 최소한의 운용 경험이 필요할 수 있습니다.',
        severity: 'warning'
      });
    } else if (avgPerformance < 5) {
      result.특수요구사항.push({
        항목: '펀드 성과',
        결과: false,
        메시지: `평균 펀드 수익률이 ${avgPerformance.toFixed(1)}%로 낮습니다. 투자 성과 개선 방안을 제시하세요.`,
        severity: 'warning'
      });
    }

    // 의무투자 준수 가능성 검증
    const investmentCapacity = this.assessInvestmentCapacity(masterData, requirements);
    if (!investmentCapacity.feasible) {
      result.특수요구사항.push({
        항목: '의무투자 준수',
        결과: false,
        메시지: investmentCapacity.message,
        severity: 'warning'
      });
    }
  }

  private validateKeyPersonnel(
    requirements: RFPRequirements,
    masterData: MasterData,
    result: ValidationResult
  ): void {
    const keyPersonnelReq = requirements.특수조건.핵심운용인력;
    
    // 최소 인원 수 검증
    const qualifiedPersonnel = masterData.핵심인력.filter(person => 
      person.경력년수 >= keyPersonnelReq.팀원경력
    );
    
    if (qualifiedPersonnel.length < keyPersonnelReq.최소인원) {
      result.특수요구사항.push({
        항목: '핵심인력 수',
        결과: false,
        메시지: `자격을 갖춘 핵심인력이 ${qualifiedPersonnel.length}명으로 최소 요구사항 ${keyPersonnelReq.최소인원}명을 충족하지 않습니다.`,
        severity: 'error'
      });
    }

    // 대표 PM 경력 검증
    const leadPM = masterData.핵심인력.find(person => 
      person.직책.includes('대표') || person.직책.includes('PM') || person.직책.includes('파트너')
    );
    
    if (!leadPM) {
      result.특수요구사항.push({
        항목: '대표PM',
        결과: false,
        메시지: '대표 또는 PM급 인력 정보가 없습니다.',
        severity: 'error'
      });
    } else if (leadPM.경력년수 < keyPersonnelReq.대표PM경력) {
      result.특수요구사항.push({
        항목: '대표PM 경력',
        결과: false,
        메시지: `대표PM 경력이 ${leadPM.경력년수}년으로 최소 요구사항 ${keyPersonnelReq.대표PM경력}년을 충족하지 않습니다.`,
        severity: 'error'
      });
    } else if (leadPM.경력년수 < keyPersonnelReq.대표PM경력 + 2) {
      result.특수요구사항.push({
        항목: '대표PM 경력',
        결과: true,
        메시지: `대표PM 경력이 최소 요구사항을 충족하지만, ${keyPersonnelReq.대표PM경력 + 2}년 이상이 권장됩니다.`,
        severity: 'warning'
      });
    }

    // 팀 구성의 다양성 검증
    const educationDiversity = new Set(masterData.핵심인력.map(p => p.학력.split(' ')[0])).size;
    if (educationDiversity < 2 && masterData.핵심인력.length >= 3) {
      result.특수요구사항.push({
        항목: '팀 구성',
        결과: true,
        메시지: '핵심인력의 학력 배경이 다양하지 않습니다. 다양한 전문성을 갖춘 팀 구성을 고려해보세요.',
        severity: 'info'
      });
    }
  }

  private validateInvestmentHistory(
    requirements: RFPRequirements,
    masterData: MasterData,
    result: ValidationResult
  ): void {
    const investments = masterData.투자실적;
    
    if (investments.length === 0) {
      result.특수요구사항.push({
        항목: '투자 실적',
        결과: false,
        메시지: '투자 실적이 없습니다.',
        severity: 'warning'
      });
      return;
    }

    // 의무투자 대상 분야 투자 경험 검증
    const targetSector = requirements.펀드요구사항.의무투자.대상;
    const relevantInvestments = this.findRelevantInvestments(investments, targetSector);
    
    if (relevantInvestments.length === 0) {
      result.특수요구사항.push({
        항목: '의무투자 대상 경험',
        결과: false,
        메시지: `${targetSector} 분야 투자 경험이 없습니다. 해당 분야에 대한 투자 전문성을 입증해야 합니다.`,
        severity: 'warning'
      });
    } else {
      const relevantRatio = (relevantInvestments.length / investments.length) * 100;
      if (relevantRatio < 30) {
        result.특수요구사항.push({
          항목: '의무투자 대상 경험',
          결과: true,
          메시지: `${targetSector} 분야 투자 비중이 ${relevantRatio.toFixed(1)}%입니다. 더 많은 관련 경험이 있으면 유리합니다.`,
          severity: 'info'
        });
      }
    }

    // 투자 성과 검증
    const activeInvestments = investments.filter(inv => inv.현재상태 === '운영중');
    const exitedInvestments = investments.filter(inv => 
      inv.현재상태.includes('EXIT') || inv.현재상태.includes('IPO') || inv.현재상태.includes('M&A')
    );
    
    if (exitedInvestments.length === 0 && investments.length > 5) {
      result.특수요구사항.push({
        항목: '투자 성과',
        결과: true,
        메시지: '투자 회수 실적이 없습니다. EXIT 경험이 있으면 더 유리합니다.',
        severity: 'info'
      });
    }

    // 투자 포트폴리오 규모 검증
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.투자액, 0);
    const avgInvestmentSize = totalInvestment / investments.length;
    
    if (avgInvestmentSize < 500000000) { // 5억원
      result.특수요구사항.push({
        항목: '투자 규모',
        결과: true,
        메시지: `평균 투자 규모가 ${(avgInvestmentSize / 100000000).toFixed(1)}억원입니다. 대형 투자 경험이 제한적일 수 있습니다.`,
        severity: 'info'
      });
    }
  }

  private validateFinancialRequirements(
    requirements: RFPRequirements,
    masterData: MasterData,
    result: ValidationResult
  ): void {
    const proposedFundSize = requirements.펀드요구사항.최소결성액;
    const gpCommitment = proposedFundSize * (requirements.펀드요구사항.출자비율.GP최소 / 100);
    
    // GP 출자 가능성 검증 (AUM 대비)
    const gpCommitmentRatio = (gpCommitment / masterData.회사정보.AUM) * 100;
    if (gpCommitmentRatio > 20) {
      result.특수요구사항.push({
        항목: 'GP 출자 부담',
        결과: false,
        메시지: `GP 출자액이 현재 AUM의 ${gpCommitmentRatio.toFixed(1)}%로 부담이 클 수 있습니다. 재무 안정성을 검토하세요.`,
        severity: 'warning'
      });
    }

    // 운용보수 수익성 검증
    const expectedManagementFee = proposedFundSize * 0.02; // 연 2% 가정
    const operatingCost = masterData.핵심인력.length * 100000000; // 인당 1억원 가정
    
    if (expectedManagementFee < operatingCost) {
      result.특수요구사항.push({
        항목: '수익성',
        결과: false,
        메시지: '예상 운용보수가 운영비용을 충당하기 어려울 수 있습니다. 비즈니스 모델을 재검토하세요.',
        severity: 'warning'
      });
    }
  }

  // 유틸리티 메서드들
  private calculateCompanyAge(establishedDate: Date): number {
    const now = new Date();
    return (now.getTime() - establishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }

  private isValidBusinessNumber(businessNumber: string): boolean {
    const pattern = /^\d{3}-\d{2}-\d{5}$/;
    return pattern.test(businessNumber);
  }

  private calculateGPOutlayRatio(masterData: MasterData, requirements: RFPRequirements): number {
    // 실제로는 더 복잡한 계산이 필요하지만, 여기서는 간단히 구현
    // AUM 대비 출자 가능 비율을 기준으로 계산
    const proposedFundSize = requirements.펀드요구사항.최소결성액;
    const availableCapital = masterData.회사정보.AUM * 0.1; // AUM의 10%가 출자 가능하다고 가정
    
    return Math.min((availableCapital / proposedFundSize) * 100, requirements.펀드요구사항.출자비율.GP최소);
  }

  private calculateAveragePerformance(funds: MasterData['펀드실적']): number {
    if (funds.length === 0) return 0;
    
    const totalReturn = funds.reduce((sum, fund) => sum + fund.수익률, 0);
    return totalReturn / funds.length;
  }

  private assessInvestmentCapacity(
    masterData: MasterData,
    requirements: RFPRequirements
  ): { feasible: boolean; message: string } {
    const mandatoryInvestmentRatio = requirements.펀드요구사항.의무투자.비율;
    const proposedFundSize = requirements.펀드요구사항.최소결성액;
    const mandatoryAmount = proposedFundSize * (mandatoryInvestmentRatio / 100);
    
    // 과거 연간 투자액 기준으로 투자 역량 평가
    const recentInvestments = masterData.투자실적.filter(inv => 
      inv.투자일 > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2) // 최근 2년
    );
    
    const annualInvestmentCapacity = recentInvestments.reduce((sum, inv) => sum + inv.투자액, 0) / 2;
    
    if (annualInvestmentCapacity < mandatoryAmount / 5) { // 5년 기준
      return {
        feasible: false,
        message: `연간 투자 역량(${(annualInvestmentCapacity / 100000000).toFixed(0)}억원)이 의무투자 요구사항 대비 부족할 수 있습니다.`
      };
    }
    
    return { feasible: true, message: '의무투자 준수 가능' };
  }

  private findRelevantInvestments(
    investments: MasterData['투자실적'],
    targetSector: string
  ): MasterData['투자실적'] {
    const keywords = this.extractSectorKeywords(targetSector);
    
    return investments.filter(investment => 
      keywords.some(keyword => 
        investment.분야.toLowerCase().includes(keyword.toLowerCase()) ||
        investment.포트폴리오명.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  private extractSectorKeywords(targetSector: string): string[] {
    const sectorMap: { [key: string]: string[] } = {
      'AI': ['AI', '인공지능', 'machine learning', 'ML', '딥러닝'],
      'AX': ['AX', 'Autonomous', '자율주행', '로봇'],
      '바이오': ['바이오', 'bio', '헬스케어', '의료', '제약'],
      '핀테크': ['핀테크', 'fintech', '금융', '블록체인'],
      '게임': ['게임', 'game', '엔터테인먼트'],
      'ESG': ['ESG', '환경', '친환경', '지속가능']
    };
    
    for (const [sector, keywords] of Object.entries(sectorMap)) {
      if (targetSector.includes(sector)) {
        return keywords;
      }
    }
    
    return [targetSector];
  }
}