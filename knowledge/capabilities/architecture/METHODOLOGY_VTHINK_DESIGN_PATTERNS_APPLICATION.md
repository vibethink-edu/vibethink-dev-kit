# VThink 1.0 Design Patterns Application - Timeline & Universal Assistant

## 🎯 **Resumen Ejecutivo**

Este documento explica cómo se aplican los **patrones de diseño de VThink 1.0** en los componentes **Timeline** y **Universal Assistant**, siguiendo la metodología establecida en la arquitectura del proyecto.

## 🏗️ **Patrones Principales Aplicados**

### **1. Facade Pattern - Simplificación de APIs Complejas**

#### **Problema Resuelto**
- **Timeline**: Múltiples fuentes de datos (e2CRM, e2PQRS, Helpdesk, Workflows, AI)
- **Universal Assistant**: Múltiples proveedores de IA y servicios externos
- **Complejidad**: APIs diferentes, formatos diversos, autenticación variada

#### **Solución con Facade**
```typescript
// ✅ Timeline Facade - VThink 1.0
class TimelineFacade {
  constructor(
    private tenantContext: TenantContext,
    private dataSources: TimelineDataSource[]
  ) {}

  async getTimelineEvents(
    entityId: string,
    entityType: EntityType,
    filters: TimelineFilters
  ): Promise<TimelineEvent[]> {
    // 1. Validar permisos del tenant
    await this.validateTenantPermissions(entityId, entityType);
    
    // 2. Agregar eventos de múltiples fuentes
    const events: TimelineEvent[] = [];
    
    for (const source of this.dataSources) {
      if (this.shouldIncludeSource(source, filters)) {
        const sourceEvents = await source.getEvents(entityId, entityType, filters);
        events.push(...sourceEvents);
      }
    }
    
    // 3. Normalizar y ordenar eventos
    return this.normalizeAndSortEvents(events);
  }

  private async validateTenantPermissions(
    entityId: string, 
    entityType: EntityType
  ): Promise<void> {
    const { hasPermission } = this.tenantContext;
    
    if (!hasPermission('timeline_view')) {
      throw new Error('Insufficient permissions to view timeline');
    }
    
    // Validar acceso a la entidad específica
    if (!hasPermission(`view_${entityType}`)) {
      throw new Error(`Cannot view ${entityType} timeline`);
    }
  }

  private shouldIncludeSource(
    source: TimelineDataSource, 
    filters: TimelineFilters
  ): boolean {
    return filters.modules.includes(source.module) || filters.modules.length === 0;
  }

  private normalizeAndSortEvents(events: TimelineEvent[]): TimelineEvent[] {
    return events
      .map(event => this.normalizeEvent(event))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// ✅ Universal Assistant Facade - VThink 1.0
class UniversalAssistantFacade {
  constructor(
    private tenantContext: TenantContext,
    private aiProviders: AIProvider[],
    private serviceProviders: ServiceProvider[]
  ) {}

  async processAssistantRequest(
    request: AssistantRequest,
    context: AssistantContext
  ): Promise<AssistantResponse> {
    // 1. Validar límites del tenant
    await this.validateTenantLimits(request.type);
    
    // 2. Seleccionar proveedor de IA
    const aiProvider = this.selectAIProvider(request.type, context);
    
    // 3. Procesar con fallback
    return this.processWithFallback(aiProvider, request, context);
  }

  private async validateTenantLimits(requestType: string): Promise<void> {
    const { limits } = this.tenantContext;
    
    if (limits.aiRequests && limits.aiRequests.current >= limits.aiRequests.max) {
      throw new Error('AI request limit exceeded for this tenant');
    }
  }

  private selectAIProvider(
    requestType: string, 
    context: AssistantContext
  ): AIProvider {
    // Lógica de selección basada en tipo de request y contexto
    const availableProviders = this.aiProviders.filter(
      provider => provider.supportsRequestType(requestType)
    );
    
    return availableProviders[0] || this.getFallbackProvider();
  }

  private async processWithFallback(
    primaryProvider: AIProvider,
    request: AssistantRequest,
    context: AssistantContext
  ): Promise<AssistantResponse> {
    try {
      return await primaryProvider.process(request, context);
    } catch (error) {
      console.error('Primary AI provider failed:', error);
      
      // Fallback a proveedor secundario
      const fallbackProvider = this.getFallbackProvider();
      return await fallbackProvider.process(request, context);
    }
  }
}
```

