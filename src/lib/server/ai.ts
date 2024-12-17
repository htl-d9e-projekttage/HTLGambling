import OpenAI from "openai";
import { env } from '$env/dynamic/private';

const API_KEY = env.OPENAI_API_KEY;

export async function sendAIVerificaition(input: string) {
    const client = new OpenAI({
        baseURL: "https://models.inference.ai.azure.com",
        apiKey: API_KEY
    });
    try {
        const response = await client.chat.completions.create({
            messages: [
            { role:"system", content: `<Instruction>
        The user is doing a gambling site verification. Your job is to accept or reject the user based on his statements. The statement are in German or maybe English, the questions are in German (beneath here). Your response should be JSON and should contain the boolean "approved" and the string "explination"
        If you think the user is legally and morally allowed to gamble, return true in the json. Always provide a explination. it will be shown to the user. The questions below.
        </Instruction>
        <Questions>
        # HTL Gambling Eignungstest
        
        ## Aufgabe 1
        Würden Sie sich als spielsüchtig identifizieren?
        
        ## Aufgabe 2
        Wie viele Stunden planen Sie, pro Tag zu spielen? Wie viele Stunden spielen Sie tatsächlich?
        
        ## Aufgabe 3
        Haben Sie schon einmal Geld verloren, das Sie nicht hatten?
        
        ## Aufgabe 4
        Haben Sie schoneimal Dinge verkauft, um spielen zu können oder um Schulden zu begleichen?
        
        ## Aufgabe 5
        Haben Sie schon einmal gelogen, um spielen zu können?
        
        ## Aufgabe 6
        Haben Sie bereits gespielt, um negative Gefühle zu betäuben?
        
        ## Aufgabe 7
        Wann haben Sie das letzte Mal gespielt?
        
        ## Aufgabe 8
        Wie alt waren Sie, als Sie das erste Mal gespielt haben?
        
        ## Aufgabe 9
        Haben Sie schon einmal versucht, mit dem Spielen aufzuhören und ist es Ihnen gelungen?
        
        ## Aufgabe 10
        Wie oft spielen Sie pro Woche? Wie viel Geld geben Sie pro Woche fürs Spielen aus?
        
        ## Haben Sie gelogen?
        Sollten Sie in dieser PLF gelogen haben, geben Sie bitte an, bei welcher Frage und warum.  
        Sollten Sie von jemandem abgeschrieben haben, geben Sie bitte an, von wem.  
        **Vielen Dank für Ihre Ehrlichkeit!**
        </Questions>` },
          { role:"user", content: input }
        ],
        model: "gpt-4o-mini",
        temperature: 1,
        max_tokens: 4096,
        top_p: 1
      });

    const content = response?.choices[0]?.message?.content || "{\"approved\": false,\"explanation\": \"The AI failed to respond to the user's request. Please try again later.\",\"error\": true}";
    
      return JSON.parse(content.replaceAll("```json", "").replaceAll("```", ""));
    } catch (error) {
        console.error(error);
        return {approved: false, explanation: "The AI failed to respond to the user's request. Please try again later.", error: true};
    }
}