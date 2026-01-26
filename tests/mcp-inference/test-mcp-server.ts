/**
 * MCP Server Test Harness
 *
 * Tests the C++ MCP server compiled to WASM with various LLM providers.
 *
 * Supports:
 * - Cloud providers: OpenAI, Anthropic, Google/Gemini, Cohere, Mistral
 * - Local inference: Ollama, LM Studio, vLLM, LocalAI
 *
 * Usage:
 *   npx tsx tests/mcp-inference/test-mcp-server.ts --provider openai
 *   npx tsx tests/mcp-inference/test-mcp-server.ts --provider ollama --model llama3.3
 *   npx tsx tests/mcp-inference/test-mcp-server.ts --provider lmstudio
 */

import { execSync } from 'child_process';

// MCP Tool definitions for LLM function calling
const MCP_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'resolveLocation',
      description: 'Resolve a location name (city, landmark, airport code) to geographic coordinates',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location name to resolve (e.g., "Seattle", "CERN", "Beantown")',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'flyToLocation',
      description: 'Fly the camera to a named location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location name to fly to',
          },
          height: {
            type: 'number',
            description: 'Camera height in meters',
          },
          duration: {
            type: 'number',
            description: 'Flight duration in seconds',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addSphereAtLocation',
      description: 'Add a 3D sphere at a named location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location name',
          },
          radius: {
            type: 'number',
            description: 'Sphere radius in meters',
          },
          color: {
            type: 'string',
            description: 'Sphere color (e.g., "red", "blue")',
          },
        },
        required: ['location', 'radius'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addBoxAtLocation',
      description: 'Add a 3D box at a named location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location name',
          },
          dimensions: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              z: { type: 'number' },
            },
          },
          color: {
            type: 'string',
            description: 'Box color',
          },
        },
        required: ['location', 'dimensions'],
      },
    },
  },
];

// Test prompts
const TEST_PROMPTS = [
  'Show me Seattle',
  'Add a red sphere with 100km radius at CERN',
  'Fly to the Eiffel Tower',
  'Add a blue box at Beantown that is 50km on each side',
  'Where is the Large Hadron Collider?',
  'Navigate to Silicon Valley',
  'Put a marker at the Big Apple',
  'Add a green sphere at Fermilab with 10km radius',
];

// Provider configurations
interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKeyEnv?: string;
  model: string;
  supportsTools: boolean;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  // Cloud providers
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    model: 'gpt-4o',
    supportsTools: true,
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    model: 'claude-sonnet-4-20250514',
    supportsTools: true,
  },
  google: {
    name: 'Google/Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKeyEnv: 'GOOGLE_API_KEY',
    model: 'gemini-2.0-flash',
    supportsTools: true,
  },
  cohere: {
    name: 'Cohere',
    baseUrl: 'https://api.cohere.ai/v2',
    apiKeyEnv: 'COHERE_API_KEY',
    model: 'command-r-plus',
    supportsTools: true,
  },
  mistral: {
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    apiKeyEnv: 'MISTRAL_API_KEY',
    model: 'mistral-large-latest',
    supportsTools: true,
  },

  // Local providers
  ollama: {
    name: 'Ollama',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.3',
    supportsTools: true,
  },
  lmstudio: {
    name: 'LM Studio',
    baseUrl: 'http://localhost:1234/v1',
    model: 'local-model',
    supportsTools: true,
  },
  vllm: {
    name: 'vLLM',
    baseUrl: 'http://localhost:8000/v1',
    model: 'Qwen/Qwen2.5-72B-Instruct',
    supportsTools: true,
  },
  localai: {
    name: 'LocalAI',
    baseUrl: 'http://localhost:8080/v1',
    model: 'llama3',
    supportsTools: true,
  },
  together: {
    name: 'Together.ai',
    baseUrl: 'https://api.together.xyz/v1',
    apiKeyEnv: 'TOGETHER_API_KEY',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    supportsTools: true,
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    model: 'llama-3.3-70b-versatile',
    supportsTools: true,
  },
  fireworks: {
    name: 'Fireworks.ai',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    apiKeyEnv: 'FIREWORKS_API_KEY',
    model: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    supportsTools: true,
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    model: 'deepseek-chat',
    supportsTools: true,
  },
};

// Execute MCP server native binary for testing
function callMcpServer(method: string, params: object): string {
  const request = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  });

  // Use native binary for quick testing
  const mcpBinary = './packages/mcp-server-cpp/build-native/cesium-mcp-wasm';

  // For now, use the resolveLocation function directly
  if (method === 'tools/call') {
    const toolName = (params as { name: string }).name;
    const args = (params as { arguments: object }).arguments;

    if (toolName === 'resolveLocation') {
      const location = (args as { location: string }).location;
      try {
        // Call the native binary's resolveLocation
        const result = execSync(
          `echo '${request}' | ${mcpBinary} 2>/dev/null || echo '{"error":"binary not found"}'`,
          { encoding: 'utf-8' }
        );
        return result;
      } catch {
        return JSON.stringify({ error: 'MCP server not built' });
      }
    }
  }

  return JSON.stringify({ error: 'Not implemented' });
}

