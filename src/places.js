// ── Curated Indian & Popular Destinations + Global Autocomplete ──

export const INDIAN_DESTINATIONS = [
  // Himachal Pradesh
  { name: 'Jibhi', state: 'Himachal Pradesh', aliases: ['jibbi', 'jibhi', 'jibhi waterfall', 'tirthan', 'banjar', 'kullu', 'jalori pass'] },
  { name: 'Shimla', state: 'Himachal Pradesh', aliases: ['simla', 'shimla', 'kufri', 'mashobra', 'shoghi', 'naldehra'] },
  { name: 'Dharamshala', state: 'Himachal Pradesh', aliases: ['dhramshala', 'dharamshala', 'dharamsala', 'kangra', 'triund', 'kotwali'] },
  { name: 'McLeod Ganj', state: 'Himachal Pradesh', aliases: ['mcleod', 'mcleodganj', 'mcleod ganj', 'bhagsunag', 'bhagsu', 'dharamkot'] },
  { name: 'Manali', state: 'Himachal Pradesh', aliases: ['manali', 'old manali', 'solang', 'solang valley', 'atal tunnel', 'rohtang pass', 'vashisht'] },
  { name: 'Kasol', state: 'Himachal Pradesh', aliases: ['kasol', 'parvati valley', 'chalal', 'manikaran', 'grahan'] },
  { name: 'Spiti Valley', state: 'Himachal Pradesh', aliases: ['spiti', 'kaza', 'key monastery', 'kibber', 'chandratal', 'hikkim', 'langza', 'pin valley'] },
  { name: 'Bir Billing', state: 'Himachal Pradesh', aliases: ['bir', 'billing', 'bir billing', 'paragliding', 'tibetan colony'] },
  { name: 'Tirthan Valley', state: 'Himachal Pradesh', aliases: ['tirthan', 'tirthan valley', 'gushaini', 'great himalayan national park', 'ghnp'] },
  { name: 'Tosh', state: 'Himachal Pradesh', aliases: ['tosh', 'tosh village', 'kutla', 'parvati'] },
  { name: 'Kheerganga', state: 'Himachal Pradesh', aliases: ['kheerganga', 'khirganga', 'barshaini'] },
  { name: 'Dalhousie', state: 'Himachal Pradesh', aliases: ['dalhousie', 'khajjiar', 'chamba', 'dainkund'] },
  { name: 'Kasauli', state: 'Himachal Pradesh', aliases: ['kasauli', 'solan', 'gilbert trail'] },
  { name: 'Chitkul', state: 'Himachal Pradesh', aliases: ['chitkul', 'last indian village', 'sangla', 'kinnaur'] },
  { name: 'Kalpa', state: 'Himachal Pradesh', aliases: ['kalpa', 'kinnaur kailash', 'reckong peo'] },
  { name: 'Shoja', state: 'Himachal Pradesh', aliases: ['shoja', 'jalori', 'serolsar lake'] },

  // Uttarakhand
  { name: 'Rishikesh', state: 'Uttarakhand', aliases: ['rishikesh', 'laxman jhula', 'ram jhula', 'tapovan', 'shivpuri', 'ganga'] },
  { name: 'Mussoorie', state: 'Uttarakhand', aliases: ['mussoorie', 'mussourie', 'landour', 'kempty falls', 'george everest'] },
  { name: 'Nainital', state: 'Uttarakhand', aliases: ['nainital', 'naini lake', 'bhimtal', 'sattal', 'naukuchiatal', 'pangot'] },
  { name: 'Auli', state: 'Uttarakhand', aliases: ['auli', 'skiing auli', 'joshimath', 'chamoli'] },
  { name: 'Chopta', state: 'Uttarakhand', aliases: ['chopta', 'tungnath', 'chandrashila', 'deoriatal', 'mini switzerland'] },
  { name: 'Dehradun', state: 'Uttarakhand', aliases: ['dehradun', 'robbers cave', 'sahastradhara'] },
  { name: 'Lansdowne', state: 'Uttarakhand', aliases: ['lansdowne', 'pauri garhwal', 'bhulla lake'] },
  { name: 'Jim Corbett', state: 'Uttarakhand', aliases: ['jim corbett', 'corbett national park', 'ramnagar'] },
  { name: 'Almora', state: 'Uttarakhand', aliases: ['almora', 'kasar devi', 'binsar'] },
  { name: 'Mukteshwar', state: 'Uttarakhand', aliases: ['mukteshwar', 'chauli ki jali'] },
  { name: 'Valley of Flowers', state: 'Uttarakhand', aliases: ['valley of flowers', 'hemkund sahib', 'govindghat'] },
  { name: 'Kedarnath', state: 'Uttarakhand', aliases: ['kedarnath', 'gaurikund', 'char dham'] },

  // Goa
  { name: 'Goa', state: 'Goa', aliases: ['goa', 'north goa', 'south goa', 'panaji', 'panjim', 'calangute', 'baga', 'anjuna', 'vagator', 'arambol', 'palolem', 'morjim', 'candolim', 'ashwem', 'agonda'] },

  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', aliases: ['jaipur', 'pink city', 'amer fort', 'hawa mahal', 'nahargarh', 'chokhi dhani'] },
  { name: 'Udaipur', state: 'Rajasthan', aliases: ['udaipur', 'city of lakes', 'lake pichola', 'fateh sagar', 'city palace'] },
  { name: 'Jodhpur', state: 'Rajasthan', aliases: ['jodhpur', 'blue city', 'mehrangarh', 'jaswant thada'] },
  { name: 'Jaisalmer', state: 'Rajasthan', aliases: ['jaisalmer', 'golden city', 'sam sand dunes', 'thar desert', 'jaisalmer fort'] },
  { name: 'Pushkar', state: 'Rajasthan', aliases: ['pushkar', 'pushkar lake', 'brahma temple'] },
  { name: 'Mount Abu', state: 'Rajasthan', aliases: ['mount abu', 'nakki lake', 'guru shikhar', 'dilwara'] },

  // Ladakh & Kashmir
  { name: 'Leh Ladakh', state: 'Ladakh', aliases: ['leh', 'ladakh', 'pangong', 'pangong tso', 'nubra valley', 'khardung la', 'magnetic hill', 'zanskar'] },
  { name: 'Srinagar', state: 'Jammu & Kashmir', aliases: ['srinagar', 'dal lake', 'houseboat', 'kashmir', 'shalimar bagh'] },
  { name: 'Gulmarg', state: 'Jammu & Kashmir', aliases: ['gulmarg', 'gondola', 'snow skiing'] },
  { name: 'Pahalgam', state: 'Jammu & Kashmir', aliases: ['pahalgam', 'betaab valley', 'aru valley', 'baisaran'] },

  // South India
  { name: 'Munnar', state: 'Kerala', aliases: ['munnar', 'tea gardens', 'eravikulam', 'mattupetty', 'top station'] },
  { name: 'Alleppey', state: 'Kerala', aliases: ['alleppey', 'alappuzha', 'backwaters', 'houseboat', 'marari beach'] },
  { name: 'Wayanad', state: 'Kerala', aliases: ['wayanad', 'chembra peak', 'banasura sagar', 'edakkal caves'] },
  { name: 'Varkala', state: 'Kerala', aliases: ['varkala', 'varkala cliff', 'papanasam beach'] },
  { name: 'Kochi', state: 'Kerala', aliases: ['kochi', 'cochin', 'fort kochi', 'mattancherry', 'marine drive'] },
  { name: 'Ooty', state: 'Tamil Nadu', aliases: ['ooty', 'udhagamandalam', 'nilgiris', 'doddabetta', 'botanical gardens'] },
  { name: 'Kodaikanal', state: 'Tamil Nadu', aliases: ['kodaikanal', 'kodai', 'kodai lake', 'coakers walk', 'pillar rocks'] },
  { name: 'Coorg', state: 'Karnataka', aliases: ['coorg', 'madikeri', 'kodagu', 'rajas seat', 'abbey falls', 'coffee estates'] },
  { name: 'Gokarna', state: 'Karnataka', aliases: ['gokarna', 'om beach', 'kudle beach', 'half moon beach', 'paradise beach'] },
  { name: 'Chikmagalur', state: 'Karnataka', aliases: ['chikmagalur', 'chikkamagaluru', 'mullayanagiri', 'baba budangiri', 'coffee'] },
  { name: 'Hampi', state: 'Karnataka', aliases: ['hampi', 'vijayanagara', 'virupaksha', 'hippie island'] },
  { name: 'Pondicherry', state: 'Puducherry', aliases: ['pondicherry', 'puducherry', 'pondy', 'auroville', 'white town', 'promenade beach'] },

  // North East & East
  { name: 'Darjeeling', state: 'West Bengal', aliases: ['darjeeling', 'tiger hill', 'ghoom', 'tea garden', 'batasia loop'] },
  { name: 'Gangtok', state: 'Sikkim', aliases: ['gangtok', 'tsomgo lake', 'nathula', 'mg marg', 'sikkim'] },
  { name: 'Pelling', state: 'Sikkim', aliases: ['pelling', 'kanchenjunga view', 'skywalk'] },
  { name: 'Shillong', state: 'Meghalaya', aliases: ['shillong', 'scotland of the east', 'elephanta falls', 'police bazar'] },
  { name: 'Cherrapunji', state: 'Meghalaya', aliases: ['cherrapunji', 'sohra', 'nohkalikai falls', 'double decker living root bridge'] },
  { name: 'Dawki', state: 'Meghalaya', aliases: ['dawki', 'umngot river', 'clean river', 'shnongpdeng'] },

  // Islands
  { name: 'Andaman Islands', state: 'Andaman & Nicobar', aliases: ['andaman', 'havelock', 'radhanagar beach', 'neil island', 'port blair', 'swaraj dweep', 'ross island'] },

  // Heritage & Cities
  { name: 'Varanasi', state: 'Uttar Pradesh', aliases: ['varanasi', 'banaras', 'kashi', 'assi ghat', 'dashashwamedh', 'ganga aarti'] },
  { name: 'Agra', state: 'Uttar Pradesh', aliases: ['agra', 'taj mahal', 'agra fort', 'fatehpur sikri'] },
  { name: 'Amritsar', state: 'Punjab', aliases: ['amritsar', 'golden temple', 'wagah border'] },
  { name: 'Chandigarh', state: 'Chandigarh', aliases: ['chandigarh', 'rock garden', 'sukhna lake'] },
  { name: 'Delhi', state: 'Delhi', aliases: ['delhi', 'new delhi', 'qutub minar', 'india gate', 'connaught place', 'cp', 'chandni chowk'] },
  { name: 'Mumbai', state: 'Maharashtra', aliases: ['mumbai', 'bombay', 'marine drive', 'bandra', 'colaba', 'juhu'] },
  { name: 'Pune', state: 'Maharashtra', aliases: ['pune', 'lonavala', 'khandala', 'lavasa', 'mulshi'] },
  { name: 'Mahabaleshwar', state: 'Maharashtra', aliases: ['mahabaleshwar', 'panchgani', 'arthurs seat', 'strawberry'] },
  { name: 'Bengaluru', state: 'Karnataka', aliases: ['bengaluru', 'bangalore', 'cubbon park', 'indiranagar', 'koramangala'] },
  { name: 'Hyderabad', state: 'Telangana', aliases: ['hyderabad', 'charminar', 'golconda', 'hussain sagar'] },
  { name: 'Kolkata', state: 'West Bengal', aliases: ['kolkata', 'calcutta', 'victoria memorial', 'howrah bridge'] },
  { name: 'Chennai', state: 'Tamil Nadu', aliases: ['chennai', 'madras', 'marina beach', 'besant nagar'] }
]

