#!/usr/bin/env node
/**
 * Seeds pack_cards relationships with weighted random selection
 * Run with: node scripts/seed-pack-cards.js
 */

const SUPABASE_URL = 'https://mwscncedcuzakbqdetem.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2NuY2VkY3V6YWticWRldGVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgyMTA2NywiZXhwIjoyMDgwMzk3MDY3fQ.CZAgqV8PG0ZdUhu9PlGe4RYk0SPPJafouVxlUKtFD0Q';

async function fetchData(table, select = '*') {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  return response.json();
}

async function insertData(table, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Insert failed: ${error}`);
  }
  return response.json();
}

async function main() {
  console.log('Fetching packs and cards...');

  const [packs, cards] = await Promise.all([
    fetchData('packs', 'id,name,tier'),
    fetchData('cards', 'id,name,rarity,market_price'),
  ]);

  console.log(`Found ${packs.length} packs and ${cards.length} cards`);

  // Categorize cards by rarity (normalize to lowercase)
  const cardsByRarity = {};
  for (const card of cards) {
    const rarity = card.rarity.toLowerCase();
    if (!cardsByRarity[rarity]) cardsByRarity[rarity] = [];
    cardsByRarity[rarity].push(card);
  }

  console.log('Cards by rarity:');
  for (const [rarity, cardList] of Object.entries(cardsByRarity)) {
    console.log(`  ${rarity}: ${cardList.length} cards`);
  }

  // Define pack configurations
  const packConfigs = {
    'Bronze Safari': {
      common: 60,
      uncommon: 35,
      rare: 5,
    },
    'Vintage Bronze': {
      common: 60,
      uncommon: 35,
      rare: 5,
    },
    'Gold Safari': {
      common: 25,
      uncommon: 40,
      rare: 25,
      'ultra rare': 8,
      'rare holo v': 2,
    },
    'Modern Gold': {
      common: 25,
      uncommon: 40,
      rare: 25,
      'ultra rare': 8,
      'double rare': 2,
    },
    'Legendary Safari': {
      uncommon: 15,
      rare: 30,
      'ultra rare': 35,
      'secret rare': 20,
    },
    'Graded Gem Hunt': {
      rare: 15,
      'ultra rare': 30,
      'secret rare': 55,
    },
  };

  const packCards = [];

  for (const pack of packs) {
    const config = packConfigs[pack.name];
    if (!config) {
      console.warn(`No config for pack: ${pack.name}`);
      continue;
    }

    console.log(`\nProcessing pack: ${pack.name}`);

    for (const [rarity, weight] of Object.entries(config)) {
      const eligibleCards = cardsByRarity[rarity] || [];
      if (eligibleCards.length === 0) {
        console.log(`  No cards for rarity: ${rarity}`);
        continue;
      }

      // Calculate individual weight per card
      const perCardWeight = Math.round(weight / eligibleCards.length * 10);

      // Calculate individual odds percentage
      const perCardOdds = weight / eligibleCards.length;

      for (const card of eligibleCards) {
        packCards.push({
          pack_id: pack.id,
          card_id: card.id,
          weight: Math.max(1, perCardWeight),
          odds_percentage: Math.round(perCardOdds * 100) / 100, // Round to 2 decimals
        });
      }

      console.log(`  ${rarity}: ${eligibleCards.length} cards @ ${perCardWeight} weight each`);
    }
  }

  console.log(`\nInserting ${packCards.length} pack_cards entries...`);

  // Batch insert in chunks of 100
  const chunkSize = 100;
  let inserted = 0;

  for (let i = 0; i < packCards.length; i += chunkSize) {
    const chunk = packCards.slice(i, i + chunkSize);
    await insertData('pack_cards', chunk);
    inserted += chunk.length;
    console.log(`  Inserted ${inserted}/${packCards.length}`);
  }

  console.log('\n✅ Seeding complete!');

  // Verify counts
  const packCardsCount = await fetchData('pack_cards', 'count');
  console.log(`Total pack_cards in database: ${packCardsCount.length > 0 ? 'verified' : 'empty'}`);
}

main().catch(console.error);
