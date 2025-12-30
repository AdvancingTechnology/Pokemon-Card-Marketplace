import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Seed data for Pokemon cards
const commonCards = [
  { name: 'Pikachu', set_name: 'Base Set', rarity: 'common', market_price: 8.50, image_url: 'https://images.pokemontcg.io/base1/58.png' },
  { name: 'Charmander', set_name: 'Base Set', rarity: 'common', market_price: 7.00, image_url: 'https://images.pokemontcg.io/base1/46.png' },
  { name: 'Squirtle', set_name: 'Base Set', rarity: 'common', market_price: 6.50, image_url: 'https://images.pokemontcg.io/base1/63.png' },
  { name: 'Bulbasaur', set_name: 'Base Set', rarity: 'common', market_price: 6.00, image_url: 'https://images.pokemontcg.io/base1/44.png' },
  { name: 'Rattata', set_name: 'Base Set', rarity: 'common', market_price: 1.50, image_url: 'https://images.pokemontcg.io/base1/61.png' },
  { name: 'Pidgey', set_name: 'Base Set', rarity: 'common', market_price: 1.25, image_url: 'https://images.pokemontcg.io/base1/57.png' },
  { name: 'Weedle', set_name: 'Base Set', rarity: 'common', market_price: 1.00, image_url: 'https://images.pokemontcg.io/base1/69.png' },
  { name: 'Caterpie', set_name: 'Base Set', rarity: 'common', market_price: 1.00, image_url: 'https://images.pokemontcg.io/base1/45.png' },
  { name: 'Eevee', set_name: 'Evolving Skies', rarity: 'common', market_price: 2.50, image_url: 'https://images.pokemontcg.io/swsh7/101.png' },
  { name: 'Pikachu', set_name: 'Crown Zenith', rarity: 'common', market_price: 3.00, image_url: 'https://images.pokemontcg.io/swsh12pt5/SWSH204.png' },
  { name: 'Sobble', set_name: 'Sword & Shield', rarity: 'common', market_price: 1.50, image_url: 'https://images.pokemontcg.io/swsh1/54.png' },
  { name: 'Scorbunny', set_name: 'Sword & Shield', rarity: 'common', market_price: 1.50, image_url: 'https://images.pokemontcg.io/swsh1/30.png' },
  { name: 'Grookey', set_name: 'Sword & Shield', rarity: 'common', market_price: 1.50, image_url: 'https://images.pokemontcg.io/swsh1/11.png' },
  { name: 'Wooloo', set_name: 'Sword & Shield', rarity: 'common', market_price: 1.25, image_url: 'https://images.pokemontcg.io/swsh1/153.png' },
  { name: 'Yamper', set_name: 'Sword & Shield', rarity: 'common', market_price: 1.75, image_url: 'https://images.pokemontcg.io/swsh1/73.png' },
]

const uncommonCards = [
  { name: 'Raichu', set_name: 'Base Set', rarity: 'uncommon', market_price: 25.00, image_url: 'https://images.pokemontcg.io/base1/14.png' },
  { name: 'Charmeleon', set_name: 'Base Set', rarity: 'uncommon', market_price: 18.00, image_url: 'https://images.pokemontcg.io/base1/24.png' },
  { name: 'Wartortle', set_name: 'Base Set', rarity: 'uncommon', market_price: 15.00, image_url: 'https://images.pokemontcg.io/base1/42.png' },
  { name: 'Ivysaur', set_name: 'Base Set', rarity: 'uncommon', market_price: 14.00, image_url: 'https://images.pokemontcg.io/base1/30.png' },
  { name: 'Pidgeotto', set_name: 'Base Set', rarity: 'uncommon', market_price: 10.00, image_url: 'https://images.pokemontcg.io/base1/22.png' },
  { name: 'Haunter', set_name: 'Base Set', rarity: 'uncommon', market_price: 12.00, image_url: 'https://images.pokemontcg.io/base1/29.png' },
  { name: 'Kadabra', set_name: 'Base Set', rarity: 'uncommon', market_price: 11.00, image_url: 'https://images.pokemontcg.io/base1/32.png' },
  { name: 'Machoke', set_name: 'Base Set', rarity: 'uncommon', market_price: 10.50, image_url: 'https://images.pokemontcg.io/base1/34.png' },
  { name: 'Dragonair', set_name: 'Evolving Skies', rarity: 'uncommon', market_price: 22.00, image_url: 'https://images.pokemontcg.io/swsh7/117.png' },
  { name: 'Jolteon', set_name: 'Evolving Skies', rarity: 'uncommon', market_price: 35.00, image_url: 'https://images.pokemontcg.io/swsh7/136.png' },
  { name: 'Vaporeon', set_name: 'Evolving Skies', rarity: 'uncommon', market_price: 32.00, image_url: 'https://images.pokemontcg.io/swsh7/30.png' },
  { name: 'Flareon', set_name: 'Evolving Skies', rarity: 'uncommon', market_price: 30.00, image_url: 'https://images.pokemontcg.io/swsh7/26.png' },
  { name: 'Lucario', set_name: 'Brilliant Stars', rarity: 'uncommon', market_price: 28.00, image_url: 'https://images.pokemontcg.io/swsh9/79.png' },
  { name: 'Garchomp', set_name: 'Astral Radiance', rarity: 'uncommon', market_price: 25.00, image_url: 'https://images.pokemontcg.io/swsh10/117.png' },
  { name: 'Gengar', set_name: 'Lost Origin', rarity: 'uncommon', market_price: 45.00, image_url: 'https://images.pokemontcg.io/swsh11/66.png' },
]

