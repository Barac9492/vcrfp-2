import type { DataMappingRule, MasterData } from '../types/rfp';

export class MappingService {
  private readonly MAPPING_STORAGE_KEY = 'rfp-mappings';
  
  getMappingRules(rfpId: string): DataMappingRule | null {
    const mappings = this.getAllMappings();
    return mappings.find(mapping => mapping.rfpId === rfpId) || null;
  }
  
  saveMappingRules(mappingRule: DataMappingRule): void {
    const mappings = this.getAllMappings();
    const existingIndex = mappings.findIndex(m => m.rfpId === mappingRule.rfpId);
    
    if (existingIndex >= 0) {
      mappings[existingIndex] = mappingRule;
    } else {
      mappings.push(mappingRule);
    }
    
    localStorage.setItem(this.MAPPING_STORAGE_KEY, JSON.stringify(mappings));
  }
  
  private getAllMappings(): DataMappingRule[] {
    const data = localStorage.getItem(this.MAPPING_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  applyMapping(masterData: MasterData, mappingRule: DataMappingRule): any {
    const result: any = {};
    
    // 기본 매핑 적용
    mappingRule.mappings.forEach(mapping => {
      const sourceValue = this.getNestedValue(masterData, mapping.sourceField);
      let targetValue = sourceValue;
      
      // 변환 함수가 있으면 적용
      if (mapping.transformation) {
        targetValue = mapping.transformation(sourceValue);
      }
      
      // 조건이 있으면 체크
      if (mapping.condition) {
        const conditionMet = this.evaluateCondition(mapping.condition, masterData);
        if (!conditionMet) {
          return;
        }
      }
      
      this.setNestedValue(result, mapping.targetField, targetValue);
    });
    
    // 커스텀 필드 초기값 설정
    mappingRule.customFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        result[field.fieldName] = field.defaultValue;
      }
    });
    
    return result;
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    let current = obj;
    keys.forEach(key => {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    });
    
    current[lastKey] = value;
  }
  
  private evaluateCondition(condition: string, data: MasterData): boolean {
    // 간단한 조건 평가 (실제로는 더 복잡한 표현식 파서가 필요)
    try {
      // 예: "회사정보.AUM > 100000000"
      const conditionWithData = condition.replace(/(\w+\.\w+)/g, (match) => {
        const value = this.getNestedValue(data, match);
        return typeof value === 'string' ? `"${value}"` : String(value);
      });
      
      return eval(conditionWithData);
    } catch (error) {
      console.warn('Failed to evaluate condition:', condition, error);
      return true;
    }
  }
  
  validateMapping(mappingRule: DataMappingRule, masterData: MasterData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 필수 커스텀 필드 검증
    mappingRule.customFields.forEach(field => {
      if (field.required && !this.getNestedValue(masterData, field.fieldName)) {
        errors.push(`필수 필드 '${field.fieldName}'이 비어있습니다.`);
      }
      
      // 타입 검증
      const value = this.getNestedValue(masterData, field.fieldName);
      if (value !== undefined && !this.validateFieldType(value, field.fieldType)) {
        errors.push(`필드 '${field.fieldName}'의 타입이 올바르지 않습니다. 예상: ${field.fieldType}`);
      }
      
      // 사용자 정의 검증
      if (field.validation && value !== undefined) {
        const validationResult = this.validateCustomRule(value, field.validation);
        if (!validationResult.valid) {
          errors.push(`필드 '${field.fieldName}': ${validationResult.message}`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private validateFieldType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'text':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'select':
        return typeof value === 'string';
      default:
        return true;
    }
  }
  
  private validateCustomRule(value: any, rule: string): { valid: boolean; message: string } {
    try {
      // 간단한 규칙 예시
      if (rule.startsWith('min:')) {
        const min = parseInt(rule.split(':')[1]);
        const isValid = typeof value === 'number' ? value >= min : value.length >= min;
        return {
          valid: isValid,
          message: isValid ? '' : `최소값은 ${min}입니다.`
        };
      }
      
      if (rule.startsWith('max:')) {
        const max = parseInt(rule.split(':')[1]);
        const isValid = typeof value === 'number' ? value <= max : value.length <= max;
        return {
          valid: isValid,
          message: isValid ? '' : `최대값은 ${max}입니다.`
        };
      }
      
      if (rule.startsWith('regex:')) {
        const pattern = new RegExp(rule.split(':')[1]);
        const isValid = pattern.test(String(value));
        return {
          valid: isValid,
          message: isValid ? '' : '형식이 올바르지 않습니다.'
        };
      }
      
      return { valid: true, message: '' };
    } catch (error) {
      return { valid: false, message: '검증 규칙 오류' };
    }
  }
  
  generateMappingFromTemplate(rfpId: string, templateRfpId: string): DataMappingRule {
    const templateMapping = this.getMappingRules(templateRfpId);
    
    if (!templateMapping) {
      throw new Error(`Template RFP ${templateRfpId} not found`);
    }
    
    // 템플릿을 복사하고 새 RFP ID로 설정
    const newMapping: DataMappingRule = {
      rfpId: rfpId,
      mappings: [...templateMapping.mappings],
      customFields: [...templateMapping.customFields]
    };
    
    return newMapping;
  }
  
  suggestMappings(masterData: MasterData, targetFields: string[]): DataMappingRule {
    const suggestions: DataMappingRule = {
      rfpId: '',
      mappings: [],
      customFields: []
    };
    
    // 자동 매핑 제안 로직
    targetFields.forEach(targetField => {
      const bestMatch = this.findBestFieldMatch(targetField, masterData);
      if (bestMatch) {
        suggestions.mappings.push({
          sourceField: bestMatch,
          targetField: targetField
        });
      }
    });
    
    return suggestions;
  }
  
  private findBestFieldMatch(targetField: string, masterData: MasterData): string | null {
    const fieldNames = this.getAllFieldPaths(masterData);
    
    // 정확한 일치 찾기
    const exactMatch = fieldNames.find(field => 
      field.toLowerCase().includes(targetField.toLowerCase()) ||
      targetField.toLowerCase().includes(field.toLowerCase())
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // 유사한 필드명 찾기 (간단한 문자열 유사도)
    let bestMatch = null;
    let bestScore = 0;
    
    fieldNames.forEach(field => {
      const score = this.calculateStringSimilarity(targetField.toLowerCase(), field.toLowerCase());
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestMatch = field;
      }
    });
    
    return bestMatch;
  }
  
  private getAllFieldPaths(obj: any, prefix = ''): string[] {
    const paths: string[] = [];
    
    Object.keys(obj).forEach(key => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths.push(...this.getAllFieldPaths(obj[key], currentPath));
      } else {
        paths.push(currentPath);
      }
    });
    
    return paths;
  }
  
  private calculateStringSimilarity(str1: string, str2: string): number {
    // 간단한 Levenshtein distance 기반 유사도
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }
}