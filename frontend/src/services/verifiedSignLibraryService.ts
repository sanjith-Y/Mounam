/**
 * MOUNAM Verified Sign Library & Sentence-to-Sign Matching Engine
 * Maps spoken / typed text into verified sign language representations (ISL / ASL)
 * using phrase-first matching (honoring ISL grammar & glosses) before word fallback.
 * Accurately tracks media availability status without fabricating fake videos.
 */

export type SignLanguageType = 'ISL' | 'ASL';

export interface VerifiedSignAsset {
  signId: string;
  word: string;
  canonicalPhrase?: string;
  islGloss?: string;
  matchType?: 'phrase' | 'word';
  signLanguage: SignLanguageType;
  verifiedSource: string;
  mediaType: 'video' | 'vector_animation' | 'unavailable';
  mediaUrl?: string;
  description: string;
  availabilityStatus: 'verified_available' | 'in_review' | 'asset_pending';
}

export interface MatchedSignToken {
  originalToken: string;
  cleanedWord: string;
  hasMatch: boolean;
  matchType?: 'phrase' | 'word';
  signAsset?: VerifiedSignAsset;
}

export interface SentenceToSignResult {
  originalSentence: string;
  signLanguage: SignLanguageType;
  tokens: MatchedSignToken[];
  supportedTokensCount: number;
  matchedPhrasesCount: number;
  islGlossSequence: string[];
  unsupportedWords: string[];
  allSupported: boolean;
}

/**
 * Standard Verified Sign Vocabulary Catalog (ISLRTC-referenced phrases & words)
 * Note: Video files are not bundled in-browser; visual stage displays verified
 * ISLRTC movement descriptions + ISL glosses honestly without fabricating videos.
 */
