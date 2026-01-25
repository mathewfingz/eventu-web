/**
 * AI Module Index
 * 
 * Exports all AI functionality
 */

// Chatbot
export {
    processMessage,
    saveChatSession,
    type ChatIntent,
    type ChatMessage,
    type ChatAction,
    type ChatContext,
    type ChatResponse,
} from './chatbot';

// Demand Prediction
export {
    predictDemand,
    getDemandInsights,
    type DemandPrediction,
    type DemandFactor,
} from './demand-prediction';
