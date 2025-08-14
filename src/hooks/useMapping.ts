import { useState, useCallback } from 'react';
import type { DataMappingRule, MasterData } from '../types/rfp';
import { MappingService } from '../services/mappingService';

export const useMapping = () => {
  const [mappingRule, setMappingRule] = useState<DataMappingRule | null>(null);
  const [mappedData, setMappedData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mappingService = new MappingService();
  
  const loadMappingRule = useCallback(async (rfpId: string) => {
    setLoading(true);
    setError(null);
    try {
      const rule = mappingService.getMappingRules(rfpId);
      setMappingRule(rule);
      return rule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mapping rule');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const saveMappingRule = useCallback(async (rule: DataMappingRule) => {
    setLoading(true);
    setError(null);
    try {
      mappingService.saveMappingRules(rule);
      setMappingRule(rule);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mapping rule');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const applyMapping = useCallback(async (masterData: MasterData, rule?: DataMappingRule) => {
    setLoading(true);
    setError(null);
    try {
      const mappingRuleToUse = rule || mappingRule;
      if (!mappingRuleToUse) {
        throw new Error('No mapping rule available');
      }
      
      const result = mappingService.applyMapping(masterData, mappingRuleToUse);
      setMappedData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply mapping');
      return null;
    } finally {
      setLoading(false);
    }
  }, [mappingRule]);
  
  const validateMapping = useCallback(async (rule: DataMappingRule, masterData: MasterData) => {
    setLoading(true);
    setError(null);
    try {
      const validation = mappingService.validateMapping(rule, masterData);
      setValidationErrors(validation.errors);
      return validation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate mapping');
      return { valid: false, errors: ['Validation failed'] };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const generateFromTemplate = useCallback(async (rfpId: string, templateRfpId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newRule = mappingService.generateMappingFromTemplate(rfpId, templateRfpId);
      setMappingRule(newRule);
      return newRule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate from template');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const suggestMappings = useCallback(async (masterData: MasterData, targetFields: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const suggestions = mappingService.suggestMappings(masterData, targetFields);
      return suggestions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suggest mappings');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const addMappingRule = useCallback((sourceField: string, targetField: string, transformation?: (value: any) => any) => {
    if (!mappingRule) return;
    
    const newMapping = {
      sourceField,
      targetField,
      transformation
    };
    
    const updatedRule = {
      ...mappingRule,
      mappings: [...mappingRule.mappings, newMapping]
    };
    
    setMappingRule(updatedRule);
  }, [mappingRule]);
  
  const removeMappingRule = useCallback((index: number) => {
    if (!mappingRule) return;
    
    const updatedRule = {
      ...mappingRule,
      mappings: mappingRule.mappings.filter((_, i) => i !== index)
    };
    
    setMappingRule(updatedRule);
  }, [mappingRule]);
  
  const updateMappingRule = useCallback((index: number, updates: Partial<DataMappingRule['mappings'][0]>) => {
    if (!mappingRule) return;
    
    const updatedMappings = mappingRule.mappings.map((mapping, i) => 
      i === index ? { ...mapping, ...updates } : mapping
    );
    
    const updatedRule = {
      ...mappingRule,
      mappings: updatedMappings
    };
    
    setMappingRule(updatedRule);
  }, [mappingRule]);
  
  const addCustomField = useCallback((field: DataMappingRule['customFields'][0]) => {
    if (!mappingRule) return;
    
    const updatedRule = {
      ...mappingRule,
      customFields: [...mappingRule.customFields, field]
    };
    
    setMappingRule(updatedRule);
  }, [mappingRule]);
  
  const removeCustomField = useCallback((index: number) => {
    if (!mappingRule) return;
    
    const updatedRule = {
      ...mappingRule,
      customFields: mappingRule.customFields.filter((_, i) => i !== index)
    };
    
    setMappingRule(updatedRule);
  }, [mappingRule]);
  
  const updateCustomField = useCallback((index: number, updates: Partial<DataMappingRule['customFields'][0]>) => {
    if (!mappingRule) return;
    
    const updatedFields = mappingRule.customFields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    
    const updatedRule = {
      ...mappingRule,
      customFields: updatedFields
    };
    
    setMappingRule(updatedRule);
  }, [mappingRule]);
  
  return {
    mappingRule,
    mappedData,
    validationErrors,
    loading,
    error,
    loadMappingRule,
    saveMappingRule,
    applyMapping,
    validateMapping,
    generateFromTemplate,
    suggestMappings,
    addMappingRule,
    removeMappingRule,
    updateMappingRule,
    addCustomField,
    removeCustomField,
    updateCustomField,
    setMappingRule,
    clearError: () => setError(null)
  };
};