// Default suggested places shown when input is blank
export const FEATURED_PLACES = [
  { value: 'Jibhi, Himachal Pradesh, India', label: 'Jibhi, Himachal Pradesh' },
  { value: 'Shimla, Himachal Pradesh, India', label: 'Shimla, Himachal Pradesh' },
  { value: 'Dharamshala, Himachal Pradesh, India', label: 'Dharamshala, Himachal Pradesh' },
  { value: 'McLeod Ganj, Himachal Pradesh, India', label: 'McLeod Ganj, Himachal Pradesh' },
  { value: 'Manali, Himachal Pradesh, India', label: 'Manali, Himachal Pradesh' },
  { value: 'Kasol, Himachal Pradesh, India', label: 'Kasol, Himachal Pradesh' },
  { value: 'Rishikesh, Uttarakhand, India', label: 'Rishikesh, Uttarakhand' },
  { value: 'Mussoorie, Uttarakhand, India', label: 'Mussoorie, Uttarakhand' },
  { value: 'Goa, India', label: 'Goa' },
  { value: 'Udaipur, Rajasthan, India', label: 'Udaipur, Rajasthan' },
  { value: 'Leh Ladakh, India', label: 'Leh Ladakh' },
  { value: 'Munnar, Kerala, India', label: 'Munnar, Kerala' },
]