const rareCards = [
  { name: 'Charizard', set_name: 'Base Set', rarity: 'rare', market_price: 180.00, image_url: 'https://images.pokemontcg.io/base1/4.png' },
  { name: 'Blastoise', set_name: 'Base Set', rarity: 'rare', market_price: 120.00, image_url: 'https://images.pokemontcg.io/base1/2.png' },
  { name: 'Venusaur', set_name: 'Base Set', rarity: 'rare', market_price: 95.00, image_url: 'https://images.pokemontcg.io/base1/15.png' },
  { name: 'Alakazam', set_name: 'Base Set', rarity: 'rare', market_price: 75.00, image_url: 'https://images.pokemontcg.io/base1/1.png' },
  { name: 'Gyarados', set_name: 'Base Set', rarity: 'rare', market_price: 85.00, image_url: 'https://images.pokemontcg.io/base1/6.png' },
  { name: 'Mewtwo', set_name: 'Base Set', rarity: 'rare', market_price: 90.00, image_url: 'https://images.pokemontcg.io/base1/10.png' },
  { name: 'Zapdos', set_name: 'Base Set', rarity: 'rare', market_price: 70.00, image_url: 'https://images.pokemontcg.io/base1/16.png' },
  { name: 'Moltres', set_name: 'Fossil', rarity: 'rare', market_price: 65.00, image_url: 'https://images.pokemontcg.io/base2/12.png' },
  { name: 'Articuno', set_name: 'Fossil', rarity: 'rare', market_price: 68.00, image_url: 'https://images.pokemontcg.io/base2/2.png' },
  { name: 'Dragonite', set_name: 'Fossil', rarity: 'rare', market_price: 150.00, image_url: 'https://images.pokemontcg.io/base2/4.png' },
  { name: 'Pikachu V', set_name: 'Vivid Voltage', rarity: 'rare', market_price: 55.00, image_url: 'https://images.pokemontcg.io/swsh4/43.png' },
  { name: 'Charizard V', set_name: 'Darkness Ablaze', rarity: 'rare', market_price: 85.00, image_url: 'https://images.pokemontcg.io/swsh3/19.png' },
  { name: 'Rayquaza V', set_name: 'Evolving Skies', rarity: 'rare', market_price: 75.00, image_url: 'https://images.pokemontcg.io/swsh7/110.png' },
  { name: 'Umbreon V', set_name: 'Evolving Skies', rarity: 'rare', market_price: 95.00, image_url: 'https://images.pokemontcg.io/swsh7/94.png' },
  { name: 'Mew V', set_name: 'Fusion Strike', rarity: 'rare', market_price: 60.00, image_url: 'https://images.pokemontcg.io/swsh8/113.png' },
  { name: 'Arceus V', set_name: 'Brilliant Stars', rarity: 'rare', market_price: 70.00, image_url: 'https://images.pokemontcg.io/swsh9/122.png' },
]

