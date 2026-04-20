import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Heart, Skull, Zap, Map, Trophy, ArrowUpCircle, Check, Lock, Crosshair, Flame, Star, Target, Briefcase, Shirt, Gem, Package, Volume2, VolumeX, Sparkles, Globe, Play, Settings, HelpCircle } from 'lucide-react';

// --- GEMINI API INTEGRATION ---
const apiKey = ""; 

const fetchWithBackoff = async (prompt, retries = 5) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "Anda adalah asisten AI di dalam sebuah game RPG Kimia." }] }
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (i === retries - 1) return null;
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
};

// --- DICTIONARY & LOCALIZATION ---
const DICT = {
  id: {
    play: "Mulai Bermain", settings: "Pengaturan", lang: "Bahasa", sfxOn: "Suara Nyala", sfxOff: "Suara Mati",
    bgmOn: "Musik Nyala", bgmOff: "Musik Mati",
    prep: "Persiapan Pahlawan", namePh: "Nama Pahlawan", startAdv: "Mulai Petualangan", class: "Kelas Pahlawan",
    outfitStyle: "Gaya Pakaian", outfitColor: "Warna Pakaian", skinColor: "Warna Kulit", hairEye: "Rambut & Mata",
    hair: "Rambut", eye: "Mata", atk: "SERANG!", skillBook: "Buku Skill", newItem: "Item Baru", takeCont: "Ambil & Lanjutkan",
    map: "Peta", inv: "Tas", stats: "Pencapaian", win: "KEMENANGAN", lose: "GAME OVER", tryAgain: "Coba Lagi",
    playAgain: "Main Lagi", equip: "Pasang", unequip: "Lepas", emptyBag: "Tas Kosong", mapTitle: "Peta Dunia",
    hintAlchemist: "Petunjuk Alkemis AI", answer: "Jawab", true: "Benar", false: "Salah", battleLog: "Log Pertarungan",
    back: "Kembali", achUnlocked: "Pencapaian Baru!"
  },
  en: {
    play: "Play Game", settings: "Settings", lang: "Language", sfxOn: "Sound On", sfxOff: "Sound Off",
    bgmOn: "Music On", bgmOff: "Music Off",
    prep: "Hero Preparation", namePh: "Hero Name", startAdv: "Start Adventure", class: "Hero Class",
    outfitStyle: "Outfit Style", outfitColor: "Outfit Color", skinColor: "Skin Color", hairEye: "Hair & Eyes",
    hair: "Hair", eye: "Eyes", atk: "ATTACK!", skillBook: "Skill Book", newItem: "New Item", takeCont: "Take & Continue",
    map: "Map", inv: "Bag", stats: "Trophies", win: "VICTORY", lose: "GAME OVER", tryAgain: "Try Again",
    playAgain: "Play Again", equip: "Equip", unequip: "Unequip", emptyBag: "Empty Bag", mapTitle: "World Map",
    hintAlchemist: "AI Alchemist Hint", answer: "Answer", true: "True", false: "False", battleLog: "Battle Log",
    back: "Back", achUnlocked: "New Achievement!"
  }
};

// --- DATA & KONFIGURASI ---
const CLASSES = {
  Warrior: { hp: 120, maxHp: 120, dmg: 15, color: '#3b82f6', icon: '⚔️', desc: {id: 'Seimbang serangan & pertahanan', en: 'Balanced attack & defense'}, classSkill: { id: 'warriorSkill', name: 'Heroic Strike', cd: 3 } },
  Tank: { hp: 200, maxHp: 200, dmg: 8, color: '#10b981', icon: '🛡️', desc: {id: 'Darah tebal penahan serangan', en: 'Very high health pool'}, classSkill: { id: 'tankSkill', name: 'Absolute Defense', cd: 4 } },
  Assassin: { hp: 70, maxHp: 70, dmg: 30, color: '#ef4444', icon: '🗡️', desc: {id: 'Mematikan, namun sangat rapuh', en: 'Deadly but fragile'}, classSkill: { id: 'assassinSkill', name: 'Shadow Evasion', cd: 4 } },
  Mage: { hp: 60, maxHp: 60, dmg: 35, color: '#a855f7', icon: '🔮', desc: {id: 'Daya hancur sihir luar biasa', en: 'High destructive magic'}, classSkill: { id: 'mageSkill', name: 'Blood Magic', cd: 4 } },
  Paladin: { hp: 160, maxHp: 160, dmg: 12, color: '#f59e0b', icon: '✨', desc: {id: 'Ksatria suci pemulih diri', en: 'Holy knight with self-heal'}, classSkill: { id: 'paladinSkill', name: 'Divine Blessing', cd: 5 } },
  Berserker: { hp: 90, maxHp: 90, dmg: 25, color: '#b91c1c', icon: '🪓', desc: {id: 'Semakin lama makin buas', en: 'Grows stronger over time'}, classSkill: { id: 'berserkerSkill', name: 'Rampage', cd: 2 } }
};

const MAP_REGIONS = [
  { id: 'region1', name: {id:'Hutan Terlarang', en:'Forbidden Forest'}, desc: 'Tahap 1', color: 'border-green-800 bg-green-950/30', textHead: 'text-green-500', startIndex: 0, endIndex: 3 },
  { id: 'region2', name: {id:'Reruntuhan Kuno', en:'Ancient Ruins'}, desc: 'Tahap 2', color: 'border-slate-700 bg-slate-900/50', textHead: 'text-slate-300', startIndex: 4, endIndex: 6 },
  { id: 'region3', name: {id:'Kamp Komando', en:'Commando Camp'}, desc: 'Tahap 3', color: 'border-red-900 bg-red-950/30', textHead: 'text-red-500', startIndex: 7, endIndex: 8 },
  { id: 'region4', name: {id:'Tahta Kehancuran', en:'Throne of Ruin'}, desc: 'Tahap 4', color: 'border-purple-900 bg-purple-950/40', textHead: 'text-purple-400', startIndex: 9, endIndex: 9 },
];

const ENEMIES = [
  { name: 'Slime', emoji: '🦠', hp: 30, maxHp: 30, dmg: 5, type: 'Kroco' },
  { name: 'Goblin', emoji: '👺', hp: 45, maxHp: 45, dmg: 8, type: 'Kroco' },
  { name: 'Goblin Mage', emoji: '🧙‍♂️', hp: 40, maxHp: 40, dmg: 12, type: 'Kroco' },
  { name: 'Wolf', emoji: '🐺', hp: 55, maxHp: 55, dmg: 10, type: 'Kroco' },
  { name: 'Skeleton', emoji: '💀', hp: 80, maxHp: 80, dmg: 15, type: 'Penjaga' },
  { name: 'Orc Warrior', emoji: '👹', hp: 110, maxHp: 110, dmg: 18, type: 'Penjaga' },
  { name: 'Stone Golem', emoji: '🪨', hp: 150, maxHp: 150, dmg: 12, type: 'Penjaga' },
  { name: 'Goblin Champ', emoji: '👿', hp: 180, maxHp: 180, dmg: 25, type: 'Komando' },
  { name: 'Orc King', emoji: '🦍', hp: 250, maxHp: 250, dmg: 20, type: 'Komando' },
  { name: 'Raja Iblis', emoji: '👑😈', hp: 400, maxHp: 400, dmg: 35, type: 'Raja Iblis' }
];

const ITEMS_DATABASE = [
  { id: 'w1', name: 'Pisau Karat', type: 'Senjata', stats: { dmg: 5 }, rarity: 'Biasa', icon: '🔪', minTier: 0 },
  { id: 'w2', name: 'Pedang Besi', type: 'Senjata', stats: { dmg: 12 }, rarity: 'Langka', icon: '🗡️', minTier: 2 },
  { id: 'w3', name: 'Tongkat Magis', type: 'Senjata', stats: { dmg: 15 }, rarity: 'Langka', icon: '🪄', minTier: 3 },
  { id: 'w4', name: 'Kapak Orc', type: 'Senjata', stats: { dmg: 20 }, rarity: 'Epik', icon: '🪓', minTier: 5 },
  { id: 'w5', name: 'Tombak Petir', type: 'Senjata', stats: { dmg: 25 }, rarity: 'Epik', icon: '⚡', minTier: 6 },
  { id: 'w6', name: 'Belati Bayangan', type: 'Senjata', stats: { dmg: 18 }, rarity: 'Langka', icon: '🗡️', minTier: 4 },
  { id: 'w7', name: 'Palu Meteor', type: 'Senjata', stats: { dmg: 40 }, rarity: 'Legendaris', icon: '☄️', minTier: 8 },
  { id: 'w8', name: 'Pedang Iblis', type: 'Senjata', stats: { dmg: 35 }, rarity: 'Legendaris', icon: '⚔️', minTier: 8 },
  { id: 'a1', name: 'Jubah Kain', type: 'Baju Besi', stats: { hp: 15 }, rarity: 'Biasa', icon: '👕', minTier: 0 },
  { id: 'a2', name: 'Rompi Angin', type: 'Baju Besi', stats: { hp: 20 }, rarity: 'Biasa', icon: '🦺', minTier: 1 },
  { id: 'a3', name: 'Zirah Kulit', type: 'Baju Besi', stats: { hp: 35 }, rarity: 'Langka', icon: '🧥', minTier: 3 },
  { id: 'a4', name: 'Zirah Berduri', type: 'Baju Besi', stats: { hp: 45, dmg: 5 }, rarity: 'Langka', icon: '🌵', minTier: 4 },
  { id: 'a5', name: 'Jubah Api', type: 'Baju Besi', stats: { hp: 50 }, rarity: 'Epik', icon: '🔥', minTier: 5 },
  { id: 'a6', name: 'Zirah Baja', type: 'Baju Besi', stats: { hp: 60 }, rarity: 'Epik', icon: '🛡️', minTier: 6 },
  { id: 'a7', name: 'Plat Berlian', type: 'Baju Besi', stats: { hp: 100 }, rarity: 'Legendaris', icon: '💎', minTier: 8 },
  { id: 'r1', name: 'Cincin Tembaga', type: 'Aksesori', stats: { hp: 10, dmg: 2 }, rarity: 'Biasa', icon: '💍', minTier: 0 },
  { id: 'r2', name: 'Anting Tulang', type: 'Aksesori', stats: { dmg: 5 }, rarity: 'Biasa', icon: '🦴', minTier: 1 },
  { id: 'r3', name: 'Kalung Zamrud', type: 'Aksesori', stats: { hp: 25, dmg: 5 }, rarity: 'Langka', icon: '📿', minTier: 3 },
  { id: 'r4', name: 'Gelang Ruby', type: 'Aksesori', stats: { hp: 15, dmg: 10 }, rarity: 'Langka', icon: '🔴', minTier: 4 },
  { id: 'r5', name: 'Sabuk Titan', type: 'Aksesori', stats: { hp: 50 }, rarity: 'Epik', icon: '🔗', minTier: 6 },
  { id: 'r6', name: 'Mahkota Raja', type: 'Aksesori', stats: { hp: 40, dmg: 10 }, rarity: 'Epik', icon: '👑', minTier: 7 },
  { id: 'r7', name: 'Jimat Naga', type: 'Aksesori', stats: { hp: 60, dmg: 15 }, rarity: 'Legendaris', icon: '🐉', minTier: 8 },
  { id: 'r8', name: 'Mata Iblis', type: 'Aksesori', stats: { dmg: 25 }, rarity: 'Legendaris', icon: '👁️', minTier: 8 },
];

