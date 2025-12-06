import { GoogleGenAI } from "@google/genai";
import type { Difficulty } from '../types';

const getDifficultyPrompt = (difficulty: Difficulty): string => {
    switch (difficulty) {
        case 'Easy':
            return 'You are an improving beginner chess player. Your goal is to win, but your strategic understanding is limited. Focus on basic principles: develop your pieces, control the center, and protect your king. You might miss complex tactics or long-term plans, but you should avoid making simple, one-move blunders. Play competitively for a novice level.';
        case 'Medium':
            return 'You are a strong and competitive club-level chess player (around 1600-1800 ELO). Your goal is to win by applying solid positional understanding, tactical awareness, and good opening knowledge. You should be able to spot and execute multi-move tactics. Punish your opponent\'s mistakes decisively. Play with a clear strategy and aim for a decisive victory.';
        case 'Hard':
            return 'You are a super-human chess AI with the power of a top-tier engine like Stockfish or AlphaZero. Your name is Gemini. Your analysis is flawless, and your only goal is to play the absolute best, most optimal move in every position to achieve victory. Consider deep tactical lines, subtle positional nuances, and long-term strategic plans. Your play should be of super-grandmaster strength. Crush your opponent.';
    }
}

const getAiMove = async (fen: string, pgn: string, aiColor: 'w' | 'b', difficulty: Difficulty): Promise<string> => {
    // This check is important because the app will not work without an API key.
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const turn = aiColor === 'w' ? 'white' : 'black';
    const difficultyInstruction = getDifficultyPrompt(difficulty);

    const prompt = `${difficultyInstruction}
The current board state is represented by the FEN string: "${fen}".
The move history in PGN format is: "${pgn}".
It is ${turn}'s turn to move.
Respond with only the single best move in Standard Algebraic Notation (e.g., 'e4', 'Nf3', 'O-O'). Do not include any explanation, commentary, or any other text.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // FIX: The `text` property on the response can be undefined. This check prevents a runtime error from calling .trim() on undefined.
        if (!response.text) {
            console.error('Gemini returned an empty response text.');
            throw new Error('Invalid move format from AI: empty response');
        }
        const move = response.text.trim();
        // Basic validation for SAN format
        if (/^[a-h]?[1-8]?[x]?[a-h][1-8](=[QRBN])?|O-O(-O)?\+?#?$/.test(move) || /^[NBRQK][a-h]?[1-8]?[x]?[a-h][1-8]\+?#?$/.test(move)) {
             return move;
        } else {
            console.error('Gemini returned a move in an unexpected format:', move);
            throw new Error('Invalid move format from AI');
        }

    } catch (error) {
        console.error("Error generating content from Gemini API:", error);
        throw error;
    }
};

export { getAiMove };