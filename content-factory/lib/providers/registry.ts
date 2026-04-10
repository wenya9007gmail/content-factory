export type ProviderConfig = {
  id: string;
  label: string;
  region: "domestic" | "overseas";
  models: {
    id: string;
    name: string;
    costPer1K: number;
    type: "text" | "image";
  }[];
};

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "glm",
    label: "智谱 GLM",
    region: "domestic",
    models: [{ id: "glm-4", name: "GLM-4", costPer1K: 0.12, type: "text" }],
  },
  {
    id: "doubao",
    label: "豆包 Seedream",
    region: "domestic",
    models: [
      { id: "doubao-pro-32k", name: "Seedream 5.0 Lite", costPer1K: 0.45, type: "image" },
    ],
  },
  {
    id: "qwen",
    label: "通义千问",
    region: "domestic",
    models: [{ id: "qwen-turbo", name: "Qwen Turbo", costPer1K: 0.04, type: "text" }],
  },
  {
    id: "banana",
    label: "Banana",
    region: "overseas",
    models: [{ id: "banana-vision", name: "Banana Vision", costPer1K: 0.75, type: "image" }],
  },
  {
    id: "claude",
    label: "Claude",
    region: "overseas",
    models: [{ id: "claude-sonnet-4.6", name: "Sonnet 4.6", costPer1K: 21, type: "text" }],
  },
];

export function estimateCost(providerId: string, modelId: string, tokens: number) {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  const model = provider?.models.find((m) => m.id === modelId);
  if (!model) return 0;
  return (tokens / 1000) * model.costPer1K;
}
