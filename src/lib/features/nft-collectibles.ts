/**
 * NFT Collectibles System
 * 
 * Issues commemorative NFTs to ticket holders as digital collectibles.
 * Can be used for:
 * - Proof of attendance
 * - Exclusive presale access
 * - Loyalty rewards
 * - Resale royalties
 */

import { createClient } from '@/lib/supabase/server';

export interface NFTCollection {
    id: string;
    eventId: string;
    name: string;
    description: string;
    imageUrl: string;
    totalSupply: number;
    mintedCount: number;
    contractAddress?: string;
    chainId: number; // 137 = Polygon, 8453 = Base
    isTransferable: boolean;
    royaltyPercent: number;
    artistAddress?: string;
    metadata: Record<string, any>;
    createdAt: Date;
}

export interface NFTCollectible {
    id: string;
    collectionId: string;
    ticketId: string;
    ownerId: string;
    ownerWallet?: string;
    tokenId?: number;
    mintedAt?: Date;
    transactionHash?: string;
    metadata: {
        name: string;
        description: string;
        image: string;
        attributes: { trait_type: string; value: string }[];
    };
    status: 'PENDING' | 'MINTED' | 'CLAIMED' | 'TRANSFERRED';
    createdAt: Date;
}

export interface CreateCollectionRequest {
    eventId: string;
    name: string;
    description: string;
    imageUrl: string;
    totalSupply: number;
    chainId?: number;
    isTransferable?: boolean;
    royaltyPercent?: number;
    artistAddress?: string;
}

/**
 * Create NFT collection for an event
 */