const ultraRareCards = [
  { name: 'Charizard VMAX', set_name: 'Darkness Ablaze', rarity: 'ultra rare', market_price: 280.00, image_url: 'https://images.pokemontcg.io/swsh3/20.png' },
  { name: 'Pikachu VMAX', set_name: 'Vivid Voltage', rarity: 'ultra rare', market_price: 320.00, image_url: 'https://images.pokemontcg.io/swsh4/44.png' },
  { name: 'Rayquaza VMAX', set_name: 'Evolving Skies', rarity: 'ultra rare', market_price: 250.00, image_url: 'https://images.pokemontcg.io/swsh7/111.png' },
  { name: 'Umbreon VMAX', set_name: 'Evolving Skies', rarity: 'ultra rare', market_price: 450.00, image_url: 'https://images.pokemontcg.io/swsh7/95.png' },
  { name: 'Mew VMAX', set_name: 'Fusion Strike', rarity: 'ultra rare', market_price: 220.00, image_url: 'https://images.pokemontcg.io/swsh8/114.png' },
  { name: 'Gengar VMAX', set_name: 'Fusion Strike', rarity: 'ultra rare', market_price: 195.00, image_url: 'https://images.pokemontcg.io/swsh8/157.png' },
  { name: 'Espeon VMAX', set_name: 'Evolving Skies', rarity: 'ultra rare', market_price: 380.00, image_url: 'https://images.pokemontcg.io/swsh7/65.png' },
  { name: 'Dragonite V Alt Art', set_name: 'Evolving Skies', rarity: 'ultra rare', market_price: 285.00, image_url: 'https://images.pokemontcg.io/swsh7/192.png' },
  { name: 'Sylveon VMAX', set_name: 'Evolving Skies', rarity: 'ultra rare', market_price: 350.00, image_url: 'https://images.pokemontcg.io/swsh7/75.png' },
  { name: 'Glaceon VMAX', set_name: 'Evolving Skies', rarity: 'ultra rare', market_price: 290.00, image_url: 'https://images.pokemontcg.io/swsh7/41.png' },
  { name: 'Arceus VSTAR', set_name: 'Brilliant Stars', rarity: 'ultra rare', market_price: 210.00, image_url: 'https://images.pokemontcg.io/swsh9/123.png' },
  { name: 'Charizard VSTAR', set_name: 'Brilliant Stars', rarity: 'ultra rare', market_price: 480.00, image_url: 'https://images.pokemontcg.io/swsh9/18.png' },
]

const secretRareCards = [
  { name: 'Charizard 1st Edition', set_name: 'Base Set', rarity: 'secret rare', market_price: 4500.00, image_url: 'https://images.pokemontcg.io/base1/4.png' },
  { name: 'Charizard Gold Star', set_name: 'Dragon Frontiers', rarity: 'secret rare', market_price: 3800.00, image_url: 'https://images.pokemontcg.io/ex14/100.png' },
  { name: 'Pikachu Illustrator', set_name: 'Promo', rarity: 'secret rare', market_price: 5000.00, image_url: 'https://images.pokemontcg.io/basep/4.png' },
  { name: 'Umbreon VMAX Alt Art', set_name: 'Evolving Skies', rarity: 'secret rare', market_price: 850.00, image_url: 'https://images.pokemontcg.io/swsh7/215.png' },
  { name: 'Rayquaza VMAX Alt Art', set_name: 'Evolving Skies', rarity: 'secret rare', market_price: 520.00, image_url: 'https://images.pokemontcg.io/swsh7/218.png' },
  { name: 'Moonbreon', set_name: 'Evolving Skies', rarity: 'secret rare', market_price: 680.00, image_url: 'https://images.pokemontcg.io/swsh7/244.png' },
  { name: 'Charizard Rainbow Rare', set_name: 'Champions Path', rarity: 'secret rare', market_price: 550.00, image_url: 'https://images.pokemontcg.io/swsh35/74.png' },
  { name: 'Lugia V Alt Art', set_name: 'Silver Tempest', rarity: 'secret rare', market_price: 580.00, image_url: 'https://images.pokemontcg.io/swsh12/186.png' },
  { name: 'Giratina V Alt Art', set_name: 'Lost Origin', rarity: 'secret rare', market_price: 620.00, image_url: 'https://images.pokemontcg.io/swsh11/186.png' },
  { name: 'Mew Gold', set_name: 'Celebrations', rarity: 'secret rare', market_price: 720.00, image_url: 'https://images.pokemontcg.io/cel25/25.png' },
  { name: 'Charizard UPC Promo', set_name: 'Ultra Premium Collection', rarity: 'secret rare', market_price: 950.00, image_url: 'https://images.pokemontcg.io/swsh12pt5gg/GG70.png' },
  { name: 'Shiny Charizard VMAX', set_name: 'Shining Fates', rarity: 'secret rare', market_price: 750.00, image_url: 'https://images.pokemontcg.io/swsh45sv/SV107.png' },
  { name: 'Blastoise 1st Edition', set_name: 'Base Set', rarity: 'secret rare', market_price: 2800.00, image_url: 'https://images.pokemontcg.io/base1/2.png' },
  { name: 'Venusaur 1st Edition', set_name: 'Base Set', rarity: 'secret rare', market_price: 1800.00, image_url: 'https://images.pokemontcg.io/base1/15.png' },
]

