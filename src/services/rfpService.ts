import type { RFP, RFPRequirements, ValidationResult, MasterData } from '../types/rfp';
import { StorageService } from './storageService';

export class RFPService {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
    this.storageService.initialize().catch(console.error);
  }
  
  async getAllRFPs(): Promise<RFP[]> {
    try {
      return await this.storageService.getAllRFPs();
    } catch (error) {
      console.error('RFP 목록 조회 실패:', error);
      return [];
    }
  }
  
  async getRFPById(id: string): Promise<RFP | null> {
    try {
      return await this.storageService.getRFP(id);
    } catch (error) {
      console.error('RFP 조회 실패:', error);
      return null;
    }
  }
  
  async saveRFP(rfp: RFP): Promise<void> {
    try {
      const updatedRFP = { ...rfp, updatedAt: new Date() };
      await this.storageService.saveRFP(updatedRFP);
    } catch (error) {
      console.error('RFP 저장 실패:', error);
      throw error;
    }
  }
  
  async deleteRFP(id: string): Promise<void> {
    try {
      await this.storageService.deleteRFP(id);
    } catch (error) {
      console.error('RFP 삭제 실패:', error);
      throw error;
    }
  }
  
  async validateForRFP(rfpId: string, masterData: MasterData): Promise<ValidationResult> {
    const rfp = await this.getRFPById(rfpId);
    if (!rfp) {
      throw new Error(`RFP with id ${rfpId} not found`);
    }
    
    return this.performValidation(rfp.requirements, masterData);
  }
  
  private performValidation(requirements: RFPRequirements, data: MasterData): ValidationResult {
    const result: ValidationResult = {
      기본정보: [],
      특수요구사항: [],
      경고: []
    };
    
    // 기본 정보 검증
    if (!data.회사정보.회사명) {
      result.기본정보.push({
        항목: '회사명',
        결과: false,
        메시지: '회사명이 입력되지 않았습니다.',
        severity: 'error'
      });
    }
    
    if (!data.회사정보.AUM || data.회사정보.AUM === 0) {
      result.기본정보.push({
        항목: 'AUM',
        결과: false,
        메시지: 'AUM 정보가 필요합니다.',
        severity: 'error'
      });
    }
    
    // 펀드 요구사항 검증
    const gpOutlayRatio = this.calculateGPOutlay(data);
    if (gpOutlayRatio < requirements.펀드요구사항.출자비율.GP최소) {
      result.특수요구사항.push({
        항목: 'GP 출자비율',
        결과: false,
        메시지: `GP 출자비율이 ${gpOutlayRatio}%로 최소 ${requirements.펀드요구사항.출자비율.GP최소}% 미만입니다.`,
        severity: 'error'
      });
    }
    
    // 핵심인력 검증
    const corePersonnel = data.핵심인력.filter(person => person.경력년수 >= requirements.특수조건.핵심운용인력.팀원경력);
    if (corePersonnel.length < requirements.특수조건.핵심운용인력.최소인원) {
      result.특수요구사항.push({
        항목: '핵심인력 수',
        결과: false,
        메시지: `핵심인력이 ${corePersonnel.length}명으로 최소 ${requirements.특수조건.핵심운용인력.최소인원}명 미만입니다.`,
        severity: 'error'
      });
    }
    
    // 대표 PM 경력 검증
    const leadPM = data.핵심인력.find(person => person.직책.includes('대표') || person.직책.includes('PM'));
    if (!leadPM || leadPM.경력년수 < requirements.특수조건.핵심운용인력.대표PM경력) {
      result.특수요구사항.push({
        항목: '대표PM 경력',
        결과: false,
        메시지: `대표PM 경력이 ${leadPM?.경력년수 || 0}년으로 최소 ${requirements.특수조건.핵심운용인력.대표PM경력}년 미만입니다.`,
        severity: 'error'
      });
    }
    
    return result;
  }
  
  private calculateGPOutlay(_data: MasterData): number {
    // GP 출자비율 계산 로직 (임시)
    return 1.5; // 예시값
  }
  
  async compareRFPs(oldRfpId: string, newRfpId: string): Promise<any> {
    const oldRfp = await this.getRFPById(oldRfpId);
    const newRfp = await this.getRFPById(newRfpId);
    
    if (!oldRfp || !newRfp) {
      throw new Error('RFP not found for comparison');
    }
    
    const differences = {
      펀드요구사항: this.compareObjects(oldRfp.requirements.펀드요구사항, newRfp.requirements.펀드요구사항),
      특수조건: this.compareObjects(oldRfp.requirements.특수조건, newRfp.requirements.특수조건),
      평가기준: this.compareArrays(oldRfp.requirements.평가기준, newRfp.requirements.평가기준)
    };
    
    return differences;
  }
  
  private compareObjects(old: any, updated: any): any {
    const differences: any = {};
    
    for (const key in updated) {
      if (old[key] !== updated[key]) {
        differences[key] = {
          old: old[key],
          new: updated[key],
          changed: true
        };
      }
    }
    
    return differences;
  }
  
  private compareArrays(old: any[], updated: any[]): any {
    return {
      added: updated.filter(item => !old.some(oldItem => JSON.stringify(oldItem) === JSON.stringify(item))),
      removed: old.filter(item => !updated.some(newItem => JSON.stringify(newItem) === JSON.stringify(item))),
      unchanged: updated.filter(item => old.some(oldItem => JSON.stringify(oldItem) === JSON.stringify(item)))
    };
  }
}