export async function createNFTCollection(
    request: CreateCollectionRequest,
    creatorId: string
): Promise<{ success: boolean; collection?: NFTCollection; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: collection, error } = await supabase
            .from('nft_collections')
            .insert({
                event_id: request.eventId,
                name: request.name,
                description: request.description,
                image_url: request.imageUrl,
                total_supply: request.totalSupply,
                minted_count: 0,
                chain_id: request.chainId || 137, // Default to Polygon
                is_transferable: request.isTransferable ?? true,
                royalty_percent: request.royaltyPercent || 5,
                artist_address: request.artistAddress,
                created_by_id: creatorId,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: 'Error al crear colección' };
        }

        console.log(`[NFT] Created collection ${collection.id} for event ${request.eventId}`);

        return {
            success: true,
            collection: {
                id: collection.id,
                eventId: collection.event_id,
                name: collection.name,
                description: collection.description,
                imageUrl: collection.image_url,
                totalSupply: collection.total_supply,
                mintedCount: collection.minted_count,
                contractAddress: collection.contract_address,
                chainId: collection.chain_id,
                isTransferable: collection.is_transferable,
                royaltyPercent: collection.royalty_percent,
                artistAddress: collection.artist_address,
                metadata: collection.metadata || {},
                createdAt: new Date(collection.created_at),
            },
        };
    } catch (error) {
        console.error('[NFT] Create collection failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Generate NFT for a ticket holder
 * Called after ticket is used (validated at entry)
 */
export async function generateNFTForTicket(
    ticketId: string,
    collectionId: string,
    ownerId: string
): Promise<{ success: boolean; nft?: NFTCollectible; error?: string }> {
    try {
        const supabase = await createClient();

        // Get collection
        const { data: collection } = await supabase
            .from('nft_collections')
            .select('*')
            .eq('id', collectionId)
            .single();

        if (!collection) {
            return { success: false, error: 'Colección no encontrada' };
        }

        // Check supply
        if (collection.minted_count >= collection.total_supply) {
            return { success: false, error: 'Colección agotada' };
        }

        // Get ticket and event info for metadata
        const { data: ticket } = await supabase
            .from('tickets')
            .select(`
        *,
        ticket_type:ticket_types(
          name,
          event:events(name, date, venue:venues(name, city))
        )
      `)
            .eq('id', ticketId)
            .single();

        const event = ticket?.ticket_type?.event;
        const venue = event?.venue;

        // Create NFT metadata
        const tokenNumber = collection.minted_count + 1;
        const metadata = {
            name: `${collection.name} #${tokenNumber}`,
            description: collection.description,
            image: collection.image_url,
            attributes: [
                { trait_type: 'Event', value: event?.name || 'Unknown' },
                { trait_type: 'Date', value: event?.date || 'Unknown' },
                { trait_type: 'Venue', value: venue?.name || 'Unknown' },
                { trait_type: 'City', value: venue?.city || 'Unknown' },
                { trait_type: 'Ticket Type', value: ticket?.ticket_type?.name || 'General' },
                { trait_type: 'Edition', value: `${tokenNumber} of ${collection.total_supply}` },
            ],
        };

        // Create NFT record
        const { data: nft, error } = await supabase
            .from('nft_collectibles')
            .insert({
                collection_id: collectionId,
                ticket_id: ticketId,
                owner_id: ownerId,
                metadata,
                status: 'PENDING',
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: 'Error al generar NFT' };
        }

        // Increment minted count
        await supabase
            .from('nft_collections')
            .update({ minted_count: tokenNumber })
            .eq('id', collectionId);

        console.log(`[NFT] Generated collectible ${nft.id} for ticket ${ticketId}`);

        return {
            success: true,
            nft: {
                id: nft.id,
                collectionId: nft.collection_id,
                ticketId: nft.ticket_id,
                ownerId: nft.owner_id,
                ownerWallet: nft.owner_wallet,
                tokenId: nft.token_id,
                mintedAt: nft.minted_at ? new Date(nft.minted_at) : undefined,
                transactionHash: nft.transaction_hash,
                metadata: nft.metadata,
                status: nft.status,
                createdAt: new Date(nft.created_at),
            },
        };
    } catch (error) {
        console.error('[NFT] Generate failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Claim NFT to wallet
 * Called when user connects wallet to claim their NFT
 */
export async function claimNFTToWallet(
    nftId: string,
    walletAddress: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
        const supabase = await createClient();

        // Get NFT and collection
        const { data: nft } = await supabase
            .from('nft_collectibles')
            .select(`
        *,
        collection:nft_collections(*)
      `)
            .eq('id', nftId)
            .single();

        if (!nft) {
            return { success: false, error: 'NFT no encontrado' };
        }

        if (nft.status !== 'PENDING') {
            return { success: false, error: 'NFT ya fue reclamado' };
        }

        // TODO: Integrate with smart contract to mint
        // For now, simulate minting
        const mockTokenId = Date.now();
        const mockTxHash = `0x${crypto.randomUUID().replace(/-/g, '')}`;

        // Update NFT record
        await supabase
            .from('nft_collectibles')
            .update({
                owner_wallet: walletAddress,
                token_id: mockTokenId,
                transaction_hash: mockTxHash,
                minted_at: new Date().toISOString(),
                status: 'MINTED',
            })
            .eq('id', nftId);

        console.log(`[NFT] Claimed ${nftId} to wallet ${walletAddress}`);

        return {
            success: true,
            transactionHash: mockTxHash,
        };
    } catch (error) {
        console.error('[NFT] Claim failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Get user's NFT collectibles
 */
export async function getUserNFTs(userId: string): Promise<NFTCollectible[]> {
    try {
        const supabase = await createClient();

        const { data: nfts, error } = await supabase
            .from('nft_collectibles')
            .select(`
        *,
        collection:nft_collections(name, image_url, event:events(name))
      `)
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error || !nfts) {
            return [];
        }

        return nfts.map(n => ({
            id: n.id,
            collectionId: n.collection_id,
            ticketId: n.ticket_id,
            ownerId: n.owner_id,
            ownerWallet: n.owner_wallet,
            tokenId: n.token_id,
            mintedAt: n.minted_at ? new Date(n.minted_at) : undefined,
            transactionHash: n.transaction_hash,
            metadata: n.metadata,
            status: n.status,
            createdAt: new Date(n.created_at),
        }));
    } catch (error) {
        console.error('[NFT] Get user NFTs failed:', error);
        return [];
    }
}