const packs = [
  { name: 'Bronze Pack', description: 'Entry-level pack with common and uncommon cards. Great for beginners building their collection!', gem_cost: 500, image_url: '/images/packs/bronze-pack.png' },
  { name: 'Silver Pack', description: 'Mid-tier pack with better odds for rare cards. Solid value for growing collectors.', gem_cost: 1500, image_url: '/images/packs/silver-pack.png' },
  { name: 'Gold Pack', description: 'Premium pack with excellent rare and ultra rare odds. For serious collectors.', gem_cost: 5000, image_url: '/images/packs/gold-pack.png' },
  { name: 'Legendary Pack', description: 'The ultimate pack! Best odds for secret rares and chase cards. High risk, high reward!', gem_cost: 15000, image_url: '/images/packs/legendary-pack.png' },
]

export async function POST(request: NextRequest) {
  // Verify admin secret
  const authHeader = request.headers.get('authorization')
  const adminSecret = process.env.ADMIN_SEED_SECRET || 'slab-safari-seed-2024'

  if (authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const results: Record<string, unknown> = {}

    // Insert all cards
    const allCards = [...commonCards, ...uncommonCards, ...rareCards, ...ultraRareCards, ...secretRareCards]
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .upsert(allCards, { onConflict: 'name,set_name', ignoreDuplicates: true })
      .select()

    if (cardError) {
      results.cards = { error: cardError.message }
    } else {
      results.cards = { count: allCards.length, inserted: cardData?.length || 0 }
    }

    // Insert packs
    const { data: packData, error: packError } = await supabase
      .from('packs')
      .upsert(packs, { onConflict: 'name', ignoreDuplicates: true })
      .select()

    if (packError) {
      results.packs = { error: packError.message }
    } else {
      results.packs = { count: packs.length, inserted: packData?.length || 0 }
    }

    // Get all cards and packs for pack_cards mapping
    const { data: allCardsDb } = await supabase.from('cards').select('id, name, set_name, rarity, market_price')
    const { data: allPacksDb } = await supabase.from('packs').select('id, name')

    if (allCardsDb && allPacksDb) {
      const packCards: { pack_id: string; card_id: string; weight: number }[] = []

      for (const pack of allPacksDb) {
        for (const card of allCardsDb) {
          let weight = 0

          if (pack.name === 'Bronze Pack') {
            if (card.rarity === 'common') weight = 60
            else if (card.rarity === 'uncommon') weight = 35
            else if (card.rarity === 'rare' && (card.market_price || 0) <= 100) weight = 5
          } else if (pack.name === 'Silver Pack') {
            if (card.rarity === 'common') weight = 30
            else if (card.rarity === 'uncommon') weight = 45
            else if (card.rarity === 'rare') weight = 20
            else if (card.rarity === 'ultra rare' && (card.market_price || 0) <= 300) weight = 5
          } else if (pack.name === 'Gold Pack') {
            if (card.rarity === 'uncommon') weight = 20
            else if (card.rarity === 'rare') weight = 40
            else if (card.rarity === 'ultra rare') weight = 30
            else if (card.rarity === 'secret rare' && (card.market_price || 0) <= 800) weight = 10
          } else if (pack.name === 'Legendary Pack') {
            if (card.rarity === 'rare' && (card.market_price || 0) >= 70) weight = 15
            else if (card.rarity === 'ultra rare') weight = 40
            else if (card.rarity === 'secret rare') weight = 45
          }

          if (weight > 0) {
            packCards.push({ pack_id: pack.id, card_id: card.id, weight })
          }
        }
      }

      const { error: packCardError } = await supabase
        .from('pack_cards')
        .upsert(packCards, { onConflict: 'pack_id,card_id', ignoreDuplicates: true })

      if (packCardError) {
        results.pack_cards = { error: packCardError.message }
      } else {
        results.pack_cards = { count: packCards.length }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Database seeded successfully!',
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
