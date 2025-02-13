import React from 'react';
import { Smile, Frown, Meh, Heart, PartyPopper, Angry, HelpCircle, Laugh, Coffee, Moon } from 'lucide-react';

class AdvancedEmotionDetector {
    constructor() {
        this.emotions = {
            excited: {
                words: ['amazing', 'awesome', 'fantastic', 'incredible', 'wonderful', 'extraordinary', '🎉', '🤩', '⭐'],
                intensifiers: ['very', 'super', 'extremely', 'absolutely'],
                icon: PartyPopper,
                color: 'text-yellow-500'
            },
            happy: {
                words: ['happy', 'glad', 'good', 'nice', 'pleased', 'joy', ':)', ':-)', '🙂', '😊'],
                intensifiers: ['really', 'quite', 'pretty'],
                icon: Smile,
                color: 'text-green-500'
            },
            love: {
                words: ['love', 'adore', 'xoxo', '<3', '❤️', '💕', '😍', '🥰', 'cherish', 'treasure'],
                intensifiers: ['deeply', 'truly', 'absolutely'],
                icon: Heart,
                color: 'text-pink-500'
            },
            angry: {
                words: ['angry', 'mad', 'furious', 'annoyed', 'irritated', '😠', '😡', 'ugh', 'aargh'],
                intensifiers: ['really', 'very', 'so'],
                icon: Angry,
                color: 'text-red-500'
            },
            sad: {
                words: ['sad', 'unhappy', 'disappointed', 'sorry', 'regret', ':(', ':-(', '😢', '😭'],
                intensifiers: ['very', 'deeply', 'terribly'],
                icon: Frown,
                color: 'text-blue-500'
            },
            confused: {
                words: ['confused', 'unsure', 'perhaps', 'maybe', 'hmm', '🤔', 'wondering'],
                intensifiers: ['quite', 'rather', 'somewhat'],
                icon: HelpCircle,
                color: 'text-purple-500'
            },
            laughing: {
                words: ['haha', 'lol', 'rofl', 'lmao', '😂', '🤣', 'hilarious', 'funny'],
                intensifiers: ['really', 'so', 'very'],
                icon: Laugh,
                color: 'text-amber-500'
            },
            tired: {
                words: ['tired', 'sleepy', 'exhausted', 'zzz', '😴', 'yawn', 'drowsy'],
                intensifiers: ['so', 'very', 'extremely'],
                icon: Moon,
                color: 'text-indigo-500'
            }
        };

        // Contextual phrases for better emotion detection
        this.contextualPhrases = {
            positive: [
                'looking forward to',
                'cant wait',
                'thank you',
                'thanks',
                'appreciate',
                'well done',
                'great job'
            ],
            negative: [
                'not good',
                'too bad',
                'unfortunately',
                'sadly',
                'disappointed with',
                'waste of',
                'horrible'
            ]
        };
    }

    detectEmotionScore(text) {
        if (!text) return { emotion: 'neutral', intensity: 0 };

        const lowerText = text.toLowerCase();
        let highestScore = 0;
        let dominantEmotion = 'neutral';
        let intensity = 0;

        // Check each emotion
        for (const [emotion, data] of Object.entries(this.emotions)) {
            let score = 0;

            // Check for emotion words
            data.words.forEach(word => {
                const regex = new RegExp(word, 'gi');
                const matches = lowerText.match(regex);
                if (matches) {
                    score += matches.length * 2;
                }
            });

            // Check for intensifiers
            data.intensifiers.forEach(intensifier => {
                const regex = new RegExp(`${intensifier}\\s+(?:${data.words.join('|')})`, 'gi');
                const matches = lowerText.match(regex);
                if (matches) {
                    score += matches.length;
                    intensity += 0.5;
                }
            });

            // Add contextual analysis
            this.contextualPhrases.positive.forEach(phrase => {
                if (lowerText.includes(phrase)) {
                    if (['happy', 'excited', 'love'].includes(emotion)) {
                        score += 1;
                    }
                }
            });

            this.contextualPhrases.negative.forEach(phrase => {
                if (lowerText.includes(phrase)) {
                    if (['sad', 'angry'].includes(emotion)) {
                        score += 1;
                    }
                }
            });

            // Check for exclamation marks and caps
            const exclamationCount = (text.match(/!/g) || []).length;
            const capsPercentage = (text.match(/[A-Z]/g) || []).length / text.length;

            if (exclamationCount > 0) {
                score += exclamationCount * 0.5;
                intensity += 0.2 * exclamationCount;
            }

            if (capsPercentage > 0.5) {
                score += 2;
                intensity += 0.3;
            }

            // Update dominant emotion if this score is higher
            if (score > highestScore) {
                highestScore = score;
                dominantEmotion = emotion;
            }
        }

        // Normalize intensity to a 0-1 scale
        intensity = Math.min(Math.max(intensity, 0), 1);

        return {
            emotion: highestScore > 0 ? dominantEmotion : 'neutral',
            intensity: intensity
        };
    }

    getEmotionData(emotionResult) {
        const emotion = this.emotions[emotionResult.emotion] || {
            icon: Meh,
            color: 'text-gray-500'
        };

        // Add intensity-based styling
        const intensityClasses = emotionResult.intensity > 0.7 ? 'animate-bounce' :
            emotionResult.intensity > 0.3 ? 'animate-pulse' : '';

        return {
            ...emotion,
            intensityClasses
        };
    }
}

const TypingIndicator = ({ username, emotionResult }) => {
    const detector = new AdvancedEmotionDetector();
    const emotionData = detector.getEmotionData(emotionResult);
    const Icon = emotionData.icon;

    return (
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm text-gray-600">{username} is typing</span>
                {emotionResult.emotion !== 'neutral' && (
                    <Icon className={`w-4 h-4 ${emotionData.color} ${emotionData.intensityClasses}`} />
                )}
            </div>
        </div>
    );
};

const detectEmotion = (text) => {
    const detector = new AdvancedEmotionDetector();
    return detector.detectEmotionScore(text);
};

export { detectEmotion, TypingIndicator };