/**
 * Searches the curated list synchronously
 */
export function searchLocalDestinations(query) {
  if (!query || !query.trim()) return []
  const norm = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  if (norm.length < 2) return []

  const results = []
  const seen = new Set()

  for (const item of INDIAN_DESTINATIONS) {
    const nameNorm = item.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const stateNorm = item.state.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    const matchesName = nameNorm.includes(norm) || norm.includes(nameNorm)
    const matchesState = stateNorm.includes(norm)
    const matchesAlias = item.aliases.some(a => {
      const aNorm = a.toLowerCase().replace(/[^a-z0-9]/g, '')
      return aNorm.includes(norm) || norm.includes(aNorm)
    })

    if (matchesName || matchesState || matchesAlias) {
      const value = `${item.name}, ${item.state}, India`
      if (!seen.has(value)) {
        seen.add(value)
        results.push({
          value,
          label: `${item.name}, ${item.state}`,
          isLocal: true
        })
      }
    }
  }

  return results
}

/**
 * Photon (Komoot) remote search for worldwide places with fast fallback
 */
export async function searchPhotonPlaces(query) {
  if (!query || query.trim().length < 2) return []
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=8`
    )
    if (!res.ok) return []
    const data = await res.json()
    const list = []
    const seen = new Set()

    for (const f of data.features || []) {
      const p = f.properties || {}
      const name = p.name || ''
      if (!name) continue
      const state = p.state || p.county || ''
      const country = p.country || ''
      const parts = [name, state, country].filter(Boolean)
      const value = parts.join(', ')
      const label = state ? `${name}, ${state}` : (country ? `${name}, ${country}` : name)
      if (!seen.has(value)) {
        seen.add(value)
        list.push({ value, label, isLocal: false })
      }
    }
    return list
  } catch {
    return []
  }
}
