import { TarotCard } from '../components/fortune/CardItem';

interface CardMeaningEn {
  keywords: string[];
  meaning: string;
}

interface CardDataEn {
  upright: CardMeaningEn;
  reversed: CardMeaningEn;
}

/**
 * English keywords and meanings for all 78 tarot cards, indexed by card ID.
 * IDs match data/tarotCards.ts: 0-21 Major Arcana, 22-35 Cups,
 * 36-49 Pentacles, 50-63 Swords, 64-77 Wands.
 */
const tarotCardsEnData: Record<number, CardDataEn> = {
  // ── Major Arcana ─────────────────────────────────────────────────────────
  0: {
    upright:  { keywords: ['freedom', 'new beginning', 'spontaneity'], meaning: 'Often signals a fresh start, an adventurous leap, and an open curiosity toward the unknown.' },
    reversed: { keywords: ['recklessness', 'hesitation', 'aimlessness'], meaning: 'Points to acting without preparation, lingering indecision, or fear of risk that stalls forward movement.' },
  },
  1: {
    upright:  { keywords: ['action', 'willpower', 'manifestation'], meaning: 'Often connected to channeling resources, turning ideas into reality, and using your skills to reach a goal.' },
    reversed: { keywords: ['distraction', 'deception', 'poor planning'], meaning: 'Points to scattered focus, the use of manipulation, or obstacles in carrying a plan through to completion.' },
  },
  2: {
    upright:  { keywords: ['intuition', 'mystery', 'patience'], meaning: 'Often involves hidden information, listening to inner wisdom, and staying quietly observant before acting.' },
    reversed: { keywords: ['suppressed intuition', 'confusion', 'misjudgment'], meaning: 'Points to an inner voice being ignored, clouded information, or surface appearances distorting judgment.' },
  },
  3: {
    upright:  { keywords: ['abundance', 'creativity', 'nurturing'], meaning: 'Often connected to fertile energy, the natural flow of creative expression, and feeling warmly supported.' },
    reversed: { keywords: ['dependency', 'creative block', 'neglect'], meaning: 'Points to over-reliance on outside support, stifled creativity, or a lack of nourishing environment.' },
  },
  4: {
    upright:  { keywords: ['authority', 'structure', 'control'], meaning: 'Often involves building order, making rational decisions, and managing a situation through rules and planning.' },
    reversed: { keywords: ['rigidity', 'overcontrol', 'tyranny'], meaning: 'Points to excessive control, inflexible rules, or authority wielded in a way that becomes oppressive.' },
  },
  5: {
    upright:  { keywords: ['tradition', 'guidance', 'belief'], meaning: 'Often associated with established values, seeking counsel from experience, and finding meaning through shared beliefs.' },
    reversed: { keywords: ['dogma', 'rebellion', 'blind conformity'], meaning: 'Points to rigid doctrine, pushing back against convention, or following rules without questioning their purpose.' },
  },
  6: {
    upright:  { keywords: ['connection', 'choice', 'harmony'], meaning: 'Often signals a meaningful bond, a significant decision, or alignment between values and desire.' },
    reversed: { keywords: ['conflict', 'indecision', 'misalignment'], meaning: 'Points to inner or interpersonal friction, difficulty committing to a path, or values that feel out of sync.' },
  },
  7: {
    upright:  { keywords: ['determination', 'momentum', 'victory'], meaning: 'Often connected to focused willpower, overcoming obstacles through discipline, and moving steadily toward a goal.' },
    reversed: { keywords: ['lack of direction', 'aggression', 'loss of control'], meaning: 'Points to scattered energy, forceful behavior without strategy, or losing grip on a situation.' },
  },
  8: {
    upright:  { keywords: ['courage', 'patience', 'inner power'], meaning: 'Often involves facing challenges with calm resolve, taming impulses with compassion, and trusting your resilience.' },
    reversed: { keywords: ['self-doubt', 'repression', 'weakness'], meaning: 'Points to loss of confidence, suppressed emotions resurfacing, or a temporary drain on inner resources.' },
  },
  9: {
    upright:  { keywords: ['solitude', 'reflection', 'inner wisdom'], meaning: 'Often signals a time to withdraw, look inward, and find answers through quiet contemplation rather than external advice.' },
    reversed: { keywords: ['isolation', 'avoidance', 'overthinking'], meaning: 'Points to withdrawing too far from others, using solitude to evade rather than reflect, or rumination that leads nowhere.' },
  },
  10: {
    upright:  { keywords: ['change', 'cycles', 'opportunity'], meaning: 'Often signals a turning point where luck shifts, circumstances evolve, and new possibilities emerge from the natural rhythm of life.' },
    reversed: { keywords: ['resistance', 'bad luck', 'stagnation'], meaning: 'Points to fighting against inevitable change, a streak of unfavorable outcomes, or a cycle that feels stuck.' },
  },
  11: {
    upright:  { keywords: ['fairness', 'balance', 'accountability'], meaning: 'Often involves weighing actions against their consequences, seeking an equitable outcome, and being honest about one\'s part in a situation.' },
    reversed: { keywords: ['bias', 'avoidance', 'unequal outcome'], meaning: 'Points to unfair treatment, sidestepping responsibility, or a situation where the scales are clearly tipped in one direction.' },
  },
  12: {
    upright:  { keywords: ['pause', 'surrender', 'new perspective'], meaning: 'Often signals that stepping back, releasing the need to control, and looking at things differently is the most productive move available.' },
    reversed: { keywords: ['stagnation', 'martyrdom', 'resistance'], meaning: 'Points to feeling stuck without productive reflection, self-sacrifice that goes unappreciated, or resisting a necessary pause.' },
  },
  13: {
    upright:  { keywords: ['transition', 'ending', 'transformation'], meaning: 'Often signals that something is concluding to create space for what comes next — not destruction, but meaningful change.' },
    reversed: { keywords: ['resistance to change', 'stagnation', 'fear of loss'], meaning: 'Points to clinging to what no longer serves, delaying an inevitable ending, or dread blocking necessary transformation.' },
  },
  14: {
    upright:  { keywords: ['balance', 'moderation', 'patience'], meaning: 'Often involves blending opposites with care, taking a measured approach, and trusting that steady progress compounds over time.' },
    reversed: { keywords: ['excess', 'imbalance', 'impatience'], meaning: 'Points to going to extremes, elements of life pulling in opposite directions, or rushing a process that needs time.' },
  },
  15: {
    upright:  { keywords: ['bondage', 'materialism', 'temptation'], meaning: 'Often connected to feeling trapped by a habit, desire, or belief — and the realization that the chain can be loosened.' },
    reversed: { keywords: ['breaking free', 'self-awareness', 'detachment'], meaning: 'Points to recognizing a pattern that has held you captive and beginning to step away from its influence.' },
  },
  16: {
    upright:  { keywords: ['upheaval', 'sudden change', 'revelation'], meaning: 'Often signals an abrupt disruption that shatters what felt stable, forcing a confrontation with truths that were being avoided.' },
    reversed: { keywords: ['fear of change', 'delayed crisis', 'avoidance'], meaning: 'Points to resisting necessary upheaval, postponing an inevitable reckoning, or suppressing a disruptive truth.' },
  },
  17: {
    upright:  { keywords: ['hope', 'renewal', 'inspiration'], meaning: 'Often appears after difficulty, signaling that clarity, calm, and a sense of direction are returning.' },
    reversed: { keywords: ['despair', 'loss of faith', 'disillusionment'], meaning: 'Points to hope feeling out of reach, optimism colliding with a harsh reality, or inspiration that has dried up.' },
  },
  18: {
    upright:  { keywords: ['uncertainty', 'illusion', 'the unconscious'], meaning: 'Often signals a time of unclear signals, hidden fears surfacing, and navigating by feel rather than clear sight.' },
    reversed: { keywords: ['clarity returning', 'facing fears', 'illusion lifting'], meaning: 'Points to the fog beginning to clear, suppressed anxieties being confronted, or deception coming to light.' },
  },
  19: {
    upright:  { keywords: ['joy', 'vitality', 'success'], meaning: 'Often connected to a sense of openness, clear energy, and outcomes aligning with what was hoped for.' },
    reversed: { keywords: ['low energy', 'clouded optimism', 'temporary setback'], meaning: 'Points to enthusiasm dimmed by circumstance, confidence that needs rebuilding, or a delay before things brighten.' },
  },
  20: {
    upright:  { keywords: ['awakening', 'reflection', 'renewal'], meaning: 'Often signals a moment of reckoning — hearing a deeper call, honestly reviewing the past, and deciding how to move forward.' },
    reversed: { keywords: ['self-doubt', 'avoidance', 'ignoring the call'], meaning: 'Points to resisting honest self-review, being too harsh in judgment, or refusing to hear what needs attention.' },
  },
  21: {
    upright:  { keywords: ['completion', 'integration', 'fulfillment'], meaning: 'Often signals the successful close of a significant cycle — all pieces fitting together, and a sense of wholeness arrived at.' },
    reversed: { keywords: ['incompleteness', 'loose ends', 'unfulfillment'], meaning: 'Points to a cycle not yet fully closed, shortcuts that leave things unresolved, or fulfillment just out of reach.' },
  },

  // ── Cups ─────────────────────────────────────────────────────────────────
  22: {
    upright:  { keywords: ['new love', 'emotional opening', 'intuition'], meaning: 'Often signals the arrival of emotional potential — an opening heart, a meaningful connection, or a creative flow beginning.' },
    reversed: { keywords: ['emotional blockage', 'self-protection', 'missed connection'], meaning: 'Points to guarding feelings at the cost of intimacy, suppressed emotions, or a meaningful offer going unnoticed.' },
  },
  23: {
    upright:  { keywords: ['partnership', 'mutual attraction', 'harmony'], meaning: 'Often connected to two people or forces finding genuine alignment, whether in love, friendship, or shared purpose.' },
    reversed: { keywords: ['misalignment', 'broken bond', 'imbalance'], meaning: 'Points to a connection falling out of step, expectations diverging, or a bond that has developed a fracture.' },
  },
  24: {
    upright:  { keywords: ['celebration', 'friendship', 'shared joy'], meaning: 'Often signals a moment to appreciate connection, mark an achievement together, and enjoy the warmth of community.' },
    reversed: { keywords: ['overindulgence', 'social tension', 'isolation'], meaning: 'Points to excess in celebration, undercurrents of rivalry in a group, or withdrawing from meaningful social bonds.' },
  },
  25: {
    upright:  { keywords: ['contemplation', 'discontent', 'introspection'], meaning: 'Often involves sitting with what is offered but not yet feeling moved by it — a quiet invitation to look deeper within.' },
    reversed: { keywords: ['re-engagement', 'new opportunity', 'emerging from apathy'], meaning: 'Points to lifting out of a passive state, a shift in perspective that sparks fresh motivation, or reconnecting with life.' },
  },
  26: {
    upright:  { keywords: ['loss', 'grief', 'regret'], meaning: 'Often signals an emotional wound that calls for acknowledgment — mourning what is gone before moving toward what remains.' },
    reversed: { keywords: ['acceptance', 'moving forward', 'finding meaning'], meaning: 'Points to beginning to integrate a loss, releasing prolonged grief, and redirecting attention toward what is still possible.' },
  },
  27: {
    upright:  { keywords: ['nostalgia', 'innocence', 'past connections'], meaning: 'Often involves warm memories, revisiting simpler times, or someone from the past re-entering the picture.' },
    reversed: { keywords: ['stuck in the past', 'idealization', 'immaturity'], meaning: 'Points to romanticizing what was, difficulty releasing old patterns, or a reluctance to grow beyond a familiar comfort.' },
  },
  28: {
    upright:  { keywords: ['illusion', 'many choices', 'daydreaming'], meaning: 'Often signals a spread of possibilities that look attractive from a distance — some real, some wishful thinking that needs examining.' },
    reversed: { keywords: ['clarity', 'decisive action', 'facing reality'], meaning: 'Points to the illusions clearing, a clearer sense of what actually matters, and the will to act on that understanding.' },
  },
  29: {
    upright:  { keywords: ['withdrawal', 'moving on', 'emotional journey'], meaning: 'Often signals choosing to leave a situation that no longer nourishes, and walking toward something yet undefined but necessary.' },
    reversed: { keywords: ['fear of abandonment', 'unfinished business', 'staying too long'], meaning: 'Points to clinging to a situation past its natural end, or fear of loss making it harder to move in a new direction.' },
  },
  30: {
    upright:  { keywords: ['satisfaction', 'wish fulfilled', 'contentment'], meaning: 'Often connected to a quiet but genuine happiness — getting what was hoped for and taking a moment to fully appreciate it.' },
    reversed: { keywords: ['shallow contentment', 'unfulfilled desires', 'overindulgence'], meaning: 'Points to surface-level satisfaction masking a deeper void, or comfort that comes at the expense of real growth.' },
  },
  31: {
    upright:  { keywords: ['happiness', 'harmony', 'emotional fulfillment'], meaning: 'Often signals a sense of deep belonging — relationships, home, and inner life all resonating together in a satisfying way.' },
    reversed: { keywords: ['family conflict', 'broken harmony', 'disconnection'], meaning: 'Points to tension beneath the surface of a close group, ideals of togetherness clashing with lived reality.' },
  },
  32: {
    upright:  { keywords: ['creativity', 'sensitivity', 'intuitive messages'], meaning: 'Often connected to playful emotional imagination, creative ideas arriving unexpectedly, or a gut feeling worth following.' },
    reversed: { keywords: ['emotional immaturity', 'daydreaming', 'impracticality'], meaning: 'Points to living in fantasy at the expense of real action, fragile emotions, or creative potential not yet grounded.' },
  },
  33: {
    upright:  { keywords: ['romantic pursuit', 'charm', 'following the heart'], meaning: 'Often connected to pursuing what you feel with genuine warmth, leading with openness, and letting emotion guide the journey.' },
    reversed: { keywords: ['moodiness', 'unreliability', 'emotional manipulation'], meaning: 'Points to inconsistent feelings making it hard to trust or be trusted, or emotions used to influence rather than connect.' },
  },
  34: {
    upright:  { keywords: ['empathy', 'intuition', 'emotional intelligence'], meaning: 'Often connected to deep attunement — feeling what others feel, navigating emotion with wisdom, and creating a safe space.' },
    reversed: { keywords: ['co-dependency', 'emotional instability', 'self-deception'], meaning: 'Points to losing yourself in others\' needs, being swayed by mood rather than grounded truth, or an emotional blind spot.' },
  },
  35: {
    upright:  { keywords: ['emotional maturity', 'compassion', 'diplomacy'], meaning: 'Often connected to steady emotional authority — holding space for others without being swept away, and leading through calm wisdom.' },
    reversed: { keywords: ['manipulation', 'moodiness', 'coldness'], meaning: 'Points to using emotional understanding as a tool for control, unpredictable swings in temperament, or shutting feelings away entirely.' },
  },

  // ── Pentacles ────────────────────────────────────────────────────────────
  36: {
    upright:  { keywords: ['opportunity', 'new income', 'material start'], meaning: 'Often signals the arrival of a concrete new beginning — a seed of financial or material potential ready to be cultivated.' },
    reversed: { keywords: ['missed opportunity', 'financial instability', 'poor planning'], meaning: 'Points to a promising opening overlooked or squandered, unstable material foundations, or plans that lack realistic grounding.' },
  },
  37: {
    upright:  { keywords: ['balance', 'adaptability', 'juggling priorities'], meaning: 'Often connected to managing multiple demands at once with agility, keeping things in motion through flexible thinking.' },
    reversed: { keywords: ['overwhelm', 'imbalance', 'disorganization'], meaning: 'Points to too many plates spinning at once, a loss of equilibrium, or an inability to manage competing responsibilities.' },
  },
  38: {
    upright:  { keywords: ['collaboration', 'skill', 'teamwork'], meaning: 'Often signals that meaningful progress comes through working alongside others, refining your craft, and contributing to a shared goal.' },
    reversed: { keywords: ['disorganization', 'poor quality', 'lack of cooperation'], meaning: 'Points to misaligned efforts within a group, shortcuts compromising the result, or a breakdown in collective communication.' },
  },
  39: {
    upright:  { keywords: ['security', 'caution', 'holding on'], meaning: 'Often involves protecting what has been built, valuing stability, and being cautious about letting resources flow out too freely.' },
    reversed: { keywords: ['greed', 'rigidity', 'fear of loss'], meaning: 'Points to holding on too tightly out of fear, hoarding rather than sharing, or security becoming a cage.' },
  },
  40: {
    upright:  { keywords: ['hardship', 'financial worry', 'isolation'], meaning: 'Often signals a difficult material period — feeling the weight of scarcity, or being on the outside looking in at abundance.' },
    reversed: { keywords: ['recovery', 'receiving help', 'renewed hope'], meaning: 'Points to conditions beginning to improve, accepting support from others, or the worst of a lean stretch passing.' },
  },
  41: {
    upright:  { keywords: ['generosity', 'sharing', 'balanced exchange'], meaning: 'Often connected to a fair and willing distribution of resources — giving and receiving in a way that honors the needs of both sides.' },
    reversed: { keywords: ['debt', 'imbalance', 'strings attached'], meaning: 'Points to an exchange that is one-sided, generosity with hidden conditions, or obligations creating resentment.' },
  },
  42: {
    upright:  { keywords: ['patience', 'long-term vision', 'evaluation'], meaning: 'Often signals a moment to step back, assess what has grown, and trust that sustainable effort will pay off in its own time.' },
    reversed: { keywords: ['impatience', 'wasted effort', 'lack of reward'], meaning: 'Points to expecting results before the work is ready, effort not matching outcome, or abandoning a project too soon.' },
  },
  43: {
    upright:  { keywords: ['diligence', 'skill-building', 'focused work'], meaning: 'Often connected to putting in careful, dedicated effort — crafting something of quality through consistent, purposeful practice.' },
    reversed: { keywords: ['poor quality', 'shortcuts', 'lack of ambition'], meaning: 'Points to cutting corners, skills being underused, or motivation fading before the work is completed with care.' },
  },
  44: {
    upright:  { keywords: ['self-sufficiency', 'refinement', 'abundance'], meaning: 'Often signals a period of enjoying the fruits of past effort — material comfort earned through independence and discernment.' },
    reversed: { keywords: ['dependency', 'overwork', 'superficiality'], meaning: 'Points to comfort that relies too heavily on others, grinding at the cost of rest, or mistaking appearance for substance.' },
  },
  45: {
    upright:  { keywords: ['legacy', 'family stability', 'lasting wealth'], meaning: 'Often connected to the long arc of material and familial security — what is built not just for today, but for those who follow.' },
    reversed: { keywords: ['family conflict', 'financial insecurity', 'broken tradition'], meaning: 'Points to tensions around inheritance or shared resources, instability in the foundations a family relies on.' },
  },
  46: {
    upright:  { keywords: ['ambition', 'new skills', 'diligent study'], meaning: 'Often signals an eagerness to learn and grow in a practical direction — grounded enthusiasm at the beginning of a material pursuit.' },
    reversed: { keywords: ['lack of focus', 'impracticality', 'missed opportunity'], meaning: 'Points to scattered interest, dreaming without follow-through, or failing to seize a concrete chance that was within reach.' },
  },
  47: {
    upright:  { keywords: ['reliability', 'hard work', 'methodical progress'], meaning: 'Often connected to moving forward steadily and thoroughly — progress that may be slow but is solid and trustworthy.' },
    reversed: { keywords: ['stubbornness', 'stagnation', 'perfectionism'], meaning: 'Points to getting stuck in a fixed approach, work slowing to a crawl, or refusing to budge even when flexibility is needed.' },
  },
  48: {
    upright:  { keywords: ['nurturing', 'practical wisdom', 'comfort'], meaning: 'Often connected to a grounded, warm presence — someone who takes care of the people and spaces around them with quiet competence.' },
    reversed: { keywords: ['neglect', 'excessive materialism', 'imbalance'], meaning: 'Points to priorities misaligned — either neglecting what matters most, or over-focusing on material security at the expense of connection.' },
  },
  49: {
    upright:  { keywords: ['prosperity', 'leadership', 'financial mastery'], meaning: 'Often connected to earned success — building and sustaining abundance through disciplined effort and a long-term perspective.' },
    reversed: { keywords: ['stubbornness', 'materialism', 'poor management'], meaning: 'Points to wealth pursued at the cost of relationships, managing resources poorly, or refusing to adapt a strategy that no longer works.' },
  },

  // ── Swords ───────────────────────────────────────────────────────────────
  50: {
    upright:  { keywords: ['clarity', 'breakthrough', 'truth'], meaning: 'Often signals a moment of sharp mental clarity — cutting through ambiguity to see a situation or decision for what it truly is.' },
    reversed: { keywords: ['confusion', 'deception', 'mental fog'], meaning: 'Points to unclear thinking, information that misleads, or a breakthrough being blocked by unexamined assumptions.' },
  },
  51: {
    upright:  { keywords: ['stalemate', 'difficult choice', 'avoidance'], meaning: 'Often involves a standoff where neither side yields — a decision that feels equally weighted, making it hard to act at all.' },
    reversed: { keywords: ['decision made', 'hidden truth revealed', 'taking a stand'], meaning: 'Points to a stalemate breaking, suppressed information surfacing, or finally committing to a direction after prolonged hesitation.' },
  },
  52: {
    upright:  { keywords: ['heartbreak', 'grief', 'emotional pain'], meaning: 'Often signals a wound that cuts deep — loss, betrayal, or sorrow that needs to be felt rather than hurried past.' },
    reversed: { keywords: ['healing', 'releasing grief', 'recovering from sorrow'], meaning: 'Points to the worst of an emotional wound beginning to pass, and the slow return of the capacity to move forward.' },
  },
  53: {
    upright:  { keywords: ['rest', 'retreat', 'mental recovery'], meaning: 'Often signals that stepping back from activity to let the mind recuperate is not a retreat — it is a necessary act of restoration.' },
    reversed: { keywords: ['restlessness', 'burnout', 'forced inaction'], meaning: 'Points to an inability to truly rest even when rest is needed, or feeling stuck in stillness that isn\'t chosen.' },
  },
  54: {
    upright:  { keywords: ['conflict', 'defeat', 'hollow victory'], meaning: 'Often signals a confrontation where someone wins but at a cost — the spoils of conflict leaving little to celebrate.' },
    reversed: { keywords: ['walking away', 'resolution', 'releasing ego'], meaning: 'Points to choosing peace over winning, finding a way through conflict without escalating it, or letting go of the need to be right.' },
  },
  55: {
    upright:  { keywords: ['transition', 'moving on', 'calmer waters'], meaning: 'Often connected to leaving turbulence behind — crossing to a more peaceful place even when the journey feels difficult.' },
    reversed: { keywords: ['resistance to change', 'stuck in the past', 'unresolved tension'], meaning: 'Points to carrying old conflict into new situations, or being held back by what remains unaddressed and unresolved.' },
  },
  56: {
    upright:  { keywords: ['strategy', 'deception', 'acting alone'], meaning: 'Often involves navigating a situation carefully — using wit and discretion, though sometimes at the edge of what feels honest.' },
    reversed: { keywords: ['exposure', 'coming clean', 'changed strategy'], meaning: 'Points to what was hidden surfacing, a plan backfiring, or a decision to stop maneuvering and deal honestly instead.' },
  },
  57: {
    upright:  { keywords: ['restriction', 'trapped thinking', 'self-imposed limits'], meaning: 'Often signals a sense of being hemmed in — usually by thought patterns or beliefs that feel solid but may be more flexible than they appear.' },
    reversed: { keywords: ['freeing yourself', 'new perspective', 'overcoming limits'], meaning: 'Points to recognizing that the constraint was partly self-created, and beginning to loosen its grip through a shift in thinking.' },
  },
  58: {
    upright:  { keywords: ['anxiety', 'worry', 'sleeplessness'], meaning: 'Often signals that the mind is caught in a loop of fearful thinking — replaying worst-case scenarios at the expense of rest and clarity.' },
    reversed: { keywords: ['recovering from fear', 'releasing anxiety', 'calm returning'], meaning: 'Points to anxious thoughts beginning to quiet, a difficult period passing, or finding a way to unwind the knot of worry.' },
  },
  59: {
    upright:  { keywords: ['painful ending', 'crisis', 'rock bottom'], meaning: 'Often signals a crushing conclusion — but also the fact that this is the lowest point, and the only direction from here is up.' },
    reversed: { keywords: ['gradual recovery', 'rising again', 'learning from pain'], meaning: 'Points to survival after a collapse, slowly regaining footing, and beginning to integrate what the difficulty taught.' },
  },
  60: {
    upright:  { keywords: ['curiosity', 'quick thinking', 'vigilance'], meaning: 'Often connected to a sharp, active mind — gathering information, spotting patterns, and staying alert to what is happening around.' },
    reversed: { keywords: ['impulsiveness', 'gossip', 'mental restlessness'], meaning: 'Points to thinking and speaking before considering consequences, getting caught up in rumors, or a mind that can\'t settle.' },
  },
  61: {
    upright:  { keywords: ['ambition', 'directness', 'swift action'], meaning: 'Often connected to charging ahead with confidence — cutting through hesitation, communicating clearly, and moving fast.' },
    reversed: { keywords: ['aggression', 'recklessness', 'rushing in'], meaning: 'Points to speed and force without enough consideration, words or actions that wound, or conflict sought rather than avoided.' },
  },
  62: {
    upright:  { keywords: ['sharp intellect', 'independence', 'clear boundaries'], meaning: 'Often connected to thinking clearly, communicating directly, and maintaining emotional distance when clarity requires it.' },
    reversed: { keywords: ['cold judgment', 'harsh communication', 'isolation'], meaning: 'Points to using intellect in a way that cuts rather than illuminates, or retreating behind logic to avoid emotional honesty.' },
  },
  63: {
    upright:  { keywords: ['rational thinking', 'authority', 'decisive judgment'], meaning: 'Often connected to thinking through complexity with fairness, making clear decisions, and holding a position with integrity.' },
    reversed: { keywords: ['manipulation', 'tyranny', 'emotional detachment'], meaning: 'Points to using reasoning to control rather than lead, enforcing standards without empathy, or cold detachment from impact.' },
  },

  // ── Wands ────────────────────────────────────────────────────────────────
  64: {
    upright:  { keywords: ['inspiration', 'new passion', 'creative spark'], meaning: 'Often signals the ignition of a new drive — an idea or direction that arrives with energy and calls to be pursued.' },
    reversed: { keywords: ['creative block', 'delays', 'lack of direction'], meaning: 'Points to inspiration stalled at the starting line, enthusiasm deflated by obstacles, or uncertainty about where to begin.' },
  },
  65: {
    upright:  { keywords: ['planning', 'vision', 'bold decisions'], meaning: 'Often connected to looking ahead with confidence, mapping a course of action, and beginning to put ambitious plans into motion.' },
    reversed: { keywords: ['fear of uncertainty', 'poor planning', 'short-term thinking'], meaning: 'Points to hesitating before the next step, plans that lack depth, or a reluctance to commit to a longer-term direction.' },
  },
  66: {
    upright:  { keywords: ['expansion', 'foresight', 'awaiting results'], meaning: 'Often signals that something set in motion is developing — a broadening of reach, and a confident watch over what is unfolding.' },
    reversed: { keywords: ['delays', 'frustration', 'narrow perspective'], meaning: 'Points to expected progress stalling, a field of view that is too limited to see the full picture, or impatience with how long things are taking.' },
  },
  67: {
    upright:  { keywords: ['celebration', 'milestone', 'homecoming'], meaning: 'Often connected to marking a meaningful achievement, a sense of arrival, and the joy of a stable and welcoming foundation.' },
    reversed: { keywords: ['disrupted harmony', 'instability at home', 'incomplete success'], meaning: 'Points to a celebration shadowed by tension, instability beneath the surface of a happy situation, or a milestone that feels partial.' },
  },
  68: {
    upright:  { keywords: ['conflict', 'competition', 'differing views'], meaning: 'Often signals a lively clash of energies — competing ideas or personalities creating friction that, if navigated well, can sharpen everyone involved.' },
    reversed: { keywords: ['avoiding conflict', 'resolution', 'misunderstanding cleared'], meaning: 'Points to tensions beginning to ease, a willingness to find common ground, or diffusing a situation before it escalates.' },
  },
  69: {
    upright:  { keywords: ['victory', 'recognition', 'public success'], meaning: 'Often connected to achieving something visible — effort rewarded, confidence restored, and a sense of standing out in a deserved way.' },
    reversed: { keywords: ['ego inflation', 'fall from grace', 'delayed recognition'], meaning: 'Points to success going to the head, a public stumble after a high point, or recognition that comes slower than hoped.' },
  },
  70: {
    upright:  { keywords: ['perseverance', 'defending your position', 'resilience'], meaning: 'Often signals standing firm under pressure — holding your ground even when the challenges seem to multiply.' },
    reversed: { keywords: ['overwhelm', 'giving up', 'yielding to pressure'], meaning: 'Points to being worn down by opposition, abandoning a position that was worth holding, or buckling under accumulated stress.' },
  },
  71: {
    upright:  { keywords: ['speed', 'momentum', 'rapid progress'], meaning: 'Often signals things moving fast — events accelerating, communication flowing quickly, or a burst of productive energy.' },
    reversed: { keywords: ['delays', 'scattered energy', 'miscommunication'], meaning: 'Points to momentum blocked, messages getting crossed, or energy dispersed in too many directions to be effective.' },
  },
  72: {
    upright:  { keywords: ['resilience', 'persistence', 'nearly there'], meaning: 'Often connected to having come a long way through difficulty, still standing, and being closer to the finish than it might feel.' },
    reversed: { keywords: ['exhaustion', 'stubbornness', 'paranoia'], meaning: 'Points to pushing past healthy limits, an unwillingness to rest or adjust course, or suspicion making it hard to trust what\'s around.' },
  },
  73: {
    upright:  { keywords: ['burden', 'responsibility', 'overcommitment'], meaning: 'Often signals carrying more than is comfortable — obligations stacked high, and the question of whether some can be set down or shared.' },
    reversed: { keywords: ['releasing burdens', 'delegating', 'burnout warning'], meaning: 'Points to dropping what is too heavy, asking for help, or a sign that continuing at this pace leads toward real depletion.' },
  },
  74: {
    upright:  { keywords: ['enthusiasm', 'exploration', 'new ideas'], meaning: 'Often connected to the thrill of discovery — a fresh energy, a willingness to try, and curiosity that hasn\'t yet been tempered by experience.' },
    reversed: { keywords: ['impulsiveness', 'lack of follow-through', 'scattered energy'], meaning: 'Points to excitement that burns fast without completing anything, or leaping before a clearer direction has been established.' },
  },
  75: {
    upright:  { keywords: ['adventure', 'passion', 'bold action'], meaning: 'Often connected to moving with fire and confidence — pursuing what excites you, and bringing others along through sheer energy.' },
    reversed: { keywords: ['recklessness', 'impatience', 'burnout'], meaning: 'Points to charging forward without enough care for what gets left behind, or passion burning itself out before the destination is reached.' },
  },
  76: {
    upright:  { keywords: ['confidence', 'independence', 'vibrant energy'], meaning: 'Often connected to a radiant, magnetic presence — someone who knows what they want and moves through the world with natural authority.' },
    reversed: { keywords: ['insecurity', 'jealousy', 'demanding behavior'], meaning: 'Points to confidence wavering and expressing itself as control or competition, or energy that pushes others away rather than drawing them in.' },
  },
  77: {
    upright:  { keywords: ['charisma', 'vision', 'bold leadership'], meaning: 'Often connected to an inspiring, far-reaching presence — someone who sees the big picture and rallies others toward it through force of personality.' },
    reversed: { keywords: ['impulsiveness', 'arrogance', 'domineering tendencies'], meaning: 'Points to vision pursued without regard for the people involved, a commanding manner tipping into control, or confidence unchecked by humility.' },
  },
};