### **2. Strategy Pattern - Múltiples Implementaciones**

#### **Timeline Data Sources**
```typescript
// ✅ Strategy para fuentes de datos del Timeline
interface TimelineDataSource {
  module: string;
  getEvents(
    entityId: string, 
    entityType: EntityType, 
    filters: TimelineFilters
  ): Promise<TimelineEvent[]>;
  supportsEntity(entityType: EntityType): boolean;
}

// ✅ Implementación para e2CRM
class E2CRMDataSource implements TimelineDataSource {
  module = 'crm';
  
  async getEvents(
    entityId: string, 
    entityType: EntityType, 
    filters: TimelineFilters
  ): Promise<TimelineEvent[]> {
    const { supabase } = this.tenantContext;
    
    const { data, error } = await supabase
      .from('crm_interactions')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .eq('company_id', this.tenantContext.company.id);
    
    if (error) throw error;
    
    return data.map(this.mapToTimelineEvent);
  }
  
  supportsEntity(entityType: EntityType): boolean {
    return ['customer', 'company', 'employee'].includes(entityType);
  }
}

// ✅ Implementación para e2PQRS Universal
class E2PQRSDataSource implements TimelineDataSource {
  module = 'pqrs';
  
  async getEvents(
    entityId: string, 
    entityType: EntityType, 
    filters: TimelineFilters
  ): Promise<TimelineEvent[]> {
    const { supabase } = this.tenantContext;
    
    const { data, error } = await supabase
      .from('e2pqrs_interactions')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .eq('company_id', this.tenantContext.company.id);
    
    if (error) throw error;
    
    return data.map(this.mapToTimelineEvent);
  }
  
  supportsEntity(entityType: EntityType): boolean {
    // e2PQRS soporta TODAS las entidades (universal)
    return true;
  }
}
```

### **3. Factory Pattern - Creación de Componentes**

#### **Timeline Component Factory**
```typescript
// ✅ Factory para componentes del Timeline
class TimelineComponentFactory {
  static createTimelineItem(
    event: TimelineEvent,
    context: TimelineContext
  ): React.ReactElement {
    const componentMap = {
      'entity_request': EntityRequestItem,
      'entity_feedback': EntityFeedbackItem,
      'entity_collaboration': EntityCollaborationItem,
      'entity_optimization': EntityOptimizationItem,
      'process_initiated': ProcessInitiatedItem,
      'process_completed': ProcessCompletedItem,
      'interaction': CRMInteractionItem,
      'ticket': HelpdeskTicketItem,
      'workflow_start': WorkflowStartItem,
      'chat_message': AIChatItem
    };
    
    const Component = componentMap[event.type] || DefaultTimelineItem;
    
    return React.createElement(Component, {
      event,
      context,
      key: event.id
    });
  }
}

// ✅ Factory para perfiles del Assistant
class AssistantProfileFactory {
  static createProfile(
    userRole: UserRole,
    context: AssistantContext
  ): AssistantProfile {
    const profileConfigs = {
      EMPLOYEE: {
        name: 'Asistente de Soporte',
        role: 'Soporte Técnico',
        expertise: ['troubleshooting', 'guidance', 'self_service'],
        tone: 'supportive' as const,
        focus: ['basic_operations', 'self_service'],
        modules: ['helpdesk', 'pqrs']
      },
      MANAGER: {
        name: 'Asistente de Gestión',
        role: 'Gestión de Equipos',
        expertise: ['analytics', 'process_optimization', 'team_management'],
        tone: 'collaborative' as const,
        focus: ['team_management', 'reporting'],
        modules: ['crm', 'pqrs', 'helpdesk']
      },
      ADMIN: {
        name: 'Asistente Administrativo',
        role: 'Administración del Sistema',
        expertise: ['administration', 'compliance', 'configuration'],
        tone: 'professional' as const,
        focus: ['system_configuration', 'user_management'],
        modules: ['all']
      },
      OWNER: {
        name: 'Asistente Ejecutivo',
        role: 'Estrategia y Optimización',
        expertise: ['strategy', 'performance', 'growth'],
        tone: 'executive' as const,
        focus: ['strategic_insights', 'business_optimization'],
        modules: ['all']
      }
    };
    
    const config = profileConfigs[userRole];
    
    return {
      id: `assistant-${userRole.toLowerCase()}`,
      name: config.name,
      role: config.role,
      expertise: config.expertise,
      tone: config.tone,
      avatar: `/avatars/assistant-${userRole.toLowerCase()}.png`,
      status: 'online' as const,
      focus: config.focus,
      modules: config.modules,
      description: `Te ayudo con ${config.role.toLowerCase()}`
    };
  }
}
```

