import { useState, useCallback } from 'react';
import type { ExcelTemplate, MasterData, RFP } from '../types/rfp';
import { ExcelService } from '../services/excelService';

export const useExcel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const excelService = new ExcelService();

  const generateExcel = useCallback(async (
    template: ExcelTemplate,
    masterData: MasterData,
    mappedData: any,
    filename?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const buffer = excelService.generateExcelFromTemplate(template, masterData, mappedData);
      const defaultFilename = `RFP_${template.rfpId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      excelService.downloadExcel(buffer, filename || defaultFilename);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excel 생성 실패');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (rfp: RFP) => {
    setLoading(true);
    setError(null);
    
    try {
      const template = excelService.createTemplateFromRFP(rfp);
      return template;
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿 생성 실패');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const readExcelFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await excelService.readExcelFile(file);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excel 파일 읽기 실패');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateExcelFromRFP = useCallback(async (
    rfp: RFP,
    masterData: MasterData,
    mappedData: any
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // RFP에서 템플릿 생성
      const template = excelService.createTemplateFromRFP(rfp);
      
      // Excel 파일 생성
      const buffer = excelService.generateExcelFromTemplate(template, masterData, mappedData);
      
      // 파일명 생성
      const filename = `${rfp.requirements.기본정보.기관명}_${rfp.requirements.기본정보.프로그램명}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // 다운로드
      excelService.downloadExcel(buffer, filename);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excel 생성 실패');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const previewExcelData = useCallback(async (
    template: ExcelTemplate,
    masterData: MasterData,
    _mappedData: any
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Excel 데이터를 JSON 형태로 미리보기 생성
      const previewData: any = {};
      
      template.sheets.forEach(sheetConfig => {
        const headers = sheetConfig.columns.map(col => col.header);
        const rows: any[][] = [];
        
        // 샘플 데이터 생성 (실제로는 generateRowData와 유사한 로직)
        switch (sheetConfig.name) {
          case '회사개요':
            rows.push([
              masterData.회사정보.회사명,
              masterData.회사정보.설립일.toLocaleDateString(),
              masterData.회사정보.대표자,
              masterData.회사정보.AUM.toLocaleString() + '원',
              masterData.회사정보.주소
            ]);
            break;
          case '펀드실적':
            masterData.펀드실적.forEach(fund => {
              rows.push([
                fund.펀드명,
                fund.결성일.toLocaleDateString(),
                fund.결성액.toLocaleString() + '원',
                fund.상태,
                fund.수익률 + '%'
              ]);
            });
            break;
          case '핵심인력':
            masterData.핵심인력.forEach(person => {
              rows.push([
                person.이름,
                person.직책,
                person.경력년수 + '년',
                person.학력,
                person.주요경험.join(', ')
              ]);
            });
            break;
        }
        
        previewData[sheetConfig.name] = {
          headers,
          rows
        };
      });
      
      return previewData;
    } catch (err) {
      setError(err instanceof Error ? err.message : '미리보기 생성 실패');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateExcel,
    createTemplate,
    readExcelFile,
    generateExcelFromRFP,
    previewExcelData,
    clearError: () => setError(null)
  };
};