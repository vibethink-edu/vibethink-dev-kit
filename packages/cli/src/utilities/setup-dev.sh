#!/bin/bash

# Script de Setup Rápido para Desarrollo Local
# Uso: ./scripts/setup-dev.sh [options]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PYTHON_VERSION="3.11"
NODE_VERSION="18"
VENV_NAME="venv"

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Función para verificar requisitos
check_requirements() {
    print_step "Verificando requisitos..."
    
    # Verificar Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION_ACTUAL=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        if [[ "$PYTHON_VERSION_ACTUAL" == "$PYTHON_VERSION" ]]; then
            print_message "Python $PYTHON_VERSION encontrado"
        else
            print_warning "Python $PYTHON_VERSION_ACTUAL encontrado (recomendado: $PYTHON_VERSION)"
        fi
    else
        print_error "Python no encontrado. Instala Python $PYTHON_VERSION o superior"
        exit 1
    fi
    
    # Verificar Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION_ACTUAL=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$NODE_VERSION_ACTUAL" -ge "$NODE_VERSION" ]]; then
            print_message "Node.js v$NODE_VERSION_ACTUAL encontrado"
        else
            print_error "Node.js v$NODE_VERSION_ACTUAL encontrado (recomendado: v$NODE_VERSION o superior)"
            exit 1
        fi
    else
        print_error "Node.js no encontrado. Instala Node.js v$NODE_VERSION o superior"
        exit 1
    fi
    
    # Verificar Git
    if command -v git &> /dev/null; then
        print_message "Git encontrado"
    else
        print_error "Git no encontrado. Instala Git"
        exit 1
    fi
}

# Función para setup de Python
setup_python() {
    print_step "Configurando Python..."
    
    # Crear entorno virtual
    if [ ! -d "$VENV_NAME" ]; then
        print_message "Creando entorno virtual..."
        python3 -m venv $VENV_NAME
    else
        print_message "Entorno virtual ya existe"
    fi
    
    # Activar entorno virtual
    print_message "Activando entorno virtual..."
    source $VENV_NAME/bin/activate
    
    # Actualizar pip
    print_message "Actualizando pip..."
    pip install --upgrade pip
    
    # Instalar dependencias
    print_message "Instalando dependencias Python..."
    pip install -r requirements.txt
    
    print_message "Python configurado correctamente"
}

# Función para setup de Node.js
setup_node() {
    print_step "Configurando Node.js..."
    
    # Instalar dependencias
    print_message "Instalando dependencias Node.js..."
    npm install
    
    print_message "Node.js configurado correctamente"
}

# Función para setup de variables de entorno
setup_env() {
    print_step "Configurando variables de entorno..."
    
    if [ ! -f ".env.local" ]; then
        print_message "Creando .env.local..."
        cp .env.example .env.local 2>/dev/null || {
            print_warning "No se encontró .env.example, creando .env.local básico..."
            cat > .env.local << EOF
# Development Environment Variables
DATABASE_URL=postgresql://ai_pair_user:ai_pair_password@localhost:5432/ai_pair_dev
REDIS_URL=redis://localhost:6379

# API Keys (opcional para desarrollo básico)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Infisical (opcional)
INFISICAL_TOKEN=your_infisical_token_here

# Email (Resend)
RESEND_API_KEY=your_resend_key_here

# Payments (Stripe)
STRIPE_SECRET_KEY=your_stripe_key_here

# Development flags
USE_MOCKS=true
DISABLE_AI=false
EOF
        }
        print_message "Archivo .env.local creado"
        print_warning "Edita .env.local con tus API keys si las necesitas"
    else
        print_message "Archivo .env.local ya existe"
    fi
}

# Función para setup de Docker (opcional)
setup_docker() {
    print_step "Configurando Docker (opcional)..."
    
    if command -v docker &> /dev/null; then
        print_message "Docker encontrado"
        
        # Crear directorio para Traefik
        mkdir -p traefik
        
        # Crear configuración de Traefik si no existe
        if [ ! -f "traefik/traefik.yml" ]; then
            print_message "Creando configuración de Traefik..."
            cat > traefik/traefik.yml << EOF
# Traefik Configuration for Development
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: ai-pair-network

log:
  level: INFO

accessLog: {}
EOF
        fi
        
        print_message "Docker configurado correctamente"
        print_message "Para levantar servicios Docker: docker-compose -f docker-compose.dev.yml up -d"
    else
        print_warning "Docker no encontrado. Los servicios externos no estarán disponibles"
        print_message "Puedes desarrollar sin Docker usando mocks"
    fi
}

# Función para test de Agno
test_agno() {
    print_step "Probando instalación de Agno..."
    
    if [ -f "poc_agno_basic.py" ]; then
        print_message "Ejecutando POC de Agno..."
        python poc_agno_basic.py
    else
        print_warning "POC de Agno no encontrado"
    fi
}

# Función para mostrar información final
show_final_info() {
    print_step "Setup completado!"
    echo ""
    echo -e "${GREEN}🎉 ¡Tu entorno de desarrollo está listo!${NC}"
    echo ""
    echo -e "${BLUE}📋 Comandos útiles:${NC}"
    echo "  • Frontend: npm run dev"
    echo "  • Backend: uvicorn main:app --reload"
    echo "  • Test Agno: python poc_agno_basic.py"
    echo "  • Docker: docker-compose -f docker-compose.dev.yml up -d"
    echo ""
    echo -e "${BLUE}📚 Documentación:${NC}"
    echo "  • Developer Setup Guide: docs/DEVELOPER_SETUP_GUIDE.md"
    echo "  • Technical Stack: docs/TECHNICAL_STACK_AND_NAMING_CONVENTIONS.md"
    echo "  • Stack Update: docs/STACK_UPDATE_SUMMARY.md"
    echo ""
    echo -e "${YELLOW}⚠️  Recuerda:${NC}"
    echo "  • Editar .env.local con tus API keys si las necesitas"
    echo "  • Puedes desarrollar sin Docker usando mocks"
    echo "  • Solo necesitas Python, Node.js y Git para desarrollo básico"
    echo ""
}

# Función principal
main() {
    echo -e "${BLUE}🚀 Setup de Desarrollo Local - AI Pair Orchestrator${NC}"
    echo "=================================================="
    echo ""
    
    check_requirements
    setup_python
    setup_node
    setup_env
    setup_docker
    test_agno
    show_final_info
}

# Ejecutar función principal
main "$@" 