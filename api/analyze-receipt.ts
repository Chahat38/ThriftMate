import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    const { text } = req.body;


    if (!text) {
      return res.status(400).json({
        error: "Text required"
      });
    }


    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });



    const prompt = `
You are a grocery expense analyzer for Pakistan.

Convert this grocery list into JSON only.

Format:

[
 {
  "item":"Doodh",
  "category":"Dairy",
  "amount":200
 }
]

Categories:
Dairy, Produce, Grains, Meat, Household, Other


Input:
${text}
`;



    const response = await ai.models.generateContent({

      model:"gemini-2.0-flash",

      contents:prompt

    });



    let output=response.text
      .replace(/```json/g,"")
      .replace(/```/g,"")
      .trim();



    const items=JSON.parse(output);



    return res.status(200).json({

      success:true,

      data:{
        items,

        suggestions:[
          "Thoke ka bazaar se rashan lene se saving hoti hai.",
          "Seasonal sabzi aur fruit use karein.",
          "Local brands use karke budget control karein."
        ]
      }

    });



  } catch(error){

    return res.status(500).json({

      success:false,

      error:error.message

    });

  }

}
