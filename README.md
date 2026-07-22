RationIQ 🧾

A smart household grocery/ration budget tracker built for Pakistani families.

📌 Problem Statement

Managing a monthly ration/grocery budget is a daily struggle for most Pakistani households. Prices fluctuate constantly, spending happens across dozens of small unrecorded purchases (dukaan, thoke ka bazaar, sabzi wala), and by the end of the month most families have no clear picture of where their money actually went. Existing budgeting apps are built for Western currencies and spending habits — they don't understand Roman Urdu grocery lists, PKR formatting, or the local shopping culture (wholesale markets, seasonal produce, etc.).

RationIQ solves this for middle-class Pakistani households and individuals managing their own or family grocery budgets — anyone who wants a simple way to log expenses and instantly understand their spending patterns, without manually typing and categorizing every single item.

🔗 Live Demo

[Insert your live Vercel URL here]

Try it yourself — set a monthly budget, paste a sample grocery list, and see RationIQ categorize it automatically.

✨ Features
Monthly Budget Setting — Set your ration budget in PKR at the start of each month
Manual Expense Logging — Add individual grocery items with name, category, amount, and date
Smart Categorization — Items are grouped into Dairy, Produce, Grains, Meat, Household, and Other
Visual Spending Dashboard — See total spent, remaining budget, and a category-wise bar chart at a glance
Editable Expense List — Edit or delete any logged expense
AI-Powered Receipt Analyzer — Paste a raw grocery list (in English, Roman Urdu, or a mix) and let AI parse, categorize, and log it automatically
AI Money-Saving Suggestions — Get 2-3 practical, locally-relevant tips based on your actual spending pattern
PKR-Native Formatting — All amounts displayed in familiar Pakistani Rupee format (Rs. 5,000)
Persistent Data — Your budget and expense history are saved between sessions
Mobile-Friendly Design — Fully usable on phones, since most users will check their budget on the go
🤖 The AI Feature

The core AI feature addresses the single biggest friction point in expense tracking: manually entering and categorizing every item.

How it works:

The user pastes a raw, unstructured grocery list or receipt text — exactly as they'd naturally write it, e.g.:

"doodh 200, chawal 5kg 900, sabun 150, murghi 800"

This text is sent to the Gemini API
The AI extracts each item, assigns it the correct category, and returns structured data
The app automatically adds these as logged expenses — no manual data entry needed
The AI also analyzes the spending pattern and returns short, practical, culturally-relevant money-saving tips in Roman Urdu

System Instruction used for the AI:

You are a grocery expense categorizer for a Pakistani household budget app called
"RationIQ". Given raw text of grocery items (may be in English, Roman Urdu, or a
mix, with prices in PKR), extract each item and return ONLY valid JSON in this
format:
[
  {"item": "Doodh (Milk)", "category": "Dairy", "amount": 200},
  {"item": "Chawal 5kg (Rice)", "category": "Grains", "amount": 900}
]
Categories allowed: Dairy, Produce, Grains, Meat, Household, Other. All amounts
are in PKR (just the number, no symbol in the JSON).

After the JSON, on a new line, add "SUGGESTIONS:" followed by 2-3 short, practical
money-saving tips in simple Roman Urdu, relevant to Pakistani households (e.g.
buying from wholesale/thoke ka bazaar, seasonal sabzi/fruit, avoiding branded
items when local options exist).

This design choice — supporting Roman Urdu input and returning culturally relevant suggestions — is what makes the AI feature genuinely useful for the target audience, rather than a generic bolt-on chatbot.

🛠️ Tools, Services & Models Used
Category	Tool/Service
App Builder	Google AI Studio (Build)
AI Model	Gemini API
Frontend	React + Tailwind CSS
Data Storage	Browser local storage
Version Control	GitHub
Hosting/Deployment	Vercel
 

Replace these placeholders with actual screenshots before submitting.

Dashboard	Add Expense	AI Analyzer Result
 

 
🚀 How to Run Locally
Clone the repository
bash
   git clone https://github.com/your-username/rationiq.git
   cd rationiq
Install dependencies
bash
   npm install
Set up environment variables Create a .env file in the root directory:
   GEMINI_API_KEY=your_gemini_api_key_here

Get your free API key from Google AI Studio.

Run the development server
bash
   npm run dev
Open http://localhost:3000 (or the port shown in your terminal) in your browser.
📝 Notes
No API keys or secrets are committed to this repository — all sensitive keys are managed via environment variables on the hosting platform (Vercel).
This project was built individually as part of a final project submission, using Google AI Studio as the primary build tool and Gemini API for the AI-powered categorization feature.