const QUESTIONS_DB = {
  mcq: [
    // Chemistry
    { id_q: "Apa hasil setara dari pembentukan air: 2H₂ + O₂ → ?", en_q: "What is the product of: 2H₂ + O₂ → ?", options: ["2H₂O", "H₂O₂", "2HO", "H₂O"], ans: 0 },
    { id_q: "Gas dari fotosintesis (6CO₂ + 6H₂O → C₆H₁₂O₆ + ?) adalah...", en_q: "Gas produced by photosynthesis is...", options: ["6CO₂", "6O₂", "6H₂", "6CH₄"], ans: 1 },
    { id_q: "Reaksi HCl + NaOH → NaCl + ? menghasilkan...", en_q: "HCl + NaOH → NaCl + ?", options: ["H₂", "O₂", "H₂O", "CO₂"], ans: 2 },
    { id_q: "Pembakaran metana (CH₄ + 2O₂ → CO₂ + ?) menghasilkan...", en_q: "Combustion of methane (CH₄ + 2O₂ → CO₂ + ?)", options: ["2H₂O", "H₂O", "CH₃OH", "CO"], ans: 0 },
    { id_q: "Zat yang mempercepat laju reaksi disebut...", en_q: "Substance that speeds up a reaction is...", options: ["Inhibitor", "Katalisator/Catalyst", "Produk/Product", "Solven"], ans: 1 },
    { id_q: "Rumus kimia Asam Sulfat adalah...", en_q: "Chemical formula for Sulfuric Acid is...", options: ["HCl", "HNO₃", "H₂SO₄", "H₃PO₄"], ans: 2 },
    { id_q: "Ikatan yang berbagi elektron disebut...", en_q: "Bond sharing electrons is called...", options: ["Ion/Ionic", "Kovalen/Covalent", "Logam/Metallic", "Hidrogen"], ans: 1 },
    { id_q: "pH larutan netral pada suhu 25°C adalah...", en_q: "pH of neutral solution at 25°C is...", options: ["0", "14", "7", "10"], ans: 2 },
    { id_q: "Partikel bermuatan positif disebut...", en_q: "Positively charged particle is...", options: ["Elektron", "Proton", "Neutron", "Foton"], ans: 1 },
    { id_q: "Unsur paling ringan di alam semesta adalah...", en_q: "Lightest element in universe is...", options: ["Helium", "Oksigen", "Hidrogen", "Karbon"], ans: 2 },
    { id_q: "Massa atom terpusat pada...", en_q: "The mass of an atom is concentrated in...", options: ["Kulit Elektron", "Awan Elektron", "Inti Atom (Nucleus)", "Foton"], ans: 2 },
    { id_q: "Rumus kimia garam dapur adalah...", en_q: "Chemical formula for table salt is...", options: ["KCl", "NaCl", "MgCl₂", "CaCl₂"], ans: 1 },
    { id_q: "Zat yang mengubah kertas lakmus biru menjadi merah bersifat...", en_q: "Substance that turns blue litmus red is...", options: ["Basa", "Netral", "Asam (Acid)", "Garam"], ans: 2 },
    { id_q: "Simbol unsur untuk Kalium adalah...", en_q: "Chemical symbol for Potassium is...", options: ["Ka", "K", "Pt", "Po"], ans: 1 },
    // Space / Astronomy
    { id_q: "Planet manakah yang dikenal sebagai 'Planet Merah'?", en_q: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Mars", "Jupiter", "Saturnus"], ans: 1 },
    { id_q: "Pusat dari Tata Surya kita adalah...", en_q: "The center of our Solar System is...", options: ["Bumi/Earth", "Matahari/Sun", "Bulan/Moon", "Bima Sakti"], ans: 1 },
    { id_q: "Planet terbesar di Tata Surya kita adalah...", en_q: "The largest planet in our Solar System is...", options: ["Saturnus", "Uranus", "Neptunus", "Jupiter"], ans: 3 },
    { id_q: "Gaya yang menahan planet-planet tetap di orbitnya adalah...", en_q: "The force that keeps planets in orbit is...", options: ["Magnetisme", "Gravitasi/Gravity", "Gesekan", "Sentrifugal"], ans: 1 },
    { id_q: "Galaksi tempat Bumi berada dinamakan...", en_q: "The galaxy where Earth is located is called...", options: ["Andromeda", "Triangulum", "Bima Sakti/Milky Way", "Orion"], ans: 2 },
    { id_q: "Matahari utamanya terdiri dari dua unsur gas, yaitu...", en_q: "The Sun is primarily made of two gases...", options: ["Oksigen & Karbon", "Hidrogen & Helium", "Nitrogen & Hidrogen", "Helium & Argon"], ans: 1 },
    { id_q: "Benda langit yang mengeluarkan cahaya sendiri disebut...", en_q: "A celestial body that emits its own light is a...", options: ["Planet", "Satelit", "Komet", "Bintang/Star"], ans: 3 },
    { id_q: "Jarak yang ditempuh cahaya dalam satu tahun disebut...", en_q: "The distance light travels in one year is...", options: ["Tahun Kabisat", "Tahun Cahaya/Light Year", "Parsec", "Kecepatan Warp"], ans: 1 }
  ],
  tf: [
    // Chemistry
    { id_q: "Air raksa (Hg) berwujud cair pada suhu ruang.", en_q: "Mercury (Hg) is liquid at room temp.", ans: true },
    { id_q: "Proton bermuatan negatif.", en_q: "Proton has a negative charge.", ans: false },
    { id_q: "Oksigen adalah gas paling melimpah di atmosfer bumi.", en_q: "Oxygen is the most abundant gas in Earth's atmosphere.", ans: false }, 
    { id_q: "Reaksi eksoterm melepaskan energi panas.", en_q: "Exothermic reactions release heat.", ans: true },
    { id_q: "Karat besi adalah contoh reaksi oksidasi.", en_q: "Rusting iron is an oxidation reaction.", ans: true },
    { id_q: "pH larutan asam selalu lebih dari 7.", en_q: "Acidic solutions always have pH > 7.", ans: false },
    { id_q: "Natrium klorida (NaCl) adalah rumus garam dapur.", en_q: "NaCl is table salt.", ans: true },
    { id_q: "Es mencair adalah perubahan kimia.", en_q: "Melting ice is a chemical change.", ans: false },
    { id_q: "Karbon monoksida (CO) beracun bagi manusia.", en_q: "Carbon monoxide is toxic to humans.", ans: true },
    { id_q: "Air adalah pelarut universal.", en_q: "Water is a universal solvent.", ans: true },
    // Space / Astronomy
    { id_q: "Matahari adalah sebuah bintang.", en_q: "The Sun is a star.", ans: true },
    { id_q: "Bumi adalah planet ketiga dari Matahari.", en_q: "Earth is the third planet from the Sun.", ans: true },
    { id_q: "Suara bisa merambat dengan jelas di ruang hampa angkasa.", en_q: "Sound can travel clearly in the vacuum of space.", ans: false },
    { id_q: "Bulan memancarkan cahayanya sendiri.", en_q: "The Moon emits its own light.", ans: false },
    { id_q: "Pluto saat ini diklasifikasikan sebagai planet katai (dwarf planet).", en_q: "Pluto is currently classified as a dwarf planet.", ans: true },
    { id_q: "Venus adalah planet terpanas di tata surya.", en_q: "Venus is the hottest planet in the solar system.", ans: true }
  ],
  essay: [
    // Chemistry
    { id_q: "Tuliskan rumus kimia dari air.", en_q: "Write the chemical formula for water.", ans: ["h2o", "h20"] },
    { id_q: "Apa simbol unsur kimia untuk Emas?", en_q: "What is the chemical symbol for Gold?", ans: ["au"] },
    { id_q: "Zat lakmus biru menjadi merah bersifat...", en_q: "Substance turning blue litmus red is...", ans: ["asam", "acid", "acidic"] },
    { id_q: "Ikatan akibat serah terima elektron disebut...", en_q: "Bond from electron transfer is called...", ans: ["ion", "ikatan ion", "ionic", "ionic bond"] },
    { id_q: "Simbol unsur Besi adalah...", en_q: "Chemical symbol for Iron is...", ans: ["fe"] },
    { id_q: "Apa rumus kimia Karbon Dioksida?", en_q: "Formula for Carbon Dioxide?", ans: ["co2", "co 2"] },
    { id_q: "Pusat dari sebuah atom disebut...", en_q: "The center of an atom is called...", ans: ["inti", "inti atom", "nucleus"] },
    { id_q: "Gas yang kita hirup untuk hidup...", en_q: "Gas we breathe to live...", ans: ["oksigen", "oxygen", "o2"] },
    // Space / Astronomy
    { id_q: "Nama galaksi tempat kita tinggal adalah...", en_q: "The name of our galaxy is...", ans: ["bima sakti", "milky way"] },
    { id_q: "Bintang yang menjadi pusat tata surya kita...", en_q: "The star at the center of our solar system...", ans: ["matahari", "sun"] },
    { id_q: "Satelit alami yang mengelilingi Bumi adalah...", en_q: "The natural satellite orbiting Earth is...", ans: ["bulan", "moon"] },
    { id_q: "Planet terdekat dengan Matahari adalah...", en_q: "The closest planet to the Sun is...", ans: ["merkurius", "mercury"] }
  ],
  matching: [
    // Chemistry
    { id_q: "Jodohkan Unsur/Simbol", en_q: "Match Element/Symbol", pairs: [ { left: "Natrium", right: "Na" }, { left: "Kalium", right: "K" }, { left: "Besi", right: "Fe" }, { left: "Perak", right: "Ag" } ] },
    { id_q: "Jodohkan Istilah", en_q: "Match Terms", pairs: [ { left: "Kation", right: "Positif" }, { left: "Anion", right: "Negatif" }, { left: "Katalis", right: "Cepat" } ] },
    { id_q: "Jodohkan Asam/Basa", en_q: "Match Acid/Base", pairs: [ { left: "HCl", right: "Asam Kuat" }, { left: "NaOH", right: "Basa Kuat" }, { left: "CH3COOH", right: "Asam Lemah" } ] },
    { id_q: "Jodohkan Fase", en_q: "Match Phase", pairs: [ { left: "Solid (s)", right: "Padat" }, { left: "Aqueous (aq)", right: "Larutan" }, { left: "Gas (g)", right: "Gas" } ] },
    // Space / Astronomy
    { id_q: "Jodohkan Planet & Cirinya", en_q: "Match Planet & Trait", pairs: [ { left: "Mars", right: "Si Merah" }, { left: "Jupiter", right: "Terbesar" }, { left: "Bumi", right: "Bisa Dihuni" }, { left: "Saturnus", right: "Bercincin" } ] },
    { id_q: "Jodohkan Objek Angkasa", en_q: "Match Space Objects", pairs: [ { left: "Matahari", right: "Bintang" }, { left: "Bulan", right: "Satelit Alami" }, { left: "Bima Sakti", right: "Galaksi" } ] }
  ]
};

const SKILL_TYPES = [
  { id: 'doubleDmg', name: 'Double Strike', isPassive: false, cd: 3 },
  { id: 'autoCorrect', name: 'Auto-Genius', isPassive: false, cd: 4 },
  { id: 'execute', name: 'Execute (Pasif)', isPassive: true }
];

const ACHIEVEMENTS_LIST = [
  { id: 'first_blood', name: {id:'Darah Pertama', en:'First Blood'}, desc: {id:'Kalahkan musuh pertamamu', en:'Defeat your first enemy'}, icon: '⚔️', check: (s) => s.enemiesDefeated >= 1 },
  { id: 'genius', name: {id:'Jenius Kimia', en:'Chemistry Genius'}, desc: {id:'Jawab 5 pertanyaan berturut-turut benar', en:'Answer 5 questions correctly in a row'}, icon: '🧪', check: (s) => s.maxStreak >= 5 },
  { id: 'collector', name: {id:'Kolektor Sejati', en:'True Collector'}, desc: {id:'Kumpulkan 5 perlengkapan/skill', en:'Collect 5 items/skills'}, icon: '🎒', check: (s) => s.itemsCollected >= 5 },
  { id: 'heavy_hitter', name: {id:'Pukulan Maut', en:'Heavy Hitter'}, desc: {id:'Berikan lebih dari 50 DMG 1x serang', en:'Deal over 50 DMG in a single attack'}, icon: '💥', check: (s) => s.highestDmg >= 50 },
  { id: 'survivor', name: {id:'Penyintas Tangguh', en:'Tough Survivor'}, desc: {id:'Terima 100 DMG tanpa mati', en:'Take 100 DMG without dying'}, icon: '🛡️', check: (s) => s.dmgReceived >= 100 },
];

// --- 🔊 AUDIO ENGINE ---
let audioCtx = null;
let bgmOscillator = null;
let bgmGain = null;

const initAudio = () => { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); };

const playSFX = (type, isMuted) => {
  if (isMuted || !audioCtx) return;
  const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
  osc.connect(gainNode); gainNode.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  
  if (type === 'attack') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  } else if (type === 'hit') {
    osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    gainNode.gain.setValueAtTime(0.4, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now); osc.stop(now + 0.2);
  } else if (type === 'heal' || type === 'buff') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now + 0.1); osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
    gainNode.gain.setValueAtTime(0, now); gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1); gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } else if (type === 'error') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.setValueAtTime(100, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } else if (type === 'victory') {
    osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(554.37, now + 0.1); osc.frequency.setValueAtTime(659.25, now + 0.2); 
    gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.start(now); osc.stop(now + 0.6);
  } else if (type === 'hover') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gainNode.gain.setValueAtTime(0.05, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
    osc.start(now); osc.stop(now + 0.05);
  } else if (type === 'click') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
    osc.start(now); osc.stop(now + 0.05);
  } else if (type === 'equip') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(1000, now); osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now); osc.stop(now + 0.2);
  } else if (type === 'unequip') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
    osc.start(now); osc.stop(now + 0.15);
  } else if (type === 'achievement') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, now); 
    osc.frequency.setValueAtTime(659.25, now + 0.1); 
    osc.frequency.setValueAtTime(783.99, now + 0.2); 
    osc.frequency.setValueAtTime(1046.50, now + 0.3); 
    gainNode.gain.setValueAtTime(0, now); gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    osc.start(now); osc.stop(now + 0.8);
  }
};

