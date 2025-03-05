import PluginLoader, { Plugin, PluginLoaderConfig } from "./main.ts";

const coreConfig: PluginLoaderConfig = {
  plugins: [
    { package: "@dexlens/logger", options: { level: "info" } },
  ],
};

const pluginLoader = new PluginLoader(coreConfig);

// Listen to plugin events
pluginLoader.on("plugin:loaded", (plugin) => {
  console.log(`Plugin loaded: ${plugin.name}`);
});

pluginLoader.on("plugin:error", ({ module, error }) => {
  console.error(`Failed to load plugin ${module}:`, error);
});

// Load the plugins 
await pluginLoader.loadPlugins();

// Now use one of the plugins
const logger = pluginLoader.getPlugin("@dexlens/logger");
logger.someMethod("Hello, world!");

// Example plugin implementation
export default class CoreLoggerPlugin implements Plugin {
    name: string;
    version: string;
    state: Record<string, any>;

    constructor(){
        this.name = '@dexlens/logger';
        this.version = '1.0.0';
        this.state = {}
    }

    async register(options?: Record<string, any>): Promise<void> {
        console.log('Registering logger with options:', {
            ...this.state,
            ...options
        });
        for (const key in options) {
            this.state[key] = options[key];
        }
    }

    async deregister(): Promise<void> {
        console.log('Deregistering Pino logger');
    }

    async someMethod(arg: string): Promise<void> {
        console.log('Some method', arg);
        console.log(this.state);
    }
}

