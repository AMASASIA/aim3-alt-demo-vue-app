import { ref } from 'vue';

const tools = ref({});

/**
 * WebMCP Composable
 * AIとアプリの機能を繋ぐブリッジ
 */
export function useWebMCP() {
    /**
     * ツール（関数）の登録
     * @param {string} name - ツール名
     * @param {Object} schema - 引数のスキーマ定義
     * @param {Function} handler - 実際の処理
     */
    const registerTool = (name, schema, handler) => {
        tools.value[name] = { schema, handler };
        console.log(`[WebMCP] Tool Registered: ${name}`);
    };

    /**
     * ツールを実行
     * @param {string} name - ツール名
     * @param {Object} args - 引数
     */
    const executeTool = async (name, args) => {
        if (!tools.value[name]) {
            throw new Error(`Tool not found: ${name}`);
        }
        console.log(`[WebMCP] Executing: ${name}`, args);
        return await tools.value[name].handler(args);
    };

    /**
     * 現在利用可能なツールの定義リストを取得（AIに渡すため）
     */
    const getToolDefinitions = () => {
        return Object.entries(tools.value).map(([name, tool]) => ({
            name,
            description: tool.schema.description,
            parameters: tool.schema.parameters
        }));
    };

    return {
        registerTool,
        executeTool,
        getToolDefinitions
    };
}
