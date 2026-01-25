/**
 * Features Index
 * 
 * Exports all advanced features for easy importing
 */

// Deal Score
export {
    calculateDealScore,
    getDealScoreColor,
    formatDealScore,
    type DealScoreFactors,
    type DealScoreResult,
} from './deal-score';

// Split Payments
export {
    createSplitPayment,
    getSplitGroup,
    recordParticipantPayment,
    generateSplitShareLink,
    sendSplitInvitations,
    type SplitGroup,
    type SplitParticipant,
    type CreateSplitRequest,
    type SplitResult,
} from './split-payment';

// Super-App (In-Venue Services)
export {
    getVenueServices,
    createServiceOrder,
    getUserServiceOrders,
    updateServiceOrderStatus,
    type ServiceCategory,
    type VenueService,
    type ServiceOrder,
    type ServiceOrderItem,
    type CreateServiceOrderRequest,
} from './super-app';

// NFT Collectibles
export {
    createNFTCollection,
    generateNFTForTicket,
    claimNFTToWallet,
    getUserNFTs,
    type NFTCollection,
    type NFTCollectible,
    type CreateCollectionRequest,
} from './nft-collectibles';
