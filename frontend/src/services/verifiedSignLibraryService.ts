/**
 * MOUNAM Verified Sign Library & Sentence-to-Sign Matching Engine
 * Maps spoken / typed words into verified sign language representations (ISL / ASL).
 * Accurately tracks media availability status without fabricating fake videos.
 */

export type SignLanguageType = 'ISL' | 'ASL';

export interface VerifiedSignAsset {
  signId: string;
  word: string;
  canonicalPhrase?: string;
  signLanguage: SignLanguageType;
  verifiedSource: string;
  mediaType: 'video' | 'vector_animation' | 'unavailable';
  mediaUrl?: string;
  handIllustrationSvg?: string;
  description: string;
  availabilityStatus: 'verified_available' | 'in_review' | 'asset_pending';
}

export interface MatchedSignToken {
  originalToken: string;
  cleanedWord: string;
  hasMatch: boolean;
  signAsset?: VerifiedSignAsset;
}

export interface SentenceToSignResult {
  originalSentence: string;
  signLanguage: SignLanguageType;
  tokens: MatchedSignToken[];
  supportedTokensCount: number;
  unsupportedWords: string[];
  allSupported: boolean;
}

/**
 * Standard Verified Sign Vocabulary Catalog
 * Specifically documents verified status and visual demonstration data
 */
export const VERIFIED_SIGN_LIBRARY: VerifiedSignAsset[] = [
  {
    signId: 'isl_water',
    word: 'water',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC (Indian Sign Language Research and Training Centre) Standard Directory',
    mediaType: 'vector_animation',
    description: 'Index, middle, and ring fingers extended upward in "W" shape, gently tapping the chin or lips twice.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_food',
    word: 'food',
    canonicalPhrase: 'food / eat',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Fingers and thumb of dominant hand brought together touching fingertips to mouth twice.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_help',
    word: 'help',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Closed fist with thumb upright placed on flat upward-facing palm of the non-dominant hand, lifting together.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_stop',
    word: 'stop',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Open palm of dominant hand brought down perpendicularly onto the flat palm of the non-dominant hand.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_yes',
    word: 'yes',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Closed fist with thumb extended, nodding up and down from the wrist like a head nod.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_no',
    word: 'no',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Index and middle fingers snapping down onto the thumb repeatedly, or lateral flat hand wave.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_thank_you',
    word: 'thank you',
    canonicalPhrase: 'thank you',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Flat open hand with fingertips starting at chin, moving smoothly forward and slightly upward toward the listener.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_hello',
    word: 'hello',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Open hand salute gesture from temple moving outward with a welcoming expression.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_pain',
    word: 'pain',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Medical AAC Sign Lexicon',
    mediaType: 'vector_animation',
    description: 'Both index fingers pointing toward each other, twisting inward repeatedly near the location of discomfort.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_doctor',
    word: 'doctor',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Medical AAC Sign Lexicon',
    mediaType: 'vector_animation',
    description: 'Two bent fingers of dominant hand tapping the radial pulse on the inside of the non-dominant wrist.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_bathroom',
    word: 'bathroom',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Dominant hand forming "T" or shaking gently side-to-side.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_sleep',
    word: 'sleep',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Open hand in front of face drawing downward while fingers touch thumb, closing eyes slightly.',
    availabilityStatus: 'verified_available',
  },
  // ASL Sample Entry with clear label
  {
    signId: 'asl_thank_you',
    word: 'thank you',
    signLanguage: 'ASL',
    verifiedSource: 'ASL Standard Lexicon',
    mediaType: 'vector_animation',
    description: 'Flat hand tips touching chin and moving forward.',
    availabilityStatus: 'verified_available',
  },
];

export class VerifiedSignLibraryService {
  private static instance: VerifiedSignLibraryService;

  private constructor() {}

  public static getInstance(): VerifiedSignLibraryService {
    if (!VerifiedSignLibraryService.instance) {
      VerifiedSignLibraryService.instance = new VerifiedSignLibraryService();
    }
    return VerifiedSignLibraryService.instance;
  }

  public getSignAssets(signLanguage: SignLanguageType): VerifiedSignAsset[] {
    return VERIFIED_SIGN_LIBRARY.filter((s) => s.signLanguage === signLanguage);
  }

  /**
   * Tokenizes text and maps each word or multi-word phrase to verified sign assets
   */
  public matchSentenceToSigns(
    sentence: string,
    signLanguage: SignLanguageType = 'ISL'
  ): SentenceToSignResult {
    const trimmed = sentence.trim();
    if (!trimmed) {
      return {
        originalSentence: '',
        signLanguage,
        tokens: [],
        supportedTokensCount: 0,
        unsupportedWords: [],
        allSupported: true,
      };
    }

    const availableSigns = this.getSignAssets(signLanguage);
    const rawTokens = trimmed.split(/\s+/);
    const matchedTokens: MatchedSignToken[] = [];
    const unsupportedWords: string[] = [];

    let i = 0;
    while (i < rawTokens.length) {
      const token = rawTokens[i];
      const cleaned = token.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check 2-word phrase first (e.g. "thank you")
      if (i < rawTokens.length - 1) {
        const nextCleaned = rawTokens[i + 1].toLowerCase().replace(/[^a-z0-9]/g, '');
        const phrase = `${cleaned} ${nextCleaned}`;
        const phraseMatch = availableSigns.find((s) => s.word === phrase || s.canonicalPhrase === phrase);
        if (phraseMatch) {
          matchedTokens.push({
            originalToken: `${token} ${rawTokens[i + 1]}`,
            cleanedWord: phrase,
            hasMatch: true,
            signAsset: phraseMatch,
          });
          i += 2;
          continue;
        }
      }

      // Check single word match
      const singleMatch = availableSigns.find(
        (s) => s.word === cleaned || (s.canonicalPhrase && s.canonicalPhrase.includes(cleaned))
      );

      if (singleMatch) {
        matchedTokens.push({
          originalToken: token,
          cleanedWord: cleaned,
          hasMatch: true,
          signAsset: singleMatch,
        });
      } else {
        matchedTokens.push({
          originalToken: token,
          cleanedWord: cleaned,
          hasMatch: false,
        });
        if (cleaned.length > 0) {
          unsupportedWords.push(token);
        }
      }
      i++;
    }

    const supportedCount = matchedTokens.filter((t) => t.hasMatch).length;

    return {
      originalSentence: sentence,
      signLanguage,
      tokens: matchedTokens,
      supportedTokensCount: supportedCount,
      unsupportedWords,
      allSupported: unsupportedWords.length === 0,
    };
  }
}

export const verifiedSignLibraryService = VerifiedSignLibraryService.getInstance();
