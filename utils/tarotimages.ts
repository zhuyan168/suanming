//这串代码是gpt生成的，用于获取塔罗牌图片
// tarotimages.ts — Full 78-Card Mapping (Flat + Grouped)
// 封雪专属版本：完全无重复、按你项目结构优化过

export const SUPABASE_TAROT_BASE_URL =
  "https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/";

export const getTarotImageUrl = (fileName: string) =>
  `${SUPABASE_TAROT_BASE_URL}${fileName}`;

// ---------------------------------------------------------
// FLAT STRUCTURE — 完整 78 张
// ---------------------------------------------------------
export const tarotImagesFlat = {
  // Major Arcana (22)
  "major_arcana_fool": getTarotImageUrl("major_arcana_fool.png"),
  "major_arcana_magician": getTarotImageUrl("major_arcana_magician.png"),
  "major_arcana_priestess": getTarotImageUrl("major_arcana_priestess.png"),
  "major_arcana_empress": getTarotImageUrl("major_arcana_empress.png"),
  "major_arcana_emperor": getTarotImageUrl("major_arcana_emperor.png"),
  "major_arcana_hierophant": getTarotImageUrl("major_arcana_hierophant.png"),
  "major_arcana_lovers": getTarotImageUrl("major_arcana_lovers.png"),
  "major_arcana_chariot": getTarotImageUrl("major_arcana_chariot.png"),
  "major_arcana_strength": getTarotImageUrl("major_arcana_strength.png"),
  "major_arcana_hermit": getTarotImageUrl("major_arcana_hermit.png"),
  "major_arcana_fortune": getTarotImageUrl("major_arcana_fortune.png"),
  "major_arcana_justice": getTarotImageUrl("major_arcana_justice.png"),
  "major_arcana_hanged": getTarotImageUrl("major_arcana_hanged.png"),
  "major_arcana_death": getTarotImageUrl("major_arcana_death.png"),
  "major_arcana_temperance": getTarotImageUrl("major_arcana_temperance.png"),
  "major_arcana_devil": getTarotImageUrl("major_arcana_devil.png"),
  "major_arcana_tower": getTarotImageUrl("major_arcana_tower.png"),
  "major_arcana_star": getTarotImageUrl("major_arcana_star.png"),
  "major_arcana_moon": getTarotImageUrl("major_arcana_moon.png"),
  "major_arcana_sun": getTarotImageUrl("major_arcana_sun.png"),
  "major_arcana_judgement": getTarotImageUrl("major_arcana_judgement.png"),
  "major_arcana_world": getTarotImageUrl("major_arcana_world.png"),

  // Cups — 圣杯 (14)
  "minor_arcana_cups_2": getTarotImageUrl("minor_arcana_cups_2.png"),
  "minor_arcana_cups_3": getTarotImageUrl("minor_arcana_cups_3.png"),
  "minor_arcana_cups_4": getTarotImageUrl("minor_arcana_cups_4.png"),
  "minor_arcana_cups_5": getTarotImageUrl("minor_arcana_cups_5.png"),
  "minor_arcana_cups_6": getTarotImageUrl("minor_arcana_cups_6.png"),
  "minor_arcana_cups_7": getTarotImageUrl("minor_arcana_cups_7.png"),
  "minor_arcana_cups_8": getTarotImageUrl("minor_arcana_cups_8.png"),
  "minor_arcana_cups_9": getTarotImageUrl("minor_arcana_cups_9.png"),
  "minor_arcana_cups_10": getTarotImageUrl("minor_arcana_cups_10.png"),
  "minor_arcana_cups_ace": getTarotImageUrl("minor_arcana_cups_ace.png"),
  "minor_arcana_cups_page": getTarotImageUrl("minor_arcana_cups_page.png"),
  "minor_arcana_cups_knight": getTarotImageUrl("minor_arcana_cups_knight.png"),
  "minor_arcana_cups_queen": getTarotImageUrl("minor_arcana_cups_queen.png"),
  "minor_arcana_cups_king": getTarotImageUrl("minor_arcana_cups_king.png"),

  // Pentacles — 星币 (14)
  "minor_arcana_pentacles_1": getTarotImageUrl("minor_arcana_pentacles_1.png"),
  "minor_arcana_pentacles_2": getTarotImageUrl("minor_arcana_pentacles_2.png"),
  "minor_arcana_pentacles_3": getTarotImageUrl("minor_arcana_pentacles_3.png"),
  "minor_arcana_pentacles_4": getTarotImageUrl("minor_arcana_pentacles_4.png"),
  "minor_arcana_pentacles_5": getTarotImageUrl("minor_arcana_pentacles_5.png"),
  "minor_arcana_pentacles_6": getTarotImageUrl("minor_arcana_pentacles_6.png"),
  "minor_arcana_pentacles_7": getTarotImageUrl("minor_arcana_pentacles_7.png"),
  "minor_arcana_pentacles_8": getTarotImageUrl("minor_arcana_pentacles_8.png"),
  "minor_arcana_pentacles_9": getTarotImageUrl("minor_arcana_pentacles_9.png"),
  "minor_arcana_pentacles_10": getTarotImageUrl("minor_arcana_pentacles_10.png"),
  "minor_arcana_pentacles_page": getTarotImageUrl("minor_arcana_pentacles_page.png"),
  "minor_arcana_pentacles_knight": getTarotImageUrl("minor_arcana_pentacles_knight.png"),
  "minor_arcana_pentacles_queen": getTarotImageUrl("minor_arcana_pentacles_queen.png"),
  "minor_arcana_pentacles_king": getTarotImageUrl("minor_arcana_pentacles_king.png"),

  // Swords — 宝剑 (14)
  "minor_arcana_swords_1": getTarotImageUrl("minor_arcana_swords_1.png"),
  "minor_arcana_swords_2": getTarotImageUrl("minor_arcana_swords_2.png"),
  "minor_arcana_swords_3": getTarotImageUrl("minor_arcana_swords_3.png"),
  "minor_arcana_swords_4": getTarotImageUrl("minor_arcana_swords_4.png"),
  "minor_arcana_swords_5": getTarotImageUrl("minor_arcana_swords_5.png"),
  "minor_arcana_swords_6": getTarotImageUrl("minor_arcana_swords_6.png"),
  "minor_arcana_swords_7": getTarotImageUrl("minor_arcana_swords_7.png"),
  "minor_arcana_swords_8": getTarotImageUrl("minor_arcana_swords_8.png"),
  "minor_arcana_swords_9": getTarotImageUrl("minor_arcana_swords_9.png"),
  "minor_arcana_swords_10": getTarotImageUrl("minor_arcana_swords_10.png"),
  "minor_arcana_swords_page": getTarotImageUrl("minor_arcana_swords_page.png"),
  "minor_arcana_swords_knight": getTarotImageUrl("minor_arcana_swords_knight.png"),
  "minor_arcana_swords_queen": getTarotImageUrl("minor_arcana_swords_queen.png"),
  "minor_arcana_swords_king": getTarotImageUrl("minor_arcana_swords_king.png"),

  // Wands — 权杖 (14)
  "minor_arcana_wands_1": getTarotImageUrl("minor_arcana_wands_1.png"),
  "minor_arcana_wands_2": getTarotImageUrl("minor_arcana_wands_2.png"),
  "minor_arcana_wands_3": getTarotImageUrl("minor_arcana_wands_3.png"),
  "minor_arcana_wands_4": getTarotImageUrl("minor_arcana_wands_4.png"),
  "minor_arcana_wands_5": getTarotImageUrl("minor_arcana_wands_5.png"),
  "minor_arcana_wands_6": getTarotImageUrl("minor_arcana_wands_6.png"),
  "minor_arcana_wands_7": getTarotImageUrl("minor_arcana_wands_7.png"),
  "minor_arcana_wands_8": getTarotImageUrl("minor_arcana_wands_8.png"),
  "minor_arcana_wands_9": getTarotImageUrl("minor_arcana_wands_9.png"),
  "minor_arcana_wands_10": getTarotImageUrl("minor_arcana_wands_10.png"),
  "minor_arcana_wands_page": getTarotImageUrl("minor_arcana_wands_page.png"),
  "minor_arcana_wands_knight": getTarotImageUrl("minor_arcana_wands_knight.png"),
  "minor_arcana_wands_queen": getTarotImageUrl("minor_arcana_wands_queen.png"),
  "minor_arcana_wands_king": getTarotImageUrl("minor_arcana_wands_king.png")
}