### **4. Observer Pattern - Eventos del Sistema**

#### **Timeline Event System**
```typescript
// ✅ Sistema de eventos para Timeline
class TimelineEventSystem {
  private observers: TimelineEventObserver[] = [];
  
  subscribe(observer: TimelineEventObserver): void {
    this.observers.push(observer);
  }
  
  unsubscribe(observer: TimelineEventObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify(event: TimelineEvent): void {
    this.observers.forEach(observer => {
      observer.onTimelineEvent(event);
    });
  }
}

// ✅ Observer para Universal Assistant
class AssistantTimelineObserver implements TimelineEventObserver {
  constructor(private assistant: UniversalAssistantFacade) {}
  
  onTimelineEvent(event: TimelineEvent): void {
    // El Assistant puede reaccionar a eventos del Timeline
    if (event.type === 'entity_request' && event.status === 'pending') {
      this.assistant.suggestAction('review_pending_request', {
        entityId: event.entityId,
        entityType: event.entityType,
        requestId: event.id
      });
    }
  }
}
```

### **5. Repository Pattern - Acceso a Datos**

#### **Timeline Repository**
```typescript
// ✅ Repository para datos del Timeline
class TimelineRepository {
  constructor(
    private supabase: SupabaseClient,
    private tenantContext: TenantContext
  ) {}
  
  async getEvents(
    entityId: string,
    entityType: EntityType,
    filters: TimelineFilters
  ): Promise<TimelineEvent[]> {
    const query = this.supabase
      .from('timeline_events')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .eq('company_id', this.tenantContext.company.id);
    
    // Aplicar filtros
    if (filters.modules.length > 0) {
      query.in('module', filters.modules);
    }
    
    if (filters.types.length > 0) {
      query.in('type', filters.types);
    }
    
    if (filters.status.length > 0) {
      query.in('status', filters.status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(this.mapToTimelineEvent);
  }
  
  async createEvent(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    
    return this.mapToTimelineEvent(data);
  }
  
  private mapToTimelineEvent(raw: any): TimelineEvent {
    return {
      id: raw.id,
      timestamp: new Date(raw.timestamp),
      type: raw.type,
      module: raw.module,
      title: raw.title,
      description: raw.description,
      status: raw.status,
      priority: raw.priority,
      metadata: raw.metadata,
      sourceEntity: raw.source_entity,
      targetEntity: raw.target_entity,
      userId: raw.user_id,
      userName: raw.user_name,
      entityId: raw.entity_id,
      entityType: raw.entity_type,
      companyId: raw.company_id
    };
  }
}
```

## 🎯 **Aplicación en Componentes React**

### **Timeline Component con Patrones**
```typescript
// ✅ Timeline Component usando Facade y Factory
export const Timeline: React.FC<TimelineProps> = ({
  entityId,
  entityType,
  className,
  showFilters = true,
  maxItems = 50
}) => {
  const { tenantContext } = useTenant();
  const [timelineFacade] = useState(() => new TimelineFacade(tenantContext, dataSources));
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const timelineEvents = await timelineFacade.getTimelineEvents(
          entityId,
          entityType,
          filters
        );
        setEvents(timelineEvents.slice(0, maxItems));
      } catch (error) {
        console.error('Error loading timeline events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  }, [entityId, entityType, filters, maxItems]);
  
  if (isLoading) {
    return <TimelineSkeleton />;
  }
  
  return (
    <div className={`timeline-container ${className}`}>
      {showFilters && (
        <TimelineFilters
          filters={filters}
          onFiltersChange={setFilters}
          activeModules={tenantContext.activeModules}
        />
      )}
      
      <div className="timeline-events">
        {events.map((event) => (
          <TimelineComponentFactory.createTimelineItem(event, { entityId, entityType }) />
        ))}
      </div>
    </div>
  );
};
```

