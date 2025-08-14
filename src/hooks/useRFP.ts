import { useState, useEffect, useCallback } from 'react';
import { RFP, RFPRequirements, ValidationResult, MasterData } from '../types/rfp';
import { RFPService } from '../services/rfpService';

export const useRFP = () => {
  const [rfps, setRFPs] = useState<RFP[]>([]);
  const [currentRFP, setCurrentRFP] = useState<RFP | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const rfpService = new RFPService();
  
  const loadRFPs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rfpService.getAllRFPs();
      setRFPs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFPs');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const loadRFP = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const rfp = await rfpService.getRFPById(id);
      setCurrentRFP(rfp);
      return rfp;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const saveRFP = useCallback(async (rfp: RFP) => {
    setLoading(true);
    setError(null);
    try {
      await rfpService.saveRFP(rfp);
      await loadRFPs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save RFP');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadRFPs]);
  
  const deleteRFP = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await rfpService.deleteRFP(id);
      await loadRFPs();
      if (currentRFP?.id === id) {
        setCurrentRFP(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete RFP');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadRFPs, currentRFP]);
  
  const validateRFP = useCallback(async (rfpId: string, masterData: MasterData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await rfpService.validateForRFP(rfpId, masterData);
      setValidationResult(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate RFP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const compareRFPs = useCallback(async (oldRfpId: string, newRfpId: string) => {
    setLoading(true);
    setError(null);
    try {
      const comparison = await rfpService.compareRFPs(oldRfpId, newRfpId);
      return comparison;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare RFPs');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createNewRFP = useCallback((baseRfp?: RFP): RFP => {
    const newRFP: RFP = {
      id: `rfp-${Date.now()}`,
      requirements: baseRfp?.requirements || getDefaultRequirements(),
      mappingRules: baseRfp?.mappingRules || getDefaultMappingRules(),
      excelTemplate: baseRfp?.excelTemplate || getDefaultExcelTemplate(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    return newRFP;
  }, []);
  
  useEffect(() => {
    loadRFPs();
  }, [loadRFPs]);
  
  return {
    rfps,
    currentRFP,
    validationResult,
    loading,
    error,
    loadRFP,
    saveRFP,
    deleteRFP,
    validateRFP,
    compareRFPs,
    createNewRFP,
    setCurrentRFP,
    clearError: () => setError(null)
  };
};

const getDefaultRequirements = (): RFPRequirements => ({
  기본정보: {
    기관명: '',
    프로그램명: '',
    공고일: new Date(),
    마감일: new Date(),
    공고문URL: ''
  },
  펀드요구사항: {
    최소결성액: 0,
    최대결성액: 0,
    출자비율: {
      GP최소: 1,
      정부출자: 50
    },
    의무투자: {
      비율: 60,
      대상: '',
      세부조건: []
    },
    존속기간: {
      기본: 8,
      연장가능: true
    }
  },
  평가기준: [],
  제출서류: [],
  특수조건: {
    핵심운용인력: {
      최소인원: 3,
      대표PM경력: 5,
      팀원경력: 3
    },
    제한사항: [],
    우대사항: []
  }
});

const getDefaultMappingRules = (): any => ({
  rfpId: '',
  mappings: [],
  customFields: []
});

const getDefaultExcelTemplate = (): any => ({
  rfpId: '',
  sheets: []
});