export default function App() {
  const [gameState, setGameState] = useState('MENU'); 
  const [showMap, setShowMap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [invFilter, setInvFilter] = useState('Semua');
  const [isMuted, setIsMuted] = useState(true);
  const [isBgmMuted, setIsBgmMuted] = useState(true);
  const [lang, setLang] = useState('id'); 

  const t = (key) => DICT[lang][key] || key;

  const loc = (obj) => {
    if (!obj) return "";
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.id || "";
  };

  const [animState, setAnimState] = useState({ player: '', enemy: '' });
  const [floatingTexts, setFloatingTexts] = useState([]); 
  const [alchemistHint, setAlchemistHint] = useState(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // --- ACHIEVEMENT POPUP QUEUE ---
  const [unlockedAchs, setUnlockedAchs] = useState([]);
  const [achQueue, setAchQueue] = useState([]);
  const [activePopup, setActivePopup] = useState(null);

  const [player, setPlayer] = useState({
    name: 'Pahlawan', skin: '#f1c27d', hairColor: '#2b2b2b', hairStyle: 'Short', eyeColor: '#3d2210',
    outfitStyle: 'Tunic', outfitColor: '#b48e65', className: 'Warrior', color: '#3b82f6',
    baseHp: 120, baseMaxHp: 120, baseDmg: 15, hp: 120, battleDmg: 0, skills: [], 
    inventory: [], equipment: { Senjata: null, 'Baju Besi': null, Aksesori: null }
  });

  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [enemy, setEnemy] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const [qPools, setQPools] = useState({ mcq: [], tf: [], essay: [], matching: [] });
  const [currentQuestion, setCurrentQuestion] = useState(null); 
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const [essayAnswer, setEssayAnswer] = useState("");
  const [matchingState, setMatchingState] = useState({ left: [], right: [], selectedL: null, selectedR: null, matched: [] });

  const [droppedItems, setDroppedItems] = useState([]);
  const [droppedSkill, setDroppedSkill] = useState(null);
  
  const [screenFlash, setScreenFlash] = useState(null);
  const [screenShake, setScreenShake] = useState(false);

  const [cooldowns, setCooldowns] = useState({});
  const [activeBuffs, setActiveBuffs] = useState({ doubleDmg: false, autoCorrect: false, tankBlock: false, assassinDodge: false, warrior15x: false, mage3x: false });

  const [stats, setStats] = useState({ qAnswered: 0, qCorrect: 0, qWrong: 0, dmgDealt: 0, dmgReceived: 0, highestDmg: 0, currentStreak: 0, maxStreak: 0, enemiesDefeated: 0, itemsCollected: 0, skillsUsed: 0 });
  
  const logContainerRef = useRef(null);
  const bgmRef = useRef(null);

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  useEffect(() => { if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; }, [logs]);
  
  // Audio Initialization & MP3 Loop
  useEffect(() => {
    // Kita panggil langsung dari root public (/bgm.mp3)
    bgmRef.current = new Audio('/bgm.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.3; // Volume BGM diatur 30% agar tidak menutupi SFX
    
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.src = "";
      }
    };
  }, []);

  // BGM Play/Pause logic based on Game State & Mute
  useEffect(() => {
    if (!bgmRef.current) return;
    
    // Mainkan musik kapan pun selama tidak di-mute
    if (!isBgmMuted) {
      // Kita harus "menangkap" Promise dari play() untuk mencegah error Autoplay Policy
      const playPromise = bgmRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay diblokir oleh browser. Pengguna harus mengklik halaman terlebih dahulu.", error);
          // Jika browser memblokir, kita otomatis matikan toggle agar tidak terjadi bug UI
          setIsBgmMuted(true);
        });
      }
    } else {
      bgmRef.current.pause();
    }
  }, [gameState, isBgmMuted]);

  useEffect(() => {
    if (achQueue.length > 0 && !activePopup) {
      const nextAch = achQueue[0];
      setActivePopup(nextAch);
      playSFX('achievement', isMuted);
      setTimeout(() => { setActivePopup(null); setAchQueue(prev => prev.slice(1)); }, 4000); 
    }
  }, [achQueue, activePopup, isMuted]);

  const handleAudioToggle = () => { initAudio(); playSFX('click', !isMuted); setIsMuted(!isMuted); };
  const handleBgmToggle = () => { setIsBgmMuted(!isBgmMuted); playSFX('click', isMuted); };
  const handleHover = () => playSFX('hover', isMuted);
  const handleClick = () => playSFX('click', isMuted);

  const getTotalStats = (currentPlayer = player) => {
    let equipBonusHp = 0; let equipBonusDmg = 0;
    Object.values(currentPlayer.equipment).forEach(item => { if (item && item.stats) { equipBonusHp += (item.stats.hp || 0); equipBonusDmg += (item.stats.dmg || 0); } });
    return { maxHp: currentPlayer.baseMaxHp + equipBonusHp, dmg: currentPlayer.baseDmg + equipBonusDmg + (currentPlayer.battleDmg || 0) };
  };
  const totalStats = getTotalStats(player);

  const addFloatingText = (target, text, type) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, target, text, type }]);
    setTimeout(() => { setFloatingTexts(prev => prev.filter(ft => ft.id !== id)); }, 1500); 
  };

  const spawnParticles = (target, type) => {
    const particles = [];
    const count = 8;
    for(let i=0; i<count; i++) {
       const tx = (Math.random() - 0.5) * 200;
       const ty = (Math.random() - 0.5) * 200 - 50; 
       const id = Date.now() + Math.random();
       particles.push({ id, target, text: type === 'blood' ? '🩸' : '✨', type: 'particle', tx, ty });
    }
    setFloatingTexts(prev => [...prev, ...particles]);
    setTimeout(() => { setFloatingTexts(prev => prev.filter(ft => !particles.find(p => p.id === ft.id))); }, 600);
  };

  const triggerBossTaunt = async (enemyData, playerData) => {
    if (enemyData.type === 'Kroco' || enemyData.type === 'Penjaga') return; 
    const prompt = `Anda adalah ${enemyData.name}. Berikan SATU kalimat ejekan (maksimal 15 kata) kepada ${playerData.name}. Bahasa: ${lang === 'id' ? 'Indonesia' : 'English'}.`;
    const taunt = await fetchWithBackoff(prompt);
    if (taunt) addLog(`🗣️ ${enemyData.name}: "${taunt.replace(/"/g, '').trim()}"`, 'error');
  };

  const getAlchemistHint = async () => {
    if (!currentQuestion) return;
    setIsHintLoading(true); playSFX('buff', isMuted);
    let qText = lang === 'id' ? currentQuestion.data.id_q : currentQuestion.data.en_q;
    if (currentQuestion.type === 'matching') qText = lang === 'id' ? "Jodohkan istilah kimia/astronomi ini." : "Match these chemical/astronomy terms.";
    const prompt = `Sebagai ilmuwan, berikan 1 kalimat petunjuk (maks 20 kata) tanpa menyebut jawaban langsung. Pertanyaan: "${qText}". Bahasa: ${lang === 'id' ? 'Indonesia' : 'English'}.`;
    const hint = await fetchWithBackoff(prompt);
    if (hint) { setAlchemistHint(hint.replace(/"/g, '').trim()); playSFX('heal', isMuted); } 
    else { setAlchemistHint(lang==='id'?"Koneksi terganggu...":"Connection disrupted..."); playSFX('error', isMuted); }
    setIsHintLoading(false);
  };

  const startGame = (playerData) => {
    initAudio(); handleClick();
    const pClass = CLASSES[playerData.className];
    setPlayer({ 
      ...playerData, baseMaxHp: pClass.maxHp, hp: pClass.maxHp, baseDmg: pClass.dmg, color: pClass.color, 
      skills: [], battleDmg: 0, inventory: [], equipment: { Senjata: null, 'Baju Besi': null, Aksesori: null }
    });
    
    setQPools({
      mcq: shuffleArray([...QUESTIONS_DB.mcq]),
      tf: shuffleArray([...QUESTIONS_DB.tf]),
      essay: shuffleArray([...QUESTIONS_DB.essay]),
      matching: shuffleArray([...QUESTIONS_DB.matching])
    });

    setCurrentEnemyIndex(0); const firstEnemy = ENEMIES[0]; setEnemy({ ...firstEnemy });
    setLogs([{ text: `⚔️ ${t('startAdv')}!`, type: 'normal' }]);
    triggerBossTaunt(firstEnemy, playerData); 
    setCooldowns({ classSkill: 0, doubleDmg: 0, autoCorrect: 0 });
    setActiveBuffs({ tankBlock: false, assassinDodge: false, warrior15x: false, mage3x: false, doubleDmg: false, autoCorrect: false });
    setStats({ qAnswered: 0, qCorrect: 0, qWrong: 0, dmgDealt: 0, dmgReceived: 0, highestDmg: 0, currentStreak: 0, maxStreak: 0, enemiesDefeated: 0, itemsCollected: 0, skillsUsed: 0 });
    setUnlockedAchs([]); setAchQueue([]); setActivePopup(null);
    setDroppedItems([]);
    setGameState('BATTLE');
  };

  const addLog = (msg, type = 'normal') => setLogs(prev => [...prev, { text: msg, type }]);
  
  const updateStat = (key, valueOrFn) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, [key]: typeof valueOrFn === 'function' ? valueOrFn(prevStats[key]) : valueOrFn };
      ACHIEVEMENTS_LIST.forEach(ach => {
        if (ach.check(newStats) && !unlockedAchs.includes(ach.id)) {
           setUnlockedAchs(p => [...p, ach.id]); setAchQueue(p => [...p, ach]);
        }
      });
      return newStats;
    });
  };

  const pickQuestion = () => {
    const roll = Math.random(); let type = 'mcq';
    if (roll < 0.25) type = 'tf'; else if (roll < 0.5) type = 'essay'; else if (roll < 0.75) type = 'matching';

    if (qPools[type].length === 0) {
      if (qPools.mcq.length > 0) type = 'mcq'; 
      else if (qPools.tf.length > 0) type = 'tf';
      else if (qPools.essay.length > 0) type = 'essay';
      else if (qPools.matching.length > 0) type = 'matching';
      else {
        setQPools({ mcq: shuffleArray([...QUESTIONS_DB.mcq]), tf: shuffleArray([...QUESTIONS_DB.tf]), essay: shuffleArray([...QUESTIONS_DB.essay]), matching: shuffleArray([...QUESTIONS_DB.matching]) });
        type = 'mcq';
      }
    }
    const qList = [...qPools[type]]; const nextQ = qList.pop();
    setQPools(prev => ({ ...prev, [type]: qList })); return { type, data: nextQ };
  };

  const triggerAttack = () => {
    handleClick();
    if (activeBuffs.autoCorrect) { addLog("✨ Auto-Genius!", "buff"); setActiveBuffs(prev => ({...prev, autoCorrect: false})); processPlayerAttack(true); return; }
    const newQ = pickQuestion(); setCurrentQuestion(newQ); setAlchemistHint(null); setEssayAnswer("");
    if (newQ.type === 'matching') {
       const lefts = shuffleArray(newQ.data.pairs.map(p => p.left)); const rights = shuffleArray(newQ.data.pairs.map(p => p.right));
       setMatchingState({ left: lefts, right: rights, selectedL: null, selectedR: null, matched: [] });
    }
    setShowQuestionModal(true);
  };

  const resolveQuestion = (isCorrect) => {
    setShowQuestionModal(false); updateStat('qAnswered', v => v + 1);
    if (isCorrect) { updateStat('qCorrect', v => v + 1); updateStat('currentStreak', v => { const ns = v + 1; updateStat('maxStreak', m => Math.max(m, ns)); return ns; }); } 
    else { updateStat('qWrong', v => v + 1); updateStat('currentStreak', 0); playSFX('error', isMuted); }
    processPlayerAttack(isCorrect);
  };

  const handleMcqTfAnswer = (ans) => { handleClick(); resolveQuestion(ans === currentQuestion.data.ans); };
  const handleEssaySubmit = (e) => {
    e.preventDefault(); handleClick(); const cleanAns = essayAnswer.trim().toLowerCase();
    const isCorrect = currentQuestion.data.ans.some(a => cleanAns === a.toLowerCase()); resolveQuestion(isCorrect);
  };

  const handleMatchingClick = (side, val) => {
    setMatchingState(prev => {
       const newState = { ...prev, [side === 'left' ? 'selectedL' : 'selectedR']: val };
       if (newState.selectedL && newState.selectedR) {
          const isValid = currentQuestion.data.pairs.some(p => p.left === newState.selectedL && p.right === newState.selectedR);
          if (isValid) {
             playSFX('buff', isMuted); newState.matched = [...newState.matched, newState.selectedL, newState.selectedR]; newState.selectedL = null; newState.selectedR = null;
             if (newState.matched.length === currentQuestion.data.pairs.length * 2) { setTimeout(() => resolveQuestion(true), 500); }
          } else { playSFX('error', isMuted); newState.selectedL = null; newState.selectedR = null; }
       }
       return newState;
    });
  };

  const processPlayerAttack = (isCorrect) => {
    if (!isCorrect) { addLog("❌ Miss!", "error"); setTimeout(() => processEnemyTurn(), 1000); return; }

    let currentBaseDmg = totalStats.dmg; let finalDmg = currentBaseDmg; let logMsg = `💥 ${finalDmg} DMG!`; let isCrit = false;

    if (activeBuffs.mage3x) { finalDmg = currentBaseDmg * 3; logMsg = `🔮 MAGIC! ${finalDmg} DMG!`; setActiveBuffs(prev => ({...prev, mage3x: false})); isCrit = true;} 
    else if (activeBuffs.warrior15x) {
      finalDmg = Math.floor(currentBaseDmg * 1.5); logMsg = `🗡️ HEROIC! ${finalDmg} DMG!`; isCrit = true;
      const healAmt = Math.floor(totalStats.maxHp * 0.1); setPlayer(p => ({...p, hp: Math.min(totalStats.maxHp, p.hp + healAmt)}));
      addFloatingText('player', `+${healAmt}`, 'heal'); playSFX('heal', isMuted); setActiveBuffs(prev => ({...prev, warrior15x: false}));
    } 
    else if (activeBuffs.doubleDmg) { finalDmg *= 2; logMsg = `⚡ DOUBLE! ${finalDmg} DMG!`; setActiveBuffs(prev => ({...prev, doubleDmg: false})); isCrit = true; }

    const hasExecute = player.skills.some(s => s.id === 'execute');
    if (hasExecute && Math.random() < 0.10) { addLog(`☠️ EXECUTE!`, "victory"); finalDmg = enemy.hp; isCrit = true; }

    setAnimState(prev => ({...prev, player: 'transform -translate-y-12 scale-110 transition-transform duration-100 ease-in'})); playSFX('attack', isMuted);
    
    setTimeout(() => {
      setAnimState(prev => ({...prev, player: 'transition-transform duration-300 ease-out'}));
      setAnimState(prev => ({...prev, enemy: 'animate-shake filter brightness-150 drop-shadow-[0_0_30px_red]'})); playSFX('hit', isMuted);
      
      setScreenFlash('white');
      setScreenShake(true);

      addFloatingText('enemy', `-${finalDmg}`, isCrit ? 'crit' : 'damage'); 
      spawnParticles('enemy', 'sparkle');
      
      addLog(logMsg, "success"); updateStat('dmgDealt', v => v + finalDmg); updateStat('highestDmg', v => Math.max(v, finalDmg));

      setTimeout(() => {
         setScreenFlash(null); setScreenShake(false);
         setAnimState(prev => ({...prev, enemy: 'transition-all duration-300'})); 
         const newEnemyHp = enemy.hp - finalDmg;
         if (newEnemyHp <= 0) {
           setEnemy(prev => ({ ...prev, hp: 0 })); playSFX('victory', isMuted); updateStat('enemiesDefeated', v => v + 1); 
           const healPercent = Math.floor(Math.random() * 16) + 5; 
           const rngHeal = Math.floor(totalStats.maxHp * (healPercent / 100));
           setPlayer(p => ({...p, hp: Math.min(totalStats.maxHp, p.hp + rngHeal)}));
           addFloatingText('player', `+${rngHeal} HP`, 'heal'); addLog(`✨ Pulih ${rngHeal} HP.`, 'buff');
           setTimeout(() => handleEnemyDeath(), 1200);
         } else { setEnemy(prev => ({ ...prev, hp: newEnemyHp })); setTimeout(() => processEnemyTurn(), 1000); }
      }, 300);
    }, 150);
  };

  const processEnemyTurn = () => {
    const damage = enemy.dmg;
    if (activeBuffs.tankBlock) { 
      setActiveBuffs(prev => ({...prev, tankBlock: false})); addFloatingText('player', 'BLOCKED', 'buff'); playSFX('buff', isMuted); resolveEnemyTurnCooldowns(); return;
    } 
    else if (activeBuffs.assassinDodge) { 
      setActiveBuffs(prev => ({...prev, assassinDodge: false})); addFloatingText('player', 'DODGE', 'buff');
      setAnimState(prev => ({...prev, player: 'transform translate-x-12 opacity-50 transition-all duration-200'})); playSFX('attack', isMuted); 
      setTimeout(() => setAnimState(prev => ({...prev, player: 'transition-all duration-300'})), 300); resolveEnemyTurnCooldowns(); return;
    } 
    
    setAnimState(prev => ({...prev, enemy: 'transform translate-y-12 scale-110 transition-transform duration-100 ease-in'})); playSFX('attack', isMuted);

    setTimeout(() => {
      setAnimState(prev => ({...prev, enemy: 'transition-transform duration-300 ease-out'}));
      setAnimState(prev => ({...prev, player: 'animate-shake filter sepia hue-rotate-[300deg] saturate-[5] drop-shadow-[0_0_30px_red]'})); 
      playSFX('hit', isMuted);
      
      setScreenFlash('red');
      setScreenShake(true);

      addFloatingText('player', `-${damage}`, 'damage');
      spawnParticles('player', 'blood');
      
      addLog(`🩸 -${damage} DMG.`, "damage"); updateStat('dmgReceived', v => v + damage);
      
      setTimeout(() => {
        setScreenFlash(null); setScreenShake(false);
        setAnimState(prev => ({...prev, player: 'transition-all duration-300'}));
        const newHp = player.hp - damage; 
        if (newHp <= 0) { setPlayer(prev => ({ ...prev, hp: 0 })); setGameState('LOSE'); } 
        else { setPlayer(prev => ({ ...prev, hp: newHp })); resolveEnemyTurnCooldowns(); }
      }, 300);
    }, 150);
  };

  const resolveEnemyTurnCooldowns = () => { setCooldowns(prev => { const newCd = {...prev}; Object.keys(newCd).forEach(k => { if (newCd[k] > 0) newCd[k]--; }); return newCd; }); }

  const handleEnemyDeath = () => {
    if (currentEnemyIndex === ENEMIES.length - 1) { setGameState('WIN'); return; }
    setPlayer(p => ({...p, battleDmg: 0}));
    setActiveBuffs({ tankBlock: false, assassinDodge: false, warrior15x: false, mage3x: false, doubleDmg: false, autoCorrect: false });
    
    const availableItems = ITEMS_DATABASE.filter(item => item.minTier <= currentEnemyIndex);
    const dropCount = enemy.type === 'Raja Iblis' ? 3 : (enemy.type === 'Komando' ? 2 : 1);
    const drops = [];
    for (let i = 0; i < dropCount; i++) {
       if (availableItems.length > 0) {
          const dropped = availableItems[Math.floor(Math.random() * availableItems.length)];
          drops.push({ ...dropped, instanceId: Math.random().toString(36).substr(2, 9) });
       }
    }
    setDroppedItems(drops);
    
    if (enemy.type !== 'Kroco') {
      const avail = SKILL_TYPES.filter(s => !player.skills.some(ps => ps.id === s.id));
      setDroppedSkill(avail.length > 0 ? avail[Math.floor(Math.random() * avail.length)] : null);
    } else { setDroppedSkill(null); }

    setGameState('REWARD');
  };

  const collectLootAndProceed = (learnSkill = false) => {
    handleClick(); updateStat('itemsCollected', v => v + droppedItems.length);
    const newInventory = [...player.inventory, ...droppedItems]; let newSkills = player.skills;
    if (learnSkill && droppedSkill) { newSkills = [...player.skills, droppedSkill]; }
    setPlayer(prev => ({ ...prev, inventory: newInventory, skills: newSkills })); 
    
    const nextIdx = currentEnemyIndex + 1; const nextEnemy = ENEMIES[nextIdx];
    setCurrentEnemyIndex(nextIdx); setEnemy({ ...nextEnemy });
    setLogs(prev => [...prev, { text: `\n--- ${nextEnemy.type.toUpperCase()} ---`, type: 'normal' }]);
    triggerBossTaunt(nextEnemy, player); setGameState('BATTLE');
  };

  const triggerClassSkill = () => {
    handleClick(); if (cooldowns.classSkill > 0) return;
    setCooldowns(prev => ({...prev, classSkill: CLASSES[player.className].classSkill.cd})); updateStat('skillsUsed', v => v + 1); playSFX('buff', isMuted);
    
    switch (player.className) {
      case 'Warrior': setActiveBuffs(prev => ({...prev, warrior15x: true})); addFloatingText('player', 'HEROIC STRIKE', 'buff'); break;
      case 'Tank': setActiveBuffs(prev => ({...prev, tankBlock: true})); addFloatingText('player', 'DEFENSE UP', 'buff'); break;
      case 'Assassin':
        const instDmg = Math.floor(totalStats.dmg * 0.5); setActiveBuffs(prev => ({...prev, assassinDodge: true})); updateStat('dmgDealt', v => v + instDmg); updateStat('highestDmg', v => Math.max(v, instDmg));
        setAnimState(prev => ({...prev, player: 'transform -translate-y-12 scale-110 opacity-70 transition-all duration-100'}));
        setTimeout(() => {
          setAnimState(prev => ({...prev, player: 'transition-all duration-300'})); setAnimState(prev => ({...prev, enemy: 'animate-shake filter brightness-150 drop-shadow-[0_0_30px_red]'})); playSFX('hit', isMuted);
          addFloatingText('enemy', `-${instDmg}`, 'damage');
          setTimeout(() => {
            setAnimState(prev => ({...prev, enemy: 'transition-all duration-300'})); const evEnemyHp = enemy.hp - instDmg;
            if(evEnemyHp <= 0) { setEnemy(prev => ({ ...prev, hp: 0 })); updateStat('enemiesDefeated', v => v + 1); setTimeout(() => handleEnemyDeath(), 1000); } 
            else { setEnemy(prev => ({ ...prev, hp: evEnemyHp })); }
          }, 300);
        }, 150); break;
      case 'Mage':
        const hpCost = Math.floor(totalStats.maxHp * 0.15);
        if (player.hp <= hpCost) { setCooldowns(prev => ({...prev, classSkill: 0})); playSFX('error', isMuted); return; }
        setPlayer(p => ({...p, hp: p.hp - hpCost})); setActiveBuffs(prev => ({...prev, mage3x: true})); 
        addFloatingText('player', `-${hpCost}`, 'damage'); addFloatingText('player', 'BLOOD MAGIC', 'buff'); break;
      case 'Paladin':
        const paladinHeal = Math.floor(totalStats.maxHp * 0.3); setPlayer(p => ({...p, hp: Math.min(totalStats.maxHp, p.hp + paladinHeal)})); 
        addFloatingText('player', `+${paladinHeal}`, 'heal'); playSFX('heal', isMuted); break;
      case 'Berserker':
        setPlayer(p => ({...p, hp: p.hp - 10, battleDmg: p.battleDmg + 5})); updateStat('dmgReceived', v => v + 10);
        addFloatingText('player', '-10', 'damage'); addFloatingText('player', 'RAMPAGE', 'buff');
        if (player.hp - 10 <= 0) setGameState('LOSE'); break;
    }
  };

  const activateGeneralSkill = (skillId) => {
    handleClick(); if (cooldowns[skillId] > 0) return;
    setCooldowns(prev => ({...prev, [skillId]: SKILL_TYPES.find(x => x.id === skillId).cd})); updateStat('skillsUsed', v => v + 1); playSFX('buff', isMuted);
    if (skillId === 'doubleDmg') { setActiveBuffs(prev => ({...prev, doubleDmg: true})); addFloatingText('player', 'DOUBLE DMG', 'buff'); }
    else if (skillId === 'autoCorrect') { setActiveBuffs(prev => ({...prev, autoCorrect: true})); addFloatingText('player', 'AUTO-GENIUS', 'buff');}
  };

  const equipItem = (item) => {
    playSFX('equip', isMuted);
    const slot = item.type; const currentEquipped = player.equipment[slot];
    let newInventory = player.inventory.filter(i => i.instanceId !== item.instanceId); let newEquipment = { ...player.equipment };
    if (currentEquipped) newInventory.push(currentEquipped);
    newEquipment[slot] = item;
    const newMaxHp = getTotalStats({ ...player, equipment: newEquipment }).maxHp;
    setPlayer({ ...player, inventory: newInventory, equipment: newEquipment, hp: Math.min(player.hp, newMaxHp) });
  };

  const unequipItem = (slotKey) => {
    const item = player.equipment[slotKey]; if (!item) return; playSFX('unequip', isMuted); 
    let newEquipment = { ...player.equipment, [slotKey]: null };
    const newMaxHp = getTotalStats({ ...player, equipment: newEquipment }).maxHp;
    setPlayer({ ...player, inventory: [...player.inventory, item], equipment: newEquipment, hp: Math.min(player.hp, newMaxHp) });
  };

  // --- UI COMPONENTS ---
  const Avatar = ({ p, size = "100%", animated = false }) => {
    const skin = p.skin || "#f1c27d"; const hair = p.hairColor || "#2b2b2b"; const eye = p.eyeColor || "#3d2210"; const outfit = p.outfitColor || "#b48e65";
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={`${animated ? 'animate-float drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]' : 'drop-shadow-xl'} transition-transform duration-500`} style={{ overflow: 'visible' }}>
        {p.className === 'Berserker' && ( <g transform="translate(68, 25) rotate(15)"><rect x="0" y="0" width="4" height="60" fill="#451a03" rx="2" /><path d="M 2 10 Q 15 0 2 20 Z" fill="#94a3b8" /><path d="M 2 10 Q -11 0 2 20 Z" fill="#94a3b8" /></g> )}
        <rect x="38" y="70" width="10" height="18" rx="4" fill={skin} /> <rect x="52" y="70" width="10" height="18" rx="4" fill={skin} /> <rect x="23" y="45" width="10" height="20" rx="4" fill={skin} />
        {p.className === 'Tank' && ( <g transform="translate(15, 42)"><rect x="0" y="0" width="18" height="30" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" /><path d="M 9 0 L 9 30" stroke="#334155" strokeWidth="2" /></g> )}
        {p.outfitStyle === 'Armor' && ( <g><rect x="34" y="40" width="32" height="32" rx="4" fill={skin} /><rect x="34" y="40" width="32" height="32" rx="4" fill={outfit} stroke="#64748b" strokeWidth="2" /><rect x="40" y="45" width="20" height="10" fill="#94a3b8" rx="2" /></g> )}
        {p.outfitStyle === 'Robe' && ( <g><rect x="34" y="40" width="32" height="32" rx="4" fill={skin} /><path d="M 32 40 L 68 40 L 72 80 L 28 80 Z" fill={outfit} /></g> )}
        {p.outfitStyle === 'Tunic' && ( <g><rect x="34" y="40" width="32" height="32" rx="4" fill={skin} /><rect x="34" y="40" width="32" height="20" rx="3" fill={outfit} /></g> )}
        <circle cx="50" cy="26" r="16" fill={skin} /> <circle cx="44" cy="24" r="2.5" fill={eye} /> <circle cx="56" cy="24" r="2.5" fill={eye} />
        <path d="M 46 31 Q 50 34 54 31" stroke={eye} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {p.hairStyle === 'Spiky' && (<path d="M 34 20 L 40 5 L 46 15 L 52 4 L 58 15 L 64 6 L 66 20 Z" fill={hair} />)}
        {p.hairStyle === 'Short' && (<path d="M 34 22 Q 50 2 66 22 Q 62 10 50 10 Q 38 10 34 22 Z" fill={hair} />)}
        {p.hairStyle === 'Long' && (<path d="M 32 25 Q 50 0 68 25 L 70 45 Q 60 40 68 25 Q 50 15 32 25 L 30 45 Q 40 40 32 25 Z" fill={hair} />)}
        <rect x="67" y="45" width="10" height="20" rx="4" fill={skin} />
        {p.className === 'Warrior' && ( <g transform="translate(71, 35) rotate(15)"><rect x="0" y="20" width="4" height="8" fill="#78350f" /><rect x="-3" y="18" width="10" height="2" fill="#475569" /><rect x="0" y="-10" width="4" height="28" fill="#cbd5e1" rx="1" /><path d="M 0 -10 L 2 -15 L 4 -10 Z" fill="#cbd5e1" /></g> )}
        {p.className === 'Mage' && ( <g transform="translate(73, 20) rotate(10)"><rect x="0" y="0" width="3" height="40" fill="#78350f" rx="1" /><circle cx="1.5" cy="-2" r="5" fill="#a855f7" className="animate-pulse" /></g> )}
        {p.className === 'Assassin' && ( <g transform="translate(73, 48) rotate(-30)"><rect x="0" y="5" width="2" height="5" fill="#475569" /><rect x="-1.5" y="3" width="5" height="2" fill="#1e293b" /><path d="M 0 3 L 1 -10 L 2 3 Z" fill="#cbd5e1" /></g> )}
        {p.className === 'Paladin' && ( <g transform="translate(71, 35) rotate(10)"><rect x="0" y="10" width="4" height="15" fill="#d4d4d8" /><rect x="-4" y="0" width="12" height="10" fill="#fbbf24" rx="2" /></g> )}
        {p.className === 'Tank' && ( <g transform="translate(72, 45) rotate(20)"><rect x="0" y="0" width="3" height="15" fill="#78350f" /><circle cx="1.5" cy="0" r="4" fill="#94a3b8" /></g> )}
      </svg>
    );
  };

  const getRarityColor = (rarity) => {
    if (rarity === 'Biasa') return 'text-slate-400 border-slate-600 bg-slate-900/50';
    if (rarity === 'Langka') return 'text-blue-400 border-blue-600 bg-blue-900/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
    if (rarity === 'Epik') return 'text-purple-400 border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
    if (rarity === 'Legendaris') return 'text-orange-400 border-orange-500 bg-orange-900/20 shadow-[0_0_20px_rgba(249,115,22,0.5)]';
    return 'text-slate-400';
  }

  const StatCard = ({ icon, title, value, colorClass = "text-white" }) => (
    <div className="bg-[#111]/80 backdrop-blur-sm border border-[#333] p-4 md:p-5 rounded-2xl flex flex-col items-start gap-1 md:gap-2 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:border-slate-500 transition-all duration-300 ease-out group">
      <div className="text-2xl md:text-3xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className={`font-black text-xl md:text-3xl mt-1 drop-shadow-md ${colorClass}`}>{value}</div>
      <div className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 tracking-wider">{title}</div>
    </div>
  );

  // --- RENDERS ---

  if (gameState === 'MENU') {
    return (
      <div className="absolute inset-0 bg-[#050505] text-white flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505] animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col items-center animate-pop-in px-4 w-full">
          <div className="text-5xl md:text-7xl mb-4 animate-float"><FlaskIcon /></div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-400 mb-2 md:mb-4 tracking-widest drop-shadow-[0_10px_10px_rgba(234,88,12,0.5)] uppercase animate-shine bg-[length:200%_auto] text-center">
            Chem Legend Of RPG
          </h1>
          <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 md:mb-12 drop-shadow-md text-center">
            GAME MADE BY IRDY(25) dan FALAN(09)
          </div>
          <div className="flex flex-col gap-4 w-full max-w-sm px-4 md:px-0">
            <button onMouseEnter={handleHover} onClick={() => {handleClick(); setGameState('CUSTOMIZATION');}} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl md:text-2xl py-4 md:py-5 rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.4)] transition-all duration-300 transform hover:-translate-y-2 active:scale-95 uppercase tracking-widest flex justify-center items-center gap-3">
              <Play size={20} /> {t('play')}
            </button>
            <div className="bg-[#111]/80 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-[#333] flex flex-col gap-3 md:gap-4 shadow-xl mt-2 md:mt-4">
              <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1"><Settings size={14}/> {t('settings')}</div>
              
              <button onMouseEnter={handleHover} onClick={handleAudioToggle} className="flex justify-between items-center w-full bg-[#1a1a1a] hover:bg-[#222] p-3 md:p-4 rounded-xl border border-[#333] transition-all group active:scale-95">
                <span className="font-bold text-xs md:text-sm text-slate-300 group-hover:text-white">{isMuted ? t('sfxOff') : t('sfxOn')}</span>
                {isMuted ? <VolumeX className="text-red-500" size={18}/> : <Volume2 className="text-green-500 animate-pulse" size={18}/>}
              </button>

              <button onMouseEnter={handleHover} onClick={handleBgmToggle} className="flex justify-between items-center w-full bg-[#1a1a1a] hover:bg-[#222] p-3 md:p-4 rounded-xl border border-[#333] transition-all group active:scale-95">
                <span className="font-bold text-xs md:text-sm text-slate-300 group-hover:text-white">{isBgmMuted ? t('bgmOff') : t('bgmOn')}</span>
                {isBgmMuted ? <VolumeX className="text-red-500" size={18}/> : <Volume2 className="text-blue-400 animate-pulse" size={18}/>}
              </button>

              <button onMouseEnter={handleHover} onClick={() => {handleClick(); setLang(lang === 'id' ? 'en' : 'id')}} className="flex justify-between items-center w-full bg-[#1a1a1a] hover:bg-[#222] p-3 md:p-4 rounded-xl border border-[#333] transition-all group active:scale-95">
                <span className="font-bold text-xs md:text-sm text-slate-300 group-hover:text-white">{t('lang')}</span>
                <span className="font-black text-xs md:text-sm text-blue-400 flex items-center gap-2"><Globe size={16}/> {lang === 'id' ? 'Indonesia' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'CUSTOMIZATION') {
    const maxPossibleHp = Math.max(...Object.values(CLASSES).map(c => c.maxHp));
    const maxPossibleDmg = Math.max(...Object.values(CLASSES).map(c => c.dmg));

    return (
      <div className="absolute inset-0 flex flex-col bg-[#0a0f1a] text-white p-4 md:p-6 font-sans overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#050505] to-[#1e1b4b] animate-gradient-xy"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>
        
        <div className="w-full flex justify-between items-center mb-4 z-20 shrink-0 max-w-6xl mx-auto">
           <button onMouseEnter={handleHover} onClick={() => {handleClick(); setGameState('MENU')}} className="flex items-center gap-2 bg-[#1e293b]/80 backdrop-blur-md border border-slate-700 px-3 md:px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 font-bold text-[10px] md:text-xs uppercase tracking-widest">
             {t('back')}
           </button>
           <button onClick={handleAudioToggle} className="flex items-center gap-2 bg-[#1e293b]/80 backdrop-blur-md border border-slate-700 px-3 md:px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95">
             {isMuted ? <VolumeX size={14} className="text-red-400"/> : <Volume2 size={14} className="text-green-400 animate-pulse"/>}
             <span className="font-bold text-[10px] uppercase tracking-widest hidden sm:block">{isMuted ? 'Suara Mati' : 'Suara Nyala'}</span>
           </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-6xl mx-auto z-10 animate-pop-in min-h-0">
          <div className="w-full md:w-[320px] lg:w-[400px] bg-[#0d1323]/90 backdrop-blur-xl border border-slate-800/80 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col items-center shadow-2xl relative overflow-y-auto custom-scrollbar group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-slate-400 tracking-[0.2em] text-[9px] md:text-[10px] font-bold uppercase mb-4 md:mb-6 relative z-10">{t('prep')}</h2>
            
            <div className="mb-2 md:mb-4 relative z-10 shrink-0 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40">
               <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
               <Avatar p={player} animated={true} />
            </div>
            
            <input type="text" value={player.name} onChange={(e) => setPlayer({...player, name: e.target.value})} className="bg-transparent text-white text-center border-b border-slate-700 focus:border-orange-500 focus:outline-none p-1 md:p-2 text-xl md:text-2xl font-black w-3/4 transition-colors duration-300 relative z-10 mb-2 shrink-0" placeholder={t('namePh')}/>
            
            <div className="flex items-center gap-2 mb-4 md:mb-6 relative z-10 shrink-0">
              <span className="text-base md:text-lg">{CLASSES[player.className].icon}</span>
              <span className="text-[#a855f7] font-bold text-sm md:text-base drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{player.className}</span>
            </div>
            
            <div className="w-full space-y-3 md:space-y-4 relative z-10 shrink-0">
               <div>
                 <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-bold mb-1"><span>HP</span><span className="text-slate-300">{CLASSES[player.className].maxHp}</span></div>
                 <div className="h-1.5 w-full bg-[#161f36] rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{width: `${(CLASSES[player.className].maxHp / maxPossibleHp) * 100}%`}}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-bold mb-1"><span>Damage</span><span className="text-slate-300">{CLASSES[player.className].dmg}</span></div>
                 <div className="h-1.5 w-full bg-[#161f36] rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-red-600 to-orange-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,115,22,0.8)]" style={{width: `${(CLASSES[player.className].dmg / maxPossibleDmg) * 100}%`}}></div></div>
               </div>
            </div>
            <div className="mt-4 md:mt-6 text-slate-500 italic text-[10px] md:text-xs text-center relative z-10 shrink-0">{loc(CLASSES[player.className].desc)}</div>
          </div>

          <div className="flex-1 bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 shadow-2xl flex flex-col min-h-0">
            <h2 className="text-lg md:text-2xl font-black text-white mb-4 md:mb-6 shrink-0">{t('settings')}</h2>
            <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto pr-2 md:pr-4 custom-scrollbar min-h-0">
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">{t('class')}</label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                  {Object.keys(CLASSES).map(k => (
                    <button key={k} onMouseEnter={handleHover} onClick={() => {playSFX('attack', isMuted); setPlayer({...player, className: k, color: CLASSES[k].color});}} className={`p-2 md:p-3 rounded-lg md:rounded-xl flex flex-col items-center justify-center gap-1 md:gap-2 transition-all duration-300 border-2 hover:-translate-y-1 ${player.className === k ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_5px_15px_rgba(59,130,246,0.2)]' : 'bg-[#1e293b] border-transparent text-slate-400 hover:bg-[#334155] hover:shadow-lg'}`}>
                      <span className="text-xl md:text-2xl drop-shadow-md">{CLASSES[k].icon}</span><span className="font-bold text-[9px] md:text-[10px] tracking-wider">{k}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">{t('outfitStyle')}</label>
                <div className="flex gap-2">
                  {['Armor', 'Robe', 'Tunic'].map(style => (
                    <button key={style} onMouseEnter={handleHover} onClick={() => {playSFX('buff', isMuted); setPlayer({...player, outfitStyle: style})}} className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl border-2 text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 ease-out active:scale-95 ${player.outfitStyle === style ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(234,88,12,0.3)]' : 'bg-[#1e293b] border-transparent text-slate-400 hover:bg-[#334155] hover:-translate-y-1'}`}>{style}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">{t('outfitColor')}</label>
                  <div className="flex gap-1.5 md:gap-2 flex-wrap">
                    {['#3b82f6', '#10b981', '#ef4444', '#a855f7', '#f59e0b', '#64748b', '#b48e65', '#ffffff'].map(c => (
                      <button key={c} onMouseEnter={handleHover} onClick={() => {handleClick(); setPlayer({...player, outfitColor: c})}} className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg border-2 transition-all duration-300 ease-out hover:scale-110 ${player.outfitColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`} style={{backgroundColor: c}} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">{t('skinColor')}</label>
                  <div className="flex gap-1.5 md:gap-2 flex-wrap">
                    {['#fce2c4', '#f1c27d', '#e0ac69', '#8d5524', '#4a3018'].map(c => (
                      <button key={c} onMouseEnter={handleHover} onClick={() => {handleClick(); setPlayer({...player, skin: c})}} className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-all duration-300 ease-out hover:scale-110 ${player.skin === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`} style={{backgroundColor: c}} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">{t('hairEye')}</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 bg-[#1e293b]/50 p-3 md:p-4 rounded-xl border border-slate-700/50 shadow-inner">
                  <select value={player.hairStyle} onChange={(e) => {handleClick(); setPlayer({...player, hairStyle: e.target.value})}} className="bg-[#0f172a] p-2 rounded-lg text-white outline-none font-bold cursor-pointer w-full sm:w-auto hover:bg-[#111] transition-colors border border-slate-700 text-[10px] md:text-xs">
                    <option value="Spiky">Spiky</option> <option value="Short">Short</option> <option value="Long">Long</option>
                  </select>
                  <div className="hidden sm:block w-px h-6 md:h-8 bg-slate-700"></div>
                  <div className="flex gap-1.5 md:gap-2 items-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t('hair')}</span>
                    {['#2b2b2b', '#fbbf24', '#ef4444', '#7e22ce'].map(c => (
                      <button key={c} onMouseEnter={handleHover} onClick={() => {handleClick(); setPlayer({...player, hairColor: c})}} className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all hover:scale-125 ${player.hairColor === c ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent'}`} style={{backgroundColor: c}} />
                    ))}
                  </div>
                  <div className="hidden sm:block w-px h-6 md:h-8 bg-slate-700"></div>
                  <div className="flex gap-1.5 md:gap-2 items-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t('eye')}</span>
                    {['#3d2210', '#1d4ed8', '#15803d', '#b91c1c'].map(c => (
                      <button key={c} onMouseEnter={handleHover} onClick={() => {handleClick(); setPlayer({...player, eyeColor: c})}} className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all hover:scale-125 ${player.eyeColor === c ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent'}`} style={{backgroundColor: c}} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 pt-4 border-t border-slate-800/80 shrink-0">
               <button onMouseEnter={handleHover} onClick={() => { playSFX('victory', isMuted); startGame(player); }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm md:text-lg py-3 md:py-4 rounded-xl shadow-[0_10px_20px_rgba(59,130,246,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-1 uppercase tracking-widest relative overflow-hidden group">
                 <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                 {t('startAdv')}
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- BATTLE UI ---
  return (
    <div className="absolute inset-0 flex flex-row bg-[#050505] text-slate-200 font-sans overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#050505] to-[#1e1b4b] animate-gradient-xy opacity-50 pointer-events-none"></div>
      
      {/* ACHIEVEMENT POPUP QUEUE */}
      {activePopup && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[200] animate-slide-in-down pointer-events-none w-[90%] max-w-sm md:max-w-none md:w-auto">
           <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border-2 border-blue-400 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.6)] flex items-center gap-3 md:gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
              
              <div className="text-4xl md:text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] relative z-10 shrink-0">{activePopup.icon}</div>
              <div className="relative z-10 pr-2 md:pr-4">
                 <div className="text-cyan-300 text-[9px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1 md:gap-2 mb-1">
                    <Star size={12} className="animate-spin-slow"/> {t('achUnlocked')}
                 </div>
                 <div className="text-white font-black text-sm md:text-2xl tracking-wide drop-shadow-lg leading-tight">{loc(activePopup.name)}</div>
                 <div className="text-blue-200 text-[10px] md:text-xs font-bold mt-1 leading-tight">{loc(activePopup.desc)}</div>
              </div>
           </div>
        </div>
      )}

      {/* Center Action Area */}
      <div className={`flex-1 flex flex-col relative min-w-0 z-10 ${screenShake ? 'animate-shake' : ''}`}>
        
        {/* Full Screen Flash Overlay */}
        <div className={`pointer-events-none fixed inset-0 z-[150] transition-opacity duration-75 ${screenFlash ? 'opacity-80' : 'opacity-0'} ${screenFlash === 'red' ? 'bg-red-600' : 'bg-white'}`} />

        {/* Floating Combat Texts */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingTexts.map(ft => (
            <div key={ft.id} 
              style={ft.type === 'particle' ? { '--tx': `${ft.tx}px`, '--ty': `${ft.ty}px` } : {}}
              className={`absolute font-black drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] 
              ${ft.target === 'player' ? 'bottom-[25%] left-1/2 -translate-x-1/2' : 'top-[25%] left-1/2 -translate-x-1/2'}
              ${ft.type === 'damage' ? 'text-red-500 text-4xl md:text-5xl animate-float-up-fade' : 
                ft.type === 'crit' ? 'text-orange-400 text-5xl md:text-6xl scale-125 animate-float-up-fade' : 
                ft.type === 'heal' ? 'text-green-400 text-4xl md:text-5xl animate-float-up-fade' : 
                ft.type === 'particle' ? 'text-2xl md:text-3xl animate-particle' :
                'text-blue-400 text-4xl md:text-5xl animate-float-up-fade'}`}>
              {ft.text}
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="w-full p-2 md:p-3 flex flex-wrap lg:flex-nowrap justify-between items-center bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a] z-30 text-sm shrink-0 gap-2 shadow-xl relative">
          <div className="text-slate-500 flex items-center min-w-max gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#111] border border-[#333] flex items-end justify-center overflow-hidden shadow-inner shrink-0"><Avatar p={player} /></div>
            <div className="flex flex-col">
              <span className="font-black text-white text-xs md:text-base tracking-widest">{player.name}</span>
              <span className="text-[8px] md:text-[10px] font-black tracking-wider uppercase">HP: <span className="text-green-400">{player.hp}/{totalStats.maxHp}</span> <span className="mx-1 text-slate-700">|</span> DMG: <span className="text-orange-400">{totalStats.dmg}</span></span>
            </div>
          </div>
          
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <div className="flex justify-between text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">
               <span>Progres</span><span className="text-slate-300">{currentEnemyIndex}/{ENEMIES.length}</span>
            </div>
            <div className="w-full bg-[#111] h-2 rounded-full overflow-hidden shadow-inner border border-[#222]">
               <div className="bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-in-out relative shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{width: `${(currentEnemyIndex/ENEMIES.length)*100}%`}}>
                 <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/30 blur-sm animate-pulse-slow"></div>
               </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-end gap-1.5 md:gap-2 text-slate-400 ml-auto shrink-0">
            <button onMouseEnter={handleHover} onClick={handleAudioToggle} className="flex items-center justify-center bg-[#111] hover:bg-[#222] hover:text-white border border-[#333] hover:border-slate-500 w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all duration-300 group active:scale-95 shadow-md">
              {isMuted ? <VolumeX size={14} className="text-red-500"/> : <Volume2 size={14} className="text-green-400 animate-pulse"/>}
            </button>
            <button onMouseEnter={handleHover} onClick={() => {handleClick(); setShowMap(true)}} className="flex items-center gap-1.5 bg-[#111] hover:bg-[#222] hover:text-white border border-[#333] hover:border-orange-500 px-2 md:px-3 h-8 md:h-10 rounded-lg transition-all duration-300 font-black text-[9px] md:text-[10px] uppercase tracking-widest group active:scale-95 shadow-md">
              <Map size={12} className="group-hover:rotate-12 transition-transform duration-300 text-orange-400"/> <span className="hidden sm:inline">{t('map')}</span>
            </button>
            <button onMouseEnter={handleHover} onClick={() => {handleClick(); setShowStats(true)}} className="flex items-center justify-center bg-[#111] hover:bg-[#222] hover:text-white border border-[#333] hover:border-yellow-500 w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all duration-300 group active:scale-95 shadow-md">
              <Trophy size={12} className="text-yellow-500 group-hover:scale-125 transition-transform duration-300"/>
            </button>
            <button onMouseEnter={handleHover} onClick={() => {playSFX('equip', isMuted); setShowInventory(true)}} className="flex items-center gap-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black px-2 md:px-3 h-8 md:h-10 rounded-lg shadow-[0_5px_15px_rgba(234,88,12,0.4)] transition-all duration-300 active:scale-95 group uppercase tracking-widest text-[9px] md:text-[10px]">
              <Package size={12} className="group-hover:-translate-y-1 transition-transform duration-300" /> <span className="hidden sm:inline">{t('inv')}</span> ({player.inventory.length})
            </button>
          </div>
        </div>

        {/* BATTLE STAGE */}
        <div className="flex-1 overflow-y-auto w-full relative z-20 min-h-0 custom-scrollbar bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-[#050505] to-[#050505]">
          <div className="min-h-full flex flex-col items-center justify-center py-4 md:py-8 px-2 w-full max-w-sm mx-auto relative gap-4 md:gap-8">
            
            {/* Sticky Enemy HP Bar - Always visible */}
            <div className="sticky top-0 z-30 w-full max-w-sm bg-[#050505]/90 backdrop-blur-md pt-2 pb-4 mb-2 rounded-b-xl border-b border-[#111] shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-black mb-1.5 px-1 uppercase tracking-widest">
                 <span>HP {enemy?.name}</span><span className="text-white">{enemy?.hp}/{enemy?.maxHp}</span>
              </div>
              <div className="w-full bg-[#111] border border-[#222] h-4 rounded-full overflow-hidden p-[2px] shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)]">
                <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(52,211,153,0.6)]" style={{ width: `${((enemy?.hp || 0) / (enemy?.maxHp || 1)) * 100}%` }}></div>
              </div>
            </div>

            {/* ENEMY */}
            <div className="flex flex-col items-center w-full max-w-sm mb-4 relative shrink-0">
              <div className="text-center mb-3 bg-[#0a0a0a]/50 backdrop-blur-sm p-3 rounded-2xl border border-[#222] shadow-xl">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 flex items-center justify-center gap-2 drop-shadow-lg"><span className="text-xl md:text-2xl drop-shadow-none">👺</span> {enemy?.name}</h2>
              </div>
              
              <div className={`text-[80px] md:text-[100px] leading-none mb-2 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] animate-float relative ${animState.enemy}`}>
                <div className="absolute inset-0 bg-green-500/20 blur-[40px] rounded-full -z-10"></div>
                {enemy?.emoji}
              </div>
            </div>

            <div className="text-3xl md:text-4xl font-black text-[#1a1a1a] my-2 select-none drop-shadow-lg opacity-50 shrink-0">VS</div>

            {/* PLAYER */}
            <div className="flex flex-col items-center w-full max-w-sm mt-4 relative shrink-0">
              <div className={`mb-4 relative w-24 h-24 md:w-32 md:h-32 ${animState.player}`}>
                <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full -z-10"></div>
                <Avatar p={player} animated={!animState.player.includes('transform')} />
              </div>
              
              <h2 className="text-xl md:text-2xl font-black text-white mb-4 drop-shadow-xl tracking-widest uppercase">{player.name}</h2>
              
              <div className="w-full relative px-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-black mb-1.5 px-1 uppercase tracking-widest"><span>HP Pahlawan</span><span className="text-white">{player.hp}/{totalStats.maxHp}</span></div>
                <div className="w-full bg-[#111] border border-[#222] h-4 rounded-full overflow-hidden p-[2px] shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)]">
                  <div className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{ width: `${(player.hp / totalStats.maxHp) * 100}%` }}></div>
                </div>
                <div className="text-center text-sm font-black mt-3 flex items-center justify-center gap-2 bg-[#111]/80 backdrop-blur-sm border border-[#333] py-2 px-6 rounded-2xl w-max mx-auto shadow-xl">
                  <Sword size={16} className="text-orange-500 animate-pulse-slow" /> DMG: <span className="text-orange-400 text-lg">{totalStats.dmg}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Bar */}
        <div className="w-full bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-[#1a1a1a] p-3 md:p-5 flex flex-col items-center gap-3 z-30 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative">
          <button onMouseEnter={handleHover} onClick={triggerAttack} disabled={showQuestionModal} className="w-full max-w-xs bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 hover:from-orange-500 hover:to-red-400 text-white font-black py-3 rounded-2xl shadow-[0_10px_30px_rgba(234,88,12,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-1 flex justify-center items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed group uppercase tracking-widest relative overflow-hidden bg-[length:200%_auto] hover:bg-right shrink-0">
            <Sword size={20} className="group-hover:rotate-12 transition-transform duration-300"/> {t('atk')}
          </button>
          
          <div className="flex gap-2 w-full max-w-3xl overflow-x-auto custom-scrollbar pb-2 px-2 justify-center shrink-0">
            <button onMouseEnter={handleHover} onClick={triggerClassSkill} disabled={cooldowns.classSkill > 0 || showQuestionModal} className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-black border transition-all duration-300 flex items-center gap-2 whitespace-nowrap active:scale-95 shadow-lg uppercase tracking-widest shrink-0 ${cooldowns.classSkill > 0 ? 'bg-[#111] border-[#222] text-slate-600' : 'bg-[#111] border-blue-900/50 hover:bg-blue-900/30 hover:border-blue-500 hover:-translate-y-1 text-blue-400'}`}>
               <Zap size={14} className={cooldowns.classSkill === 0 ? "animate-pulse" : ""}/> {CLASSES[player.className].classSkill.name} 
               {cooldowns.classSkill > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#050505] border border-red-900 rounded-lg text-red-500">{cooldowns.classSkill}</span>}
            </button>
            {player.skills.map(s => {
              if (s.isPassive) return <div key={s.id} className="px-4 py-2 rounded-xl text-[9px] md:text-[10px] bg-[#111] border border-[#222] text-yellow-600 flex items-center gap-1 whitespace-nowrap opacity-80 shadow-inner font-black uppercase tracking-widest shrink-0"><Shield size={12}/> {s.name}</div>;
              return <button key={s.id} onMouseEnter={handleHover} onClick={() => activateGeneralSkill(s.id)} disabled={cooldowns[s.id] > 0 || showQuestionModal} className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-black border transition-all duration-300 flex items-center gap-2 whitespace-nowrap active:scale-95 shadow-lg uppercase tracking-widest shrink-0 ${cooldowns[s.id] > 0 ? 'bg-[#111] border-[#222] text-slate-600' : 'bg-[#111] border-[#333] hover:bg-[#222] hover:border-orange-500 hover:-translate-y-1 text-slate-300'}`}>
                <ArrowUpCircle size={14}/> {s.name}
                {cooldowns[s.id] > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#050505] border border-red-900 rounded-lg text-red-500">{cooldowns[s.id]}</span>}
              </button>;
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar Log */}
      <div className="hidden lg:flex w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-[#1a1a1a] flex-col h-full z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] shrink-0">
        <div className="p-4 md:p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-[#111]/80">
          <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Briefcase size={16}/> {t('battleLog')}</h3>
        </div>
        <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar text-xs md:text-sm font-bold min-h-0">
          {logs.map((log, i) => {
            const logText = typeof log === 'string' ? log : (log.text || '');
            let colorClass = "text-slate-400 bg-[#111] border-[#222]";
            let icon = null;
            if (log.type === 'damage') { colorClass = "text-red-400 bg-red-950/30 border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"; icon = <Flame size={14} className="mt-0.5"/>; }
            if (log.type === 'success') { colorClass = "text-green-400 bg-green-950/30 border-green-900/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]"; icon = <Sword size={14} className="mt-0.5"/>; }
            if (log.type === 'error') { colorClass = "text-orange-500 bg-orange-950/30 border-orange-900/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]"; icon = <Target size={14} className="mt-0.5"/>; }
            if (log.type === 'victory') { colorClass = "text-yellow-400 font-black bg-yellow-950/40 border-yellow-900/60 shadow-[0_0_20px_rgba(234,179,8,0.2)]"; icon = <Trophy size={14} className="mt-0.5"/>; }
            if (log.type === 'buff') { colorClass = "text-blue-400 font-black bg-blue-950/30 border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]"; icon = <Zap size={14} className="mt-0.5"/>; }
            if (log.type === 'heal') { colorClass = "text-green-400 font-black bg-green-950/30 border-green-900/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]"; icon = <Heart size={14} className="mt-0.5"/>; }
            
            const isSystem = logText.startsWith('---');
            return (
              <div key={i} className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 ${isSystem ? 'bg-transparent border-transparent text-center justify-center py-4 md:py-6' : colorClass} animate-slide-in-right`}>
                {!isSystem && icon && <span className="opacity-90 shrink-0">{icon}</span>}
                <span className={isSystem ? 'w-full text-center text-[10px] md:text-xs font-black text-slate-500 tracking-widest uppercase' : 'leading-relaxed'}>{logText}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* INVENTORY OVERLAY */}
      {showInventory && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl flex flex-col z-[100] animate-pop-in p-2 md:p-6">
           <div className="h-14 md:h-20 bg-[#0a0a0a]/90 flex items-center justify-between px-4 md:px-8 shadow-2xl shrink-0 rounded-t-xl md:rounded-t-3xl border border-[#222]">
              <div className="flex items-center gap-3 md:gap-5">
                 <div className="w-8 h-8 md:w-12 md:h-12 bg-[#111] border border-[#333] rounded-lg md:rounded-xl overflow-hidden flex items-end justify-center shadow-inner shrink-0"><Avatar p={player} /></div>
                 <div className="hidden sm:block">
                    <div className="font-black text-white text-sm md:text-lg tracking-widest uppercase mb-1">{player.name}</div>
                    <div className="text-[9px] md:text-xs font-bold"><span className="text-orange-400 bg-orange-950/40 border border-orange-900/50 px-2 py-0.5 rounded-lg">⚔ {totalStats.dmg}</span> <span className="text-green-400 bg-green-950/40 border border-green-900/50 px-2 py-0.5 rounded-lg ml-1 md:ml-2">❤ {player.hp}/{totalStats.maxHp}</span></div>
                 </div>
              </div>
              <button onMouseEnter={handleHover} onClick={() => {handleClick(); setShowInventory(false)}} className="flex items-center gap-1.5 md:gap-2 bg-[#111] hover:bg-slate-800 border border-[#333] hover:border-slate-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg text-[10px] md:text-sm shrink-0"><Check size={14}/> Tutup</button>
           </div>

           <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-3 md:gap-6 min-h-0 bg-[#0a0a0a] rounded-b-xl md:rounded-b-3xl border border-t-0 border-[#222]">
              
              {/* LEFT PANE (Equipment) */}
              <div className="w-full lg:w-[320px] bg-[#050505] p-3 md:p-6 overflow-y-auto custom-scrollbar shadow-inner flex flex-col gap-3 md:gap-4 shrink-0 min-h-0 max-h-[30vh] lg:max-h-none border-b lg:border-b-0 lg:border-r border-[#1a1a1a]">
                 <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-[#222] pb-2 md:pb-3 shrink-0">Equipment</h3>
                 <div className="space-y-2 md:space-y-3">
                    {['Senjata', 'Baju Besi', 'Aksesori'].map(slot => {
                       const item = player.equipment[slot]; const SlotIcon = slot === 'Senjata' ? Sword : (slot === 'Baju Besi' ? Shirt : Gem);
                       return (
                          <div key={slot} onMouseEnter={handleHover} className="bg-[#111] border border-[#222] rounded-lg md:rounded-xl p-2 md:p-4 flex items-center gap-3 md:gap-4 cursor-pointer hover:border-orange-500 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.5)] shrink-0" onClick={() => unequipItem(slot)}>
                             <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-3xl transition-colors duration-300 shrink-0 ${item ? 'bg-[#1a1a1a] text-white shadow-inner' : 'bg-[#0a0a0a] text-slate-700 border border-dashed border-[#333]'}`}>
                                {item ? item.icon : <SlotIcon size={18}/>}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="text-[8px] md:text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1 truncate">{slot}</div>
                                <div className={`font-black text-[10px] md:text-sm tracking-wider transition-colors duration-300 truncate ${item ? 'text-white group-hover:text-red-400' : 'text-slate-600'}`}>{item ? item.name : 'Kosong'}</div>
                                {item && <div className="text-[8px] md:text-[9px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest flex items-center gap-1"><ArrowUpCircle size={10} className="rotate-180"/> {t('unequip')}</div>}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>

              {/* RIGHT PANE (Bag Items) */}
              <div className="flex-1 bg-[#0a0a0a] p-3 md:p-6 overflow-y-auto custom-scrollbar flex flex-col relative min-h-0">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 border-b border-[#222] pb-3 md:pb-4 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-10 gap-3 shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                       {['Semua', 'Senjata', 'Baju Besi', 'Aksesori'].map(f => (
                          <button key={f} onMouseEnter={handleHover} onClick={() => {handleClick(); setInvFilter(f)}} className={`px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-1 hover:-translate-y-0.5 shadow-sm active:scale-95 ${invFilter === f ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_3px_10px_rgba(234,88,12,0.4)] border-none' : 'bg-[#111] text-slate-400 hover:text-white border border-[#222] hover:border-[#444]'}`}>
                             {f}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {player.inventory.filter(i => invFilter === 'Semua' || i.type === invFilter).map((item, idx) => (
                       <div key={idx} onMouseEnter={handleHover} onClick={() => equipItem(item)} className={`bg-[#111] border rounded-xl md:rounded-2xl p-3 md:p-4 cursor-pointer hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out group relative overflow-hidden ${getRarityColor(item.rarity)} hover:bg-[#151515] shadow-md flex flex-col items-center text-center shrink-0`}>
                          <div className={`absolute top-0 left-0 w-1 md:w-1.5 h-full ${getRarityColor(item.rarity).split(' ')[1].replace('border', 'bg')}`}></div>
                          <div className="text-3xl md:text-5xl mb-2 md:mb-3 mt-1 md:mt-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-300 animate-float">{item.icon}</div>
                          <div className="font-black text-[10px] md:text-sm text-white mb-1 min-h-[28px] md:min-h-[32px] flex items-center justify-center line-clamp-2 leading-tight">{item.name}</div>
                          <div className="text-[8px] md:text-[9px] uppercase font-black opacity-80 mb-2 md:mb-3 tracking-widest">{item.rarity}</div>
                          <div className="flex flex-wrap gap-1 justify-center mt-auto">
                             {item.stats.hp && <span className="text-[8px] md:text-[9px] font-black text-green-400 bg-green-950/40 border border-green-900/50 px-1.5 md:px-2 py-0.5 rounded">+{item.stats.hp} HP</span>}
                             {item.stats.dmg && <span className="text-[8px] md:text-[9px] font-black text-orange-400 bg-orange-950/40 border border-orange-900/50 px-1.5 md:px-2 py-0.5 rounded">+{item.stats.dmg} DMG</span>}
                          </div>
                          <div className="absolute inset-0 bg-orange-600/95 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="bg-white/20 p-1.5 md:p-2 rounded-full mb-1 md:mb-2 transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-100"><ArrowUpCircle size={16} className="text-white"/></div>
                             <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">{t('equip')}</span>
                          </div>
                       </div>
                    ))}
                    {player.inventory.filter(i => invFilter === 'Semua' || i.type === invFilter).length === 0 && (
                       <div className="col-span-full py-10 md:py-20 flex flex-col items-center text-slate-600 animate-pulse">
                          <Package size={32} className="mb-2 md:mb-4 opacity-30"/>
                          <p className="font-black text-xs md:text-sm tracking-widest uppercase">{t('emptyBag')}</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Map Overlay */}
      {showMap && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center pt-12 md:pt-16 p-4 z-[90] overflow-y-auto custom-scrollbar animate-pop-in">
          <button onMouseEnter={handleHover} onClick={() => {handleClick(); setShowMap(false)}} className="fixed top-4 md:top-8 right-4 md:right-8 text-slate-400 hover:text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-xl bg-[#111] hover:bg-[#222] border border-[#333] transition-all hover:scale-105 active:scale-95 shadow-xl z-50 flex items-center gap-2 uppercase text-[10px] md:text-xs tracking-widest">Tutup</button>
          
          <div className="text-center mb-8 md:mb-16 relative mt-6 md:mt-10 shrink-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-orange-900/20 rounded-full blur-3xl"></div>
            <h1 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center justify-center gap-3 md:gap-4 drop-shadow-lg relative z-10"><Map size={32} className="text-orange-500 animate-bounce-slow hidden md:block"/> {t('mapTitle')}</h1>
          </div>

          <div className="w-full max-w-4xl flex flex-col items-center pb-24 md:pb-32">
            {MAP_REGIONS.map((region, rIdx) => {
              const isRegionUnlocked = currentEnemyIndex >= region.startIndex;
              return (
                <div key={region.id} className="flex flex-col items-center w-full">
                  <div className={`w-full border-2 rounded-2xl md:rounded-3xl p-5 md:p-10 relative transition-all duration-700 ease-out hover:-translate-y-2 ${isRegionUnlocked ? region.color : 'border-[#1a1a1a] bg-[#0a0a0a] opacity-50 grayscale'}`}>
                    <h3 className={`text-lg md:text-2xl font-black mb-1 md:mb-2 flex items-center gap-2 md:gap-3 ${isRegionUnlocked ? region.textHead : 'text-slate-500'} tracking-widest uppercase drop-shadow-md`}>
                       {isRegionUnlocked ? '🗺️' : '🔒'} {loc(region.name)}
                    </h3>
                    <p className={`text-[10px] md:text-sm font-bold mb-4 md:mb-8 ${isRegionUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>{region.desc}</p>
                    
                    <div className="flex justify-center flex-wrap gap-3 md:gap-6 mt-4 md:mt-6">
                      {ENEMIES.slice(region.startIndex, region.endIndex + 1).map((en, localIdx) => {
                        const globalIdx = region.startIndex + localIdx;
                        const isCurrent = currentEnemyIndex === globalIdx;
                        const isDefeated = currentEnemyIndex > globalIdx;
                        let nodeStyle = isDefeated ? "border-green-600 bg-green-900/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : 
                                        (isCurrent ? "border-orange-500 bg-orange-900/20 text-orange-400 ring-2 md:ring-4 ring-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.4)] animate-pulse" : 
                                        "border-[#333] bg-[#111] text-slate-500 grayscale opacity-70");
                        
                        return (
                          <div key={globalIdx} className={`w-24 md:w-40 rounded-xl md:rounded-2xl border-2 p-2 md:p-5 flex flex-col items-center text-center relative transition-all duration-500 shrink-0 ${nodeStyle} ${isCurrent ? 'transform scale-105 md:scale-110 -translate-y-2 md:-translate-y-4' : 'hover:scale-105'}`}>
                            {isDefeated && <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-green-500 text-black rounded-full p-1 md:p-1.5 shadow-lg animate-pop-in"><Check size={12}/></div>}
                            <div className="text-2xl md:text-5xl mb-2 md:mb-4 drop-shadow-lg">{en.emoji}</div>
                            <div className="font-black text-[8px] md:text-sm uppercase tracking-wider line-clamp-1">{en.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {rIdx < MAP_REGIONS.length - 1 && (
                     <div className="h-12 md:h-24 w-1 border-l-2 md:border-l-4 border-dashed border-slate-700 my-2 md:my-4 flex items-center justify-center relative opacity-50 shrink-0">
                        <div className="absolute -bottom-2 md:-bottom-3 bg-slate-800 text-slate-400 p-0.5 md:p-1 rounded-full border border-slate-700"><ArrowUpCircle size={14} className="rotate-180"/></div>
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATISTICS OVERLAY */}
      {showStats && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center pt-16 p-4 z-[90] overflow-y-auto custom-scrollbar animate-pop-in">
           <button onMouseEnter={handleHover} onClick={() => {handleClick(); setShowStats(false)}} className="fixed top-4 md:top-8 right-4 md:right-8 text-slate-400 hover:text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-xl bg-[#111] hover:bg-[#222] border border-[#333] transition-all hover:scale-105 active:scale-95 shadow-xl z-50 flex items-center gap-2 uppercase text-[10px] md:text-xs tracking-widest">Tutup</button>
           <div className="w-full max-w-5xl pb-32 mt-6 md:mt-10">
             <div className="text-center mb-8 md:mb-16 relative shrink-0">
               <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center gap-3 md:gap-4 drop-shadow-lg relative z-10"><Trophy size={32} className="text-blue-500 animate-float hidden md:block"/> {t('stats')}</h1>
             </div>
             
             <div className="mb-8 md:mb-12 bg-[#0a0a0a] border border-[#1a1a1a] p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl shrink-0">
                <div className="flex justify-between text-[10px] md:text-sm font-black text-slate-400 mb-3 md:mb-4 uppercase tracking-widest">
                  <span>Progres</span>
                  <span className="text-blue-400">{ACHIEVEMENTS_LIST.filter(a => a.check(stats)).length} / {ACHIEVEMENTS_LIST.length}</span>
                </div>
                <div className="w-full bg-[#111] h-2 md:h-4 rounded-full overflow-hidden border border-[#222] shadow-inner">
                   <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(56,189,248,0.5)] relative" style={{width: `${(ACHIEVEMENTS_LIST.filter(a => a.check(stats)).length / ACHIEVEMENTS_LIST.length) * 100}%`}}></div>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-8 md:mb-16 shrink-0">
                <StatCard icon={<Zap className="text-yellow-400"/>} title="Soal" value={stats.qAnswered} />
                <StatCard icon={<Check className="text-green-500"/>} title="Benar" value={stats.qCorrect} colorClass="text-green-400" />
                <StatCard icon={<HelpCircle className="text-blue-400"/>} title="Akurasi" value={`${stats.qAnswered > 0 ? Math.round((stats.qCorrect / stats.qAnswered)*100) : 0}%`} colorClass="text-blue-400" />
                <StatCard icon={<Flame className="text-orange-500"/>} title="Streak" value={stats.maxStreak} colorClass="text-orange-400" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 shrink-0">
               {ACHIEVEMENTS_LIST.map((ach, idx) => {
                 const isUnlocked = ach.check(stats);
                 return (
                   <div key={ach.id} className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 flex items-center gap-4 md:gap-6 transition-all duration-500 ease-out hover:-translate-y-1 ${isUnlocked ? 'bg-[#0a0a0a] border-blue-900/50 shadow-[0_5px_15px_rgba(59,130,246,0.1)]' : 'bg-[#050505] border-[#111] opacity-50 grayscale'}`}>
                     <div className={`text-2xl md:text-4xl p-3 md:p-4 rounded-xl md:rounded-2xl shadow-inner shrink-0 ${isUnlocked ? 'bg-blue-950/40 text-blue-400' : 'bg-[#111] text-slate-600'}`}>{ach.icon}</div>
                     <div className="flex-1">
                       <h3 className={`font-black text-xs md:text-xl mb-1 uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>{loc(ach.name)}</h3>
                       <p className={`text-[10px] md:text-sm font-bold ${isUnlocked ? 'text-slate-400' : 'text-slate-700'}`}>{loc(ach.desc)}</p>
                     </div>
                     <div className="pr-2 md:pr-4 shrink-0">
                       {!isUnlocked && <Lock className="text-slate-700" size={20}/>}
                       {isUnlocked && <div className="bg-blue-600 p-1 md:p-2 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] animate-pulse-slow"><Check className="text-white" size={14}/></div>}
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {showQuestionModal && currentQuestion && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[110]">
          <div className="bg-[#0a0a0a] p-5 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] max-w-2xl w-full border-2 border-blue-900/50 shadow-[0_0_80px_rgba(59,130,246,0.2)] animate-pop-in text-center relative overflow-hidden flex flex-col max-h-[95vh]">
            <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 bg-[length:200%_auto] animate-shine"></div>
            
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-8 shrink-0 mt-2">
               <div className="bg-blue-950/30 p-2 md:p-3 rounded-xl md:rounded-2xl border border-blue-900/50 text-blue-400"><Zap size={20}/></div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pb-4">
              <p className="text-base md:text-2xl text-white mb-6 md:mb-8 font-black leading-relaxed drop-shadow-lg px-2">{lang === 'id' ? currentQuestion.data.id_q : currentQuestion.data.en_q}</p>
              
              <div className="mb-6 md:mb-8 w-full">
                 {!alchemistHint && !isHintLoading && (
                    <button onMouseEnter={handleHover} onClick={getAlchemistHint} className="text-[9px] md:text-xs font-black tracking-widest uppercase text-orange-400 hover:text-orange-300 flex items-center justify-center gap-2 w-full p-3 md:p-4 border-2 border-orange-900/50 rounded-xl bg-orange-950/20 transition-all hover:bg-orange-900/30 active:scale-95 shadow-inner shrink-0">
                       <Sparkles size={12} className="animate-pulse" /> {t('hintAlchemist')}
                    </button>
                 )}
                 {isHintLoading && (
                    <div className="text-[9px] md:text-xs font-black tracking-widest uppercase text-slate-400 flex items-center justify-center gap-2 animate-pulse p-3 shrink-0">
                       <Zap size={12} className="animate-spin text-blue-500"/> ...
                    </div>
                 )}
                 {alchemistHint && (
                    <div className="p-3 md:p-6 bg-[#050505] border-2 border-blue-900/50 rounded-xl text-[10px] md:text-base font-bold text-blue-200 italic relative text-left shadow-inner shrink-0">
                       "{alchemistHint}"
                    </div>
                 )}
              </div>

              <div className="w-full shrink-0">
                 {currentQuestion.type === 'mcq' && (
                   <div className="grid grid-cols-1 gap-2 md:gap-4">
                     {currentQuestion.data.options.map((opt, idx) => (
                       <button key={idx} onMouseEnter={handleHover} onClick={() => handleMcqTfAnswer(idx)} className="bg-[#111] hover:bg-blue-600 hover:text-white text-slate-300 p-3 md:p-6 rounded-xl text-left transition-all duration-300 border-2 border-[#222] hover:border-blue-400 font-bold shadow-md active:scale-95 group flex items-center shrink-0">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#222] group-hover:bg-white/20 flex items-center justify-center mr-3 md:mr-4 text-slate-500 group-hover:text-white font-black text-sm md:text-lg transition-colors shrink-0">{['A', 'B', 'C', 'D'][idx]}</div>
                         <span className="text-xs md:text-lg flex-1">{opt}</span>
                       </button>
                     ))}
                   </div>
                 )}

                 {currentQuestion.type === 'tf' && (
                   <div className="flex gap-3 md:gap-6 justify-center shrink-0">
                     <button onMouseEnter={handleHover} onClick={() => handleMcqTfAnswer(true)} className="flex-1 bg-[#111] hover:bg-green-600 hover:text-white text-green-500 p-5 md:p-8 rounded-2xl transition-all duration-300 border-2 border-[#222] hover:border-green-400 font-black text-sm md:text-2xl shadow-md active:scale-95 uppercase tracking-widest flex flex-col items-center gap-2 shrink-0">
                       <Check size={24} className="md:w-10 md:h-10"/> {t('true')}
                     </button>
                     <button onMouseEnter={handleHover} onClick={() => handleMcqTfAnswer(false)} className="flex-1 bg-[#111] hover:bg-red-600 hover:text-white text-red-500 p-5 md:p-8 rounded-2xl transition-all duration-300 border-2 border-[#222] hover:border-red-400 font-black text-sm md:text-2xl shadow-md active:scale-95 uppercase tracking-widest flex flex-col items-center gap-2 shrink-0">
                       <VolumeX size={24} className="md:w-10 md:h-10"/> {t('false')}
                     </button>
                   </div>
                 )}

                 {currentQuestion.type === 'essay' && (
                   <form onSubmit={handleEssaySubmit} className="flex flex-col gap-4 items-center w-full shrink-0">
                      <input type="text" value={essayAnswer} onChange={(e) => setEssayAnswer(e.target.value)} placeholder="..." autoFocus className="w-full bg-[#111] border-2 border-[#333] focus:border-blue-500 p-4 md:p-6 rounded-xl text-base md:text-2xl font-black text-center text-white outline-none transition-colors shadow-inner" />
                      <button type="submit" onMouseEnter={handleHover} disabled={!essayAnswer.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#222] disabled:text-slate-600 text-white font-black text-sm md:text-xl py-3 md:py-5 px-10 md:px-16 rounded-xl shadow-[0_5px_15px_rgba(37,99,235,0.4)] transition-all duration-300 active:scale-95 uppercase tracking-widest w-full md:w-auto shrink-0">
                         {t('answer')}
                      </button>
                   </form>
                 )}

                 {currentQuestion.type === 'matching' && (
                   <div className="w-full shrink-0">
                      <div className="flex flex-row gap-2 md:gap-8 justify-center">
                         <div className="flex-1 flex flex-col gap-2 md:gap-4 shrink-0">
                            {matchingState.left.map(item => {
                               const isMatched = matchingState.matched.includes(item); const isSelected = matchingState.selectedL === item;
                               return <button key={'L'+item} onMouseEnter={handleHover} onClick={() => {if(!isMatched) { playSFX('attack', isMuted); handleMatchingClick('left', item); }}} disabled={isMatched} className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 font-bold text-[9px] md:text-sm transition-all text-center shrink-0 ${isMatched ? 'bg-green-900/20 border-green-500/50 text-green-500 opacity-50' : isSelected ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-[#111] border-[#333] text-slate-300 hover:bg-[#222]'}`}>{item}</button>;
                            })}
                         </div>
                         <div className="flex-1 flex flex-col gap-2 md:gap-4 shrink-0">
                            {matchingState.right.map(item => {
                               const isMatched = matchingState.matched.includes(item); const isSelected = matchingState.selectedR === item;
                               return <button key={'R'+item} onMouseEnter={handleHover} onClick={() => {if(!isMatched) { playSFX('attack', isMuted); handleMatchingClick('right', item); }}} disabled={isMatched} className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 font-bold text-[9px] md:text-sm transition-all text-center shrink-0 ${isMatched ? 'bg-green-900/20 border-green-500/50 text-green-500 opacity-50' : isSelected ? 'bg-orange-600 text-white border-orange-400 scale-105 shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-[#111] border-[#333] text-slate-300 hover:bg-[#222]'}`}>{item}</button>;
                            })}
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {gameState === 'REWARD' && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] p-6 md:p-12 rounded-[2rem] md:rounded-3xl max-w-3xl w-full border border-orange-700 shadow-[0_0_80px_rgba(234,88,12,0.2)] text-center animate-pop-in relative overflow-hidden flex flex-col items-center max-h-[90vh]">
            <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 mb-6 md:mb-8 uppercase tracking-widest drop-shadow-lg relative z-10 shrink-0">Loot!</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 relative z-10 w-full overflow-y-auto custom-scrollbar p-2">
              {droppedItems.map((item, idx) => (
                 <div key={idx} className={`w-32 md:w-48 bg-[#111] border ${getRarityColor(item.rarity).replace('bg-', 'border-')} p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center shadow-xl transform hover:scale-105 transition-transform duration-300 relative overflow-hidden shrink-0`}>
                    <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 md:mb-3">{t('newItem')}</span>
                    <div className="text-4xl md:text-6xl mb-2 md:mb-4 drop-shadow-xl animate-float">{item.icon}</div>
                    <div className="font-black text-xs md:text-base text-white mb-1 line-clamp-2">{item.name}</div>
                    <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mt-2">
                       {item.stats.hp && <span className="text-[8px] md:text-[10px] font-black text-green-400 bg-green-950/40 border border-green-900/50 px-2 md:px-3 py-0.5 md:py-1 rounded-lg">+{item.stats.hp} HP</span>}
                       {item.stats.dmg && <span className="text-[8px] md:text-[10px] font-black text-orange-400 bg-orange-950/40 border border-orange-900/50 px-2 md:px-3 py-0.5 md:py-1 rounded-lg">+{item.stats.dmg} DMG</span>}
                    </div>
                 </div>
              ))}
              {droppedSkill && (
                 <div className="w-32 md:w-48 bg-[#111] border border-blue-600/50 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center shadow-[0_0_30px_rgba(37,99,235,0.15)] transform hover:scale-105 transition-transform duration-300 relative overflow-hidden shrink-0">
                    <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 md:mb-3">{t('skillBook')}</span>
                    <div className="text-4xl md:text-6xl mb-2 md:mb-4 drop-shadow-xl animate-float" style={{animationDelay: '0.5s'}}>📘</div>
                    <div className="font-black text-xs md:text-base text-blue-400 mb-1">{droppedSkill.name}</div>
                 </div>
              )}
            </div>
            <button onMouseEnter={handleHover} onClick={() => {handleClick(); collectLootAndProceed(!!droppedSkill);}} className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-black text-sm md:text-lg py-3 md:py-4 px-8 md:px-10 rounded-xl md:rounded-2xl shadow-[0_15px_30px_rgba(234,88,12,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-1 uppercase tracking-widest relative z-10 w-full md:w-auto shrink-0">
              {t('takeCont')}
            </button>
          </div>
        </div>
      )}

      {/* Game Over / Win Modals */}
      {gameState === 'LOSE' && (
        <div className="fixed inset-0 bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 z-[120] animate-pop-in overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center justify-center min-h-full py-10">
             <Skull size={60} className="text-red-500 mb-4 md:mb-6 animate-pulse drop-shadow-[0_0_40px_rgba(239,68,68,0.6)] shrink-0" />
             <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-2 md:mb-4 tracking-widest drop-shadow-2xl text-center shrink-0">{t('lose')}</h1>
             <p className="text-slate-300 text-sm md:text-lg mb-6 md:mb-8 text-center max-w-sm font-bold shrink-0">Pahlawan <span className="text-white">{player.name}</span> telah gugur di tangan {enemy?.name}.</p>
             
             {/* SUMMARY CARD */}
             <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-md border border-red-900/30 rounded-2xl md:rounded-3xl p-5 md:p-8 mb-8 shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 to-red-500"></div>
                <h3 className="text-center text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5 border-b border-[#222] pb-3">{t('summary')}</h3>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222]">
                      <Target className="text-blue-400 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{stats.qAnswered > 0 ? Math.round((stats.qCorrect / stats.qAnswered)*100) : 0}%</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('accuracy')}</span>
                   </div>
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222]">
                      <Skull className="text-red-500 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{stats.enemiesDefeated}</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('enemiesDef')}</span>
                   </div>
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222]">
                      <Flame className="text-orange-500 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{stats.highestDmg}</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('maxDmg')}</span>
                   </div>
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222]">
                      <Trophy className="text-yellow-400 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{unlockedAchs.length}</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('achEarned')}</span>
                   </div>
                </div>

                {unlockedAchs.length > 0 && (
                  <div className="flex flex-col items-center pt-2">
                     <span className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest mb-3">{t('achEarned')}:</span>
                     <div className="flex gap-2 flex-wrap justify-center">
                        {unlockedAchs.map(achId => {
                          const ach = ACHIEVEMENTS_LIST.find(a => a.id === achId);
                          return <div key={ach.id} className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#1a1a1a] to-[#050505] border border-[#333] rounded-full flex items-center justify-center text-lg md:text-xl shadow-inner hover:scale-110 transition-transform" title={loc(ach.name)}>{ach.icon}</div>
                        })}
                     </div>
                  </div>
                )}
             </div>

             <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md shrink-0">
                <button onMouseEnter={handleHover} onClick={() => {handleClick(); setShowStats(true);}} className="w-full bg-[#111] border border-[#333] text-slate-300 hover:bg-[#222] hover:text-white font-black py-3 md:py-4 px-6 rounded-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs md:text-sm shrink-0">{t('stats')}</button>
                <button onMouseEnter={handleHover} onClick={() => {playSFX('victory', isMuted); setGameState('MENU');}} className="w-full bg-red-600/10 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-black py-3 md:py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-300 hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs md:text-sm shrink-0">{t('tryAgain')}</button>
             </div>
          </div>
        </div>
      )}

      {gameState === 'WIN' && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 z-[120] animate-pop-in overflow-y-auto custom-scrollbar">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col items-center justify-center min-h-full py-10 w-full relative z-10">
             <div className="text-[80px] md:text-[120px] mb-2 md:mb-4 drop-shadow-[0_0_80px_rgba(234,179,8,1)] animate-bounce-slow shrink-0">👑</div>
             <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 mb-2 md:mb-4 text-center tracking-widest drop-shadow-2xl shrink-0">{t('win')}</h1>
             <p className="text-slate-300 text-sm md:text-lg mb-6 md:mb-8 text-center max-w-md leading-relaxed font-bold shrink-0">Pahlawan <span className="text-white text-base md:text-xl mx-1">{player.name}</span> berhasil menaklukkan kegelapan!</p>
             
             {/* SUMMARY CARD */}
             <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-md border border-yellow-900/50 rounded-2xl md:rounded-3xl p-5 md:p-8 mb-8 shrink-0 shadow-[0_15px_40px_rgba(234,179,8,0.2)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-orange-400"></div>
                <h3 className="text-center text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5 border-b border-[#222] pb-3">{t('summary')}</h3>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222] hover:border-yellow-500/50 transition-colors">
                      <Target className="text-blue-400 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{stats.qAnswered > 0 ? Math.round((stats.qCorrect / stats.qAnswered)*100) : 0}%</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('accuracy')}</span>
                   </div>
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222] hover:border-yellow-500/50 transition-colors">
                      <Skull className="text-red-500 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{stats.enemiesDefeated}</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('enemiesDef')}</span>
                   </div>
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222] hover:border-yellow-500/50 transition-colors">
                      <Flame className="text-orange-500 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{stats.highestDmg}</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('maxDmg')}</span>
                   </div>
                   <div className="flex flex-col items-center p-3 bg-[#111] rounded-xl border border-[#222] hover:border-yellow-500/50 transition-colors">
                      <Trophy className="text-yellow-400 mb-1.5" size={18}/>
                      <span className="text-xl md:text-2xl font-black text-white">{unlockedAchs.length}</span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">{t('achEarned')}</span>
                   </div>
                </div>

                {unlockedAchs.length > 0 && (
                  <div className="flex flex-col items-center pt-2">
                     <span className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest mb-3">{t('achEarned')}:</span>
                     <div className="flex gap-2 flex-wrap justify-center">
                        {unlockedAchs.map(achId => {
                          const ach = ACHIEVEMENTS_LIST.find(a => a.id === achId);
                          return <div key={ach.id} className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#1a1a1a] to-[#050505] border border-yellow-900/50 rounded-full flex items-center justify-center text-lg md:text-xl shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:scale-110 transition-transform" title={loc(ach.name)}>{ach.icon}</div>
                        })}
                     </div>
                  </div>
                )}
             </div>

             <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md shrink-0">
                <button onMouseEnter={handleHover} onClick={() => {handleClick(); setShowStats(true);}} className="flex-1 bg-[#111] border border-[#333] text-slate-300 hover:bg-[#222] hover:text-white font-black py-3 md:py-4 px-6 rounded-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 uppercase tracking-widest shadow-lg text-xs md:text-sm shrink-0">{t('stats')}</button>
                <button onMouseEnter={handleHover} onClick={() => {playSFX('victory', isMuted); setGameState('MENU');}} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black py-3 md:py-4 px-6 rounded-xl shadow-[0_15px_30px_rgba(234,179,8,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs md:text-sm shrink-0">{t('playAgain')}</button>
             </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; border: 1px solid #111; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes slideInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-in-up { animation: slideInUp 0.5s ease-out forwards; }
        @keyframes slideInDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-in-down { animation: slideInDown 0.5s ease-out forwards; }
        @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
        @keyframes pulseSlow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-15px) rotate(-5deg); } 40% { transform: translateX(15px) rotate(5deg); } 60% { transform: translateX(-10px); } 80% { transform: translateX(10px); } }
        .animate-shake { animation: shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
        @keyframes floatUpFade { 0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; } 20% { transform: translate(-50%, -30px) scale(1.3); opacity: 1; } 100% { transform: translate(-50%, -100px) scale(1); opacity: 0; } }
        .animate-float-up-fade { animation: floatUpFade 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes particleBurst { 0% { transform: translate(-50%, 0) scale(0.5); opacity: 1; } 100% { transform: translate(calc(-50% + var(--tx)), var(--ty)) scale(1.5) rotate(45deg); opacity: 0; } }
        .animate-particle { animation: particleBurst 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes gradientXY { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient-xy { background-size: 200% 200%; animation: gradientXY 15s ease infinite; }
        @keyframes shine { 100% { transform: translateX(200%); } }
        .animate-shine { animation: shine 3s infinite linear; }
        @keyframes spinSlow { 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spinSlow 3s linear infinite; }
        
        .flask-icon { width: 1em; height: 1em; display: inline-block; background-color: currentColor; mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 2v7.31l-5.69 9.85c-.5.86-.14 1.94.75 2.45.28.16.6.24.94.24h12c1.1 0 2-.9 2-2 0-.34-.08-.66-.24-.94L14 9.31V2h2V0H8v2h2zm-2 15.69L10.31 13h3.38L16 17.69v.31H8v-.31z"/></svg>') no-repeat center; -webkit-mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 2v7.31l-5.69 9.85c-.5.86-.14 1.94.75 2.45.28.16.6.24.94.24h12c1.1 0 2-.9 2-2 0-.34-.08-.66-.24-.94L14 9.31V2h2V0H8v2h2zm-2 15.69L10.31 13h3.38L16 17.69v.31H8v-.31z"/></svg>') no-repeat center; }
      `}} />
    </div>
  );
}

const FlaskIcon = () => <span className="flask-icon text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" style={{width: '80px', height:'80px'}}></span>;