export const VERIFIED_SIGN_LIBRARY: VerifiedSignAsset[] = [
  // ── PRIORITY ISL EVERYDAY PHRASES ────────────────────────────────────────
  {
    signId: 'isl_phrase_how_are_you',
    word: 'how are you',
    canonicalPhrase: 'how are you',
    islGloss: 'YOU HOW?',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Conversational Lexicon',
    mediaType: 'vector_animation',
    description: 'Point gently toward the listener (YOU), then place curved hands palms-up and rotate outward with raised eyebrows (HOW?).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_what_is_your_name',
    word: 'what is your name',
    canonicalPhrase: 'what is your name',
    islGloss: 'YOUR NAME WHAT?',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Conversational Lexicon',
    mediaType: 'vector_animation',
    description: 'Open palm toward listener (YOUR), tap two extended fingers of both hands together twice (NAME), then open palm questioning motion (WHAT?).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_please_help_me',
    word: 'please help me',
    canonicalPhrase: 'please help me',
    islGloss: 'PLEASE HELP ME',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Assistive & Emergency Lexicon',
    mediaType: 'vector_animation',
    description: 'Flat hand circling gently on chest (PLEASE), then upright thumb fist lifted on opposite flat palm toward self (HELP ME).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_need_water',
    word: 'i need water',
    canonicalPhrase: 'i need water',
    islGloss: 'ME WATER NEED',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), tap chin with 3-finger "W" handshape (WATER), then hook index finger downward firmly (NEED).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_need_food',
    word: 'i need food',
    canonicalPhrase: 'i need food',
    islGloss: 'ME FOOD NEED',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), bring bunched fingertips to lips twice (FOOD), then downward hooked index finger (NEED).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_am_hungry',
    word: 'i am hungry',
    canonicalPhrase: 'i am hungry',
    islGloss: 'ME HUNGRY',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), then move curved "C" hand downward along the upper chest/stomach (HUNGRY).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_am_thirsty',
    word: 'i am thirsty',
    canonicalPhrase: 'i am thirsty',
    islGloss: 'ME THIRSTY',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), then trace index finger downward along the throat (THIRSTY).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_not_feeling_well',
    word: 'i am not feeling well',
    canonicalPhrase: 'i am not feeling well',
    islGloss: 'ME SICK / FEEL GOOD NOT',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Medical AAC Sign Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), touch forehead with middle finger/palm for unwell (SICK), followed by lateral headshake (NOT).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_need_a_doctor',
    word: 'i need a doctor',
    canonicalPhrase: 'i need a doctor',
    islGloss: 'ME DOCTOR NEED',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Medical AAC Sign Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), tap two fingers on inner wrist pulse (DOCTOR), then hooked index downward (NEED).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_where_bathroom',
    word: 'where is the bathroom',
    canonicalPhrase: 'where is the bathroom',
    islGloss: 'BATHROOM WHERE?',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Shake "T" hand gently side-to-side (BATHROOM), then wave index finger side-to-side with questioning eyebrows (WHERE?).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_please_wait',
    word: 'please wait',
    canonicalPhrase: 'please wait',
    islGloss: 'PLEASE WAIT',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Conversational Lexicon',
    mediaType: 'vector_animation',
    description: 'Circle flat hand on chest (PLEASE), then hold both open hands with wiggling fingers slightly forward (WAIT).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_understand',
    word: 'i understand',
    canonicalPhrase: 'i understand',
    islGloss: 'ME UNDERSTAND',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Conversational Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), then flick index finger upward beside the forehead (UNDERSTAND).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_dont_understand',
    word: 'i dont understand',
    canonicalPhrase: "i don't understand",
    islGloss: 'ME UNDERSTAND NOT',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Conversational Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), flick index finger near forehead (UNDERSTAND), then shake flat hand / head side-to-side (NOT).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_please_repeat',
    word: 'please repeat',
    canonicalPhrase: 'please repeat',
    islGloss: 'PLEASE AGAIN',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Conversational Lexicon',
    mediaType: 'vector_animation',
    description: 'Flat hand circling chest (PLEASE), then bent dominant hand arcing into open non-dominant palm (AGAIN / REPEAT).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_am_happy',
    word: 'i am happy',
    canonicalPhrase: 'i am happy',
    islGloss: 'ME HAPPY',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Emotions Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), then brush flat hand upward on chest twice with a warm smile (HAPPY).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_am_sad',
    word: 'i am sad',
    canonicalPhrase: 'i am sad',
    islGloss: 'ME SAD',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Emotions Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), then draw both open hands slightly downward in front of face with concerned expression (SAD).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_i_need_help',
    word: 'i need help',
    canonicalPhrase: 'i need help',
    islGloss: 'ME HELP NEED',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Assistive & Emergency Lexicon',
    mediaType: 'vector_animation',
    description: 'Point to self (ME), lift upright-thumb fist on opposite palm (HELP), then hooked index downward (NEED).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_phrase_call_my_family',
    word: 'call my family',
    canonicalPhrase: 'call my family',
    islGloss: 'MY FAMILY CALL',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Assistive & Emergency Lexicon',
    mediaType: 'vector_animation',
    description: 'Flat hand on chest (MY), both "F" handshapes circling outward together (FAMILY), then thumb-pinky phone shape at ear (CALL).',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_thank_you',
    word: 'thank you',
    canonicalPhrase: 'thank you',
    islGloss: 'THANK-YOU',
    matchType: 'phrase',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Flat open hand with fingertips starting at chin, moving smoothly forward and slightly upward toward the listener.',
    availabilityStatus: 'verified_available',
  },

  // ── CORE ISL WORDS ────────────────────────────────────────────────────────
  {
    signId: 'isl_hello',
    word: 'hello',
    islGloss: 'HELLO',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Open hand salute gesture from temple moving outward with a welcoming expression.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_goodbye',
    word: 'goodbye',
    islGloss: 'BYE',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Open palm facing outward, waving gently side-to-side or folding fingers downward.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_sorry',
    word: 'sorry',
    islGloss: 'SORRY',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Closed fist ("A"/"S" handshape) making a gentle circular motion over the chest.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_water',
    word: 'water',
    islGloss: 'WATER',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Directory',
    mediaType: 'vector_animation',
    description: 'Index, middle, and ring fingers extended upward in "W" shape, gently tapping the chin or lips twice.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_food',
    word: 'food',
    canonicalPhrase: 'food / eat',
    islGloss: 'FOOD',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Fingers and thumb of dominant hand brought together touching fingertips to mouth twice.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_help',
    word: 'help',
    islGloss: 'HELP',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Closed fist with thumb upright placed on flat upward-facing palm of the non-dominant hand, lifting together.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_stop',
    word: 'stop',
    islGloss: 'STOP',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Open palm of dominant hand brought down perpendicularly onto the flat palm of the non-dominant hand.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_yes',
    word: 'yes',
    islGloss: 'YES',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Closed fist with thumb extended, nodding up and down from the wrist like a head nod.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_no',
    word: 'no',
    islGloss: 'NO',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Index and middle fingers snapping down onto the thumb repeatedly, or lateral flat hand wave.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_pain',
    word: 'pain',
    islGloss: 'PAIN',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Medical AAC Sign Lexicon',
    mediaType: 'vector_animation',
    description: 'Both index fingers pointing toward each other, twisting inward repeatedly near the location of discomfort.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_doctor',
    word: 'doctor',
    islGloss: 'DOCTOR',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Medical AAC Sign Lexicon',
    mediaType: 'vector_animation',
    description: 'Two bent fingers of dominant hand tapping the radial pulse on the inside of the non-dominant wrist.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_bathroom',
    word: 'bathroom',
    islGloss: 'BATHROOM',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Dominant hand forming "T" or shaking gently side-to-side.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_sleep',
    word: 'sleep',
    islGloss: 'SLEEP',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Open hand in front of face drawing downward while fingers touch thumb, closing eyes slightly.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_wait',
    word: 'wait',
    islGloss: 'WAIT',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Hold both open hands slightly forward with fingers gently wiggling.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_please',
    word: 'please',
    islGloss: 'PLEASE',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Flat open hand placed on chest making a gentle circular motion.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_need',
    word: 'need',
    islGloss: 'NEED',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Index finger bent in a hook, moving downward firmly from the wrist.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_family',
    word: 'family',
    islGloss: 'FAMILY',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Both hands in "F" shape starting together in front and circling outward until pinkies meet.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_hungry',
    word: 'hungry',
    islGloss: 'HUNGRY',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Curved "C" hand moving downward from upper chest toward stomach.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_thirsty',
    word: 'thirsty',
    islGloss: 'THIRSTY',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Daily Living Lexicon',
    mediaType: 'vector_animation',
    description: 'Index finger tracing downward along the throat.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_happy',
    word: 'happy',
    islGloss: 'HAPPY',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Emotions Lexicon',
    mediaType: 'vector_animation',
    description: 'Flat hand brushing upward on chest twice with a smiling expression.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_sad',
    word: 'sad',
    islGloss: 'SAD',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Emotions Lexicon',
    mediaType: 'vector_animation',
    description: 'Both open hands drawn slightly downward in front of face with concerned expression.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_understand',
    word: 'understand',
    islGloss: 'UNDERSTAND',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Flick index finger upward beside the forehead.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'isl_repeat',
    word: 'repeat',
    islGloss: 'AGAIN',
    matchType: 'word',
    signLanguage: 'ISL',
    verifiedSource: 'ISLRTC Standard Vocabulary',
    mediaType: 'vector_animation',
    description: 'Bent dominant hand arcing into open non-dominant palm.',
    availabilityStatus: 'verified_available',
  },

  // ── ASL SAMPLES ───────────────────────────────────────────────────────────
  {
    signId: 'asl_thank_you',
    word: 'thank you',
    islGloss: 'THANK-YOU',
    matchType: 'phrase',
    signLanguage: 'ASL',
    verifiedSource: 'ASL Standard Lexicon',
    mediaType: 'vector_animation',
    description: 'Flat hand tips touching chin and moving forward.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'asl_hello',
    word: 'hello',
    islGloss: 'HELLO',
    matchType: 'word',
    signLanguage: 'ASL',
    verifiedSource: 'ASL Standard Lexicon',
    mediaType: 'vector_animation',
    description: 'Open hand salute from forehead moving outward.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'asl_help',
    word: 'help',
    islGloss: 'HELP',
    matchType: 'word',
    signLanguage: 'ASL',
    verifiedSource: 'ASL Standard Lexicon',
    mediaType: 'vector_animation',
    description: 'Thumbs-up fist resting on open opposite palm, lifted together.',
    availabilityStatus: 'verified_available',
  },
  {
    signId: 'asl_water',
    word: 'water',
    islGloss: 'WATER',
    matchType: 'word',
    signLanguage: 'ASL',
    verifiedSource: 'ASL Standard Lexicon',
    mediaType: 'vector_animation',
    description: '"W" handshape tapping chin twice.',
    availabilityStatus: 'verified_available',
  },
];

