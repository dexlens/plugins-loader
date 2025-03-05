# plugins-loader
It provides a robust mechanism for dynamically loading, registering, and managing plugins in an Dexlens Applications.

## Interfaces
* `PluginConfig`: Configuration for a plugin
* `Plugin`: Standard plugin structure
* `PluginLoaderConfig`: Configuration for the loader

## Constructor
* `constructor(config: PluginLoaderConfig)`: Creates a new PluginLoader instance

## Methods
* `loadPlugins()`: Load all configured plugins
* `loadPlugin(pluginConfig)`: Load a single plugin
* `unloadPlugin(pluginName)`: Unload a specific plugin
* `unloadPlugins()`: Unload all plugins
* `getPlugin(pluginName)`: Retrieve a specific plugin
* `listPlugins()`: List all loaded plugins

## Events
* `plugin:loaded`: Triggered when a plugin is successfully loaded
* `plugin:error`: Triggered when a plugin fails to load

## Key Properties
* `loadedPlugins`: Internal map storing loaded plugins
* `pluginConfigs`: Array of plugin configurations

## Use it 
```typescript
import PluginLoader, { Plugin, PluginLoaderConfig } from "jsr:dexlens/plugin-loader";

const coreConfig: PluginLoaderConfig = {
  plugins: [
    // can be node module, path, or jsr
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
        this.name = 'core-logger-pino';
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
```