// ---------------------------------------------------------
// GROUPED STRUCTURE — 按牌系分类，适合四季牌阵等复杂占卜
// ---------------------------------------------------------
export const tarotImages = {
    major: {
    fool: tarotImagesFlat.major_arcana_fool,
    magician: tarotImagesFlat.major_arcana_magician,
    priestess: tarotImagesFlat.major_arcana_priestess,
    empress: tarotImagesFlat.major_arcana_empress,
    emperor: tarotImagesFlat.major_arcana_emperor,
    hierophant: tarotImagesFlat.major_arcana_hierophant,
    lovers: tarotImagesFlat.major_arcana_lovers,
    chariot: tarotImagesFlat.major_arcana_chariot,
    strength: tarotImagesFlat.major_arcana_strength,
    hermit: tarotImagesFlat.major_arcana_hermit,
    fortune: tarotImagesFlat.major_arcana_fortune,
    justice: tarotImagesFlat.major_arcana_justice,
    hanged: tarotImagesFlat.major_arcana_hanged,
    death: tarotImagesFlat.major_arcana_death,
    temperance: tarotImagesFlat.major_arcana_temperance,
    devil: tarotImagesFlat.major_arcana_devil,
    tower: tarotImagesFlat.major_arcana_tower,
    star: tarotImagesFlat.major_arcana_star,
    moon: tarotImagesFlat.major_arcana_moon,
    sun: tarotImagesFlat.major_arcana_sun,
    judgement: tarotImagesFlat.major_arcana_judgement,
    world: tarotImagesFlat.major_arcana_world,
    },
    
    
    cups: {
    2: tarotImagesFlat.minor_arcana_cups_2,
    3: tarotImagesFlat.minor_arcana_cups_3,
    4: tarotImagesFlat.minor_arcana_cups_4,
    5: tarotImagesFlat.minor_arcana_cups_5,
    6: tarotImagesFlat.minor_arcana_cups_6,
    7: tarotImagesFlat.minor_arcana_cups_7,
    8: tarotImagesFlat.minor_arcana_cups_8,
    9: tarotImagesFlat.minor_arcana_cups_9,
    10: tarotImagesFlat.minor_arcana_cups_10,
    ace: tarotImagesFlat.minor_arcana_cups_ace,
    page: tarotImagesFlat.minor_arcana_cups_page,
    knight: tarotImagesFlat.minor_arcana_cups_knight,
    queen: tarotImagesFlat.minor_arcana_cups_queen,
    king: tarotImagesFlat.minor_arcana_cups_king,
    },
    
    
    pentacles: {
    1: tarotImagesFlat.minor_arcana_pentacles_1,
    2: tarotImagesFlat.minor_arcana_pentacles_2,
    3: tarotImagesFlat.minor_arcana_pentacles_3,
    4: tarotImagesFlat.minor_arcana_pentacles_4,
    5: tarotImagesFlat.minor_arcana_pentacles_5,
    6: tarotImagesFlat.minor_arcana_pentacles_6,
    7: tarotImagesFlat.minor_arcana_pentacles_7,
    8: tarotImagesFlat.minor_arcana_pentacles_8,
    9: tarotImagesFlat.minor_arcana_pentacles_9,
    10: tarotImagesFlat.minor_arcana_pentacles_10,
    page: tarotImagesFlat.minor_arcana_pentacles_page,
    knight: tarotImagesFlat.minor_arcana_pentacles_knight,
    queen: tarotImagesFlat.minor_arcana_pentacles_queen,
    king: tarotImagesFlat.minor_arcana_pentacles_king,
    },
    
    
    swords: {
    1: tarotImagesFlat.minor_arcana_swords_1,
    2: tarotImagesFlat.minor_arcana_swords_2,
    3: tarotImagesFlat.minor_arcana_swords_3,
    4: tarotImagesFlat.minor_arcana_swords_4,
    5: tarotImagesFlat.minor_arcana_swords_5,
    6: tarotImagesFlat.minor_arcana_swords_6,
    7: tarotImagesFlat.minor_arcana_swords_7,
    8: tarotImagesFlat.minor_arcana_swords_8,
    9: tarotImagesFlat.minor_arcana_swords_9,
    10: tarotImagesFlat.minor_arcana_swords_10,
    page: tarotImagesFlat.minor_arcana_swords_page,
    knight: tarotImagesFlat.minor_arcana_swords_knight,
    queen: tarotImagesFlat.minor_arcana_swords_queen,
    king: tarotImagesFlat.minor_arcana_swords_king,
    },
    
    
    wands: {
    1: tarotImagesFlat.minor_arcana_wands_1,
    2: tarotImagesFlat.minor_arcana_wands_2,
    3: tarotImagesFlat.minor_arcana_wands_3,
    4: tarotImagesFlat.minor_arcana_wands_4,
    5: tarotImagesFlat.minor_arcana_wands_5,
    6: tarotImagesFlat.minor_arcana_wands_6,
    7: tarotImagesFlat.minor_arcana_wands_7,
    8: tarotImagesFlat.minor_arcana_wands_8,
    9: tarotImagesFlat.minor_arcana_wands_9,
    10: tarotImagesFlat.minor_arcana_wands_10,
    page: tarotImagesFlat.minor_arcana_wands_page,
    knight: tarotImagesFlat.minor_arcana_wands_knight,
    queen: tarotImagesFlat.minor_arcana_wands_queen,
    king: tarotImagesFlat.minor_arcana_wands_king,
    },
    };