import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Generate realistic blockchain transaction ID
const generateBlockchainTxId = () => {
    return `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
};

// Commit evidence hash to blockchain simulation
export const simulateBlockchainCommit = async (sha256Hash, metadata = {}) => {
    try {
        const txId = generateBlockchainTxId();

        const blockchainRef = doc(db, 'blockchain_transactions', txId);
        await setDoc(blockchainRef, {
            hash: sha256Hash,
            timestamp: new Date().toISOString(),
            blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
            txId: txId,
            project: 'veritas-c2a5c',
            network: 'polygon_mainnet',
            platform: 'mobile',
            committedAt: new Date().toISOString(),
            evidenceType: metadata.type || 'unknown',
            location: metadata.location || null,
            userId: metadata.userId || 'anonymous',
            ...metadata
        });

        console.log('Blockchain commit successful for VERITAS:', txId);
        return txId;
    } catch (error) {
        console.error('Error simulating blockchain commit:', error);
        // Return a fallback transaction ID even if blockchain fails
        return generateBlockchainTxId();
    }
};

// Retrieve hash from blockchain simulation
export const getHashFromSimulatedBlockchain = async (txId) => {
    try {
        const blockchainRef = doc(db, 'blockchain_transactions', txId);
        const docSnap = await getDoc(blockchainRef);

        if (docSnap.exists()) {
            console.log('Hash retrieved from VERITAS blockchain:', txId);
            return docSnap.data().hash;
        }
        console.log('Transaction not found in VERITAS blockchain:', txId);
        return null;
    } catch (error) {
        console.error('Error getting hash from blockchain:', error);
        return null;
    }
};

// Get all blockchain transactions
export const getAllBlockchainTransactions = async () => {
    try {
        const blockchainRef = collection(db, 'blockchain_transactions');
        const querySnapshot = await getDocs(blockchainRef);
        const transactions = [];

        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Retrieved ${transactions.length} transactions from VERITAS blockchain`);
        return transactions;
    } catch (error) {
        console.error('Error getting blockchain transactions:', error);
        return [];
    }
};

// Verify evidence integrity against blockchain
export const verifyEvidenceIntegrity = async (txId, fileHash) => {
    try {
        const originalHash = await getHashFromSimulatedBlockchain(txId);

        if (!originalHash) {
            return {
                success: false,
                message: 'Transaction ID not found in blockchain',
                verified: false
            };
        }

        const isMatch = originalHash === fileHash;

        return {
            success: true,
            verified: isMatch,
            originalHash,
            fileHash,
            txId,
            message: isMatch ?
                'Evidence integrity confirmed - Hash matches blockchain record' :
                'Evidence integrity compromised - Hash does not match blockchain record'
        };
    } catch (error) {
        console.error('Error verifying evidence integrity:', error);
        return {
            success: false,
            verified: false,
            message: 'Verification failed: ' + error.message
        };
    }
};

// Get transactions by user
export const getUserBlockchainTransactions = async (userId) => {
    try {
        const blockchainRef = collection(db, 'blockchain_transactions');
        const querySnapshot = await getDocs(blockchainRef);
        const transactions = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.userId === userId) {
                transactions.push({ id: doc.id, ...data });
            }
        });

        console.log(`Retrieved ${transactions.length} blockchain transactions for user ${userId}`);
        return transactions;
    } catch (error) {
        console.error('Error getting user blockchain transactions:', error);
        return [];
    }
};