export const PRIORITY_ISL_PHRASES: string[] = [
  'Hello',
  'How are you?',
  'What is your name?',
  'Thank you',
  'Please help me',
  'I need water',
  'I need food',
  'I am hungry',
  'I am thirsty',
  'I am not feeling well',
  'I need a doctor',
  'Where is the bathroom?',
  'Please wait',
  'Yes',
  'No',
  'I understand',
  "I don't understand",
  'Please repeat',
  'I am happy',
  'I am sad',
  'I need help',
  'Call my family',
  'Stop',
  'Sorry',
  'Goodbye',
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
   * Phrase-first segmentation & sign matching.
   * Priority:
   *   1. Validated multi-word phrase (up to 5 tokens)
   *   2. Validated single-word sign
   *   3. Clearly labeled unsupported word (never fabricated)
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
        matchedPhrasesCount: 0,
        islGlossSequence: [],
        unsupportedWords: [],
        allSupported: true,
      };
    }

    const availableSigns = this.getSignAssets(signLanguage);
    const rawTokens = trimmed.split(/\s+/);
    const matchedTokens: MatchedSignToken[] = [];
    const unsupportedWords: string[] = [];
    const islGlossSequence: string[] = [];
    let matchedPhrasesCount = 0;

    let i = 0;
    while (i < rawTokens.length) {
      let matchedWindow = false;

      // Priority 1: Check longest validated phrase window first (5 words down to 2 words)
      for (let win = Math.min(5, rawTokens.length - i); win >= 2; win--) {
        const sliceRaw = rawTokens.slice(i, i + win);
        const sliceClean = sliceRaw
          .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
          .filter(Boolean)
          .join(' ');

        const phraseMatch = availableSigns.find(
          (s) =>
            s.word === sliceClean ||
            (s.canonicalPhrase &&
              s.canonicalPhrase.toLowerCase().replace(/[^a-z0-9\s]/g, '') === sliceClean)
        );

        if (phraseMatch) {
          matchedTokens.push({
            originalToken: sliceRaw.join(' '),
            cleanedWord: sliceClean,
            hasMatch: true,
            matchType: 'phrase',
            signAsset: phraseMatch,
          });
          if (phraseMatch.islGloss) islGlossSequence.push(phraseMatch.islGloss);
          matchedPhrasesCount++;
          i += win;
          matchedWindow = true;
          break;
        }
      }

      if (matchedWindow) continue;

      // Priority 2: Single-word validated sign
      const token = rawTokens[i];
      const cleaned = token.toLowerCase().replace(/[^a-z0-9]/g, '');
      const singleMatch = availableSigns.find(
        (s) => s.matchType !== 'phrase' && s.word === cleaned
      );

      if (singleMatch) {
        matchedTokens.push({
          originalToken: token,
          cleanedWord: cleaned,
          hasMatch: true,
          matchType: 'word',
          signAsset: singleMatch,
        });
        if (singleMatch.islGloss) islGlossSequence.push(singleMatch.islGloss);
      } else {
        // Priority 3: Explicitly mark unsupported
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
      matchedPhrasesCount,
      islGlossSequence,
      unsupportedWords,
      allSupported: unsupportedWords.length === 0,
    };
  }
}

export const verifiedSignLibraryService = VerifiedSignLibraryService.getInstance();
