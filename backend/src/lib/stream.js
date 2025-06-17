import {StreamChat} from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    throw new Error('Stream API key or Secret is missing');
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error('Error creating Stream user:', error);
    }
};

//todo: Implement the function to generate a Stream token for a user
export const generateStreamToken = (userId) => {
    try {
        // Ensure the userId is string
        const userIdString = userId.toString();
        return streamClient.createToken(userIdString);

    } catch (error) {
        
        console.error('Error generating Stream token:', error);

    }
}