/**
 * Returns the keywords for a card in the requested locale.
 * Falls back to the card's own data for Chinese; uses the English table for English.
 */
export function getLocalizedKeywords(
  card: TarotCard,
  orientation: 'upright' | 'reversed',
  locale: string | undefined
): string[] {
  if (locale === 'zh') {
    const side = card[orientation];
    if (typeof side === 'object' && side !== null && 'keywords' in side) return side.keywords;
    return card.keywords ?? [];
  }
  const enData = tarotCardsEnData[card.id];
  if (enData) return enData[orientation].keywords;
  // fallback to Chinese if no English data
  const side = card[orientation];
  if (typeof side === 'object' && side !== null && 'keywords' in side) return side.keywords;
  return card.keywords ?? [];
}

/**
 * Returns the meaning text for a card in the requested locale.
 * Falls back to the card's own data for Chinese; uses the English table for English.
 */
export function getLocalizedMeaning(
  card: TarotCard,
  orientation: 'upright' | 'reversed',
  locale: string | undefined
): string {
  if (locale === 'zh') {
    const side = card[orientation];
    if (typeof side === 'object' && side !== null && 'meaning' in side) return side.meaning;
    return typeof side === 'string' ? side : '';
  }
  const enData = tarotCardsEnData[card.id];
  if (enData) return enData[orientation].meaning;
  // fallback to Chinese if no English data
  const side = card[orientation];
  if (typeof side === 'object' && side !== null && 'meaning' in side) return side.meaning;
  return typeof side === 'string' ? side : '';
}
