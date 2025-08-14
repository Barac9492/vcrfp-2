export interface RFPRequirements {
  기본정보: {
    기관명: string;
    프로그램명: string;
    공고일: Date;
    마감일: Date;
    공고문URL?: string;
  };
  
  펀드요구사항: {
    최소결성액: number;
    최대결성액?: number;
    출자비율: {
      GP최소: number;
      정부출자: number;
    };
    의무투자: {
      비율: number;
      대상: string;
      세부조건: string[];
    };
    존속기간: {
      기본: number;
      연장가능: boolean;
    };
  };
  
  평가기준: {
    항목: string;
    배점: number;
    세부기준: string;
  }[];
  
  제출서류: {
    문서명: string;
    양식파일?: string;
    필수여부: boolean;
    특별요구사항: string[];
  }[];
  
  특수조건: {
    핵심운용인력: {
      최소인원: number;
      대표PM경력: number;
      팀원경력: number;
    };
    제한사항: string[];
    우대사항: string[];
  };
}

export interface DataMappingRule {
  rfpId: string;
  mappings: {
    sourceField: string;
    targetField: string;
    transformation?: (value: any) => any;
    condition?: string;
  }[];
  
  customFields: {
    fieldName: string;
    fieldType: 'text' | 'number' | 'select' | 'date';
    required: boolean;
    validation?: string;
    defaultValue?: any;
  }[];
}

export interface ExcelTemplate {
  rfpId: string;
  sheets: {
    name: string;
    required: boolean;
    columns: {
      header: string;
      dataField: string;
      width: number;
      format?: 'number' | 'percent' | 'currency' | 'date';
      formula?: string;
      validation?: any;
    }[];
    specialRequirements?: {
      conditionalFormatting?: any[];
      customValidation?: string;
      protectedCells?: string[];
    };
  }[];
}

export interface RFPVersion {
  rfpId: string;
  version: number;
  createdAt: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }[];
  snapshot: any;
}

export interface ValidationResult {
  기본정보: ValidationItem[];
  특수요구사항: ValidationItem[];
  경고: ValidationItem[];
}

export interface ValidationItem {
  항목: string;
  결과: boolean;
  메시지: string;
  severity: 'error' | 'warning' | 'info';
}

export interface RFP {
  id: string;
  requirements: RFPRequirements;
  mappingRules: DataMappingRule;
  excelTemplate: ExcelTemplate;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface MasterData {
  회사정보: {
    회사명: string;
    설립일: Date;
    대표자: string;
    사업자등록번호: string;
    주소: string;
    연락처: string;
    AUM: number;
  };
  
  펀드실적: {
    펀드명: string;
    결성일: Date;
    결성액: number;
    상태: '운용중' | '청산' | '결성중';
    수익률: number;
  }[];
  
  핵심인력: {
    이름: string;
    직책: string;
    경력년수: number;
    학력: string;
    주요경험: string[];
  }[];
  
  투자실적: {
    포트폴리오명: string;
    투자일: Date;
    투자액: number;
    분야: string;
    현재상태: string;
  }[];
}