### **Universal Assistant con Patrones**
```typescript
// ✅ Universal Assistant usando Facade y Factory
export const UniversalAssistant: React.FC<UniversalAssistantProps> = ({
  entityId,
  entityType,
  className,
  position = 'floating',
  showProfile = true
}) => {
  const { tenantContext } = useTenant();
  const [assistantFacade] = useState(() => new UniversalAssistantFacade(
    tenantContext,
    aiProviders,
    serviceProviders
  ));
  
  const profile = useMemo(() => 
    AssistantProfileFactory.createProfile(tenantContext.user.role, { entityId, entityType }),
    [tenantContext.user.role, entityId, entityType]
  );
  
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const sendMessage = useCallback(async (content: string) => {
    const request: AssistantRequest = {
      type: 'chat_message',
      content,
      context: { entityId, entityType }
    };
    
    setIsTyping(true);
    
    try {
      const response = await assistantFacade.processAssistantRequest(request, {
        entityId,
        entityType,
        activeModules: tenantContext.activeModules,
        userRole: tenantContext.user.role,
        userPermissions: tenantContext.user.permissions,
        companyId: tenantContext.company.id
      });
      
      setMessages(prev => [...prev, {
        id: generateId(),
        type: 'assistant',
        content: response.content,
        actions: response.actions,
        timestamp: new Date(),
        context: { entityId, entityType }
      }]);
    } catch (error) {
      console.error('Error processing assistant request:', error);
    } finally {
      setIsTyping(false);
    }
  }, [entityId, entityType, assistantFacade]);
  
  return (
    <div className={`universal-assistant ${position} ${className}`}>
      {/* Componente con patrón Facade */}
      <AssistantChat
        messages={messages}
        onSendMessage={sendMessage}
        isTyping={isTyping}
        profile={profile}
      />
    </div>
  );
};
```

## 🚀 **Beneficios de la Aplicación de Patrones**

### **1. Facade Pattern**
- ✅ **Simplificación**: APIs complejas se vuelven simples
- ✅ **Abstracción**: Detalles de implementación ocultos
- ✅ **Mantenibilidad**: Cambios centralizados
- ✅ **Testing**: Fácil mock de interfaces

### **2. Strategy Pattern**
- ✅ **Flexibilidad**: Intercambio de implementaciones
- ✅ **Extensibilidad**: Nuevas fuentes de datos fáciles de agregar
- ✅ **Testing**: Cada estrategia testeable independientemente

### **3. Factory Pattern**
- ✅ **Creación**: Objetos complejos creados de forma consistente
- ✅ **Configuración**: Lógica de creación centralizada
- ✅ **Reutilización**: Factories reutilizables

### **4. Observer Pattern**
- ✅ **Desacoplamiento**: Componentes independientes
- ✅ **Reactividad**: Respuesta automática a eventos
- ✅ **Escalabilidad**: Fácil agregar nuevos observers

### **5. Repository Pattern**
- ✅ **Abstracción**: Lógica de datos separada
- ✅ **Testing**: Fácil mock de repositorios
- ✅ **Consistencia**: Acceso a datos estandarizado

## 📋 **Próximos Pasos**

1. **Implementar Facades** para Timeline y Universal Assistant
2. **Crear Factories** para componentes y perfiles
3. **Implementar Repositories** para acceso a datos
4. **Agregar Observers** para eventos del sistema
5. **Documentar patrones** específicos por módulo

---

**Los patrones de diseño de VThink 1.0 garantizan que Timeline y Universal Assistant sean componentes robustos, mantenibles y escalables, siguiendo las mejores prácticas de la metodología establecida.** 