import { EventEmitter } from 'node:events';

// Plugin configuration interface
interface PluginConfig {
    package: string;
    options?: Record<string, any>;
}

// Plugin interface
export interface Plugin {
    name: string;
    version: string;
    register(options?: Record<string, any>): Promise<void>;
    deregister?(): Promise<void>;
}

// Plugin loader configuration interface
export interface PluginLoaderConfig {
    plugins: PluginConfig[];
}

// Plugin loader class
export default class PluginLoader extends EventEmitter {
  private loadedPlugins: Map<string, Plugin> = new Map();
  private pluginConfigs: PluginConfig[];

  constructor(config: PluginLoaderConfig) {
    super();
    this.pluginConfigs = config.plugins;
  }

  // Load all configured plugins
  async loadPlugins(): Promise<void> {
    for (const pluginConfig of this.pluginConfigs) {
      await this.loadPlugin(pluginConfig);
    }
  }

  // Load a single plugin
  async loadPlugin(pluginConfig: PluginConfig): Promise<void> {
    try {
      // Dynamically import the plugin
      const pluginModule = await import(pluginConfig.package);

      // Instantiate the plugin
      const pluginInstance = pluginModule.default || pluginModule;

      // make new class
      const plugin = new pluginInstance();

      // Register the plugin with optional configuration
      await plugin.register(pluginConfig.options);

      // Store the loaded plugin
      this.loadedPlugins.set(plugin.name, plugin);

      // Emit plugin loaded event
      this.emit("plugin:loaded", plugin);
    } catch (error) {
      // Emit plugin load error event
      this.emit("plugin:error", {
        package: pluginConfig.package,
        error,
      });

      // Optionally rethrow or handle the error
      throw error;
    }
  }

  // Unload a specific plugin
  async unloadPlugin(pluginName: string): Promise<void> {
    const plugin = this.loadedPlugins.get(pluginName);

    if (plugin && plugin.deregister) {
      await plugin.deregister();
      this.loadedPlugins.delete(pluginName);
      this.emit("plugin:unloaded", plugin);
    }
  }

  // Unload all plugins
  async unloadPlugins(): Promise<void> {
    for (const plugin of this.loadedPlugins.values()) {
      if (plugin.deregister) {
        await plugin.deregister();
      }
    }
    this.loadedPlugins.clear();
  }

  // Get a loaded plugin
  getPlugin(pluginName: string): Plugin | undefined {
    return this.loadedPlugins.get(pluginName);
  }

  // List all loaded plugins
  listPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }
}
