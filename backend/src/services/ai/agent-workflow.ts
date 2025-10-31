import * as z from "zod";
import { task, entrypoint, getPreviousState } from "@langchain/langgraph";
import { loadGeminiModel } from "./gemini";
import { loadOpenAiModel } from "./openai";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

export async function runWorkflow(input: string) {

  const checkpointer = PostgresSaver.fromConnString(process.env.SUPABASE_POSTGRES_URL);

  const llm = process.env.LLM_PROVIDER === "openai"
    ? loadOpenAiModel()
    : loadGeminiModel();

  // Schema for structured output to use as routing logic
  const routeSchema = z.object({
    step: z.enum(["atendant", "general"]).describe(
      "The next step in the routing process"
    ),
  });

  

  // Augment the LLM with schema for structured output
  const router = llm.withStructuredOutput(routeSchema);

  // Tasks
  const atendantCall = task("atendantCall", async (input: string) => {
    const result = await llm.invoke([{
      role: "system",
      content: "Você é responsável por atender o cliente, ajudando com faturas, desbloqueio e ativação de serviços. Para isso peça ",
    }, {
      role: "user",
      content: input
    }]);
    return result.content;
  });

  // Write a poem
  const generalCall = task("generateGeneral", async (input: string) => {
    const result = await llm.invoke([{
      role: "system",
      content: "Você é um agente de uso geral",
    }, {
      role: "user",
      content: input
    }]);
    return result.content;
  });

  // Route the input to the appropriate node
  const llmCallRouter = task("router", async (input: string) => {
    const decision = await router.invoke([
      {
        role: "system",
        content: `
        Decida se o usuário deve ser encaminhado para o fluxo de atendimento ou se 
        para o fluxo geral, se o usuário falar sobre faturas ou desbloqueio ou ativação de serviços, 
        leve-o para o fluxo 'atendant', caso contrário para o fluxo general.
        Caso o usuário tenha sido encaminhado para o fluxo de atendimento e tenho sido solicitado o seu 
        cpf ou cnpj, permita que ele continue no fluxo de atendimento.
        `
      },
      {
        role: "user",
        content: input
      },
    ]);
    return decision.step;
  });

  // Build workflow
  const workflow = entrypoint(
    {checkpointer, name:"routerWorkflow"},
    async (input: string) => {
      const previous = getPreviousState();
      console.log("Previous state:", previous);
      const nextStep = await llmCallRouter(input);

      let llmCall;
      if (nextStep === "atendant") {
        llmCall = atendantCall;
      } else if (nextStep === "general") {
        llmCall = generalCall;
      }

      const finalResult = await llmCall(input);
      return finalResult;
    }
  );

  // Invoke
  const stream = await workflow.stream(input, {
    ...{ configurable: { thread_id: "1" } },
    streamMode: "values",
  });

  for await (const step of stream) {
    console.log(step);
  }
}