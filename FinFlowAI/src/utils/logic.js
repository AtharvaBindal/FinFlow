// src/utils/logic.js

export const KEYWORDS = {
  Food: ['food','eat','restaurant','pizza','burger','coffee','cafe','lunch','dinner','breakfast','snack','grocery','groceries','swiggy','zomato','milk','bread','rice','vegetable','fruit','meal', 'reliance', 'mcdonald', 'starbucks'],
  Transport: ['uber','ola','auto','taxi','petrol','shell','fuel','metro','bus','train','flight','cab','rickshaw'],
  Shopping: ['amazon','flipkart','myntra','shop','buy','cloth','clothes','shirt','dress','shoes','purchase','mall'],
  Health: ['doctor','medicine','pharma','pharmacy','hospital','gym','fitness','yoga','medical','tablet','clinic'],
  Entertainment: ['netflix','movie','game','spotify','hotstar','prime','ticket','show','concert','book'],
  Bills: ['electricity','bill','rent','internet','wifi','broadband','mobile','recharge','gas','water','insurance','airtel','jio'],
  Education: ['course','class','school','college','tuition','book','study','learn','udemy','coursera'],
};

// 1. "Laziness Bypass" NLP Smart Input Parser
// Extracts Amount, Merchant, Category, Date from a natural language string.
export const parseMagicInput = (input) => {
  const result = {
    amount: null,
    merchant: 'Unknown',
    category: 'Other',
    date: new Date().toISOString().slice(0, 10),
  };

  // Extract Amount (e.g. 1500, $20, 50.50)
  const amtMatch = input.match(/\d+(\.\d+)?/);
  if (amtMatch) result.amount = parseFloat(amtMatch[0]);

  // Extract Date Keywords (today, yesterday)
  if (input.toLowerCase().includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    result.date = d.toISOString().slice(0, 10);
  }

  // Extract Merchant/Category using keywords
  const lower = input.toLowerCase();
  
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    for (const kw of kws) {
      if (lower.includes(kw)) {
        result.category = cat;
        // Simple mock to extract matching word as merchant
        result.merchant = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }
  }

  // Fallback heuristic for merchant if not found in kw (at/to someone)
  if (result.merchant === 'Unknown') {
    const atMatch = input.match(/at\s+([A-Za-z]+)/i);
    if (atMatch) result.merchant = atMatch[1];
    else {
      const toMatch = input.match(/to\s+([A-Za-z]+)/i);
      if (toMatch) result.merchant = toMatch[1];
    }
  }

  return result;
};

// 2. "Recurring Recipient" Guilt-Trip Scanner
// Trigger if same non-essential merchant paid >3 times in 7 days
export const checkGuiltTrip = (transactions, newMerchant, newCategory) => {
  // Only trigger for non-essentials
  if (['Bills', 'Health', 'Education'].includes(newCategory)) return null;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentTxs = transactions.filter(t => new Date(t.date) >= weekAgo);
  
  const count = recentTxs.filter(t => t.merchant.toLowerCase() === newMerchant.toLowerCase()).length;
  
  if (count >= 3) {
    return `You've paid '${newMerchant}' ${count + 1} times this week. Are you a customer or a shareholder? Your goal just cried a little.`;
  }
  return null;
};
