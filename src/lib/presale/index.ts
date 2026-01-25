/**
 * Presale Index
 * 
 * Exports all presale functionality
 */

export {
    getEventPresales,
    validatePresaleCode,
    validatePresaleBIN,
    validatePresaleEmailDomain,
    validatePresaleNFT,
    recordPresaleUsage,
    type PresaleRuleType,
    type PresaleRule,
    type Presale,
    type PresaleValidationResult,
} from './engine';
