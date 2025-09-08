// Single Responsibility: Only handles service registration and dependency injection
// Dependency Inversion Principle: Components depend on abstractions, not concrete implementations
class ServiceLocator {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.factories = new Map();
  }

  // Singleton instance (Singleton Pattern)
  static instance = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ServiceLocator();
    }
    return this.instance;
  }

  // Register a service class (will be instantiated when requested)
  register(name, serviceClass, options = {}) {
    if (typeof serviceClass !== 'function') {
      throw new Error(`Service ${name} must be a constructor function or class`);
    }

    this.services.set(name, {
      serviceClass,
      singleton: options.singleton || false,
      dependencies: options.dependencies || []
    });

    return this;
  }

  // Register a singleton instance
  registerSingleton(name, serviceInstance) {
    this.singletons.set(name, serviceInstance);
    return this;
  }

  // Register a factory function (Factory Pattern)
  registerFactory(name, factoryFunction, options = {}) {
    if (typeof factoryFunction !== 'function') {
      throw new Error(`Factory ${name} must be a function`);
    }

    this.factories.set(name, {
      factory: factoryFunction,
      singleton: options.singleton || false,
      dependencies: options.dependencies || []
    });

    return this;
  }

  // Resolve a service by name (Dependency Injection)
  resolve(name) {
    // Check singletons first
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Check factories
    if (this.factories.has(name)) {
      return this.resolveFactory(name);
    }

    // Check registered services
    if (this.services.has(name)) {
      return this.resolveService(name);
    }

    throw new Error(`Service ${name} not found. Did you forget to register it?`);
  }

  // Resolve service with dependency injection
  resolveService(name) {
    const serviceConfig = this.services.get(name);
    
    // Check if singleton already exists
    if (serviceConfig.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Resolve dependencies recursively
    const dependencies = serviceConfig.dependencies.map(dep => this.resolve(dep));
    
    // Create service instance
    const ServiceClass = serviceConfig.serviceClass;
    const instance = new ServiceClass(...dependencies);

    // Store as singleton if configured
    if (serviceConfig.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  // Resolve factory with dependency injection
  resolveFactory(name) {
    const factoryConfig = this.factories.get(name);
    
    // Check if singleton already exists
    if (factoryConfig.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Resolve dependencies recursively
    const dependencies = factoryConfig.dependencies.map(dep => this.resolve(dep));
    
    // Create instance using factory
    const instance = factoryConfig.factory(...dependencies);

    // Store as singleton if configured
    if (factoryConfig.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  // Check if service is registered
  has(name) {
    return this.services.has(name) || this.singletons.has(name) || this.factories.has(name);
  }

  // Clear all services (useful for testing)
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }

  // Get all registered service names
  getRegisteredServices() {
    return [
      ...this.services.keys(),
      ...this.singletons.keys(),
      ...this.factories.keys()
    ];
  }

  // Register multiple services at once (Builder Pattern)
  batch(registrations) {
    registrations.forEach(({ type, name, implementation, options }) => {
      switch (type) {
        case 'service':
          this.register(name, implementation, options);
          break;
        case 'singleton':
          this.registerSingleton(name, implementation);
          break;
        case 'factory':
          this.registerFactory(name, implementation, options);
          break;
        default:
          throw new Error(`Unknown registration type: ${type}`);
      }
    });
    return this;
  }
}

// Service configuration helper (Builder Pattern)
class ServiceConfiguration {
  constructor() {
    this.registrations = [];
  }

  service(name, serviceClass, options = {}) {
    this.registrations.push({
      type: 'service',
      name,
      implementation: serviceClass,
      options
    });
    return this;
  }

  singleton(name, serviceInstance) {
    this.registrations.push({
      type: 'singleton',
      name,
      implementation: serviceInstance
    });
    return this;
  }

  factory(name, factoryFunction, options = {}) {
    this.registrations.push({
      type: 'factory',
      name,
      implementation: factoryFunction,
      options
    });
    return this;
  }

  configure(serviceLocator) {
    serviceLocator.batch(this.registrations);
    return serviceLocator;
  }
}

// Higher-Order Component for dependency injection (HOC Pattern)
export function withServices(serviceNames) {
  return function(WrappedComponent) {
    return function ServiceInjectedComponent(props) {
      const serviceLocator = ServiceLocator.getInstance();
      const services = {};

      // Resolve all requested services
      serviceNames.forEach(serviceName => {
        services[serviceName] = serviceLocator.resolve(serviceName);
      });

      // Inject services as props
      return React.createElement(WrappedComponent, {
        ...props,
        services
      });
    };
  };
}

// Hook for dependency injection (Hook Pattern)
export function useServices(...serviceNames) {
  const serviceLocator = ServiceLocator.getInstance();
  const services = {};

  serviceNames.forEach(serviceName => {
    services[serviceName] = serviceLocator.resolve(serviceName);
  });

  return serviceNames.length === 1 ? services[serviceNames[0]] : services;
}

// Pre-configured service registration (Bootstrap)
export function bootstrapServices() {
  const serviceLocator = ServiceLocator.getInstance();
  
  // Import services (these would be actual imports in a real app)
  const config = new ServiceConfiguration()
    // Data Services
    .service('UserService', require('../services/user/UserService').default, { singleton: true })
    .service('LocationService', require('../services/location/LocationService').default, { singleton: true })
    
    // Authentication Services
    .service('AuthService', require('../services/auth/AuthService').AuthService, { singleton: true })
    
    // Storage Services
    .service('EmailHistoryService', require('../services/storage/EmailHistoryService').default, { singleton: true })
    // Firebase email history service removed
    
    // Utility Services
    .service('ValidationService', require('../services/validation/ValidationService').default, { singleton: true })
    .service('SecurityService', require('../services/security/SecurityService').default)
    
    // Error Handling
    .singleton('ErrorHandlerService', require('./services/common/ErrorHandlerService').default)
    
    // Factories
    .factory('ValidationFactory', () => require('./factories/ValidationFactory').default, { singleton: true })
    .factory('StyleFactory', () => require('./factories/StyleFactory').default, { singleton: true })
    
    // Settings Services
    .service('UserSettingsService', require('../services/settings/UserSettingsService').default, { singleton: true })
    .service('LanguageService', require('../services/settings/LanguageService').default, { singleton: true })
    .service('CacheManagementService', require('../services/settings/CacheManagementService').default, { singleton: true });

  config.configure(serviceLocator);
  
  return serviceLocator;
}

// Service locator decorators for methods (Decorator Pattern)
export function inject(...serviceNames) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      const serviceLocator = ServiceLocator.getInstance();
      const services = serviceNames.map(name => serviceLocator.resolve(name));
      
      return originalMethod.apply(this, [...args, ...services]);
    };
    
    return descriptor;
  };
}

// Service mocking for testing (Test Double Pattern)
export class MockServiceLocator extends ServiceLocator {
  mock(name, mockImplementation) {
    this.registerSingleton(name, mockImplementation);
    return this;
  }

  restore(name) {
    this.singletons.delete(name);
    return this;
  }

  restoreAll() {
    this.singletons.clear();
    return this;
  }
}

export default ServiceLocator;
export { ServiceConfiguration }; 