// OpenAI-compatible API call
async function callOpenAICompatible(
  config: ProviderConfig,
  messages: Array<{ role: string; content: string }>,
  tools?: typeof MCP_TOOLS
): Promise<{
  content: string;
  toolCalls?: Array<{ name: string; arguments: object }>;
}> {
  const apiKey = config.apiKeyEnv ? process.env[config.apiKeyEnv] : undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    max_tokens: 1024,
  };

  if (tools && config.supportsTools) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    choices: Array<{
      message: {
        content: string;
        tool_calls?: Array<{
          function: {
            name: string;
            arguments: string;
          };
        }>;
      };
    }>;
  };

  const choice = data.choices[0];
  const result: { content: string; toolCalls?: Array<{ name: string; arguments: object }> } = {
    content: choice.message.content || '',
  };

  if (choice.message.tool_calls) {
    result.toolCalls = choice.message.tool_calls.map((tc) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));
  }

  return result;
}

// Anthropic API call
async function callAnthropic(
  config: ProviderConfig,
  messages: Array<{ role: string; content: string }>,
  tools?: typeof MCP_TOOLS
): Promise<{
  content: string;
  toolCalls?: Array<{ name: string; arguments: object }>;
}> {
  const apiKey = process.env[config.apiKeyEnv!];
  if (!apiKey) {
    throw new Error(`Missing ${config.apiKeyEnv}`);
  }

  // Convert OpenAI tools to Anthropic format
  const anthropicTools = tools?.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters,
  }));

  const response = await fetch(`${config.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1024,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
      tools: anthropicTools,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    content: Array<{
      type: string;
      text?: string;
      name?: string;
      input?: object;
    }>;
  };

  const textBlocks = data.content.filter((c) => c.type === 'text');
  const toolBlocks = data.content.filter((c) => c.type === 'tool_use');

  return {
    content: textBlocks.map((b) => b.text).join('\n'),
    toolCalls: toolBlocks.length
      ? toolBlocks.map((b) => ({
          name: b.name!,
          arguments: b.input!,
        }))
      : undefined,
  };
}

// Main test runner
async function runTests(providerName: string, modelOverride?: string): Promise<void> {
  const config = PROVIDERS[providerName];
  if (!config) {
    console.error(`Unknown provider: ${providerName}`);
    console.log('Available providers:', Object.keys(PROVIDERS).join(', '));
    process.exit(1);
  }

  if (modelOverride) {
    config.model = modelOverride;
  }

  console.log('='.repeat(60));
  console.log(`Testing MCP Server with ${config.name}`);
  console.log(`Model: ${config.model}`);
  console.log('='.repeat(60));
  console.log('');

  const systemPrompt = `You are a CesiumJS globe controller assistant. When users ask to navigate, show locations, or add geometry, you MUST use the appropriate tool calls. Available tools:
- resolveLocation: Get coordinates for a location name
- flyToLocation: Navigate the camera to a location
- addSphereAtLocation: Add a 3D sphere at a location
- addBoxAtLocation: Add a 3D box at a location

Always use tool calls for geographic operations - never make up coordinates.`;

  let passed = 0;
  let failed = 0;

  for (const prompt of TEST_PROMPTS) {
    console.log(`\n📝 Prompt: "${prompt}"`);
    console.log('-'.repeat(50));

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ];

      let result;
      if (providerName === 'anthropic') {
        result = await callAnthropic(config, messages, MCP_TOOLS);
      } else {
        result = await callOpenAICompatible(config, messages, MCP_TOOLS);
      }

      if (result.toolCalls && result.toolCalls.length > 0) {
        console.log('✅ Tool calls:');
        for (const tc of result.toolCalls) {
          console.log(`   - ${tc.name}(${JSON.stringify(tc.arguments)})`);

          // Execute against MCP server
          const mcpResponse = callMcpServer('tools/call', {
            name: tc.name,
            arguments: tc.arguments,
          });
          console.log(`   → MCP: ${mcpResponse.substring(0, 100)}...`);
        }
        passed++;
      } else {
        console.log(`⚠️  No tool calls - Response: ${result.content.substring(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : error}`);
      failed++;
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${TEST_PROMPTS.length} tests`);
  console.log('='.repeat(60));
}

// Parse command line arguments
const args = process.argv.slice(2);
let provider = 'openai';
let model: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--provider' || args[i] === '-p') {
    provider = args[++i];
  } else if (args[i] === '--model' || args[i] === '-m') {
    model = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
MCP Server Test Harness

Usage:
  npx tsx tests/mcp-inference/test-mcp-server.ts [options]

Options:
  --provider, -p <name>   Provider to test (default: openai)
  --model, -m <name>      Override model name
  --help, -h              Show this help

Providers:
  Cloud: openai, anthropic, google, cohere, mistral, together, groq, fireworks, deepseek
  Local: ollama, lmstudio, vllm, localai

Environment Variables:
  OPENAI_API_KEY      - OpenAI API key
  ANTHROPIC_API_KEY   - Anthropic API key
  GOOGLE_API_KEY      - Google/Gemini API key
  COHERE_API_KEY      - Cohere API key
  MISTRAL_API_KEY     - Mistral API key
  TOGETHER_API_KEY    - Together.ai API key
  GROQ_API_KEY        - Groq API key
  FIREWORKS_API_KEY   - Fireworks.ai API key
  DEEPSEEK_API_KEY    - DeepSeek API key

Examples:
  # Test with OpenAI GPT-4o
  npx tsx tests/mcp-inference/test-mcp-server.ts --provider openai

  # Test with Anthropic Claude
  npx tsx tests/mcp-inference/test-mcp-server.ts --provider anthropic

  # Test with local Ollama
  npx tsx tests/mcp-inference/test-mcp-server.ts --provider ollama --model llama3.3

  # Test with LM Studio
  npx tsx tests/mcp-inference/test-mcp-server.ts --provider lmstudio
`);
    process.exit(0);
  }
}

runTests(provider, model).catch(console.error);
